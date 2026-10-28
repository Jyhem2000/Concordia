import {
  DEBT_DAILY_RATE,
  DEBT_LATE,
  FLEE,
  GAME_LENGTH_DAYS,
  GRINDER,
  HIGH_TIER,
  SALE_COMMISSION,
  SEARCH,
  SURVIVAL_ADVANCE,
} from '../../src/data/balance.ts'
import { DISTRICT_IDS, DISTRICTS } from '../../src/data/districts.ts'
import { KARMA } from '../../src/data/locations.ts'
import { ROAD_EVENTS } from '../../src/data/events.ts'
import { PRODUCT_IDS, PRODUCTS, SEALED_PRODUCT } from '../../src/data/products.ts'
import { MODULES, VEHICLES } from '../../src/data/vehicles.ts'
import { canSiphon, checkForceCurfew, checkService, fuelPrice, maxBuy, planTravel, pumpClosed, type Action } from '../../src/engine/actions.ts'
import { baseValue, cargoUsed, isIllegal, ownedQty, taggedQty } from '../../src/engine/cargo.ts'
import { daysBeforeRot, paymentValue } from '../../src/engine/condition.ts'
import { checkHire, crewEffect, hireFee, salary } from '../../src/engine/crew.ts'
import { checkBuyModule, checkBuyVehicle, ejectMode, missingChassis, mountedEffect, repairPrice } from '../../src/engine/equipment.ts'
import { loanRoom } from '../../src/engine/finance.ts'
import { indexed } from '../../src/engine/inflation.ts'
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
  minimumOffer,
  searchSanction,
  toll,
} from '../../src/engine/interception.ts'
import {
  demandQuota,
  grindableQty,
  lastSeen,
  normalQuote,
  productStatus,
  quote,
  saleQuote,
  shopProducts,
  unitSaleBreakdown,
} from '../../src/engine/market.ts'
import { checkDelivery, deliveryCrates, deliveryFee, deliveryOffer } from '../../src/engine/delivery.ts'
import { checkMission, missionOffer } from '../../src/engine/night.ts'
import { checkRoadChoice, roadCash } from '../../src/engine/road.ts'
import { blackmailCost, checkAuction, checkBlackmail, checkInfluence, checkMorgue, karmaCost, morgueCost } from '../../src/engine/services.ts'
import { risk } from '../../src/engine/risk.ts'
import type {
  CargoLot,
  CrateCount,
  CrewId,
  DistrictId,
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
 * Le marchand (chap. 9) : un bot unique paramétré par un plan, un tempérament et un objectif.
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
  /** Lieux spéciaux utilisés quand le bot s'y trouve ; par défaut le Hachoir et l'avance de survie */
  places?: readonly PlaceUse[]
  /** Tournées de nuit au moins quand la soute le justifie, quel que soit le tempérament (suspensions, profil festif) */
  nightOwl?: boolean
  /** Fuite préférée à espérance égale (pare-buffles, brouilleur, transpondeur) */
  runner?: boolean
}

/** Usages des lieux spéciaux que sait faire le marchand (chap. 9, tests par retrait) */
export type PlaceUse = 'grinder' | 'advance' | 'surgery' | 'certificate' | 'pass' | 'influence' | 'auction' | 'blackmail'

const DEFAULT_PLACES: readonly PlaceUse[] = ['grinder', 'advance']

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
}

export type Objective = 'score' | 'survive'

/** Valeurs de référence pour comparer des pertes de nature différente (₡ de base) */
const VALUE = { custodyDay: 1_200, iccPoint: 60, healthPoint: 40, wantedLevel: 400, chassisPoint: 40 }

/** Marge minimale espérée pour acheter, en part du prix d'achat */
const MIN_MARGIN = 0.15

/** Fonds de roulement gardé avant de rembourser la dette (₡ de base, indexés) */
const CAPITAL = 2_000

/** Dernier jour d'achat d'équipement : au-delà, il ne serait plus rentabilisé avant l'audit */
const LAST_EQUIPMENT_DAY = 18

/** Fin de partie : on vend tout, on solde la dette et on dépose tout à la Laverie */
const ENDGAME_DAY = 28

export function traderBot(plan: Plan, temperament: Temperament, objective: Objective): Bot {
  return {
    name: `${plan.name} · ${temperament.name} · ${objective === 'score' ? 'score' : 'survie'}`,
    decide: (view) => decide(view, plan, temperament, objective),
  }
}

function decide(view: GameState, plan: Plan, temperament: Temperament, objective: Objective): Action {
  if (view.interception) return barrage(view, plan, temperament)
  if (view.roadEvent) return roadChoice(view)
  if (canSiphon(view)) return { type: 'siphon' }

  const night = view.phase === 'night'
  const open = !night && !view.dayOver
  const tripLeft = night ? !view.nightTripDone : !view.dayTripDone && !view.dayOver
  const endgame = view.day >= ENDGAME_DAY

  const sale = sell(view, endgame)
  if (sale) return sale

  if (open) {
    const service = services(view, plan, temperament, objective, endgame)
    if (service) return service
  }

  if (tripLeft) {
    // À sec, sans marchandise : rentrer à Hives prendre l'avance de survie de Viktor
    const rescue: Route | null =
      isBroke(view) && loanRoom(view) > 0 && view.districtId !== 'D1' && !night && !endgame ? { to: 'D1' as const, buys: [], value: 0 } : null
    const route = rescue ?? (endgame && objective === 'score' ? endgameRoute(view) : bestRoute(view, plan, temperament))
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
    const tour = eveningTour(view, plan, temperament)
    if (tour) return tour
  }
  return { type: 'sleep' }
}

// ─── Estimations (information publique) ───

/** Plus de quoi remplir la soute, et rien à vendre */
function isBroke(view: GameState): boolean {
  return tradable(view).length === 0 && view.cash < indexed('rule.inflation', CAPITAL, view.day).total / 2
}

/** Prix net espéré d'une caisse dans un district : cours du jour ici, cours mémorisé ailleurs, sinon profil public */
function estimatedSale(view: GameState, districtId: DistrictId, productId: ProductId): number {
  const seen = lastSeen(view, districtId)
  const quoted =
    districtId === view.districtId ? quote(view, districtId, productId) : (seen?.quotes[productId] ?? normalQuote(view, districtId, productId))
  return quoted * SALE_COMMISSION
}

/**
 * Facteur de vente d'une caisse au-delà du cours net : fraîcheur, savoir-faire (Mama Rosa), profil de nuit, casse.
 * Calculé par le moteur ici et maintenant : un trajet de jour arrive le jour même, un trajet de nuit la nuit même.
 */
function saleFactor(view: GameState, lot: CargoLot): number {
  const net = quote(view, view.districtId, lot.productId) * SALE_COMMISSION
  return net > 0 ? unitSaleBreakdown(view, { ...lot, travelled: true }, false).total / net : 1
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
  const factor = saleFactor(view, lot)
  return Math.max(0, ...DISTRICT_IDS.filter((id) => id !== view.districtId).map((id) => estimatedSale(view, id, productId) * factor))
}

/** Valeur d'achat des caisses illégales : ce qu'une saisie ferait perdre */
function illegalValue(cargo: GameState['cargo']): number {
  return cargo.reduce((total, lot) => (isIllegal(lot) ? total + lot.qty * lot.unitCost : total), 0)
}

const tradable = (view: GameState) => view.cargo.filter((lot) => !PRODUCTS[lot.productId].sealed)

/** Fonds à garder : carburant d'un trajet et réserve du tempérament ; à sec, le carburant seulement (rester garé ne rapporte rien) */
function reserveOf(view: GameState, temperament: Temperament): number {
  const fuel = fuelPrice(view) * 2
  return isBroke(view) ? fuel : fuel + indexed('rule.inflation', temperament.reserve, view.day).total
}

/** Fonds de roulement gardés en remboursant ; tout part s'il solde la dette initiale juste avant l'échéance du retard (taux majoré ensuite) */
function workingCapital(view: GameState, reserve: number): number {
  const fuel = fuelPrice(view) * 2
  const clearsBeforeLate = !view.initialDebtPaid && view.day >= DEBT_LATE.day - 2 && view.cash - fuel >= view.debt
  return clearsBeforeLate ? fuel : reserve + indexed('rule.inflation', CAPITAL, view.day).total
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

function sell(view: GameState, endgame: boolean): Action | null {
  for (const productId of PRODUCT_IDS) {
    const owned = ownedQty(tradable(view), productId)
    if (owned === 0) continue
    const first = saleQuote(view, productId, 1)
    const lot = view.cargo.find((entry) => entry.productId === productId)
    const rotting = lot ? (daysBeforeRot(view, lot) ?? Infinity) <= 1 : false
    // Jamais revendre sur place ce qu'on vient d'acheter (clause anti-arbitrage) : c'est une boucle sans gain
    if (lot && !lot.travelled && !endgame && !rotting) continue
    const worth =
      endgame ||
      rotting ||
      first.total >= first.cost * (1 + MIN_MARGIN) ||
      (lot !== undefined && first.total >= bestElsewhere(view, productId, lot) * 0.9)
    if (!worth) continue
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

  // Hachoir de Viktor : les périssables dégradés plutôt que perdus
  if (uses('grinder') && !checkService(view, 'grinder')) {
    const left = GRINDER.dailyLimit - view.grinderToday
    const degraded = PRODUCT_IDS.find((id) => grindableQty(view, id) > 0)
    if (degraded && left > 0) return { type: 'grind', productId: degraded, qty: Math.min(left, grindableQty(view, degraded)) }
  }

  // Dette : à intérêts quotidiens, la rembourser passe avant tout, en gardant de quoi travailler
  if (!checkService(view, 'debt') && view.debt > 0) {
    const working = endgame ? fuelPrice(view) * 2 : workingCapital(view, reserve)
    const amount = Math.min(view.debt, view.cash - working)
    if (amount > 0) return { type: 'repay', amount }
    // Avance de survie : seulement pour ne pas rester bloqué
    if (uses('advance') && isBroke(view) && loanRoom(view) > 0 && !endgame) {
      return { type: 'borrow', amount: Math.min(loanRoom(view), indexed('rule.inflation', SURVIVAL_ADVANCE, view.day).total) }
    }
  }

  if (!plan.novice && !endgame && view.day <= LAST_EQUIPMENT_DAY) {
    const equipment = equip(view, plan, reserve)
    if (equipment) return equipment
    const place = specialPlaces(view, uses, reserve)
    if (place) return place
  }

  // Laverie : mettre à l'abri ce qui dépasse le fonds de roulement, dette soldée ; tout en fin de partie
  if (!checkService(view, 'offshore') && view.debt === 0 && objective === 'score') {
    const working = reserve + indexed('rule.inflation', CAPITAL, view.day).total * 2
    const amount = endgame ? view.cash : view.day >= (plan.offshoreFromDay ?? 15) ? view.cash - working : 0
    if (amount > 0) return { type: 'deposit', amount }
  }
  return null
}

/** Lieux spéciaux du district, quand le plan les prévoit et que le seuil est atteint */
function specialPlaces(view: GameState, uses: (place: PlaceUse) => boolean, reserve: number): Action | null {
  const spare = (cost: number) => view.cash - cost >= reserve + indexed('rule.inflation', CAPITAL, view.day).total
  if (!checkService(view, 'morgue')) {
    if (uses('surgery') && view.health < PLACE_THRESHOLDS.surgeryBelowHealth && !checkMorgue(view, 'surgery') && spare(morgueCost(view, 'surgery'))) {
      return { type: 'morgue', service: 'surgery' }
    }
    if (uses('certificate') && view.icc < PLACE_THRESHOLDS.iccBelow && !checkMorgue(view, 'certificate') && spare(morgueCost(view, 'certificate'))) {
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
  if (!checkService(view, 'velvet')) {
    const lot = PRODUCT_IDS.find((id) => uses('auction') && !checkAuction(view, id))
    if (lot) return { type: 'auction', productId: lot }
    if (uses('blackmail') && view.icc < PLACE_THRESHOLDS.iccBelow && !checkBlackmail(view, false) && spare(blackmailCost(view))) {
      return { type: 'blackmail', inKind: false }
    }
  }
  return null
}

function equip(view: GameState, plan: Plan, reserve: number): Action | null {
  const spare = view.cash - reserve - indexed('rule.inflation', CAPITAL, view.day).total
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
    const cost = hireFee(view) + salary(view, plan.crew) * 4
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
    const margin = estimatedSale(view, to, productId) * saleFactor(view, freshLot(view, productId)) - price
    if (margin < price * MIN_MARGIN) return []
    const favored = plan.favorTags?.some((tag) => product.tags.includes(tag)) ? 1.3 : 1
    // Le haut tier coûte une garde à vue s'il est saisi : marge exigée plus forte
    const caution = product.tier >= HIGH_TIER ? 0.8 : 1
    // Pas plus que la demande d'un district (le reste se vendrait saturé)
    const cap = Math.min(maxBuy(view, productId), demandQuota(view, to, productId) ?? Infinity)
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
    if (night && !view.mission && nightMode(plan, temperament) !== 'margin' && nightMode(plan, temperament) !== 'always') continue
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
        const tooRisky = illegal > 0 && tripRisk > temperament.maxRisk
        // Achats trop risqués pour le tempérament : le même trajet, sans rien acheter
        if (tooRisky && buys.length > 0) continue

        const carried = goods.reduce(
          (total, lot) => total + lot.qty * Math.max(0, estimatedSale(view, to, lot.productId) * saleFactor(view, lot) - lot.unitCost),
          0,
        )
        let value = carried + margin - tripRisk * exposure(planned) - fuelCost
        // Marchandise déjà en soute et trajet trop risqué : seulement en dernier recours
        if (tooRisky) value -= 1_000_000
        if (night && !view.mission) value -= VALUE.wantedLevel
        // Raisons d'aller quelque part : dette à solder, équipement à acheter
        if (to === 'D1') value += debtVisit(view, reserveOf(view, temperament))
        if (to === 'D4' && pendingEquipment(view, plan)) value += 2_000
        if (contract) value += deliveryFee(view)
        if (!best || value > best.value) best = { to, buys: [...legalBuys.filter((buy) => buy.qty > 0), ...buys], value, accept: contract }
        break
      }
    }
  }
  // Soute vide et rien à gagner nulle part : rester (le carburant et le risque coûtent).
  // Avec de la marchandise, on part vers la meilleure destination : elle ne se vend pas en restant.
  if (!best || (best.value <= 0 && goods.length === 0 && best.buys.length === 0 && !(night && view.mission))) return night ? null : explore(view)
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

/** Fin de partie : solder la dette à Hives, puis tout déposer à la Laverie */
function endgameRoute(view: GameState): Route | null {
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
function nightMode(plan: Plan, temperament: Temperament): Temperament['night'] {
  if (!plan.nightOwl || temperament.night === 'always') return temperament.night
  return 'margin'
}

function eveningTour(view: GameState, plan: Plan, temperament: Temperament): Action | null {
  const mode = nightMode(plan, temperament)
  if (mode === 'never' || checkForceCurfew(view) || view.day >= ENDGAME_DAY) return null
  if (missionOffer(view) && !checkMission(view)) return { type: 'forceCurfew', mission: true }
  if (mode === 'always' || (mode === 'margin' && tradable(view).length > 0)) return { type: 'forceCurfew' }
  return null
}

// ─── Barrage ───

function barrage(view: GameState, plan: Plan, temperament: Temperament): Action {
  if (view.interception?.kind === 'racket') {
    if (view.cash >= toll(view)) return { type: 'intercept', move: 'payToll' }
    if (!checkMove(view, 'payTollInKind')) return { type: 'intercept', move: 'payTollInKind' }
    return { type: 'intercept', move: 'refuseToll' }
  }
  const illegal = illegalValue(view.cargo)
  if (plan.novice || illegal === 0) return { type: 'intercept', move: 'search' }

  const sanction = searchSanction(view)
  const custody = (days: number) => days * VALUE.custodyDay
  // Double fond : ses caisses échappent à la fouille quand les agents ne le trouvent pas, et à l'éjection
  const hidden = illegalValue(hiddenCargo(view).hidden)
  const seized = illegal - hidden * (1 - compartmentDetection(view).total)
  // Amende : une part de la valeur saisie (prix de base) ; on l'estime sur la part que la fouille prendrait
  const seizedShare = illegal > 0 ? seized / illegal : 0
  const fineOf = (rate: number) => fineAmount(view, rate) * seizedShare
  const searchLoss = seized + (sanction ? fineOf(sanction.fineRate) + sanction.iccLoss * VALUE.iccPoint + custody(sanction.custodyDays) : 0)
  const options: { action: Action; loss: number }[] = []
  if (!checkMove(view, 'search')) options.push({ action: { type: 'intercept', move: 'search' }, loss: searchLoss })

  const consider = (move: InterceptionMove, chance: number, successLoss: number, failLoss: number, bold: boolean) => {
    if (checkMove(view, move)) return
    const loss = (chance * successLoss + (1 - chance) * failLoss) * (bold ? temperament.boldness : 1)
    options.push({ action: { type: 'intercept', move }, loss })
  }
  consider('bluff', bluffChance(view).total, -3 * VALUE.iccPoint, searchLoss * 1.2, true)
  // Une fuite ratée coûte de la Santé : pas quand elle est déjà basse. Conséquences réelles (pare-buffles, transpondeur, plaque)
  const flight = fleeConsequences(view)
  if (view.health > flight.failHealth + 10) {
    const success = ((flight.chassis.min + flight.chassis.max) / 2) * VALUE.chassisPoint + VALUE.wantedLevel + flight.iccLoss * VALUE.iccPoint
    const failure =
      seized +
      fineOf(FLEE.fail.fineRate) +
      custody(1) +
      flight.failHealth * VALUE.healthPoint +
      flight.failChassis * VALUE.chassisPoint +
      25 * VALUE.iccPoint
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
      const loss = cash + (1 - chance) * (illegal + 0.5 * (view.cash - cash) + custody(1) + 15 * VALUE.iccPoint)
      options.push({ action: { type: 'intercept', move: 'bribe', offer }, loss })
    }
  }
  if (options.length === 0) return { type: 'intercept', move: 'search' }
  return options.reduce((best, option) => (option.loss < best.loss ? option : best)).action
}

// ─── Aléas routiers ───

/** Option d'aléa la moins coûteuse, en ₡ : paiement, puis effets */
function roadChoice(view: GameState): Action {
  const event = view.roadEvent
  if (!event) return { type: 'sleep' }
  const outcomeCost = (outcome: RoadOutcome = {}) =>
    -roadCash(view, outcome.cash) -
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
      const paid = roadCash(view, cost.cash) + (cost.fuel ?? 0) * fuelPrice(view) + (cost.crates?.qty ?? 0) * 50
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
