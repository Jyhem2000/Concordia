import type { Phase } from '../../engine/types.ts'

/** Pas de rotation du téléscripteur : premier avec la taille du catalogue, il saute d'un thème à l'autre */
export const TICKER_STRIDE = 7

/**
 * Message du téléscripteur (chap. 10) : un par demi-journée (jour, puis nuit), en sautant de TICKER_STRIDE
 * dans le catalogue rangé par thèmes. Tout le catalogue passe en une partie s'il compte au plus deux messages par jour.
 */
export function tickerSlot(day: number, phase: Phase, count: number): number {
  const slot = (day - 1) * 2 + (phase === 'night' ? 1 : 0)
  return (slot * TICKER_STRIDE) % count
}
