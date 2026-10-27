import type { Plan, Temperament } from './bots/trader.ts'

/*
 * Plans et tempéraments des bots (chap. 9, axes 1 et 2). Les seuils sont des paramètres de bot,
 * notés dans chaque rapport de campagne.
 */

export const NOVICE: Plan = { name: 'Novice', modules: [], novice: true }

/** Plans de l'étape 1 : ceux qui ne demandent qu'un réglage du marchand */
export const PLANS: readonly Plan[] = [
  { name: 'Sans build', modules: [] },
  { name: 'Chaîne du froid', vehicle: 'VEH-03', modules: ['MOD-01'], crew: 'CREW-03', favorTags: ['TAG-PERISHABLE'] },
  { name: 'Couverture légale', vehicle: 'VEH-02', modules: ['MOD-02'], legalShare: 0.25, favorTags: ['TAG-ODOROUS'] },
  { name: 'Électronique', modules: ['MOD-03'], favorTags: ['TAG-TECH'] },
  { name: 'Nuit festive', modules: ['MOD-04', 'MOD-06'] },
  { name: 'Corruption', modules: ['MOD-08'], crew: 'CREW-01', favorTags: ['TAG-ADDICTIVE'] },
  { name: 'Rentier', modules: [], crew: 'CREW-02', offshoreFromDay: 6 },
  { name: 'Haut tier', vehicle: 'VEH-04', modules: ['MOD-07'] },
]

export const TEMPERAMENTS: readonly Temperament[] = [
  { name: 'Prudent', maxRisk: 0.25, maxTier: 2, reserve: 300, night: 'mission', boldness: 1.3 },
  { name: 'Équilibré', maxRisk: 0.45, maxTier: 3, reserve: 100, night: 'margin', boldness: 1 },
  { name: 'Casse-cou', maxRisk: 0.75, maxTier: 4, reserve: 0, night: 'always', boldness: 0.7 },
]

/** Tempérament du Novice : prudent, sans tournée de nuit */
export const NOVICE_TEMPERAMENT: Temperament = { name: 'Novice', maxRisk: 0.35, maxTier: 2, reserve: 200, night: 'never', boldness: 1 }
