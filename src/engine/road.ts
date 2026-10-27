import { ROAD_EVENTS } from '../data/events.ts'
import { PRODUCT_IDS, PRODUCTS } from '../data/products.ts'
import { VEHICLES } from '../data/vehicles.ts'
import type { ActionError } from './actions.ts'
import { cargoUsed, giveCrates, ownedQty } from './cargo.ts'
import { arrive } from './events.ts'
import { changeHealth, gainRouteIcc } from './gauges.ts'
import { indexed } from './inflation.ts'
import { emergencyTow } from './interception.ts'
import { createRng } from './rng.ts'
import type { CrateCount, GameState, RoadChoice, RoadCost, RoadOutcome, RoadReport } from './types.ts'

/*
 * Aléas routiers (chap. 8) : options, coûts au choix, pari, puis dépannage et arrivée.
 */

export type RoadChoiceId = 'a' | 'b'

/** Caisses que prendrait un coût : le produit demandé, ou la moins chère (prix de base) du tag ou des tiers ; null si la soute ne suffit pas */
export function roadCrates(state: GameState, cost: RoadCost): CrateCount[] | null {
  const wanted = cost.crates
  if (!wanted) return []
  const fits = PRODUCT_IDS.filter((id) => {
    const product = PRODUCTS[id]
    if (wanted.productId && id !== wanted.productId) return false
    if (wanted.tag && !product.tags.includes(wanted.tag)) return false
    if (wanted.tiers && !wanted.tiers.includes(product.tier)) return false
    return ownedQty(state.cargo, id) >= wanted.qty
  })
  const cheapest = fits.reduce<(typeof fits)[number] | null>(
    (best, id) => (best === null || PRODUCTS[id].basePrice < PRODUCTS[best].basePrice ? id : best),
    null,
  )
  return cheapest ? [{ productId: cheapest, qty: wanted.qty }] : null
}

/** Montant en ₡ d'un coût ou d'un gain, indexé sur l'inflation du jour */
export function roadCash(state: GameState, amount: number | undefined): number {
  return amount ? indexed('rule.inflation', amount, state.day).total : 0
}

/** Raison pour laquelle un coût ne peut pas être payé, ou null */
export function checkRoadCost(state: GameState, cost: RoadCost): ActionError | null {
  if (roadCash(state, cost.cash) > state.cash) return 'not-enough-cash'
  if ((cost.fuel ?? 0) > state.fuel) return 'not-enough-fuel'
  if (roadCrates(state, cost) === null) return 'not-enough-cargo'
  if (cost.freeSlot && cargoUsed(state.cargo) >= VEHICLES[state.vehicleId].cargo) return 'cargo-full'
  return null
}

/** Raison pour laquelle une option (avec le paiement choisi) est impossible, ou null */
export function checkRoadChoice(state: GameState, choice: RoadChoiceId, pay = 0): ActionError | null {
  if (!state.roadEvent) return 'no-road-event'
  const option = ROAD_EVENTS[state.roadEvent][choice]
  if (!option.pay) return null
  const cost = option.pay[pay]
  return cost ? checkRoadCost(state, cost) : 'invalid-amount'
}

/** Joue une option déjà validée par `checkRoadChoice`, puis dépannage et arrivée */
export function resolveRoadChoice(state: GameState, choice: RoadChoiceId, pay = 0): GameState {
  const eventId = state.roadEvent
  if (!eventId) return state
  const rng = createRng(state.rng)
  const option: RoadChoice = ROAD_EVENTS[eventId][choice]
  const cost = option.pay?.[pay]

  let s = cost ? payCost(state, cost) : state
  let won: boolean | null = null
  let outcome: RoadOutcome = option.outcome ?? {}
  if (option.gamble) {
    won = rng.chance(option.gamble.chance)
    outcome = won ? option.gamble.win : option.gamble.lose
  }
  s = applyOutcome({ ...s, rng: rng.state }, outcome, roadCash(state, cost?.cash))

  const towed = emergencyTow(s)
  const report: RoadReport = {
    eventId,
    choice,
    won,
    cash: s.cash - state.cash,
    icc: s.icc - state.icc,
    health: s.health - state.health,
    chassis: s.chassis - state.chassis,
    fuel: s.fuel - state.fuel,
    crates: cargoUsed(s.cargo) - cargoUsed(state.cargo),
    towBill: towed.bill,
  }
  return arrive({ ...towed.state, roadEvent: null, roadReport: report })
}

function payCost(state: GameState, cost: RoadCost): GameState {
  const crates = roadCrates(state, cost) ?? []
  return { ...state, cash: state.cash - roadCash(state, cost.cash), fuel: state.fuel - (cost.fuel ?? 0), cargo: giveCrates(state.cargo, crates) }
}

/** Effets d'une option : ICC gagné en gain de route, Santé jamais sous 1 PV, rations dans la limite du réservoir */
function applyOutcome(state: GameState, outcome: RoadOutcome, paid: number): GameState {
  let s: GameState = { ...state, cash: state.cash + roadCash(state, outcome.cash) }
  const icc = outcome.icc ?? 0
  s = icc > 0 ? gainRouteIcc(s, icc).state : { ...s, icc: Math.max(0, s.icc + icc) }
  if (outcome.health) s = changeHealth(s, outcome.health, 1).state
  s = {
    ...s,
    chassis: Math.max(0, s.chassis + (outcome.chassis ?? 0)),
    fuel: Math.min(VEHICLES[s.vehicleId].tank, s.fuel + (outcome.fuel ?? 0)),
  }
  if (outcome.crateTier !== undefined) {
    // Caisse au hasard dans le tier, au prix payé, achetée dans le district d'arrivée (clause anti-arbitrage)
    const rng = createRng(s.rng)
    const tier = outcome.crateTier
    const productId = rng.pick(PRODUCT_IDS.filter((id) => PRODUCTS[id].tier === tier))
    s = { ...s, rng: rng.state, cargo: [...s.cargo, { productId, qty: 1, unitCost: paid, travelled: false, boughtDay: s.day, damaged: false }] }
  }
  return s
}
