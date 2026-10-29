import { describe, expect, it } from 'vitest'
import {
  AFTER,
  CROSSED_DISTRICT_RISK,
  DEBT_LATE,
  GOLD_FAST_LANE_FACTOR,
  MASKED_CRATE_WEIGHT,
  NIGHT_TRIP_RISK,
  PATROL_RISK,
  RISK_BOUNDS,
  SUSPICION_PER_ICC_POINT,
  SUSPICIOUS_PEAK_RISK,
  WANTED,
} from '../data/balance.ts'
import { DISTRICTS } from '../data/districts.ts'
import { PRODUCT_IDS, PRODUCTS } from '../data/products.ts'
import { TAGS } from '../data/tags.ts'
import { VEHICLES } from '../data/vehicles.ts'
import { risk, riskBreakdown } from './risk.ts'
import { defined, gameAt } from './test-helpers.ts'
import type { CargoLot, DistrictId, GameState, ProductId } from './types.ts'

const lot = (productId: ProductId, qty: number): CargoLot => ({ productId, qty, unitCost: 1, travelled: true, boughtDay: 1, damaged: false })
const vehicleFactor = defined(VEHICLES['VEH-01'].riskFactor)

const termOf = (state: GameState, to: DistrictId, source: string) =>
  riskBreakdown(state, to, { includePatrol: true }).lines.find((line) => line.source === source)?.value ?? 0

describe('risque d’interception', () => {
  it('part du risque de base, multiplié par le profil bas du véhicule de départ', () => {
    // Hives → Pastel-Heights, de jour, soute vide, ICC plein
    expect(risk(gameAt(2), 'D2', { includePatrol: false })).toBeCloseTo(DISTRICTS.D2.baseRisk * vehicleFactor)
  })

  it('ajoute la suspicion selon l’ICC manquant', () => {
    expect(termOf(gameAt(2, { icc: 80 }), 'D2', 'rule.suspicion')).toBeCloseTo(20 * SUSPICION_PER_ICC_POINT)
  })

  it('ne compte un tag détecté que dans les districts qui le détectent, et la couverture légale partout', () => {
    const tech = defined(PRODUCT_IDS.find((id) => PRODUCTS[id].tags.includes('TAG-TECH') && !PRODUCTS[id].lethalOnSearch))
    const legal = defined(PRODUCT_IDS.find((id) => PRODUCTS[id].tags.includes('TAG-LEGAL')))
    const state = gameAt(2, { districtId: 'D2', cargo: [lot(tech, 4), lot(legal, 4)] })
    expect(termOf(state, 'D5', 'TAG-TECH')).toBeCloseTo(defined(TAGS['TAG-TECH'].detectedRisk) * 0.5)
    expect(termOf(state, 'D3', 'TAG-TECH')).toBe(0)
    expect(termOf(state, 'D3', 'TAG-LEGAL')).toBeCloseTo(-defined(TAGS['TAG-LEGAL'].cover) * 0.5)
  })

  it('compte pour moitié une caisse masquée par du Tier 0', () => {
    const masker = defined(PRODUCT_IDS.find((id) => PRODUCTS[id].masks === 'TAG-ODOROUS'))
    const smelly = defined(PRODUCT_IDS.find((id) => PRODUCTS[id].tags.includes('TAG-ODOROUS')))
    const masked = gameAt(2, { cargo: [lot(smelly, 2), lot(masker, 2)] })
    const share = (2 * MASKED_CRATE_WEIGHT) / 4
    expect(termOf(masked, 'D2', 'TAG-ODOROUS')).toBeCloseTo(defined(TAGS['TAG-ODOROUS'].tripRisk) * share)
    // Les chiens-robots doublent les malus d'odeur
    expect(termOf({ ...masked, districtId: 'D5' }, 'D6', 'TAG-ODOROUS')).toBeCloseTo(
      defined(TAGS['TAG-ODOROUS'].tripRisk) * share * DISTRICTS.D6.odorFactor,
    )
  })

  it("réduit le malus de nuit hors mission vers l'after du couvre-feu (la foule couvre)", () => {
    const state = gameAt(2, { phase: 'night', after: 'D2' })
    expect(termOf(state, 'D2', 'rule.after')).toBeCloseTo(-NIGHT_TRIP_RISK * (1 - AFTER.nightRiskFactor))
    expect(termOf(state, 'D5', 'rule.after')).toBe(0)
    expect(termOf({ ...state, phase: 'day' }, 'D2', 'rule.after')).toBe(0)
  })

  it('cumule les malus de contexte', () => {
    const state = gameAt(2, { phase: 'night', wanted: 2, debtLate: true, suspiciousPeaks: ['D6'], patrolDistrict: 'D6' })
    // Hives → Olympus-Green traverse deux districts
    expect(termOf(state, 'D6', 'rule.night-trip')).toBe(NIGHT_TRIP_RISK)
    expect(termOf(state, 'D6', 'rule.crossed-districts')).toBeCloseTo(2 * CROSSED_DISTRICT_RISK)
    expect(termOf(state, 'D6', 'rule.wanted')).toBeCloseTo(2 * WANTED.riskPerLevel)
    expect(termOf(state, 'D6', 'rule.ambush')).toBe(DEBT_LATE.ambushRisk)
    expect(termOf(state, 'D6', 'rule.suspicious-peak')).toBe(SUSPICIOUS_PEAK_RISK)
    expect(termOf(state, 'D6', 'rule.patrol')).toBe(PATROL_RISK)
  })

  it('cache la ronde renforcée dans la prévision', () => {
    const state = gameAt(2, { patrolDistrict: 'D2' })
    expect(risk(state, 'D2', { includePatrol: true })).toBeGreaterThan(risk(state, 'D2', { includePatrol: false }))
  })

  it('ajoute le portique du sas au départ de Rust Valley et la balise de traçage partout', () => {
    expect(termOf(gameAt(2, { districtId: 'D4' }), 'D1', 'rule.exit-gate')).toBe(DISTRICTS.D4.exitGateRisk)
    expect(termOf(gameAt(2, { cargo: [lot('T4-06', 1)] }), 'D2', 'T4-06')).toBe(PRODUCTS['T4-06'].beaconRisk)
  })

  it('applique le coupe-file aux Citoyens Or là où il existe', () => {
    const gold = gameAt(2, { districtId: 'D2', icc: 100 })
    expect(termOf(gold, 'D5', 'rule.gold-fast-lane')).toBe(GOLD_FAST_LANE_FACTOR)
    expect(termOf({ ...gold, icc: 60 }, 'D5', 'rule.gold-fast-lane')).toBe(0)
  })

  it('reste dans ses bornes après tous les multiplicateurs', () => {
    expect(risk(gameAt(2, { icc: 30, phase: 'night', wanted: 3, debtLate: true }), 'D6', { includePatrol: true })).toBe(RISK_BOUNDS.max)
    expect(risk(gameAt(2, { cargo: [lot('T0-01', 10)] }), 'D2', { includePatrol: false })).toBeGreaterThanOrEqual(RISK_BOUNDS.min)
  })

  it('ignore en zone hors-réseau tout ce qui dépend d’Aeterna', () => {
    const state = gameAt(2, { icc: 10, wanted: 3, cargo: [lot('T4-06', 1)] })
    const sources = riskBreakdown(state, 'D4', { includePatrol: true }).lines.map((line) => line.source)
    expect(sources).not.toContain('rule.suspicion')
    expect(sources).not.toContain('rule.wanted')
    expect(sources).not.toContain('TAG-TECH')
    // La balise, physique, reste
    expect(sources).toContain('T4-06')
  })

  it('intercepte à coup sûr un Déviant notoire aux détecteurs biométriques', () => {
    expect(risk(gameAt(2, { icc: 10, districtId: 'D5' }), 'D6', { includePatrol: false })).toBe(1)
    expect(risk(gameAt(2, { icc: 10 }), 'D2', { includePatrol: false })).toBeLessThan(1)
  })
})
