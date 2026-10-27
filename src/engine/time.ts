import type { GameState } from './types.ts'

/**
 * Perte d'une demi-journée (chap. 2) : de jour, le joueur passe directement à 20h00 ;
 * de nuit, il est immobilisé le lendemain jusqu'à 20h00, ce qui compte comme repos.
 */
export function loseHalfDay(state: GameState): GameState {
  return state.phase === 'day' ? { ...state, dayTripDone: true, dayOver: true } : { ...state, immobilizedTomorrow: true, lastCurfewDay: null }
}
