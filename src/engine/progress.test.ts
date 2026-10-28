import { describe, expect, it } from 'vitest'
import { DAY_DELIVERY, DSC_TRUST } from '../data/balance.ts'
import { CREW } from '../data/vehicles.ts'
import { deliveryFee } from './delivery.ts'
import { indexed } from './inflation.ts'
import { crewUnlocked, nightUnlock, requirementProgress, trustFactor } from './progress.ts'
import { errorOf, gameAt, HIGH_ROLL_RNG, LOW_ROLL_RNG, run } from './test-helpers.ts'
import type { CargoLot, GameState, ProductId } from './types.ts'

const lot = (productId: ProductId, qty: number): CargoLot => ({ productId, qty, unitCost: 1, travelled: true, boughtDay: 2, damaged: false })
const brc = { kind: 'brc' as const, acted: false, bluffFailed: false }

describe('progression (chap. 2 et 5)', () => {
  it('ne présente aucun équipier au début, et dit ce qui manque', () => {
    const start = gameAt(3, { cash: 10_000 })
    for (const id of ['CREW-01', 'CREW-02', 'CREW-03'] as const) expect(errorOf(start, { type: 'hireCrew', crewId: id })).toBe('locked')
    expect(requirementProgress(start, { kind: 'tagSales', tag: 'TAG-PERISHABLE', count: 10 })).toEqual({ unlocked: false, done: 0, needed: 10 })
  })

  it('présente Vance après un contrôle franchi sans garde à vue', () => {
    // Soute légale : la fouille n'est qu'une formalité
    const passed = run(gameAt(3, { districtId: 'D2', interception: brc, cargo: [lot('T0-01', 2)] }), { type: 'intercept', move: 'search' })
    expect(passed.progress.controlsPassed).toBe(1)
    expect(crewUnlocked(passed, 'CREW-01')).toBe(true)
    // Garde à vue : le contrôle ne compte pas
    const jailed = run(gameAt(3, { districtId: 'D2', interception: brc, cargo: [lot('T3-01', 1)], rng: LOW_ROLL_RNG }), {
      type: 'intercept',
      move: 'search',
    })
    expect(jailed.progress.controlsPassed).toBe(0)
  })

  it('présente Mama Rosa après des ventes de périssables, Glitch à la première Fiche S', () => {
    const [unlock] = CREW['CREW-03'].requires
    const needed = unlock?.kind === 'tagSales' ? unlock.count : 0
    const sold = run(gameAt(3, { cargo: [lot('T1-03', needed)] }), { type: 'sell', productId: 'T1-03', qty: needed })
    expect(crewUnlocked(sold, 'CREW-03')).toBe(true)
    // Tournée clandestine passée sans barrage : l'écart entre dans les fichiers
    const night: GameState = { ...gameAt(3, { rng: HIGH_ROLL_RNG }), phase: 'night', lastCurfewDay: 3 }
    const strayed = run(night, { type: 'travel', to: 'D2' })
    expect(strayed.progress.flagged).toBe(true)
    expect(crewUnlocked(strayed, 'CREW-02')).toBe(true)
  })

  it('confie la nuit après quelques livraisons, et paie mieux avec la confiance', () => {
    const fresh = gameAt(3, { nightOffer: 'D2' })
    expect(errorOf(fresh, { type: 'forceCurfew', mission: true })).toBe('mission-locked')
    expect(nightUnlock(fresh).needed).toBe(DSC_TRUST.nightAfterDeliveries)
    const trusted = { ...fresh, progress: { ...fresh.progress, deliveries: DSC_TRUST.nightAfterDeliveries } }
    expect(errorOf(trusted, { type: 'forceCurfew', mission: true })).toBeNull()
    expect(trustFactor(trusted)).toBeCloseTo(1 + DSC_TRUST.feeBonusPerDelivery * DSC_TRUST.nightAfterDeliveries)
    expect(deliveryFee(trusted)).toBe(Math.round(indexed('rule.day-delivery', DAY_DELIVERY.fee, 3).total * trustFactor(trusted)))
    const veteran = { ...fresh, progress: { ...fresh.progress, deliveries: 100 } }
    expect(trustFactor(veteran)).toBe(1 + DSC_TRUST.maxBonus)
  })

  it('vend le catalogue du garage en rayons : solvables, fichés, voie officielle', () => {
    const garage = gameAt(3, { districtId: 'D4', cash: 500_000 })
    expect(errorOf(garage, { type: 'buyModule', moduleId: 'MOD-04' })).toBeNull()
    expect(errorOf(garage, { type: 'buyModule', moduleId: 'MOD-01' })).toBe('locked')
    expect(errorOf(garage, { type: 'buyModule', moduleId: 'MOD-09' })).toBe('locked')
    expect(errorOf(garage, { type: 'buyVehicle', vehicleId: 'VEH-02' })).toBe('locked')
    const solvent = { ...garage, initialDebtPaid: true, debt: 0 }
    expect(errorOf(solvent, { type: 'buyModule', moduleId: 'MOD-01' })).toBeNull()
    const flagged = { ...garage, progress: { ...garage.progress, flagged: true } }
    expect(errorOf(flagged, { type: 'buyModule', moduleId: 'MOD-09' })).toBeNull()
  })

  it('réserve les services : Cassandre aux fichés, le Velvet-Silo aux présentables et fortunés', () => {
    const bunker = gameAt(3, { districtId: 'D4', cash: 50_000, cargo: [lot('T3-03', 1)] })
    expect(errorOf(bunker, { type: 'prophecy' })).toBe('locked')
    expect(errorOf({ ...bunker, progress: { ...bunker.progress, flagged: true } }, { type: 'prophecy' })).toBeNull()
    const silo = gameAt(3, { districtId: 'D6', cash: 100_000, icc: 80 })
    expect(errorOf(silo, { type: 'vipRequest' })).toBeNull()
    // Sous le palier ordinaire, ou trop pauvre : porte close
    expect(errorOf({ ...silo, icc: 40 }, { type: 'vipRequest' })).toBe('locked')
    expect(errorOf({ ...silo, cash: 1_000 }, { type: 'vipRequest' })).toBe('locked')
  })

  it('compte la livraison faite au carnet', () => {
    const loaded = run(gameAt(3, { districtId: 'D1', dayOffer: 'D2', rng: HIGH_ROLL_RNG }), { type: 'acceptDelivery' })
    const delivered = run(loaded, { type: 'travel', to: 'D2' })
    expect(delivered.progress.deliveries).toBe(1)
  })
})
