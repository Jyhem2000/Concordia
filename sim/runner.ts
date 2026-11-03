import { ROAD_EVENTS } from '../src/data/events.ts'
import { applyAction, type Action } from '../src/engine/actions.ts'
import { isDefeat } from '../src/engine/routine.ts'
import { createInitialState } from '../src/engine/state.ts'
import type { DayLog, DifficultyId, EndingId, GameState, InterceptionMove } from '../src/engine/types.ts'
import { violations } from './invariants.ts'
import { publicView } from './view.ts'

/*
 * Une partie simulée (chap. 8) : le bot choisit une action sur la vue publique, le moteur l'applique,
 * jusqu'à la fin. Les mesures de la partie sont relevées au fil de l'eau.
 */

export type Bot = {
  name: string
  /** Mode de difficulté de ses parties ; Passeur, le jeu de référence, par défaut (chap. 1) */
  difficulty?: DifficultyId
  /** Choisit la prochaine action, à partir de la vue publique seulement */
  decide: (view: GameState) => Action
}

export type GameRecord = {
  seed: number
  bot: string
  ending: EndingId
  defeat: boolean
  score: number
  /** Dernier jour joué */
  lastDay: number
  /** Jour où la dette initiale a été soldée, null sinon */
  debtPaidDay: number | null
  maxDebt: number
  trips: number
  interceptions: number
  /** Options jouées au barrage, et combien ont réussi */
  moves: Partial<Record<InterceptionMove, { played: number; won: number }>>
  custodyDays: number
  roadEvents: number
  nightTrips: number
  /** Services des lieux spéciaux utilisés (par type d'action) */
  services: Record<string, number>
  /** Actions refusées par le moteur : défauts du bot */
  refused: number
  /** Journées où le plafond d'actions a forcé le sommeil */
  forcedSleeps: number
  /** Invariants violés : bugs du moteur */
  violations: string[]
  /** Progression des grandes fins à la dernière journée : commandes VIP, injections, ICC */
  progress: { vipOrders: number; injections: number; icc: number }
  /** Carnet de route de la partie, tenu par le moteur : patrimoine de chaque matin, achats, ventes, faits marquants */
  journal: readonly DayLog[]
}

/** Actions des lieux spéciaux comptées dans les mesures */
const SERVICE_ACTIONS: readonly Action['type'][] = [
  'borrow',
  'morgue',
  'influence',
  'auction',
  'prophecy',
  'forge',
  'vipRequest',
  'vipDeliver',
  'repair',
  'acceptContract',
  'deliverContract',
  'invest',
]

/** Plafond d'actions dans une même journée avant de forcer le sommeil */
const ACTIONS_PER_DAY = 300

export function playGame(bot: Bot, seed: number): GameRecord {
  let state = createInitialState(seed, bot.difficulty)
  const record: GameRecord = {
    seed,
    bot: bot.name,
    ending: 'standard',
    defeat: false,
    score: 0,
    lastDay: 1,
    debtPaidDay: null,
    maxDebt: state.debt,
    trips: 0,
    interceptions: 0,
    moves: {},
    custodyDays: 0,
    roadEvents: 0,
    nightTrips: 0,
    services: {},
    refused: 0,
    forcedSleeps: 0,
    violations: [],
    progress: { vipOrders: 0, injections: 0, icc: state.icc },
    journal: [],
  }
  let actionsToday = 0

  // Garde-fou absolu : une partie ne peut pas tourner sans fin, même si la sortie de secours est refusée
  for (let step = 0; state.status === 'playing' && step < ACTIONS_PER_DAY * 40; step++) {
    const action: Action = actionsToday >= ACTIONS_PER_DAY ? forcedEnd(state) : bot.decide(publicView(state))
    if (actionsToday >= ACTIONS_PER_DAY && action.type === 'sleep') record.forcedSleeps++
    const result = applyAction(state, action)
    if (!result.ok) {
      record.refused++
      // Un bot qui insiste sur une action refusée finit par dormir (plafond de la journée)
      actionsToday++
      continue
    }
    const next = result.state
    observe(record, state, next, action)
    for (const message of violations(next)) record.violations.push(`J${next.day} ${action.type} : ${message}`)
    actionsToday = next.day !== state.day ? 0 : actionsToday + 1
    state = next
  }

  const ending = state.ending
  record.ending = ending?.id ?? 'standard'
  record.defeat = ending ? isDefeat(ending.id) : false
  record.score = ending?.score ?? 0
  record.lastDay = state.day
  record.progress = { vipOrders: state.progress.vipOrders, injections: state.progress.injections, icc: state.icc }
  record.journal = state.journal
  return record
}

/** Sortie de secours d'une journée bloquée : régler le barrage ou l'aléa, sinon attendre le soir, puis dormir */
function forcedEnd(state: GameState): Action {
  if (state.interception) return { type: 'intercept', move: state.interception.kind === 'racket' ? 'refuseToll' : 'search' }
  // Chaque aléa garde une option sans paiement (chap. 6)
  if (state.roadEvent) return { type: 'road', choice: ROAD_EVENTS[state.roadEvent].a.pay ? 'b' : 'a' }
  return state.phase === 'day' && !state.dayTripDone ? { type: 'waitEvening' } : { type: 'sleep' }
}

/** Relève ce qu'une action a changé */
function observe(record: GameRecord, before: GameState, after: GameState, action: Action) {
  record.maxDebt = Math.max(record.maxDebt, after.debt)
  if (record.debtPaidDay === null && after.initialDebtPaid) record.debtPaidDay = after.day
  if (action.type === 'travel') {
    record.trips++
    if (after.interception) record.interceptions++
    if (after.roadEvent) record.roadEvents++
    if (before.phase === 'night') record.nightTrips++
  }
  if (action.type === 'intercept' && after.interceptionReport) {
    const { move, success, over, custodyDays } = after.interceptionReport
    const stats = record.moves[move] ?? { played: 0, won: 0 }
    record.moves[move] = { played: stats.played + 1, won: stats.won + (success ? 1 : 0) }
    if (over) record.custodyDays += custodyDays
    // Dopage pilote : compté avec les services, pour son test par retrait
    if (action.tactics?.dope) record.services.dope = (record.services.dope ?? 0) + 1
  }
  if (SERVICE_ACTIONS.includes(action.type)) {
    const key = action.type === 'morgue' ? `morgue:${action.service}` : action.type
    record.services[key] = (record.services[key] ?? 0) + 1
  }
}
