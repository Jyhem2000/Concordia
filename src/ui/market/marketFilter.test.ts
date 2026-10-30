import { describe, expect, it } from 'vitest'
import { PRODUCTS } from '../../data/products.ts'
import type { ProductId } from '../../engine/types.ts'
import { NO_FILTER, passesFilter, sortProducts } from './marketFilter.ts'

describe('filtres du marché (chap. 7)', () => {
  const tier = PRODUCTS['T2-03'].tier
  const tag = PRODUCTS['T2-03'].tags[0]

  it('garde tout sans filtre', () => {
    expect(passesFilter(NO_FILTER, 'T2-03')).toBe(true)
  })

  it('cumule le tier et le tag', () => {
    expect(passesFilter({ tier, tag: null }, 'T2-03')).toBe(true)
    expect(passesFilter({ tier: null, tag }, 'T2-03')).toBe(true)
    expect(passesFilter({ tier, tag }, 'T2-03')).toBe(true)
    expect(passesFilter({ tier: PRODUCTS['T0-01'].tier, tag }, 'T2-03')).toBe(false)
    expect(passesFilter({ tier, tag: 'TAG-LEGAL' }, 'T2-03')).toBe(false)
  })
})

describe('tri du marché (chap. 7)', () => {
  const ids: ProductId[] = ['T2-03', 'T0-01', 'T1-04']
  const price = (id: string) => ({ 'T2-03': 500, 'T0-01': 10, 'T1-04': 90 })[id] ?? 0
  const name = (id: string) => ({ 'T2-03': 'Vinyles', 'T0-01': 'Bio-Briques', 'T1-04': 'Nouilles' })[id] ?? ''

  it('trie par tier, ou par prix dans les deux sens, le nom départageant', () => {
    expect(sortProducts(ids, 'tier', price, name)).toEqual(['T0-01', 'T1-04', 'T2-03'])
    expect(sortProducts(ids, 'priceAsc', price, name)).toEqual(['T0-01', 'T1-04', 'T2-03'])
    expect(sortProducts(ids, 'priceDesc', price, name)).toEqual(['T2-03', 'T1-04', 'T0-01'])
  })
})
