import { DISTRICT_IDS, DISTRICTS } from '../data/districts.ts'
import { AFTERSHOCK, EVENT_CHANCES, EVENT_COOLDOWNS, GLOBAL_EVENTS, LOCAL_EVENTS, LOTTERY, ROAD_EVENTS, RUMOR } from '../data/events.ts'
import { PRODUCTS } from '../data/products.ts'
import type { BreakdownSource } from './breakdown.ts'
import { keysOf } from './records.ts'
import type { Rng } from './rng.ts'
import { deliverDay } from './delivery.ts'
import { deliverMission, injectServer, isOnMission } from './night.ts'
import { loseHalfDay } from './time.ts'
import type {
  DistrictId,
  EventEffect,
  EventsState,
  ForgeryCard,
  GameState,
  GlobalEventId,
  LocalEventId,
  Lottery,
  ProductId,
  ProductSelector,
  RoadEventId,
  TagId,
} from './types.ts'

/*
 * Événements (chap. 6) : tirages de 06h00, effets en vigueur dans un district, contrecoups, Loterie.
 */

/** Ce que les règles d'événements lisent de la partie */
export type EventContext = Pick<GameState, 'day' | 'phase' | 'events'>

export type ActiveEffect = { source: GlobalEventId | LocalEventId; local: boolean; effect: EventEffect }

export const GLOBAL_EVENT_IDS = keysOf(GLOBAL_EVENTS)
const LOCAL_EVENT_IDS = keysOf(LOCAL_EVENTS)
const ROAD_EVENT_IDS = keysOf(ROAD_EVENTS)

export const NO_EVENTS: EventsState = {
  global: null,
  local: {},
  yesterday: { global: null, local: {} },
  localDays: {},
  tomorrow: null,
  rumor: null,
  lottery: null,
  roadDays: {},
  prophecy: null,
  forgery: null,
  lasting: null,
}

/** Événements locaux propres à un district */
export function localEventsOf(districtId: DistrictId): LocalEventId[] {
  return LOCAL_EVENT_IDS.filter((id) => id.startsWith(`EVT-${districtId}-`))
}

/** Tous les effets d'un événement global ou local */
export function eventEffects(event: GlobalEventId | LocalEventId): readonly EventEffect[] {
  return isGlobal(event) ? GLOBAL_EVENTS[event].effects : LOCAL_EVENTS[event].effects
}

/** Effets d'un événement qui portent sur un district (les effets globaux peuvent viser certains districts) */
function effectsIn(event: GlobalEventId | LocalEventId, districtId: DistrictId): EventEffect[] {
  return eventEffects(event).filter((effect) => !effect.districts || effect.districts.includes(districtId))
}

function isGlobal(event: GlobalEventId | LocalEventId): event is GlobalEventId {
  return event.startsWith('EVT-G')
}

/** Événements globaux en vigueur aujourd'hui : celui du jour, et celui qui dure (canicule) s'il est différent */
export function globalsInForce(ctx: EventContext): GlobalEventId[] {
  const { global, lasting } = ctx.events
  const lasts = lasting && lasting.until >= ctx.day && lasting.event !== global ? [lasting.event] : []
  return [...(global ? [global] : []), ...lasts]
}

/** Effets en vigueur aujourd'hui dans un district : événements globaux, puis événement local */
export function activeEffects(ctx: EventContext, districtId: DistrictId): ActiveEffect[] {
  const here = ctx.events.local[districtId]
  return [
    ...globalsInForce(ctx).flatMap((event) => effectsIn(event, districtId).map((effect) => ({ source: event, local: false, effect }))),
    ...(here ? effectsIn(here, districtId).map((effect) => ({ source: here, local: true, effect })) : []),
  ]
}

export function selects(selector: ProductSelector, productId: ProductId): boolean {
  if (isProductList(selector)) return selector.includes(productId)
  if ('tag' in selector) return PRODUCTS[productId].tags.includes(selector.tag)
  return selector.tiers.includes(PRODUCTS[productId].tier)
}

export function isProductList(selector: ProductSelector): selector is readonly ProductId[] {
  return Array.isArray(selector)
}

/** Multiplicateur de prix d'un effet sur un produit, ou null s'il ne le touche pas */
function priceFactor(effect: EventEffect, productId: ProductId): number | null {
  if (effect.kind === 'price' && selects(effect.products, productId)) return effect.factor
  if (effect.kind === 'appear' && effect.products.includes(productId)) return effect.factor
  return null
}

// ─── Multiplicateurs d'événement (chap. 2) ───

export type EventMultiplier = { source: BreakdownSource; factor: number }

/**
 * Multiplicateurs d'événement d'un produit dans un district : un par événement en vigueur (sa ligne la plus éloignée de 1
 * pour ce produit) et un par contrecoup. Ils se multiplient ; le plafond s'applique au cours (chap. 2).
 */
export function eventMultipliers(ctx: EventContext, districtId: DistrictId, productId: ProductId): EventMultiplier[] {
  const bySource = new Map<BreakdownSource, number>()
  for (const { source, effect } of activeEffects(ctx, districtId)) {
    const factor = priceFactor(effect, productId)
    // Les multiplicateurs « jour seulement » tombent après 20h00
    const dayOnly = effect.kind === 'price' && effect.dayOnly === true
    if (factor === null || (dayOnly && ctx.phase === 'night')) continue
    const kept = bySource.get(source)
    if (kept === undefined || Math.abs(factor - 1) > Math.abs(kept - 1)) bySource.set(source, factor)
  }
  const fromEvents = [...bySource].map(([source, factor]) => ({ source, factor }))
  const aftershocks = aftershockFactors(ctx, districtId, productId).map((factor) => ({ source: 'rule.aftershock' as const, factor }))
  return [...fromEvents, ...aftershocks].filter(({ factor }) => factor !== 1)
}

/** Produit des multiplicateurs d'événement, avant plafond */
export function eventFactor(ctx: EventContext, districtId: DistrictId, productId: ProductId): number {
  return eventMultipliers(ctx, districtId, productId).reduce((total, { factor }) => total * factor, 1)
}

/** Événements d'hier qui ont touché des cours dans ce district et ne se répètent pas aujourd'hui */
export function aftershockEvents(ctx: EventContext, districtId: DistrictId): (GlobalEventId | LocalEventId)[] {
  const { yesterday, local } = ctx.events
  const yesterdayLocal = yesterday.local[districtId]
  const globals = globalsInForce(ctx)
  // L'événement qui dure a son contrecoup le lendemain de son terme
  const lasting = ctx.events.lasting
  const ended = lasting && lasting.until === ctx.day - 1 && !globals.includes(lasting.event) ? [lasting.event] : []
  return [
    ...new Set([...(yesterday.global && !globals.includes(yesterday.global) ? [yesterday.global] : []), ...ended]),
    ...(yesterdayLocal && yesterdayLocal !== local[districtId] ? [yesterdayLocal] : []),
  ].filter((event) => effectsIn(event, districtId).some((effect) => effect.kind === 'price' || effect.kind === 'appear'))
}

/** Contrecoups d'un produit : l'effet inverse des multiplicateurs d'hier */
function aftershockFactors(ctx: EventContext, districtId: DistrictId, productId: ProductId): number[] {
  return aftershockEvents(ctx, districtId).flatMap((event) =>
    effectsIn(event, districtId).flatMap((effect) => {
      const factor = priceFactor(effect, productId)
      if (factor === null || factor === 1) return []
      return [factor > 1 ? AFTERSHOCK.afterRush : AFTERSHOCK.afterSale]
    }),
  )
}

// ─── Tags, stocks, apparitions ───

/**
 * Facteur d'un tag dans un district (risque au trajet, détection, malus de bluff) : une annulation l'emporte,
 * sinon le plus fort facteur, sans cumul avec le facteur propre au district (`base`, ex. l'odeur en D6).
 */
export function tagFactor(ctx: EventContext, districtId: DistrictId, tag: TagId, base = 1): number {
  const factors = activeEffects(ctx, districtId).flatMap(({ effect }) => (effect.kind === 'tag' && effect.tag === tag ? [effect.factor] : []))
  if (factors.includes(0)) return 0
  return Math.max(base, ...factors)
}

/** Facteur de stock d'un produit, cumulé sur les effets en vigueur */
export function stockFactor(ctx: EventContext, districtId: DistrictId, productId: ProductId): number {
  return activeEffects(ctx, districtId).reduce(
    (factor, { effect }) => (effect.kind === 'stock' && (!effect.products || effect.products.includes(productId)) ? factor * effect.factor : factor),
    1,
  )
}

/** Produits qui apparaissent à l'achat (dérogation à l'exclusion), tirés si l'événement n'en impose qu'une partie */
export function drawAppearances(ctx: EventContext, districtId: DistrictId, rng: Rng): ProductId[] {
  return activeEffects(ctx, districtId).flatMap(({ effect }) => {
    if (effect.kind !== 'appear') return []
    if (!effect.count) return [...effect.products]
    return rng.shuffle(effect.products).slice(0, rng.int(effect.count.min, effect.count.max))
  })
}

/** Le district a-t-il un effet de ce type en vigueur ? */
export function hasEffect(ctx: EventContext, districtId: DistrictId, kind: EventEffect['kind']): boolean {
  return activeEffects(ctx, districtId).some(({ effect }) => effect.kind === kind)
}

/** Canicule en vigueur (événement global, qui dure plusieurs jours) */
export function heatWave(ctx: EventContext): Extract<EventEffect, { kind: 'heat' }> | null {
  for (const event of globalsInForce(ctx)) for (const effect of GLOBAL_EVENTS[event].effects) if (effect.kind === 'heat') return effect
  return null
}

/** Arrivée dans un district (chap. 1) : effets d'arrivée des événements locaux, comme le sas de `[EVT-D3-01]` */
export function arrive(state: GameState): GameState {
  const halted = hasEffect(state, state.districtId, 'halfDay') ? loseHalfDay(state) : state
  // Tournée de nuit hors mission arrivée sans garde à vue (contrôle franchi compris) : injection de l'Héritier (chap. 4)
  const arrived = halted.phase === 'night' && !isOnMission(halted, halted.districtId) ? injectServer(halted) : halted
  // Arriver dans le district d'une commande du DSC (livraison du jour, mission de nuit), c'est livrer les caisses scellées
  return deliverDay(deliverMission(arrived))
}

// ─── Loterie ───

/** Vice emporté par le déclassé : le produit passe en Forte demande dans le district inférieur */
export function hasVice(ctx: EventContext, districtId: DistrictId, productId: ProductId): boolean {
  const lottery = ctx.events.lottery
  return (
    lottery !== null && lottery.vice === productId && lottery.viceDistrict === districtId && ctx.day >= lottery.day && ctx.day <= lottery.viceUntil
  )
}

/** District du promu le jour du tirage : purge préventive, sauf si un faux dossier a imposé le promu */
export function isPurged(ctx: EventContext, districtId: DistrictId): boolean {
  const lottery = ctx.events.lottery
  const forgedPromotion = lottery?.card === 'captain' || lottery?.card === 'competitor' || lottery?.card === 'informant'
  return lottery !== null && lottery.day === ctx.day && lottery.promoted === districtId && !forgedPromotion
}

/** Carte de faux dossier en vigueur dans un district (capitaine, concurrent), pendant la durée des effets du tirage */
export function forgedCard(ctx: EventContext, districtId: DistrictId): 'captain' | 'competitor' | null {
  const lottery = ctx.events.lottery
  if (!lottery || lottery.promoted !== districtId || ctx.day < lottery.day || ctx.day > lottery.viceUntil) return null
  return lottery.card === 'captain' || lottery.card === 'competitor' ? lottery.card : null
}

/** Vices qu'un cadre déclassé de ce district peut emporter : ni produits ni déjà demandés en bas */
export function viceChoices(district: DistrictId): ProductId[] {
  const lower = LOTTERY.lower[district]
  if (!lower) return []
  const below = DISTRICTS[lower]
  return DISTRICTS[district].strongDemand.filter((id) => !below.production.includes(id) && !below.strongDemand.includes(id))
}

/** Tirage de la Loterie ; un faux dossier accepté impose un rôle, l'autre reste tiré au hasard (chap. 3) */
function drawLottery(day: number, rng: Rng, card: ForgeryCard | null): Lottery {
  const cadre = card?.kind === 'cadre' ? card : null
  const imposedPromotion = card?.kind === 'captain' || card?.kind === 'competitor' ? card.district : null
  const promoted = imposedPromotion ?? rng.pick(LOTTERY.promotedFrom.filter((id) => id !== cadre?.district))
  // Un déclassement est réel et public : Aeterna n'en fait qu'une fois sur deux, sauf dénonciation (carte « cadre »)
  const demotes = cadre !== null || rng.chance(LOTTERY.demotionChance)
  const demoted = demotes ? (cadre?.district ?? rng.pick(LOTTERY.demotedFrom.filter((id) => id !== promoted))) : null
  const vices = demoted ? viceChoices(demoted) : []
  return {
    day,
    promoted,
    demoted,
    vice: cadre ? cadre.vice : vices.length > 0 ? rng.pick(vices) : null,
    viceDistrict: demoted ? (LOTTERY.lower[demoted] ?? null) : null,
    viceUntil: day + LOTTERY.viceDays - 1,
    names: { promoted: rng.int(0, 999), demoted: rng.int(0, 999) },
    card: card?.kind ?? null,
  }
}

// ─── Tirages ───

/**
 * Tirages de 06h00 (chap. 6) : l'événement global tiré la veille entre en vigueur, puis les locaux,
 * la Loterie, l'événement global du lendemain et sa rumeur. Le Jour 1, l'événement global du jour est tiré sur place.
 */
export function drawEvents(previous: EventsState, day: number, rng: Rng, firstDay = false): EventsState {
  const drawGlobal = () => (rng.chance(EVENT_CHANCES.global) ? rng.pick(GLOBAL_EVENT_IDS) : null)
  const global = firstDay ? drawGlobal() : previous.tomorrow

  const local: Partial<Record<DistrictId, LocalEventId>> = {}
  const localDays = { ...previous.localDays }
  for (const districtId of DISTRICT_IDS) {
    if (!rng.chance(EVENT_CHANCES.local)) continue
    const ready = localEventsOf(districtId).filter((id) => (localDays[id] ?? -Infinity) + EVENT_COOLDOWNS.local <= day)
    if (ready.length === 0) continue
    const event = rng.pick(ready)
    local[districtId] = event
    localDays[event] = day
  }

  const forgery = previous.forgery?.day === day ? previous.forgery.card : null
  const lottery = LOTTERY.days.includes(day) ? drawLottery(day, rng, forgery) : previous.lottery
  // Prédiction de Cassandre-88 : l'événement de demain est garanti, et la rumeur ne se trompe pas
  const prophecy = previous.prophecy?.day === day + 1 ? previous.prophecy.event : null
  const drawn = drawGlobal()
  const tomorrow = prophecy ?? drawn
  // Une rumeur fuite parfois sur l'événement de demain ; sans événement, une fausse rumeur circule parfois
  const rumor = prophecy ?? (tomorrow ? (rng.chance(RUMOR.leak) ? tomorrow : null) : rng.chance(RUMOR.falseAlarm) ? rng.pick(GLOBAL_EVENT_IDS) : null)

  // Un événement qui dure (canicule) démarre, ou se prolonge s'il revient ; sinon le précédent court jusqu'à son terme
  const days = global ? GLOBAL_EVENTS[global].days : undefined
  // Gardé un jour de plus après son terme : le contrecoup du lendemain le lit
  const lasting =
    global && days ? { event: global, until: day + days - 1 } : previous.lasting && previous.lasting.until >= day - 1 ? previous.lasting : null

  return {
    global,
    local,
    yesterday: firstDay ? { global: null, local: {} } : { global: previous.global, local: previous.local },
    localDays,
    tomorrow,
    rumor,
    lottery,
    roadDays: previous.roadDays,
    prophecy: previous.prophecy && previous.prophecy.day >= day ? previous.prophecy : null,
    forgery: previous.forgery && previous.forgery.day > day ? previous.forgery : null,
    lasting,
  }
}

/** Fiabilité affichée d'une rumeur : part des rumeurs qui se vérifient */
export function rumorReliability(): number {
  const leaked = EVENT_CHANCES.global * RUMOR.leak
  return leaked / (leaked + (1 - EVENT_CHANCES.global) * RUMOR.falseAlarm)
}

/** Aléa routier d'un trajet sans interception, parmi ceux hors cooldown, ou null */
export function drawRoadEvent(state: GameState, rng: Rng): RoadEventId | null {
  // La nuit, dans les galeries de service, personne à croiser (chap. 6)
  if (state.phase !== 'day' || !rng.chance(EVENT_CHANCES.road)) return null
  const ready = ROAD_EVENT_IDS.filter((id) => (state.events.roadDays[id] ?? -Infinity) + EVENT_COOLDOWNS.road <= state.day)
  return ready.length > 0 ? rng.pick(ready) : null
}
