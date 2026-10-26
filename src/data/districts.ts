import type { District, DistrictId } from '../engine/types.ts'

/*
 * Districts et carte. Les règles géographiques, les menaces propres à chaque district
 * et les lieux spéciaux sont au chap. 4, les noms dans src/i18n/fr.ts.
 * Montants en ₡ : valeurs de base au Jour 1, indexées sur l'inflation (chap. 7).
 */

export const DISTRICTS = {
  D1: {
    echelon: 1,
    security: 1,
    baseRisk: 0.1,
    fuelPrice: 80,
    pump: 'official',
    detection: null,
    droneJudges: false,
    coefProduction: 0.75,
    coefStrongDemand: 1.5,
    production: [
      'T0-01',
      'T0-02',
      'T1-04',
      'T1-06',
      'T2-03', // caves des Ruches
      'T2-04', // ateliers de réparation clandestins
    ],
    strongDemand: ['T1-01', 'T1-02', 'T1-05', 'T2-01', 'T2-02', 'T2-05', 'T2-06'],
  },
  D2: {
    echelon: 2,
    security: 2,
    baseRisk: 0.2,
    fuelPrice: 120,
    pump: 'official',
    detection: 'TAG-CULTURE', // délation idéologique
    droneJudges: false,
    coefProduction: 0.75,
    coefStrongDemand: 1.6,
    production: ['T0-01', 'T0-04', 'T1-02', 'T2-06', 'T2-07', 'T3-05', 'T3-07'],
    strongDemand: ['T1-03', 'T2-02', 'T2-03', 'T3-01', 'T4-04'],
  },
  D3: {
    echelon: 3,
    security: 3,
    baseRisk: 0.35,
    fuelPrice: 150,
    pump: 'official',
    detection: 'TAG-CHEMICAL', // bio-scanners
    droneJudges: false,
    coefProduction: 0.75,
    coefStrongDemand: 1.75,
    production: ['T0-02', 'T0-03', 'T1-05', 'T2-05', 'T3-04', 'T4-04', 'T4-05'],
    strongDemand: ['T1-02', 'T2-01', 'T2-03', 'T3-02', 'T3-03'],
  },
  D4: {
    echelon: 0,
    security: 2,
    baseRisk: 0.2,
    fuelPrice: 80,
    pump: 'fixed', // pompe pirate
    detection: null, // zone hors-réseau
    droneJudges: false,
    coefProduction: 0.75,
    coefStrongDemand: 1.4,
    production: ['T1-01', 'T1-03', 'T2-01', 'T2-02', 'T3-01', 'T3-02', 'T3-03', 'T3-06', 'T4-01', 'T4-02'],
    strongDemand: ['T1-04', 'T1-06', 'T2-06', 'T2-07', 'T3-04', 'T3-05', 'T4-03', 'T4-04', 'T4-06'],
  },
  D5: {
    echelon: 4,
    security: 4,
    baseRisk: 0.4,
    fuelPrice: 200,
    pump: 'official',
    detection: 'TAG-TECH', // scanners électromagnétiques
    droneJudges: true,
    coefProduction: 0.75,
    coefStrongDemand: 1.9,
    production: [
      'T0-03',
      'T0-04',
      'T2-06', // saisies de la censure
      'T4-03',
      'T4-06', // fuites rares
    ],
    strongDemand: ['T1-02', 'T1-05', 'T2-04', 'T3-02', 'T3-03', 'T3-06', 'T3-07', 'T4-02', 'T4-04'],
  },
  D6: {
    echelon: 5,
    security: 5,
    baseRisk: 0.55,
    fuelPrice: 300,
    pump: 'official',
    detection: 'TAG-TECH', // scanners électromagnétiques (les chiens-robots : chap. 4)
    droneJudges: true,
    coefProduction: 0.85,
    coefStrongDemand: 2.3,
    // Réserves VIP, stocks très restreints
    production: ['T4-03', 'T4-04'],
    // « Vente jackpot »
    strongDemand: ['T1-03', 'T2-07', 'T3-01', 'T3-02', 'T3-03', 'T3-07', 'T4-01', 'T4-02', 'T4-05', 'T4-06'],
  },
} as const satisfies Record<DistrictId, District>

/**
 * Liaisons directes du Réseau Logistique Souterrain (non orientées).
 *
 *   D4 — D1 — D2 — D5 — D6
 *          \   |   /
 *           \ D3 /
 */
export const MAP_LINKS = [
  ['D4', 'D1'],
  ['D1', 'D2'],
  ['D1', 'D3'],
  ['D2', 'D3'],
  ['D2', 'D5'],
  ['D3', 'D5'],
  ['D5', 'D6'],
] as const satisfies readonly (readonly [DistrictId, DistrictId])[]
