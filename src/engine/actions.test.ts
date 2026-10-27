import { describe, expect, it } from 'vitest'
import { GAME_LENGTH_DAYS, SIPHON } from '../data/balance.ts'
import { VEHICLES } from '../data/vehicles.ts'
import { applyAction, canSiphon, fuelPrice, maxBuy, planTravel, type Action } from './actions.ts'
import { cargoUsed, ownedQty } from './cargo.ts'
import { quote } from './market.ts'
import { createInitialState } from './state.ts'
import type { GameState, ProductId } from './types.ts'

const run = (state: GameState, ...actions: Action[]): GameState =>
  actions.reduce((current, action) => {
    const result = applyAction(current, action)
    if (!result.ok) throw new Error(`${action.type} : ${result.error}`)
    return result.state
  }, state)

const errorOf = (state: GameState, action: Action) => {
  const result = applyAction(state, action)
  return result.ok ? null : result.error
}

const start = createInitialState(2024)
const cheapest = (state: GameState): ProductId =>
  (Object.keys(state.markets[state.districtId].stock) as ProductId[]).sort(
    (a, b) => quote(state, state.districtId, a) - quote(state, state.districtId, b),
  )[0]

describe('achat et vente', () => {
  it('débite le Cash-Puce, remplit la soute et vide le stock', () => {
    const id = cheapest(start)
    const state = run(start, { type: 'buy', productId: id, qty: 2 })
    expect(state.cash).toBe(start.cash - 2 * quote(start, 'D1', id))
    expect(ownedQty(state.cargo, id)).toBe(2)
    expect(state.markets.D1.stock[id]).toBe(start.markets.D1.stock[id]! - 2)
  })

  it('refuse un produit hors boutique, une soute pleine ou un achat trop cher', () => {
    const shop = Object.keys(start.markets.D1.stock)
    const absent = (['T4-06', 'T4-01', 'T3-03'] as ProductId[]).find((id) => !shop.includes(id))!
    expect(errorOf(start, { type: 'buy', productId: absent, qty: 1 })).toBe('not-for-sale')
    expect(errorOf({ ...start, cash: 0 }, { type: 'buy', productId: cheapest(start), qty: 1 })).toBe('not-enough-cash')
    const full = { ...start, cargo: [{ productId: 'T0-01' as const, qty: VEHICLES['VEH-01'].cargo, unitCost: 1, travelled: false }] }
    expect(errorOf(full, { type: 'buy', productId: cheapest(start), qty: 1 })).toBe('cargo-full')
    expect(maxBuy(full, cheapest(start))).toBe(0)
  })

  it('revend avec la commission : acheter puis revendre sur place fait perdre de l’argent', () => {
    const id = cheapest(start)
    const state = run(start, { type: 'buy', productId: id, qty: 3 }, { type: 'sell', productId: id, qty: 3 })
    expect(cargoUsed(state.cargo)).toBe(0)
    expect(state.cash).toBeLessThan(start.cash)
  })

  it('consomme la demande restante', () => {
    const state: GameState = { ...start, cargo: [{ productId: 'T2-01', qty: 3, unitCost: 1, travelled: true }] }
    const after = run(state, { type: 'sell', productId: 'T2-01', qty: 3 })
    expect(after.markets.D1.demand['T2-01']).toBe(state.markets.D1.demand['T2-01']! - 3)
  })

  it('refuse les quantités invalides', () => {
    expect(errorOf(start, { type: 'buy', productId: cheapest(start), qty: 0 })).toBe('invalid-quantity')
    expect(errorOf(start, { type: 'sell', productId: 'T0-01', qty: 1.5 })).toBe('invalid-quantity')
  })
})

describe('trajets', () => {
  it('consomme le carburant, marque la soute comme ayant voyagé et mémorise les cours', () => {
    const id = cheapest(start)
    const state = run(start, { type: 'buy', productId: id, qty: 1 }, { type: 'travel', to: 'D2' })
    expect(state.districtId).toBe('D2')
    expect(state.fuel).toBe(start.fuel - VEHICLES['VEH-01'].fuelPerTrip.day)
    expect(state.cargo.every((lot) => lot.travelled)).toBe(true)
    expect(state.memory.D2?.day).toBe(1)
  })

  it('facture les districts traversés', () => {
    // D1 → D6 traverse D2 et D5
    expect(planTravel(start, 'D6').fuelCost).toBe(VEHICLES['VEH-01'].fuelPerTrip.day + 2)
  })

  it('autorise 1 trajet de jour et 1 de nuit', () => {
    const afterDay = run(start, { type: 'travel', to: 'D2' })
    expect(errorOf(afterDay, { type: 'travel', to: 'D1' })).toBe('trip-done')
    const afterNight = run(afterDay, { type: 'forceCurfew' }, { type: 'travel', to: 'D1' })
    expect(afterNight.districtId).toBe('D1')
    expect(errorOf(afterNight, { type: 'travel', to: 'D2' })).toBe('trip-done')
  })

  it('refuse un trajet sans assez de carburant', () => {
    expect(errorOf({ ...start, fuel: 0 }, { type: 'travel', to: 'D2' })).toBe('not-enough-fuel')
  })
})

describe('carburant', () => {
  it('fait le plein au prix local indexé', () => {
    const state = run({ ...start, fuel: 0 }, { type: 'refuel', qty: 2 })
    expect(state.fuel).toBe(2)
    expect(state.cash).toBe(start.cash - 2 * fuelPrice(start))
    expect(errorOf(start, { type: 'refuel', qty: 1 })).toBe('tank-full')
  })

  it('n’autorise le siphonage qu’en dernier recours', () => {
    expect(canSiphon(start)).toBe(false)
    const stuck: GameState = { ...start, fuel: 0, cash: 0 }
    const state = run(stuck, { type: 'siphon' })
    expect(state.fuel).toBe(SIPHON.fuel)
    expect(state.icc).toBe(start.icc - SIPHON.iccLoss)
    expect(state.dayTripDone).toBe(true)
  })
})

describe('journées', () => {
  it('passe au matin suivant avec de nouveaux marchés', () => {
    const state = run(start, { type: 'travel', to: 'D2' }, { type: 'sleep' })
    expect(state).toMatchObject({ day: 2, phase: 'day', dayTripDone: false, nightTripDone: false })
    expect(state.markets.D1.noise).not.toEqual(start.markets.D1.noise)
    expect(state.memory.D2?.day).toBe(2)
  })

  it('verrouille le couvre-feu le lendemain d’une nuit blanche', () => {
    const night = run(start, { type: 'forceCurfew' })
    expect(errorOf(night, { type: 'forceCurfew' })).toBe('not-daytime')
    const nextDay = run(night, { type: 'sleep' })
    expect(errorOf(nextDay, { type: 'forceCurfew' })).toBe('exhausted')
    const dayAfter = run(nextDay, { type: 'sleep' })
    expect(errorOf(dayAfter, { type: 'forceCurfew' })).toBeNull()
  })

  it('termine la partie après le Jour 30', () => {
    let state = start
    for (let day = 1; day < GAME_LENGTH_DAYS; day++) state = run(state, { type: 'sleep' })
    expect(state.day).toBe(GAME_LENGTH_DAYS)
    state = run(state, { type: 'sleep' })
    expect(state.status).toBe('finished')
    expect(errorOf(state, { type: 'sleep' })).toBe('game-over')
  })

  it('est déterministe pour une même graine', () => {
    const actions: Action[] = [{ type: 'travel', to: 'D3' }, { type: 'sleep' }, { type: 'travel', to: 'D5' }, { type: 'sleep' }]
    expect(run(createInitialState(5), ...actions)).toEqual(run(createInitialState(5), ...actions))
  })
})
