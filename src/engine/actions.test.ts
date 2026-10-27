import { describe, expect, it } from 'vitest'
import { GAME_LENGTH_DAYS, GRINDER, LOAN_CEILING, OFFSHORE_DEPOSIT_FACTOR, SIPHON, SURVIVAL_ADVANCE } from '../data/balance.ts'
import { PRODUCTS } from '../data/products.ts'
import { VEHICLES } from '../data/vehicles.ts'
import { canSiphon, checkService, fuelPrice, maxBuy, maxRepay, planTravel, type Action } from './actions.ts'
import { cargoUsed, ownedQty } from './cargo.ts'
import { quote, shopProducts } from './market.ts'
import { createInitialState } from './state.ts'
import { defined, errorOf, gameAt, HIGH_ROLL_RNG, play, run } from './test-helpers.ts'
import type { GameState, ProductId } from './types.ts'

// Tirage haut : le premier trajet ne tombe sur aucun barrage
const start: GameState = { ...createInitialState(2024), rng: HIGH_ROLL_RNG }
const cheapest = (state: GameState): ProductId =>
  shopProducts(state.markets[state.districtId]).sort((a, b) => quote(state, state.districtId, a) - quote(state, state.districtId, b))[0]

describe('achat et vente', () => {
  it('débite le Cash-Puce, remplit la soute et vide le stock', () => {
    const id = cheapest(start)
    const state = run(start, { type: 'buy', productId: id, qty: 2 })
    expect(state.cash).toBe(start.cash - 2 * quote(start, 'D1', id))
    expect(ownedQty(state.cargo, id)).toBe(2)
    expect(state.markets.D1.stock[id]).toBe(defined(start.markets.D1.stock[id]) - 2)
  })

  it('refuse un produit hors boutique, une soute pleine ou un achat trop cher', () => {
    const shop = shopProducts(start.markets.D1)
    const candidates: ProductId[] = ['T4-06', 'T4-01', 'T3-03']
    const absent = defined(
      candidates.find((id) => !shop.includes(id)),
      'produit hors boutique',
    )
    expect(errorOf(start, { type: 'buy', productId: absent, qty: 1 })).toBe('not-for-sale')
    expect(errorOf({ ...start, cash: 0 }, { type: 'buy', productId: cheapest(start), qty: 1 })).toBe('not-enough-cash')
    const full: GameState = {
      ...start,
      cargo: [{ productId: 'T0-01', qty: VEHICLES['VEH-01'].cargo, unitCost: 1, travelled: false, boughtDay: 1, damaged: false }],
    }
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
    const state: GameState = { ...start, cargo: [{ productId: 'T2-01', qty: 3, unitCost: 1, travelled: true, boughtDay: 1, damaged: false }] }
    const after = run(state, { type: 'sell', productId: 'T2-01', qty: 3 })
    expect(after.markets.D1.demand['T2-01']).toBe(defined(state.markets.D1.demand['T2-01']) - 3)
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
    expect(state.memory.D2?.at(-1)?.day).toBe(1)
  })

  it('facture les districts traversés', () => {
    // D1 → D6 traverse D2 et D5
    expect(planTravel(start, 'D6').fuelCost).toBe(VEHICLES['VEH-01'].fuelPerTrip.day + 2)
  })

  it('autorise 1 trajet de jour et 1 de nuit', () => {
    const afterDay = play(start, { type: 'travel', to: 'D2' })
    expect(errorOf(afterDay, { type: 'travel', to: 'D1' })).toBe('trip-done')
    const afterNight = play(afterDay, { type: 'forceCurfew' }, { type: 'travel', to: 'D1' })
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
    expect(state.memory.D2?.at(-1)?.day).toBe(2)
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
    expect(play(createInitialState(5), ...actions)).toEqual(play(createInitialState(5), ...actions))
  })
})

describe('guichets : dette et compte offshore', () => {
  it('ouvrent de jour, dans leur district seulement', () => {
    expect(checkService(gameAt(2, { districtId: 'D1' }), 'debt')).toBeNull()
    expect(checkService(gameAt(2, { districtId: 'D5' }), 'offshore')).toBeNull()
    expect(errorOf(gameAt(2, { districtId: 'D2' }), { type: 'repay', amount: 100 })).toBe('not-at-location')
    expect(errorOf(gameAt(2, { phase: 'night' }), { type: 'repay', amount: 100 })).toBe('location-closed')
    expect(errorOf(gameAt(2), { type: 'deposit', amount: 100 })).toBe('not-at-location')
  })

  it('avancent de quoi repartir tant que la dette initiale court, une seule fois sur la partie', () => {
    const broke = gameAt(2, { cash: 2 })
    const advanced = run(broke, { type: 'borrow', amount: SURVIVAL_ADVANCE - 500 })
    expect(advanced).toMatchObject({ cash: SURVIVAL_ADVANCE - 498, debt: start.debt + SURVIVAL_ADVANCE - 500, advanced: SURVIVAL_ADVANCE - 500 })
    // Rembourser ne reconstitue pas l'avance
    const repaid = run(advanced, { type: 'repay', amount: 1_000 })
    expect(errorOf(repaid, { type: 'borrow', amount: 501 })).toBe('advance-used')
    expect(run(repaid, { type: 'borrow', amount: 500 }).advanced).toBe(SURVIVAL_ADVANCE)
  })

  it("soldent la dette initiale pour de bon et débloquent l'emprunt tactique", () => {
    const rich = gameAt(2, { cash: start.debt + 500 })
    expect(maxRepay(rich)).toBe(start.debt)
    expect(errorOf(rich, { type: 'repay', amount: start.debt + 1 })).toBe('invalid-amount')

    const paid = run(rich, { type: 'repay', amount: start.debt })
    expect(paid).toMatchObject({ debt: 0, cash: 500, initialDebtPaid: true })
    expect(errorOf(paid, { type: 'repay', amount: 1 })).toBe('no-debt')

    // Statut définitif : réemprunter ne le retire pas
    const loan = run(paid, { type: 'borrow', amount: 1_000 })
    expect(loan).toMatchObject({ debt: 1_000, cash: 1_500, initialDebtPaid: true })
    expect(errorOf(loan, { type: 'borrow', amount: LOAN_CEILING })).toBe('loan-ceiling')
  })

  it('créditent les dépôts commission déduite et rendent les retraits en Cash-Puce', () => {
    const atLaundry = gameAt(2, { districtId: 'D5' })
    const deposited = run(atLaundry, { type: 'deposit', amount: 1_000 })
    expect(deposited.offshore.deposited).toBe(Math.round(1_000 * OFFSHORE_DEPOSIT_FACTOR))
    expect(deposited.cash).toBe(atLaundry.cash - 1_000)

    const withdrawn = run(deposited, { type: 'withdraw', amount: 100 })
    expect(withdrawn.cash).toBe(deposited.cash + 100)
    expect(errorOf(atLaundry, { type: 'withdraw', amount: 1 })).toBe('not-enough-offshore')
    expect(errorOf(atLaundry, { type: 'deposit', amount: 0 })).toBe('invalid-amount')
  })
})

describe('produits utilisables et Hachoir', () => {
  const crates = (productId: ProductId, qty: number, boughtDay = 1): GameState['cargo'][number] => ({
    productId,
    qty,
    unitCost: 1,
    travelled: true,
    boughtDay,
    damaged: false,
  })

  it('refroidit le moteur avec de l’eau la nuit au lieu d’user le châssis, si le joueur le veut', () => {
    const night = gameAt(2, { phase: 'night', rng: HIGH_ROLL_RNG, cargo: [crates('T0-02', 3)] })
    const cooled = run(night, { type: 'travel', to: 'D2' })
    expect(cooled.chassis).toBe(VEHICLES['VEH-01'].maxChassis)
    expect(ownedQty(cooled.cargo, 'T0-02')).toBe(3 - defined(PRODUCTS['T0-02'].cooling).crates)
    expect(cooled.tripReport).toMatchObject({ chassisWear: 0, coolingCrates: defined(PRODUCTS['T0-02'].cooling).crates, heatHealth: 0 })
    const worn = run({ ...night, autoCooling: false }, { type: 'travel', to: 'D2' })
    expect(worn.chassis).toBeLessThan(VEHICLES['VEH-01'].maxChassis)
  })

  it('autorise une 2e nuit blanche avec une boisson, jamais une 3e', () => {
    const sleepless = defined(PRODUCTS['T2-05'].sleeplessNight)
    const exhausted = gameAt(5, { lastCurfewDay: 4, curfewStreak: 1, cargo: [crates('T2-05', 2)] })
    expect(errorOf(exhausted, { type: 'forceCurfew' })).toBe('exhausted')
    const second = run(exhausted, { type: 'forceCurfew', drink: 'T2-05' })
    expect(second).toMatchObject({ phase: 'night', curfewStreak: 2, health: 100 - sleepless.healthLoss })
    expect(errorOf({ ...second, day: 6, phase: 'day' }, { type: 'forceCurfew', drink: 'T2-05' })).toBe('third-night')
    expect(errorOf({ ...exhausted, health: sleepless.minHealth }, { type: 'forceCurfew', drink: 'T2-05' })).toBe('too-weak')
  })

  it('restaure l’ICC hors plafond une seule fois par partie', () => {
    const state = gameAt(5, { icc: 40, iccRouteGains: 99, cargo: [crates('T4-03', 2)] })
    const restored = run(state, { type: 'useProduct', productId: 'T4-03' })
    expect(restored.icc).toBe(40 + defined(PRODUCTS['T4-03'].iccRestore))
    expect(errorOf(restored, { type: 'useProduct', productId: 'T4-03' })).toBe('already-used')
    expect(errorOf(state, { type: 'useProduct', productId: 'T2-01' })).toBe('not-usable')
  })

  it('fait racheter les périssables dégradés par le Hachoir, au profit de la dette puis du Cash-Puce', () => {
    const state = gameAt(5, { debt: 100, cash: 0, cargo: [crates('T3-01', 6, 2), crates('T3-01', 2, 5)] })
    expect(errorOf(state, { type: 'grind', productId: 'T3-01', qty: 7 })).toBe('not-grindable')
    expect(errorOf(state, { type: 'grind', productId: 'T3-01', qty: GRINDER.dailyLimit + 1 })).toBe('grinder-full')
    const ground = run(state, { type: 'grind', productId: 'T3-01', qty: 2 })
    expect(ground.debt).toBe(0)
    expect(ground.cash).toBeGreaterThan(0)
    expect(ownedQty(ground.cargo, 'T3-01')).toBe(6)
    expect(errorOf({ ...state, districtId: 'D2' }, { type: 'grind', productId: 'T3-01', qty: 1 })).toBe('not-at-location')
  })
})
