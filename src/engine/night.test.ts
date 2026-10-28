import { describe, expect, it } from 'vitest'
import { NIGHT_MISSION } from '../data/balance.ts'
import { DISTRICTS } from '../data/districts.ts'
import { SEALED_PRODUCT } from '../data/products.ts'
import { VEHICLES } from '../data/vehicles.ts'
import { drawRoadEvent } from './events.ts'
import { checkpointPlace, drawInterception } from './interception.ts'
import { missionFee, sealedCount } from './night.ts'
import { riskBreakdown } from './risk.ts'
import { createRng, seedRng } from './rng.ts'
import { sleep } from './routine.ts'
import { defined, EARNED, errorOf, gameAt, HIGH_ROLL_RNG, LOW_ROLL_RNG, run } from './test-helpers.ts'
import type { CargoLot, GameState, Interception, ProductId } from './types.ts'

const lot = (productId: ProductId, qty: number): CargoLot => ({ productId, qty, unitCost: 10, travelled: true, boughtDay: 3, damaged: false })
const evening = (patch: Partial<GameState> = {}) => gameAt(3, { districtId: 'D1', nightOffer: 'D2', rng: HIGH_ROLL_RNG, progress: EARNED, ...patch })
const nightRisk = (state: GameState, to: GameState['districtId']) =>
  riskBreakdown(state, to, { includePatrol: false }).lines.some((line) => line.source === 'rule.night-trip')

describe('mission de nuit', () => {
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

  it('interdit de vendre ou de donner les caisses scellées', () => {
    const night = run(evening(), { type: 'forceCurfew', mission: true })
    expect(errorOf(night, { type: 'sell', productId: SEALED_PRODUCT, qty: 1 })).toBe('not-for-sale')
    const stopped: GameState = { ...night, interception: { kind: 'brc', acted: false, bluffFailed: false } }
    expect(errorOf(stopped, { type: 'intercept', move: 'bribe', offer: { cash: 10_000, crates: [{ productId: SEALED_PRODUCT, qty: 1 }] } })).toBe(
      'not-eligible',
    )
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

describe('brouilleur de drones', () => {
  const jammer = (patch: Partial<GameState> = {}) => gameAt(3, { modules: { owned: ['MOD-09'], mounted: ['MOD-09'] }, ...patch })

  it('change un contrôle volant en barrage fixe, une fois par jour', () => {
    // Graine dont le 2e tirage déclenche le contrôle volant (part d'Olympus-Green) ; le 1er, à risque certain, déclenche l'interception
    const flyingSeed = defined(
      Array.from({ length: 100 }, (_, i) => seedRng(i + 1)).find((seed) => {
        const rng = createRng(seed)
        rng.next()
        return rng.next() < DISTRICTS.D6.flyingCheckShare
      }),
    )
    expect(drawInterception(createRng(flyingSeed), 1, gameAt(3), 'D6')?.kind).toBe('flying')
    expect(drawInterception(createRng(flyingSeed), 1, jammer(), 'D6')).toEqual({ kind: 'brc', acted: false, bluffFailed: false, jammed: true })
    expect(drawInterception(createRng(flyingSeed), 1, jammer({ jammerDay: 3 }), 'D6')?.kind).toBe('flying')
  })

  it('est saisi à la fouille, avec une garde à vue même sur une soute légale', () => {
    const stopped: Interception = { kind: 'brc', acted: false, bluffFailed: false }
    const searched = run(jammer({ districtId: 'D2', interception: stopped, cargo: [lot('T0-01', 2)] }), { type: 'intercept', move: 'search' })
    expect(searched.modules.owned).not.toContain('MOD-09')
    expect(defined(searched.interceptionReport)).toMatchObject({ jammerSeized: true, custodyDays: 1 })
    expect(searched.day).toBe(4)
  })
})
