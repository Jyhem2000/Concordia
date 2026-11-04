import { describe, expect, it } from 'vitest'
import { ENDINGS, NIGHT_MISSION } from '../data/balance.ts'
import { SEALED_PRODUCT } from '../data/products.ts'
import { VEHICLES } from '../data/vehicles.ts'
import { arrive, drawRoadEvent } from './events.ts'
import { checkpointPlace, flyingCheckShare } from './interception.ts'
import { missionFee, sealedCount } from './night.ts'
import { riskBreakdown } from './risk.ts'
import { createRng } from './rng.ts'
import { sleep } from './routine.ts'
import { createInitialState } from './state.ts'
import { EARNED, errorOf, gameAt, HIGH_ROLL_RNG, LOW_ROLL_RNG, run } from './test-helpers.ts'
import type { CargoLot, GameState, ProductId } from './types.ts'

const lot = (productId: ProductId, qty: number): CargoLot => ({ productId, qty, unitCost: 10, travelled: true, boughtDay: 3, damaged: false })
const evening = (patch: Partial<GameState> = {}) =>
  gameAt(3, { districtId: 'D1', dayTripDone: true, nightOffer: 'D2', rng: HIGH_ROLL_RNG, progress: EARNED, ...patch })
const nightRisk = (state: GameState, to: GameState['districtId']) =>
  riskBreakdown(state, to, { includePatrol: false }).lines.some((line) => line.source === 'rule.night-trip')

describe('mission de nuit', () => {
  it('est proposée chaque soir, vers un district tiré au hasard', () => {
    for (let seed = 1; seed <= 20; seed++) expect(createInitialState(seed).nightOffer).not.toBeNull()
  })

  it('charge des caisses scellées en proportion de la soute, si la place le permet', () => {
    const night = run(evening(), { type: 'forceCurfew', mission: true })
    expect(night.mission).toEqual({ to: 'D2' })
    expect(night.cargo).toEqual([
      expect.objectContaining({ productId: SEALED_PRODUCT, qty: Math.ceil(VEHICLES['VEH-01'].cargo * NIGHT_MISSION.sealedShare) }),
    ])
    expect(sealedCount({ ...night, vehicleId: 'VEH-04' })).toBe(Math.ceil(VEHICLES['VEH-04'].cargo * NIGHT_MISSION.sealedShare))
    expect(errorOf(evening({ cargo: [lot('T1-04', 10)] }), { type: 'forceCurfew', mission: true })).toBe('cargo-full')
    expect(errorOf(evening({ nightOffer: 'D1' }), { type: 'forceCurfew', mission: true })).toBe('no-mission')
    expect(errorOf(evening({ nightOffer: null }), { type: 'forceCurfew', mission: true })).toBe('no-mission')
  })

  it('couvre le trajet vers la mission, livre et paie à l’arrivée', () => {
    const night = run(evening(), { type: 'forceCurfew', mission: true })
    expect(nightRisk(night, 'D2')).toBe(false)
    expect(nightRisk(night, 'D3')).toBe(true)
    const delivered = run(night, { type: 'travel', to: 'D2' })
    expect(delivered.cargo).toHaveLength(0)
    expect(delivered.cash).toBe(night.cash + missionFee(night))
    expect(delivered).toMatchObject({ mission: null, wanted: 0 })
    expect(delivered.tripReport?.mission).toBe('delivered')
  })

  it('n’enregistre pas l’écart pendant la maintenance d’Aeterna, et cloue les drones au sol', () => {
    const base = evening()
    const maintenance = { ...base, events: { ...base.events, global: 'EVT-G07' as const } }
    const strayed = run(run(maintenance, { type: 'forceCurfew', mission: true }), { type: 'travel', to: 'D4' })
    expect(strayed.wanted).toBe(0)
    expect(strayed.tripReport?.mission).toBe('unfilmed')
    expect(flyingCheckShare(maintenance, 'D6', true)).toBe(0)
    expect(flyingCheckShare(base, 'D6', true)).toBeGreaterThan(0)
  })

  it('enregistre un écart hors mission, puis reprend les caisses non livrées au matin', () => {
    const night = run(evening(), { type: 'forceCurfew', mission: true })
    const strayed = run(night, { type: 'travel', to: 'D4' })
    expect(strayed.wanted).toBe(1)
    expect(strayed.tripReport?.mission).toBe('deviated')
    const morning = sleep(strayed)
    expect(morning.cargo.some((entry) => entry.productId === SEALED_PRODUCT)).toBe(false)
    expect(morning.briefing?.missionReclaimed).toBe(sealedCount(night))
    expect(morning.mission).toBeNull()
  })

  it('compte tout trajet de nuit sans mission comme un écart', () => {
    const night = run(evening(), { type: 'forceCurfew' })
    expect(nightRisk(night, 'D2')).toBe(true)
    expect(run(night, { type: 'travel', to: 'D2' }).wanted).toBe(1)
  })

  it('injecte le serveur à chaque tournée clandestine passée, Glitch au travail, jusqu’à la greffe complète', () => {
    const { requiredProduct, crew, injections } = ENDINGS.resident
    const glitch = { ...evening().crew, active: crew, paidDay: 3 }
    const night = run(evening({ cargo: [lot(requiredProduct, 1)], crew: glitch }), { type: 'forceCurfew' })
    const injected = run(night, { type: 'travel', to: 'D2' })
    expect(injected.progress.injections).toBe(1)
    expect(injected.tripReport?.injection).toBe(1)
    // Sans Glitch au travail, ou sans serveur, ou greffe déjà complète : rien
    expect(run(run(evening({ cargo: [lot(requiredProduct, 1)] }), { type: 'forceCurfew' }), { type: 'travel', to: 'D2' }).progress.injections).toBe(0)
    expect(run(run(evening({ crew: glitch }), { type: 'forceCurfew' }), { type: 'travel', to: 'D2' }).progress.injections).toBe(0)
    const complete = { ...EARNED, injections }
    expect(
      run(run(evening({ cargo: [lot(requiredProduct, 1)], crew: glitch, progress: complete }), { type: 'forceCurfew' }), { type: 'travel', to: 'D2' })
        .progress.injections,
    ).toBe(injections)
  })

  it('injecte aussi après un contrôle franchi, mais pas sur une mission', () => {
    const { requiredProduct, crew } = ENDINGS.resident
    const glitch = { ...evening().crew, active: crew, paidDay: 3 }
    const arrivedAfterControl = { ...evening({ cargo: [lot(requiredProduct, 1)], crew: glitch }), phase: 'night' as const, districtId: 'D2' as const }
    expect(arrive(arrivedAfterControl).progress.injections).toBe(1)
    expect(arrive({ ...arrivedAfterControl, mission: { to: 'D2' } }).progress.injections).toBe(0)
  })

  it('laisse Glitch brouiller la balise du serveur', () => {
    const { requiredProduct, crew } = ENDINGS.resident
    const carrying = evening({ cargo: [lot(requiredProduct, 1)] })
    const glitch = { ...carrying, crew: { ...carrying.crew, active: crew, paidDay: 3 } }
    const beacon = (state: GameState) => riskBreakdown(state, 'D2', { includePatrol: false }).total
    expect(beacon(glitch)).toBeLessThan(beacon(carrying))
  })

  it('interdit de vendre ou de donner les caisses scellées', () => {
    const night = run(evening(), { type: 'forceCurfew', mission: true })
    expect(errorOf(night, { type: 'sell', productId: SEALED_PRODUCT, qty: 1 })).toBe('not-for-sale')
    const stopped: GameState = { ...night, interception: { kind: 'brc', acted: false, bluffFailed: false } }
    expect(errorOf(stopped, { type: 'intercept', move: 'bribe', offer: { cash: 10_000, crates: [{ productId: SEALED_PRODUCT, qty: 1 }] } })).toBe(
      'not-eligible',
    )
  })
})

describe('tournée de nuit en un geste', () => {
  it('passe à la nuit et part d’un même coup, en mission vers son district', () => {
    const delivered = run(evening(), { type: 'nightTrip', to: 'D2' })
    expect(delivered.districtId).toBe('D2')
    expect(delivered.phase).toBe('night')
    expect(delivered.lastCurfewDay).toBe(3)
    expect(delivered.tripReport?.mission).toBe('delivered')
  })

  it('ne change rien si le trajet ne peut pas partir : ni nuit, ni épuisement', () => {
    const dry = evening({ fuel: 0 })
    expect(errorOf(dry, { type: 'nightTrip', to: 'D3' })).not.toBeNull()
    const start = evening()
    expect(errorOf({ ...start, lastCurfewDay: 2 }, { type: 'nightTrip', to: 'D3' })).toBe('exhausted')
  })
})

describe('réseau logistique', () => {
  it('ne tire jamais d’aléa routier la nuit', () => {
    expect(drawRoadEvent(gameAt(3, { phase: 'night' }), createRng(LOW_ROLL_RNG))).toBeNull()
  })

  it('situe le contrôle selon la couche du réseau', () => {
    expect(checkpointPlace(gameAt(3, { districtId: 'D2' }))).toBe('street')
    expect(checkpointPlace(gameAt(3, { districtId: 'D5' }))).toBe('docks')
    expect(checkpointPlace(gameAt(3, { districtId: 'D5', phase: 'night' }))).toBe('gallery')
  })
})

describe('plaque rotative', () => {
  it('n’enregistre pas l’écart d’un trajet de nuit hors mission : la caméra ne lit pas la plaque', () => {
    const plated: GameState['modules'] = { owned: ['MOD-05'], mounted: ['MOD-05'] }
    const night = run(evening({ modules: plated }), { type: 'forceCurfew' })
    expect(run(night, { type: 'travel', to: 'D2' }).wanted).toBe(0)
  })
})
