import { ICC_MAX, CUSTODY, DEBT_LATE, ENDINGS, GAME_LENGTH_DAYS, PROTECTION, RELAY_SLEEP } from '../data/balance.ts'
import { DISTRICTS } from '../data/districts.ts'
import { LOTTERY } from '../data/events.ts'
import { FORGERY } from '../data/locations.ts'
import { MODULES } from '../data/vehicles.ts'
import { ownedQty } from './cargo.ts'
import { debtInterestBreakdown, offshoreBalance, offshoreInterestBreakdown, protectionBreakdown } from './finance.ts'
import { isPerishable, removeRotten } from './condition.ts'
import { expireVip } from './services.ts'
import { drawDayOffer } from './delivery.ts'
import { drawAfter, drawNightOffer, reclaimSealed } from './night.ts'
import { mountedEffect, recoverDumped } from './equipment.ts'
import { changeHealth, gainRouteIcc, iccTier } from './gauges.ts'
import { crewEffect, payCrew, refreshExemption } from './crew.ts'
import { drawEvents, hasEffect, heatWave } from './events.ts'
import { drawMarkets } from './market.ts'
import { drawPatrol } from './risk.ts'
import { createRng } from './rng.ts'
import { remember } from './state.ts'
import { loseHalfDay } from './time.ts'
import type { Ending, EndingId, GameState, MorningBriefing, ProductId } from './types.ts'

/** Nuit au relais routier du DSC si le district en a un, sinon bivouac sans gain de sommeil (chap. 1) */
export function sleepsAtRelay(state: GameState): boolean {
  return DISTRICTS[state.districtId].relay
}

/** Où le joueur passe la nuit : chacune a ses effets à la routine de 06h00 (chap. 1 et 5) */
type Night = 'relay' | 'bivouac' | 'cell'

/** Nuit, puis audit le Jour 30 à minuit ou routine matinale de 06h00 (chap. 1) */
export function sleep(state: GameState): GameState {
  if (state.day >= GAME_LENGTH_DAYS) return audit(state)
  // Après une tournée de nuit, la nuit blanche ne rapporte aucun gain de sommeil (chap. 1)
  const night: Night = state.phase === 'day' && sleepsAtRelay(state) ? 'relay' : 'bivouac'
  return morningRoutine({ ...state, interceptionReport: null }, night)
}

/**
 * Garde à vue (chap. 5) : chaque jour en cellule fait passer une routine matinale, sans gain de sommeil.
 * Le joueur ressort à 20h00, dans le district de l'interception, reposé. Franchir le Jour 30 à minuit
 * en cellule déclenche l'audit.
 */
export function serveCustody(state: GameState, days: number): GameState {
  let s = state
  for (let served = 0; served < days; served++) {
    if (s.day >= GAME_LENGTH_DAYS) return audit(s)
    s = morningRoutine(s, 'cell')
  }
  return { ...s, dayTripDone: true, dayOver: true, lastCurfewDay: null }
}

/** Effets de la nuit, appliqués avant la routine : gains au relais, PV perdus en cellule */
function spendNight(state: GameState, night: Night): { state: GameState; sleep: MorningBriefing['sleep']; custodyHealth: number } {
  switch (night) {
    case 'relay': {
      const icc = gainRouteIcc(state, RELAY_SLEEP.icc)
      const health = changeHealth(icc.state, RELAY_SLEEP.health)
      // Une nuit sage au relais, certifiée par les capteurs, fait baisser la Fiche S
      const rested = { ...health.state, wanted: Math.max(0, state.wanted - 1) }
      return { state: rested, sleep: { icc: icc.gained, health: health.delta }, custodyHealth: 0 }
    }
    case 'bivouac':
      return { state, sleep: null, custodyHealth: 0 }
    case 'cell': {
      const cell = changeHealth(state, -CUSTODY.healthLossPerMorning, CUSTODY.healthFloor)
      return { state: cell.state, sleep: null, custodyHealth: -cell.delta }
    }
  }
}

/** Routine matinale, dans l'ordre des docs (chap. 1) ; le Jour 1 n'en a pas */
function morningRoutine(state: GameState, night: Night): GameState {
  const spent = spendNight(state, night)
  const day = state.day + 1
  // Un dépannage de nuit immobilise le joueur toute la journée : pas de trajet de jour
  const immobilized = spent.state.immobilizedTomorrow
  let s: GameState = {
    ...spent.state,
    day,
    phase: 'day',
    dayTripDone: immobilized,
    dayOver: immobilized,
    nightTripDone: false,
    immobilizedTomorrow: false,
    iccRouteGains: 0,
    tripReport: null,
    // Les ventes saturées d'hier deviennent les pics suspects du jour (chap. 2)
    suspiciousPeaks: spent.state.oversold,
    oversold: [],
  }
  const briefing: MorningBriefing = {
    day,
    districtId: spent.state.districtId,
    sleep: spent.sleep,
    custodyHealth: spent.custodyHealth,
    rotten: 0,
    heat: null,
    lockedIn: false,
    recovered: null,
    crew: null,
    crewLost: null,
    vipFailed: false,
    missionReclaimed: 0,
    informant: false,
    debtInterest: null,
    debtLate: false,
    protection: null,
    offshoreInterest: null,
  }

  // 1. Salaire de l'équipier, payé d'avance (rien en cellule)
  const crewId = s.crew.active
  const payroll = payCrew(s, night === 'cell')
  s = payroll.state
  if (crewId) briefing.crew = { id: crewId, paid: payroll.paid, crate: payroll.crate }

  // Commande du DSC non livrée (livraison du jour, mission de nuit) : la plateforme reprend ses caisses scellées et note le retard
  const reclaimed = reclaimSealed(s)
  s = reclaimed.state
  briefing.missionReclaimed = reclaimed.crates

  // 2. Intérêts et échéances de la dette
  briefing.debtInterest = debtInterestBreakdown(s)
  if (briefing.debtInterest) s = { ...s, debt: briefing.debtInterest.total }

  if (day === DEBT_LATE.day && !s.initialDebtPaid && !s.debtLate) {
    s = { ...s, debtLate: true }
    briefing.debtLate = true
  }

  // Collecte de protection : le reliquat impayé s'ajoute à la dette
  if (s.initialDebtPaid && PROTECTION.days.includes(day)) {
    const due = protectionBreakdown(s)
    const paid = Math.min(s.cash, due.total)
    briefing.protection = { due, paid, toDebt: due.total - paid }
    s = { ...s, cash: s.cash - paid, debt: s.debt + due.total - paid }
  }

  // 3. Intérêts simples du compte offshore
  // Glitch majore le rendement, sauf les matins en cellule
  briefing.offshoreInterest = offshoreInterestBreakdown(s.offshore, night === 'cell' ? 0 : (crewEffect(s, 'offshoreBonus') ?? 0))
  if (briefing.offshoreInterest) s = { ...s, offshore: { ...s.offshore, interest: s.offshore.interest + briefing.offshoreInterest.total } }

  // 4. Les complices de la trappe rapportent une part des caisses larguées la veille
  const trapdoor = MODULES['MOD-07'].trapdoor
  if (s.dumped.length > 0 && trapdoor) {
    const shareRng = createRng(s.rng)
    const recovered = recoverDumped(s, shareRng.float(0, trapdoor.maxRecovery))
    briefing.recovered = { back: recovered.back, lost: recovered.lost }
    s = { ...s, cargo: recovered.cargo, dumped: [], rng: shareRng.state }
  }

  // Commande VIP du Velvet-Silo dont l'échéance est passée
  const vip = expireVip(s)
  s = vip.state
  briefing.vipFailed = vip.failed

  // 5. Fraîcheur : les périssables pourris sont détruits
  const rot = removeRotten(s)
  briefing.rotten = rot.rotten
  s = { ...s, cargo: rot.cargo }

  // 6. Ronde renforcée, événements, puis demande, cours et boutiques qu'ils modifient
  const rng = createRng(s.rng)
  const patrolDistrict = drawPatrol(rng)
  const events = drawEvents(s.events, day, rng)
  s = { ...s, patrolDistrict, events, dayOffer: drawDayOffer(rng), nightOffer: drawNightOffer(rng) }
  // La Loterie peut désigner l'équipier actif : il disparaît pour de bon (chap. 6)
  // Un faux dossier accepté protège l'équipier de ce tirage ; celui de l'indic efface la Fiche S
  const forged = events.lottery?.day === day && events.lottery.card !== null
  if (forged && events.lottery?.card === 'informant') {
    s = { ...s, wanted: 0, icc: Math.min(ICC_MAX, s.icc + FORGERY.informantIcc) }
    briefing.informant = true
  }
  if (events.lottery?.day === day && !forged && s.crew.active && rng.chance(LOTTERY.crewLossChance)) {
    briefing.crewLost = s.crew.active
    s = { ...s, crew: { ...s.crew, active: null, paidDay: null, lost: [...s.crew.lost, s.crew.active], freeHire: true } }
  }
  // After du couvre-feu de ce soir, annoncée avec les marchés
  s = { ...s, markets: drawMarkets(s, rng, s.markets), after: drawAfter(rng), rng: rng.state }

  // 7. Effets du matin des événements : canicule, sas (chap. 6)
  // Le caisson cryo protège la soute de la canicule
  const heat = heatWave(s)
  if (heat && !mountedEffect(s, 'heatProof')) {
    const scorched = scorch(s, heat.melts, heat.ageDays)
    s = scorched.state
    briefing.heat = scorched.report
  }
  if (hasEffect(s, s.districtId, 'halfDay')) {
    s = loseHalfDay(s)
    briefing.lockedIn = true
  }

  // Exemption Métabolique : un jour de protection en moins, rendu au maximum en D1 de jour
  s = { ...s, exemption: Math.max(0, s.exemption - 1) }
  if (night !== 'cell') s = refreshExemption(s)

  return remember({ ...s, briefing }, s.districtId)
}

/** Canicule à 06h00 : un produit fond, les autres périssables vieillissent ; ceux qui atteignent Pourri sont détruits */
function scorch(state: GameState, melts: ProductId, ageDays: number): { state: GameState; report: NonNullable<MorningBriefing['heat']> } {
  const melted = ownedQty(state.cargo, melts)
  let aged = 0
  const cargo = state.cargo.flatMap((lot) => {
    if (lot.productId === melts) return []
    if (!isPerishable(lot)) return [lot]
    aged += lot.qty
    return [{ ...lot, boughtDay: lot.boughtDay - ageDays }]
  })
  const rot = removeRotten({ ...state, cargo })
  return { state: { ...state, cargo: rot.cargo }, report: { melted, rotten: rot.rotten, aged: aged - rot.rotten } }
}

/** Fins qui sont des défaites (Game Over), par opposition aux grandes fins de l'audit */
const DEFEATS: readonly EndingId[] = ['bio-bricks', 'death', 'execution']

export function isDefeat(ending: EndingId): boolean {
  return DEFEATS.includes(ending)
}

/** Fin évaluée de la plus prestigieuse à la plus modeste, dette soldée (chap. 1) */
export function endingFor(state: GameState): Ending {
  if (state.debt > 0) return { id: 'bio-bricks', score: 0 }
  const score = offshoreBalance(state.offshore)
  const { saboteur, resident, elite, mafia } = ENDINGS
  if (score >= saboteur.minScore && ownedQty(state.cargo, saboteur.requiredProduct) > 0 && state.districtId === saboteur.district) {
    return { id: 'saboteur', score }
  }
  // Résident Réécrit : la greffe a pris, ni lieu, ni ICC, ni serveur à bord exigés
  if (score >= resident.minScore && state.progress.injections >= resident.injections) return { id: 'resident', score }
  // Élite par cooptation : un parrain au Velvet-Silo, et l'ICC qui passe les portiques de la dalle
  if (score >= elite.minScore && iccTier(state.icc) === elite.iccTier && state.progress.vipOrders >= elite.sponsorOrders) {
    return { id: 'elite', score }
  }
  if (score >= mafia.minScore) return { id: 'mafia', score }
  return { id: 'standard', score }
}

/** Audit du Jour 30 à minuit : Bio-Briques si la dette n'est pas soldée, sinon Formatage Brutal du Cash-Puce */
function audit(state: GameState): GameState {
  const ending = endingFor(state)
  return { ...state, status: 'finished', ending, cash: ending.id === 'bio-bricks' ? state.cash : 0 }
}
