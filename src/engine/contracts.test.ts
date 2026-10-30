import { describe, expect, it } from 'vitest'
import { CONTRACT } from '../data/locations.ts'
import { PRODUCTS } from '../data/products.ts'
import { ownedQty } from './cargo.ts'
import { drawContract } from './contracts.ts'
import { createRng, seedRng } from './rng.ts'
import { defined, errorOf, gameAt, run } from './test-helpers.ts'
import type { CargoLot, Contract, GameState } from './types.ts'

const contract: Contract = { productId: 'T1-04', qty: 3, to: 'D2', deadline: 5, reward: 1_000 }
const lot = (qty: number): CargoLot => ({ productId: 'T1-04', qty, unitCost: 50, travelled: true, boughtDay: 2, damaged: false })
const stateWith = (patch: Partial<GameState>) => gameAt(4, { cash: 1_000, ...patch })

describe('contrats de la Pègre (chap. 3)', () => {
  it('propose un produit de Tier 1 à 3, hors du district de Viktor, avec sa prime et son délai', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const offer = defined(drawContract(createRng(seedRng(seed)), 3))
      const product = PRODUCTS[offer.productId]
      expect(CONTRACT.tiers).toContain(product.tier)
      expect(offer.qty).toBe(CONTRACT.crates[product.tier])
      expect(offer.to).not.toBe('D1')
      expect(offer.deadline - 3).toBeGreaterThanOrEqual(CONTRACT.delayDays.min)
      expect(offer.deadline - 3).toBeLessThanOrEqual(CONTRACT.delayDays.max)
      expect(offer.reward).toBe(Math.round(offer.qty * product.basePrice * CONTRACT.factor))
    }
  })

  it('s’accepte chez Viktor, de jour, un seul à la fois', () => {
    const accepted = run(stateWith({ districtId: 'D1', contractOffer: contract }), { type: 'acceptContract' })
    expect(accepted.contract).toEqual(contract)
    expect(accepted.contractOffer).toBeNull()
    expect(errorOf(stateWith({ districtId: 'D2', contractOffer: contract }), { type: 'acceptContract' })).toBe('not-at-location')
    expect(errorOf(stateWith({ districtId: 'D1', contractOffer: contract, contract }), { type: 'acceptContract' })).toBe('contract-active')
  })

  it('se livre à destination avec assez de caisses : la prime contre les caisses', () => {
    const delivered = run(stateWith({ districtId: 'D2', contract, cargo: [lot(5)] }), { type: 'deliverContract' })
    expect(delivered.cash).toBe(1_000 + contract.reward)
    expect(ownedQty(delivered.cargo, 'T1-04')).toBe(2)
    expect(delivered.contract).toBeNull()
    expect(errorOf(stateWith({ districtId: 'D3', contract, cargo: [lot(5)] }), { type: 'deliverContract' })).toBe('not-contract-district')
    expect(errorOf(stateWith({ districtId: 'D2', contract, cargo: [lot(2)] }), { type: 'deliverContract' })).toBe('not-enough-cargo')
  })

  it('ajoute une pénalité à la dette quand le délai est passé', () => {
    const late = run(gameAt(contract.deadline, { contract }), { type: 'sleep' })
    const penalty = Math.round(contract.reward * CONTRACT.failDebtShare)
    expect(late.contract).toBeNull()
    expect(late.briefing?.contractFailed).toBe(penalty)
    // Dette de départ, intérêts du matin compris, plus la pénalité
    expect(late.debt).toBeGreaterThanOrEqual(gameAt(1).debt + penalty)
  })
})
