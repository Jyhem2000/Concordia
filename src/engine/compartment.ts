import type { ActionError } from './actions.ts'
import { canHide, ownedQty } from './cargo.ts'
import { hiddenCargo } from './interception.ts'
import type { CompartmentChoice, CrateCount, GameState, ProductId } from './types.ts'

/** Raison pour laquelle le joueur ne peut pas envoyer ce produit au double fond, ou l'en retirer (chap. 4) */
export function checkCompartment(state: GameState, productId: ProductId): ActionError | null {
  if (ownedQty(state.cargo, productId) < 1) return 'not-enough-cargo'
  if (!canHide(productId)) return 'cannot-hide'
  return null
}

/** Choix après avoir envoyé le produit au double fond (`hide`) ou l'en avoir retiré */
export function compartmentChoice(choice: CompartmentChoice, productId: ProductId, hide: boolean): CompartmentChoice {
  const pinned = choice.pinned.filter((id) => id !== productId)
  const excluded = choice.excluded.filter((id) => id !== productId)
  return hide ? { pinned: [productId, ...pinned], excluded } : { pinned, excluded: [...excluded, productId] }
}

/** Envoie le produit au double fond, ou l'en retire (chap. 4) */
export function setCompartment(state: GameState, productId: ProductId, hide: boolean): GameState {
  return { ...state, compartment: compartmentChoice(state.compartment, productId, hide) }
}

/** Caisses qu'envoyer le produit au double fond en délogerait, par produit */
export function displacedBy(state: GameState, productId: ProductId): CrateCount[] {
  const before = hiddenCargo(state).hidden
  const after = hiddenCargo(state, compartmentChoice(state.compartment, productId, true)).hidden
  const products = [...new Set(before.map((lot) => lot.productId))].filter((id) => id !== productId)
  return products.flatMap((id) => {
    const qty = ownedQty(before, id) - ownedQty(after, id)
    return qty > 0 ? [{ productId: id, qty }] : []
  })
}

/** Le choix s'oublie dès que le produit quitte la soute (chap. 4) ; même état si rien ne change */
export function forgetCompartment(state: GameState): GameState {
  const kept = (id: ProductId) => ownedQty(state.cargo, id) > 0
  const { pinned, excluded } = state.compartment
  if (pinned.every(kept) && excluded.every(kept)) return state
  return { ...state, compartment: { pinned: pinned.filter(kept), excluded: excluded.filter(kept) } }
}
