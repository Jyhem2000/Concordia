import type { Crew, CrewId, Module, ModuleId, Vehicle, VehicleId } from '../engine/types.ts'

/*
 * Véhicules, modules et équipiers. Leurs passifs, effets et bonus sont au chap. 5,
 * les noms dans src/i18n/fr.ts.
 */

/** Véhicule de départ (chap. 5) */
export const START_VEHICLE: VehicleId = 'VEH-01'

export const VEHICLES = {
  'VEH-01': {
    price: 0,
    cargo: 10,
    moduleSlots: 1,
    maxChassis: 100,
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
  },
  'VEH-03': {
    price: 65_000,
    cargo: 30,
    moduleSlots: 3,
    maxChassis: 200,
    tank: 6,
    fuelPerTrip: { day: 1, night: 2 },
  },
  'VEH-04': {
    price: 150_000,
    cargo: 50,
    moduleSlots: 4,
    maxChassis: 300,
    tank: 8,
    fuelPerTrip: { day: 2, night: 3 },
  },
} as const satisfies Record<VehicleId, Vehicle>

export const MODULES = {
  'MOD-01': { price: 18_000, category: 'conservation' },
  'MOD-02': { price: 12_000, category: 'camouflage' },
  'MOD-03': { price: 25_000, category: 'camouflage' },
  'MOD-04': { price: 6_000, category: 'conservation' },
  'MOD-05': { price: 18_000, category: 'tactical' },
  'MOD-06': { price: 15_000, category: 'tactical' },
  'MOD-07': { price: 10_000, category: 'tactical' },
  'MOD-08': { price: 45_000, category: 'tactical' },
} as const satisfies Record<ModuleId, Module>

/** Salaire de base, indexé sur l'inflation ; tarif réduit de CREW-01 : chap. 5 */
export const CREW = {
  'CREW-01': { dailySalary: 800 },
  'CREW-02': { dailySalary: 600 },
  'CREW-03': { dailySalary: 1_000 },
} as const satisfies Record<CrewId, Crew>
