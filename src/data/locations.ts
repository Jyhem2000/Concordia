import type { DistrictId, GlobalEventId, Location, LocationId, ProductId, Requirement, ServiceKey, TagId, Tier } from '../engine/types.ts'

/*
 * Lieux spéciaux (chap. 3) : district d'accueil et services implémentés. Le détail des services
 * et le lore sont au chap. 3, les noms dans src/i18n/fr.ts.
 */

/** Cantine des Chauffeurs : Synthanol au tarif syndical */
export const CANTINE = { fuelPrice: 60 }

/** Garage de Mécano-Mitch : prix d'un PV de châssis réparé */
export const GARAGE = { repairPerPv: 60 }

/** Karma-Cham : panique algorithmique (hausse par usage), bonus d'influence le lendemain */
export const KARMA = {
  cost: 4_000,
  costStep: 2_000,
  cooldownDays: 5,
  factor: 1.5,
  tags: ['TAG-CULTURE', 'TAG-PERISHABLE', 'TAG-CHEMICAL'] as readonly TagId[],
}

/** Morgue du Dr. K. : laissez-passer, chirurgie, certificat */
export const MORGUE = {
  pass: { cost: 1_200, days: 5, district: 'D3' as DistrictId, tag: 'TAG-CHEMICAL' as TagId, cancels: 'EVT-G02' as GlobalEventId },
  surgery: { cost: 3_000, cashShare: 0.05, cooldownDays: 5, health: 35, healthCap: 85 },
  certificate: { cost: 3_500, costStep: 1_750, cooldownDays: 7, icc: 10 },
}

/** Cassandre-88 : prédiction de l'événement global à J+2 (hausse par usage, plus une caisse) */
export const CASSANDRE = { cost: 2_500, costStep: 1_250, crate: 'T3-03' as ProductId, aheadDays: 2 }

/** Faux dossier de Loterie à la Laverie (hausse par usage) et effets des cartes */
export const FORGERY = { cost: 12_000, costStep: 12_000, chance: 0.6, failIccLoss: 10, captainRisk: -0.15, competitorQuota: 1.5, informantIcc: 5 }

/** Contrats de la Pègre, chez Viktor (chap. 3) : produits proposés par tier, caisses par tier, délai en jours, prime et pénalité */
export const CONTRACT = {
  tiers: [1, 2, 3] as readonly Tier[],
  crates: { 1: 6, 2: 4, 3: 3 } as Readonly<Partial<Record<Tier, number>>>,
  delayDays: { min: 2, max: 4 },
  /** Prime : valeur de base des caisses × ce facteur */
  factor: 1.6,
  /** Pénalité d'un contrat manqué, ajoutée à la dette : part de la prime */
  failDebtShare: 0.5,
}

/** Velvet-Silo : enchères, chantage, commande VIP */
export const VELVET = {
  auction: { cooldownDays: 3, factor: 2, minTier: 3 },
  blackmail: { cooldownDays: 4, cost: 7_000, costStep: 3_500, icc: 12, crates: ['T3-07', 'T3-02'] as readonly ProductId[] },
  vip: { cooldownDays: 3, deadlineDays: 2, crates: 3, factor: 3.5, tiers: [2, 3] as readonly Tier[], failIccLoss: 10, lockDays: 5 },
}

/**
 * Services réservés (chap. 3) : voie officielle (palier d'ICC, patrimoine), voie pègre (Fiche S), clientèle établie.
 * Les services absents sont ouverts à tous.
 */
export const SERVICE_REQUIREMENTS: Readonly<Partial<Record<ServiceKey, readonly Requirement[]>>> = {
  influence: [
    { kind: 'iccTier', tier: 'ordinary' },
    { kind: 'wealth', amount: 20_000 },
  ],
  certificate: [{ kind: 'debtPaid' }],
  pass: [{ kind: 'tagSales', tag: 'TAG-CHEMICAL', count: 10 }],
  prophecy: [{ kind: 'wanted' }],
  forgery: [{ kind: 'wealth', amount: 50_000 }],
  auction: [
    { kind: 'iccTier', tier: 'ordinary' },
    { kind: 'wealth', amount: 40_000 },
  ],
  blackmail: [
    { kind: 'iccTier', tier: 'ordinary' },
    { kind: 'wealth', amount: 40_000 },
  ],
  vip: [
    { kind: 'iccTier', tier: 'ordinary' },
    { kind: 'wealth', amount: 40_000 },
  ],
}

export const LOCATIONS: Readonly<Record<LocationId, Location>> = {
  'LOC-D1-1': { district: 'D1', services: ['debt'] },
  'LOC-D1-2': { district: 'D1', services: ['crew'] },
  'LOC-D2-1': { district: 'D2', services: ['influence'] },
  'LOC-D3-1': { district: 'D3', services: ['morgue'] },
  'LOC-D4-1': { district: 'D4', services: ['garage'] },
  'LOC-D4-2': { district: 'D4', services: ['prophecy'] },
  'LOC-D5-1': { district: 'D5', services: ['offshore', 'forgery'] },
  'LOC-D6-1': { district: 'D6', services: ['velvet'] },
}
