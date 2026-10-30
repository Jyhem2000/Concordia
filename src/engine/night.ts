import { AFTER, DAY_DELIVERY, ENDINGS, NIGHT_MISSION } from '../data/balance.ts'
import { DISTRICT_IDS } from '../data/districts.ts'
import { PRODUCTS, SEALED_PRODUCT } from '../data/products.ts'
import { VEHICLES } from '../data/vehicles.ts'
import type { ActionError } from './actions.ts'
import { cargoUsed, ownedQty } from './cargo.ts'
import { workingCrew } from './crew.ts'
import { nightUnlock, noteDelivery, raiseWanted, trustFactor } from './progress.ts'
import type { Rng } from './rng.ts'
import type { CargoLot, DistrictId, GameState } from './types.ts'

/*
 * Tournée de nuit (chap. 1) : la logistique tourne la nuit sur ordre de mission. Sur mission, le trajet
 * est couvert et payé ; hors mission, c'est une anomalie enregistrée.
 */

export const isSealed = (lot: CargoLot) => PRODUCTS[lot.productId].sealed === true

/** Mission proposée pour ce soir, vers un district tiré au hasard (une chaque soir) */
export function drawNightOffer(rng: Rng): DistrictId {
  return rng.pick(DISTRICT_IDS)
}

/** After du couvre-feu de ce soir, dans un des districts qui en accueillent */
export function drawAfter(rng: Rng): DistrictId {
  return rng.pick(AFTER.districts)
}

/** La nuit, dans le district de l'after : prime festive et foule qui couvre */
export function atAfter(state: GameState, districtId: DistrictId): boolean {
  return state.phase === 'night' && state.after === districtId
}

/** Mission valable ce soir : proposée, débloquée (confiance du DSC), et pas vers le district où se trouve déjà le joueur */
export function missionOffer(state: GameState): DistrictId | null {
  if (!nightUnlock(state).unlocked) return null
  return state.nightOffer && state.nightOffer !== state.districtId ? state.nightOffer : null
}

/** Caisses scellées chargées : une part de la capacité du camion, au moins une */
export function sealedCount(state: GameState): number {
  return Math.max(1, Math.ceil(VEHICLES[state.vehicleId].cargo * NIGHT_MISSION.sealedShare))
}

/** Prime de la mission, majorée par la confiance du DSC */
export function missionFee(state: GameState): number {
  return Math.round(NIGHT_MISSION.fee * trustFactor(state))
}

export function checkMission(state: GameState): ActionError | null {
  if (!nightUnlock(state).unlocked) return 'mission-locked'
  if (!missionOffer(state)) return 'no-mission'
  // Une seule commande scellée à bord : la livraison du jour non faite bloque la mission du soir
  if (state.delivery) return 'delivery-pending'
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
    ...noteDelivery(state),
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
    ...raiseWanted(state),
    tripReport: state.tripReport ? { ...state.tripReport, mission: 'deviated' } : state.tripReport,
  }
}

/** Fantôme (chap. 4) : serveur en soute et Glitch au travail ce jour-là, tant que l'injection n'est pas complète */
export function canInject(state: GameState): boolean {
  const { injections, requiredProduct, crew } = ENDINGS.resident
  return state.progress.injections < injections && workingCrew(state) === crew && ownedQty(state.cargo, requiredProduct) > 0
}

/** Tournée de nuit hors mission arrivée sans garde à vue : Glitch injecte un morceau du dossier dans Aeterna */
export function injectServer(state: GameState): GameState {
  if (!canInject(state)) return state
  const injections = state.progress.injections + 1
  return {
    ...state,
    progress: { ...state.progress, injections },
    tripReport: state.tripReport ? { ...state.tripReport, injection: injections } : state.tripReport,
  }
}

/** Routine de 06h00 : la plateforme reprend les caisses scellées non livrées (livraison du jour ou mission de nuit) et note le retard */
export function reclaimSealed(state: GameState): { state: GameState; crates: number } {
  const crates = state.cargo.reduce((total, lot) => (isSealed(lot) ? total + lot.qty : total), 0)
  if (crates === 0 && !state.mission && !state.delivery) return { state, crates: 0 }
  const loss = state.delivery ? DAY_DELIVERY.undeliveredIccLoss : NIGHT_MISSION.undeliveredIccLoss
  const late = crates > 0 ? loss : 0
  return {
    state: { ...state, cargo: state.cargo.filter((lot) => !isSealed(lot)), mission: null, delivery: null, icc: Math.max(0, state.icc - late) },
    crates,
  }
}
