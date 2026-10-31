import type { Phase } from '../../engine/types.ts'

/** Pas de rotation du téléscripteur : premier avec la taille du catalogue, il saute d'un thème à l'autre */
export const TICKER_STRIDE = 7

/** Messages qui se suivent dans le bandeau, à chaque demi-journée */
export const TICKER_PER_SLOT = 3

/**
 * Messages du téléscripteur (chap. 7) : TICKER_PER_SLOT par demi-journée (jour, puis nuit), en sautant de TICKER_STRIDE
 * dans le catalogue rangé par thèmes. Tout le catalogue passe avant qu'un message ne revienne.
 */
export function tickerSlots(day: number, phase: Phase, count: number): number[] {
  const slot = (day - 1) * 2 + (phase === 'night' ? 1 : 0)
  return Array.from({ length: TICKER_PER_SLOT }, (_, index) => ((slot * TICKER_PER_SLOT + index) * TICKER_STRIDE) % count)
}
