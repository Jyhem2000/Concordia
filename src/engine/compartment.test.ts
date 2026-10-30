import { describe, expect, it } from 'vitest'
import { VEHICLES } from '../data/vehicles.ts'
import { ownedQty } from './cargo.ts'
import { displacedBy } from './compartment.ts'
import { hiddenCargo } from './interception.ts'
import { errorOf, gameAt, run } from './test-helpers.ts'
import type { CargoLot, ProductId } from './types.ts'

const lot = (productId: ProductId, qty: number): CargoLot => ({ productId, qty, unitCost: 1, travelled: true, boughtDay: 2, damaged: false })

// VEH-01 : un double fond plus petit que la soute de ces tests
const capacity = VEHICLES['VEH-01'].hiddenCompartment
const cargo = [lot('T1-01', capacity), lot('T2-03', 1), lot('T3-01', capacity)]
const hiddenQty = (state: Parameters<typeof hiddenCargo>[0], id: ProductId) => ownedQty(hiddenCargo(state).hidden, id)

describe('choix du double fond (chap. 4)', () => {
  it('cache par défaut les caisses illégales les plus chères', () => {
    const state = gameAt(3, { cargo })
    expect(hiddenQty(state, 'T3-01')).toBe(capacity)
    expect(hiddenQty(state, 'T1-01')).toBe(0)
  })

  it('fait passer le produit envoyé avant le remplissage par défaut, le dernier envoyé en premier', () => {
    const sent = run(gameAt(3, { cargo }), { type: 'compartment', productId: 'T1-01', hide: true })
    expect(hiddenQty(sent, 'T1-01')).toBe(capacity)
    expect(hiddenQty(sent, 'T3-01')).toBe(0)
    const both = run(sent, { type: 'compartment', productId: 'T2-03', hide: true })
    expect(hiddenQty(both, 'T2-03')).toBe(1)
    expect(hiddenQty(both, 'T1-01')).toBe(capacity - 1)
  })

  it('annonce les caisses que l’envoi délogerait', () => {
    expect(displacedBy(gameAt(3, { cargo }), 'T1-01')).toEqual([{ productId: 'T3-01', qty: capacity }])
  })

  it('ne cache plus un produit retiré, même le plus cher', () => {
    const removed = run(gameAt(3, { cargo }), { type: 'compartment', productId: 'T3-01', hide: false })
    expect(hiddenQty(removed, 'T3-01')).toBe(0)
    expect(hiddenQty(removed, 'T2-03')).toBe(1)
  })

  it('refuse le légal, l’encombrant et ce qui n’est pas en soute', () => {
    const state = gameAt(3, { cargo: [...cargo, lot('T0-01', 1), lot('T4-06', 1)] })
    expect(errorOf(state, { type: 'compartment', productId: 'T0-01', hide: true })).toBe('cannot-hide')
    expect(errorOf(state, { type: 'compartment', productId: 'T4-06', hide: true })).toBe('cannot-hide')
    expect(errorOf(state, { type: 'compartment', productId: 'T2-01', hide: true })).toBe('not-enough-cargo')
  })

  it('oublie le choix quand le produit quitte la soute', () => {
    const sent = run(gameAt(3, { cargo }), { type: 'compartment', productId: 'T2-03', hide: true })
    expect(sent.compartment.pinned).toEqual(['T2-03'])
    const sold = run(sent, { type: 'sell', productId: 'T2-03', qty: 1 })
    expect(sold.compartment.pinned).toEqual([])
  })
})
