import { applyAction, type Action } from './actions.ts'
import { createInitialState } from './state.ts'
import type { DifficultyId, GameState } from './types.ts'

/*
 * Partie classée (chap. 1) : la graine du jour, commune à tous les joueurs et à tous les modes, et le rejeu qui
 * recalcule une partie à partir de sa graine, de son mode et de la suite de ses actions.
 */

/** Jour UTC d'un instant, au format AAAA-MM-JJ : la graine du jour change à minuit UTC */
export function utcDay(instant: Date): string {
  return instant.toISOString().slice(0, 10)
}

/** Graine du jour : empreinte FNV-1a (32 bits) du jour, la même partout et pour tous les modes */
export function dailySeed(day: string): number {
  let hash = 0x811c9dc5
  for (const char of `concordia:${day}`) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash
}

export type ReplayResult = { ok: true; state: GameState } | { ok: false; refusedAt: number }

/**
 * Rejoue une partie : le jeu n'enregistre que les actions acceptées, donc une action refusée au rejeu trahit une suite
 * falsifiée ou jouée avec d'autres règles
 */
export function replay(seed: number, difficulty: DifficultyId, actions: readonly Action[]): ReplayResult {
  let state = createInitialState(seed, difficulty)
  for (const [index, action] of actions.entries()) {
    const result = applyAction(state, action)
    if (!result.ok) return { ok: false, refusedAt: index }
    state = result.state
  }
  return { ok: true, state }
}
