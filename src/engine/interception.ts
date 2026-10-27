import { BLUFF, BRIBE, EJECT, EMERGENCY_TOW, FLEE, HIGH_TIER, RACKET, SEARCH, WANTED } from '../data/balance.ts'
import { DISTRICTS } from '../data/districts.ts'
import { PRODUCTS } from '../data/products.ts'
import { TAGS } from '../data/tags.ts'
import { VEHICLES } from '../data/vehicles.ts'
import type { ActionError } from './actions.ts'
import { breakdown, type Breakdown } from './breakdown.ts'
import { baseValue, cargoUsed, giveCrates, isIllegal, maskedQty, ownedQty, ownsCrates, tagShare, tierShare } from './cargo.ts'
import { breakOnFlee, breakOnShock, crateValue, explodeFlammable, paymentValue } from './condition.ts'
import { changeHealth, gainRouteIcc } from './gauges.ts'
import { indexed } from './inflation.ts'
import { keysOf } from './records.ts'
import { createRng, type Rng } from './rng.ts'
import { serveCustody } from './routine.ts'
import type { CargoLot, CrateCount, GameState, Interception, InterceptionMove, InterceptionReport, Offer, ProductId, Tactics } from './types.ts'

/*
 * Barrage de la BRC (chap. 6) et racket des milices en zone hors-réseau (chap. 4).
 * Le trajet est fait : le joueur est dans le district de destination et doit résoudre le barrage
 * avant toute autre action. Chaque option renvoie un nouvel état et un compte rendu chiffré.
 */

// ─── Options disponibles ───

export const NO_OFFER: Offer = { cash: 0, crates: [] }
export const NO_TACTICS: Tactics = {}

/** Raison pour laquelle une option n'est pas jouable maintenant, ou null */
export function checkMove(state: GameState, move: InterceptionMove, offer: Offer = NO_OFFER, tactics: Tactics = NO_TACTICS): ActionError | null {
  const interception = state.interception
  if (!interception) return 'not-intercepted'
  const racket = interception.kind === 'racket'

  switch (move) {
    case 'search':
      return racket ? 'move-unavailable' : null
    case 'bluff':
      if (racket || interception.bluffFailed) return 'move-unavailable'
      return checkBluffAids(state, tactics.bluffAids ?? [])
    case 'bribe':
      if (racket) return 'move-unavailable'
      if (!Number.isInteger(offer.cash) || offer.cash < 0) return 'invalid-amount'
      if (offer.cash > state.cash) return 'not-enough-cash'
      if (!ownsCrates(state.cargo, offer.crates)) return 'not-enough-cargo'
      return offerValue(state, offer) < minimumOffer(state) ? 'offer-too-low' : null
    case 'flee':
      return checkFleeTactics(state, tactics)
    case 'eject':
      return racket || interception.acted || interception.bluffFailed || !DISTRICTS[state.districtId].ejectionAllowed ? 'move-unavailable' : null
    case 'payToll':
      if (!racket) return 'move-unavailable'
      return toll(state) > state.cash ? 'not-enough-cash' : null
    case 'payTollInKind':
      return racket ? null : 'move-unavailable'
    case 'refuseToll':
      return racket ? null : 'move-unavailable'
  }
}

/** Aides au bluff : produits qui en ont une, en quantité suffisante, chacun une fois */
function checkBluffAids(state: GameState, aids: readonly ProductId[]): ActionError | null {
  if (new Set(aids).size !== aids.length) return 'move-unavailable'
  for (const id of aids) {
    const aid = PRODUCTS[id].bluffAid
    if (!aid) return 'move-unavailable'
    if (ownedQty(state.cargo, id) < aid.crates) return 'not-enough-cargo'
  }
  return null
}

/** Largage offensif (une caisse d'un produit qui le permet) et dopage (une fois par jour) */
function checkFleeTactics(state: GameState, { drop, dope }: Tactics): ActionError | null {
  if (drop !== undefined && (dropBonus(drop) === 0 || ownedQty(state.cargo, drop) < 1)) return 'move-unavailable'
  if (dope !== undefined) {
    if (!PRODUCTS[dope].doping || ownedQty(state.cargo, dope) < (drop === dope ? 2 : 1)) return 'move-unavailable'
    if (state.lastDopingDay === state.day) return 'doping-used'
  }
  return null
}

/** Bonus de largage d'un produit : le meilleur de ses tags (chap. 3) */
export function dropBonus(productId: ProductId): number {
  return Math.max(0, ...PRODUCTS[productId].tags.map((tag) => TAGS[tag].fleeDropBonus ?? 0))
}

/** Caisses données ou sacrifiées par les aides au bluff */
const aidCrates = (aids: readonly ProductId[]): CrateCount[] =>
  aids.flatMap((productId) => {
    const aid = PRODUCTS[productId].bluffAid
    return aid ? [{ productId, qty: aid.crates }] : []
  })

// ─── Chances (détaillables, chap. 10) ───

const stars = (state: GameState) => DISTRICTS[state.districtId].security

/** Malus de suivi après un bluff raté, sur la corruption et la fuite */
const followUp = (interception: Interception | null) => (interception?.bluffFailed ? -BLUFF.followUpPenalty : 0)

/** Chance de bluff, sur la soute telle qu'elle reste une fois les aides données */
export function bluffChance(state: GameState, { bluffAids = [] }: Tactics = NO_TACTICS): Breakdown {
  const cargo = giveCrates(state.cargo, aidCrates(bluffAids))
  const masked = keysOf(TAGS).reduce((total, tag) => total + maskedQty(cargo, tag), 0)
  const chance = breakdown('rule.bluff-base', BLUFF.base)
    .add('rule.tier0-share', BLUFF.tier0ShareBonus * tierShare(cargo, 0))
    .add('rule.masked-crates', Math.min(BLUFF.maskedCap, BLUFF.perMaskedCrate * masked), { count: masked })
    .add('rule.security-stars', -BLUFF.perExtraStar * (stars(state) - 1))
  const cancelsSmell = bluffAids.some((id) => PRODUCTS[id].bluffAid?.cancelsSmell)
  for (const tag of keysOf(TAGS)) {
    const { bluffMalus, smell } = TAGS[tag]
    if (!bluffMalus) continue
    const malus = bluffMalus * tagShare(cargo, tag) * (smell ? DISTRICTS[state.districtId].odorFactor : 1)
    // Une aide qui neutralise les chiens-robots annule le malus d'odeur
    chance.add(tag, smell && cancelsSmell ? 0 : -malus)
  }
  for (const id of bluffAids) chance.add(id, PRODUCTS[id].bluffAid?.bonus ?? 0)
  return chance.clamp(0, BLUFF.cap).build()
}

/** Tarif standard : part fixe par étoile (indexée) ou part de la valeur des caisses illégales, le plus élevé */
export function bribeRate(state: GameState): Breakdown {
  const fixed = indexed('rule.bribe-rate', BRIBE.ratePerStar * stars(state), state.day)
  const cargoShare = Math.round(BRIBE.rateIllegalCargoShare * baseValue(state.cargo.filter(isIllegal)))
  const rate = breakdown('rule.bribe-rate', fixed)
  return (cargoShare > fixed.total ? rate.set('rule.bribe-cargo-share', cargoShare) : rate).build()
}

/** En dessous de ce montant, l'agent refuse l'offre */
export function minimumOffer(state: GameState): number {
  return Math.ceil(bribeRate(state).total * BRIBE.minOfferRatio)
}

/** Valeur d'une offre : Cash-Puce plus caisses à leur valeur en paiement (état compris) */
export function offerValue(state: GameState, offer: Offer): number {
  return offer.cash + paymentValue(state, offer.crates)
}

/** L'offre contient un produit apprécié des agents de ce district */
export function hasConnivance(state: GameState, offer: Offer): boolean {
  const favorites = DISTRICTS[state.districtId].bribeFavorites
  return offer.crates.some(({ productId, qty }) => qty > 0 && favorites.includes(productId))
}

export function bribeChance(state: GameState, offer: Offer): Breakdown {
  const ratio = offerValue(state, offer) / bribeRate(state).total
  const offerBonus = BRIBE.offerBonuses.reduce((bonus, step) => (ratio >= step.ratio ? step.bonus : bonus), 0)
  const chance = breakdown('rule.bribe-base', BRIBE.base)
    .add('rule.offer', offerBonus)
    .add('rule.connivance', hasConnivance(state, offer) ? BRIBE.connivance : 0)
    .add('rule.security-stars', -BRIBE.perExtraStar * (stars(state) - 1))
    .add('rule.bluff-failed', followUp(state.interception))
    .clamp(0, BRIBE.cap)
  // Les Drones-Juges sont incorruptibles : il faut d'abord tomber sur un douanier
  if (DISTRICTS[state.districtId].droneJudges) chance.mul('rule.drone-judges', 1 - BRIBE.droneCriticalFailure)
  return chance.build()
}

export function fleeChance(state: GameState, { drop, dope }: Tactics = NO_TACTICS): Breakdown {
  const racket = state.interception?.kind === 'racket'
  const cap = FLEE.capBase - FLEE.capPerExtraStar * (stars(state) - 1)
  const chance = breakdown('rule.flee-base', FLEE.base)
    // Les milices ignorent la Fiche S
    .add('rule.wanted', racket ? 0 : -WANTED.fleePenaltyPerLevel * state.wanted, { level: state.wanted })
    .add('rule.bluff-failed', followUp(state.interception))
  if (drop) chance.add(drop, dropBonus(drop))
  if (dope) chance.add(dope, PRODUCTS[dope].doping?.fleeBonus ?? 0)
  return chance.clamp(0, cap, 'rule.flee-cap').build()
}

export function ejectChance(): Breakdown {
  return breakdown('rule.eject-manual', EJECT.manualChance).build()
}

/** Péage des milices : part de la valeur de la soute au prix de base */
export function toll(state: GameState): number {
  return Math.round(RACKET.tollRate * baseValue(state.cargo))
}

/**
 * Péage en nature : les milices prennent d'abord leurs produits favoris (dans l'ordre), puis les caisses
 * les plus chères, jusqu'à couvrir le péage ; elles ne rendent pas la monnaie (chap. 4)
 */
export function tollInKind(state: GameState): CrateCount[] {
  const due = toll(state)
  const favorites = DISTRICTS[state.districtId].tollFavorites
  const rank = (lot: CargoLot) => {
    const favorite = favorites.indexOf(lot.productId)
    return favorite === -1 ? favorites.length : favorite
  }
  const order = [...state.cargo].sort((a, b) => rank(a) - rank(b) || PRODUCTS[b.productId].basePrice - PRODUCTS[a.productId].basePrice)

  const taken = new Map<CrateCount['productId'], number>()
  let covered = 0
  for (const lot of order) {
    // Une caisse vaut sa valeur en paiement : abîmée ou défraîchie, elle couvre moins
    const value = crateValue(state, lot)
    for (let crate = 0; crate < lot.qty && covered < due && value > 0; crate++) {
      taken.set(lot.productId, (taken.get(lot.productId) ?? 0) + 1)
      covered += value
    }
  }
  return [...taken].map(([productId, qty]) => ({ productId, qty }))
}

/** Soute uniquement légale (ou vide) : la fouille n'est qu'une formalité */
export function legalOnly(state: GameState): boolean {
  return !state.cargo.some(isIllegal)
}

/** Sanction de base aggravée si la soute contient du haut tier */
export function hasHighTier(state: GameState): boolean {
  return state.cargo.some((lot) => isIllegal(lot) && PRODUCTS[lot.productId].tier >= HIGH_TIER)
}

// ─── Résolution ───

/** Compte rendu en cours de construction : chaque effet appliqué y est noté */
type Ledger = Omit<InterceptionReport, 'move' | 'chance' | 'success' | 'over'>

const emptyLedger = (): Ledger => ({
  cash: 0,
  crates: 0,
  icc: 0,
  health: 0,
  chassis: 0,
  wanted: 0,
  custodyDays: 0,
  damaged: 0,
  exploded: 0,
  sacrificed: 0,
  towBill: 0,
})

/** Joue une option déjà validée par `checkMove` */
export function resolveMove(state: GameState, move: InterceptionMove, offer: Offer = NO_OFFER, tactics: Tactics = NO_TACTICS): GameState {
  const rng = createRng(state.rng)
  const ledger = emptyLedger()
  const roll = (chance: Breakdown) => rng.chance(chance.total)
  // La règle de mort se juge sur la soute avant confiscation
  const lethalCargo = isLethalSearch(state)
  const report = (s: GameState, chance: Breakdown | null, success: boolean | null, over: boolean, effectiveSearch: boolean): GameState =>
    finish({ ...s, rng: rng.state }, { move, chance, success, over, ...ledger }, effectiveSearch && lethalCargo)

  switch (move) {
    case 'search':
      return report(search(state, ledger, 0), null, null, true, true)

    case 'bluff': {
      const chance = bluffChance(state, tactics)
      // Les caisses d'aide sont données (ou sacrifiées) avant le verdict
      const aided = sacrifice(state, ledger, aidCrates(tactics.bluffAids ?? []))
      if (roll(chance)) return report(gainIcc(aided, ledger, BLUFF.successIccGain), chance, true, true, false)
      const caught = loseIcc(aided, ledger, BLUFF.failIccLoss)
      // Soute légale : la fausse déclaration ne coûte que l'ICC
      if (legalOnly(caught)) return report(caught, chance, false, true, true)
      return report({ ...caught, interception: { kind: 'brc', acted: true, bluffFailed: true } }, chance, false, false, true)
    }

    case 'bribe': {
      const chance = bribeChance(state, offer)
      // L'offre est perdue même en cas d'échec
      const paid = give(pay(state, ledger, offer.cash), ledger, offer.crates)
      if (roll(chance)) return report(paid, chance, true, true, false)
      const { fine, iccLoss, custodyDays } = BRIBE.fail
      return report(sanction(paid, ledger, fine, iccLoss, custodyDays), chance, false, true, true)
    }

    case 'flee': {
      const chance = fleeChance(state, tactics)
      const racket = state.interception?.kind === 'racket'
      const prepared = prepareFlight(state, ledger, tactics, rng, racket)
      if (roll(chance)) {
        const lost = rng.int(FLEE.success.chassisLoss.min, FLEE.success.chassisLoss.max)
        const escaped = shake(loseChassis(prepared, ledger, lost), ledger, breakOnFlee(prepared.cargo, rng))
        // Les milices ne fichent personne et ne coûtent pas d'ICC
        if (racket) return report(escaped, chance, true, true, false)
        return report(loseIcc(addWanted(escaped, ledger), ledger, FLEE.success.iccLoss), chance, true, true, false)
      }
      // Le véhicule part en tête-à-queue : les inflammables non masqués peuvent exploser
      const blown = explode(prepared, ledger, rng)
      if (racket) return report(refuseToll(blown, ledger, rng), chance, false, true, false)
      const { cashSeizure, iccLoss, chassisLoss, healthLoss, custodyDays } = FLEE.fail
      const seized = pay(confiscate(blown, ledger), ledger, Math.round(blown.cash * cashSeizure))
      const wrecked = loseHealth(loseChassis(loseIcc(seized, ledger, iccLoss), ledger, chassisLoss), ledger, healthLoss)
      noteCustody(ledger, custodyDays)
      return report(wrecked, chance, false, true, true)
    }

    case 'eject': {
      const chance = ejectChance()
      if (roll(chance)) {
        // Soute vidée avant le barrage : la fouille ne trouve rien, balise comprise
        const dumped = confiscate(state, ledger)
        return report(hitChassis(dumped, ledger, EJECT.chassisLoss, rng), chance, true, true, false)
      }
      const filmed = loseIcc(state, ledger, EJECT.fail.iccLoss)
      const sanctioned = search(filmed, ledger, EJECT.fail.fineRaise)
      noteCustody(ledger, EJECT.fail.custodyDays)
      return report(sanctioned, chance, false, true, true)
    }

    case 'payToll':
      return report(pay(state, ledger, toll(state)), null, null, true, false)

    case 'payTollInKind':
      return report(give(state, ledger, tollInKind(state)), null, null, true, false)

    case 'refuseToll':
      return report(refuseToll(state, ledger, rng), null, null, true, false)
  }
}

/** Fouille effective avec un produit fatal en soute (chap. 2) */
export function isLethalSearch(state: GameState): boolean {
  return state.cargo.some((lot) => PRODUCTS[lot.productId].lethalOnSearch)
}

/** Sanction de base d'une fouille effective, ou null si la soute est légale (simple formalité) */
export function searchSanction(state: GameState): { fine: number; iccLoss: number; custodyDays: number } | null {
  if (legalOnly(state)) return null
  const high = hasHighTier(state)
  const { fine, iccLoss, custodyDays } = high ? SEARCH.high : SEARCH.low
  // Après un bluff raté, l'amende de la fouille est relevée
  const failedFine = high ? BLUFF.failedFine.high : BLUFF.failedFine.low
  return { fine: state.interception?.bluffFailed ? failedFine : fine, iccLoss, custodyDays }
}

/** Fouille effective : formalité si la soute est légale, sinon sanction de base selon le tier */
function search(state: GameState, ledger: Ledger, fineRaise: number): GameState {
  const base = searchSanction(state)
  if (!base) return gainIcc(state, ledger, SEARCH.legalIccGain)
  return sanction(state, ledger, base.fine + fineRaise, base.iccLoss, base.custodyDays)
}

/** Confiscation des caisses illégales, amende sur le Cash-Puce, perte d'ICC, garde à vue éventuelle */
function sanction(state: GameState, ledger: Ledger, fineRate: number, iccLoss: number, custodyDays: number): GameState {
  const confiscated = confiscate(state, ledger)
  const fined = pay(confiscated, ledger, Math.round(confiscated.cash * fineRate))
  noteCustody(ledger, custodyDays)
  return loseIcc(fined, ledger, iccLoss)
}

function confiscate(state: GameState, ledger: Ledger): GameState {
  const cargo = state.cargo.filter((lot) => !isIllegal(lot))
  ledger.crates -= cargoUsed(state.cargo) - cargoUsed(cargo)
  return { ...state, cargo }
}

/** Refus du péage : pillage des caisses les plus chères, tabassage, châssis cabossé (chap. 4) */
function refuseToll(state: GameState, ledger: Ledger, rng: Rng): GameState {
  const { lootShare, healthLoss, chassisLoss } = RACKET.refuse
  const looted = loot(state.cargo, Math.ceil(cargoUsed(state.cargo) * lootShare))
  ledger.crates -= cargoUsed(state.cargo) - cargoUsed(looted)
  return loseHealth(hitChassis({ ...state, cargo: looted }, ledger, chassisLoss, rng), ledger, healthLoss)
}

/**
 * Avant la fuite : largage offensif (une caisse perdue) et dopage pilote (une caisse bue, choc de
 * châssis, perte d'ICC sauf face aux milices)
 */
function prepareFlight(state: GameState, ledger: Ledger, { drop, dope }: Tactics, rng: Rng, racket: boolean): GameState {
  let s = drop ? sacrifice(state, ledger, [{ productId: drop, qty: 1 }]) : state
  const doping = dope ? PRODUCTS[dope].doping : undefined
  if (dope && doping) {
    s = sacrifice(s, ledger, [{ productId: dope, qty: 1 }])
    s = hitChassis({ ...s, lastDopingDay: s.day }, ledger, doping.chassisLoss, rng)
    if (!racket) s = loseIcc(s, ledger, doping.iccLoss)
  }
  return s
}

/** Explosions des inflammables non masqués (échec de fuite) */
function explode(state: GameState, ledger: Ledger, rng: Rng): GameState {
  const { cargo, exploded, chassisLoss } = explodeFlammable(state.cargo, rng)
  ledger.exploded += exploded
  ledger.crates -= exploded
  return loseChassis({ ...state, cargo }, ledger, chassisLoss)
}

/** Applique une casse de fragiles au compte rendu */
function shake(state: GameState, ledger: Ledger, breakage: { cargo: CargoLot[]; damaged: number }): GameState {
  ledger.damaged += breakage.damaged
  return { ...state, cargo: breakage.cargo }
}

/** Perte de châssis hors fuite : au-delà du seuil, le choc peut casser les fragiles (chap. 3) */
function hitChassis(state: GameState, ledger: Ledger, pv: number, rng: Rng): GameState {
  return shake(loseChassis(state, ledger, pv), ledger, breakOnShock(state.cargo, rng, pv))
}

/** Retire `qty` caisses en commençant par les plus chères (prix de base) */
function loot(cargo: readonly CargoLot[], qty: number): CargoLot[] {
  const byValue = [...cargo].sort((a, b) => PRODUCTS[b.productId].basePrice - PRODUCTS[a.productId].basePrice)
  let left = qty
  const kept: CargoLot[] = []
  for (const lot of byValue) {
    const taken = Math.min(lot.qty, left)
    left -= taken
    if (taken < lot.qty) kept.push({ ...lot, qty: lot.qty - taken })
  }
  return kept
}

/** Caisses données en paiement : elles quittent la soute */
function give(state: GameState, ledger: Ledger, crates: readonly CrateCount[]): GameState {
  const cargo = giveCrates(state.cargo, crates)
  ledger.crates -= cargoUsed(state.cargo) - cargoUsed(cargo)
  return { ...state, cargo }
}

/** Caisses perdues par une tactique du joueur, comptées à part au compte rendu */
function sacrifice(state: GameState, ledger: Ledger, crates: readonly CrateCount[]): GameState {
  const before = ledger.crates
  const given = give(state, ledger, crates)
  ledger.sacrificed += before - ledger.crates
  return given
}

function pay(state: GameState, ledger: Ledger, amount: number): GameState {
  const paid = Math.min(state.cash, amount)
  ledger.cash -= paid
  return { ...state, cash: state.cash - paid }
}

function loseIcc(state: GameState, ledger: Ledger, points: number): GameState {
  const icc = Math.max(0, state.icc - points)
  ledger.icc += icc - state.icc
  return { ...state, icc }
}

function gainIcc(state: GameState, ledger: Ledger, points: number): GameState {
  const gain = gainRouteIcc(state, points)
  ledger.icc += gain.gained
  return gain.state
}

function loseHealth(state: GameState, ledger: Ledger, pv: number): GameState {
  const change = changeHealth(state, -pv)
  ledger.health += change.delta
  return change.state
}

function loseChassis(state: GameState, ledger: Ledger, pv: number): GameState {
  const chassis = Math.max(0, state.chassis - pv)
  ledger.chassis += chassis - state.chassis
  return { ...state, chassis }
}

function addWanted(state: GameState, ledger: Ledger): GameState {
  const wanted = Math.min(WANTED.maxLevel, state.wanted + 1)
  ledger.wanted += wanted - state.wanted
  return { ...state, wanted }
}

/** Note la garde à vue au compte rendu ; elle est purgée à la fin de la résolution */
function noteCustody(ledger: Ledger, days: number) {
  ledger.custodyDays = Math.max(ledger.custodyDays, days)
}

/**
 * Fin de résolution, dans l'ordre : exécution sommaire (fouille effective avec un produit fatal),
 * mort si la Santé est tombée à 0, dépannage si le châssis est à 0, puis garde à vue.
 */
function finish(state: GameState, report: InterceptionReport, executed: boolean): GameState {
  if (executed) return endGame(state, report, 'execution')
  if (state.health <= 0) return endGame(state, report, 'death')

  const towed = emergencyTow(state)
  const fullReport: InterceptionReport = { ...report, towBill: towed.bill }
  if (!report.over) return { ...towed.state, interceptionReport: fullReport }

  const passed: GameState = { ...towed.state, interception: null, interceptionReport: fullReport }
  return report.custodyDays > 0 ? serveCustody(passed, report.custodyDays) : passed
}

function endGame(state: GameState, report: InterceptionReport, id: 'execution' | 'death'): GameState {
  return { ...state, status: 'finished', ending: { id, score: 0 }, interception: null, interceptionReport: report }
}

/** Dépannage d'urgence à 0 PV de châssis (chap. 2) : châssis remis en état partiel, facture, demi-journée perdue */
export function emergencyTow(state: GameState): { state: GameState; bill: number } {
  if (state.chassis > 0) return { state, bill: 0 }
  const bill = indexed('rule.emergency-tow', EMERGENCY_TOW.bill, state.day).total
  const paid = Math.min(state.cash, bill)
  const chassis = Math.round(VEHICLES[state.vehicleId].maxChassis * EMERGENCY_TOW.chassisRestore)
  const towed: GameState = { ...state, chassis, cash: state.cash - paid, debt: state.debt + bill - paid }
  // De jour, le joueur passe à 20h00 ; de nuit, il est immobilisé le lendemain (et se repose)
  const halfDayLost: GameState =
    state.phase === 'day' ? { ...towed, dayTripDone: true, dayOver: true } : { ...towed, immobilizedTomorrow: true, lastCurfewDay: null }
  return { state: halfDayLost, bill }
}

/** Tirage du barrage à l'arrivée d'un trajet : renvoie l'interception qui commence, ou null */
export function drawInterception(rng: Rng, risk: number, offGrid: boolean): Interception | null {
  if (!rng.chance(risk)) return null
  return { kind: offGrid ? 'racket' : 'brc', acted: false, bluffFailed: false }
}
