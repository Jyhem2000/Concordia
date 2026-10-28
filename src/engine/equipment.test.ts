import { describe, expect, it } from 'vitest'
import { EJECT, FLEE } from '../data/balance.ts'
import { GARAGE } from '../data/locations.ts'
import { MODULES, VEHICLES } from '../data/vehicles.ts'
import { freshnessOf } from './condition.ts'
import { ejectMode, repairPrice } from './equipment.ts'
import { NO_EVENTS } from './events.ts'
import { inflationIndex } from './inflation.ts'
import { bluffChance, bribeRate, fleeChance } from './interception.ts'
import { riskBreakdown } from './risk.ts'
import { sleep } from './routine.ts'
import { defined, EARNED, errorOf, gameAt, HIGH_ROLL_RNG, LOW_ROLL_RNG, run } from './test-helpers.ts'
import type { CargoLot, GameState, Interception, ModuleId, ProductId } from './types.ts'

const lot = (productId: ProductId, qty: number, boughtDay = 3): CargoLot => ({
  productId,
  qty,
  unitCost: 10,
  travelled: true,
  boughtDay,
  damaged: false,
})
// Client établi : carnet complet et dette soldée (catalogue en rayons, chap. 5)
const atGarage = (patch: Partial<GameState> = {}) =>
  gameAt(3, { districtId: 'D4', cash: 500_000, progress: EARNED, initialDebtPaid: true, debt: 0, ...patch })
const withModules = (mounted: ModuleId[], patch: Partial<GameState> = {}) => gameAt(3, { modules: { owned: mounted, mounted }, ...patch })
const brc: Interception = { kind: 'brc', acted: false, bluffFailed: false }

describe('garage', () => {
  it('vend un châssis qui reprend soute, carburant et modules, et refuse une soute trop pleine', () => {
    const state = atGarage({ cargo: [lot('T1-04', 8)], fuel: 6, modules: { owned: ['MOD-04'], mounted: ['MOD-04'] } })
    const bought = run(state, { type: 'buyVehicle', vehicleId: 'VEH-02' })
    expect(bought).toMatchObject({ vehicleId: 'VEH-02', chassis: VEHICLES['VEH-02'].maxChassis, fuel: 6, cash: 500_000 - VEHICLES['VEH-02'].price })
    expect(bought.modules.mounted).toEqual(['MOD-04'])
    expect(errorOf({ ...bought, cargo: [lot('T1-04', 15)] }, { type: 'buyVehicle', vehicleId: 'VEH-01' })).toBe('cargo-full')
    expect(errorOf(gameAt(3, { cash: 500_000 }), { type: 'buyVehicle', vehicleId: 'VEH-02' })).toBe('not-at-location')
  })

  it('monte un module acheté s’il reste un slot, et démonte au besoin', () => {
    const one = run(atGarage(), { type: 'buyModule', moduleId: 'MOD-04' })
    expect(one.modules).toEqual({ owned: ['MOD-04'], mounted: ['MOD-04'] })
    const two = run(one, { type: 'buyModule', moduleId: 'MOD-02' })
    expect(two.modules.mounted).toEqual(['MOD-04'])
    expect(errorOf(two, { type: 'mountModule', moduleId: 'MOD-02', mount: true })).toBe('no-free-slot')
    const swapped = run(two, { type: 'mountModule', moduleId: 'MOD-04', mount: false }, { type: 'mountModule', moduleId: 'MOD-02', mount: true })
    expect(swapped.modules.mounted).toEqual(['MOD-02'])
  })

  it('répare au prix indexé, moins cher pendant le tournoi de démolition', () => {
    const state = atGarage({ chassis: 50 })
    expect(repairPrice(state).total).toBe(Math.round(GARAGE.repairPerPv * inflationIndex(3)))
    const fixed = run(state, { type: 'repair', pv: 10 })
    expect(fixed.chassis).toBe(60)
    const tournament = atGarage({ events: { ...NO_EVENTS, local: { D4: 'EVT-D4-03' } } })
    expect(repairPrice(tournament).total).toBeLessThan(repairPrice(state).total)
  })
})

describe('fraîcheur et équipement', () => {
  it('suit l’exemple du chap. 3 avec le caisson cryo et la chaîne du froid', () => {
    const base = gameAt(5, { vehicleId: 'VEH-03', modules: { owned: ['MOD-01'], mounted: ['MOD-01'] } })
    const at = (day: number) => freshnessOf({ ...base, day }, lot('T1-03', 1, 5))
    expect(at(7)).toBe('extra')
    expect(at(9)).toBe('standard')
    expect(at(10)).toBe('gamey')
    expect(at(11)).toBe('gamey')
    expect(at(12)).toBe('spoiled')
    expect(at(13)).toBe('spoiled')
    expect(sleep({ ...base, day: 13, cargo: [lot('T1-03', 1, 5)] }).cargo).toHaveLength(0)
  })
})

describe('risque et équipement', () => {
  it('camoufle la navette avec assez de Légal, ou à vide', () => {
    const shuttle = (cargo: CargoLot[]) => riskBreakdown(gameAt(3, { vehicleId: 'VEH-02', cargo }), 'D2', { includePatrol: false })
    const factor = defined(VEHICLES['VEH-02'].legalCamouflage).factor
    expect(shuttle([]).lines.some((line) => line.source === 'VEH-02' && line.value === factor)).toBe(true)
    expect(shuttle([lot('T0-01', 1), lot('T2-03', 9)]).lines.some((line) => line.source === 'VEH-02')).toBe(false)
    expect(shuttle([lot('T0-01', 2), lot('T2-03', 8)]).lines.some((line) => line.source === 'VEH-02')).toBe(true)
  })

  it('alourdit le risque du compacteur, zone hors-réseau comprise', () => {
    const heavy = riskBreakdown(gameAt(3, { vehicleId: 'VEH-04' }), 'D4', { includePatrol: false })
    expect(heavy.lines.some((line) => line.source === 'VEH-04' && line.op === 'add')).toBe(true)
  })
})

describe('barrage et équipement', () => {
  it('ajoute les bonus du faux terminal, du pare-buffles et du transpondeur', () => {
    const stopped = (patch: Partial<GameState>) => gameAt(3, { districtId: 'D3', interception: brc, cargo: [lot('T2-03', 2)], ...patch })
    expect(bluffChance(stopped({ modules: { owned: ['MOD-08'], mounted: ['MOD-08'] } })).total).toBeGreaterThan(bluffChance(stopped({})).total)
    expect(bribeRate(stopped({ modules: { owned: ['MOD-08'], mounted: ['MOD-08'] } })).total).toBeLessThan(bribeRate(stopped({})).total)
    const ram = defined(MODULES['MOD-06'].ram).fleeBonus
    expect(fleeChance(stopped({ modules: { owned: ['MOD-06'], mounted: ['MOD-06'] } })).total).toBeCloseTo(fleeChance(stopped({})).total + ram)
    expect(fleeChance(stopped({ vehicleId: 'VEH-03' })).total).toBeGreaterThan(fleeChance(stopped({})).total)
  })

  it('fuit sans dégât avec le transpondeur, et sans perte d’ICC une fois par jour avec la plaque', () => {
    const fled = run(
      gameAt(3, { districtId: 'D3', vehicleId: 'VEH-03', chassis: VEHICLES['VEH-03'].maxChassis, interception: brc, rng: LOW_ROLL_RNG }),
      { type: 'intercept', move: 'flee' },
    )
    expect(fled.chassis).toBe(VEHICLES['VEH-03'].maxChassis)
    expect(fled.icc).toBe(100 - Math.floor(FLEE.success.iccLoss * defined(VEHICLES['VEH-03'].transponder).iccLossFactor))
    const plated = run(withModules(['MOD-05'], { districtId: 'D2', interception: brc, rng: LOW_ROLL_RNG }), { type: 'intercept', move: 'flee' })
    expect(plated).toMatchObject({ icc: 100, plateDay: 3 })
  })

  it('choisit le mode d’éjection selon le district et l’équipement', () => {
    expect(ejectMode(gameAt(3, { districtId: 'D2' }))).toBe('manual')
    expect(ejectMode(gameAt(3, { districtId: 'D5' }))).toBeNull()
    expect(ejectMode(withModules(['MOD-07'], { districtId: 'D5' }))).toBe('trapdoor')
    expect(ejectMode(withModules(['MOD-07'], { districtId: 'D6' }))).toBeNull()
    expect(ejectMode(gameAt(3, { districtId: 'D6', vehicleId: 'VEH-04' }))).toBe('crusher')
    expect(ejectMode(withModules(['MOD-07'], { districtId: 'D2', trapdoorDay: 2 }))).toBe('manual')
  })

  it('largue par la trappe sans dégât, puis récupère une part des caisses au matin', () => {
    const state = withModules(['MOD-07'], { districtId: 'D2', interception: brc, cargo: [lot('T2-03', 6), lot('T0-01', 2)], rng: LOW_ROLL_RNG })
    const dumped = run(state, { type: 'intercept', move: 'eject' })
    expect(dumped).toMatchObject({ trapdoorDay: 3, chassis: VEHICLES['VEH-01'].maxChassis })
    // Le double fond reste fermé : seules les caisses visibles sont larguées
    const hidden = VEHICLES['VEH-01'].hiddenCompartment
    expect(dumped.dumped).toEqual([lot('T2-03', 6 - hidden)])
    expect(dumped.cargo).toEqual([lot('T0-01', 2), lot('T2-03', hidden)])
    const morning = sleep({ ...dumped, interception: null })
    const recovered = defined(morning.briefing?.recovered)
    expect(recovered.back + recovered.lost).toBe(6 - hidden)
    expect(recovered.back).toBeLessThanOrEqual(Math.floor((6 - hidden) * defined(MODULES['MOD-07'].trapdoor).maxRecovery))
    expect(morning.dumped).toEqual([])
  })

  it('use le châssis à l’éjection manuelle', () => {
    const manual = run(gameAt(3, { districtId: 'D2', interception: brc, cargo: [lot('T2-03', 2)], rng: LOW_ROLL_RNG }), {
      type: 'intercept',
      move: 'eject',
    })
    expect(manual.chassis).toBe(VEHICLES['VEH-01'].maxChassis - EJECT.chassisLoss)
  })

  it('annule l’usure de nuit avec les suspensions', () => {
    const night = run(withModules(['MOD-04'], { phase: 'night', rng: HIGH_ROLL_RNG }), { type: 'travel', to: 'D2' })
    expect(night.tripReport?.chassisWear).toBe(0)
  })
})
