import type { DistrictId, GameEvent, GlobalEventId, LocalEventId, RoadEvent, RoadEventId } from '../engine/types.ts'

/*
 * Événements (chap. 6) : chances, durées et effets chiffrés. Les règles et le lore sont au chap. 6,
 * les libellés et les rumeurs dans src/i18n/fr.ts.
 */

/** Chances de déclenchement : global (tiré la veille), local par district, aléa par trajet sans interception */
export const EVENT_CHANCES = { global: 0.3, local: 0.2, road: 0.25 }

/** Cooldowns en jours : un événement déclenché le jour J revient au plus tôt le jour J + cooldown */
export const EVENT_COOLDOWNS = { local: 4, road: 5 }

/** Plafond de Mult_Événement (chap. 2) */
export const EVENT_MULT_CAP = 4

/** Rumeurs : chance qu'un événement global de demain fuite, chance d'une fausse rumeur sans événement */
export const RUMOR = { leak: 0.7, falseAlarm: 0.1 }

/** Contrecoups : facteur du lendemain d'une ruée (multiplicateur > 1) ou d'une braderie (< 1) */
export const AFTERSHOCK = { afterRush: 0.8, afterSale: 1.2 }

/** Loterie de l'Ascenseur Civique (EVT-L01) */
export const LOTTERY = {
  days: [4, 11, 18, 25] as readonly number[],
  promotedFrom: ['D1', 'D2', 'D3', 'D5'] as readonly DistrictId[],
  demotedFrom: ['D2', 'D3', 'D5'] as readonly DistrictId[],
  /** District inférieur où le déclassé emporte ses vices */
  lower: { D2: 'D1', D3: 'D2', D5: 'D3' } as Readonly<Partial<Record<DistrictId, DistrictId>>>,
  /** Purge préventive : risque ajouté dans le district du promu, le jour du tirage */
  promotedRisk: 0.15,
  /** Durée des vices, jour du tirage compris */
  viceDays: 3,
  /** Chance que le promu soit l'équipier actif (équipage, chap. 4) */
  crewLossChance: 0.1,
  /** Chance qu'un tirage désigne aussi un déclassé (garanti par un faux dossier « cadre ») */
  demotionChance: 0.5,
}

/** District hors zone hors-réseau : cible des alertes d'Aeterna */
const GRID: readonly DistrictId[] = ['D1', 'D2', 'D3', 'D5', 'D6']

export const GLOBAL_EVENTS: Readonly<Record<GlobalEventId, GameEvent>> = {
  'EVT-G01': {
    effects: [
      { kind: 'price', products: ['T0-02', 'T1-01', 'T2-05'], factor: 2.5 },
      { kind: 'heat', melts: 'T1-03', ageDays: 1, dayTripChassis: 5, dayTripHealth: 2 },
    ],
    days: 3,
  },
  'EVT-G02': {
    effects: [
      { kind: 'price', products: ['T3-04'], factor: 3.5 },
      { kind: 'price', products: ['T2-07'], factor: 2.5 },
      { kind: 'price', products: ['T1-04', 'T0-03'], factor: 2 },
      { kind: 'risk', add: 0.15, districts: GRID },
    ],
  },
  'EVT-G03': {
    effects: [
      { kind: 'price', products: ['T1-02', 'T1-05', 'T2-03', 'T2-04', 'T2-06', 'T3-06'], factor: 3 },
      { kind: 'tag', tag: 'TAG-TECH', factor: 0, districts: ['D5'] },
    ],
  },
  'EVT-G04': {
    effects: [
      { kind: 'price', products: ['T0-01', 'T3-05'], factor: 2 },
      { kind: 'price', products: ['T2-02', 'T3-01', 'T4-01'], factor: 0.6, dayOnly: true },
      { kind: 'tag', tag: 'TAG-ODOROUS', factor: 2 },
    ],
  },
  'EVT-G05': {
    effects: [
      { kind: 'price', products: { tiers: [1, 2] }, factor: 1.5 },
      { kind: 'price', products: ['T1-04'], factor: 2.5 },
      { kind: 'stock', factor: 0.5 },
    ],
  },
  'EVT-G06': {
    effects: [{ kind: 'price', products: ['T3-01', 'T3-02', 'T3-03', 'T4-01', 'T4-02'], factor: 3, districts: ['D5', 'D6'] }],
  },
}

export const LOCAL_EVENTS: Readonly<Record<LocalEventId, GameEvent>> = {
  'EVT-D1-01': {
    effects: [
      { kind: 'price', products: ['T1-06'], factor: 0.5 },
      { kind: 'tag', tag: 'TAG-ODOROUS', factor: 0 },
      { kind: 'stock', products: ['T1-06'], factor: 2 },
    ],
  },
  'EVT-D1-02': { effects: [{ kind: 'price', products: ['T3-03', 'T2-01', 'T1-03', 'T1-02'], factor: 2 }] },
  'EVT-D1-03': {
    effects: [
      { kind: 'appear', products: ['T2-07', 'T3-02', 'T3-06'], factor: 0.6 },
      { kind: 'risk', add: 0.2 },
    ],
  },
  'EVT-D2-01': {
    effects: [
      { kind: 'price', products: ['T2-02', 'T1-03'], factor: 2.5 },
      { kind: 'tag', tag: 'TAG-CULTURE', factor: 2 },
    ],
  },
  'EVT-D2-02': { effects: [{ kind: 'price', products: ['T2-04', 'T2-07', 'T2-03'], factor: 3 }] },
  'EVT-D2-03': { effects: [{ kind: 'price', products: { tag: 'TAG-CHEMICAL' }, factor: 2.5 }] },
  'EVT-D3-01': {
    effects: [{ kind: 'price', products: ['T3-04', 'T2-07'], factor: 4 }, { kind: 'halfDay' }],
  },
  'EVT-D3-02': {
    effects: [
      { kind: 'price', products: { tag: 'TAG-ADDICTIVE' }, factor: 2.5 },
      { kind: 'finalRisk', factor: 0.5 },
    ],
  },
  'EVT-D3-03': {
    effects: [
      { kind: 'price', products: ['T0-03', 'T3-04'], factor: 0.4 },
      { kind: 'stock', products: ['T0-03', 'T3-04'], factor: 2 },
    ],
  },
  'EVT-D4-01': {
    effects: [
      { kind: 'price', products: ['T0-02', 'T1-04', 'T3-04', 'T4-04'], factor: 3 },
      { kind: 'risk', add: 0.25 },
    ],
  },
  'EVT-D4-02': {
    effects: [{ kind: 'appear', products: ['T3-03', 'T3-02', 'T3-06', 'T4-01', 'T4-02'], count: { min: 3, max: 5 }, factor: 0.65 }],
  },
  'EVT-D4-03': {
    effects: [
      { kind: 'price', products: ['T1-06', 'T2-02', 'T3-03'], factor: 2.2 },
      { kind: 'repair', factor: 0.8 },
    ],
  },
  'EVT-D5-01': { effects: [{ kind: 'price', products: ['T0-03', 'T1-02', 'T1-05', 'T3-03'], factor: 2.8 }] },
  'EVT-D5-02': {
    effects: [
      { kind: 'appear', products: ['T2-06', 'T3-02', 'T3-07', 'T4-03'], factor: 0.5 },
      { kind: 'baseRisk', value: 0.36 },
    ],
  },
  'EVT-D5-03': {
    effects: [
      { kind: 'finalRisk', factor: 0.5 },
      { kind: 'tag', tag: 'TAG-TECH', factor: 0 },
    ],
  },
  'EVT-D6-01': { effects: [{ kind: 'price', products: ['T3-01', 'T3-02', 'T3-03', 'T4-01'], factor: 3.5 }] },
  'EVT-D6-02': { effects: [{ kind: 'price', products: ['T2-04', 'T3-07', 'T4-03'], factor: 4 }] },
  // Prévu à ×5 : ramené au plafond de Mult_Événement (chap. 6)
  'EVT-D6-03': { effects: [{ kind: 'price', products: ['T1-01', 'T1-03', 'T1-04'], factor: 4 }] },
}

export const ROAD_EVENTS: Readonly<Record<RoadEventId, RoadEvent>> = {
  'EVT-R01': { a: { pay: [{ crates: { qty: 1, tag: 'TAG-ADDICTIVE' } }, { cash: 450 }] }, b: { outcome: { icc: -4 } } },
  'EVT-R02': { a: { pay: [{ crates: { qty: 1, productId: 'T0-01' } }, { cash: 375 }] }, b: { outcome: { chassis: -5, icc: -5 } } },
  'EVT-R03': { a: { pay: [{ fuel: 1 }], outcome: { icc: 1 } }, b: { outcome: { icc: -4 } } },
  'EVT-R04': { a: { outcome: { icc: -2 } }, b: { gamble: { chance: 0.5, win: { cash: 600 }, lose: { icc: -6 } } } },
  'EVT-R05': { a: { outcome: { icc: 1, chassis: -10, health: -5 } }, b: { outcome: { icc: -5 } } },
  'EVT-R06': { a: { pay: [{ cash: 600 }], outcome: { icc: 2 } }, b: { outcome: { icc: -3 } } },
  'EVT-R07': { a: { outcome: { health: -10, icc: 2 } }, b: { pay: [{ cash: 750 }], outcome: { icc: -2 } } },
  'EVT-R08': { a: { pay: [{ fuel: 1 }], outcome: { icc: 1 } }, b: { outcome: { icc: -4, chassis: -5 } } },
  'EVT-R09': { a: { outcome: { icc: 1, chassis: -5 } }, b: { pay: [{ crates: { qty: 1, tiers: [0, 1] } }], outcome: { icc: -4, fuel: 1 } } },
  'EVT-R10': { a: { pay: [{ fuel: 1 }] }, b: { outcome: { chassis: -10, icc: -3 } } },
  'EVT-R11': { a: { outcome: { health: -10 } }, b: { pay: [{ crates: { qty: 2, productId: 'T0-02' } }] } },
  'EVT-R12': { a: { pay: [{ fuel: 1 }], outcome: { icc: 1 } }, b: { outcome: { cash: 900, icc: -5 } } },
  'EVT-R13': { a: { outcome: { health: -5, fuel: 2 } }, b: {} },
  'EVT-R14': { a: { pay: [{ cash: 750 }], outcome: { icc: 2 } }, b: { outcome: { icc: -4 } } },
  'EVT-R15': { a: { pay: [{ cash: 750, freeSlot: true }], outcome: { crateTier: 2 } }, b: {} },
}
