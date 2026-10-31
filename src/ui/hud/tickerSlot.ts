/** Pas de rotation du téléscripteur : premier avec la taille du catalogue, il saute d'un thème à l'autre */
export const TICKER_STRIDE = 7

/** Messages qui se suivent dans le bandeau, chaque jour */
export const TICKER_PER_DAY = 3

/**
 * Messages du téléscripteur (chap. 7) : TICKER_PER_DAY par jour, en sautant de TICKER_STRIDE dans le catalogue rangé
 * par thèmes. Tout le catalogue passe avant qu'un message ne revienne.
 */
export function tickerSlots(day: number, count: number): number[] {
  return Array.from({ length: TICKER_PER_DAY }, (_, index) => (((day - 1) * TICKER_PER_DAY + index) * TICKER_STRIDE) % count)
}
