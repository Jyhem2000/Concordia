import { describe, expect, it } from 'vitest'
import { crossedDistricts, shortestRoute } from './map.ts'

describe('itinéraires (chap. 4)', () => {
  it('va directement chez un voisin', () => {
    expect(shortestRoute('D1', 'D2')).toEqual(['D1', 'D2'])
    expect(crossedDistricts(shortestRoute('D1', 'D2'))).toEqual([])
  })

  it('traverse D1, D2 et D5 pour aller de D4 à D6 (exemple du chap. 4)', () => {
    const route = shortestRoute('D4', 'D6')
    expect(route).toHaveLength(5)
    expect(crossedDistricts(route)).toHaveLength(3)
    expect(route[1]).toBe('D1')
    expect(route[3]).toBe('D5')
  })

  it('reste sur place sans rien traverser', () => {
    expect(shortestRoute('D3', 'D3')).toEqual(['D3'])
  })
})
