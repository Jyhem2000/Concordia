import { keysOf } from '../engine/records.ts'
import type { Product, ProductId, Tier, TierStats } from '../engine/types.ts'

/*
 * Tiers et catalogue des produits. Les règles des tags et le lore sont au chap. 3,
 * les noms dans src/i18n/fr.ts.
 */

export const TIERS: Readonly<Record<Tier, TierStats>> = {
  0: { dailyStock: { min: 15, max: 30 }, demandQuota: null, strongDemandBonus: 0 },
  1: { dailyStock: { min: 10, max: 25 }, demandQuota: { neutral: 10, strong: 20 }, strongDemandBonus: -0.1 },
  2: { dailyStock: { min: 6, max: 15 }, demandQuota: { neutral: 6, strong: 12 }, strongDemandBonus: 0 },
  3: { dailyStock: { min: 4, max: 10 }, demandQuota: { neutral: 4, strong: 8 }, strongDemandBonus: 0.1 },
  4: { dailyStock: { min: 3, max: 8 }, demandQuota: { neutral: 2, strong: 5 }, strongDemandBonus: 0.3 },
}

export const PRODUCTS: Readonly<Record<ProductId, Product>> = {
  // Tier 0 : marchandises officielles, couverture et masquage
  'T0-01': { tier: 0, basePrice: 10, tags: ['TAG-LEGAL'], masks: 'TAG-ODOROUS' },
  'T0-02': { tier: 0, basePrice: 15, tags: ['TAG-LEGAL'], masks: 'TAG-FLAMMABLE', cooling: { crates: 2 } },
  'T0-03': { tier: 0, basePrice: 40, tags: ['TAG-LEGAL'], masks: 'TAG-CHEMICAL' },
  'T0-04': { tier: 0, basePrice: 25, tags: ['TAG-LEGAL'], masks: 'TAG-CULTURE', bluffAid: { crates: 5, bonus: 0.1, cancelsSmell: false } },
  // Caisses scellées du DSC : chargées pour une mission de nuit, hors commerce (chap. 2)
  'T0-05': { tier: 0, basePrice: 0, tags: ['TAG-LEGAL'], sealed: true },

  // Tier 1 : petits plaisirs coupables
  'T1-01': { tier: 1, basePrice: 80, tags: ['TAG-ADDICTIVE', 'TAG-FRAGILE'] },
  'T1-02': { tier: 1, basePrice: 120, tags: ['TAG-ADDICTIVE', 'TAG-ODOROUS'], nightProfile: 'diurnal' },
  'T1-03': { tier: 1, basePrice: 150, tags: ['TAG-PERISHABLE'] },
  'T1-04': { tier: 1, basePrice: 95, tags: ['TAG-CHEMICAL'] },
  'T1-05': { tier: 1, basePrice: 180, tags: ['TAG-ADDICTIVE'], nightProfile: 'diurnal' },
  'T1-06': { tier: 1, basePrice: 110, tags: ['TAG-ODOROUS', 'TAG-FLAMMABLE'] },

  // Tier 2 : contrebande culturelle & épicerie noire
  'T2-01': { tier: 2, basePrice: 350, tags: ['TAG-ODOROUS', 'TAG-CHEMICAL'], bluffAid: { crates: 1, bonus: 0, cancelsSmell: true } },
  'T2-02': { tier: 2, basePrice: 420, tags: ['TAG-ODOROUS', 'TAG-PERISHABLE'], nightProfile: 'festive' },
  'T2-03': { tier: 2, basePrice: 500, tags: ['TAG-CULTURE', 'TAG-FRAGILE'], nightProfile: 'festive' },
  'T2-04': { tier: 2, basePrice: 650, tags: ['TAG-TECH'] },
  'T2-05': {
    tier: 2,
    basePrice: 380,
    tags: ['TAG-CHEMICAL', 'TAG-ADDICTIVE'],
    doping: { fleeBonus: 0.25, chassisLoss: 10, iccLoss: 5 },
    sleeplessNight: { healthLoss: 10, minHealth: 10 },
  },
  'T2-06': { tier: 2, basePrice: 550, tags: ['TAG-CULTURE', 'TAG-TECH'] },
  'T2-07': { tier: 2, basePrice: 480, tags: ['TAG-FRAGILE', 'TAG-CHEMICAL'] },

  // Tier 3 : trafic lourd & « armes » gastronomiques
  'T3-01': { tier: 3, basePrice: 1_200, tags: ['TAG-ODOROUS', 'TAG-PERISHABLE'], nightProfile: 'festive' },
  'T3-02': {
    tier: 3,
    basePrice: 1_500,
    tags: ['TAG-ODOROUS', 'TAG-ADDICTIVE', 'TAG-FLAMMABLE'],
    nightProfile: 'festive',
  },
  'T3-03': {
    tier: 3,
    basePrice: 1_800,
    tags: ['TAG-FRAGILE', 'TAG-FLAMMABLE', 'TAG-ADDICTIVE'],
    nightProfile: 'festive',
  },
  'T3-04': { tier: 3, basePrice: 2_200, tags: ['TAG-CHEMICAL'] },
  'T3-05': { tier: 3, basePrice: 1_600, tags: ['TAG-CULTURE'] },
  'T3-06': { tier: 3, basePrice: 2_500, tags: ['TAG-TECH', 'TAG-FRAGILE'] },
  'T3-07': { tier: 3, basePrice: 3_200, tags: ['TAG-TECH', 'TAG-CULTURE'] },

  // Tier 4 : ennemis publics n°1
  'T4-01': { tier: 4, basePrice: 6_000, tags: ['TAG-PERISHABLE', 'TAG-ODOROUS'], nightProfile: 'festive' },
  'T4-02': { tier: 4, basePrice: 8_500, tags: ['TAG-CULTURE', 'TAG-FRAGILE'] },
  'T4-03': { tier: 4, basePrice: 12_000, tags: ['TAG-TECH'], iccRestore: 25 },
  'T4-04': { tier: 4, basePrice: 15_000, tags: ['TAG-CHEMICAL', 'TAG-FRAGILE'] },
  'T4-05': { tier: 4, basePrice: 18_000, tags: ['TAG-CHEMICAL', 'TAG-FRAGILE'] },
  'T4-06': {
    tier: 4,
    basePrice: 25_000,
    tags: ['TAG-TECH', 'TAG-CULTURE'],
    dailyStock: { min: 1, max: 2 },
    appearanceChance: 0.15,
    beaconRisk: 0.1,
    lethalOnSearch: true,
    bulky: true, // une baie de serveur : pas de double fond
  },
}

export const PRODUCT_IDS = keysOf(PRODUCTS)

/** Caisses scellées des missions de nuit */
export const SEALED_PRODUCT: ProductId = 'T0-05'
