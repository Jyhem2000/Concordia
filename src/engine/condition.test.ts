import { describe, expect, it } from 'vitest'
import { DAMAGED_FACTOR, FRESHNESS } from '../data/balance.ts'
import { PRODUCTS } from '../data/products.ts'
import { TAGS } from '../data/tags.ts'
import { breakOnFlee, breakOnShock, crateValue, explodeFlammable, freshnessOf, paymentValue, removeRotten } from './condition.ts'
import { saleQuote } from './market.ts'
import { createRng } from './rng.ts'
import { sleep } from './routine.ts'
import { defined, gameAt, HIGH_ROLL_RNG, LOW_ROLL_RNG } from './test-helpers.ts'
import type { CargoLot, ProductId } from './types.ts'

const lot = (productId: ProductId, qty: number, boughtDay: number, damaged = false): CargoLot => ({
  productId,
  qty,
  unitCost: 1,
  travelled: true,
  boughtDay,
  damaged,
})

/** Rng dont tous les tirages sont sous `p` (succès) ou au-dessus (échec) : une graine suffit pour un seul tirage */
const allBelow = () => createRng(LOW_ROLL_RNG)
const allAbove = () => createRng(HIGH_ROLL_RNG)

describe('fraîcheur des périssables', () => {
  const meat = 'T3-01'

  it("suit le cycle : Extra-Frais jusqu'à 20h00 le jour d'achat, puis Standard, Faisandé, Avarié", () => {
    expect(freshnessOf(gameAt(5), lot(meat, 1, 5))).toBe('extra')
    expect(freshnessOf(gameAt(5, { phase: 'night' }), lot(meat, 1, 5))).toBe('standard')
    expect(freshnessOf(gameAt(5, { dayOver: true }), lot(meat, 1, 5))).toBe('standard')
    expect(freshnessOf(gameAt(6), lot(meat, 1, 5))).toBe('standard')
    expect(freshnessOf(gameAt(5 + FRESHNESS.gamey.fromAge), lot(meat, 1, 5))).toBe('gamey')
    expect(freshnessOf(gameAt(5 + FRESHNESS.spoiled.fromAge), lot(meat, 1, 5))).toBe('spoiled')
    expect(freshnessOf(gameAt(5), lot('T2-01', 1, 1))).toBeNull()
  })

  it('pèse sur le prix de vente via le savoir-faire', () => {
    const fresh = saleQuote(gameAt(6, { cargo: [lot(meat, 1, 5)] }), meat, 1).total
    const gamey = saleQuote(gameAt(5 + FRESHNESS.gamey.fromAge, { cargo: [lot(meat, 1, 5)], markets: gameAt(6).markets }), meat, 1).total
    expect(gamey).toBeCloseTo(fresh * FRESHNESS.gamey.factor, -1)
  })

  it('détruit les lots pourris à 06h00 et le note au briefing', () => {
    const rotting = gameAt(10, { cargo: [lot(meat, 3, 10 - FRESHNESS.rottenFromAge + 1), lot('T2-01', 2, 1)] })
    const morning = sleep(rotting)
    expect(morning.briefing?.rotten).toBe(3)
    expect(morning.cargo).toEqual([lot('T2-01', 2, 1)])
    expect(removeRotten(gameAt(2, { cargo: [lot(meat, 1, 1)] })).rotten).toBe(0)
  })
})

describe('valeur en paiement', () => {
  it("vaut le prix de base, réduit par la casse et la fraîcheur, jamais augmenté par l'Extra-Frais", () => {
    const base = PRODUCTS['T3-01'].basePrice
    expect(crateValue(gameAt(5), lot('T3-01', 1, 5))).toBe(base)
    expect(crateValue(gameAt(5 + FRESHNESS.gamey.fromAge), lot('T3-01', 1, 5))).toBeCloseTo(base * FRESHNESS.gamey.factor)
    expect(crateValue(gameAt(5), lot('T2-03', 1, 1, true))).toBe(PRODUCTS['T2-03'].basePrice * DAMAGED_FACTOR)
  })

  it('compte les lots qui partiraient, les plus anciens d’abord', () => {
    const state = gameAt(5, { cargo: [lot('T2-03', 1, 1, true), lot('T2-03', 1, 2)] })
    expect(paymentValue(state, [{ productId: 'T2-03', qty: 1 }])).toBe(PRODUCTS['T2-03'].basePrice * DAMAGED_FACTOR)
  })
})

describe('casse et explosions', () => {
  it('casse les fragiles en fuite réussie, en lot à part', () => {
    const { cargo, damaged } = breakOnFlee([lot('T2-03', 1, 1), lot('T2-01', 2, 1)], allBelow())
    expect(damaged).toBe(1)
    expect(cargo).toEqual([lot('T2-03', 1, 1, true), lot('T2-01', 2, 1)])
  })

  it('ne casse rien sur un choc trop faible', () => {
    const threshold = defined(TAGS['TAG-FRAGILE'].breakage).shockThreshold
    expect(breakOnShock([lot('T2-03', 1, 1)], allBelow(), threshold - 1).damaged).toBe(0)
    expect(breakOnShock([lot('T2-03', 1, 1)], allBelow(), threshold).damaged).toBe(1)
  })

  it('fait exploser les inflammables non masqués seulement', () => {
    const explosion = defined(TAGS['TAG-FLAMMABLE'].explosion)
    // T0-02 masque une caisse inflammable : seule la seconde peut exploser
    const result = explodeFlammable([lot('T0-02', 1, 1), lot('T1-06', 2, 1)], allBelow())
    expect(result.exploded).toBe(1)
    expect(result.chassisLoss).toBe(explosion.chassisLoss)
    expect(explodeFlammable([lot('T1-06', 2, 1)], allAbove()).exploded).toBe(0)
  })
})
