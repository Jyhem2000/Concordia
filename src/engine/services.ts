import { DAMAGED_FACTOR, GAME_LENGTH_DAYS, HEALTH_MAX, ICC_MAX, SALE_COMMISSION } from '../data/balance.ts'
import { LOTTERY } from '../data/events.ts'
import { CASSANDRE, FORGERY, KARMA, LOCATIONS, MORGUE, SERVICE_REQUIREMENTS, VELVET } from '../data/locations.ts'
import { PRODUCT_IDS, PRODUCTS } from '../data/products.ts'
import type { ActionError } from './actions.ts'
import { giveCrates, ownedQty, takeLots } from './cargo.ts'
import { crateValue, freshnessFactor, freshnessOf, paymentValue } from './condition.ts'
import { crewEffect } from './crew.ts'
import { GLOBAL_EVENT_IDS, viceChoices } from './events.ts'
import { checkRequirements, raiseWanted } from './progress.ts'
import { quote } from './market.ts'
import { createRng } from './rng.ts'
import type { CargoLot, CrateCount, DistrictId, ForgeryCard, GameState, ProductId, ServiceKey, TagId } from './types.ts'

/*
 * Lieux spéciaux (chap. 4) : Karma-Cham, Morgue, Cassandre-88, faux dossier de la Laverie, Velvet-Silo.
 * Chaque service vérifie ses conditions (`check*`) puis produit un nouvel état.
 */

export type ServiceResult = { ok: true; state: GameState } | { ok: false; error: ActionError }

const fail = (error: ActionError): ServiceResult => ({ ok: false, error })

/** Utilisations passées d'un service : base des coûts croissants */
export const usesOf = (state: GameState, key: ServiceKey) => state.services.uses[key] ?? 0

/** Coût d'un service : base, plus une hausse par utilisation précédente */
export function serviceCost(state: GameState, key: ServiceKey, base: number, step = 0): number {
  return base + step * usesOf(state, key)
}

/** Premier jour où un service redevient disponible, ou null s'il l'est déjà */
export function availableFrom(state: GameState, key: ServiceKey, cooldownDays: number): number | null {
  const last = state.services.lastDay[key]
  return last !== undefined && state.day < last + cooldownDays ? last + cooldownDays : null
}

/** Compte un usage : coût croissant et départ du cooldown */
function used(state: GameState, key: ServiceKey): GameState {
  return {
    ...state,
    services: { uses: { ...state.services.uses, [key]: usesOf(state, key) + 1 }, lastDay: { ...state.services.lastDay, [key]: state.day } },
  }
}

const gainIcc = (state: GameState, points: number): GameState => ({ ...state, icc: Math.min(ICC_MAX, state.icc + points) })

// ─── Karma-Cham : bonus d'influence (chap. 4 et 7) ───

export function karmaCost(state: GameState): number {
  return serviceCost(state, 'influence', KARMA.cost, KARMA.costStep)
}

export function checkInfluence(state: GameState, tag: TagId): ActionError | null {
  if (!KARMA.tags.includes(tag)) return 'not-eligible'
  if (checkRequirements(state, SERVICE_REQUIREMENTS.influence)) return 'locked'
  if (availableFrom(state, 'influence', KARMA.cooldownDays) !== null) return 'cooldown'
  return karmaCost(state) > state.cash ? 'not-enough-cash' : null
}

export function orderInfluence(state: GameState, tag: TagId): ServiceResult {
  const error = checkInfluence(state, tag)
  if (error) return fail(error)
  return { ok: true, state: used({ ...state, cash: state.cash - karmaCost(state), influence: { tag, day: state.day + 1 } }, 'influence') }
}

/** Bonus d'influence d'un produit aujourd'hui (1 sans panique en cours) */
export function influenceFactor(state: GameState, productId: ProductId): number {
  const influence = state.influence
  return influence && influence.day === state.day && PRODUCTS[productId].tags.includes(influence.tag) ? KARMA.factor : 1
}

// ─── Morgue du Dr. K. ───

export type MorgueService = 'pass' | 'surgery' | 'certificate'

export function morgueCost(state: GameState, service: MorgueService): number {
  switch (service) {
    case 'pass':
      return serviceCost(state, 'pass', MORGUE.pass.cost)
    case 'surgery':
      return serviceCost(state, 'surgery', MORGUE.surgery.cost) + Math.round(state.cash * MORGUE.surgery.cashShare)
    case 'certificate':
      return serviceCost(state, 'certificate', MORGUE.certificate.cost, MORGUE.certificate.costStep)
  }
}

/** Laissez-passer en cours de validité */
export function passActive(state: GameState): boolean {
  return state.morguePass !== null && state.day <= state.morguePass
}

export function checkMorgue(state: GameState, service: MorgueService): ActionError | null {
  if (checkRequirements(state, SERVICE_REQUIREMENTS[service])) return 'locked'
  if (service === 'pass' && passActive(state)) return 'cooldown'
  if (service === 'surgery') {
    if (availableFrom(state, 'surgery', MORGUE.surgery.cooldownDays) !== null) return 'cooldown'
    if (state.health >= MORGUE.surgery.healthCap) return 'already-healthy'
  }
  if (service === 'certificate' && availableFrom(state, 'certificate', MORGUE.certificate.cooldownDays) !== null) return 'cooldown'
  return morgueCost(state, service) > state.cash ? 'not-enough-cash' : null
}

export function visitMorgue(state: GameState, service: MorgueService): ServiceResult {
  const error = checkMorgue(state, service)
  if (error) return fail(error)
  const paid = { ...state, cash: state.cash - morgueCost(state, service) }
  switch (service) {
    case 'pass':
      return { ok: true, state: used({ ...paid, morguePass: state.day + MORGUE.pass.days - 1 }, 'pass') }
    case 'surgery': {
      const health = Math.min(MORGUE.surgery.healthCap, HEALTH_MAX, state.health + MORGUE.surgery.health)
      return { ok: true, state: used({ ...paid, health }, 'surgery') }
    }
    case 'certificate':
      // Hors plafond de gains de route : c'est un service, pas un gain de route (chap. 2)
      return { ok: true, state: used(gainIcc(paid, MORGUE.certificate.icc), 'certificate') }
  }
}

// ─── Cassandre-88 : prédiction (chap. 4 et 8) ───

export function prophecyCost(state: GameState): number {
  return serviceCost(state, 'prophecy', CASSANDRE.cost, CASSANDRE.costStep)
}

export function checkProphecy(state: GameState): ActionError | null {
  if (checkRequirements(state, SERVICE_REQUIREMENTS.prophecy)) return 'locked'
  const prophecy = state.events.prophecy
  if (prophecy && prophecy.day >= state.day) return 'prophecy-active'
  if (state.day + CASSANDRE.aheadDays > GAME_LENGTH_DAYS) return 'too-late'
  if (ownedQty(state.cargo, CASSANDRE.crate) < 1) return 'not-enough-cargo'
  return prophecyCost(state) > state.cash ? 'not-enough-cash' : null
}

/** Révèle et garantit l'événement global de J+2, tiré au hasard parmi les événements globaux */
export function consultCassandre(state: GameState): ServiceResult {
  const error = checkProphecy(state)
  if (error) return fail(error)
  const rng = createRng(state.rng)
  const prophecy = { day: state.day + CASSANDRE.aheadDays, event: rng.pick(GLOBAL_EVENT_IDS) }
  const paid = { ...state, cash: state.cash - prophecyCost(state), cargo: giveCrates(state.cargo, [{ productId: CASSANDRE.crate, qty: 1 }]) }
  return { ok: true, state: used({ ...paid, rng: rng.state, events: { ...state.events, prophecy } }, 'prophecy') }
}

// ─── Laverie : faux dossier de Loterie (chap. 4 et 8) ───

export function forgeryCost(state: GameState): number {
  return serviceCost(state, 'forgery', FORGERY.cost, FORGERY.costStep)
}

/** Chance de faire passer le faux dossier : fixe, plus le bonus de Glitch */
export function forgeryChance(state: GameState): number {
  return Math.min(1, FORGERY.chance + (crewEffect(state, 'forgeryBonus') ?? 0))
}

export function checkForgery(state: GameState, card: ForgeryCard): ActionError | null {
  if (checkRequirements(state, SERVICE_REQUIREMENTS.forgery)) return 'locked'
  if (!LOTTERY.days.includes(state.day + 1)) return 'not-eligible'
  if (state.events.forgery?.day === state.day + 1 || state.services.lastDay.forgery === state.day) return 'already-used'
  if ((card.kind === 'captain' || card.kind === 'competitor') && !LOTTERY.promotedFrom.includes(card.district)) return 'not-eligible'
  if (card.kind === 'cadre' && !viceChoices(card.district).includes(card.vice)) return 'not-eligible'
  return forgeryCost(state) > state.cash ? 'not-enough-cash' : null
}

/** Faux dossier, résolu sur-le-champ : accepté pour le tirage du lendemain, ou détecté (ICC, Fiche S) */
export function forge(state: GameState, card: ForgeryCard): ServiceResult {
  const error = checkForgery(state, card)
  if (error) return fail(error)
  const rng = createRng(state.rng)
  const paid = used({ ...state, cash: state.cash - forgeryCost(state), rng: rng.state }, 'forgery')
  if (rng.chance(forgeryChance(state))) {
    return { ok: true, state: { ...paid, rng: rng.state, events: { ...paid.events, forgery: { day: state.day + 1, card } } } }
  }
  return {
    ok: true,
    state: {
      ...raiseWanted(paid),
      rng: rng.state,
      icc: Math.max(0, paid.icc - FORGERY.failIccLoss),
    },
  }
}

// ─── Velvet-Silo (chap. 4) ───

export function velvetLocked(state: GameState): boolean {
  return state.velvetLock !== null && state.day <= state.velvetLock
}

/** Prix hors quota d'une caisse : multiple du cours local, commission et état de la caisse compris (sans savoir-faire) */
export function silverPrice(state: GameState, lot: CargoLot, factor: number): number {
  const condition = (lot.damaged ? DAMAGED_FACTOR : 1) * freshnessFactor(freshnessOf(state, lot))
  return Math.round(quote(state, state.districtId, lot.productId) * factor * SALE_COMMISSION * condition)
}

const oldestLot = (state: GameState, productId: ProductId) => takeLots(state.cargo, productId, 1).taken[0]

export function checkAuction(state: GameState, productId: ProductId): ActionError | null {
  if (velvetLocked(state)) return 'location-locked'
  if (checkRequirements(state, SERVICE_REQUIREMENTS.auction)) return 'locked'
  if (PRODUCTS[productId].tier < VELVET.auction.minTier) return 'not-eligible'
  if (ownedQty(state.cargo, productId) < 1) return 'not-enough-cargo'
  return availableFrom(state, 'auction', VELVET.auction.cooldownDays) !== null ? 'cooldown' : null
}

export function auctionPrice(state: GameState, productId: ProductId): number | null {
  const lot = oldestLot(state, productId)
  return lot ? silverPrice(state, lot, VELVET.auction.factor) : null
}

/** Vente aux enchères masquée : une caisse, hors quota, lot le plus ancien */
export function auction(state: GameState, productId: ProductId): ServiceResult {
  const error = checkAuction(state, productId)
  if (error) return fail(error)
  const price = auctionPrice(state, productId) ?? 0
  return { ok: true, state: used({ ...state, cash: state.cash + price, cargo: takeLots(state.cargo, productId, 1).remaining }, 'auction') }
}

export function blackmailCost(state: GameState): number {
  return serviceCost(state, 'blackmail', VELVET.blackmail.cost, VELVET.blackmail.costStep)
}

/** Caisses données pour le chantage : produits acceptés dans l'ordre, lots les plus anciens d'abord, jusqu'à couvrir le montant */
export function blackmailCrates(state: GameState): CrateCount[] | null {
  const due = blackmailCost(state)
  let covered = 0
  const crates: CrateCount[] = []
  for (const productId of VELVET.blackmail.crates) {
    for (const lot of state.cargo.filter((entry) => entry.productId === productId)) {
      let qty = 0
      while (qty < lot.qty && covered < due) {
        covered += crateValue(state, lot)
        qty++
      }
      if (qty > 0) crates.push({ productId, qty })
    }
  }
  const merged = PRODUCT_IDS.flatMap((id) => {
    const qty = crates.filter((crate) => crate.productId === id).reduce((total, crate) => total + crate.qty, 0)
    return qty > 0 ? [{ productId: id, qty }] : []
  })
  return paymentValue(state, merged) >= due ? merged : null
}

export function checkBlackmail(state: GameState, inKind: boolean): ActionError | null {
  if (velvetLocked(state)) return 'location-locked'
  if (checkRequirements(state, SERVICE_REQUIREMENTS.blackmail)) return 'locked'
  if (availableFrom(state, 'blackmail', VELVET.blackmail.cooldownDays) !== null) return 'cooldown'
  if (inKind) return blackmailCrates(state) ? null : 'not-enough-cargo'
  return blackmailCost(state) > state.cash ? 'not-enough-cash' : null
}

/** Chantage sur l'oreiller : ICC gagné hors plafond, payé en ₡ ou en caisses */
export function blackmail(state: GameState, inKind: boolean): ServiceResult {
  const error = checkBlackmail(state, inKind)
  if (error) return fail(error)
  const paid = inKind
    ? { ...state, cargo: giveCrates(state.cargo, blackmailCrates(state) ?? []) }
    : { ...state, cash: state.cash - blackmailCost(state) }
  return { ok: true, state: used(gainIcc(paid, VELVET.blackmail.icc), 'blackmail') }
}

export function checkVipRequest(state: GameState): ActionError | null {
  if (velvetLocked(state)) return 'location-locked'
  if (checkRequirements(state, SERVICE_REQUIREMENTS.vip)) return 'locked'
  if (state.vip) return 'contract-active'
  return availableFrom(state, 'vip', VELVET.vip.cooldownDays) !== null ? 'cooldown' : null
}

/** Commande VIP : un produit de Tier 2 ou 3 absent de la soute, tiré au hasard */
export function requestVip(state: GameState): ServiceResult {
  const error = checkVipRequest(state)
  if (error) return fail(error)
  const rng = createRng(state.rng)
  const choices = PRODUCT_IDS.filter((id) => VELVET.vip.tiers.includes(PRODUCTS[id].tier) && ownedQty(state.cargo, id) === 0)
  if (choices.length === 0) return fail('not-eligible')
  return { ok: true, state: { ...state, rng: rng.state, vip: { productId: rng.pick(choices), day: state.day } } }
}

export function checkVipDelivery(state: GameState): ActionError | null {
  if (velvetLocked(state)) return 'location-locked'
  if (!state.vip) return 'no-contract'
  if (state.day > state.vip.day + VELVET.vip.deadlineDays) return 'too-late'
  return ownedQty(state.cargo, state.vip.productId) < VELVET.vip.crates ? 'not-enough-cargo' : null
}

/** Livraison : les caisses les plus anciennes, rachetées à un multiple du cours local, hors quota */
export function deliverVip(state: GameState): ServiceResult {
  const error = checkVipDelivery(state)
  if (error || !state.vip) return fail(error ?? 'no-contract')
  const { taken, remaining } = takeLots(state.cargo, state.vip.productId, VELVET.vip.crates)
  const total = taken.reduce((sum, lot) => sum + silverPrice(state, lot, VELVET.vip.factor) * lot.qty, 0)
  // Parrainage de l'Élite : chaque commande livrée compte
  const progress = { ...state.progress, vipOrders: state.progress.vipOrders + 1 }
  return { ok: true, state: used({ ...state, cash: state.cash + total, cargo: remaining, vip: null, progress }, 'vip') }
}

/** District du Velvet-Silo (commandes VIP) */
export const velvetDistrict = (): DistrictId => LOCATIONS['LOC-D6-1'].district

/**
 * Protection du parrain (chap. 4) : dans le district du Silo, les caisses d'une commande VIP en cours
 * (au plus le nombre commandé) sont hors de vue des agents : ni risque, ni fouille
 */
export function sponsorCover(state: GameState, districtId: DistrictId): { covered: CargoLot[]; rest: CargoLot[] } {
  const { vip } = state
  if (!vip || districtId !== velvetDistrict() || state.day > vip.day + VELVET.vip.deadlineDays) return { covered: [], rest: [...state.cargo] }
  const { taken, remaining } = takeLots(state.cargo, vip.productId, VELVET.vip.crates)
  return { covered: taken, rest: remaining }
}

/** Barrage dans le district du Silo : les caisses couvertes par le parrain sont mises de côté jusqu'à la fin du contrôle */
export function shieldSponsored(state: GameState): GameState {
  if (!state.interception) return state
  const { covered, rest } = sponsorCover(state, state.districtId)
  return covered.length === 0 ? state : { ...state, cargo: rest, interception: { ...state.interception, covered } }
}

/** Échéance de la commande VIP dépassée à la routine : ICC perdu, Silo verrouillé (chap. 4) */
export function expireVip(state: GameState): { state: GameState; failed: boolean } {
  if (!state.vip || state.day <= state.vip.day + VELVET.vip.deadlineDays) return { state, failed: false }
  const locked = state.day + VELVET.vip.lockDays - 1
  return {
    // Le parrain n'aime pas attendre : une commande manquée en efface une
    state: used(
      {
        ...state,
        vip: null,
        icc: Math.max(0, state.icc - VELVET.vip.failIccLoss),
        velvetLock: locked,
        progress: { ...state.progress, vipOrders: Math.max(0, state.progress.vipOrders - 1) },
      },
      'vip',
    ),
    failed: true,
  }
}

/** Valeur de livraison annoncée d'une commande VIP (caisses en soute, au cours du jour) */
export function vipValue(state: GameState): number | null {
  if (!state.vip) return null
  const { taken } = takeLots(state.cargo, state.vip.productId, VELVET.vip.crates)
  if (taken.length === 0) return null
  return taken.reduce((sum, lot) => sum + silverPrice(state, lot, VELVET.vip.factor) * lot.qty, 0)
}
