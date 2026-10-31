import { PRODUCT_IDS, PRODUCTS } from '../data/products.ts'
import { VEHICLES } from '../data/vehicles.ts'
import type { ActionError } from './actions.ts'
import { canHide, ownedQty } from './cargo.ts'
import type { Compartment, CrateCount, GameState, ProductId } from './types.ts'

/** Caisses cachées au double fond */
export function hiddenTotal(compartment: Compartment): number {
  return PRODUCT_IDS.reduce((total, id) => total + (compartment[id] ?? 0), 0)
}

/** Places libres du double fond */
export function compartmentRoom(state: GameState): number {
  return Math.max(0, VEHICLES[state.vehicleId].hiddenCompartment - hiddenTotal(state.compartment))
}

/** Raison pour laquelle le joueur ne peut pas cacher ce produit (`hide`) ou en sortir une caisse du double fond (chap. 4) */
export function checkCompartment(state: GameState, productId: ProductId, hide: boolean): ActionError | null {
  const hidden = state.compartment[productId] ?? 0
  if (!canHide(productId)) return 'cannot-hide'
  if (hide && ownedQty(state.cargo, productId) <= hidden) return 'not-enough-cargo'
  if (!hide && hidden === 0) return 'not-enough-cargo'
  if (hide && compartmentRoom(state) === 0) return 'compartment-full'
  return null
}

/** Cache autant de caisses visibles du produit que le double fond a de places libres (`hide`), ou en sort une caisse */
export function setCompartment(state: GameState, productId: ProductId, hide: boolean): GameState {
  const hidden = state.compartment[productId] ?? 0
  const qty = hide ? hidden + Math.min(ownedQty(state.cargo, productId) - hidden, compartmentRoom(state)) : Math.max(0, hidden - 1)
  return { ...state, compartment: withQty(state.compartment, productId, qty) }
}

/** Remplit les places libres avec les caisses visibles les plus chères au prix de base (changement de châssis) */
export function fillCompartment(state: GameState): GameState {
  const candidates = PRODUCT_IDS.filter((id) => canHide(id) && ownedQty(state.cargo, id) > (state.compartment[id] ?? 0)).sort(
    (a, b) => PRODUCTS[b].basePrice - PRODUCTS[a].basePrice,
  )
  return candidates.reduce((filled, id) => (compartmentRoom(filled) > 0 ? setCompartment(filled, id, true) : filled), state)
}

/**
 * Tient le double fond à jour après une action (chap. 4) :
 * 1. il ne garde que des caisses encore en soute, dans sa capacité (les moins chères en sortent d'abord) ;
 * 2. les caisses arrivées (achat, enchère, caisses récupérées…) prennent les places libres, puis délogent les caisses
 *    cachées moins chères ; les caisses délogées sont annoncées au joueur ;
 * 3. un châssis au double fond plus grand se remplit des caisses visibles les plus chères.
 */
export function settleCompartment(before: GameState, after: GameState): GameState {
  let state: GameState = { ...after, compartment: keepOwned(after), compartmentNotice: null }
  for (const id of PRODUCT_IDS) {
    const arrived = ownedQty(after.cargo, id) - ownedQty(before.cargo, id)
    if (arrived > 0 && canHide(id)) state = place(state, id, arrived)
  }
  if (VEHICLES[after.vehicleId].hiddenCompartment > VEHICLES[before.vehicleId].hiddenCompartment) state = fillCompartment(state)
  return state
}

/** Contenu du double fond limité aux caisses en soute et à la capacité du châssis */
function keepOwned(state: GameState): Compartment {
  let left = VEHICLES[state.vehicleId].hiddenCompartment
  // Les plus chères restent quand la capacité baisse
  const kept = PRODUCT_IDS.filter((id) => canHide(id)).sort((a, b) => PRODUCTS[b].basePrice - PRODUCTS[a].basePrice)
  return kept.reduce<Compartment>((compartment, id) => {
    const qty = Math.min(state.compartment[id] ?? 0, ownedQty(state.cargo, id), left)
    left -= qty
    return withQty(compartment, id, qty)
  }, {})
}

/** Range au double fond des caisses arrivées : places libres d'abord, puis à la place des caisses cachées moins chères */
function place(state: GameState, productId: ProductId, arrived: number): GameState {
  const hidden = state.compartment[productId] ?? 0
  let toPlace = Math.min(arrived, ownedQty(state.cargo, productId) - hidden)
  const free = Math.min(toPlace, compartmentRoom(state))
  let compartment = withQty(state.compartment, productId, hidden + free)
  toPlace -= free
  const displaced: CrateCount[] = []
  const cheaper = PRODUCT_IDS.filter((id) => (compartment[id] ?? 0) > 0 && PRODUCTS[id].basePrice < PRODUCTS[productId].basePrice).sort(
    (a, b) => PRODUCTS[a].basePrice - PRODUCTS[b].basePrice,
  )
  for (const id of cheaper) {
    const qty = Math.min(toPlace, compartment[id] ?? 0)
    if (qty === 0) break
    compartment = withQty(withQty(compartment, id, (compartment[id] ?? 0) - qty), productId, (compartment[productId] ?? 0) + qty)
    displaced.push({ productId: id, qty })
    toPlace -= qty
  }
  return { ...state, compartment, compartmentNotice: displaced.length > 0 ? { productId, displaced } : state.compartmentNotice }
}

/** Double fond avec `qty` caisses du produit ; le produit disparaît à zéro */
function withQty(compartment: Compartment, productId: ProductId, qty: number): Compartment {
  const others = PRODUCT_IDS.reduce<Compartment>((kept, id) => (id === productId || !compartment[id] ? kept : { ...kept, [id]: compartment[id] }), {})
  return qty > 0 ? { ...others, [productId]: qty } : others
}
