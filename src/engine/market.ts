import {
  AFTER,
  ANTI_ARBITRAGE_CAP,
  DAMAGED_FACTOR,
  DEMAND_REFILL_DIVISOR,
  KNOW_HOW_EXCESS_FACTOR,
  KNOW_HOW_SOFT_CAP,
  QUOTE_NOISE,
  SALE_COMMISSION,
  SATURATED_SALE_FACTOR,
  SHOP_MIN_PRODUCTS,
} from '../data/balance.ts'
import { DISTRICT_IDS, DISTRICTS } from '../data/districts.ts'
import { EVENT_MULT_CAP } from '../data/events.ts'
import { CANTINE, FORGERY } from '../data/locations.ts'
import { TAGS } from '../data/tags.ts'
import { CREW } from '../data/vehicles.ts'
import { PRODUCT_IDS, PRODUCTS, TIERS } from '../data/products.ts'
import { breakdown, type Breakdown, type BreakdownBuilder, type RuleSource } from './breakdown.ts'
import { takeLots } from './cargo.ts'
import { atCantine, crewEffect } from './crew.ts'
import { freshnessFactor, freshnessOf } from './condition.ts'
import { recordOf } from './records.ts'
import { atAfter } from './night.ts'
import { influenceFactor } from './services.ts'
import { drawAppearances, eventMultipliers, forgedCard, hasVice, stockFactor, type EventContext } from './events.ts'
import type { Rng } from './rng.ts'
import type { CargoLot, DistrictId, DistrictMarket, FreshnessStage, GameState, MarketMemory, ProductId } from './types.ts'

/*
 * Marché noir (chap. 2) : boutique et cours tirés à 06h00, quotas de demande, prix de vente.
 */

export type ProductStatus = 'production' | 'neutral' | 'strong'

/** Statut public d'un produit dans un district ; les vices de la Loterie y ajoutent une Forte demande (chap. 6) */
export function productStatus(ctx: EventContext, districtId: DistrictId, productId: ProductId): ProductStatus {
  const district = DISTRICTS[districtId]
  if (district.production.includes(productId)) return 'production'
  if (district.strongDemand.includes(productId) || hasVice(ctx, districtId, productId)) return 'strong'
  return 'neutral'
}

/** Quota de demande d'un produit dans un district ; null = illimité */
export function demandQuota(ctx: MarketContext, districtId: DistrictId, productId: ProductId): number | null {
  const quota = TIERS[PRODUCTS[productId].tier].demandQuota
  if (!quota) return null
  const base = productStatus(ctx, districtId, productId) === 'strong' ? quota.strong : quota.neutral
  // Carte « contrebandier concurrent » d'un faux dossier : clientèle orpheline dans ce district
  const competitor = forgedCard(ctx, districtId) === 'competitor' ? FORGERY.competitorQuota : 1
  return Math.ceil(base * gourmetQuotaFactor(ctx, productId) * competitor)
}

/** Ce que lisent les tirages du marché : les événements, et l'équipier pour les quotas */
export type MarketContext = EventContext & Partial<Pick<GameState, 'crew'>>

/** Quotas des produits Gourmet majorés par Mama Rosa, si elle travaille aujourd'hui */
function gourmetQuotaFactor(ctx: MarketContext, productId: ProductId): number {
  const crew = ctx.crew
  const factor = crew?.active && crew.paidDay === ctx.day ? CREW[crew.active].gourmetQuota : undefined
  return factor && isGourmet(productId) ? factor : 1
}

/** Vraie nourriture, que sublime Mama Rosa (chap. 4) */
export function isGourmet(productId: ProductId): boolean {
  return PRODUCTS[productId].tags.some((tag) => TAGS[tag].gourmet)
}

/** Demande reconstituée chaque matin ; plus vite pour une clientèle captive (Addictif) */
export function demandRefill(quota: number, productId: ProductId): number {
  const captive = Math.max(1, ...PRODUCTS[productId].tags.map((tag) => TAGS[tag].demandRefill ?? 1))
  return Math.ceil((quota / DEMAND_REFILL_DIVISOR) * captive)
}

// ─── Tirage de 06h00 ───

function drawShop(ctx: EventContext, districtId: DistrictId, rng: Rng): Partial<Record<ProductId, number>> {
  const district = DISTRICTS[districtId]
  // Socle officiel : tout le Tier 0, partout
  const shop = new Set<ProductId>(PRODUCT_IDS.filter((id) => PRODUCTS[id].tier === 0 && !PRODUCTS[id].sealed))

  const draw = district.productionDraw
  const production = draw ? rng.shuffle(district.production).slice(0, rng.int(draw.min, draw.max)) : district.production
  for (const id of production) {
    const chance = PRODUCTS[id].appearanceChance
    if (chance === undefined || rng.chance(chance)) shop.add(id)
  }

  // Complément neutre de Tier 1 à 3 ; jamais un produit de la Forte demande
  const neutrals = rng.shuffle(
    PRODUCT_IDS.filter((id) => {
      const tier = PRODUCTS[id].tier
      return tier >= 1 && tier <= 3 && !shop.has(id) && productStatus(ctx, districtId, id) === 'neutral'
    }),
  )
  while (shop.size < SHOP_MIN_PRODUCTS && neutrals.length > 0) shop.add(neutrals.pop()!)

  // Apparitions à l'achat des événements : dérogation à l'exclusion (chap. 6)
  for (const id of drawAppearances(ctx, districtId, rng)) shop.add(id)

  const stock: Partial<Record<ProductId, number>> = {}
  for (const id of shop) {
    const product = PRODUCTS[id]
    const range = product.dailyStock ?? TIERS[product.tier].dailyStock
    // Facteur de stock des événements : arrondi au supérieur, au moins 1
    stock[id] = Math.max(1, Math.ceil(rng.int(range.min, range.max) * stockFactor(ctx, districtId, id)))
  }
  return stock
}

/** Produits de la boutique du jour, dans l'ordre du catalogue */
export function shopProducts(market: DistrictMarket): ProductId[] {
  return PRODUCT_IDS.filter((id) => market.stock[id] !== undefined)
}

/**
 * Marché du jour d'un district. Sans marché de la veille (Jour 1), la demande est pleine et l'écart de tendance
 * tiré entre ses bornes ; ensuite, l'écart garde une part de celui de la veille, plus un choc (chap. 2).
 */
export function drawMarket(ctx: MarketContext, districtId: DistrictId, rng: Rng, previous?: DistrictMarket): DistrictMarket {
  const { persistence, shock, max } = QUOTE_NOISE
  const noise = recordOf(PRODUCT_IDS, (id) => {
    const before = previous?.noise[id]
    const gap = before === undefined ? rng.float(-max, max) : (before - 1) * persistence + rng.float(-shock, shock)
    return 1 + Math.min(max, Math.max(-max, gap))
  })
  const demand: Partial<Record<ProductId, number>> = {}
  for (const id of PRODUCT_IDS) {
    const quota = demandQuota(ctx, districtId, id)
    if (quota !== null) {
      const left = previous?.demand[id]
      demand[id] = left === undefined ? quota : Math.min(quota, left + demandRefill(quota, id))
    }
  }
  return { noise, stock: drawShop(ctx, districtId, rng), demand }
}

export function drawMarkets(ctx: MarketContext, rng: Rng, previous?: Record<DistrictId, DistrictMarket>): Record<DistrictId, DistrictMarket> {
  return recordOf(DISTRICT_IDS, (id) => drawMarket(ctx, id, rng, previous?.[id]))
}

// ─── Cours et prix ───

/** Cours du jour = Arrondi( Prix_Base × Coef_District × Bruit × Mult_Événement ) */
export function quoteBreakdown(state: GameState, districtId: DistrictId, productId: ProductId): Breakdown {
  const quote = districtQuote(state, districtId, productId)
  quote.mul('rule.noise', state.markets[districtId].noise[productId])
  // Mult_Événement : événements, contrecoups et influence de Karma-Cham se multiplient, le tout plafonné (chap. 2 et 6)
  let total = 1
  for (const { source, factor } of eventMultipliers(state, districtId, productId)) {
    quote.mul(source, factor)
    total *= factor
  }
  const influence = influenceFactor(state, productId)
  if (influence !== 1) {
    quote.mul('LOC-D2-1', influence)
    total *= influence
  }
  if (total > EVENT_MULT_CAP) quote.mul('rule.event-cap', EVENT_MULT_CAP / total)
  return quote.round().build()
}

/** Prix de base × Coef_District : le cours normal, sans tendance ni événement */
function districtQuote(ctx: EventContext, districtId: DistrictId, productId: ProductId): BreakdownBuilder {
  const product = PRODUCTS[productId]
  const district = DISTRICTS[districtId]
  const quote = breakdown(productId, product.basePrice)
  const status = productStatus(ctx, districtId, productId)
  if (status === 'production') quote.mul('rule.production', district.coefProduction)
  if (status === 'strong') {
    const coef = breakdown('rule.strong-demand', district.coefStrongDemand)
      .add('rule.tier-bonus', TIERS[product.tier].strongDemandBonus, { tier: product.tier })
      .build()
    quote.mul('rule.strong-demand', coef)
  }
  return quote
}

/** Cours normal d'un produit dans un district (repère de l'historique, chap. 7) */
export function normalQuote(ctx: EventContext, districtId: DistrictId, productId: ProductId): number {
  return districtQuote(ctx, districtId, productId).round().build().total
}

export function quote(state: GameState, districtId: DistrictId, productId: ProductId): number {
  return quoteBreakdown(state, districtId, productId).total
}

/** Dernier relevé des cours d'un district, ou undefined s'il n'a jamais été visité */
export function lastSeen(state: GameState, districtId: DistrictId): MarketMemory | undefined {
  return state.memory[districtId]?.at(-1)
}

/** Meilleur cours vu ailleurs qu'ici pour un produit, avec son district et son ancienneté en jours (chap. 2) */
export function bestRemembered(state: GameState, productId: ProductId): { districtId: DistrictId; quote: number; age: number } | null {
  return DISTRICT_IDS.reduce<{ districtId: DistrictId; quote: number; age: number } | null>((best, districtId) => {
    const seen = lastSeen(state, districtId)
    const quote = seen?.quotes[productId]
    if (districtId === state.districtId || !seen || quote === undefined || (best && best.quote >= quote)) return best
    return { districtId, quote, age: state.day - seen.day }
  }, null)
}

/** Cours observés dans un district, pour la mémoire de marché */
export function observeMarket(state: GameState, districtId: DistrictId): MarketMemory {
  return { day: state.day, quotes: recordOf(PRODUCT_IDS, (id) => quote(state, districtId, id)) }
}

/** Savoir_Faire = produit des bonus de vente, avec rendements décroissants et clause anti-arbitrage (vente dans `districtId`) */
export function knowHowBreakdown(state: GameState, lot: CargoLot, districtId: DistrictId = state.districtId): Breakdown {
  const knowHow = breakdown('rule.know-how', 1)

  // Coef_Fraîcheur des périssables (chap. 2)
  const freshness = freshnessOf(state, lot)
  // Affinage de Mama Rosa : une caisse Gourmet Standard se vend au coefficient Extra-Frais
  const gourmet = isGourmet(lot.productId)
  if (freshness === 'standard' && gourmet && crewEffect(state, 'refining')) knowHow.mul('rule.refining', freshnessFactor('extra'))
  else if (freshness) knowHow.mul(FRESHNESS_RULES[freshness], freshnessFactor(freshness))
  const gourmetKnowHow = crewEffect(state, 'gourmetKnowHow')
  if (gourmet && gourmetKnowHow) knowHow.mul('CREW-03', gourmetKnowHow)

  // Couvre-feu (chap. 2) : tags de vente de nuit ; à l'after, la fête paie le festif bien plus cher (chap. 1)
  if (state.phase === 'night') {
    for (const tag of PRODUCTS[lot.productId].tags) {
      const nightSale = TAGS[tag].nightSale
      if (tag === AFTER.tag && atAfter(state, districtId)) knowHow.mul('rule.after', AFTER.festiveFactor)
      else if (nightSale) knowHow.mul(tag, nightSale)
    }
  }

  if (knowHow.total > KNOW_HOW_SOFT_CAP) knowHow.set('rule.diminishing-returns', diminished(knowHow.total))
  if (!lot.travelled) knowHow.clamp(0, ANTI_ARBITRAGE_CAP, 'rule.anti-arbitrage')
  return knowHow.build()
}

/** Rendements décroissants du savoir-faire : au-delà du seuil, l'excédent compte moins */
function diminished(total: number): number {
  return total > KNOW_HOW_SOFT_CAP ? KNOW_HOW_SOFT_CAP + (total - KNOW_HOW_SOFT_CAP) * KNOW_HOW_EXCESS_FACTOR : total
}

/**
 * Bonus de vente d'une caisse vendue cette nuit dans `districtId` (chap. 2) : tags de vente de nuit, ou prime festive si
 * l'after de ce soir y est, avec les rendements décroissants. Connu dès le matin, il sert à estimer une tournée de nuit
 */
export function tonightSaleFactor(state: GameState, districtId: DistrictId, productId: ProductId): number {
  const factor = PRODUCTS[productId].tags.reduce((total, tag) => {
    if (tag === AFTER.tag && state.after === districtId) return total * AFTER.festiveFactor
    return total * (TAGS[tag].nightSale ?? 1)
  }, 1)
  return diminished(factor)
}

const FRESHNESS_RULES = {
  extra: 'rule.freshness-extra',
  standard: 'rule.freshness-standard',
  gamey: 'rule.freshness-gamey',
  spoiled: 'rule.freshness-spoiled',
} as const satisfies Record<FreshnessStage, RuleSource>

/** Prix de vente d'une caisse = Arrondi( Cours × Commission × Coef_Demande × Savoir_Faire ) */
export function unitSaleBreakdown(state: GameState, lot: CargoLot, saturated: boolean): Breakdown {
  const knowHow = knowHowBreakdown(state, lot)
  return (
    breakdown('rule.quote', quoteBreakdown(state, state.districtId, lot.productId))
      .mul('rule.commission', SALE_COMMISSION)
      .mul('rule.saturation', saturated ? SATURATED_SALE_FACTOR : 1)
      // Coef_Condition : caisse endommagée (casse des fragiles, chap. 2)
      .mul('rule.damaged', lot.damaged ? DAMAGED_FACTOR : 1)
      .mul('rule.know-how', knowHow.total === 1 ? 1 : knowHow)
      .round()
      .build()
  )
}

export type SaleQuote = {
  total: number
  /** Prix d'achat cumulé des caisses vendues (lots les plus anciens d'abord) */
  cost: number
  /** Caisses vendues au-delà de la demande restante */
  saturatedQty: number
  /** Détail du prix de la première caisse vendue */
  first: Breakdown | null
}

/** Produit d'une vente de `qty` caisses : lots les plus anciens d'abord, demande restante d'abord */
export function saleQuote(state: GameState, productId: ProductId, qty: number): SaleQuote {
  const { taken } = takeLots(state.cargo, productId, qty)
  const demandLeft = state.markets[state.districtId].demand[productId] ?? Infinity

  let total = 0
  let cost = 0
  let sold = 0
  let first: Breakdown | null = null
  for (const lot of taken) {
    for (let i = 0; i < lot.qty; i++) {
      const unit = unitSaleBreakdown(state, lot, sold >= demandLeft)
      first ??= unit
      total += unit.total
      cost += lot.unitCost
      sold++
    }
  }
  return { total, cost, saturatedQty: Math.max(0, sold - demandLeft), first }
}

/**
 * Estimation du produit net d'une caisse à partir d'un cours mémorisé : commission, et bonus de vente de nuit pour une
 * tournée de nuit (`tonightSaleFactor`) ; ni fraîcheur, ni saturation
 */
export function estimatedUnitSale(quote: number, nightFactor = 1): number {
  return Math.round(quote * SALE_COMMISSION * nightFactor)
}

/** Prix d'une ration de Synthanol dans le district actuel */
export function fuelPriceBreakdown(state: GameState): Breakdown {
  // Cantine des Chauffeurs : tarif syndical en D1, de jour
  if (atCantine(state)) return breakdown('LOC-D1-2', CANTINE.fuelPrice).build()
  return breakdown(state.districtId, DISTRICTS[state.districtId].fuelPrice).build()
}

/** Sens d'une tendance publique (chap. 2) */
export type TrendDirection = 'up' | 'down' | 'flat'

/** En dessous de cet écart relatif d'un jour à l'autre, le Fil annonce un cours stable */
export const TREND_FLAT = 0.01

/**
 * Tendance publique d'un produit dans un district (chap. 2) : le sens de son dernier mouvement publié par le Fil (de
 * l'avant-veille à la veille) et depuis combien de jours il dure ; null sans deux relevés publiés
 */
export function publicTrend(state: GameState, districtId: DistrictId, productId: ProductId): { direction: TrendDirection; days: number } | null {
  const published = (state.bulletin[districtId] ?? []).filter((entry) => entry.day < state.day)
  const directionAt = (index: number): TrendDirection => {
    const change = published[index].quotes[productId] / published[index - 1].quotes[productId] - 1
    return change > TREND_FLAT ? 'up' : change < -TREND_FLAT ? 'down' : 'flat'
  }
  const last = published.length - 1
  if (last < 1) return null
  const direction = directionAt(last)
  let days = 1
  while (last - days >= 1 && directionAt(last - days) === direction) days++
  return { direction, days }
}

/** Bulletin publié d'un produit dans un district : les cours des jours passés, pour la forme de la courbe (chap. 7) */
export function publishedQuotes(state: GameState, districtId: DistrictId, productId: ProductId): { day: number; quote: number }[] {
  return (state.bulletin[districtId] ?? [])
    .filter((entry) => entry.day < state.day)
    .map((entry) => ({ day: entry.day, quote: entry.quotes[productId] }))
}
