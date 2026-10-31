import { keysOf } from '../engine/records.ts'
import type { District, DistrictId } from '../engine/types.ts'

/*
 * Districts et carte. Les règles géographiques, les menaces propres à chaque district
 * et les lieux spéciaux sont au chap. 3, les noms dans src/i18n/fr.ts.
 */

export const DISTRICTS: Readonly<Record<DistrictId, District>> = {
  D1: {
    echelon: 1,
    security: 1,
    baseRisk: 0.06,
    fuelPrice: 120,
    pump: 'official',
    relay: true,
    detection: null,
    droneJudges: false,
    offGrid: false,
    exitGateRisk: 0,
    odorFactor: 1,
    goldFastLane: false,
    iccScanners: false,
    access: 'street',
    flyingCheckShare: 0.15,
    ejection: { manual: true, trapdoor: true },
    tollFavorites: [],
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
    baseRisk: 0.12,
    fuelPrice: 180,
    pump: 'official',
    relay: true,
    detection: 'TAG-CULTURE', // délation idéologique
    droneJudges: false,
    offGrid: false,
    exitGateRisk: 0,
    odorFactor: 1,
    goldFastLane: false,
    iccScanners: false,
    access: 'street',
    flyingCheckShare: 0.25,
    ejection: { manual: true, trapdoor: true },
    tollFavorites: [],
    coefProduction: 0.75,
    coefStrongDemand: 1.6,
    production: ['T0-01', 'T0-04', 'T1-02', 'T2-06', 'T2-07', 'T3-05', 'T3-07'],
    strongDemand: ['T1-03', 'T2-02', 'T2-03', 'T3-01', 'T4-04'],
  },
  D3: {
    echelon: 3,
    security: 3,
    baseRisk: 0.21,
    fuelPrice: 225,
    pump: 'official',
    relay: true,
    detection: 'TAG-CHEMICAL', // bio-scanners
    droneJudges: false,
    offGrid: false,
    exitGateRisk: 0,
    odorFactor: 1,
    goldFastLane: false,
    iccScanners: false,
    access: 'street',
    flyingCheckShare: 0.3,
    ejection: { manual: true, trapdoor: true },
    tollFavorites: [],
    coefProduction: 0.75,
    coefStrongDemand: 1.75,
    production: ['T0-02', 'T0-03', 'T1-05', 'T2-05', 'T3-04', 'T4-04', 'T4-05'],
    strongDemand: ['T1-02', 'T2-01', 'T2-03', 'T3-02', 'T3-03'],
  },
  D4: {
    echelon: 0,
    security: 2,
    baseRisk: 0.12,
    fuelPrice: 120,
    pump: 'fixed', // pompe pirate
    relay: false, // pas de relais du DSC : bivouac
    detection: null, // zone hors-réseau
    droneJudges: false,
    offGrid: true, // zone hors-réseau : racket des milices
    exitGateRisk: 0.15, // portique du sas
    odorFactor: 1,
    goldFastLane: false,
    iccScanners: false,
    access: 'street',
    flyingCheckShare: 0,
    ejection: { manual: true, trapdoor: true },
    tollFavorites: ['T1-06', 'T3-03', 'T3-04'], // ce qui manque aux bannis
    coefProduction: 0.75,
    coefStrongDemand: 1.4,
    // Le moteur ne tire chaque jour qu'une partie de la liste de production
    productionDraw: { min: 6, max: 8 },
    production: ['T1-01', 'T1-03', 'T2-01', 'T2-02', 'T3-01', 'T3-02', 'T3-03', 'T3-06', 'T4-01', 'T4-02'],
    strongDemand: ['T1-04', 'T1-06', 'T2-06', 'T2-07', 'T3-04', 'T3-05', 'T4-03', 'T4-04', 'T4-06'],
  },
  D5: {
    echelon: 4,
    security: 4,
    baseRisk: 0.24,
    fuelPrice: 300,
    pump: 'official',
    relay: true,
    detection: 'TAG-TECH', // scanners électromagnétiques
    droneJudges: true,
    offGrid: false,
    exitGateRisk: 0,
    odorFactor: 1,
    goldFastLane: true,
    iccScanners: false,
    access: 'docks', // quais de service des élites
    flyingCheckShare: 0.4,
    ejection: { manual: false, trapdoor: true }, // LiDAR : seuls les égouts
    tollFavorites: [],
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
    baseRisk: 0.33,
    fuelPrice: 450,
    pump: 'official',
    relay: true,
    detection: 'TAG-TECH', // scanners électromagnétiques (les chiens-robots : chap. 3)
    droneJudges: true,
    offGrid: false,
    exitGateRisk: 0,
    odorFactor: 2, // chiens-robots militaires
    goldFastLane: true,
    iccScanners: true,
    access: 'docks', // quais de service des élites
    flyingCheckShare: 0.5,
    ejection: { manual: false, trapdoor: false }, // dalle bio-scellée
    tollFavorites: [],
    coefProduction: 0.85,
    coefStrongDemand: 2.3,
    // Réserves VIP, stocks très restreints
    production: ['T4-03', 'T4-04'],
    // « Vente jackpot »
    strongDemand: ['T1-03', 'T2-07', 'T3-01', 'T3-02', 'T3-03', 'T3-07', 'T4-01', 'T4-02', 'T4-05', 'T4-06'],
  },
}

/**
 * Liaisons directes du réseau logistique (non orientées).
 *
 *   D4 — D1 — D2 — D5 — D6
 *          \   |   /
 *           \ D3 /
 */
export const MAP_LINKS: readonly (readonly [DistrictId, DistrictId])[] = [
  ['D4', 'D1'],
  ['D1', 'D2'],
  ['D1', 'D3'],
  ['D2', 'D3'],
  ['D2', 'D5'],
  ['D3', 'D5'],
  ['D5', 'D6'],
]

export const DISTRICT_IDS = keysOf(DISTRICTS)
