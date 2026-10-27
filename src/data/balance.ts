import type { DistrictId, IccTier, NightProfile, ProductId, Range } from '../engine/types.ts'

/*
 * Constantes globales d'équilibrage. Ce fichier fait foi ; chaque valeur cite le chapitre
 * des docs qui décrit la règle où elle intervient.
 */

// ─── Partie (chap. 2) ───

/** Durée de la partie, Jour 1 à Jour 30 */
export const GAME_LENGTH_DAYS = 30

/** Zone de départ (chap. 4) */
export const START_DISTRICT: DistrictId = 'D1'

/** Cash-Puce de départ (chap. 7) */
export const START_CASH = 2_000

/** Dette mafieuse de départ (chap. 7) */
export const START_DEBT = 5_000

/** Bornes hautes des jauges du joueur (ICC en %, Santé en PV), plancher à 0 */
export const ICC_MAX = 100
export const HEALTH_MAX = 100

export const START_ICC = ICC_MAX

export const START_HEALTH = HEALTH_MAX

/** Seuil bas (ICC inclus) de chaque palier de crédit social, du plus haut au plus bas */
export const ICC_TIERS: readonly { tier: IccTier; min: number }[] = [
  { tier: 'gold', min: 85 },
  { tier: 'ordinary', min: 50 },
  { tier: 'probation', min: 30 },
  { tier: 'deviant', min: 0 },
]

/** Gains de route d'ICC (sommeil au relais…) : plafond par jour, de 06h00 à 06h00 */
export const ICC_DAILY_ROUTE_GAIN_CAP = 4

/** Nuit au relais routier du DSC (pas au bivouac de [D4]) */
export const RELAY_SLEEP = { icc: 2, health: 5 }

/** Le compte à rebours de l'audit s'affiche à partir de ce jour (chap. 9) */
export const AUDIT_COUNTDOWN_DAY = 28

type EndingRules = {
  saboteur: { minScore: number; requiredProduct: ProductId; district: DistrictId }
  elite: { minScore: number; iccTier: IccTier }
  mafia: { minScore: number }
}

/** Fins de partie (dette soldée), de la plus prestigieuse à la plus modeste : seuils de score offshore */
export const ENDINGS: Readonly<EndingRules> = {
  saboteur: { minScore: 1_000_000, requiredProduct: 'T4-06', district: 'D4' },
  elite: { minScore: 500_000, iccTier: 'gold' },
  mafia: { minScore: 200_000 },
}

// ─── Trajets (chap. 2 et 4) ───

/** Surcoût en rations par district traversé */
export const FUEL_PER_CROSSED_DISTRICT = 1

/** Siphonage / Corvée DSC (anti soft-lock) : rations gagnées, points d'ICC perdus */
export const SIPHON = { fuel: 1, iccLoss: 5 }

// ─── Économie (chap. 7) ───

/** Indice d'inflation du jour = 1 + (jour − 1) / INFLATION_PERIOD_DAYS */
export const INFLATION_PERIOD_DAYS = 15

/** Bruit quotidien du cours : tirage uniforme, par produit et par district */
export const QUOTE_NOISE: Range = { min: 0.7, max: 1.3 }

/** Taille minimale de la boutique du jour */
export const SHOP_MIN_PRODUCTS = 10

/** Commission de puce prélevée sur chaque vente */
export const SALE_COMMISSION = 0.9

/** Coefficient d'une caisse vendue au-delà de la demande restante (marché saturé) */
export const SATURATED_SALE_FACTOR = 0.5

/** Chaque matin, la demande restante remonte de quota / DEMAND_REFILL_DIVISOR (arrondi au supérieur) */
export const DEMAND_REFILL_DIVISOR = 3

/** Coefficient de vente pendant le couvre-feu, selon le profil nuit du produit */
export const NIGHT_PROFILE_FACTOR: Readonly<Record<NightProfile, number>> = { festive: 1.2, diurnal: 0.8 }

/** Savoir-faire : au-delà de ce seuil, l'excédent ne compte que pour KNOW_HOW_EXCESS_FACTOR */
export const KNOW_HOW_SOFT_CAP = 1.5
export const KNOW_HOW_EXCESS_FACTOR = 0.5

/** Plafond du savoir-faire d'une caisse revendue sans avoir quitté son district d'achat */
export const ANTI_ARBITRAGE_CAP = 1

// ─── Dette mafieuse (chap. 7) ───

/** Intérêts composés par jour, à chaque routine matinale (pas le Jour 1) */
export const DEBT_DAILY_RATE = 0.1

/** Échéance du tabassage : au-delà du solde seuil, perte de Santé sans descendre sous le plancher */
export const DEBT_BEATING = { day: 10, threshold: 10_000, healthLoss: 30, healthFloor: 5 }

/** Échéance du retard : dette initiale jamais soldée → taux majoré et embuscades, jusqu'à la fin de la partie */
export const DEBT_LATE = { day: 20, dailyRate: 0.2, ambushRisk: 0.15 }

/** Emprunt tactique (dette initiale soldée) : solde maximal de la dette */
export const LOAN_CEILING = 100_000

/** Collecte de protection (dette initiale soldée) : jours et part de la richesse visible */
export const PROTECTION = { days: [7, 14, 21, 28] as readonly number[], rate: 0.1 }

// ─── Compte offshore (chap. 7) ───

/** Coefficient appliqué à chaque dépôt (commission de la Laverie) */
export const OFFSHORE_DEPOSIT_FACTOR = 0.95

/** Intérêts simples par jour, par tranche du solde déposé ; `upTo` null = au-delà */
export const OFFSHORE_TRANCHES: readonly { upTo: number | null; dailyRate: number }[] = [
  { upTo: 200_000, dailyRate: 0.015 },
  { upTo: 500_000, dailyRate: 0.01 },
  { upTo: null, dailyRate: 0.005 },
]
