import { isActionList, isDay, isDifficulty } from '../server/runs.ts'
import { replay } from '../src/engine/ranked.ts'
import { isDefeat } from '../src/engine/routine.ts'
import type { EndingId } from '../src/engine/types.ts'

/*
 * Verdict d'une partie classée en attente (chap. 1) : rejouée avec les règles de ce dépôt, elle doit se dérouler sans
 * action refusée et finir. Son score est alors celui du rejeu, jamais celui d'un envoi.
 */

/**
 * Partie en attente telle que stockée dans D1 : les actions en JSON, et la graine secrète de son jour (table `days`),
 * absente si le serveur n'en a jamais tiré pour ce jour
 */
export type PendingRun = { id: number; day: string; difficulty: string; actions: string; seed?: number }

export type Verdict =
  | { id: number; status: 'valid'; ending: EndingId; score: number }
  | { id: number; status: 'rejected'; reason: 'malformed' | 'refused' | 'unfinished' | 'error' | 'rules' }

export function verdictOf(run: PendingRun): Verdict {
  const { id, day, difficulty, seed } = run
  // Sans graine du jour, la partie n'a pas pu être ouverte auprès du serveur
  if (seed === undefined) return { id, status: 'rejected', reason: 'malformed' }
  let actions: unknown
  try {
    actions = JSON.parse(run.actions)
  } catch {
    return { id, status: 'rejected', reason: 'malformed' }
  }
  if (!isDay(day) || !isDifficulty(difficulty) || !isActionList(actions)) return { id, status: 'rejected', reason: 'malformed' }
  try {
    const result = replay(seed, difficulty, actions)
    if (!result.ok) return { id, status: 'rejected', reason: 'refused' }
    const { ending } = result.state
    if (result.state.status !== 'finished' || !ending) return { id, status: 'rejected', reason: 'unfinished' }
    // Une défaite vaut zéro au classement (chap. 1)
    return { id, status: 'valid', ending: ending.id, score: isDefeat(ending.id) ? 0 : ending.score }
  } catch {
    // Une action d'une forme que le moteur ne connaît pas peut le faire échouer : la partie est rejetée, pas le passage
    return { id, status: 'rejected', reason: 'error' }
  }
}

export function isPendingRun(value: unknown): value is PendingRun {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'number' &&
    'day' in value &&
    typeof value.day === 'string' &&
    'difficulty' in value &&
    typeof value.difficulty === 'string' &&
    'actions' in value &&
    typeof value.actions === 'string' &&
    (!('seed' in value) || (typeof value.seed === 'number' && Number.isInteger(value.seed)))
  )
}

export function isVerdict(value: unknown): value is Verdict {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'number' &&
    'status' in value &&
    (value.status === 'valid' || value.status === 'rejected')
  )
}
