import { SEDATION, START_CASH, START_DEBT, START_DISTRICT, START_HEALTH, START_ICC } from '../data/balance.ts'
import { START_VEHICLE, VEHICLES } from '../data/vehicles.ts'
import { DISTRICT_IDS } from '../data/districts.ts'
import { crewEffect } from './crew.ts'
import { drawEvents, NO_EVENTS } from './events.ts'
import { drawMarkets, observeMarket } from './market.ts'
import { drawDayOffer } from './delivery.ts'
import { drawAfter, drawNightOffer } from './night.ts'
import { drawPatrol } from './risk.ts'
import { createRng, seedRng } from './rng.ts'
import type { DistrictId, GameState } from './types.ts'

/** Nouvelle partie au Jour 1, 06h00 : pas de routine matinale, marchés tirés une première fois. */
export function createInitialState(seed: number): GameState {
  const rng = createRng(seedRng(seed))
  const patrolDistrict = drawPatrol(rng)
  const events = drawEvents(NO_EVENTS, 1, rng, true)
  const markets = drawMarkets({ day: 1, phase: 'day', events }, rng)
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
    events,
    roadEvent: null,
    roadReport: null,
    dayTripDone: false,
    nightTripDone: false,
    lastCurfewDay: null,
    cash: START_CASH,
    debt: START_DEBT,
    initialDebtPaid: false,
    advanced: 0,
    modules: { owned: [], mounted: [] },
    trapdoorDay: null,
    dumped: [],
    plateDay: null,
    crew: { active: null, paidDay: null, hires: 0, lost: [], freeHire: false, payInKind: true },
    exemption: SEDATION.protectionDays,
    services: { uses: {}, lastDay: {} },
    morguePass: null,
    influence: null,
    vip: null,
    velvetLock: null,
    dayOffer: drawDayOffer(rng),
    delivery: null,
    progress: { controlsPassed: 0, tagSales: {}, flagged: false, deliveries: 0, vipOrders: 0, injections: 0 },
    nightOffer: drawNightOffer(rng),
    after: drawAfter(rng),
    mission: null,
    jammerDay: null,
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
    tripReport: null,
    curfewStreak: 0,
    lastDopingDay: null,
    iccRestoreUsed: false,
    autoCooling: true,
    briefing: null,
    ending: null,
    rng: rng.state,
  }
  return remember(state, START_DISTRICT)
}

/** Mémorise les cours d'un district où se trouve le joueur : un relevé par jour, le dernier du jour l'emporte (chap. 2) */
export function remember(state: GameState, districtId: DistrictId): GameState {
  // Flux pirate de Glitch : tous les districts sont relevés en temps réel
  const seen = crewEffect(state, 'liveQuotes') ? DISTRICT_IDS : [districtId]
  const memory = { ...state.memory }
  for (const id of seen) memory[id] = [...(memory[id] ?? []).filter((entry) => entry.day !== state.day), observeMarket(state, id)]
  return { ...state, memory }
}
