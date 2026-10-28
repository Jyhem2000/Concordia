import { DISTRICT_IDS } from '../src/data/districts.ts'
import { KARMA } from '../src/data/locations.ts'
import { PRODUCT_IDS } from '../src/data/products.ts'
import { CREW, MODULES, VEHICLES } from '../src/data/vehicles.ts'
import { applyAction, maxBuy, type Action } from '../src/engine/actions.ts'
import { ownedQty } from '../src/engine/cargo.ts'
import { minimumOffer } from '../src/engine/interception.ts'
import { keysOf } from '../src/engine/records.ts'
import type { GameState, InterceptionMove } from '../src/engine/types.ts'

/*
 * Actions candidates d'une partie (chap. 9) : un large échantillon de ce que le joueur peut tenter,
 * filtré par le moteur lui-même. Sert au bot Aléatoire et aux tests de robustesse.
 */

const MOVES: readonly InterceptionMove[] = ['search', 'bluff', 'bribe', 'flee', 'eject', 'payToll', 'payTollInKind', 'refuseToll']

function candidates(state: GameState): Action[] {
  if (state.interception) {
    return MOVES.map((move) =>
      move === 'bribe' ? { type: 'intercept', move, offer: { cash: minimumOffer(state), crates: [] } } : { type: 'intercept', move },
    )
  }
  if (state.roadEvent) {
    return [
      { type: 'road', choice: 'a', pay: 0 },
      { type: 'road', choice: 'a', pay: 1 },
      { type: 'road', choice: 'b', pay: 0 },
    ]
  }
  const owned = PRODUCT_IDS.filter((id) => ownedQty(state.cargo, id) > 0)
  const amount = Math.max(1, Math.floor(state.cash / 2))
  return [
    ...PRODUCT_IDS.flatMap((productId): Action[] => [
      { type: 'buy', productId, qty: 1 },
      { type: 'buy', productId, qty: Math.max(1, maxBuy(state, productId)) },
    ]),
    ...owned.flatMap((productId): Action[] => [
      { type: 'sell', productId, qty: 1 },
      { type: 'sell', productId, qty: ownedQty(state.cargo, productId) },
      { type: 'useProduct', productId },
      { type: 'grind', productId, qty: 1 },
      { type: 'auction', productId },
    ]),
    ...DISTRICT_IDS.map((to): Action => ({ type: 'travel', to })),
    { type: 'refuel', qty: 1 },
    { type: 'sleep' },
    { type: 'acceptDelivery' },
    { type: 'sellAll', profitableOnly: true },
    { type: 'sellAll', profitableOnly: false },
    { type: 'forceCurfew' },
    { type: 'forceCurfew', mission: true },
    ...owned.map((drink): Action => ({ type: 'forceCurfew', drink })),
    { type: 'siphon' },
    { type: 'repay', amount },
    { type: 'borrow', amount: 1_000 },
    { type: 'deposit', amount },
    { type: 'withdraw', amount: 1_000 },
    ...keysOf(VEHICLES).map((vehicleId): Action => ({ type: 'buyVehicle', vehicleId })),
    ...keysOf(MODULES).flatMap((moduleId): Action[] => [
      { type: 'buyModule', moduleId },
      { type: 'mountModule', moduleId, mount: true },
      { type: 'mountModule', moduleId, mount: false },
    ]),
    { type: 'repair', pv: 10 },
    ...keysOf(CREW).map((crewId): Action => ({ type: 'hireCrew', crewId })),
    { type: 'dismissCrew' },
    { type: 'setPayInKind', enabled: !state.crew.payInKind },
    { type: 'setAutoCooling', enabled: !state.autoCooling },
    ...KARMA.tags.map((tag): Action => ({ type: 'influence', tag })),
    { type: 'morgue', service: 'pass' },
    { type: 'morgue', service: 'surgery' },
    { type: 'morgue', service: 'certificate' },
    { type: 'prophecy' },
    { type: 'forge', card: { kind: 'informant' } },
    { type: 'blackmail', inKind: false },
    { type: 'blackmail', inKind: true },
    { type: 'vipRequest' },
    { type: 'vipDeliver' },
  ]
}

/** Actions que le moteur accepte maintenant */
export function legalActions(state: GameState): Action[] {
  return candidates(state).filter((action) => applyAction(state, action).ok)
}
