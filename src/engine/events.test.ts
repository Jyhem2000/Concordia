import { describe, expect, it } from 'vitest'
import { FRESHNESS, QUOTE_NOISE } from '../data/balance.ts'
import { DISTRICTS } from '../data/districts.ts'
import { AFTERSHOCK, EVENT_COOLDOWNS, EVENT_MULT_CAP, GLOBAL_EVENTS, LOCAL_EVENTS, LOTTERY, ROAD_EVENTS } from '../data/events.ts'
import { PRODUCT_IDS } from '../data/products.ts'
import { VEHICLES } from '../data/vehicles.ts'
import { drawEvents, eventMultiplier, localEventsOf, NO_EVENTS, rumorReliability, tagFactor, type EventContext } from './events.ts'
import { drawMarket, productStatus, quote, quoteBreakdown, shopProducts } from './market.ts'
import { keysOf } from './records.ts'
import { riskBreakdown } from './risk.ts'
import { createRng, seedRng } from './rng.ts'
import { sleep } from './routine.ts'
import { remember } from './state.ts'
import { defined, errorOf, gameAt, HIGH_ROLL_RNG, run } from './test-helpers.ts'
import type { CargoLot, EventsState, GameState, ProductId } from './types.ts'

const withEvents = (events: Partial<EventsState>, patch: Partial<GameState> = {}): GameState =>
  gameAt(3, { ...patch, events: { ...NO_EVENTS, ...events } })
const ctx = (events: Partial<EventsState>, phase: GameState['phase'] = 'day'): EventContext => ({
  day: 3,
  phase,
  events: { ...NO_EVENTS, ...events },
})
const lot = (productId: ProductId, qty: number, boughtDay = 3): CargoLot => ({
  productId,
  qty,
  unitCost: 10,
  travelled: true,
  boughtDay,
  damaged: false,
})

describe('données des événements', () => {
  it('ne dépassent jamais le plafond de Mult_Événement', () => {
    for (const event of [...Object.values(GLOBAL_EVENTS), ...Object.values(LOCAL_EVENTS)]) {
      for (const effect of event.effects)
        if (effect.kind === 'price' || effect.kind === 'appear') expect(effect.factor).toBeLessThanOrEqual(EVENT_MULT_CAP)
    }
  })

  it('donnent 3 événements locaux à chaque district', () => {
    for (const id of keysOf(DISTRICTS)) expect(localEventsOf(id)).toHaveLength(3)
  })

  it('gardent à chaque aléa routier au moins une option sans paiement', () => {
    for (const { a, b } of Object.values(ROAD_EVENTS)) expect(!a.pay || !b.pay).toBe(true)
  })
})

describe('tirages de 06h00', () => {
  it("font entrer en vigueur l'événement global tiré la veille, et en tirent un pour demain", () => {
    const rng = createRng(seedRng(7))
    const today = drawEvents({ ...NO_EVENTS, global: 'EVT-G03', tomorrow: 'EVT-G01', local: { D2: 'EVT-D2-02' } }, 5, rng)
    expect(today.global).toBe('EVT-G01')
    expect(today.yesterday).toEqual({ global: 'EVT-G03', local: { D2: 'EVT-D2-02' } })
  })

  it('respectent le cooldown des événements locaux', () => {
    const rng = createRng(seedRng(3))
    const localDays = Object.fromEntries(localEventsOf('D1').map((id) => [id, 10]))
    for (let i = 0; i < 30; i++) {
      expect(drawEvents({ ...NO_EVENTS, localDays }, 10 + EVENT_COOLDOWNS.local - 1, rng).local.D1).toBeUndefined()
    }
  })

  it('tirent la Loterie aux jours fixes : un déclassé autre que le promu, un vice ni produit ni déjà demandé en bas', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const lottery = defined(drawEvents(NO_EVENTS, LOTTERY.days[0], createRng(seedRng(seed))).lottery)
      expect(lottery.demoted).not.toBe(lottery.promoted)
      expect(lottery.viceDistrict).toBe(LOTTERY.lower[lottery.demoted])
      const lower = DISTRICTS[lottery.viceDistrict]
      if (lottery.vice) {
        expect(DISTRICTS[lottery.demoted].strongDemand).toContain(lottery.vice)
        expect(lower.production).not.toContain(lottery.vice)
        expect(lower.strongDemand).not.toContain(lottery.vice)
      }
    }
  })

  it('affichent la fiabilité des rumeurs calculée à partir des chances', () => {
    expect(rumorReliability()).toBeGreaterThan(0.5)
    expect(rumorReliability()).toBeLessThan(1)
  })
})

describe('cours et Mult_EvtActif', () => {
  it('garde le multiplicateur le plus éloigné de 1, le local à égalité', () => {
    // G05 : Tier 1 et 2 ×1.5, mais T1-04 ×2.5 (la ligne la plus forte l'emporte)
    expect(eventMultiplier(ctx({ global: 'EVT-G05' }), 'D2', 'T1-04')?.factor).toBe(2.5)
    // D6-03 (local, ×4) contre G05 (global, ×2.5) sur T1-04
    expect(eventMultiplier(ctx({ global: 'EVT-G05', local: { D6: 'EVT-D6-03' } }), 'D6', 'T1-04')?.source).toBe('EVT-D6-03')
  })

  it('annule les multiplicateurs « jour seulement » après 20h00', () => {
    expect(eventMultiplier(ctx({ global: 'EVT-G04' }), 'D1', 'T3-01')?.factor).toBe(0.6)
    expect(eventMultiplier(ctx({ global: 'EVT-G04' }, 'night'), 'D1', 'T3-01')).toBeNull()
  })

  it("restreint un effet global aux districts qu'il vise", () => {
    expect(eventMultiplier(ctx({ global: 'EVT-G06' }), 'D6', 'T3-01')).not.toBeNull()
    expect(eventMultiplier(ctx({ global: 'EVT-G06' }), 'D1', 'T3-01')).toBeNull()
  })

  it("applique un contrecoup le lendemain d'une ruée ou d'une braderie, sauf si l'événement se répète", () => {
    const rush = ctx({ yesterday: { global: 'EVT-G01', local: {} } })
    expect(eventMultiplier(rush, 'D2', 'T0-02')).toEqual({ source: 'rule.aftershock', factor: AFTERSHOCK.afterRush })
    const sale = ctx({ yesterday: { global: null, local: { D3: 'EVT-D3-03' } } })
    expect(eventMultiplier(sale, 'D3', 'T3-04')?.factor).toBe(AFTERSHOCK.afterSale)
    expect(eventMultiplier(ctx({ global: 'EVT-G01', yesterday: { global: 'EVT-G01', local: {} } }), 'D2', 'T0-02')?.factor).toBe(2.5)
  })

  it('plafonne Mult_Événement dans le cours', () => {
    const state = withEvents({ local: { D6: 'EVT-D6-03' } })
    const line = defined(quoteBreakdown(state, 'D6', 'T1-01').lines.find((entry) => entry.source === 'EVT-D6-03'))
    expect(line.value).toBeLessThanOrEqual(EVENT_MULT_CAP)
  })
})

describe('tendance des cours', () => {
  it('garde une part de la veille et reste dans ses bornes', () => {
    const rng = createRng(seedRng(11))
    const calm = ctx({})
    const high = 1 + QUOTE_NOISE.max
    const yesterday = { ...drawMarket(calm, 'D1', rng), noise: Object.fromEntries(PRODUCT_IDS.map((id) => [id, high])) as Record<ProductId, number> }
    const today = drawMarket(calm, 'D1', rng, yesterday)
    for (const id of PRODUCT_IDS) {
      expect(today.noise[id]).toBeGreaterThanOrEqual(1 + QUOTE_NOISE.max * QUOTE_NOISE.persistence - QUOTE_NOISE.shock - 1e-9)
      expect(today.noise[id]).toBeLessThanOrEqual(high)
    }
  })

  it('mémorise un relevé par district et par jour, le dernier du jour l’emportant', () => {
    const state = gameAt(3)
    const twice = remember(remember(state, 'D2'), 'D2')
    expect(twice.memory.D2).toHaveLength(1)
    expect(remember({ ...twice, day: 4 }, 'D2').memory.D2).toHaveLength(2)
  })
})

describe('boutiques et vices', () => {
  it('fait apparaître les produits d’un événement malgré l’exclusion, et applique les facteurs de stock', () => {
    const rng = createRng(seedRng(5))
    const audit = drawMarket(ctx({ local: { D5: 'EVT-D5-02' } }), 'D5', rng)
    for (const id of ['T2-06', 'T3-02', 'T3-07', 'T4-03'] as const) expect(shopProducts(audit)).toContain(id)
    const blockade = drawMarket(ctx({ global: 'EVT-G05' }), 'D1', rng)
    for (const stock of Object.values(blockade.stock)) expect(stock).toBeGreaterThanOrEqual(1)
  })

  it('passe le vice du déclassé en Forte demande dans le district inférieur pendant sa durée', () => {
    const lottery = {
      day: 4,
      promoted: 'D1',
      demoted: 'D5',
      vice: 'T2-04',
      viceDistrict: 'D3',
      viceUntil: 6,
      names: { promoted: 0, demoted: 0 },
      card: null,
    } as const
    expect(productStatus({ ...ctx({ lottery }), day: 5 }, 'D3', 'T2-04')).toBe('strong')
    expect(productStatus({ ...ctx({ lottery }), day: 7 }, 'D3', 'T2-04')).toBe('neutral')
  })
})

describe('risque', () => {
  it('ajoute l’alerte sanitaire hors zone hors-réseau', () => {
    const state = withEvents({ global: 'EVT-G02' })
    expect(riskBreakdown(state, 'D2', { includePatrol: false }).lines.some((line) => line.source === 'EVT-G02')).toBe(true)
    expect(riskBreakdown(state, 'D4', { includePatrol: false }).lines.some((line) => line.source === 'EVT-G02')).toBe(false)
  })

  it('impose un risque de base, divise le risque final, et purge le district du promu', () => {
    const audit = riskBreakdown(withEvents({ local: { D5: 'EVT-D5-02' } }), 'D5', { includePatrol: false })
    expect(audit.lines.find((line) => line.op === 'set')?.value).toBe(0.6)
    const calm = riskBreakdown(gameAt(3), 'D3', { includePatrol: false }).total
    expect(riskBreakdown(withEvents({ local: { D3: 'EVT-D3-02' } }), 'D3', { includePatrol: false }).total).toBeCloseTo(Math.max(0.05, calm / 2))
    const lottery = {
      day: 3,
      promoted: 'D2',
      demoted: 'D3',
      vice: null,
      viceDistrict: 'D2',
      viceUntil: 5,
      names: { promoted: 0, demoted: 0 },
      card: null,
    } as const
    expect(riskBreakdown(withEvents({ lottery }), 'D2', { includePatrol: false }).lines.some((line) => line.source === 'EVT-L01')).toBe(true)
  })

  it("annule ou double un tag, sans cumuler le doublement de l'odeur", () => {
    expect(tagFactor(ctx({ local: { D1: 'EVT-D1-01' } }), 'D1', 'TAG-ODOROUS', 1)).toBe(0)
    expect(tagFactor(ctx({ global: 'EVT-G04' }), 'D6', 'TAG-ODOROUS', DISTRICTS.D6.odorFactor)).toBe(2)
    expect(tagFactor(ctx({ global: 'EVT-G03' }), 'D5', 'TAG-TECH')).toBe(0)
    expect(tagFactor(ctx({ global: 'EVT-G03' }), 'D6', 'TAG-TECH')).toBe(1)
  })
})

describe('canicule et sas', () => {
  it('fait fondre le beurre et vieillir les périssables à 06h00', () => {
    const state = gameAt(3, { events: { ...NO_EVENTS, tomorrow: 'EVT-G01' }, cargo: [lot('T1-03', 2), lot('T2-02', 3, 3), lot('T3-01', 1, 2)] })
    const morning = sleep(state)
    const heat = defined(morning.briefing?.heat)
    expect(heat.melted).toBe(2)
    // T3-01 acheté le jour 2, vieilli de 2 jours au jour 4 : âge 4, pourri
    expect(heat.rotten).toBe(1)
    expect(morning.cargo.find((entry) => entry.productId === 'T2-02')?.boughtDay).toBe(1)
    expect(FRESHNESS.rottenFromAge).toBe(4)
  })

  it('coûte châssis et Santé aux trajets de jour', () => {
    const state = withEvents({ global: 'EVT-G01' }, { rng: HIGH_ROLL_RNG, autoCooling: false })
    const moved = run(state, { type: 'travel', to: 'D2' })
    expect(moved.tripReport?.heatHealth).toBe(5)
    expect(moved.tripReport?.chassisWear).toBe(10)
  })

  it('fait perdre une demi-journée à qui entre dans un district bouclé, ou s’y réveille', () => {
    const sealed = { local: { D3: 'EVT-D3-01' as const } }
    const moved = run(withEvents(sealed, { rng: HIGH_ROLL_RNG, districtId: 'D2' }), { type: 'travel', to: 'D3' })
    const settled = moved.roadEvent ? run(moved, { type: 'road', choice: ROAD_EVENTS[moved.roadEvent].a.pay ? 'b' : 'a' }) : moved
    expect(settled.dayOver).toBe(true)
  })
})

describe('aléas routiers', () => {
  const pending = (patch: Partial<GameState>) => gameAt(3, { roadEvent: 'EVT-R01', ...patch })

  it('bloquent toute autre action jusqu’au choix', () => {
    expect(errorOf(pending({}), { type: 'refuel', qty: 1 })).toBe('road-event')
  })

  it('proposent un paiement au choix et refusent ce que le joueur ne peut pas payer', () => {
    expect(errorOf(pending({ cash: 0 }), { type: 'road', choice: 'a', pay: 1 })).toBe('not-enough-cash')
    expect(errorOf(pending({ cargo: [] }), { type: 'road', choice: 'a', pay: 0 })).toBe('not-enough-cargo')
    const paid = run(pending({ cargo: [lot('T1-05', 1), lot('T1-01', 1)] }), { type: 'road', choice: 'a', pay: 0 })
    // La moins chère des caisses addictives part : T1-01
    expect(paid.cargo.map((entry) => entry.productId)).toEqual(['T1-05'])
    expect(paid.roadEvent).toBeNull()
    expect(paid.roadReport?.crates).toBe(-1)
  })

  it('ne tuent jamais et gardent les rations dans le réservoir', () => {
    const blood = run(gameAt(3, { roadEvent: 'EVT-R07', health: 5 }), { type: 'road', choice: 'a' })
    expect(blood.health).toBe(1)
    const tank = VEHICLES['VEH-01'].tank
    const helped = run(gameAt(3, { roadEvent: 'EVT-R13', fuel: tank }), { type: 'road', choice: 'a' })
    expect(helped.fuel).toBe(tank)
  })

  it('donnent une caisse du tier promis au troc aveugle', () => {
    const swapped = run(gameAt(3, { roadEvent: 'EVT-R15', cargo: [] }), { type: 'road', choice: 'a' })
    expect(swapped.cargo).toHaveLength(1)
    expect(swapped.cargo[0].travelled).toBe(false)
  })
})

describe('quote', () => {
  it('reste un entier quel que soit l’événement', () => {
    const state = withEvents({ global: 'EVT-G05', local: { D1: 'EVT-D1-03' } })
    for (const id of PRODUCT_IDS) expect(Number.isInteger(quote(state, 'D1', id))).toBe(true)
  })
})
