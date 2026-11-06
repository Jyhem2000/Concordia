import { describe, expect, it } from 'vitest'
import { ICC_MAX } from '../data/balance.ts'
import { LOTTERY } from '../data/events.ts'
import { CANTINE, CASSANDRE, FORGERY, KARMA, MORGUE, VELVET } from '../data/locations.ts'
import { drawEvents, NO_EVENTS } from './events.ts'
import { demandQuota, quoteBreakdown } from './market.ts'
import { riskBreakdown } from './risk.ts'
import { createRng, seedRng } from './rng.ts'
import { sleep } from './routine.ts'
import { auctionPrice, forgeryCost, karmaCost, morgueCost, pendingServices } from './services.ts'
import { defined, EARNED, errorOf, gameAt, HIGH_ROLL_RNG, LOW_ROLL_RNG, run } from './test-helpers.ts'
import type { CargoLot, GameState, ProductId } from './types.ts'

const lot = (productId: ProductId, qty: number, boughtDay = 3): CargoLot => ({
  productId,
  qty,
  unitCost: 10,
  travelled: true,
  boughtDay,
  damaged: false,
})
// Joueur établi : carnet complet, dette soldée, patrimoine à l'abri (services réservés, chap. 3)
const at = (districtId: GameState['districtId'], patch: Partial<GameState> = {}) =>
  gameAt(3, { districtId, cash: 200_000, progress: EARNED, initialDebtPaid: true, debt: 0, offshore: { deposited: 100_000, interest: 0 }, ...patch })

describe('Cantine des Chauffeurs : plat du routier', () => {
  it('rend de la Santé une fois par jour, de jour, contre quelques crédits', () => {
    const fed = run(at('D1', { health: 50 }), { type: 'meal' })
    expect(fed.health).toBe(50 + CANTINE.meal.health)
    expect(fed.cash).toBe(200_000 - CANTINE.meal.cost)
    expect(errorOf(fed, { type: 'meal' })).toBe('already-fed')
    expect(errorOf({ ...fed, day: 4 }, { type: 'meal' })).toBeNull()
    expect(errorOf(at('D1', { health: 100 }), { type: 'meal' })).toBe('full-health')
    expect(errorOf(at('D1', { health: 50, phase: 'night' }), { type: 'meal' })).toBe('location-closed')
    expect(errorOf(at('D2', { health: 50 }), { type: 'meal' })).toBe('not-at-location')
  })
})

describe('Karma-Cham', () => {
  it('dope un tag le lendemain seulement, puis entre en recharge avec un prix en hausse', () => {
    const ordered = run(at('D2'), { type: 'influence', tag: 'TAG-BIO' })
    expect(ordered.influence).toEqual({ tag: 'TAG-BIO', day: 4 })
    expect(errorOf(ordered, { type: 'influence', tag: 'TAG-CULTURE' })).toBe('cooldown')
    expect(karmaCost(ordered)).toBeGreaterThan(karmaCost(at('D2')))
    const next = { ...ordered, day: 4 }
    expect(quoteBreakdown(next, 'D1', 'T1-04').lines.find((line) => line.source === 'LOC-D2-1')?.value).toBe(KARMA.factor)
    expect(quoteBreakdown(ordered, 'D1', 'T1-04').lines.some((line) => line.source === 'LOC-D2-1')).toBe(false)
  })
})

describe('Morgue du Dr. K.', () => {
  it('aveugle les bio-scanners de Panacea pendant la validité du laissez-passer', () => {
    const passed = run(at('D3', { cargo: [lot('T1-04', 4)] }), { type: 'morgue', service: 'pass' })
    expect(passed.morguePass).toBe(3 + MORGUE.pass.days - 1)
    const scanned = (state: GameState) =>
      riskBreakdown({ ...state, districtId: 'D2' }, 'D3', { includePatrol: false }).lines.some((line) => line.source === 'TAG-BIO')
    expect(scanned(passed)).toBe(false)
    expect(scanned(at('D3', { cargo: [lot('T1-04', 4)] }))).toBe(true)
  })

  it('soigne jusqu’au plafond, refuse un patient en forme, et vend de l’ICC hors plafond', () => {
    const healed = run(at('D3', { health: 60 }), { type: 'morgue', service: 'surgery' })
    expect(healed.health).toBe(MORGUE.surgery.healthCap)
    expect(errorOf(at('D3', { health: 90 }), { type: 'morgue', service: 'surgery' })).toBe('already-healthy')
    const certified = run(at('D3', { icc: 50, iccRouteGains: 99 }), { type: 'morgue', service: 'certificate' })
    expect(certified.icc).toBe(50 + MORGUE.certificate.icc)
    expect(morgueCost(at('D3', { cash: 10_000 }), 'surgery')).toBeGreaterThan(morgueCost(at('D3', { cash: 0 }), 'surgery'))
  })
})

describe('Cassandre-88', () => {
  it('garantit l’événement global de J+2, annoncé la veille sans erreur', () => {
    const consulted = run(at('D4', { cargo: [lot(CASSANDRE.crate, 1)] }), { type: 'prophecy' })
    const prophecy = defined(consulted.events.prophecy)
    expect(prophecy.day).toBe(5)
    expect(consulted.cargo).toHaveLength(0)
    expect(errorOf({ ...consulted, cargo: [lot(CASSANDRE.crate, 1)] }, { type: 'prophecy' })).toBe('prophecy-active')
    const day4 = drawEvents(consulted.events, 4, createRng(seedRng(1)))
    expect(day4.tomorrow).toBe(prophecy.event)
    expect(day4.rumor).toBe(prophecy.event)
    expect(drawEvents(day4, 5, createRng(seedRng(2))).global).toBe(prophecy.event)
  })
})

describe('faux dossier de Loterie', () => {
  const eve = LOTTERY.days[0] - 1

  it('ne se glisse que la veille d’un tirage, et coûte même en cas d’échec', () => {
    expect(errorOf(at('D5', { day: 5 }), { type: 'forge', card: { kind: 'informant' } })).toBe('not-eligible')
    const rejected = run(at('D5', { day: eve, rng: HIGH_ROLL_RNG }), { type: 'forge', card: { kind: 'informant' } })
    expect(rejected.events.forgery).toBeNull()
    expect(rejected).toMatchObject({ icc: 100 - FORGERY.failIccLoss, wanted: 1 })
    expect(rejected.cash).toBe(200_000 - forgeryCost(at('D5', { day: eve })))
  })

  it('impose le promu, supprime la purge et applique la carte au tirage', () => {
    const accepted = run(at('D5', { day: eve, rng: LOW_ROLL_RNG }), { type: 'forge', card: { kind: 'competitor', district: 'D3' } })
    expect(accepted.events.forgery?.day).toBe(eve + 1)
    const drawn = sleep({ ...accepted, districtId: 'D1' })
    const lottery = defined(drawn.events.lottery)
    expect(lottery).toMatchObject({ promoted: 'D3', card: 'competitor' })
    expect(riskBreakdown(drawn, 'D3', { includePatrol: false }).lines.some((line) => line.source === 'EVT-L01')).toBe(false)
    const quota = defined(demandQuota(drawn, 'D3', 'T2-01'))
    expect(quota).toBe(Math.ceil(defined(demandQuota({ day: drawn.day, phase: 'day', events: NO_EVENTS }, 'D3', 'T2-01')) * FORGERY.competitorQuota))
  })

  it('efface la Fiche S avec la carte de l’indic', () => {
    const accepted = run(at('D5', { day: eve, rng: LOW_ROLL_RNG, wanted: 2, icc: 80 }), { type: 'forge', card: { kind: 'informant' } })
    const drawn = sleep({ ...accepted, districtId: 'D1' })
    expect(drawn.briefing?.informant).toBe(true)
    expect(drawn.wanted).toBe(0)
  })
})

describe('Velvet-Silo', () => {
  it('vend une caisse aux enchères, hors quota, puis entre en recharge', () => {
    const state = at('D6', { cargo: [lot('T3-02', 2)] })
    const price = defined(auctionPrice(state, 'T3-02'))
    const sold = run(state, { type: 'auction', productId: 'T3-02' })
    expect(sold.cash).toBe(200_000 + price)
    expect(sold.markets.D6.demand).toEqual(state.markets.D6.demand)
    expect(errorOf(sold, { type: 'auction', productId: 'T3-02' })).toBe('cooldown')
    expect(errorOf(at('D6', { cargo: [lot('T2-03', 1)] }), { type: 'auction', productId: 'T2-03' })).toBe('not-eligible')
  })

  it('commande un produit absent de la soute, et punit une livraison manquée', () => {
    const ordered = run(at('D6', { cargo: [lot('T2-03', 1)] }), { type: 'vipRequest' })
    const vip = defined(ordered.vip)
    expect(vip.productId).not.toBe('T2-03')
    expect(errorOf(ordered, { type: 'vipDeliver' })).toBe('not-enough-cargo')
    const delivered = run({ ...ordered, cargo: [lot(vip.productId, VELVET.vip.crates)] }, { type: 'vipDeliver' })
    expect(delivered.vip).toBeNull()
    const lastDay = { ...ordered, day: vip.day + VELVET.vip.deadlineDays, cargo: [lot(vip.productId, VELVET.vip.crates)] }
    expect(errorOf(lastDay, { type: 'vipDeliver' })).toBeNull()
    expect(errorOf({ ...lastDay, day: lastDay.day + 1 }, { type: 'vipDeliver' })).toBe('too-late')
    expect(delivered.cash).toBeGreaterThan(ordered.cash)
    // Parrainage du Haut-Commissaire : une commande livrée compte, une commande manquée en efface une
    expect(delivered.progress.vipOrders).toBe(ordered.progress.vipOrders + 1)
    // Échec constaté à la routine qui suit l'échéance
    let missed: GameState = { ...ordered, districtId: 'D1', progress: { ...ordered.progress, vipOrders: 2 } }
    for (let night = 0; night <= VELVET.vip.deadlineDays; night++) missed = sleep(missed)
    expect(missed.progress.vipOrders).toBe(1)
    expect(missed.briefing?.vipFailed).toBe(true)
    expect(missed.velvetLock).toBe(missed.day + VELVET.vip.lockDays - 1)
    expect(missed.icc).toBeLessThan(ICC_MAX)
  })
})

describe('agenda des services (chap. 7)', () => {
  it('donne le jour où chaque service utilisé redevient disponible', () => {
    const state = gameAt(10, { services: { uses: { influence: 1, auction: 1 }, lastDay: { influence: 9, auction: 2 } } })
    expect(pendingServices(state)).toEqual([{ key: 'influence', day: 9 + KARMA.cooldownDays }])
  })
})
