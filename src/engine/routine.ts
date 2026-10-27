import { CUSTODY, DEBT_BEATING, DEBT_LATE, ENDINGS, GAME_LENGTH_DAYS, PROTECTION, RELAY_SLEEP } from '../data/balance.ts'
import { DISTRICTS } from '../data/districts.ts'
import { ownedQty } from './cargo.ts'
import { debtInterestBreakdown, offshoreBalance, offshoreInterestBreakdown, protectionBreakdown } from './finance.ts'
import { changeHealth, gainRouteIcc, iccTier } from './gauges.ts'
import { drawMarkets } from './market.ts'
import { drawPatrol } from './risk.ts'
import { createRng } from './rng.ts'
import { remember } from './state.ts'
import type { Ending, EndingId, GameState, MorningBriefing } from './types.ts'

/** Nuit au relais routier du DSC si le district en a un, sinon bivouac sans gain de sommeil (chap. 2) */
export function sleepsAtRelay(state: GameState): boolean {
  return DISTRICTS[state.districtId].relay
}

/** Où le joueur passe la nuit : chacune a ses effets à la routine de 06h00 (chap. 2 et 6) */
type Night = 'relay' | 'bivouac' | 'cell'

/** Nuit, puis audit le Jour 30 à minuit ou routine matinale de 06h00 (chap. 2) */
export function sleep(state: GameState): GameState {
  if (state.day >= GAME_LENGTH_DAYS) return audit(state)
  // Après un couvre-feu forcé, la nuit blanche ne rapporte aucun gain de sommeil (chap. 2)
  const night: Night = state.phase === 'day' && sleepsAtRelay(state) ? 'relay' : 'bivouac'
  return morningRoutine({ ...state, interceptionReport: null }, night)
}

/**
 * Garde à vue (chap. 6) : chaque jour en cellule fait passer une routine matinale, sans gain de sommeil.
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

/** Routine matinale, dans l'ordre des docs (chap. 2) ; le Jour 1 n'en a pas */
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
    // Les ventes saturées d'hier deviennent les pics suspects du jour (chap. 7)
    suspiciousPeaks: spent.state.oversold,
    oversold: [],
  }
  const briefing: MorningBriefing = {
    day,
    sleep: spent.sleep,
    custodyHealth: spent.custodyHealth,
    debtInterest: null,
    beating: 0,
    debtLate: false,
    protection: null,
    offshoreInterest: null,
  }

  // 1. L'indice d'inflation se déduit du jour (inflation.ts)

  // 3. Intérêts et échéances de la dette
  briefing.debtInterest = debtInterestBreakdown(s)
  if (briefing.debtInterest) s = { ...s, debt: briefing.debtInterest.total }

  if (day === DEBT_BEATING.day && s.debt > DEBT_BEATING.threshold) {
    const beaten = changeHealth(s, -DEBT_BEATING.healthLoss, DEBT_BEATING.healthFloor)
    s = beaten.state
    briefing.beating = -beaten.delta
  }
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

  // 4. Intérêts simples du compte offshore
  briefing.offshoreInterest = offshoreInterestBreakdown(s.offshore)
  if (briefing.offshoreInterest) s = { ...s, offshore: { ...s.offshore, interest: s.offshore.interest + briefing.offshoreInterest.total } }

  // 7. Ronde renforcée, reconstitution de la demande, cours et boutiques
  const rng = createRng(s.rng)
  const patrolDistrict = drawPatrol(rng)
  s = { ...s, patrolDistrict, markets: drawMarkets(rng, s.markets), rng: rng.state, briefing }

  return remember(s, s.districtId)
}

/** Fins qui sont des défaites (Game Over), par opposition aux grandes fins de l'audit */
const DEFEATS: readonly EndingId[] = ['bio-bricks', 'death', 'execution']

export function isDefeat(ending: EndingId): boolean {
  return DEFEATS.includes(ending)
}

/** Fin évaluée de la plus prestigieuse à la plus modeste, dette soldée (chap. 2) */
export function endingFor(state: GameState): Ending {
  if (state.debt > 0) return { id: 'bio-bricks', score: 0 }
  const score = offshoreBalance(state.offshore)
  const { saboteur, elite, mafia } = ENDINGS
  if (score >= saboteur.minScore && ownedQty(state.cargo, saboteur.requiredProduct) > 0 && state.districtId === saboteur.district) {
    return { id: 'saboteur', score }
  }
  if (score >= elite.minScore && iccTier(state.icc) === elite.iccTier) return { id: 'elite', score }
  if (score >= mafia.minScore) return { id: 'mafia', score }
  return { id: 'standard', score }
}

/** Audit du Jour 30 à minuit : hachoir si la dette n'est pas soldée, sinon Formatage Brutal du Cash-Puce */
function audit(state: GameState): GameState {
  const ending = endingFor(state)
  return { ...state, status: 'finished', ending, cash: ending.id === 'bio-bricks' ? state.cash : 0 }
}
