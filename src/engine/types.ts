import type { Breakdown } from './breakdown.ts'
import type { RngState } from './rng.ts'

/*
 * Conventions d'unités du moteur :
 * - les probabilités et les multiplicateurs sont des fractions (25 % → 0.25, ×0,85 → 0.85) ;
 * - les jauges (ICC, Santé, châssis) sont sur leur échelle des docs : ICC 0–100, Santé 0–100 PV ;
 * - les montants sont en ₡ entiers.
 */

// ─── IDs des données de jeu (registre : README des docs, règle n°2) ───
// Les fichiers de src/data/ doivent couvrir chaque union (`satisfies Record<…Id, …>`).

type Two = '01' | '02'
type Three = Two | '03'
type Four = Three | '04'
type Six = Four | '05' | '06'
type Seven = Six | '07'
type Eight = Seven | '08'

export type Tier = 0 | 1 | 2 | 3 | 4

/** Produits (chap. 3) */
export type ProductId = `T0-${Four}` | `T1-${Six}` | `T2-${Seven}` | `T3-${Seven}` | `T4-${Six}`

/** Tags système (chap. 3) */
export type TagId =
  'TAG-LEGAL' | 'TAG-PERISHABLE' | 'TAG-FRAGILE' | 'TAG-ADDICTIVE' | 'TAG-ODOROUS' | 'TAG-CULTURE' | 'TAG-TECH' | 'TAG-CHEMICAL' | 'TAG-FLAMMABLE'

/** Districts (chap. 4) */
export type DistrictId = `D${1 | 2 | 3 | 4 | 5 | 6}`

/** Lieux spéciaux (chap. 4) */
export type LocationId = 'LOC-D1-1' | 'LOC-D1-2' | 'LOC-D2-1' | 'LOC-D3-1' | 'LOC-D4-1' | 'LOC-D4-2' | 'LOC-D5-1' | 'LOC-D6-1'

/** Véhicules, modules, équipiers (chap. 5) */
export type VehicleId = `VEH-${Four}`
export type ModuleId = `MOD-${Eight}`
export type CrewId = `CREW-${Three}`

/** Événements (chap. 8) */
export type GlobalEventId = `EVT-G${Six}`
export type LocalEventId = `EVT-${DistrictId}-${Three}`
export type RoadEventId = `EVT-R${Eight | '09' | '10' | '11' | '12' | '13' | '14' | '15'}`
export type LotteryEventId = 'EVT-L01'
export type EventId = GlobalEventId | LocalEventId | RoadEventId | LotteryEventId

export type GameDataId = ProductId | TagId | DistrictId | LocationId | VehicleId | ModuleId | CrewId | EventId

// ─── Données de jeu (src/data/, qui fait foi pour les stats) ───

export type Range = { min: number; max: number }

/** Profil de vente pendant le couvre-feu (chap. 7) */
export type NightProfile = 'festive' | 'diurnal'

export type Product = {
  tier: Tier
  basePrice: number
  tags: readonly TagId[]
  /** Tier 0 : chaque caisse masque 1 caisse de ce tag (chap. 3, masquage 1:1) */
  masks?: TagId
  nightProfile?: NightProfile
  /** Remplace le stock du tier */
  dailyStock?: Range
  /** Chance d'apparaître chaque jour dans la boutique de son district producteur */
  appearanceChance?: number
}

export type TierStats = {
  /** Stock en boutique, par produit et par jour */
  dailyStock: Range
  /** Quota de demande par produit et par district ; null = illimité */
  demandQuota: { neutral: number; strong: number } | null
  /** Ajouté au coefficient de Forte demande du district (chap. 7) */
  strongDemandBonus: number
}

/** Officielle : connectée à Aeterna, fermée la nuit sous un certain ICC. Fixe : toujours ouverte. */
export type PumpType = 'official' | 'fixed'

export type District = {
  /** Place dans la pyramide sociale, du pire (0) au meilleur (5) */
  echelon: number
  /** Étoiles de sécurité (1 à 5) : bluff, corruption, plafond de fuite (chap. 6) */
  security: number
  baseRisk: number
  /** Prix de base d'une ration de Synthanol */
  fuelPrice: number
  pump: PumpType
  /** Relais routier du DSC où dormir ; sinon bivouac, sans gain de sommeil (chap. 2) */
  relay: boolean
  /** Tag ciblé par la détection spéciale du district */
  detection: TagId | null
  droneJudges: boolean
  /** Coefficient de marché des produits de la liste Production */
  coefProduction: number
  /** Coefficient de marché des produits en Forte demande, avant bonus de tier */
  coefStrongDemand: number
  production: readonly ProductId[]
  /** Nombre de produits de la liste Production tirés chaque jour ; absent = toute la liste */
  productionDraw?: Range
  strongDemand: readonly ProductId[]
}

/** Services rendus par les lieux spéciaux implémentés (chap. 4 et 7) */
export type LocationService = 'debt' | 'offshore'

export type Location = {
  district: DistrictId
  services: readonly LocationService[]
}

export type Vehicle = {
  price: number
  /** Emplacements de soute (1 caisse = 1 emplacement) */
  cargo: number
  moduleSlots: number
  /** PV max du châssis */
  maxChassis: number
  /** Capacité du réservoir, en rations */
  tank: number
  /** Rations consommées par trajet, selon la phase */
  fuelPerTrip: Record<Phase, number>
}

export type ModuleCategory = 'conservation' | 'camouflage' | 'tactical'

export type Module = {
  price: number
  category: ModuleCategory
}

export type Crew = {
  dailySalary: number
}

// ─── État de la partie ───

/** Service de jour (06h00 – 20h00) ou couvre-feu forcé (chap. 2) */
export type Phase = 'day' | 'night'

/** `finished` : audit du Jour 30 passé ou défaite ; la fin est dans `GameState.ending` */
export type GameStatus = 'playing' | 'finished'

/** Paliers de crédit social (chap. 2), du plus haut au plus bas */
export type IccTier = 'gold' | 'ordinary' | 'probation' | 'deviant'

/** Fins de partie (chap. 2) : les quatre grandes fins, puis les défaites */
export type EndingId = 'saboteur' | 'elite' | 'mafia' | 'standard' | 'bio-bricks' | 'death' | 'execution'

export type Ending = {
  id: EndingId
  /** Score final : solde du compte offshore à l'audit (0 en cas de défaite) */
  score: number
}

/** Compte offshore : intérêts simples, donc dépôts et intérêts versés sont suivis à part (chap. 7) */
export type OffshoreAccount = {
  /** Dépôts nets de commission : seule base des intérêts */
  deposited: number
  /** Intérêts versés, qui ne produisent pas d'intérêts */
  interest: number
}

/** Ce que la nuit et la routine de 06h00 ont changé, pour le briefing du matin (chap. 2 et 9) */
export type MorningBriefing = {
  day: number
  /** Gains de la nuit au relais routier (après plafond d'ICC) ; null au bivouac */
  sleep: { icc: number; health: number } | null
  debtInterest: Breakdown | null
  /** PV perdus au tabassage de l'échéance de la dette, 0 sinon */
  beating: number
  /** Vrai le matin où la dette passe en retard (taux majoré, embuscades) */
  debtLate: boolean
  /** Collecte de protection : montant dû, part payée en Cash-Puce, reliquat ajouté à la dette */
  protection: { due: Breakdown; paid: number; toDebt: number } | null
  offshoreInterest: Breakdown | null
}

/** Caisses d'un même produit achetées ensemble */
export type CargoLot = {
  productId: ProductId
  qty: number
  /** Prix d'achat unitaire, pour le prix moyen d'achat affiché */
  unitCost: number
  /** Faux tant que le lot n'a pas quitté son district d'achat (clause anti-arbitrage, chap. 7) */
  travelled: boolean
}

/** Marché du jour d'un district, tiré à 06h00 */
export type DistrictMarket = {
  /** Bruit du jour par produit : le cours se recalcule à partir de lui (détail affichable) */
  noise: Record<ProductId, number>
  /** Boutique du jour : stock restant des produits en vente */
  stock: Partial<Record<ProductId, number>>
  /** Demande restante par produit ; absente = illimitée */
  demand: Partial<Record<ProductId, number>>
}

/** Derniers cours qu'un joueur a lui-même observés dans un district */
export type MarketMemory = {
  day: number
  quotes: Record<ProductId, number>
}

/**
 * État minimal et sérialisable d'une partie : c'est lui qui est sauvegardé.
 * Les valeurs dérivées (cours, risque, prix nets…) ne sont jamais stockées, elles se recalculent.
 */
export type GameState = {
  status: GameStatus
  /** Jour 1 à 30 */
  day: number
  phase: Phase
  districtId: DistrictId
  vehicleId: VehicleId
  /** Rations de Synthanol dans le réservoir */
  fuel: number
  cargo: readonly CargoLot[]
  markets: Record<DistrictId, DistrictMarket>
  memory: Partial<Record<DistrictId, MarketMemory>>
  dayTripDone: boolean
  nightTripDone: boolean
  /** Dernier jour où le couvre-feu a été forcé (épuisement nerveux, chap. 2) */
  lastCurfewDay: number | null
  /** Cash-Puce */
  cash: number
  /** Solde de la dette mafieuse */
  debt: number
  /** Statut acquis définitivement la première fois que la dette atteint 0 (chap. 7) */
  initialDebtPaid: boolean
  /** Échéance du retard franchie : taux majoré et embuscades jusqu'à la fin de la partie */
  debtLate: boolean
  offshore: OffshoreAccount
  /** Indice de Conformité Civique, 0–100 */
  icc: number
  /** Gains de route d'ICC déjà reçus depuis 06h00 (plafond quotidien) */
  iccRouteGains: number
  /** Santé du joueur, 0–100 PV */
  health: number
  /** Briefing de la dernière routine matinale ; null au Jour 1 */
  briefing: MorningBriefing | null
  /** Fin de partie, une fois `status` à `finished` */
  ending: Ending | null
  /** État du générateur aléatoire : sauvegardé pour que recharger ne relance pas les dés */
  rng: RngState
}
