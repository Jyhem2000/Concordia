import { FUEL_PER_CROSSED_DISTRICT, ICC_MAX, NIGHT_TRIP_CHASSIS_WEAR, PUMP_NIGHT_MIN_ICC, SIPHON } from '../data/balance.ts'
import { DISTRICTS } from '../data/districts.ts'
import { LOCATIONS } from '../data/locations.ts'
import { PRODUCT_IDS, PRODUCTS } from '../data/products.ts'
import { VEHICLES } from '../data/vehicles.ts'
import { cargoUsed, giveCrates, ownedQty, takeLots } from './cargo.ts'
import { loanRoom, offshoreBalance, withdrawalBreakdown, withdrawFrom } from './finance.ts'
import { checkMove, drawInterception, emergencyTow, resolveMove } from './interception.ts'
import { crossedDistricts, shortestRoute } from './map.ts'
import { dismiss, hire } from './crew.ts'
import { acceptDelivery, checkDelivery } from './delivery.ts'
import { noteSale } from './progress.ts'
import { acceptMission, checkMission, isOnMission, recordDeviation } from './night.ts'
import {
  auction,
  blackmail,
  consultCassandre,
  deliverVip,
  forge,
  orderInfluence,
  requestVip,
  shieldSponsored,
  visitMorgue,
  type MorgueService,
} from './services.ts'
import { buyModule, buyVehicle, mountedEffect, mountModule, repair } from './equipment.ts'
import { arrive, drawRoadEvent, heatWave } from './events.ts'
import { changeHealth } from './gauges.ts'
import { fuelPriceBreakdown, quote, saleQuote } from './market.ts'
import { keysOf } from './records.ts'
import { risk } from './risk.ts'
import { checkRoadChoice, resolveRoadChoice, type RoadChoiceId } from './road.ts'
import { createRng } from './rng.ts'
import { sleep } from './routine.ts'
import { remember } from './state.ts'
import type {
  CargoLot,
  CrateCount,
  CrewId,
  DistrictId,
  ForgeryCard,
  GameState,
  InterceptionMove,
  LocationId,
  LocationService,
  ModuleId,
  Offer,
  ProductId,
  Tactics,
  TagId,
  VehicleId,
} from './types.ts'

/*
 * Actions du joueur : chaque action produit un nouvel état, ou une erreur sans rien changer.
 * Les fonctions `check*` / `max*` servent aussi à l'interface pour griser les boutons.
 */

export type Action =
  | { type: 'buy'; productId: ProductId; qty: number }
  | { type: 'sell'; productId: ProductId; qty: number }
  /** Vente groupée : tout ce qui se vend, ou seulement les produits vendus avec une marge (`profitableOnly`) */
  | { type: 'sellAll'; profitableOnly: boolean }
  | { type: 'refuel'; qty: number }
  | { type: 'travel'; to: DistrictId }
  /** Livraison officielle du jour, à accepter avant le trajet de jour */
  | { type: 'acceptDelivery' }
  /** Tournée de nuit ; `drink` : boisson pour une nuit blanche malgré l'épuisement ; `mission` : accepter la mission du soir */
  | { type: 'forceCurfew'; drink?: ProductId; mission?: boolean }
  | { type: 'useProduct'; productId: ProductId }
  | { type: 'setAutoCooling'; enabled: boolean }
  | { type: 'sleep' }
  | { type: 'siphon' }
  | { type: 'repay'; amount: number }
  | { type: 'borrow'; amount: number }
  | { type: 'deposit'; amount: number }
  | { type: 'withdraw'; amount: number }
  /** Option de l'écran d'interception ; `offer` pour la corruption */
  | { type: 'intercept'; move: InterceptionMove; offer?: Offer; tactics?: Tactics }
  | { type: 'buyVehicle'; vehicleId: VehicleId }
  | { type: 'buyModule'; moduleId: ModuleId }
  /** Monter (`mount` vrai) ou démonter un module possédé */
  | { type: 'mountModule'; moduleId: ModuleId; mount: boolean }
  | { type: 'repair'; pv: number }
  | { type: 'hireCrew'; crewId: CrewId }
  | { type: 'influence'; tag: TagId }
  | { type: 'morgue'; service: MorgueService }
  | { type: 'prophecy' }
  | { type: 'forge'; card: ForgeryCard }
  | { type: 'auction'; productId: ProductId }
  /** Chantage payé en caisses (`inKind`) ou en Cash-Puce */
  | { type: 'blackmail'; inKind: boolean }
  | { type: 'vipRequest' }
  | { type: 'vipDeliver' }
  | { type: 'dismissCrew' }
  /** Salaire réduit payé en caisses (Vance) : réglage du joueur */
  | { type: 'setPayInKind'; enabled: boolean }
  /** Option d'un aléa routier ; `pay` : index du paiement choisi quand l'option en propose plusieurs */
  | { type: 'road'; choice: RoadChoiceId; pay?: number }

export type ActionError =
  | 'game-over'
  | 'invalid-quantity'
  | 'not-for-sale'
  | 'out-of-stock'
  | 'cargo-full'
  | 'not-enough-cash'
  | 'not-enough-cargo'
  | 'tank-full'
  | 'same-district'
  | 'trip-done'
  | 'not-enough-fuel'
  | 'not-daytime'
  | 'exhausted'
  | 'siphon-unavailable'
  | 'invalid-amount'
  | 'not-at-location'
  | 'location-closed'
  | 'no-debt'
  | 'advance-used'
  | 'not-enough-offshore'
  | 'intercepted'
  | 'not-intercepted'
  | 'move-unavailable'
  | 'offer-too-low'
  | 'doping-used'
  | 'not-usable'
  | 'already-used'
  | 'third-night'
  | 'too-weak'
  | 'road-event'
  | 'no-road-event'
  | 'already-owned'
  | 'not-owned'
  | 'no-free-slot'
  | 'crew-lost'
  | 'no-crew'
  | 'pump-closed'
  | 'no-mission'
  | 'mission-locked'
  | 'locked'
  | 'nothing-to-sell'
  | 'no-delivery'
  | 'delivery-pending'
  | 'not-eligible'
  | 'cooldown'
  | 'already-healthy'
  | 'prophecy-active'
  | 'too-late'
  | 'location-locked'
  | 'contract-active'
  | 'no-contract'

export type ActionResult = { ok: true; state: GameState } | { ok: false; error: ActionError }

const fail = (error: ActionError): ActionResult => ({ ok: false, error })

const isQuantity = (qty: number) => Number.isInteger(qty) && qty > 0

// ─── Marché ───

/** Maximum achetable : stock, place en soute et Cash-Puce */
export function maxBuy(state: GameState, productId: ProductId): number {
  const stock = state.markets[state.districtId].stock[productId] ?? 0
  const space = VEHICLES[state.vehicleId].cargo - cargoUsed(state.cargo)
  return Math.max(0, Math.min(stock, space, Math.floor(state.cash / quote(state, state.districtId, productId))))
}

function buy(state: GameState, productId: ProductId, qty: number): ActionResult {
  const market = state.markets[state.districtId]
  const stock = market.stock[productId]
  if (stock === undefined) return fail('not-for-sale')
  if (qty > stock) return fail('out-of-stock')
  if (cargoUsed(state.cargo) + qty > VEHICLES[state.vehicleId].cargo) return fail('cargo-full')
  const unitCost = quote(state, state.districtId, productId)
  if (unitCost * qty > state.cash) return fail('not-enough-cash')

  return {
    ok: true,
    state: {
      ...state,
      cash: state.cash - unitCost * qty,
      cargo: [...state.cargo, { productId, qty, unitCost, travelled: false, boughtDay: state.day, damaged: false }],
      markets: {
        ...state.markets,
        [state.districtId]: { ...market, stock: { ...market.stock, [productId]: stock - qty } },
      },
    },
  }
}

/**
 * Ventes groupées (chap. 10) : chaque produit en soute vendu en entier, caisses scellées exclues ; avec `profitableOnly`,
 * seulement ceux dont la vente entière rapporte plus que leur prix d'achat (saturation comprise)
 */
export function bulkSales(state: GameState, profitableOnly: boolean): CrateCount[] {
  const owned = [...new Set(state.cargo.map((lot) => lot.productId))].filter((id) => !PRODUCTS[id].sealed)
  return owned.flatMap((productId) => {
    const qty = ownedQty(state.cargo, productId)
    if (!profitableOnly) return [{ productId, qty }]
    const sale = saleQuote(state, productId, qty)
    return sale.total > sale.cost ? [{ productId, qty }] : []
  })
}

function sellAll(state: GameState, profitableOnly: boolean): ActionResult {
  const sales = bulkSales(state, profitableOnly)
  if (sales.length === 0) return fail('nothing-to-sell')
  return sales.reduce<ActionResult>((result, { productId, qty }) => (result.ok ? sell(result.state, productId, qty) : result), { ok: true, state })
}

function sell(state: GameState, productId: ProductId, qty: number): ActionResult {
  // Les caisses scellées d'une mission de nuit appartiennent au DSC (chap. 2)
  if (PRODUCTS[productId].sealed) return fail('not-for-sale')
  if (qty > ownedQty(state.cargo, productId)) return fail('not-enough-cargo')
  const { total, saturatedQty } = saleQuote(state, productId, qty)
  const market = state.markets[state.districtId]
  const demandLeft = market.demand[productId]
  // Vendre au-delà de la demande alerte Aeterna : pic suspect demain dans ce district (chap. 7)
  const oversold = saturatedQty > 0 && !state.oversold.includes(state.districtId) ? [...state.oversold, state.districtId] : state.oversold

  return {
    ok: true,
    state: {
      ...noteSale(state, productId, qty),
      cash: state.cash + total,
      oversold,
      cargo: takeLots(state.cargo, productId, qty).remaining,
      markets:
        demandLeft === undefined
          ? state.markets
          : {
              ...state.markets,
              [state.districtId]: { ...market, demand: { ...market.demand, [productId]: Math.max(0, demandLeft - qty) } },
            },
    },
  }
}

// ─── Carburant ───

export function fuelPrice(state: GameState): number {
  return fuelPriceBreakdown(state).total
}

export function maxRefuel(state: GameState): number {
  const space = VEHICLES[state.vehicleId].tank - state.fuel
  return Math.max(0, Math.min(space, Math.floor(state.cash / fuelPrice(state))))
}

/** Pompe officielle fermée la nuit sous un seuil d'ICC (chap. 4) */
export function pumpClosed(state: GameState): boolean {
  return state.phase === 'night' && DISTRICTS[state.districtId].pump === 'official' && state.icc < PUMP_NIGHT_MIN_ICC
}

function refuel(state: GameState, qty: number): ActionResult {
  if (pumpClosed(state)) return fail('pump-closed')
  if (state.fuel + qty > VEHICLES[state.vehicleId].tank) return fail('tank-full')
  const cost = fuelPrice(state) * qty
  if (cost > state.cash) return fail('not-enough-cash')
  return { ok: true, state: { ...state, cash: state.cash - cost, fuel: state.fuel + qty } }
}

/** Corvée DSC : seul recours sans carburant, sans cargaison et sans de quoi payer 1 ration (chap. 2) */
export function canSiphon(state: GameState): boolean {
  return state.status === 'playing' && state.phase === 'day' && state.fuel === 0 && cargoUsed(state.cargo) === 0 && state.cash < fuelPrice(state)
}

function siphon(state: GameState): ActionResult {
  if (!canSiphon(state)) return fail('siphon-unavailable')
  return {
    ok: true,
    state: {
      ...state,
      fuel: state.fuel + SIPHON.fuel,
      icc: Math.max(0, state.icc - SIPHON.iccLoss),
      // Demi-journée perdue : le joueur passe directement à 20h00
      dayTripDone: true,
      dayOver: true,
    },
  }
}

// ─── Trajets ───

export type TravelPlan = {
  route: DistrictId[]
  crossed: DistrictId[]
  fuelCost: number
  /** Raison pour laquelle le trajet est impossible maintenant, sinon null */
  error: ActionError | null
}

export function planTravel(state: GameState, to: DistrictId): TravelPlan {
  const route = shortestRoute(state.districtId, to)
  const crossed = crossedDistricts(route)
  const fuelCost = VEHICLES[state.vehicleId].fuelPerTrip[state.phase] + crossed.length * FUEL_PER_CROSSED_DISTRICT

  let error: ActionError | null = null
  if (state.status !== 'playing') error = 'game-over'
  else if (to === state.districtId) error = 'same-district'
  else if (state.phase === 'day' ? state.dayTripDone : state.nightTripDone) error = 'trip-done'
  else if (fuelCost > state.fuel) error = 'not-enough-fuel'

  return { route, crossed, fuelCost, error }
}

function travel(state: GameState, to: DistrictId): ActionResult {
  const plan = planTravel(state, to)
  if (plan.error) return fail(plan.error)

  // Le risque se calcule au départ (phase, soute, district quitté), ronde renforcée comprise
  const tripRisk = risk(state, to, { includePatrol: true })
  const rng = createRng(state.rng)
  const interception = drawInterception(rng, tripRisk, state, to)
  const jammed = interception?.jammed === true
  // Sans barrage ni racket, un aléa routier peut survenir (chap. 8)
  const roadEvent = interception ? null : drawRoadEvent(state, rng)

  // Usure du trajet : galeries de nuit, ou canicule de jour ; des caisses peuvent refroidir le moteur (chap. 2, 3 et 8)
  const heat = state.phase === 'day' ? heatWave(state) : null
  // Les suspensions annulent l'usure de nuit, le caisson cryo celle de la canicule
  const nightWear = mountedEffect(state, 'smoothRide') ? 0 : NIGHT_TRIP_CHASSIS_WEAR
  const heatWear = mountedEffect(state, 'heatProof') ? 0 : (heat?.dayTripChassis ?? 0)
  const wear = tripWear(state, state.phase === 'night' ? nightWear : heatWear)
  const stroke = heat ? changeHealth(state, -heat.dayTripHealth, 1) : null
  const arrived: GameState = {
    ...state,
    districtId: to,
    fuel: state.fuel - plan.fuelCost,
    health: stroke?.state.health ?? state.health,
    chassis: Math.max(0, state.chassis - wear.chassisWear),
    cargo: wear.cargo.map((lot) => (lot.travelled ? lot : { ...lot, travelled: true })),
    tripReport: {
      chassisWear: wear.chassisWear,
      coolingCrates: wear.coolingCrates,
      heatHealth: stroke ? -stroke.delta : 0,
      mission: null,
      missionFee: 0,
      injection: 0,
    },
    jammerDay: jammed ? state.day : state.jammerDay,
    dayTripDone: state.dayTripDone || state.phase === 'day',
    nightTripDone: state.nightTripDone || state.phase === 'night',
    interception,
    interceptionReport: null,
    roadEvent,
    roadReport: null,
    events: roadEvent ? { ...state.events, roadDays: { ...state.events.roadDays, [roadEvent]: state.day } } : state.events,
    rng: rng.state,
  }
  // Sans barrage ni aléa, le trajet se termine ici ; sinon le dépannage et l'arrivée attendent leur résolution
  // De nuit, un trajet hors mission qui passe sans interception est un écart enregistré (chap. 2)
  const logged = state.phase === 'night' && !interception && !isOnMission(state, to) ? recordDeviation(arrived) : arrived
  const done = interception ? shieldSponsored(logged) : roadEvent ? logged : arrive(emergencyTow(logged).state)
  return { ok: true, state: remember(done, to) }
}

/** Usure d'un trajet, ou refroidissement par les caisses qui le permettent si le joueur l'a activé */
function tripWear(state: GameState, chassisWear: number): { cargo: CargoLot[]; chassisWear: number; coolingCrates: number } {
  if (chassisWear === 0) return { cargo: [...state.cargo], chassisWear: 0, coolingCrates: 0 }
  const coolant = state.autoCooling
    ? PRODUCT_IDS.find((id) => {
        const cooling = PRODUCTS[id].cooling
        return cooling !== undefined && ownedQty(state.cargo, id) >= cooling.crates
      })
    : undefined
  const cooling = coolant ? PRODUCTS[coolant].cooling : undefined
  if (coolant && cooling) {
    return { cargo: giveCrates(state.cargo, [{ productId: coolant, qty: cooling.crates }]), chassisWear: 0, coolingCrates: cooling.crates }
  }
  return { cargo: [...state.cargo], chassisWear, coolingCrates: 0 }
}

// ─── Produits utilisables (chap. 3) ───

/** Raison pour laquelle le produit ne peut pas être utilisé maintenant (restauration d'ICC), ou null */
export function checkUseProduct(state: GameState, productId: ProductId): ActionError | null {
  if (!PRODUCTS[productId].iccRestore) return 'not-usable'
  if (ownedQty(state.cargo, productId) < 1) return 'not-enough-cargo'
  if (state.iccRestoreUsed) return 'already-used'
  return null
}

function applyProduct(state: GameState, productId: ProductId): ActionResult {
  const error = checkUseProduct(state, productId)
  if (error) return fail(error)
  // Gain hors plafond (chap. 2) : une identité neuve ne passe pas par les gains de route
  const icc = Math.min(ICC_MAX, state.icc + (PRODUCTS[productId].iccRestore ?? 0))
  return { ok: true, state: { ...state, icc, iccRestoreUsed: true, cargo: giveCrates(state.cargo, [{ productId, qty: 1 }]) } }
}

// ─── Lieux spéciaux : dette et compte offshore (chap. 4 et 7) ───

/** Lieu qui rend ce service dans le district du joueur, s'il y en a un */
export function locationFor(state: GameState, service: LocationService): LocationId | null {
  return keysOf(LOCATIONS).find((id) => LOCATIONS[id].district === state.districtId && LOCATIONS[id].services.includes(service)) ?? null
}

/** Un service s'obtient de jour, dans un lieu du district qui le rend ; renvoie la raison sinon */
export function checkService(state: GameState, service: LocationService): ActionError | null {
  if (state.status !== 'playing') return 'game-over'
  if (!locationFor(state, service)) return 'not-at-location'
  if (state.phase !== 'day' || state.dayOver) return 'location-closed'
  return null
}

export function maxRepay(state: GameState): number {
  return Math.min(state.cash, state.debt)
}

function repay(state: GameState, amount: number): ActionResult {
  const closed = checkService(state, 'debt')
  if (closed) return fail(closed)
  if (state.debt === 0) return fail('no-debt')
  if (amount > state.cash) return fail('not-enough-cash')
  if (amount > state.debt) return fail('invalid-amount')
  const debt = state.debt - amount
  return { ok: true, state: { ...state, cash: state.cash - amount, debt, initialDebtPaid: state.initialDebtPaid || debt === 0 } }
}

function borrow(state: GameState, amount: number): ActionResult {
  const closed = checkService(state, 'debt')
  if (closed) return fail(closed)
  if (amount > loanRoom(state)) return fail('advance-used')
  return { ok: true, state: { ...state, cash: state.cash + amount, debt: state.debt + amount, advanced: state.advanced + amount } }
}

function deposit(state: GameState, amount: number): ActionResult {
  const closed = checkService(state, 'offshore')
  if (closed) return fail(closed)
  if (amount > state.cash) return fail('not-enough-cash')
  return {
    ok: true,
    state: { ...state, cash: state.cash - amount, offshore: { ...state.offshore, deposited: state.offshore.deposited + amount } },
  }
}

function withdraw(state: GameState, amount: number): ActionResult {
  const closed = checkService(state, 'offshore')
  if (closed) return fail(closed)
  if (amount > offshoreBalance(state.offshore)) return fail('not-enough-offshore')
  // Commission de la Laverie au retrait : le compte est débité du montant, le Cash-Puce n'en reçoit qu'une part
  return { ok: true, state: { ...state, cash: state.cash + withdrawalBreakdown(amount).total, offshore: withdrawFrom(state.offshore, amount) } }
}

// ─── Fin de journée ───

/** La tournée de nuit du Jour J est verrouillée le soir du Jour J+1 (épuisement nerveux, chap. 2) */
export function checkForceCurfew(state: GameState, drink?: ProductId): ActionError | null {
  if (state.status !== 'playing') return 'game-over'
  if (state.phase !== 'day') return 'not-daytime'
  const exhausted = state.lastCurfewDay === state.day - 1
  if (drink === undefined) return exhausted ? 'exhausted' : null
  // Nuit blanche forcée : une boisson lève l'épuisement pour une 2e nuit, jamais une 3e (chap. 2 et 3)
  const sleepless = PRODUCTS[drink].sleeplessNight
  if (!sleepless || !exhausted) return 'not-usable'
  if (ownedQty(state.cargo, drink) < 1) return 'not-enough-cargo'
  if (state.curfewStreak >= 2) return 'third-night'
  if (state.health <= sleepless.minHealth) return 'too-weak'
  return null
}

function forceCurfew(state: GameState, drink?: ProductId, mission = false): ActionResult {
  const error = checkForceCurfew(state, drink) ?? (mission ? checkMission(state) : null)
  if (error) return fail(error)
  // La plateforme charge les caisses scellées de la mission acceptée (chap. 2)
  if (mission) state = acceptMission(state)
  const curfewStreak = state.lastCurfewDay === state.day - 1 ? state.curfewStreak + 1 : 1
  const night: GameState = { ...state, phase: 'night', lastCurfewDay: state.day, curfewStreak }
  const sleepless = drink ? PRODUCTS[drink].sleeplessNight : undefined
  if (!drink || !sleepless) return { ok: true, state: night }
  const drunk = { ...night, cargo: giveCrates(state.cargo, [{ productId: drink, qty: 1 }]) }
  return { ok: true, state: changeHealth(drunk, -sleepless.healthLoss).state }
}

// ─── Garage (chap. 4 et 5) ───

/** Les services du garage s'obtiennent de jour, à Rust Valley */
function garage(state: GameState, run: () => ActionResult): ActionResult {
  return atService(state, 'garage', run)
}

/** Un service ne s'obtient que de jour, dans un lieu du district qui le rend */
function atService(state: GameState, service: LocationService, run: () => ActionResult): ActionResult {
  const closed = checkService(state, service)
  return closed ? fail(closed) : run()
}

// ─── Point d'entrée ───

export function applyAction(state: GameState, action: Action): ActionResult {
  if (state.status !== 'playing') return fail('game-over')
  // Un barrage, puis un aléa routier, se règlent avant toute autre action
  if (state.interception && action.type !== 'intercept') return fail('intercepted')
  if (state.roadEvent && action.type !== 'road') return fail('road-event')

  switch (action.type) {
    case 'intercept': {
      const error = checkMove(state, action.move, action.offer, action.tactics)
      return error ? fail(error) : { ok: true, state: resolveMove(state, action.move, action.offer, action.tactics) }
    }
    case 'road': {
      const error = checkRoadChoice(state, action.choice, action.pay)
      return error ? fail(error) : { ok: true, state: resolveRoadChoice(state, action.choice, action.pay) }
    }
    case 'buyVehicle':
      return garage(state, () => buyVehicle(state, action.vehicleId))
    case 'buyModule':
      return garage(state, () => buyModule(state, action.moduleId))
    case 'mountModule':
      return garage(state, () => mountModule(state, action.moduleId, action.mount))
    case 'repair':
      return isQuantity(action.pv) ? garage(state, () => repair(state, action.pv)) : fail('invalid-amount')
    case 'hireCrew': {
      const closed = checkService(state, 'crew')
      if (closed) return fail(closed)
      const hired = hire(state, action.crewId)
      // Glitch branche son flux dès l'embauche
      return hired.ok ? { ok: true, state: remember(hired.state, hired.state.districtId) } : hired
    }
    case 'dismissCrew': {
      const closed = checkService(state, 'crew')
      return closed ? fail(closed) : dismiss(state)
    }
    case 'influence':
      return atService(state, 'influence', () => orderInfluence(state, action.tag))
    case 'morgue':
      return atService(state, 'morgue', () => visitMorgue(state, action.service))
    case 'prophecy':
      return atService(state, 'prophecy', () => consultCassandre(state))
    case 'forge':
      return atService(state, 'forgery', () => forge(state, action.card))
    case 'auction':
      return atService(state, 'velvet', () => auction(state, action.productId))
    case 'blackmail':
      return atService(state, 'velvet', () => blackmail(state, action.inKind))
    case 'vipRequest':
      return atService(state, 'velvet', () => requestVip(state))
    case 'vipDeliver':
      return atService(state, 'velvet', () => deliverVip(state))
    case 'setPayInKind':
      return { ok: true, state: { ...state, crew: { ...state.crew, payInKind: action.enabled } } }
    case 'buy':
      return isQuantity(action.qty) ? buy(state, action.productId, action.qty) : fail('invalid-quantity')
    case 'sell':
      return isQuantity(action.qty) ? sell(state, action.productId, action.qty) : fail('invalid-quantity')
    case 'sellAll':
      return sellAll(state, action.profitableOnly)
    case 'refuel':
      return isQuantity(action.qty) ? refuel(state, action.qty) : fail('invalid-quantity')
    case 'travel':
      return travel(state, action.to)
    case 'acceptDelivery': {
      const error = checkDelivery(state)
      return error ? fail(error) : { ok: true, state: acceptDelivery(state) }
    }
    case 'forceCurfew':
      return forceCurfew(state, action.drink, action.mission)
    case 'useProduct':
      return applyProduct(state, action.productId)
    case 'setAutoCooling':
      return { ok: true, state: { ...state, autoCooling: action.enabled } }
    case 'sleep':
      return { ok: true, state: sleep(state) }
    case 'siphon':
      return siphon(state)
    case 'repay':
      return isQuantity(action.amount) ? repay(state, action.amount) : fail('invalid-amount')
    case 'borrow':
      return isQuantity(action.amount) ? borrow(state, action.amount) : fail('invalid-amount')
    case 'deposit':
      return isQuantity(action.amount) ? deposit(state, action.amount) : fail('invalid-amount')
    case 'withdraw':
      return isQuantity(action.amount) ? withdraw(state, action.amount) : fail('invalid-amount')
  }
}
