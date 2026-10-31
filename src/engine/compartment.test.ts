import { describe, expect, it } from 'vitest'
import { VEHICLES } from '../data/vehicles.ts'
import { ownedQty } from './cargo.ts'
import { fillCompartment } from './compartment.ts'
import { hiddenCargo } from './interception.ts'
import { errorOf, gameAt, run } from './test-helpers.ts'
import type { CargoLot, GameState, ProductId } from './types.ts'

const lot = (productId: ProductId, qty: number): CargoLot => ({ productId, qty, unitCost: 1, travelled: true, boughtDay: 2, damaged: false })

// VEH-01 : un double fond plus petit que la soute de ces tests
const capacity = VEHICLES['VEH-01'].hiddenCompartment
const hiddenQty = (state: GameState, id: ProductId) => ownedQty(hiddenCargo(state).hidden, id)
/** Boutique de Hives au Jour 1, assez riche pour acheter */
const shop = (patch: Partial<GameState> = {}) => gameAt(1, { cash: 100_000, ...patch })

describe('double fond (chap. 4)', () => {
  it('range de lui-même les caisses illégales achetées, jamais le légal', () => {
    const state = run(shop(), { type: 'buy', productId: 'T1-04', qty: capacity + 1 }, { type: 'buy', productId: 'T0-01', qty: 1 })
    expect(state.compartment).toEqual({ 'T1-04': capacity })
    expect(hiddenQty(state, 'T1-04')).toBe(capacity)
  })

  it('déloge les caisses cachées moins chères pour un produit plus cher, et l’annonce', () => {
    const cheap = fillCompartment(gameAt(3, { cargo: [lot('T1-01', capacity)] }))
    expect(cheap.compartment).toEqual({ 'T1-01': capacity })
    const state = run({ ...cheap, cash: 100_000 }, { type: 'buy', productId: 'T1-04', qty: 1 })
    expect(state.compartment).toEqual({ 'T1-01': capacity - 1, 'T1-04': 1 })
    expect(state.compartmentNotice).toEqual({ productId: 'T1-04', displaced: [{ productId: 'T1-01', qty: 1 }] })
    // L'avertissement ne dure qu'une action
    expect(run(state, { type: 'buy', productId: 'T0-01', qty: 1 }).compartmentNotice).toBeNull()
  })

  it('libère les places au retrait, et ne cache à la main que dans une place libre', () => {
    const full = fillCompartment(gameAt(3, { cargo: [lot('T1-01', capacity), lot('T2-03', 1)] }))
    expect(errorOf(full, { type: 'compartment', productId: 'T1-01', hide: true })).toBe('compartment-full')
    const removed = run(full, { type: 'compartment', productId: 'T2-03', hide: false })
    expect(removed.compartment['T2-03']).toBeUndefined()
    const hidden = run(removed, { type: 'compartment', productId: 'T1-01', hide: true })
    expect(hiddenQty(hidden, 'T1-01')).toBe(capacity)
  })

  it('sort les caisses cachées une à une, pour panacher le double fond', () => {
    const full = fillCompartment(gameAt(3, { cargo: [lot('T3-01', capacity), lot('T2-03', capacity)] }))
    expect(hiddenQty(full, 'T3-01')).toBe(capacity)
    const one = run(full, { type: 'compartment', productId: 'T3-01', hide: false })
    expect(hiddenQty(one, 'T3-01')).toBe(capacity - 1)
    const mixed = run(one, { type: 'compartment', productId: 'T2-03', hide: true })
    expect(hiddenQty(mixed, 'T2-03')).toBe(1)
    expect(errorOf(mixed, { type: 'compartment', productId: 'T2-03', hide: true })).toBe('compartment-full')
  })

  it('refuse le légal, l’encombrant et ce qui n’est pas en soute', () => {
    const state = gameAt(3, { cargo: [lot('T0-01', 1), lot('T4-06', 1)] })
    expect(errorOf(state, { type: 'compartment', productId: 'T0-01', hide: true })).toBe('cannot-hide')
    expect(errorOf(state, { type: 'compartment', productId: 'T4-06', hide: true })).toBe('cannot-hide')
    expect(errorOf(state, { type: 'compartment', productId: 'T2-01', hide: true })).toBe('not-enough-cargo')
  })

  it('vend les caisses visibles d’abord, et ne garde que des caisses encore en soute', () => {
    const state = fillCompartment(gameAt(3, { cargo: [lot('T1-04', capacity + 1)] }))
    const sold = run(state, { type: 'sell', productId: 'T1-04', qty: 2 })
    expect(sold.compartment).toEqual({ 'T1-04': capacity - 1 })
  })
})
