import type { DistrictId, NightProfile, Range } from '../engine/types.ts'

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

export const START_ICC = 100

export const START_HEALTH = 100

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
