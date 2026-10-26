import { describe, expect, it } from 'vitest'
import { createRng, seedRng } from './rng.ts'

const draw = (seed: number, n: number) => {
  const rng = createRng(seedRng(seed))
  return Array.from({ length: n }, () => rng.next())
}

describe('rng', () => {
  it('produit la même suite pour la même graine', () => {
    expect(draw(42, 20)).toEqual(draw(42, 20))
  })

  it('produit des suites différentes pour des graines différentes', () => {
    expect(draw(1, 20)).not.toEqual(draw(2, 20))
  })

  it("reprend la suite à l'identique depuis un état sauvegardé", () => {
    const rng = createRng(seedRng(7))
    rng.next()
    rng.next()
    const saved = rng.state
    const expected = [rng.next(), rng.next(), rng.next()]

    const resumed = createRng(saved)
    expect([resumed.next(), resumed.next(), resumed.next()]).toEqual(expected)
  })

  it('reste dans [0, 1[', () => {
    for (const value of draw(3, 10_000)) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('int inclut ses deux bornes et répartit uniformément', () => {
    const rng = createRng(seedRng(5))
    const counts = new Map<number, number>()
    for (let i = 0; i < 60_000; i++) {
      const value = rng.int(1, 6)
      counts.set(value, (counts.get(value) ?? 0) + 1)
    }
    expect([...counts.keys()].sort()).toEqual([1, 2, 3, 4, 5, 6])
    for (const count of counts.values()) {
      expect(count).toBeGreaterThan(9_500)
      expect(count).toBeLessThan(10_500)
    }
  })

  it('float reste dans [min, max[', () => {
    const rng = createRng(seedRng(9))
    for (let i = 0; i < 1_000; i++) {
      const value = rng.float(0.7, 1.3)
      expect(value).toBeGreaterThanOrEqual(0.7)
      expect(value).toBeLessThan(1.3)
    }
  })

  it('chance(0) est toujours faux, chance(1) toujours vrai', () => {
    const rng = createRng(seedRng(11))
    for (let i = 0; i < 1_000; i++) {
      expect(rng.chance(0)).toBe(false)
      expect(rng.chance(1)).toBe(true)
    }
  })

  it('pick refuse une liste vide', () => {
    expect(() => createRng(seedRng(1)).pick([])).toThrow()
  })

  it('shuffle garde les éléments sans modifier la liste source', () => {
    const source = [1, 2, 3, 4, 5, 6, 7, 8]
    const shuffled = createRng(seedRng(13)).shuffle(source)
    expect(source).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect([...shuffled].sort()).toEqual(source)
  })
})
