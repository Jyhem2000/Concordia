import { describe, expect, it } from 'vitest'
import { PRODUCTS } from '../../data/products.ts'
import { NO_FILTER, passesFilter } from './marketFilter.ts'

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
