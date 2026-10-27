import { DEBT_BEATING, DEBT_LATE, ENDINGS, GAME_LENGTH_DAYS, PROTECTION, RELAY_SLEEP } from '../data/balance.ts'
import { ownedQty } from './cargo.ts'
import { debtInterestBreakdown, offshoreBalance, offshoreInterestBreakdown, protectionBreakdown } from './finance.ts'
import { changeHealth, gainRouteIcc, iccTier } from './gauges.ts'
import { drawMarkets } from './market.ts'
import { createRng } from './rng.ts'
import { remember } from './state.ts'
import type { Ending, GameState, MorningBriefing } from './types.ts'

/** Rust Valley n'a pas de relais routier du DSC : on y bivouaque, sans gain de sommeil (chap. 2) */
export function sleepsAtRelay(state: GameState): boolean {
  return state.districtId !== 'D4'
}

/** Nuit, puis audit le Jour 30 à minuit ou routine matinale de 06h00 (chap. 2) */
export function sleep(state: GameState): GameState {
  if (state.day >= GAME_LENGTH_DAYS) return audit(state)

  let night = state
  let sleepGains: MorningBriefing['sleep'] = null
  if (sleepsAtRelay(state)) {
    const icc = gainRouteIcc(night, RELAY_SLEEP.icc)
    const health = changeHealth(icc.state, RELAY_SLEEP.health)
    night = health.state
    sleepGains = { icc: icc.gained, health: health.delta }
  }
  return morningRoutine(night, sleepGains)
}

/** Routine matinale, dans l'ordre des docs (chap. 2) ; le Jour 1 n'en a pas */
function morningRoutine(state: GameState, sleepGains: MorningBriefing['sleep']): GameState {
  const day = state.day + 1
  let s: GameState = { ...state, day, phase: 'day', dayTripDone: false, nightTripDone: false, iccRouteGains: 0 }
  const briefing: MorningBriefing = {
    day,
    sleep: sleepGains,
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

  // 7. Reconstitution de la demande, cours et boutiques
  const rng = createRng(s.rng)
  s = { ...s, markets: drawMarkets(rng, s.markets), rng: rng.state, briefing }

  return remember(s, s.districtId)
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
