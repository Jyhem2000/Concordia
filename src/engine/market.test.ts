import { describe, expect, it } from 'vitest'
import { SHOP_MIN_PRODUCTS } from '../data/balance.ts'
import { DISTRICT_IDS, DISTRICTS } from '../data/districts.ts'
import { PRODUCT_IDS, PRODUCTS } from '../data/products.ts'
import { NO_EVENTS, type EventContext } from './events.ts'
import { demandQuota, demandRefill, drawMarket, productStatus, quoteBreakdown, saleQuote, shopProducts } from './market.ts'
import { createRng, seedRng } from './rng.ts'
import { createInitialState } from './state.ts'
import { defined } from './test-helpers.ts'
import type { GameState } from './types.ts'

/** Journée sans événement : la boutique et les cours suivent les seules règles du chap. 7 */
const CALM: EventContext = { day: 1, phase: 'day', events: NO_EVENTS }

describe('boutique du jour', () => {
  for (const seed of [1, 2, 3, 4, 5]) {
    it(`respecte les règles de composition (graine ${seed})`, () => {
      const rng = createRng(seedRng(seed))
      for (const districtId of DISTRICT_IDS) {
        const shop = shopProducts(drawMarket(CALM, districtId, rng))
        const district = DISTRICTS[districtId]

        expect(shop.length, districtId).toBeGreaterThanOrEqual(SHOP_MIN_PRODUCTS)
        for (const id of PRODUCT_IDS.filter((id) => PRODUCTS[id].tier === 0 && !PRODUCTS[id].sealed)) expect(shop, districtId).toContain(id)
        for (const id of district.strongDemand) expect(shop, districtId).not.toContain(id)
        if (!district.productionDraw) {
          for (const id of district.production) {
            if (PRODUCTS[id].appearanceChance === undefined) expect(shop, districtId).toContain(id)
          }
        }
      }
    })
  }

  it('ne tire en D4 qu’une partie de sa production', () => {
    const rng = createRng(seedRng(9))
    const { min, max } = defined(DISTRICTS.D4.productionDraw)
    for (let i = 0; i < 50; i++) {
      const shop = shopProducts(drawMarket(CALM, 'D4', rng))
      const drawn = shop.filter((id) => DISTRICTS.D4.production.includes(id)).length
      expect(drawn).toBeGreaterThanOrEqual(min)
      expect(drawn).toBeLessThanOrEqual(max)
    }
  })

  it('reconstitue la demande d’un tiers du quota par matin, sans dépasser le quota', () => {
    const rng = createRng(seedRng(4))
    const yesterday = drawMarket(CALM, 'D1', rng)
    const quota = defined(demandQuota(CALM, 'D1', 'T2-01'))
    const today = drawMarket(CALM, 'D1', rng, { ...yesterday, demand: { ...yesterday.demand, 'T2-01': 0 } })
    expect(today.demand['T2-01']).toBe(demandRefill(quota))
    expect(drawMarket(CALM, 'D1', rng, yesterday).demand['T2-01']).toBe(quota)
  })

  it('laisse la demande du Tier 0 illimitée', () => {
    expect(demandQuota(CALM, 'D1', 'T0-01')).toBeNull()
    expect(drawMarket(CALM, 'D1', createRng(seedRng(1))).demand['T0-01']).toBeUndefined()
  })
})

describe('cours du jour', () => {
  const state = createInitialState(42)

  it('applique le coefficient de production', () => {
    expect(productStatus(CALM, 'D1', 'T1-04')).toBe('production')
    const sources = quoteBreakdown(state, 'D1', 'T1-04').lines.map((line) => line.source)
    expect(sources.slice(0, 3)).toEqual(['T1-04', 'rule.production', 'rule.noise'])
  })

  it('ajoute le bonus de tier en Forte demande', () => {
    expect(productStatus(CALM, 'D6', 'T4-01')).toBe('strong')
    const coefLine = defined(quoteBreakdown(state, 'D6', 'T4-01').lines.find((line) => line.source === 'rule.strong-demand'))
    expect(coefLine.value).toBeCloseTo(DISTRICTS.D6.coefStrongDemand + 0.3)
  })

  it('donne un cours entier', () => {
    for (const id of PRODUCT_IDS) expect(Number.isInteger(quoteBreakdown(state, 'D3', id).total)).toBe(true)
  })
})

describe('prix de vente', () => {
  const base = createInitialState(7)
  const withLot = (travelled: boolean, phase: GameState['phase'] = 'day'): GameState => ({
    ...base,
    phase,
    // Acheté la veille : fraîcheur standard (×1), pour isoler les autres coefficients
    cargo: [{ productId: 'T2-02', qty: 20, unitCost: 1, travelled, boughtDay: 0, damaged: false }],
  })

  it('prélève la commission de puce', () => {
    const state = withLot(true)
    const quote = quoteBreakdown(state, 'D1', 'T2-02').total
    expect(saleQuote(state, 'T2-02', 1).total).toBe(Math.round(quote * 0.9))
  })

  it('vend à moitié prix au-delà de la demande restante', () => {
    const state = withLot(true)
    const demand = defined(state.markets.D1.demand['T2-02'])
    const sale = saleQuote(state, 'T2-02', demand + 2)
    expect(sale.saturatedQty).toBe(2)
    expect(sale.total).toBeLessThan(saleQuote(state, 'T2-02', 1).total * (demand + 2))
  })

  it("cumule le prix d'achat des caisses vendues, lots les plus anciens d'abord", () => {
    const state: GameState = {
      ...withLot(true),
      cargo: [
        { productId: 'T2-02', qty: 2, unitCost: 100, travelled: true, boughtDay: 1, damaged: false },
        { productId: 'T2-02', qty: 3, unitCost: 300, travelled: true, boughtDay: 1, damaged: false },
      ],
    }
    expect(saleQuote(state, 'T2-02', 1).cost).toBe(100)
    expect(saleQuote(state, 'T2-02', 4).cost).toBe(100 + 100 + 300 + 300)
  })

  it('applique le profil nuit festif, sauf sans avoir voyagé (anti-arbitrage)', () => {
    const day = saleQuote(withLot(true), 'T2-02', 1).total
    expect(saleQuote(withLot(true, 'night'), 'T2-02', 1).total).toBeGreaterThan(day)
    expect(saleQuote(withLot(false, 'night'), 'T2-02', 1).total).toBe(day)
  })

  it("paie le festif bien plus cher à l'after du couvre-feu, la nuit seulement", () => {
    const night = (after: GameState['after'], phase: GameState['phase'] = 'night') => saleQuote({ ...withLot(true, phase), after }, 'T2-02', 1).total
    // Le joueur est à Hives (D1)
    expect(night('D1')).toBeGreaterThan(night('D2'))
    expect(night('D1', 'day')).toBe(night('D2', 'day'))
  })
})
