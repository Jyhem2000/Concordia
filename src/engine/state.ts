import { START_CASH, START_DEBT, START_DISTRICT, START_HEALTH, START_ICC } from '../data/balance.ts'
import { seedRng } from './rng.ts'
import type { GameState } from './types.ts'

/** Nouvelle partie au Jour 1, 06h00. Même graine → même partie. */
export function createInitialState(seed: number): GameState {
  return {
    day: 1,
    phase: 'day',
    districtId: START_DISTRICT,
    cash: START_CASH,
    debt: START_DEBT,
    offshore: 0,
    icc: START_ICC,
    health: START_HEALTH,
    rng: seedRng(seed),
  }
}
