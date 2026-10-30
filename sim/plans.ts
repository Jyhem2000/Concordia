import type { Plan, Temperament } from './bots/trader.ts'

/*
 * Plans et tempéraments des bots (chap. 8, axes 1 et 2). Les seuils sont des paramètres de bot,
 * notés dans chaque rapport de campagne.
 */

export const NOVICE: Plan = { name: 'Novice', modules: [], novice: true }

/** Plans des étapes 1 et 2 (chap. 8, axe 1) */
export const PLANS: readonly Plan[] = [
  { name: 'Sans build', modules: [] },
  { name: 'Chaîne du froid', vehicle: 'VEH-03', modules: ['MOD-01'], crew: 'CREW-03', favorTags: ['TAG-PERISHABLE'] },
  { name: 'Couverture légale', vehicle: 'VEH-02', modules: ['MOD-02'], legalShare: 0.25, favorTags: ['TAG-ODOROUS'] },
  { name: 'Électronique', modules: ['MOD-03'], favorTags: ['TAG-TECH'] },
  { name: 'Nuit festive', modules: ['MOD-04', 'MOD-06'], nightOwl: true, runner: true },
  { name: 'Corruption', modules: ['MOD-08'], crew: 'CREW-01', favorTags: ['TAG-ADDICTIVE'] },
  { name: 'Rentier', modules: [], crew: 'CREW-02', offshoreFromDay: 6 },
  { name: 'Haut tier', vehicle: 'VEH-04', modules: ['MOD-07'], favorTags: ['TAG-FLAMMABLE'] },
  // Étape 2 : plans à logique propre
  { name: 'Fuite au sommet', modules: ['MOD-06', 'MOD-09'], crew: 'CREW-02', runner: true, favorTags: ['TAG-CULTURE'] },
  {
    name: 'Citoyen modèle',
    vehicle: 'VEH-02',
    modules: ['MOD-08'],
    legalShare: 0.3,
    places: ['advance', 'certificate', 'blackmail'],
    iccFloor: 90,
  },
  { name: 'Opportuniste', modules: [], places: ['advance', 'influence', 'vip'] },
  { name: 'Saboteur', vehicle: 'VEH-04', modules: ['MOD-03'], favorTags: ['TAG-TECH'] },
]

export const TEMPERAMENTS: readonly Temperament[] = [
  { name: 'Prudent', maxRisk: 0.25, maxTier: 2, reserve: 300, night: 'mission', boldness: 1.3, venture: 0 },
  { name: 'Équilibré', maxRisk: 0.55, maxTier: 3, reserve: 100, night: 'margin', boldness: 0.85, venture: 0.25 },
  { name: 'Casse-cou', maxRisk: 0.75, maxTier: 4, reserve: 0, night: 'always', boldness: 0.7, venture: 0.5 },
]

/** Tempérament du Novice : prudent, sans tournée de nuit */
export const NOVICE_TEMPERAMENT: Temperament = { name: 'Novice', maxRisk: 0.35, maxTier: 2, reserve: 200, night: 'never', boldness: 1, venture: 0 }
