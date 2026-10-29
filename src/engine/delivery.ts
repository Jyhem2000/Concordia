import { DAY_DELIVERY } from '../data/balance.ts'
import { DISTRICT_IDS } from '../data/districts.ts'
import { SEALED_PRODUCT } from '../data/products.ts'
import { VEHICLES } from '../data/vehicles.ts'
import type { ActionError } from './actions.ts'
import { cargoUsed } from './cargo.ts'
import { isSealed } from './night.ts'
import { noteDelivery, trustFactor } from './progress.ts'
import type { Rng } from './rng.ts'
import type { CargoLot, DistrictId, GameState } from './types.ts'

/*
 * Livraison officielle du jour (chap. 1) : la plateforme du DSC confie au livreur une commande légale
 * à livrer par son trajet de jour, contre une prime. Le revenu sûr de celui qui ne veut pas risquer gros.
 */

/** Livraison proposée ce matin : une chance, vers un district tiré au hasard */
export function drawDayOffer(rng: Rng): DistrictId | null {
  return rng.chance(DAY_DELIVERY.chance) ? rng.pick(DISTRICT_IDS) : null
}

/** Livraison valable maintenant : proposée, et pas vers le district où se trouve déjà le joueur */
export function deliveryOffer(state: GameState): DistrictId | null {
  return state.dayOffer && state.dayOffer !== state.districtId ? state.dayOffer : null
}

/** Caisses scellées chargées : une part de la capacité du camion, au moins une */
export function deliveryCrates(state: GameState): number {
  return Math.max(1, Math.ceil(VEHICLES[state.vehicleId].cargo * DAY_DELIVERY.sealedShare))
}

/** Prime de la livraison, majorée par la confiance du DSC */
export function deliveryFee(state: GameState): number {
  return Math.round(DAY_DELIVERY.fee * trustFactor(state))
}

/** La livraison se fait par le trajet de jour : à accepter avant de partir, avec la place libre */
export function checkDelivery(state: GameState): ActionError | null {
  if (state.status !== 'playing') return 'game-over'
  if (state.phase !== 'day' || state.dayOver) return 'not-daytime'
  if (state.dayTripDone) return 'trip-done'
  if (state.delivery) return 'contract-active'
  if (!deliveryOffer(state)) return 'no-delivery'
  return cargoUsed(state.cargo) + deliveryCrates(state) > VEHICLES[state.vehicleId].cargo ? 'cargo-full' : null
}

/** Livraison acceptée : la plateforme charge les caisses scellées */
export function acceptDelivery(state: GameState): GameState {
  const to = deliveryOffer(state)
  if (!to) return state
  const sealed: CargoLot = {
    productId: SEALED_PRODUCT,
    qty: deliveryCrates(state),
    unitCost: 0,
    travelled: true,
    boughtDay: state.day,
    damaged: false,
  }
  return { ...state, cargo: [...state.cargo, sealed], delivery: { to }, dayOffer: null }
}

/** Arrivée de jour dans le district de la livraison : les caisses scellées sont remises, la prime versée */
export function deliverDay(state: GameState): GameState {
  if (state.phase !== 'day' || !state.delivery || state.delivery.to !== state.districtId) return state
  const fee = deliveryFee(state)
  return {
    ...noteDelivery(state),
    cash: state.cash + fee,
    cargo: state.cargo.filter((lot) => !isSealed(lot)),
    delivery: null,
    tripReport: state.tripReport ? { ...state.tripReport, mission: 'delivered', missionFee: fee } : state.tripReport,
  }
}
