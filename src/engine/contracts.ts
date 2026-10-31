import { DISTRICT_IDS, DISTRICTS } from '../data/districts.ts'
import { CONTRACT, LOCATIONS } from '../data/locations.ts'
import { PRODUCTS } from '../data/products.ts'
import type { ActionError } from './actions.ts'
import { ownedQty, takeLots } from './cargo.ts'
import { keysOf } from './records.ts'
import type { Rng } from './rng.ts'
import type { Contract, DistrictId, GameState, ProductId } from './types.ts'

/** District du donneur d'ordre : celui de l'usurier (guichet de la dette) */
function brokerDistrict(): DistrictId | undefined {
  return keysOf(LOCATIONS)
    .map((id) => LOCATIONS[id])
    .find((location) => location.services.includes('debt'))?.district
}

/** Produits qu'un contrat peut demander à ce district : sa Forte demande (jamais en boutique là-bas), dans les tiers du contrat */
function contractProducts(districtId: DistrictId): ProductId[] {
  return DISTRICTS[districtId].strongDemand.filter((id) => CONTRACT.tiers.includes(PRODUCTS[id].tier) && !PRODUCTS[id].sealed && !PRODUCTS[id].bulky)
}

/**
 * Contrat proposé ce matin (chap. 3) : une destination hors du district de Viktor, et un produit de sa Forte demande
 * (Viktor livre ce qui y manque, qu'on ne trouve pas sur place), caisses selon le tier
 */
export function drawContract(rng: Rng, day: number): Contract | null {
  const destinations = DISTRICT_IDS.filter((id) => id !== brokerDistrict() && contractProducts(id).length > 0)
  if (destinations.length === 0) return null
  const to = rng.pick(destinations)
  const productId = rng.pick(contractProducts(to))
  const qty = CONTRACT.crates[PRODUCTS[productId].tier] ?? 1
  return {
    productId,
    qty,
    to,
    deadline: day + rng.int(CONTRACT.delayDays.min, CONTRACT.delayDays.max),
    reward: Math.round(qty * PRODUCTS[productId].basePrice * CONTRACT.factor),
  }
}

/** Raison pour laquelle le contrat proposé ne peut pas être accepté, hors heures du guichet (vérifiées par l'action) */
export function checkAcceptContract(state: GameState): ActionError | null {
  if (state.contract) return 'contract-active'
  if (!state.contractOffer) return 'no-contract'
  return null
}

/** Le contrat proposé devient le contrat en cours */
export function acceptContract(state: GameState): GameState {
  return { ...state, contract: state.contractOffer, contractOffer: null }
}

/** Raison pour laquelle le contrat en cours ne peut pas être livré ici et maintenant */
export function checkDeliverContract(state: GameState): ActionError | null {
  if (state.status !== 'playing') return 'game-over'
  if (!state.contract) return 'no-contract'
  if (state.districtId !== state.contract.to) return 'not-contract-district'
  if (ownedQty(state.cargo, state.contract.productId) < state.contract.qty) return 'not-enough-cargo'
  // Viktor veut des caisses apportées d'ailleurs : celles achetées sur place ne comptent pas (chap. 3)
  if (ownedQty(travelledLots(state), state.contract.productId) < state.contract.qty) return 'contract-untravelled'
  return null
}

/** Caisses qui ont voyagé depuis leur achat */
const travelledLots = (state: GameState) => state.cargo.filter((lot) => lot.travelled)

/** Livraison : les caisses qui ont voyagé partent (les plus anciennes d'abord), la prime arrive en Cash-Puce */
export function deliverContract(state: GameState): GameState {
  const { contract } = state
  if (!contract) return state
  const { remaining } = takeLots(travelledLots(state), contract.productId, contract.qty)
  // Les caisses achetées ici restent en soute
  const cargo = [...remaining, ...state.cargo.filter((lot) => !lot.travelled)]
  return { ...state, cargo, cash: state.cash + contract.reward, contract: null }
}

/** Délai dépassé à la routine matinale : la pénalité s'ajoute à la dette et le contrat tombe */
export function expireContract(state: GameState): { state: GameState; penalty: number } {
  if (!state.contract || state.day <= state.contract.deadline) return { state, penalty: 0 }
  const penalty = Math.round(state.contract.reward * CONTRACT.failDebtShare)
  return { state: { ...state, debt: state.debt + penalty, contract: null }, penalty }
}
