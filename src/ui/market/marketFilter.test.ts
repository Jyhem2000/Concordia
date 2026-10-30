import { describe, expect, it } from 'vitest'
import { PRODUCTS } from '../../data/products.ts'
import { filterKey, passesFilter, type MarketFilter } from './marketFilter.ts'

describe('filtres du marché (chap. 7)', () => {
  const tier = PRODUCTS['T2-03'].tier
  const tag = PRODUCTS['T2-03'].tags[0]

  it('garde tout, la soute, un tier ou un tag', () => {
    expect(passesFilter({ kind: 'all' }, 'T2-03', false)).toBe(true)
    expect(passesFilter({ kind: 'owned' }, 'T2-03', false)).toBe(false)
    expect(passesFilter({ kind: 'owned' }, 'T2-03', true)).toBe(true)
    expect(passesFilter({ kind: 'tier', tier }, 'T2-03', false)).toBe(true)
    expect(passesFilter({ kind: 'tier', tier: PRODUCTS['T0-01'].tier }, 'T2-03', false)).toBe(false)
    expect(passesFilter({ kind: 'tag', tag }, 'T2-03', false)).toBe(true)
    expect(passesFilter({ kind: 'tag', tag: 'TAG-LEGAL' }, 'T2-03', false)).toBe(false)
  })

  it('donne une clé distincte à chaque filtre', () => {
    const filters: MarketFilter[] = [{ kind: 'all' }, { kind: 'owned' }, { kind: 'tier', tier }, { kind: 'tag', tag }]
    const keys = filters.map(filterKey)
    expect(new Set(keys).size).toBe(keys.length)
  })
})
