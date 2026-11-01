import type { Crew, CrewId, Module, ModuleId, Vehicle, VehicleId } from '../engine/types.ts'

/*
 * Véhicules, modules et équipiers. Leurs passifs, effets et bonus sont au chap. 4,
 * les noms dans src/i18n/fr.ts.
 */

/** Véhicule de départ (chap. 4) */
export const START_VEHICLE: VehicleId = 'VEH-01'

export const VEHICLES: Readonly<Record<VehicleId, Vehicle>> = {
  'VEH-01': {
    price: 0,
    cargo: 10,
    hiddenCompartment: 2,
    moduleSlots: 1,
    maxChassis: 100,
    riskFactor: 0.9, // profil bas, zone hors-réseau comprise
    tank: 6,
    fuelPerTrip: { day: 1, night: 1 },
  },
  'VEH-02': {
    requires: [{ kind: 'deliveries', count: 3 }],
    price: 15_000,
    cargo: 25,
    hiddenCompartment: 3,
    moduleSlots: 2,
    maxChassis: 150,
    tank: 6,
    fuelPerTrip: { day: 1, night: 2 },
    legalCamouflage: { minShare: 0.2, factor: 0.85 },
  },
  'VEH-03': {
    requires: [{ kind: 'debtPaid' }],
    price: 25_000,
    cargo: 25,
    hiddenCompartment: 4,
    moduleSlots: 3,
    maxChassis: 200,
    tank: 6,
    fuelPerTrip: { day: 1, night: 2 },
    coldChain: true,
    transponder: { districts: ['D3', 'D5'], fleeBonus: 0.25, iccLossFactor: 0.5 },
  },
  'VEH-04': {
    requires: [{ kind: 'debtPaid' }],
    price: 55_000,
    cargo: 50,
    hiddenCompartment: 6,
    moduleSlots: 4,
    maxChassis: 300,
    tank: 8,
    fuelPerTrip: { day: 2, night: 3 },
    heavy: { tollFactor: 0.5, crusherChance: 0.7, riskAdd: 0.05 },
  },
}

export const MODULES: Readonly<Record<ModuleId, Module>> = {
  'MOD-01': { requires: [{ kind: 'debtPaid' }], price: 2_000, category: 'conservation', fitting: 'adaptable', freshnessDelay: 2, heatProof: true },
  'MOD-02': { price: 3_500, category: 'camouflage', fitting: 'adaptable', tagFactor: { tag: 'TAG-ODOROUS', factor: 0.1 } },
  'MOD-03': {
    requires: [{ kind: 'debtPaid' }],
    price: 4_000,
    category: 'camouflage',
    fitting: 'welded',
    tagFactor: { tag: 'TAG-TECH', factor: 0 },
    flyingCheckFactor: 0.5,
  },
  'MOD-04': { price: 2_000, category: 'conservation', fitting: 'adaptable', smoothRide: true, nightRiskFactor: 0.5 },
  'MOD-05': { requires: [{ kind: 'wanted' }], price: 4_000, category: 'tactical', fitting: 'portable', rotatingPlate: true },
  'MOD-06': {
    requires: [{ kind: 'debtPaid' }],
    price: 4_000,
    category: 'tactical',
    fitting: 'adaptable',
    ram: { fleeBonus: 0.4, damageFactor: 0.5 },
  },
  'MOD-07': {
    requires: [{ kind: 'debtPaid' }],
    price: 4_000,
    category: 'tactical',
    fitting: 'welded',
    trapdoor: { chance: 0.75, cooldownDays: 3, maxRecovery: 1 },
  },
  'MOD-08': {
    requires: [{ kind: 'deliveries', count: 3 }],
    price: 12_000,
    category: 'tactical',
    fitting: 'portable',
    fakeTerminal: { bluffBonus: 0.35, bribeRateFactor: 0.5 },
  },
  'MOD-09': { requires: [{ kind: 'wanted' }], price: 5_000, category: 'tactical', fitting: 'portable', droneJammer: true },
  'MOD-10': {
    requires: [{ kind: 'compartmentHeld', count: 1 }],
    price: 15_000,
    category: 'camouflage',
    fitting: 'welded',
    compartmentFactor: 0.5,
  },
}

/** Frais de recrutement au Quai 9 (le premier recrutement est gratuit) */
export const CREW_HIRE_FEE = 1_500

/** Salaires et bonus des équipiers (chap. 4) */
export const CREW: Readonly<Record<CrewId, Crew>> = {
  'CREW-01': {
    requires: [{ kind: 'controls', count: 1 }],
    dailySalary: 400,
    inKindSalary: { amount: 200, tag: 'TAG-ADDICTIVE', minTier: 2 },
    riskFactor: 0.8,
    bribeBonus: 0.15,
    revealsPatrol: true,
  },
  'CREW-02': {
    requires: [{ kind: 'wanted' }],
    dailySalary: 600,
    liveQuotes: true,
    masksBeacon: true,
    offshoreBonus: 0.005,
    fleeBonus: 0.2,
    forgeryBonus: 0.2,
  },
  'CREW-03': {
    requires: [{ kind: 'tagSales', tag: 'TAG-GOURMET', count: 10 }],
    dailySalary: 250,
    gourmetKnowHow: 1.5,
    refining: true,
    gourmetQuota: 2.5,
  },
}
