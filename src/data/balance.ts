import type { DistrictId, IccTier, NightProfile, ProductId } from '../engine/types.ts'

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

/** Exemption Métabolique (chap. 2) : jours de protection, malus de Sédation, fourchette de la mémoire brouillée */
export const SEDATION = { protectionDays: 4, penalty: 0.1, memoryBlur: 0.2 }

/** Pompes officielles : fermées la nuit sous ce seuil d'ICC (chap. 4) */
export const PUMP_NIGHT_MIN_ICC = 50

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

/** Le compte à rebours de l'audit s'affiche à partir de ce jour (chap. 10) */
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

/**
 * Tendance du cours, par produit et par district (chap. 7) : écart du jour = persistance × écart de la veille
 * + choc uniforme dans ±shock, borné à ±max ; Bruit = 1 + écart
 */
export const QUOTE_NOISE = { persistence: 0.6, shock: 0.2, max: 0.3 }

/** Taille minimale de la boutique du jour */
export const SHOP_MIN_PRODUCTS = 10

/** Commission de puce prélevée sur chaque vente */
export const SALE_COMMISSION = 0.9

/** Coefficient d'une caisse vendue au-delà de la demande restante (marché saturé) */
export const SATURATED_SALE_FACTOR = 0.5

/** Chaque matin, la demande restante remonte de quota / DEMAND_REFILL_DIVISOR (arrondi au supérieur) */
export const DEMAND_REFILL_DIVISOR = 3

/** Coefficient de vente pendant le couvre-feu, selon le profil nuit du produit */
export const NIGHT_PROFILE_FACTOR: Readonly<Record<NightProfile, number>> = { festive: 1.5, diurnal: 0.8 }

/** Savoir-faire : au-delà de ce seuil, l'excédent ne compte que pour KNOW_HOW_EXCESS_FACTOR */
export const KNOW_HOW_SOFT_CAP = 1.5
export const KNOW_HOW_EXCESS_FACTOR = 0.5

/** Plafond du savoir-faire d'une caisse revendue sans avoir quitté son district d'achat */
export const ANTI_ARBITRAGE_CAP = 1

// ─── Dette mafieuse (chap. 7) ───

/** Intérêts composés par jour, à chaque routine matinale (pas le Jour 1) */
export const DEBT_DAILY_RATE = 0.05

/** Échéance du tabassage : au-delà du solde seuil, perte de Santé sans descendre sous le plancher */
export const DEBT_BEATING = { day: 10, threshold: 10_000, healthLoss: 30, healthFloor: 5 }

/** Échéance du retard : dette initiale jamais soldée → taux majoré et embuscades, jusqu'à la fin de la partie */
export const DEBT_LATE = { day: 20, dailyRate: 0.2, ambushRisk: 0.15 }

/** Avance de survie (dette initiale pas encore soldée) : total empruntable sur toute la partie */
export const SURVIVAL_ADVANCE = 2_000

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

// ─── Châssis (chap. 2) ───

/** Usure du châssis par trajet de nuit (surchauffe des galeries) */
export const NIGHT_TRIP_CHASSIS_WEAR = 5

/** Dépannage d'urgence à 0 PV : châssis remis à une part du max, facture (reliquat ajouté à la dette) */
export const EMERGENCY_TOW = { chassisRestore: 0.25, bill: 2_500 }

// ─── Risque d'interception (chap. 6) ───

/** Bornes du risque, appliquées après tous les multiplicateurs */
export const RISK_BOUNDS = { min: 0.05, max: 0.95 }

/** Suspicion : risque ajouté par point d'ICC manquant */
export const SUSPICION_PER_ICC_POINT = 0.005

// ─── État des caisses (chap. 3) ───

/**
 * Cycle de fraîcheur des périssables : coefficient de vente de chaque état, et âge (matins passés
 * depuis l'achat) à partir duquel il commence. Extra-Frais : jour d'achat, jusqu'à 20h00.
 * Un lot qui atteint l'âge `rottenFromAge` est détruit à 06h00.
 */
export const FRESHNESS = {
  extra: 1.3,
  standard: 1,
  gamey: { fromAge: 2, factor: 0.6 },
  spoiled: { fromAge: 3, factor: 0.25 },
  rottenFromAge: 4,
}

/** Coefficient d'une caisse endommagée (casse des fragiles), à la vente comme en paiement */
export const DAMAGED_FACTOR = 0.5

/** Hachoir de Viktor : prime sur le cours local des périssables dégradés, caisses rachetées par jour */
export const GRINDER = { premium: 1.2, dailyLimit: 5 }

/** Poids d'une caisse masquée dans la part de son tag (masquage 1:1, chap. 3) */
export const MASKED_CRATE_WEIGHT = 0.5

/** Malus de contexte additifs */
export const NIGHT_TRIP_RISK = 0.25

/** Missions de nuit (chap. 2) : chance d'une offre, part de la soute en caisses scellées, prime (indexée), ICC perdu si non livrée */
export const NIGHT_MISSION = { chance: 0.6, sealedShare: 0.2, fee: 200, undeliveredIccLoss: 3 }
/** Livraison officielle du jour (chap. 2) : chance d'offre le matin, part de la capacité en caisses scellées, prime (indexée), ICC perdu si non livrée */
export const DAY_DELIVERY = { chance: 0.6, sealedShare: 0.3, fee: 250, undeliveredIccLoss: 3 }
export const CROSSED_DISTRICT_RISK = 0.05
export const SUSPICIOUS_PEAK_RISK = 0.1

/** Ronde renforcée : chaque matin, un district (hors zone hors-réseau) est tiré, cachée au joueur */
export const PATROL_RISK = 0.2

/** Coupe-file des Citoyens Or dans les districts qui en ont un */
export const GOLD_FAST_LANE_FACTOR = 0.9

/** Fiche S algorithmique : niveau max, risque ajouté et chance de fuite retirée par niveau */
export const WANTED = { maxLevel: 3, perOffense: 1, riskPerLevel: 0.05, fleePenaltyPerLevel: 0.1 }

// ─── Interception (chap. 6) ───

/** Tier à partir duquel une caisse illégale aggrave la sanction */
export const HIGH_TIER = 3

/** Garde à vue : PV perdus par matin en cellule, sans descendre sous le plancher */
export const CUSTODY = { healthLossPerMorning: 15, healthFloor: 1 }

/**
 * Amendes (chap. 6) : une part de la valeur des caisses saisies, au prix de base. Impayée faute de Cash-Puce :
 * tout le Cash-Puce part et la garde à vue s'allonge.
 */
export const FINE = { unpaidCustodyDays: 1 }

/** Fouille acceptée : soute légale (gain d'ICC), illégal de bas tier, illégal de haut tier ; `fineRate` : part de la valeur saisie */
export const SEARCH = {
  legalIccGain: 2,
  low: { fineRate: 0.5, iccLoss: 5, custodyDays: 0 },
  high: { fineRate: 0.75, iccLoss: 12, custodyDays: 1 },
}

/** Bluff administratif */
export const BLUFF = {
  base: 0.25,
  tier0ShareBonus: 0.3,
  perMaskedCrate: 0.05,
  maskedCap: 0.25,
  perExtraStar: 0.05,
  cap: 0.9,
  successIccGain: 3,
  failIccLoss: 3,
  /** Après un bluff raté : taux d'amende de la fouille (part de la valeur saisie), et chance retirée à la corruption et à la fuite */
  failedFine: { low: 0.75, high: 1 },
  followUpPenalty: 0.2,
}

/** Corruption : tarif standard, bonus d'offre (par paliers), échec critique des Drones-Juges */
export const BRIBE = {
  base: 0.5,
  perExtraStar: 0.05,
  cap: 0.95,
  ratePerStar: 1_500,
  rateIllegalCargoShare: 0.1,
  minOfferRatio: 0.5,
  offerBonuses: [
    { ratio: 1, bonus: 0.15 },
    { ratio: 2, bonus: 0.3 },
    { ratio: 3, bonus: 0.4 },
  ],
  droneCriticalFailure: 0.2,
  /** Bonus si l'offre contient un produit apprécié des agents du district */
  connivance: 0.1,
  fail: { fineRate: 1, iccLoss: 15, custodyDays: 1 },
}

/** Fuite : chance de base, plafond selon les étoiles, conséquences */
export const FLEE = {
  base: 0.35,
  capBase: 0.95,
  capPerExtraStar: 0.05,
  success: { chassisLoss: { min: 15, max: 30 }, iccLoss: 15 },
  fail: { fineRate: 1, iccLoss: 25, chassisLoss: 35, healthLoss: 15, custodyDays: 1 },
}

/** Contrôles volants (ni fuite ni éjection) : part ajoutée dans le district de la ronde renforcée, faite d'unités mobiles */
export const FLYING_CHECK = { patrolBonus: 0.25 }

/** Double fond (chap. 5) : chance que les agents le trouvent, par étoile de sécurité ; perte d'ICC pour dissimulation s'il est trouvé */
export const COMPARTMENT = { detectionPerStar: 0.12, foundIccLoss: 5 }

/** Éjection manuelle (décharge dans une ruelle) ; un échec aggrave la fouille */
export const EJECT = {
  manualChance: 0.45,
  chassisLoss: 10,
  fail: { fineRaise: 0.25, iccLoss: 10, custodyDays: 1 },
}

/** Racket des milices en zone hors-réseau (chap. 4) */
export const RACKET = {
  tollRate: 0.1,
  refuse: { lootShare: 0.3, healthLoss: 20, chassisLoss: 25 },
}
