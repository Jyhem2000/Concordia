import type { CargoLot, ProductId } from './types.ts'

/** Emplacements de soute occupés (1 caisse = 1 emplacement) */
export function cargoUsed(cargo: readonly CargoLot[]): number {
  return cargo.reduce((total, lot) => total + lot.qty, 0)
}

export function ownedQty(cargo: readonly CargoLot[], productId: ProductId): number {
  return cargo.reduce((total, lot) => (lot.productId === productId ? total + lot.qty : total), 0)
}

/** Prix moyen d'achat (PMA) d'un produit en soute, ou null s'il n'y en a pas */
export function averageCost(cargo: readonly CargoLot[], productId: ProductId): number | null {
  const lots = cargo.filter((lot) => lot.productId === productId)
  const qty = cargoUsed(lots)
  if (qty === 0) return null
  return lots.reduce((total, lot) => total + lot.unitCost * lot.qty, 0) / qty
}

/**
 * Retire `qty` caisses d'un produit, des lots les plus anciens aux plus récents.
 * `taken` contient les portions retirées, dans l'ordre de vente.
 */
export function takeLots(cargo: readonly CargoLot[], productId: ProductId, qty: number): { remaining: CargoLot[]; taken: CargoLot[] } {
  const remaining: CargoLot[] = []
  const taken: CargoLot[] = []
  let left = qty
  for (const lot of cargo) {
    if (lot.productId !== productId || left === 0) {
      remaining.push(lot)
      continue
    }
    const portion = Math.min(lot.qty, left)
    left -= portion
    taken.push({ ...lot, qty: portion })
    if (portion < lot.qty) remaining.push({ ...lot, qty: lot.qty - portion })
  }
  return { remaining, taken }
}
