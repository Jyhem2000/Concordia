import type { DistrictId } from '../engine/types.ts'

/*
 * Constantes globales d'équilibrage. Chaque valeur cite le chapitre des docs où elle est définie.
 */

/** Durée de la partie, Jour 1 à Jour 30 (chap. 2) */
export const GAME_LENGTH_DAYS = 30

/** Zone de départ (chap. 4) */
export const START_DISTRICT: DistrictId = 'D1'

/** Cash-Puce de départ (chap. 7) */
export const START_CASH = 2_000

/** Dette mafieuse de départ (chap. 7) */
export const START_DEBT = 5_000

/** ICC de départ (chap. 2) */
export const START_ICC = 100

/** Santé de départ (chap. 2) */
export const START_HEALTH = 100
