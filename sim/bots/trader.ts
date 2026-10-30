import {
  AFTER,
  DEBT_DAILY_RATE,
  DEBT_LATE,
  ENDINGS,
  FLEE,
  GAME_LENGTH_DAYS,
  HIGH_TIER,
  ICC_TIERS,
  SALE_COMMISSION,
  OFFSHORE_WITHDRAW_FACTOR,
  SEARCH,
  SURVIVAL_ADVANCE,
} from '../../src/data/balance.ts'
import { DISTRICT_IDS, DISTRICTS } from '../../src/data/districts.ts'
import { CONTRACT, KARMA, SERVICE_REQUIREMENTS, VELVET } from '../../src/data/locations.ts'
import { EVENT_MULT_CAP, ROAD_EVENTS } from '../../src/data/events.ts'
import { PRODUCT_IDS, PRODUCTS, SEALED_PRODUCT } from '../../src/data/products.ts'
import { CREW, MODULES, VEHICLES } from '../../src/data/vehicles.ts'
import { canSiphon, checkForceCurfew, checkService, fuelPrice, maxBuy, planTravel, pumpClosed, type Action } from '../../src/engine/actions.ts'
import { baseValue, cargoUsed, isIllegal, ownedQty, taggedQty } from '../../src/engine/cargo.ts'
import { daysBeforeRot, paymentValue } from '../../src/engine/condition.ts'
import { checkHire, crewEffect, hireFee, salary } from '../../src/engine/crew.ts'
import { checkBuyModule, checkBuyVehicle, ejectMode, missingChassis, mountedEffect, repairPrice } from '../../src/engine/equipment.ts'
import { eventFactor } from '../../src/engine/events.ts'
import { loanRoom, offshoreBalance, scoreOf } from '../../src/engine/finance.ts'
import {
  bluffChance,
  bribeChance,
  bribeRate,
  checkMove,
  compartmentDetection,
  ejectChance,
  fleeChance,
  fineAmount,
  fleeConsequences,
  hiddenCargo,
  isLethalSearch,
  minimumOffer,
  searchSanction,
  toll,
} from '../../src/engine/interception.ts'
import {
  demandQuota,
  knowHowBreakdown,
  lastSeen,
  normalQuote,
  productStatus,
  quote,
  saleQuote,
  shopProducts,
  unitSaleBreakdown,
} from '../../src/engine/market.ts'
import { checkDeliverContract } from '../../src/engine/contracts.ts'
import { checkDelivery, deliveryCrates, deliveryFee, deliveryOffer } from '../../src/engine/delivery.ts'
import { canInject, checkMission, missionOffer } from '../../src/engine/night.ts'
import { checkRoadChoice } from '../../src/engine/road.ts'
import {
  blackmailCost,
  checkAuction,
  checkBlackmail,
  checkInfluence,
  checkMorgue,
  checkVipDelivery,
  checkVipRequest,
  karmaCost,
  morgueCost,
  velvetDistrict,
  vipValue,
} from '../../src/engine/services.ts'
import { meets } from '../../src/engine/progress.ts'
import { risk } from '../../src/engine/risk.ts'
import type {
  CargoLot,
  CrateCount,
  CrewId,
  DistrictId,
  Contract,
  GameState,
  InterceptionMove,
  ModuleId,
  ProductId,
  RoadOutcome,
  TagId,
  Tier,
  VehicleId,
} from '../../src/engine/types.ts'
import type { Bot } from '../runner.ts'

/*
 * Le marchand (chap. 8) : un bot unique paramétré par un plan, un tempérament et un objectif.
 * Il décide à chaque appel une seule action, à partir de la vue publique, par priorités.
 * Le cœur est la planification d'un trajet : pour chaque destination, ce que vaudrait la soute
 * (actuelle et achats d'ici) une fois là-bas, moins le risque et le carburant.
 */

export type Plan = {
  name: string
  /** Équipement visé, dans l'ordre d'achat */
  vehicle?: VehicleId
  modules: readonly ModuleId[]
  crew?: CrewId
  /** Tags favorisés (score d'achat majoré) ou évités */
  favorTags?: readonly TagId[]
  avoidTags?: readonly TagId[]
  /** Part de la soute gardée en Tier 0 légal (couverture, bluff) */
  legalShare?: number
  /** Premier jour où l'on met de l'argent à l'abri offshore (dette soldée) */
  offshoreFromDay?: number
  /** Novice : n'achète que la production locale, accepte toujours la fouille, ne s'équipe pas, ne roule pas la nuit */
  novice?: boolean
  /** Lieux spéciaux utilisés quand le bot s'y trouve ; par défaut l'avance de survie */
  places?: readonly PlaceUse[]
  /** Tournées de nuit au moins quand la soute le justifie, quel que soit le tempérament (suspensions, tag Festif) */
  nightOwl?: boolean
  /** Chasse au serveur en cours (Fantôme) : passer par son district producteur pour le trouver en stock */
  huntsServer?: boolean
  /** Parrain à gagner (Élite) : passer au Velvet-Silo demander une commande VIP */
  seeksSponsor?: boolean
  /** Commande VIP en cours à honorer (Élite) : aller chercher le produit là où il est produit, de jour comme de nuit */
  vipErrand?: boolean
  /** Commande VIP en cours dont dépend le parrain (Élite) : la livraison au Silo vaut plus que sa recette */
  sponsorOrder?: boolean
  /** Fuite préférée à espérance égale (pare-buffles, brouilleur, transpondeur) */
  runner?: boolean
  /** ICC à défendre : certificat et chantage sous ce seuil, pertes d'ICC pesées plus lourd au barrage */
  iccFloor?: number
}

/** Usages des lieux spéciaux que sait faire le marchand (chap. 8, tests par retrait) */
export type PlaceUse = 'advance' | 'surgery' | 'certificate' | 'pass' | 'influence' | 'auction' | 'blackmail' | 'vip'

const DEFAULT_PLACES: readonly PlaceUse[] = ['advance']

/** Seuils d'usage des lieux : chirurgie sous cette Santé, certificat et chantage sous cet ICC */
const PLACE_THRESHOLDS = { surgeryBelowHealth: 50, iccBelow: 60 }

export type Temperament = {
  name: string
  /** Risque d'interception maximal accepté avec de l'illégal en soute */
  maxRisk: number
  /** Tier maximal acheté */
  maxTier: Tier
  /** Fonds gardé en plus du carburant (₡ de base, indexés) */
  reserve: number
  /** Tournée de nuit : jamais, sur mission seulement, hors mission si la soute le justifie, dès que possible */
  night: 'never' | 'mission' | 'margin' | 'always'
  /** Facteur sur l'espérance de perte des options audacieuses (fuite, bluff) : < 1 les rend plus tentantes */
  boldness: number
  /** Part de l'argent mis à l'abri confiée au placement du Cartel, le reste à l'offshore (chap. 1) */
  venture: number
}

/** Objectif (chap. 8, axe 3) : survivre, score maximal, ou une grande fin (Baron, Élite, Fantôme, Saboteur) */
export type Objective = 'score' | 'survive' | 'mafia' | 'elite' | 'resident' | 'saboteur'

const OBJECTIVE_NAMES: Record<Objective, string> = {
  score: 'score',
  survive: 'survie',
  mafia: 'Baron',
  elite: 'Élite',
  resident: 'Fantôme',
  saboteur: 'Saboteur',
}

/** Élite : ICC défendu avec une marge au-dessus du palier Or */
const ELITE_ICC_MARGIN = 5

/** Saboteur : à partir de ce jour, score assuré, il part chercher le serveur (rare : il faut du temps pour le trouver en stock) */
const SABOTEUR_HUNT_DAY = 20

/** Fantôme : à partir de ce jour, Glitch engagée, il part chercher le serveur pour les injections */
const RESIDENT_HUNT_DAY = 8

/** Le serveur des fins Saboteur et Fantôme, et son district producteur */
const SERVER = ENDINGS.saboteur.requiredProduct
const SERVER_PRODUCER = DISTRICT_IDS.find((id) => DISTRICTS[id].production.includes(SERVER)) ?? 'D5'

/** Valeurs de référence pour comparer des pertes de nature différente (₡ de base) */
const VALUE = {
  custodyDay: 1_200,
  iccPoint: 60,
  healthPoint: 40,
  wantedLevel: 400,
  chassisPoint: 40,
  trustDelivery: 1_500,
  sponsorVisit: 3_000,
  sponsorOrder: 10_000,
}

/** Contrat accepté seulement si le Cash-Puce, réserve gardée, couvre la valeur de base de ses caisses × ce facteur */
const CONTRACT_MARGIN = 1.2

/** Risque maximal d'un trajet de contrat : des caisses saisies, c'est la prime perdue et une pénalité */
const CONTRACT_MAX_RISK = 0.35

/** Marge minimale espérée pour acheter, en part du prix d'achat */
const MIN_MARGIN = 0.15

/** Revente espérée à l'after de ce soir : escomptée du risque de la nuit et du trajet de jour qui précède */
const AFTER_DISCOUNT = 0.75

/** Fonds de roulement gardé avant de rembourser la dette (₡ de base, indexés) */
const CAPITAL = 2_000

/** Dernier jour d'achat d'équipement : au-delà, il ne serait plus rentabilisé avant l'audit */
const LAST_EQUIPMENT_DAY = 18

/** Fin de partie : on vend tout, on solde la dette et on dépose tout à la Laverie */
const ENDGAME_DAY = 28

export function traderBot(plan: Plan, temperament: Temperament, objective: Objective): Bot {
  return {
    name: `${plan.name} · ${temperament.name} · ${OBJECTIVE_NAMES[objective]}`,
    decide: (view) => decide(view, goalPlan(plan, objective), goalTemperament(view, temperament, objective), objective),
  }
}

/** Score que vise l'objectif : le seuil de sa fin, ou rien */
function targetScore(objective: Objective): number | null {
  return objective === 'mafia' || objective === 'elite' || objective === 'resident' || objective === 'saboteur' ? ENDINGS[objective].minScore : null
}

/** Seuil atteint : l'argent (offshore et Cash-Puce) couvre le score de la fin visée */
function secured(view: GameState, objective: Objective): boolean {
  const target = targetScore(objective)
  return target !== null && scoreOf(view) + view.cash >= target
}

/** L'Élite défend son ICC au-dessus du palier Or (certificat, chantage, prudence au barrage) et sert les commandes VIP du Velvet-Silo (parrain) */
function goalPlan(plan: Plan, objective: Objective): Plan {
  if (objective !== 'elite') return plan
  const gold = ICC_TIERS.find((tier) => tier.tier === ENDINGS.elite.iccTier)?.min ?? 0
  return { ...plan, places: [...(plan.places ?? DEFAULT_PLACES), 'certificate', 'blackmail', 'vip'], iccFloor: gold + ELITE_ICC_MARGIN }
}

/** Seuil atteint : on sécurise plutôt que maximiser, plus aucun illégal (livraisons et légal seulement) ; le Fantôme, une fois la greffe complète */
function goalTemperament(view: GameState, temperament: Temperament, objective: Objective): Temperament {
  if (objective === 'saboteur' || !secured(view, objective)) return temperament
  if (objective === 'resident' && view.progress.injections < ENDINGS.resident.injections) return temperament
  if (objective === 'elite' && view.progress.vipOrders < ENDINGS.elite.sponsorOrders) return temperament
  return { ...temperament, maxRisk: 0, night: 'mission' }
}

/**
 * Le serveur que l'objectif doit garder ou se procurer : Saboteur (score assuré, fin de partie, jusqu'à Rust Valley),
 * Fantôme (Glitch engagée, tant que l'injection n'est pas complète)
 */
function serverHunt(view: GameState, objective: Objective): boolean {
  if (objective === 'saboteur') return view.day >= SABOTEUR_HUNT_DAY && secured(view, objective)
  if (objective === 'resident') {
    const { crew, injections } = ENDINGS.resident
    return view.day >= RESIDENT_HUNT_DAY && view.crew.active === crew && view.progress.injections < injections
  }
  return false
}

/** Élite sans parrain, Velvet-Silo ouvert et pas de commande en cours : il faut aller en demander une */
function seeksSponsor(view: GameState, objective: Objective): boolean {
  return objective === 'elite' && view.progress.vipOrders < ENDINGS.elite.sponsorOrders && !view.vip && meets(view, SERVICE_REQUIREMENTS.vip)
}

/** Élite avec une commande VIP en cours et pas encore les caisses : le parrain n'attend que quelques jours */
function vipErrand(view: GameState, objective: Objective): boolean {
  return objective === 'elite' && view.vip !== null && ownedQty(view.cargo, view.vip.productId) < VELVET.vip.crates
}

/** Élite sans parrain avec une commande VIP en cours : la livrer le rapproche du parrain */
function sponsorOrder(view: GameState, objective: Objective): boolean {
  return objective === 'elite' && view.vip !== null && view.progress.vipOrders < ENDINGS.elite.sponsorOrders
}

/** Cash-Puce gardé pour la chasse : le prix du serveur tant qu'il n'est pas à bord, puis le péage des milices et la collecte */
function huntReserve(view: GameState, objective: Objective): number {
  if (!serverHunt(view, objective)) return 0
  const value = PRODUCTS[SERVER].basePrice
  return ownedQty(view.cargo, SERVER) > 0 ? value * 0.3 : value * 1.5
}

/** Risque du trajet vers la destination d'un contrat, ses caisses à bord */
function contractRisk(view: GameState, contract: Contract): number {
  const crates = { productId: contract.productId, qty: contract.qty, unitCost: 0, travelled: false, boughtDay: view.day, damaged: false }
  return risk({ ...view, cargo: [...view.cargo, crates] }, contract.to, { includePatrol: false })
}

/** Caisses d'un contrat de la Pègre à acheter ici : celles qui manquent, si la boutique les a et que la prime couvre leur prix */
function contractPurchase(view: GameState): Action | null {
  if (!view.contract) return null
  const { productId, qty, reward } = view.contract
  const missing = qty - ownedQty(view.cargo, productId)
  if (missing <= 0 || !shopProducts(view.markets[view.districtId]).includes(productId)) return null
  const buyable = Math.min(missing, maxBuy(view, productId))
  if (buyable < 1 || quote(view, view.districtId, productId) * qty > reward) return null
  return { type: 'buy', productId, qty: buyable }
}

/** Un trajet vers ce district, s'il reste un trajet dans la phase, carburant compris */
function travelTo(view: GameState, to: DistrictId): Action | null {
  const left = view.phase === 'night' ? !view.nightTripDone : !view.dayTripDone && !view.dayOver
  if (!left || view.districtId === to) return null
  const trip = planTravel(view, to)
  if (trip.error === 'not-enough-fuel') return refuelFor(view, trip.fuelCost)
  return trip.error ? null : { type: 'travel', to }
}

/**
 * Chasse au serveur : l'acheter quand il est en stock dans son district producteur. Saboteur : l'y attendre, puis rejoindre
 * Rust Valley (racket, pas de fouille) et y rester jusqu'à l'audit. Fantôme : continuer de commercer en passant par le
 * district producteur ; null une fois le serveur à bord, les injections se font en tournée de nuit.
 */
function serverMove(view: GameState, objective: Objective): Action | null {
  const owned = ownedQty(view.cargo, SERVER) > 0
  if (!owned) {
    if (view.districtId === SERVER_PRODUCER && view.phase === 'day' && !view.dayOver && maxBuy(view, SERVER) > 0)
      return { type: 'buy', productId: SERVER, qty: 1 }
    // Le Fantôme continue de commercer en passant par le district producteur ; le Saboteur, score assuré, l'attend sur place
    if (objective === 'resident') return null
    return view.districtId !== SERVER_PRODUCER ? (travelTo(view, SERVER_PRODUCER) ?? { type: 'sleep' }) : { type: 'sleep' }
  }
  if (objective === 'saboteur') return travelTo(view, ENDINGS.saboteur.district) ?? { type: 'sleep' }
  return null
}

/**
 * Trajet vers le district le moins exposé (hors `avoid`), s'il reste un trajet dans la phase. La fouille coûte le plus :
 * le racket des milices (sans fouille) vaut mieux qu'un barrage, s'il reste de quoi payer le péage.
 */
function safestTrip(view: GameState, avoid?: DistrictId): Action | null {
  const exposure = (to: DistrictId) => (DISTRICTS[to].offGrid ? (view.cash >= toll(view) * 1.5 ? 0 : 1) : risk(view, to, { includePatrol: false }))
  const reachable = (id: DistrictId) => {
    const error = planTravel(view, id).error
    return !error || error === 'not-enough-fuel'
  }
  const targets = DISTRICT_IDS.filter((id) => id !== view.districtId && id !== avoid && reachable(id))
  const safest = targets.sort((a, b) => exposure(a) - exposure(b))[0]
  return safest ? travelTo(view, safest) : null
}

/**
 * Tournée de ce soir, une fois le trajet du jour fait (chap. 1) : de jour, le bot prévoit la nuit avant d'avoir roulé.
 * Null si elle sera permise.
 */
function tourTonight(view: GameState, drink?: ProductId) {
  return checkForceCurfew(view.phase === 'day' ? { ...view, dayTripDone: true } : view, drink)
}

/** Injections du Fantôme : soute couverte de Tier 0 le jour, tournée clandestine le soir vers le district le moins exposé */
function injectionMove(view: GameState): Action {
  if (view.phase === 'night') return safestTrip(view) ?? { type: 'sleep' }
  if (!view.dayOver) {
    // Plein fait de jour : la nuit, la pompe officielle peut être fermée
    const refuel = refuelFor(view, VEHICLES[view.vehicleId].tank)
    if (refuel) return refuel
    const free = VEHICLES[view.vehicleId].cargo - cargoUsed(view.cargo)
    const cover = Math.min(free, maxBuy(view, 'T0-01'))
    if (cover > 0) return { type: 'buy', productId: 'T0-01', qty: cover }
  }
  if (tourTonight(view)) return { type: 'sleep' }
  // La tournée part après le trajet du jour : d'abord un trajet de jour, le moins exposé
  if (!view.dayTripDone) return safestTrip(view) ?? { type: 'sleep' }
  return { type: 'forceCurfew' }
}

function decide(view: GameState, plan: Plan, temperament: Temperament, objective: Objective): Action {
  if (view.interception) return barrage(view, plan, temperament)
  if (view.roadEvent) return roadChoice(view)
  if (canSiphon(view)) return { type: 'siphon' }

  const night = view.phase === 'night'
  const open = !night && !view.dayOver
  const tripLeft = night ? !view.nightTripDone : !view.dayTripDone && !view.dayOver
  const endgame = view.day >= ENDGAME_DAY

  // Contrat de la Pègre : livrer dès qu'on est à destination avec les caisses
  if (!checkDeliverContract(view)) return { type: 'deliverContract' }

  const hunt = serverHunt(view, objective)
  const sale = sell(view, plan, endgame, hunt)
  if (sale) return sale

  if (open) {
    const service = services(view, plan, temperament, objective, endgame)
    if (service) return service
  }

  if (hunt) {
    const move = serverMove(view, objective)
    if (move) return move
    // Fantôme, serveur à bord : chaque nuit passée sans garde à vue est une injection
    if (canInject(view) || (view.phase === 'night' && ownedQty(view.cargo, SERVER) > 0)) return injectionMove(view)
  }

  const forContract = open ? contractPurchase(view) : null
  if (forContract) return forContract

  if (tripLeft) {
    // À sec, sans marchandise : rentrer à Hives prendre l'avance de survie de Viktor
    // Hors de portée faute de carburant : chercher d'abord un district plus proche (exploration)
    const rescue: Route | null =
      isBroke(view) && loanRoom(view) > 0 && view.districtId !== 'D1' && !night && !endgame && reachable(view, 'D1')
        ? { to: 'D1' as const, buys: [], value: 0 }
        : null
    // Fin de partie, ou serveur à bord : solder la dette puis rester à la Laverie
    const banking = objective !== 'survive' && endgame
    const hunting = hunt && objective === 'resident' && ownedQty(view.cargo, SERVER) === 0
    const routePlan = {
      ...plan,
      huntsServer: hunting,
      seeksSponsor: seeksSponsor(view, objective),
      vipErrand: vipErrand(view, objective),
      sponsorOrder: sponsorOrder(view, objective),
    }
    const route = rescue ?? (banking ? endgameRoute(view) : bestRoute(view, routePlan, temperament))
    if (route) {
      if (route.accept) return { type: 'acceptDelivery' }
      const [next] = route.buys
      if (next) return { type: 'buy', productId: next.productId, qty: next.qty }
      const trip = planTravel(view, route.to)
      if (trip.error === 'not-enough-fuel') {
        const refuel = refuelFor(view, trip.fuelCost)
        if (refuel) return refuel
      } else if (!trip.error) {
        return { type: 'travel', to: route.to }
      }
    }
  }

  if (!night) {
    const tour = eveningTour(view, { ...plan, vipErrand: vipErrand(view, objective) }, temperament)
    if (tour) return tour
  }
  return { type: 'sleep' }
}

// ─── Estimations (information publique) ───

/** Plus de quoi remplir la soute, même en revendant ce qui reste (quelques caisses de couverture…) */
function isBroke(view: GameState): boolean {
  return view.cash + baseValue(tradable(view)) < CAPITAL / 2
}

/** Prix net espéré d'une caisse dans un district : cours du jour ici, cours mémorisé ailleurs, sinon profil public */
function estimatedSale(view: GameState, districtId: DistrictId, productId: ProductId): number {
  if (districtId === view.districtId) return quote(view, districtId, productId) * SALE_COMMISSION
  const seen = lastSeen(view, districtId)
  // Cours vu aujourd'hui : il compte les événements du jour ; sinon, cours vu (ou normal) corrigé des événements publics du jour
  if (seen?.day === view.day && seen.quotes[productId] !== undefined) return seen.quotes[productId] * SALE_COMMISSION
  const event = Math.min(EVENT_MULT_CAP, eventFactor(view, districtId, productId))
  return (seen?.quotes[productId] ?? normalQuote(view, districtId, productId)) * event * SALE_COMMISSION
}

/**
 * Facteur de vente d'une caisse au-delà du cours net : fraîcheur, savoir-faire (Mama Rosa), tags de vente de nuit
 * (after du couvre-feu comprise), casse. Calculé par le moteur à l'arrivée dans `to` : un trajet de jour arrive
 * le jour même, un trajet de nuit la nuit même.
 */
function saleFactor(view: GameState, lot: CargoLot, to: DistrictId = view.districtId): number {
  const sold = { ...lot, travelled: true }
  const net = quote(view, view.districtId, lot.productId) * SALE_COMMISSION
  const here = net > 0 ? unitSaleBreakdown(view, sold, false).total / net : 1
  // Ailleurs, seul le savoir-faire change (after du couvre-feu) : le marché du district d'arrivée reste inconnu
  const knowHowHere = knowHowBreakdown(view, sold).total
  return to === view.districtId || knowHowHere === 0 ? here : (here * knowHowBreakdown(view, sold, to).total) / knowHowHere
}

/**
 * Noctambule, de jour : une caisse festive peut attendre l'after de ce soir (chap. 1), si la tournée de nuit est permise.
 * Revente estimée au cours normal de l'after, au coefficient Festif de la fête, un peu escomptée (risque de la nuit).
 */
function tonightAtAfter(view: GameState, plan: Plan, productId: ProductId): number {
  if (!plan.nightOwl || view.phase !== 'day' || !PRODUCTS[productId].tags.includes(AFTER.tag) || tourTonight(view)) return 0
  const night: GameState = { ...view, phase: 'night' }
  return normalQuote(view, view.after, productId) * SALE_COMMISSION * saleFactor(night, freshLot(view, productId), view.after) * AFTER_DISCOUNT
}

/** Caisse achetée ici aujourd'hui, pour estimer sa revente */
const freshLot = (view: GameState, productId: ProductId): CargoLot => ({
  productId,
  qty: 1,
  unitCost: 0,
  travelled: true,
  boughtDay: view.day,
  damaged: false,
})

/** Meilleur prix net espéré ailleurs, pour une caisse dans l'état de `lot` */
function bestElsewhere(view: GameState, productId: ProductId, lot: CargoLot = freshLot(view, productId)): number {
  return Math.max(
    0,
    ...DISTRICT_IDS.filter((id) => id !== view.districtId).map((id) => estimatedSale(view, id, productId) * saleFactor(view, lot, id)),
  )
}

/** Valeur d'achat des caisses illégales : ce qu'une saisie ferait perdre */
function illegalValue(cargo: GameState['cargo']): number {
  return cargo.reduce((total, lot) => (isIllegal(lot) ? total + lot.qty * lot.unitCost : total), 0)
}

const tradable = (view: GameState) => view.cargo.filter((lot) => !PRODUCTS[lot.productId].sealed)

/** Fonds à garder : carburant d'un trajet et réserve du tempérament ; à sec, le carburant seulement (rester garé ne rapporte rien) */
function reserveOf(view: GameState, temperament: Temperament): number {
  const fuel = fuelPrice(view) * 2
  return isBroke(view) ? fuel : fuel + temperament.reserve
}

/** Fonds de roulement gardés en remboursant ; tout part s'il solde la dette initiale juste avant l'échéance du retard (taux majoré ensuite) */
function workingCapital(view: GameState, reserve: number): number {
  const fuel = fuelPrice(view) * 2
  const clearsBeforeLate = !view.initialDebtPaid && view.day >= DEBT_LATE.day - 2 && view.cash - fuel >= view.debt
  return clearsBeforeLate ? fuel : reserve + CAPITAL
}

/** Ce que rapporte un passage chez Viktor : intérêts évités sur ce qu'on peut rembourser, et l'échéance du retard évitée */
function debtVisit(view: GameState, reserve: number): number {
  const repayable = Math.min(view.debt, view.cash - workingCapital(view, reserve))
  if (repayable <= 0) return 0
  const daysLeft = GAME_LENGTH_DAYS - view.day
  const clearsInitial = !view.initialDebtPaid && repayable >= view.debt && view.day < DEBT_LATE.day
  const lateDays = GAME_LENGTH_DAYS - DEBT_LATE.day
  return repayable * DEBT_DAILY_RATE * daysLeft + (clearsInitial ? view.debt * (DEBT_LATE.dailyRate - DEBT_DAILY_RATE) * lateDays : 0)
}

/** Perte espérée si un barrage tourne mal, pour une soute dont l'illégal vaut `illegal` */
function exposure(cargo: GameState['cargo']): number {
  const illegal = illegalValue(cargo)
  return illegal === 0 ? 0 : illegal + SEARCH.low.fineRate * baseValue(cargo.filter(isIllegal)) + VALUE.custodyDay
}

// ─── Ventes ───

function sell(view: GameState, plan: Plan, endgame: boolean, hunt: boolean): Action | null {
  for (const productId of PRODUCT_IDS) {
    const owned = ownedQty(tradable(view), productId)
    if (owned === 0) continue
    if (hunt && productId === ENDINGS.saboteur.requiredProduct) continue
    if (view.vip?.productId === productId && !endgame && ownedQty(view.cargo, productId) <= VELVET.vip.crates) continue
    if (view.contract?.productId === productId && ownedQty(view.cargo, productId) <= view.contract.qty) continue
    const first = saleQuote(view, productId, 1)
    const lot = view.cargo.find((entry) => entry.productId === productId)
    const rotting = lot ? (daysBeforeRot(view, lot) ?? Infinity) <= 1 : false
    // Jamais revendre sur place ce qu'on vient d'acheter (clause anti-arbitrage) : c'est une boucle sans gain
    if (lot && !lot.travelled && !endgame && !rotting) continue
    // Ruiné : tout revendre, même à perte, pour repartir
    const worth =
      endgame ||
      rotting ||
      isBroke(view) ||
      first.total >= first.cost * (1 + MIN_MARGIN) ||
      (lot !== undefined && first.total >= bestElsewhere(view, productId, lot) * 0.9)
    if (!worth) continue
    // Noctambule : la caisse festive attend l'after de ce soir si elle s'y vendra mieux
    if (!endgame && !rotting && first.total < tonightAtAfter(view, plan, productId)) continue
    // Sans saturer le marché, sauf en fin de partie ou si la caisse pourrit
    const demand = view.markets[view.districtId].demand[productId] ?? owned
    const qty = endgame || rotting ? owned : Math.min(owned, demand)
    if (qty > 0) return { type: 'sell', productId, qty }
  }
  return null
}

// ─── Services du district ───

function services(view: GameState, plan: Plan, temperament: Temperament, objective: Objective, endgame: boolean): Action | null {
  const reserve = reserveOf(view, temperament)
  const places = plan.places ?? DEFAULT_PLACES
  const uses = (place: PlaceUse) => places.includes(place)

  // Contrat de la Pègre : l'accepter si la boutique d'ici a toutes ses caisses, qu'elles ne pourrissent pas en route,
  // que le trajet reste dans le risque accepté et qu'on peut les payer en gardant sa réserve
  const offer = view.contractOffer
  if (
    offer &&
    !view.contract &&
    view.initialDebtPaid &&
    !checkService(view, 'debt') &&
    (view.markets[view.districtId].stock[offer.productId] ?? 0) >= offer.qty &&
    !PRODUCTS[offer.productId].tags.includes('TAG-PERISHABLE') &&
    contractRisk(view, offer) <= Math.min(temperament.maxRisk, CONTRACT_MAX_RISK) &&
    view.cash - reserve >= offer.qty * PRODUCTS[offer.productId].basePrice * CONTRACT_MARGIN
  ) {
    return { type: 'acceptContract' }
  }

  // Dette : à intérêts quotidiens, la rembourser passe avant tout, en gardant de quoi travailler
  if (!checkService(view, 'debt') && view.debt > 0) {
    const working = endgame ? fuelPrice(view) * 2 : workingCapital(view, reserve)
    const amount = Math.min(view.debt, view.cash - working)
    if (amount > 0) return { type: 'repay', amount }
    // Avance de survie : seulement pour ne pas rester bloqué
    if (uses('advance') && isBroke(view) && loanRoom(view) > 0 && !endgame) {
      return { type: 'borrow', amount: Math.min(loanRoom(view), SURVIVAL_ADVANCE) }
    }
  }

  if (!plan.novice && !endgame && view.day <= LAST_EQUIPMENT_DAY) {
    const equipment = equip(view, plan, reserve)
    if (equipment) return equipment
    const place = specialPlaces(view, uses, reserve, plan.iccFloor ?? PLACE_THRESHOLDS.iccBelow)
    if (place) return place
  } else if (objective === 'elite') {
    // Élite : défendre l'ICC et servir le parrain jusqu'à l'audit
    const place = specialPlaces(view, uses, reserve, plan.iccFloor ?? PLACE_THRESHOLDS.iccBelow)
    if (place) return place
  }

  // Fin de partie avec une dette (collecte de Viktor sur un Cash-Puce vide…) : retirer de la Laverie de quoi la solder
  if (!checkService(view, 'offshore') && endgame && view.debt > 0) {
    // Commission au retrait : débiter un peu plus que ce qui manque
    const missing = view.debt + fuelPrice(view) * 2 - view.cash
    const amount = Math.min(offshoreBalance(view.offshore), Math.ceil(missing / OFFSHORE_WITHDRAW_FACTOR))
    if (missing > 0 && amount > 0) return { type: 'withdraw', amount }
  }

  // Laverie : mettre à l'abri ce qui dépasse le fonds de roulement, dette soldée ; tout en fin de partie
  if (!checkService(view, 'offshore') && view.debt === 0 && objective !== 'survive') {
    // Seuil de la fin visée atteint : tout à l'abri, sauf le carburant ; la chasse au serveur garde son prix,
    // l'Élite de quoi payer un certificat
    const kept = huntReserve(view, objective) + (objective === 'elite' ? morgueCost(view, 'certificate') + CAPITAL : 0)
    const working = (secured(view, objective) ? fuelPrice(view) * 2 : reserve + CAPITAL * 2) + kept
    const amount = endgame ? view.cash - kept : view.day >= (plan.offshoreFromDay ?? 15) || secured(view, objective) ? view.cash - working : 0
    if (amount > 0) {
      // Placement du Cartel : compléter sa part de l'argent à l'abri, le reste va à l'offshore
      const sheltered = scoreOf(view) + amount
      const toVenture = Math.min(amount, Math.round(sheltered * temperament.venture) - offshoreBalance(view.venture))
      return toVenture > 0 ? { type: 'invest', amount: toVenture } : { type: 'deposit', amount }
    }
  }
  return null
}

/** Lieux spéciaux du district, quand le plan les prévoit et que le seuil est atteint */
function specialPlaces(view: GameState, uses: (place: PlaceUse) => boolean, reserve: number, iccFloor: number): Action | null {
  const spare = (cost: number) => view.cash - cost >= reserve + CAPITAL
  if (!checkService(view, 'morgue')) {
    if (uses('surgery') && view.health < PLACE_THRESHOLDS.surgeryBelowHealth && !checkMorgue(view, 'surgery') && spare(morgueCost(view, 'surgery'))) {
      return { type: 'morgue', service: 'surgery' }
    }
    if (uses('certificate') && view.icc < iccFloor && !checkMorgue(view, 'certificate') && spare(morgueCost(view, 'certificate'))) {
      return { type: 'morgue', service: 'certificate' }
    }
    // Laissez-passer : seulement avec du chimique illégal à faire passer par les bio-scanners
    const chemical = view.cargo.some((lot) => isIllegal(lot) && PRODUCTS[lot.productId].tags.includes('TAG-CHEMICAL'))
    if (uses('pass') && chemical && !checkMorgue(view, 'pass') && spare(morgueCost(view, 'pass'))) return { type: 'morgue', service: 'pass' }
  }
  if (uses('influence') && !checkService(view, 'influence')) {
    // Panique sur le tag le plus présent en soute : il se vendra plus cher demain
    const tag = [...KARMA.tags].sort((a, b) => taggedQty(view.cargo, b) - taggedQty(view.cargo, a))[0]
    if (tag && taggedQty(view.cargo, tag) > 0 && !checkInfluence(view, tag) && spare(karmaCost(view))) return { type: 'influence', tag }
  }
  if (!checkService(view, 'velvet') && uses('vip')) {
    if (view.vip && !checkVipDelivery(view)) return { type: 'vipDeliver' }
    if (!view.vip && !checkVipRequest(view)) return { type: 'vipRequest' }
  }
  if (!checkService(view, 'velvet')) {
    const lot = PRODUCT_IDS.find((id) => uses('auction') && !checkAuction(view, id))
    if (lot) return { type: 'auction', productId: lot }
    if (uses('blackmail') && view.icc < iccFloor && !checkBlackmail(view, false) && spare(blackmailCost(view))) {
      return { type: 'blackmail', inKind: false }
    }
  }
  return null
}

function equip(view: GameState, plan: Plan, reserve: number): Action | null {
  const spare = view.cash - reserve - CAPITAL
  if (!checkService(view, 'garage')) {
    if (plan.vehicle && view.vehicleId !== plan.vehicle && VEHICLES[plan.vehicle].price <= spare && !checkBuyVehicle(view, plan.vehicle)) {
      return { type: 'buyVehicle', vehicleId: plan.vehicle }
    }
    const next = plan.modules.find((id) => !view.modules.owned.includes(id))
    if (next && MODULES[next].price <= spare && !checkBuyModule(view, next)) return { type: 'buyModule', moduleId: next }
    const unmounted = plan.modules.find((id) => view.modules.owned.includes(id) && !view.modules.mounted.includes(id))
    if (unmounted && view.modules.mounted.length < VEHICLES[view.vehicleId].moduleSlots)
      return { type: 'mountModule', moduleId: unmounted, mount: true }
    // Châssis sous la moitié : réparer ce que l'on peut
    if (missingChassis(view) > VEHICLES[view.vehicleId].maxChassis / 2) {
      const pv = Math.min(missingChassis(view), Math.floor(spare / repairPrice(view).total))
      if (pv > 0) return { type: 'repair', pv }
    }
  }
  if (!checkService(view, 'crew') && plan.crew && view.crew.active !== plan.crew) {
    const cost = hireFee(view) + salary(plan.crew) * 4
    if (cost <= spare && !checkHire(view, plan.crew)) return { type: 'hireCrew', crewId: plan.crew }
  }
  return null
}

/** Le plan attend un équipement qu'il pourrait se payer : passer par le garage */
function pendingEquipment(view: GameState, plan: Plan): boolean {
  if (plan.novice || view.debt > 0) return false
  const price =
    plan.vehicle && view.vehicleId !== plan.vehicle
      ? VEHICLES[plan.vehicle].price
      : plan.modules.filter((id) => !view.modules.owned.includes(id)).map((id) => MODULES[id].price)[0]
  return price !== undefined && view.cash > price * 1.3
}

// ─── Planification d'un trajet ───

/** Trajet choisi ; `accept` : accepter d'abord la livraison officielle du jour vers cette destination */
type Route = { to: DistrictId; buys: CrateCount[]; value: number; accept?: boolean }

/** Achats d'ici pour une destination : meilleures marges d'abord, dans le budget et la place */
function buysFor(
  view: GameState,
  to: DistrictId,
  plan: Plan,
  temperament: Temperament,
  budget: number,
  free: number,
): { buys: CrateCount[]; margin: number } {
  const offers = shopProducts(view.markets[view.districtId]).flatMap((productId) => {
    const product = PRODUCTS[productId]
    if (product.sealed || product.tier > temperament.maxTier) return []
    if (plan.avoidTags?.some((tag) => product.tags.includes(tag))) return []
    if (plan.novice && productStatus(view, view.districtId, productId) !== 'production') return []
    const price = quote(view, view.districtId, productId)
    const today = estimatedSale(view, to, productId) * saleFactor(view, freshLot(view, productId), to)
    // Commande VIP en cours : les caisses demandées valent le multiple du Velvet-Silo
    const vip = view.vip?.productId === productId ? normalQuote(view, velvetDistrict(), productId) * VELVET.vip.factor : 0
    const margin = Math.max(today, vip, tonightAtAfter(view, plan, productId)) - price
    if (margin < price * MIN_MARGIN) return []
    const favored = plan.favorTags?.some((tag) => product.tags.includes(tag)) ? 1.3 : 1
    // Le haut tier coûte une garde à vue s'il est saisi : marge exigée plus forte
    const caution = product.tier >= HIGH_TIER ? 0.8 : 1
    // Pas plus que la demande d'un district (le reste se vendrait saturé)
    const cap =
      vip > 0
        ? Math.min(maxBuy(view, productId), VELVET.vip.crates - ownedQty(view.cargo, productId))
        : Math.min(maxBuy(view, productId), demandQuota(view, to, productId) ?? Infinity)
    return [{ productId, price, margin, cap, rank: (margin / Math.max(1, price)) * favored * caution }]
  })
  offers.sort((a, b) => b.rank - a.rank)
  const buys: CrateCount[] = []
  let left = budget
  let room = free
  let margin = 0
  for (const offer of offers) {
    const qty = Math.min(offer.cap, room, Math.floor(left / Math.max(1, offer.price)))
    if (qty <= 0) continue
    buys.push({ productId: offer.productId, qty })
    left -= qty * offer.price
    room -= qty
    margin += qty * offer.margin
  }
  return { buys, margin }
}

/** Meilleure destination et achats correspondants, ou null s'il vaut mieux rester */
function bestRoute(view: GameState, plan: Plan, temperament: Temperament): Route | null {
  const revealed = Boolean(crewEffect(view, 'revealsPatrol'))
  const capacity = VEHICLES[view.vehicleId].cargo
  const legalNeed = plan.legalShare ? Math.max(0, Math.ceil(capacity * plan.legalShare) - ownedQty(view.cargo, 'T0-01')) : 0
  const free = capacity - cargoUsed(view.cargo) - legalNeed
  const goods = tradable(view)
  const night = view.phase === 'night'
  const offer = !night && !checkDelivery(view) ? deliveryOffer(view) : null

  let best: Route | null = null
  for (const to of DISTRICT_IDS) {
    if (to === view.districtId) continue
    // La nuit, sur mission, la destination est imposée ; hors mission, seulement si le tempérament l'accepte
    if (night && view.mission && to !== view.mission.to) continue
    // De jour, une livraison acceptée impose la destination
    if (!night && view.delivery && to !== view.delivery.to) continue
    if (night && !view.mission && nightMode(view, plan, temperament) !== 'margin' && nightMode(view, plan, temperament) !== 'always') continue
    const trip = planTravel(view, to)
    const fuelNeeded = Math.max(0, trip.fuelCost - view.fuel)
    const fuelCost = trip.fuelCost * fuelPrice(view)
    const budget = view.cash - reserveOf(view, temperament) - fuelNeeded * fuelPrice(view)
    // Livraison officielle proposée vers cette destination : avec (prime, caisses légales, moins de place) ou sans
    for (const contract of to === offer ? [true, false] : [false]) {
      const room = contract ? free - deliveryCrates(view) : free
      for (const shopping of [true, false]) {
        const { buys, margin } = shopping && budget > 0 && room > 0 ? buysFor(view, to, plan, temperament, budget, room) : { buys: [], margin: 0 }
        const legalBuys =
          shopping && legalNeed > 0 && budget > 0 ? [{ productId: 'T0-01' as const, qty: Math.min(legalNeed, maxBuy(view, 'T0-01')) }] : []

        // Risque et exposition avec la soute prévue (après les achats d'ici)
        const planned = [
          ...view.cargo,
          ...(contract
            ? [{ productId: SEALED_PRODUCT, qty: deliveryCrates(view), unitCost: 0, travelled: true, boughtDay: view.day, damaged: false }]
            : []),
          ...[...legalBuys, ...buys].map((buy) => ({
            ...buy,
            unitCost: quote(view, view.districtId, buy.productId),
            travelled: false,
            boughtDay: view.day,
            damaged: false,
          })),
        ]
        const tripRisk = risk({ ...view, cargo: planned }, to, { includePatrol: revealed })
        const illegal = illegalValue(planned)
        // Livraison VIP de jour (avant 20h00) : la commande prise, le Silo vaut le risque au-delà du tempérament
        const vipDelivery = !night && to === velvetDistrict() && view.vip !== null && ownedQty(planned, view.vip.productId) >= VELVET.vip.crates
        const tooRisky = illegal > 0 && tripRisk > temperament.maxRisk && !vipDelivery
        // Achats trop risqués pour le tempérament : le même trajet, sans rien acheter
        if (tooRisky && buys.length > 0) continue

        const carried = goods.reduce(
          (total, lot) => total + lot.qty * Math.max(0, estimatedSale(view, to, lot.productId) * saleFactor(view, lot, to) - lot.unitCost),
          0,
        )
        let value = carried + margin - tripRisk * exposure(planned) - fuelCost
        // Marchandise déjà en soute et trajet trop risqué : seulement en dernier recours
        if (tooRisky) value -= 1_000_000
        // Hors mission, l'écart coûte une Fiche S… sauf pour qui la cherche (équipier à débloquer)
        if (night && !view.mission) value += seeksFlag(view, plan) ? VALUE.wantedLevel : -VALUE.wantedLevel
        // Raisons d'aller quelque part : dette à solder, équipement à acheter
        if (to === 'D1') value += debtVisit(view, reserveOf(view, temperament))
        // Fantôme sans serveur : passer à son district producteur, où il apparaît parfois
        if (plan.huntsServer && to === SERVER_PRODUCER && !night) value += PRODUCTS[SERVER].basePrice * 0.1
        // Élite sans parrain : passer au Velvet-Silo demander une commande
        if (plan.seeksSponsor && to === velvetDistrict() && !night) value += VALUE.sponsorVisit
        if (plan.vipErrand && view.vip && DISTRICTS[to].production.includes(view.vip.productId)) value += VALUE.sponsorVisit
        if (to === 'D4' && pendingEquipment(view, plan)) value += 2_000
        if (vipDelivery) value += (vipValue({ ...view, cargo: planned }) ?? 0) + (plan.sponsorOrder ? VALUE.sponsorOrder : 0)
        // Contrat de la Pègre : la prime à destination, caisses à bord ; sinon un détour par un district qui les produit
        if (view.contract) {
          const { productId, qty, to: target, reward } = view.contract
          // La veille de l'échéance, la pénalité évitée s'ajoute à la prime
          const urgent = view.contract.deadline - view.day <= 1 ? reward * CONTRACT.failDebtShare : 0
          if (to === target && ownedQty(planned, productId) >= qty) value += reward + urgent
          else if (ownedQty(planned, productId) < qty && DISTRICTS[to].production.includes(productId)) value += reward * 0.3
        }
        // Livraison : la prime, plus la confiance du DSC qu'attend l'équipement de la voie officielle
        if (contract) value += deliveryFee(view) + (trustWanted(view, plan) ? VALUE.trustDelivery : 0)
        if (!best || value > best.value) best = { to, buys: [...legalBuys.filter((buy) => buy.qty > 0), ...buys], value, accept: contract }
        break
      }
    }
  }
  // Soute vide et rien à gagner nulle part : rester (le carburant et le risque coûtent).
  // Avec de la marchandise, on part vers la meilleure destination : elle ne se vend pas en restant.
  if (!best || (best.value <= 0 && goods.length === 0 && best.buys.length === 0 && !(night && view.mission)))
    return night && !seeksFlag(view, plan) ? null : explore(view)
  return best
}

/** Rien de rentable sous le risque accepté : aller relever les cours du district vu le moins récemment, soute vide, plutôt que rester garé */
function explore(view: GameState): Route | null {
  const age = (id: DistrictId) => view.day - (lastSeen(view, id)?.day ?? 0)
  const affordable = DISTRICT_IDS.filter((id) => {
    if (id === view.districtId) return false
    const trip = planTravel(view, id)
    return Math.max(0, trip.fuelCost - view.fuel) * fuelPrice(view) <= view.cash
  })
  const [to] = affordable.sort((a, b) => age(b) - age(a))
  return to && age(to) > 1 ? { to, buys: [], value: 0 } : null
}

/** Assez de carburant, ou de quoi l'acheter ici, pour ce trajet */
function reachable(view: GameState, to: DistrictId): boolean {
  const trip = planTravel(view, to)
  return Math.max(0, trip.fuelCost - view.fuel) * fuelPrice(view) <= view.cash
}

/** Fin de partie : solder la dette à Hives (en retirant d'abord de la Laverie ce qui manque), puis tout déposer à la Laverie */
function endgameRoute(view: GameState): Route | null {
  const short = view.debt > view.cash && offshoreBalance(view.offshore) > 0
  if (view.debt > 0 && short) return view.districtId === 'D5' ? null : { to: 'D5', buys: [], value: 0 }
  if (view.debt > 0) return view.districtId === 'D1' ? null : { to: 'D1', buys: [], value: 0 }
  return view.districtId === 'D5' ? null : { to: 'D5', buys: [], value: 0 }
}

function refuelFor(view: GameState, needed: number): Action | null {
  // Pompe officielle fermée la nuit sous le seuil d'ICC : pas de plein possible
  if (pumpClosed(view)) return null
  const qty = Math.min(needed - view.fuel, VEHICLES[view.vehicleId].tank - view.fuel)
  return qty > 0 && view.cash >= fuelPrice(view) * qty ? { type: 'refuel', qty } : null
}

/** Tournées de nuit : le tempérament, relevé par un plan noctambule */
function nightMode(view: GameState, plan: Plan, temperament: Temperament): Temperament['night'] {
  // L'équipier du plan attend une première Fiche S : une tournée clandestine la lui donne ; une commande VIP n'attend pas
  if (seeksFlag(view, plan) || plan.vipErrand) return 'always'
  if (!plan.nightOwl || temperament.night === 'always') return temperament.night
  return 'margin'
}

/** L'équipement du plan (voie officielle) attend encore des commandes du DSC livrées */
function trustWanted(view: GameState, plan: Plan): boolean {
  const gear = [...(plan.vehicle ? [VEHICLES[plan.vehicle].requires ?? []] : []), ...plan.modules.map((id) => MODULES[id].requires ?? [])]
  return gear.flat().some((r) => r.kind === 'deliveries' && view.progress.deliveries < r.count)
}

/** L'équipier du plan ne se présente qu'à la première Fiche S, que le joueur n'a pas encore */
function seeksFlag(view: GameState, plan: Plan): boolean {
  if (view.progress.flagged) return false
  const crewWaits = plan.crew !== undefined && !view.crew.lost.includes(plan.crew) && CREW[plan.crew].requires.some((r) => r.kind === 'wanted')
  // Modules de la voie pègre (plaque rotative, brouilleur) : réservés aux fichés
  const gearWaits = plan.modules.some((id) => MODULES[id].requires?.some((r) => r.kind === 'wanted'))
  return crewWaits || gearWaits
}

function eveningTour(view: GameState, plan: Plan, temperament: Temperament): Action | null {
  const mode = nightMode(view, plan, temperament)
  if (mode === 'never' || tourTonight(view) || view.day >= ENDGAME_DAY) return null
  const mission = missionOffer(view)
  const tour: Action | null =
    mission && !checkMission(view)
      ? { type: 'forceCurfew', mission: true }
      : mode === 'always' || (mode === 'margin' && tradable(view).length > 0)
        ? { type: 'forceCurfew' }
        : null
  // Tournée voulue, trajet du jour pas encore fait : rouler d'abord, sans finir dans le district de la mission
  if (tour && !view.dayTripDone) return safestTrip(view, mission ?? undefined)
  return tour
}

// ─── Barrage ───

function barrage(view: GameState, plan: Plan, temperament: Temperament): Action {
  if (view.interception?.kind === 'racket') {
    if (view.cash >= toll(view)) return { type: 'intercept', move: 'payToll' }
    if (!checkMove(view, 'payTollInKind')) return { type: 'intercept', move: 'payTollInKind' }
    return { type: 'intercept', move: 'refuseToll' }
  }
  // Serveur en soute : la fouille tue, on joue l'option la plus sûre
  if (isLethalSearch(view)) return survivalMove(view)
  const illegal = illegalValue(view.cargo)
  if (plan.novice || illegal === 0) return { type: 'intercept', move: 'search' }

  const sanction = searchSanction(view)
  const custody = (days: number) => days * VALUE.custodyDay
  // Qui défend son ICC (Élite, Citoyen modèle) pèse ses pertes d'ICC plus lourd
  const iccPoint = VALUE.iccPoint * (plan.iccFloor ? 4 : 1)
  // Double fond : ses caisses échappent à la fouille quand les agents ne le trouvent pas, et à l'éjection
  const hidden = illegalValue(hiddenCargo(view).hidden)
  const seized = illegal - hidden * (1 - compartmentDetection(view).total)
  // Amende : une part de la valeur saisie (prix de base) ; on l'estime sur la part que la fouille prendrait
  const seizedShare = illegal > 0 ? seized / illegal : 0
  const fineOf = (rate: number) => fineAmount(view, rate) * seizedShare
  const searchLoss = seized + (sanction ? fineOf(sanction.fineRate) + sanction.iccLoss * iccPoint + custody(sanction.custodyDays) : 0)
  const options: { action: Action; loss: number }[] = []
  if (!checkMove(view, 'search')) options.push({ action: { type: 'intercept', move: 'search' }, loss: searchLoss })

  const consider = (move: InterceptionMove, chance: number, successLoss: number, failLoss: number, bold: boolean) => {
    if (checkMove(view, move)) return
    const loss = (chance * successLoss + (1 - chance) * failLoss) * (bold ? temperament.boldness : 1)
    options.push({ action: { type: 'intercept', move }, loss })
  }
  consider('bluff', bluffChance(view).total, -3 * iccPoint, searchLoss * 1.2, true)
  // Une fuite ratée coûte de la Santé : pas quand elle est déjà basse. Conséquences réelles (pare-buffles, transpondeur, plaque)
  const flight = fleeConsequences(view)
  if (view.health > flight.failHealth + 10) {
    const success = ((flight.chassis.min + flight.chassis.max) / 2) * VALUE.chassisPoint + VALUE.wantedLevel + flight.iccLoss * iccPoint
    const failure =
      seized +
      fineOf(FLEE.fail.fineRate) +
      custody(1) +
      flight.failHealth * VALUE.healthPoint +
      flight.failChassis * VALUE.chassisPoint +
      25 * iccPoint
    const runnerBias = plan.runner ? 0.8 : 1
    const chance = fleeChance(view).total
    if (!checkMove(view, 'flee')) {
      options.push({
        action: { type: 'intercept', move: 'flee' },
        loss: (chance * success + (1 - chance) * failure) * temperament.boldness * runnerBias,
      })
    }
  }
  // Éjection : la trappe rapporte en moyenne une partie des caisses larguées le lendemain
  const trapdoor = ejectMode(view) === 'trapdoor' ? (mountedEffect(view, 'trapdoor')?.maxRecovery ?? 0) / 2 : 0
  consider('eject', ejectChance(view).total, (illegal - hidden) * (1 - trapdoor), searchLoss * 1.3, false)

  // Corruption : une caisse appréciée des agents (connivence) remplace une part du cash
  const favorite = DISTRICTS[view.districtId].bribeFavorites.find((id) => ownedQty(view.cargo, id) > 0)
  const crates = favorite ? [{ productId: favorite, qty: 1 }] : []
  const cash = Math.max(0, Math.max(minimumOffer(view), bribeRate(view).total) - paymentValue(view, crates))
  if (cash <= view.cash) {
    const offer = { cash, crates }
    if (!checkMove(view, 'bribe', offer)) {
      const chance = bribeChance(view, offer).total
      const loss = cash + (1 - chance) * (illegal + 0.5 * (view.cash - cash) + custody(1) + 15 * iccPoint)
      options.push({ action: { type: 'intercept', move: 'bribe', offer }, loss })
    }
  }
  if (options.length === 0) return { type: 'intercept', move: 'search' }
  return options.reduce((best, option) => (option.loss < best.loss ? option : best)).action
}

/** Fouille mortelle (serveur en soute) : l'option qui a le plus de chances d'éviter la fouille, corruption au plus offrant */
function survivalMove(view: GameState): Action {
  const options: { action: Action; chance: number }[] = []
  if (!checkMove(view, 'bluff')) options.push({ action: { type: 'intercept', move: 'bluff' }, chance: bluffChance(view).total })
  if (!checkMove(view, 'flee')) options.push({ action: { type: 'intercept', move: 'flee' }, chance: fleeChance(view).total })
  if (!checkMove(view, 'eject')) options.push({ action: { type: 'intercept', move: 'eject' }, chance: ejectChance(view).total })
  const offer = { cash: Math.min(view.cash, Math.max(minimumOffer(view), bribeRate(view).total * 3)), crates: [] }
  if (!checkMove(view, 'bribe', offer)) options.push({ action: { type: 'intercept', move: 'bribe', offer }, chance: bribeChance(view, offer).total })
  if (options.length === 0) return { type: 'intercept', move: 'search' }
  return options.reduce((best, option) => (option.chance > best.chance ? option : best)).action
}

// ─── Aléas routiers ───

/** Option d'aléa la moins coûteuse, en ₡ : paiement, puis effets */
function roadChoice(view: GameState): Action {
  const event = view.roadEvent
  if (!event) return { type: 'sleep' }
  const outcomeCost = (outcome: RoadOutcome = {}) =>
    -(outcome.cash ?? 0) -
    (outcome.icc ?? 0) * VALUE.iccPoint -
    (outcome.health ?? 0) * VALUE.healthPoint -
    (outcome.chassis ?? 0) * VALUE.chassisPoint -
    (outcome.fuel ?? 0) * fuelPrice(view)
  const tries: { action: Action; cost: number }[] = []
  for (const choice of ['a', 'b'] as const) {
    const option = ROAD_EVENTS[event][choice]
    const pays = option.pay ?? [{}]
    pays.forEach((cost, pay) => {
      if (checkRoadChoice(view, choice, pay)) return
      const paid = (cost.cash ?? 0) + (cost.fuel ?? 0) * fuelPrice(view) + (cost.crates?.qty ?? 0) * 50
      const effect = option.gamble
        ? option.gamble.chance * outcomeCost(option.gamble.win) + (1 - option.gamble.chance) * outcomeCost(option.gamble.lose)
        : outcomeCost(option.outcome)
      tries.push({ action: { type: 'road', choice, pay }, cost: paid + effect })
    })
  }
  const fallback: Action = { type: 'road', choice: ROAD_EVENTS[event].a.pay ? 'b' : 'a' }
  return (
    tries.reduce<{ action: Action; cost: number } | null>((best, entry) => (!best || entry.cost < best.cost ? entry : best), null)?.action ?? fallback
  )
}
