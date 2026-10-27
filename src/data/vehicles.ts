import type { Crew, CrewId, Module, ModuleId, Vehicle, VehicleId } from '../engine/types.ts'

/*
 * Véhicules, modules et équipiers. Leurs passifs, effets et bonus sont au chap. 5,
 * les noms dans src/i18n/fr.ts.
 */

/** Véhicule de départ (chap. 5) */
export const START_VEHICLE: VehicleId = 'VEH-01'

export const VEHICLES: Readonly<Record<VehicleId, Vehicle>> = {
  'VEH-01': {
    price: 0,
    cargo: 10,
    moduleSlots: 1,
    maxChassis: 100,
    riskFactor: 0.9, // profil bas, zone hors-réseau comprise
    tank: 6,
    fuelPerTrip: { day: 1, night: 1 },
  },
  'VEH-02': {
    price: 22_000,
    cargo: 20,
    moduleSlots: 2,
    maxChassis: 150,
    tank: 6,
    fuelPerTrip: { day: 1, night: 2 },
    legalCamouflage: { minShare: 0.2, factor: 0.85 },
  },
  'VEH-03': {
    price: 65_000,
    cargo: 30,
    moduleSlots: 3,
    maxChassis: 200,
    tank: 6,
    fuelPerTrip: { day: 1, night: 2 },
    coldChain: true,
    transponder: { districts: ['D3', 'D5'], fleeBonus: 0.25, iccLossFactor: 0.5 },
  },
  'VEH-04': {
    price: 150_000,
    cargo: 50,
    moduleSlots: 4,
    maxChassis: 300,
    tank: 8,
    fuelPerTrip: { day: 2, night: 3 },
    heavy: { tollFactor: 0.5, crusherChance: 0.7, riskAdd: 0.1 },
  },
}

export const MODULES: Readonly<Record<ModuleId, Module>> = {
  'MOD-01': { price: 18_000, category: 'conservation', freshnessDelay: 1, heatProof: true },
  'MOD-02': { price: 12_000, category: 'camouflage', tagFactor: { tag: 'TAG-ODOROUS', factor: 0.25 } },
  'MOD-03': { price: 25_000, category: 'camouflage', tagFactor: { tag: 'TAG-TECH', factor: 0 } },
  'MOD-04': { price: 6_000, category: 'conservation', smoothRide: true },
  'MOD-05': { price: 18_000, category: 'tactical', rotatingPlate: true },
  'MOD-06': { price: 15_000, category: 'tactical', ram: { fleeBonus: 0.3, damageFactor: 0.5 } },
  'MOD-07': { price: 10_000, category: 'tactical', trapdoor: { chance: 0.75, cooldownDays: 3, maxRecovery: 0.75 } },
  'MOD-08': { price: 45_000, category: 'tactical', fakeTerminal: { bluffBonus: 0.35, bribeRateFactor: 0.5 } },
}

/** Salaire de base, indexé sur l'inflation ; tarif réduit de CREW-01 : chap. 5 */
export const CREW: Readonly<Record<CrewId, Crew>> = {
  'CREW-01': { dailySalary: 800 },
  'CREW-02': { dailySalary: 600 },
  'CREW-03': { dailySalary: 1_000 },
}
