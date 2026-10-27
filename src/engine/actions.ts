import { FUEL_PER_CROSSED_DISTRICT, GAME_LENGTH_DAYS, SIPHON } from '../data/balance.ts'
import { VEHICLES } from '../data/vehicles.ts'
import { cargoUsed, ownedQty, takeLots } from './cargo.ts'
import { crossedDistricts, shortestRoute } from './map.ts'
import { drawMarkets, fuelPriceBreakdown, quote, saleQuote } from './market.ts'
import { createRng } from './rng.ts'
import { remember } from './state.ts'
import type { DistrictId, GameState, ProductId } from './types.ts'

/*
 * Actions du joueur : chaque action produit un nouvel état, ou une erreur sans rien changer.
 * Les fonctions `check*` / `max*` servent aussi à l'interface pour griser les boutons.
 */

export type Action =
  | { type: 'buy'; productId: ProductId; qty: number }
  | { type: 'sell'; productId: ProductId; qty: number }
  | { type: 'refuel'; qty: number }
  | { type: 'travel'; to: DistrictId }
  | { type: 'forceCurfew' }
  | { type: 'sleep' }
  | { type: 'siphon' }

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
      cargo: [...state.cargo, { productId, qty, unitCost, travelled: false }],
      markets: {
        ...state.markets,
        [state.districtId]: { ...market, stock: { ...market.stock, [productId]: stock - qty } },
      },
    },
  }
}

function sell(state: GameState, productId: ProductId, qty: number): ActionResult {
  if (qty > ownedQty(state.cargo, productId)) return fail('not-enough-cargo')
  const { total } = saleQuote(state, productId, qty)
  const market = state.markets[state.districtId]
  const demandLeft = market.demand[productId]

  return {
    ok: true,
    state: {
      ...state,
      cash: state.cash + total,
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

function refuel(state: GameState, qty: number): ActionResult {
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

  const arrived: GameState = {
    ...state,
    districtId: to,
    fuel: state.fuel - plan.fuelCost,
    cargo: state.cargo.map((lot) => (lot.travelled ? lot : { ...lot, travelled: true })),
    dayTripDone: state.dayTripDone || state.phase === 'day',
    nightTripDone: state.nightTripDone || state.phase === 'night',
  }
  return { ok: true, state: remember(arrived, to) }
}

// ─── Fin de journée ───

/** Le couvre-feu forcé le Jour J est verrouillé le soir du Jour J+1 (épuisement nerveux, chap. 2) */
export function checkForceCurfew(state: GameState): ActionError | null {
  if (state.status !== 'playing') return 'game-over'
  if (state.phase !== 'day') return 'not-daytime'
  if (state.lastCurfewDay === state.day - 1) return 'exhausted'
  return null
}

function forceCurfew(state: GameState): ActionResult {
  const error = checkForceCurfew(state)
  if (error) return fail(error)
  return { ok: true, state: { ...state, phase: 'night', lastCurfewDay: state.day } }
}

/** Nuit (relais routier ou bivouac) puis routine matinale de 06h00 */
function sleep(state: GameState): ActionResult {
  if (state.day >= GAME_LENGTH_DAYS) return { ok: true, state: { ...state, status: 'finished' } }

  const rng = createRng(state.rng)
  const markets = drawMarkets(rng, state.markets)
  const morning: GameState = {
    ...state,
    day: state.day + 1,
    phase: 'day',
    dayTripDone: false,
    nightTripDone: false,
    markets,
    rng: rng.state,
  }
  return { ok: true, state: remember(morning, morning.districtId) }
}

// ─── Point d'entrée ───

export function applyAction(state: GameState, action: Action): ActionResult {
  if (state.status !== 'playing') return fail('game-over')

  switch (action.type) {
    case 'buy':
      return isQuantity(action.qty) ? buy(state, action.productId, action.qty) : fail('invalid-quantity')
    case 'sell':
      return isQuantity(action.qty) ? sell(state, action.productId, action.qty) : fail('invalid-quantity')
    case 'refuel':
      return isQuantity(action.qty) ? refuel(state, action.qty) : fail('invalid-quantity')
    case 'travel':
      return travel(state, action.to)
    case 'forceCurfew':
      return forceCurfew(state)
    case 'sleep':
      return sleep(state)
    case 'siphon':
      return siphon(state)
  }
}
