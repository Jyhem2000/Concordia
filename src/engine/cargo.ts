import { MASKED_CRATE_WEIGHT } from '../data/balance.ts'
import { PRODUCTS } from '../data/products.ts'
import type { CargoLot, Compartment, CrateCount, ProductId, TagId, Tier } from './types.ts'

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

/** Caisses en soute qui portent ce tag */
export function taggedQty(cargo: readonly CargoLot[], tag: TagId): number {
  return cargo.reduce((total, lot) => (PRODUCTS[lot.productId].tags.includes(tag) ? total + lot.qty : total), 0)
}

/** Caisses de ce tag masquées par les caisses de Tier 0 qui le masquent, 1 pour 1 (chap. 2) */
export function maskedQty(cargo: readonly CargoLot[], tag: TagId): number {
  const maskers = cargo.reduce((total, lot) => (PRODUCTS[lot.productId].masks === tag ? total + lot.qty : total), 0)
  return Math.min(maskers, taggedQty(cargo, tag))
}

/** Part d'un tag dans la cargaison ; une caisse masquée compte pour MASKED_CRATE_WEIGHT (chap. 5) */
export function tagShare(cargo: readonly CargoLot[], tag: TagId): number {
  const total = cargoUsed(cargo)
  if (total === 0) return 0
  const masked = maskedQty(cargo, tag)
  return (taggedQty(cargo, tag) - masked + masked * MASKED_CRATE_WEIGHT) / total
}

/** Part des caisses d'un tier donné dans la cargaison */
export function tierShare(cargo: readonly CargoLot[], tier: Tier): number {
  const total = cargoUsed(cargo)
  if (total === 0) return 0
  return cargo.reduce((sum, lot) => (PRODUCTS[lot.productId].tier === tier ? sum + lot.qty : sum), 0) / total
}

/** Produit illégal : tout ce qui ne porte pas le tag Légal */
export function isIllegalProduct(productId: ProductId): boolean {
  return !PRODUCTS[productId].tags.includes('TAG-LEGAL')
}

/** Caisses illégales : tout ce qui ne porte pas le tag Légal */
export function isIllegal(lot: CargoLot): boolean {
  return isIllegalProduct(lot.productId)
}

/** Le produit peut-il aller au double fond ? Seulement les caisses illégales, sans les encombrantes (chap. 4) */
export function canHide(productId: ProductId): boolean {
  return isIllegalProduct(productId) && !PRODUCTS[productId].bulky
}

/** Double fond (chap. 4) : les caisses cachées de chaque produit, prises dans ses lots dans l'ordre de la soute */
export function splitHidden(cargo: readonly CargoLot[], compartment: Compartment): { hidden: CargoLot[]; visible: CargoLot[] } {
  // Caisses déjà prises par produit, pour ne pas en cacher plus que le double fond n'en compte
  const taken = new Map<ProductId, number>()
  const hidden: CargoLot[] = []
  const visible: CargoLot[] = []
  for (const lot of cargo) {
    const already = taken.get(lot.productId) ?? 0
    const qty = Math.max(0, Math.min(lot.qty, (compartment[lot.productId] ?? 0) - already))
    taken.set(lot.productId, already + qty)
    if (qty > 0) hidden.push({ ...lot, qty })
    if (qty < lot.qty) visible.push({ ...lot, qty: lot.qty - qty })
  }
  return { hidden, visible }
}

/** Valeur des caisses au prix de base (collecte, péage, tarif de corruption) */
export function baseValue(cargo: readonly CargoLot[]): number {
  return cargo.reduce((total, lot) => total + PRODUCTS[lot.productId].basePrice * lot.qty, 0)
}

/** Retire des caisses données en paiement, lots les plus anciens d'abord */
export function giveCrates(cargo: readonly CargoLot[], crates: readonly CrateCount[]): CargoLot[] {
  return crates.reduce<CargoLot[]>((remaining, { productId, qty }) => takeLots(remaining, productId, qty).remaining, [...cargo])
}

/** Vrai si la soute contient toutes ces caisses, en quantités entières positives */
export function ownsCrates(cargo: readonly CargoLot[], crates: readonly CrateCount[]): boolean {
  const wanted = new Map<ProductId, number>()
  for (const { productId, qty } of crates) {
    if (!Number.isInteger(qty) || qty <= 0) return false
    wanted.set(productId, (wanted.get(productId) ?? 0) + qty)
  }
  return [...wanted].every(([productId, qty]) => ownedQty(cargo, productId) >= qty)
}
