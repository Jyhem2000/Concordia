import { START_CASH, START_DEBT, START_DISTRICT, START_HEALTH, START_ICC } from '../data/balance.ts'
import { START_VEHICLE, VEHICLES } from '../data/vehicles.ts'
import { drawMarkets, observeMarket } from './market.ts'
import { drawPatrol } from './risk.ts'
import { createRng, seedRng } from './rng.ts'
import type { DistrictId, GameState } from './types.ts'

/** Nouvelle partie au Jour 1, 06h00 : pas de routine matinale, marchés tirés une première fois. */
export function createInitialState(seed: number): GameState {
  const rng = createRng(seedRng(seed))
  const markets = drawMarkets(rng)
  const patrolDistrict = drawPatrol(rng)
  const state: GameState = {
    status: 'playing',
    day: 1,
    phase: 'day',
    districtId: START_DISTRICT,
    vehicleId: START_VEHICLE,
    // Réservoir plein au départ
    fuel: VEHICLES[START_VEHICLE].tank,
    cargo: [],
    markets,
    memory: {},
    dayTripDone: false,
    nightTripDone: false,
    lastCurfewDay: null,
    cash: START_CASH,
    debt: START_DEBT,
    initialDebtPaid: false,
    debtLate: false,
    offshore: { deposited: 0, interest: 0 },
    icc: START_ICC,
    iccRouteGains: 0,
    health: START_HEALTH,
    chassis: VEHICLES[START_VEHICLE].maxChassis,
    wanted: 0,
    patrolDistrict,
    suspiciousPeaks: [],
    oversold: [],
    dayOver: false,
    immobilizedTomorrow: false,
    interception: null,
    interceptionReport: null,
    briefing: null,
    ending: null,
    rng: rng.state,
  }
  return remember(state, START_DISTRICT)
}

/** Mémorise les cours du jour d'un district où se trouve le joueur */
export function remember(state: GameState, districtId: DistrictId): GameState {
  return { ...state, memory: { ...state.memory, [districtId]: observeMarket(state, districtId) } }
}
