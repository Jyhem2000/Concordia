import { NIGHT_MISSION, WANTED } from '../data/balance.ts'
import { DISTRICT_IDS } from '../data/districts.ts'
import { PRODUCTS, SEALED_PRODUCT } from '../data/products.ts'
import { VEHICLES } from '../data/vehicles.ts'
import type { ActionError } from './actions.ts'
import { cargoUsed } from './cargo.ts'
import { indexed } from './inflation.ts'
import type { Rng } from './rng.ts'
import type { CargoLot, DistrictId, GameState } from './types.ts'

/*
 * Tournée de nuit (chap. 2) : la logistique tourne la nuit sur ordre de mission. Sur mission, le trajet
 * est couvert et payé ; hors mission, c'est une anomalie enregistrée.
 */

export const isSealed = (lot: CargoLot) => PRODUCTS[lot.productId].sealed === true

/** Mission proposée pour ce soir : une chance, vers un district tiré au hasard */
export function drawNightOffer(rng: Rng): DistrictId | null {
  return rng.chance(NIGHT_MISSION.chance) ? rng.pick(DISTRICT_IDS) : null
}

/** Mission valable ce soir : proposée, et pas vers le district où se trouve déjà le joueur */
export function missionOffer(state: GameState): DistrictId | null {
  return state.nightOffer && state.nightOffer !== state.districtId ? state.nightOffer : null
}

/** Caisses scellées chargées : une part de la capacité du camion, au moins une */
export function sealedCount(state: GameState): number {
  return Math.max(1, Math.ceil(VEHICLES[state.vehicleId].cargo * NIGHT_MISSION.sealedShare))
}

export function missionFee(state: GameState): number {
  return indexed('rule.night-mission', NIGHT_MISSION.fee, state.day).total
}

export function checkMission(state: GameState): ActionError | null {
  if (!missionOffer(state)) return 'no-mission'
  return cargoUsed(state.cargo) + sealedCount(state) > VEHICLES[state.vehicleId].cargo ? 'cargo-full' : null
}

/** Mission acceptée : la plateforme charge les caisses scellées */
export function acceptMission(state: GameState): GameState {
  const to = missionOffer(state)
  if (!to) return state
  const sealed: CargoLot = { productId: SEALED_PRODUCT, qty: sealedCount(state), unitCost: 0, travelled: true, boughtDay: state.day, damaged: false }
  return { ...state, cargo: [...state.cargo, sealed], mission: { to } }
}

/** Trajet de nuit vers la destination de la mission acceptée */
export function isOnMission(state: GameState, to: DistrictId): boolean {
  return state.phase === 'night' && state.mission?.to === to
}

/** Arrivée de nuit dans le district de la mission : les caisses scellées sont livrées, la prime versée */
export function deliverMission(state: GameState): GameState {
  if (state.phase !== 'night' || !state.mission || state.mission.to !== state.districtId) return state
  const fee = missionFee(state)
  return {
    ...state,
    cash: state.cash + fee,
    cargo: state.cargo.filter((lot) => !isSealed(lot)),
    mission: null,
    tripReport: state.tripReport ? { ...state.tripReport, mission: 'delivered', missionFee: fee } : state.tripReport,
  }
}

/** Trajet de nuit hors mission passé sans interception : Aeterna enregistre l'écart (+1 niveau de Fiche S) */
export function recordDeviation(state: GameState): GameState {
  return {
    ...state,
    wanted: Math.min(WANTED.maxLevel, state.wanted + 1),
    tripReport: state.tripReport ? { ...state.tripReport, mission: 'deviated' } : state.tripReport,
  }
}

/** Routine de 06h00 : la plateforme reprend les caisses scellées non livrées et note le retard */
export function reclaimSealed(state: GameState): { state: GameState; crates: number } {
  const crates = state.cargo.reduce((total, lot) => (isSealed(lot) ? total + lot.qty : total), 0)
  if (crates === 0 && !state.mission) return { state, crates: 0 }
  const late = crates > 0 ? NIGHT_MISSION.undeliveredIccLoss : 0
  return { state: { ...state, cargo: state.cargo.filter((lot) => !isSealed(lot)), mission: null, icc: Math.max(0, state.icc - late) }, crates }
}
