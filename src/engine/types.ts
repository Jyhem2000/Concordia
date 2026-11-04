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

/** Produits (chap. 2) */
export type ProductId = `T0-${Four | '05'}` | `T1-${Six}` | `T2-${Seven}` | `T3-${Seven}` | `T4-${Six}`

/** Tags système (chap. 2) */
export type TagId =
  | 'TAG-LEGAL'
  | 'TAG-PERISHABLE'
  | 'TAG-FRAGILE'
  | 'TAG-ADDICTIVE'
  | 'TAG-ODOROUS'
  | 'TAG-CULTURE'
  | 'TAG-TECH'
  | 'TAG-BIO'
  | 'TAG-FESTIVE'
  | 'TAG-LUXURY'
  | 'TAG-GOURMET'

/** Districts (chap. 3) */
export type DistrictId = `D${1 | 2 | 3 | 4 | 5 | 6}`

/** Lieux spéciaux (chap. 3) */
export type LocationId = 'LOC-D1-1' | 'LOC-D1-2' | 'LOC-D1-3' | 'LOC-D2-1' | 'LOC-D3-1' | 'LOC-D4-1' | 'LOC-D4-2' | 'LOC-D5-1' | 'LOC-D6-1'

/** Véhicules, modules, équipiers (chap. 4) */
export type VehicleId = `VEH-${Four}`
export type ModuleId = `MOD-${Eight | '10'}`
export type CrewId = `CREW-${Three}`

/** Événements (chap. 6) */
export type GlobalEventId = `EVT-G${Seven}`
export type LocalEventId = `EVT-${DistrictId}-${Three}`
export type RoadEventId = `EVT-R${Eight | '09' | '10' | '11' | '12' | '13' | '14' | '15'}`
export type LotteryEventId = 'EVT-L01'
export type EventId = GlobalEventId | LocalEventId | RoadEventId | LotteryEventId

export type GameDataId = ProductId | TagId | DistrictId | LocationId | VehicleId | ModuleId | CrewId | EventId

// ─── Données de jeu (src/data/, qui fait foi pour les stats) ───

export type Range = { min: number; max: number }

/** Produits visés par un effet d'événement : liste, tag ou tiers */
export type ProductSelector = readonly ProductId[] | { tag: TagId } | { tiers: readonly Tier[] }

/** Effet d'un événement (chap. 6) ; `districts` restreint un effet global à certains districts */
export type EventEffect = { districts?: readonly DistrictId[] } & (
  | { kind: 'price'; products: ProductSelector; factor: number; dayOnly?: boolean }
  /** Apparition à l'achat (dérogation à l'exclusion) : `count` produits tirés parmi la liste, tous si absent ; le facteur vaut pour toute la liste */
  | { kind: 'appear'; products: readonly ProductId[]; count?: Range; factor: number }
  /** Facteur sur le stock tiré ; tous les produits si `products` est absent */
  | { kind: 'stock'; products?: readonly ProductId[]; factor: number }
  | { kind: 'risk'; add: number }
  /** Risque final : multiplié après tous les autres termes */
  | { kind: 'finalRisk'; factor: number }
  | { kind: 'baseRisk'; value: number }
  /** Effets d'un tag (risque au trajet, détection, malus de bluff) annulés (0) ou multipliés */
  | { kind: 'tag'; tag: TagId; factor: number }
  /** Demi-journée perdue à l'arrivée ou à 06h00 dans le district */
  | { kind: 'halfDay' }
  /** Canicule : fonte d'un produit, vieillissement des périssables, usure des trajets de jour */
  | { kind: 'heat'; melts: readonly ProductId[]; ageDays: number; dayTripChassis: number; dayTripHealth: number }
  /** Prix des réparations du garage multiplié */
  | { kind: 'repair'; factor: number }
  /** Drones cloués au sol : aucun contrôle volant */
  | { kind: 'grounded' }
  /** Galeries non filmées : un écart de nuit n'est pas enregistré (pas de Fiche S) */
  | { kind: 'unfilmed' }
)

export type GameEvent = {
  effects: readonly EventEffect[]
  /** Événement global qui dure plusieurs jours (canicule) : il reste en vigueur à côté des événements du jour */
  days?: number
}

/** Coût d'une option d'aléa routier ; tous les éléments sont dus */
export type RoadCost = {
  cash?: number
  fuel?: number
  /** Caisses demandées : produit précis, ou la moins chère d'un tag ou de tiers */
  crates?: { qty: number; productId?: ProductId; tag?: TagId; tiers?: readonly Tier[] }
  /** Une place libre en soute (caisse gagnée) */
  freeSlot?: boolean
}

/** Effets d'une option d'aléa routier */
export type RoadOutcome = {
  cash?: number
  icc?: number
  health?: number
  chassis?: number
  fuel?: number
  /** Une caisse au hasard dans ce tier */
  crateTier?: Tier
}

export type RoadChoice = {
  /** Paiements possibles, au choix du joueur ; aucun = option gratuite */
  pay?: readonly RoadCost[]
  outcome?: RoadOutcome
  /** Pari : issue tirée au moment du choix */
  gamble?: { chance: number; win: RoadOutcome; lose: RoadOutcome }
}

export type RoadEvent = { a: RoadChoice; b: RoadChoice }

/** Effets chiffrés d'un tag sur le risque et le contrôle (chap. 2) ; absent = sans effet */
export type Tag = {
  /** Couverture : risque retiré × part du tag dans la cargaison */
  cover?: number
  /** Risque ajouté × part du tag, à chaque trajet */
  tripRisk?: number
  /** Risque ajouté × part du tag, dans les districts qui détectent ce tag */
  detectedRisk?: number
  /** Chance de bluff retirée × part du tag */
  bluffMalus?: number
  /** Malus d'odeur : multipliés par le facteur d'odeur du district (chiens-robots) */
  smell?: boolean
  /** Cycle de fraîcheur (chap. 2) */
  perishable?: boolean
  /** Vraie nourriture : ce que sublime Mama Rosa (chap. 4) */
  gourmet?: boolean
  /** Clientèle captive : facteur de la reconstitution matinale du rachat au cours (chap. 2) */
  demandRefill?: number
  /** Casse : en fuite réussie, et aux chocs de châssis hors fuite (chap. 2) */
  breakage?: { fleeChance: number; shockChance: number; shockThreshold: number }
  /** Cadeau d'agent : seuls ces produits s'offrent à la corruption, avec la connivence (chap. 5) */
  bribeGift?: boolean
  /** Coefficient de vente pendant le couvre-feu (chap. 2) ; pour le tag de l'after, la fête le remplace (chap. 1) */
  nightSale?: number
}

export type Product = {
  tier: Tier
  basePrice: number
  tags: readonly TagId[]
  /** Tier 0 : chaque caisse masque 1 caisse de ce tag (chap. 2, masquage 1:1) */
  masks?: TagId
  /** Remplace le stock du tier */
  dailyStock?: Range
  /** Chance d'apparaître chaque jour dans la boutique de son district producteur */
  appearanceChance?: number
  /** Balise de traçage : risque ajouté partout tant qu'une caisse est en soute */
  beaconRisk?: number
  /** Une fouille effective avec ce produit en soute est fatale (exécution sommaire, chap. 1) */
  lethalOnSearch?: boolean
  /** Trop encombrant pour le double fond (chap. 4) */
  bulky?: boolean
  /** Caisses scellées du DSC (mission de nuit) : hors commerce, ni vendues ni données (chap. 1) */
  sealed?: boolean
  /** Refroidissement moteur : caisses consommées pour annuler l'usure d'un trajet de nuit */
  cooling?: { crates: number }
  /** Dopage pilote en fuite (une caisse bue, une fois par jour) */
  doping?: { fleeBonus: number; chassisLoss: number; iccLoss: number }
  /** Nuit blanche forcée malgré l'épuisement (une caisse bue) */
  sleeplessNight?: { healthLoss: number; minHealth: number }
  /** Aide au bluff : caisses données ou sacrifiées à l'agent */
  bluffAid?: { crates: number; bonus: number; cancelsSmell: boolean }
  /** Restauration d'ICC hors plafond, une seule fois par partie (une caisse utilisée) */
  iccRestore?: number
}

export type TierStats = {
  /** Stock en boutique, par produit et par jour */
  dailyStock: Range
  /** Quota de demande par produit et par district ; null = illimité */
  demandQuota: { neutral: number; strong: number } | null
  /** Ajouté au coefficient de Forte demande du district (chap. 2) */
  strongDemandBonus: number
}

/** Officielle : connectée à Aeterna, fermée la nuit sous un certain ICC. Fixe : toujours ouverte. */
export type PumpType = 'official' | 'fixed'

export type District = {
  /** Place dans la pyramide sociale, du pire (0) au meilleur (5) */
  echelon: number
  /** Étoiles de sécurité (1 à 5) : bluff, corruption, plafond de fuite (chap. 5) */
  security: number
  baseRisk: number
  /** Prix de base d'une ration de Synthanol */
  fuelPrice: number
  pump: PumpType
  /** Relais routier du DSC où dormir ; sinon bivouac, sans gain de sommeil (chap. 1) */
  relay: boolean
  /** Tag ciblé par la détection spéciale du district */
  detection: TagId | null
  droneJudges: boolean
  /** Zone hors-réseau : pas de BRC, racket des milices à la place (chap. 3) */
  offGrid: boolean
  /** Risque ajouté à destination pour tout trajet au départ de ce district (portique du sas) */
  exitGateRisk: number
  /** Multiplicateur des malus d'odeur (chiens-robots) */
  odorFactor: number
  /** Coupe-file des Citoyens Or aux portiques (chap. 1) */
  goldFastLane: boolean
  /** Détecteurs biométriques d'ICC : un Déviant notoire y est intercepté à coup sûr (chap. 1) */
  iccScanners: boolean
  /** Éjection d'urgence possible (dalle bio-scellée sinon) */
  /** Entrée des livreurs de jour : voies de surface, ou quais de service des élites (chap. 3) */
  access: 'street' | 'docks'
  /** Part des interceptions BRC qui sont des contrôles volants : ni fuite ni éjection (chap. 5) */
  flyingCheckShare: number
  /** Modes d'éjection autorisés : décharge manuelle, trappe de MOD-07 (le broyeur de VEH-04 passe partout) */
  ejection: { manual: boolean; trapdoor: boolean }
  /** Produits que les milices prennent en premier au péage en nature, dans l'ordre (chap. 3) */
  tollFavorites: readonly ProductId[]
  /** Coefficient de marché des produits de la liste Production */
  coefProduction: number
  /** Coefficient de marché des produits en Forte demande, avant bonus de tier */
  coefStrongDemand: number
  production: readonly ProductId[]
  /** Nombre de produits de la liste Production tirés chaque jour ; absent = toute la liste */
  productionDraw?: Range
  strongDemand: readonly ProductId[]
}

/** Services rendus par les lieux spéciaux implémentés (chap. 2 et 3) */
export type LocationService = 'debt' | 'cantine' | 'offshore' | 'garage' | 'crew' | 'influence' | 'morgue' | 'prophecy' | 'forgery' | 'velvet'

/** Services à usage compté (coût croissant) ou à cooldown */
export type ServiceKey = 'meal' | 'influence' | 'pass' | 'surgery' | 'certificate' | 'prophecy' | 'forgery' | 'auction' | 'vip'

/** Carte d'un faux dossier de Loterie (chap. 3) */
export type ForgeryCard =
  { kind: 'captain' | 'competitor'; district: DistrictId } | { kind: 'informant' } | { kind: 'cadre'; district: DistrictId; vice: ProductId }

export type Location = {
  district: DistrictId
  services: readonly LocationService[]
  /** Ouvert aussi le soir et la nuit (les autres lieux ferment à 20h00) */
  nightOpen?: boolean
}

export type Vehicle = {
  /** Conditions pour que Mitch le vende (catalogue en rayons, chap. 4) */
  requires?: readonly Requirement[]
  price: number
  /** Emplacements de soute (1 caisse = 1 emplacement) */
  cargo: number
  /** Emplacements du double fond, compris dans la soute (chap. 4) */
  hiddenCompartment: number
  moduleSlots: number
  /** PV max du châssis */
  maxChassis: number
  /** Coefficient d'équipement sur le risque d'interception ; absent = ×1 */
  riskFactor?: number
  /** Capacité du réservoir, en rations */
  tank: number
  /** Rations consommées par trajet, selon la phase */
  fuelPerTrip: Record<Phase, number>
  /** Camouflage corporatif : risque × factor tant que le Légal fait au moins minShare de la soute */
  legalCamouflage?: { minShare: number; factor: number }
  /** Chaîne du froid : les périssables ne perdent de la fraîcheur qu'un matin sur deux */
  coldChain?: boolean
  /** Immunité à la canicule : ni fonte, ni vieillissement, ni usure de châssis */
  heatProof?: boolean
  /** Transpondeur d'urgence : bonus de fuite dans ces districts, sans dégât au succès, perte d'ICC réduite */
  transponder?: { districts: readonly DistrictId[]; fleeBonus: number; iccLossFactor: number }
  /** Monstre blindé : péage réduit, passage forcé sans dégât, broyeur acide, risque ajouté */
  heavy?: { tollFactor: number; crusherChance: number; riskAdd: number }
}

export type ModuleCategory = 'conservation' | 'camouflage' | 'tactical'

/**
 * Montage d'un module au changement de châssis (chap. 4) : électronique qui se démonte et suit le joueur, mécanique que
 * Mitch adapte contre une part de son prix, ou soudé au châssis et perdu avec lui
 */
export type ModuleFitting = 'portable' | 'adaptable' | 'welded'

export type Module = {
  /** Conditions pour que Mitch le vende (catalogue en rayons, chap. 4) */
  requires?: readonly Requirement[]
  price: number
  category: ModuleCategory
  fitting: ModuleFitting
  /** Assistance de conduite : chance de fuite ajoutée ; le chauffeur à bout ne pénalise plus la fuite */
  drivingAssist?: { fleeBonus: number }
  /** Facteur sur les effets d'un tag (risque au trajet, détection, malus de bluff) */
  tagFactor?: { tag: TagId; factor: number }
  /** Fragiles immunisés à la casse ; usure des trajets de nuit annulée */
  smoothRide?: boolean
  /** Silentblocs : facteur sur le malus de risque d'un trajet de nuit hors mission */
  nightRiskFactor?: number
  /** Cage de Faraday : facteur sur la part de contrôles volants (0 : plus aucun) */
  flyingCheckFactor?: number
  /** Plaque rotative : une fuite réussie devant la BRC ne coûte ni ICC ni Fiche S */
  rotatingPlate?: boolean
  /** Fuite et passage forcé : chance ajoutée, dégâts de châssis et perte de Santé multipliés */
  ram?: { fleeBonus: number; damageFactor: number }
  /** Trappe de largage : mode d'éjection, récupération d'une part tirée entre minRecovery et maxRecovery */
  trapdoor?: { chance: number; minRecovery: number; maxRecovery: number }
  /** Faux terminal : bonus au bluff, tarif standard de corruption multiplié */
  fakeTerminal?: { bluffBonus: number; bribeRateFactor: number }
  /** Cloison fantôme : facteur sur la chance que les agents trouvent le double fond */
  compartmentFactor?: number
}

/** Acte qui fait se présenter un équipier (chap. 4) : contrôles franchis sans garde à vue, caisses d'un tag vendues, première Fiche S */
/**
 * Condition de progression (chap. 1, 3 et 4) : dette initiale soldée, commandes du DSC livrées, première Fiche S,
 * palier d'ICC actuel, patrimoine actuel (Cash-Puce et offshore), caisses d'un tag vendues,
 * contrôles de la BRC franchis sans garde à vue
 */
export type Requirement =
  | { kind: 'debtPaid' }
  | { kind: 'deliveries'; count: number }
  | { kind: 'wanted' }
  | { kind: 'iccTier'; tier: IccTier }
  | { kind: 'wealth'; amount: number }
  | { kind: 'tagSales'; tag: TagId; count: number }
  | { kind: 'controls'; count: number }
  | { kind: 'compartmentHeld'; count: number }

export type Crew = {
  /** Conditions pour qu'il se présente au Quai 9 */
  requires: readonly Requirement[]
  /** Salaire quotidien */
  dailySalary: number
  /** Salaire réduit contre une caisse consommée à 06h00 (tag et tier minimal) */
  inKindSalary?: { amount: number; tag: TagId; minTier: Tier }
  /** Coefficient d'équipement sur le risque d'interception, zone hors-réseau comprise */
  riskFactor?: number
  bribeBonus?: number
  /** Révèle chaque matin le district de la ronde renforcée */
  revealsPatrol?: boolean
  /** Cours de tous les districts en temps réel */
  liveQuotes?: boolean
  /** Brouille les balises de traçage des produits en soute (malus de risque annulé) */
  masksBeacon?: boolean
  /** Taux offshore ajouté, sauf les matins en cellule */
  offshoreBonus?: number
  /** Bonus de fuite et de passage forcé */
  fleeBonus?: number
  /** Bonus à la falsification d'un dossier de Loterie */
  forgeryBonus?: number
  /** Savoir-faire des produits Gourmet */
  gourmetKnowHow?: number
  /** Affinage : les caisses Gourmet Standard se vendent au coefficient Extra-Frais */
  refining?: boolean
  /** Facteur des quotas de demande des produits Gourmet */
  gourmetQuota?: number
}

// ─── État de la partie ───

/** Service de jour (06h00 – 20h00) ou tournée de nuit (chap. 1) */
export type Phase = 'day' | 'night'

/** Mode de difficulté (chap. 1) : Citoyen, Passeur, Hors-la-loi */
export type DifficultyId = 'citizen' | 'smuggler' | 'outlaw'

/** Trajet fait, pour l'itinéraire repéré (chap. 5) */
export type RouteTrip = { day: number; from: DistrictId; to: DistrictId }

/** `finished` : audit du Jour 30 passé ou défaite ; la fin est dans `GameState.ending` */
export type GameStatus = 'playing' | 'finished'

/** Paliers de crédit social (chap. 1), du plus haut au plus bas */
export type IccTier = 'gold' | 'ordinary' | 'probation' | 'deviant'

/** Fins de partie (chap. 1) : les quatre grandes fins, puis les défaites */
export type EndingId = 'saboteur' | 'resident' | 'elite' | 'mafia' | 'standard' | 'bio-bricks' | 'death' | 'execution'

export type Ending = {
  id: EndingId
  /** Score final : solde du compte offshore à l'audit (0 en cas de défaite) */
  score: number
}

/** Compte offshore : intérêts simples, donc dépôts et intérêts versés sont suivis à part (chap. 1) */
export type OffshoreAccount = {
  /** Dépôts nets de commission : seule base des intérêts */
  deposited: number
  /** Intérêts versés, qui ne produisent pas d'intérêts */
  interest: number
}

/** Barrage en cours, à résoudre avant toute autre action (chap. 5) ; `racket` en zone hors-réseau (chap. 3) */
export type Interception = {
  /** Barrage fixe de la BRC, contrôle volant (ni fuite ni éjection), ou racket des milices */
  kind: 'brc' | 'flying' | 'racket'
  /** Une action a déjà été tentée : l'éjection n'est plus possible */
  acted: boolean
  /** Bluff raté : bluff et éjection fermés, amende relevée, malus à la corruption et à la fuite */
  bluffFailed: boolean
  /** Caisses de la commande VIP sous la protection du parrain, hors de portée des agents, rendues à la fin du contrôle */
  covered?: CargoLot[]
}

/** Options de l'écran d'interception (BRC) et du racket des milices */
export type InterceptionMove = 'search' | 'bluff' | 'bribe' | 'flee' | 'eject' | 'payToll' | 'payTollInKind' | 'refuseToll'

/** Caisses d'un produit, pour un paiement en nature */
export type CrateCount = {
  productId: ProductId
  qty: number
}

/** Offre de corruption : Cash-Puce et caisses de la soute, cumulables (chap. 5) */
export type Offer = {
  cash: number
  crates: readonly CrateCount[]
}

/** Ce qu'une option a coûté ou rapporté, pour le compte rendu affiché au joueur */
export type InterceptionReport = {
  move: InterceptionMove
  /** Chance de l'option tentée (détaillable) ; null pour une option sans jet */
  chance: Breakdown | null
  /** Issue du jet ; null pour une option sans jet */
  success: boolean | null
  /** Vrai si le barrage est franchi (ou la garde à vue purgée) */
  over: boolean
  cash: number
  crates: number
  icc: number
  health: number
  chassis: number
  wanted: number
  custodyDays: number
  /** Caisses fragiles endommagées */
  damaged: number
  /** Caisses données ou bues par une tactique (aides au bluff, dopage) */
  sacrificed: number
  /** Facture du dépannage d'urgence si le châssis est tombé à 0 */
  towBill: number
  /** Part de l'amende restée impayée faute de Cash-Puce : garde à vue prolongée */
  unpaidFine: number
  /** Double fond : gardé (non trouvé à la fouille, ou éjection), trouvé, ou sans objet */
  compartment: 'kept' | 'found' | null
  /** Caisses sauvées par le double fond */
  hiddenCrates: number
}

/** Tactiques d'une option de barrage : aides au bluff, sacrifices et dopage en fuite (chap. 2 et 5) */
export type Tactics = {
  /** Produits dont les caisses sont données ou sacrifiées à l'agent pendant le bluff */
  /** Produit bu pour le dopage pilote pendant la fuite */
  dope?: ProductId
}

/** Ce que le dernier trajet a coûté hors barrage */
export type TripReport = {
  /** Coup de chaleur d'un trajet de jour pendant la canicule : PV de Santé perdus */
  heatHealth: number
  /** PV de châssis perdus (usure de nuit) */
  chassisWear: number
  /** Caisses consommées pour refroidir le moteur à la place de l'usure */
  coolingCrates: number
  /** Commande du DSC livrée (livraison du jour, mission de nuit), écart de nuit enregistré, ou écart passé sans caméra */
  mission: 'delivered' | 'deviated' | 'unfilmed' | 'plated' | null
  /** Prime de la commande livrée */
  missionFee: number
  /** Injection du serveur réussie pendant ce trajet : le total atteint, 0 sinon */
  injection: number
}

/** Ce que la nuit et la routine de 06h00 ont changé, pour le briefing du matin (chap. 1 et 7) */
export type MorningBriefing = {
  day: number
  /** District du réveil : où la nuit s'est passée */
  districtId: DistrictId
  /** Gains de la nuit au relais routier (après plafond d'ICC) ; null au bivouac */
  sleep: { icc: number; health: number } | null
  debtInterest: Breakdown | null
  /** Nuit en cellule (garde à vue) : PV perdus */
  custodyHealth: number
  /** Caisses périssables pourries, détruites à 06h00 */
  rotten: number
  /** Canicule : caisses fondues ou pourries par la chaleur ; null sans canicule */
  heat: { melted: number; rotten: number; aged: number } | null
  /** Sas d'un événement local : la journée commence à 20h00 */
  lockedIn: boolean
  /** Caisses larguées par la trappe : rapportées par les complices, et perdues */
  recovered: { back: number; lost: number } | null
  /** Salaire du matin : montant payé (0 en cellule), null s'il n'a pas pu l'être ; caisse consommée */
  crew: { id: CrewId; paid: number | null; crate: ProductId | null } | null
  /** Équipier disparu au tirage de la Loterie */
  crewLost: CrewId | null
  /** Commande VIP manquée : ICC perdue, Silo verrouillé */
  vipFailed: boolean
  /** Caisses scellées d'une mission non livrée, reprises par la plateforme */
  missionReclaimed: number
  /** Faux dossier de l'indic : Fiche S effacée, ICC gagné */
  informant: boolean
  /** Fiche S : un niveau effacé ce matin, après assez de jours sans écart */
  wantedCleared: boolean
  /** Vrai le matin où la dette passe en retard (taux majoré, embuscades) */
  debtLate: boolean
  /** Collecte de protection : montant dû, part payée en Cash-Puce, reliquat ajouté à la dette */
  protection: { due: Breakdown; paid: number; toDebt: number } | null
  offshoreInterest: Breakdown | null
  /** Placement du Cartel : ₡ perdus dans un coup de filet (0 sans coup de filet), puis intérêts du jour */
  ventureRaid: number
  ventureInterest: Breakdown | null
  /** Contrat de la Pègre manqué : pénalité ajoutée à la dette, 0 sinon */
  contractFailed: number
}

/** Événements en cours et tirages à venir (chap. 6) */
export type EventsState = {
  global: GlobalEventId | null
  local: Partial<Record<DistrictId, LocalEventId>>
  /** Événements d'hier : source des contrecoups du jour */
  yesterday: { global: GlobalEventId | null; local: Partial<Record<DistrictId, LocalEventId>> }
  /** Dernier jour de déclenchement de chaque événement local (cooldown) */
  localDays: Partial<Record<LocalEventId, number>>
  /** Événement global déjà tiré pour demain, caché au joueur */
  tomorrow: GlobalEventId | null
  /** Rumeur publiée aujourd'hui sur demain (vraie ou fausse) */
  rumor: GlobalEventId | null
  lottery: Lottery | null
  /** Dernier jour de chaque aléa routier (cooldown) */
  roadDays: Partial<Record<RoadEventId, number>>
  /** Prédiction de Cassandre-88 : événement global garanti ce jour-là */
  prophecy: { day: number; event: GlobalEventId } | null
  /** Faux dossier accepté pour le tirage de ce jour-là */
  forgery: { day: number; card: ForgeryCard } | null
  /** Événement global qui dure (canicule), en vigueur jusqu'au jour `until` inclus */
  lasting: { event: GlobalEventId; until: number } | null
}

/** Dernier tirage de la Loterie : promu, déclassé et vice emporté */
export type Lottery = {
  day: number
  promoted: DistrictId
  /** District du déclassé ; null quand Aeterna n'a pas fait d'exemple à ce tirage */
  demoted: DistrictId | null
  /** Produit qui passe en Forte demande dans `viceDistrict` jusqu'à `viceUntil` inclus */
  vice: ProductId | null
  viceDistrict: DistrictId | null
  viceUntil: number
  /** Index des noms tirés (lore) */
  names: { promoted: number; demoted: number }
  /** Carte du faux dossier qui a imposé un rôle, s'il y en a un */
  card: ForgeryCard['kind'] | null
}

/** Compte rendu d'un aléa routier : option choisie et variations */
export type RoadReport = {
  eventId: RoadEventId
  choice: 'a' | 'b'
  /** Issue du pari, null sans pari */
  won: boolean | null
  cash: number
  icc: number
  health: number
  chassis: number
  fuel: number
  crates: number
  /** Caisses fragiles endommagées par le choc */
  damaged: number
  /** Facture du dépannage d'urgence si le châssis est tombé à 0 */
  towBill: number
}

/** États de fraîcheur d'une caisse périssable (chap. 2) ; une caisse pourrie est détruite */
export type FreshnessStage = 'extra' | 'standard' | 'gamey' | 'spoiled'

/** Patrimoine à un instant : Cash-Puce, solde offshore, dette (carnet de route, chap. 7) */
export type WealthSnapshot = {
  cash: number
  offshore: number
  /** Solde du placement du Cartel */
  venture: number
  debt: number
}

/** Fait marquant d'une journée, noté au carnet de route (chap. 7) */
export type Highlight =
  | { kind: 'trip'; from: DistrictId; to: DistrictId; phase: Phase }
  /** Barrage réglé : forme du contrôle, dernière option jouée, issue, caisses perdues, jours de garde à vue */
  | { kind: 'control'; control: Interception['kind']; move: InterceptionMove; success: boolean | null; crates: number; custodyDays: number }
  | { kind: 'road'; eventId: RoadEventId; won: boolean | null }
  | { kind: 'delivered'; fee: number }
  | { kind: 'deviated' }
  | { kind: 'injection'; total: number }
  | { kind: 'vehicle'; vehicleId: VehicleId }
  | { kind: 'module'; moduleId: ModuleId }
  | { kind: 'crew'; crewId: CrewId }
  | { kind: 'debtPaid' }
  | { kind: 'wanted'; level: number }
  | { kind: 'iccTier'; tier: IccTier }
  | { kind: 'ending'; id: EndingId; score: number }
  | { kind: 'raid'; loss: number }
  | { kind: 'contractDone'; reward: number }
  | { kind: 'contractFailed'; penalty: number }

/** Une journée du carnet de route (chap. 7) */
export type DayLog = {
  day: number
  /** Patrimoine à 06h00, routine faite ; celui du lendemain matin ferme la journée */
  start: WealthSnapshot
  /** Événements du jour, tirés à 06h00 : le passé du calendrier */
  events: { global: GlobalEventId | null; local: Partial<Record<DistrictId, LocalEventId>> }
  /** Cash-Puce dépensé en marchandise, et encaissé en ventes */
  bought: number
  sold: number
  highlights: readonly Highlight[]
}

/** Contrat de la Pègre (chap. 3) : caisses à livrer, destination, dernier jour, prime */
export type Contract = {
  productId: ProductId
  qty: number
  to: DistrictId
  /** Dernier jour pour livrer, inclus */
  deadline: number
  reward: number
}

/** Contenu du double fond (chap. 4) : caisses cachées par produit */
export type Compartment = Partial<Record<ProductId, number>>

/** Caisses délogées du double fond par l'arrivée d'un produit plus cher (chap. 4), annoncées au joueur */
export type CompartmentNotice = {
  productId: ProductId
  displaced: readonly CrateCount[]
}

/** Caisses d'un même produit achetées ensemble */
export type CargoLot = {
  productId: ProductId
  qty: number
  /** Prix d'achat unitaire, pour le prix moyen d'achat affiché */
  unitCost: number
  /** Faux tant que le lot n'a pas quitté son district d'achat (clause anti-arbitrage, chap. 2) */
  travelled: boolean
  /** Jour d'achat : base du cycle de fraîcheur des périssables (chap. 2) */
  boughtDay: number
  /** Caisses endommagées (casse des fragiles) : vendues et données à prix réduit */
  damaged: boolean
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
  /** Mode de difficulté, fixé au lancement (chap. 1) */
  difficulty: DifficultyId
  /** Jour 1 à 30 */
  day: number
  phase: Phase
  districtId: DistrictId
  vehicleId: VehicleId
  /** Rations de Synthanol dans le réservoir */
  fuel: number
  cargo: readonly CargoLot[]
  markets: Record<DistrictId, DistrictMarket>
  /** Cours observés par district, un relevé par jour, du plus ancien au plus récent */
  memory: Partial<Record<DistrictId, readonly MarketMemory[]>>
  /**
   * Bulletin du Fil (chap. 2) : cours du matin de chaque district, relevés chaque jour. Le joueur n'en voit que la tendance
   * de la veille et d'avant (sens et forme), jamais les prix
   */
  bulletin: Partial<Record<DistrictId, readonly MarketMemory[]>>
  events: EventsState
  /** Aléa routier en attente du choix du joueur : le trajet est suspendu */
  roadEvent: RoadEventId | null
  roadReport: RoadReport | null
  /** Trajets des derniers jours, pour l'itinéraire repéré (chap. 5) */
  routes: readonly RouteTrip[]
  dayTripDone: boolean
  nightTripDone: boolean
  /** Dernier jour où le couvre-feu a été forcé (épuisement nerveux, chap. 1) */
  lastCurfewDay: number | null
  /** Cash-Puce */
  cash: number
  /** Solde de la dette mafieuse */
  debt: number
  /** Statut acquis définitivement la première fois que la dette atteint 0 (chap. 1) */
  initialDebtPaid: boolean
  /** Total emprunté en avance de survie, avant que la dette initiale soit soldée */
  advanced: number
  /** Modules possédés et modules montés sur le véhicule (chap. 4) */
  modules: { owned: readonly ModuleId[]; mounted: readonly ModuleId[] }
  /** Caisses larguées par la trappe, récupérées en partie à la prochaine routine */
  dumped: readonly CargoLot[]
  /** Équipage (chap. 4) : équipier actif, jour payé (il travaille), recrutements, disparus */
  crew: {
    active: CrewId | null
    paidDay: number | null
    hires: number
    lost: readonly CrewId[]
    /** Prochain recrutement gratuit (après une disparition) */
    freeHire: boolean
    /** Le joueur permet de payer un salaire réduit en caisses (réglage) */
    payInKind: boolean
  }
  /** Lieux spéciaux : utilisations passées (coûts croissants) et dernier jour d'usage (cooldowns) */
  services: { uses: Partial<Record<ServiceKey, number>>; lastDay: Partial<Record<ServiceKey, number>> }
  /** Dernier jour de validité du laissez-passer de la Morgue */
  morguePass: number | null
  /** Panique algorithmique de Karma-Cham : tag dopé, le jour dit */
  influence: { tag: TagId; day: number } | null
  /** Commande VIP du Velvet-Silo : produit et jour de la commande */
  vip: { productId: ProductId; day: number } | null
  /** Contrat de la Pègre proposé ce jour chez Viktor, et contrat accepté en cours (chap. 3) */
  contractOffer: Contract | null
  contract: Contract | null
  /** Velvet-Silo verrouillé jusqu'à ce jour inclus (commande VIP manquée) */
  velvetLock: number | null
  /** Livraison officielle proposée ce matin (district), jusqu'à son acceptation */
  dayOffer: DistrictId | null
  /** Carnet de progression (chap. 1 et 4) : actes qui débloquent équipiers, nuit et confiance du DSC */
  progress: {
    /** Contrôles de la BRC franchis sans garde à vue */
    controlsPassed: number
    /** Caisses vendues, par tag */
    tagSales: Partial<Record<TagId, number>>
    /** Le joueur a déjà eu une Fiche S */
    flagged: boolean
    /** Commandes du DSC livrées (jour et nuit) */
    deliveries: number
    /** Commandes VIP du Velvet-Silo livrées, moins celles manquées (parrainage de l'Élite) */
    vipOrders: number
    /** Injections du serveur réussies par Glitch (Fantôme) */
    injections: number
    /** Fouilles où les agents n'ont pas trouvé le double fond (catalogue de Mitch) */
    compartmentHeld: number
  }
  /** Livraison officielle acceptée, jusqu'à sa livraison ou à 06h00 */
  delivery: { to: DistrictId } | null
  /** Mission de nuit proposée pour ce soir (district), tirée le matin */
  nightOffer: DistrictId | null
  /** After du couvre-feu de ce soir (district), tirée et annoncée le matin */
  after: DistrictId
  /** Mission de nuit acceptée, jusqu'à sa livraison ou à 06h00 */
  mission: { to: DistrictId } | null
  /** Échéance du retard franchie : taux majoré et embuscades jusqu'à la fin de la partie */
  debtLate: boolean
  offshore: OffshoreAccount
  /** Placement du Cartel : mêmes comptes que l'offshore, rendement plus haut, coups de filet (chap. 1) */
  venture: OffshoreAccount
  /** Indice de Conformité Civique, 0–100 */
  icc: number
  /** Gains de route d'ICC déjà reçus depuis 06h00 (plafond quotidien) */
  iccRouteGains: number
  /** Santé du joueur, 0–100 PV */
  health: number
  /** PV du châssis du véhicule */
  chassis: number
  /** Fiche S algorithmique : niveau de recherche, 0 à 3 (chap. 5) */
  wanted: number
  /** Jour du dernier changement de la Fiche S (écart, ou niveau effacé) : le compte des jours sans écart part de là */
  wantedSince: number
  /** District de la ronde renforcée du jour, caché au joueur */
  patrolDistrict: DistrictId | null
  /** Districts en pic suspect aujourd'hui (ventes saturées la veille, chap. 2) */
  suspiciousPeaks: readonly DistrictId[]
  /** Districts où le joueur a vendu au-delà de la demande aujourd'hui : pics suspects de demain */
  oversold: readonly DistrictId[]
  /**
   * Service de jour terminé avant le couvre-feu (« passé à 20h00 » : demi-journée perdue, sortie de garde à vue,
   * immobilisation) : plus de trajet de jour ni de lieu spécial, seul le marché de rue reste ouvert (chap. 1)
   */
  dayOver: boolean
  /** Le dépannage de cette nuit immobilisera le joueur demain jusqu'à 20h00 */
  immobilizedTomorrow: boolean
  interception: Interception | null
  interceptionReport: InterceptionReport | null
  tripReport: TripReport | null
  /** Couvre-feux forcés consécutifs, jusqu'au dernier (épuisement nerveux) */
  curfewStreak: number
  /** Dernier jour d'un dopage pilote (une fois par jour) */
  lastDopingDay: number | null
  /** Restauration d'ICC hors plafond déjà utilisée (une fois par partie) */
  iccRestoreUsed: boolean
  /** Refroidissement moteur automatique par les caisses qui le permettent (réglage du joueur) */
  autoCooling: boolean
  /** Contenu du double fond (chap. 4) */
  compartment: Compartment
  /** Caisses délogées par la dernière action ; effacé à la suivante */
  compartmentNotice: CompartmentNotice | null
  /** Carnet de route : une entrée par jour joué (chap. 7) */
  journal: readonly DayLog[]
  /** Briefing de la dernière routine matinale ; null au Jour 1 */
  briefing: MorningBriefing | null
  /** Fin de partie, une fois `status` à `finished` */
  ending: Ending | null
  /** État du générateur aléatoire : sauvegardé pour que recharger ne relance pas les dés */
  rng: RngState
}
