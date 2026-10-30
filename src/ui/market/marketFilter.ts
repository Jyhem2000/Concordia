import { PRODUCTS } from '../../data/products.ts'
import type { ProductId, TagId, Tier } from '../../engine/types.ts'

/** Filtres du tableau des cours (chap. 7) : un tier et un tag, cumulables ; `null` garde tout */
export type MarketFilter = { tier: Tier | null; tag: TagId | null }

/** Aucun filtre */
export const NO_FILTER: MarketFilter = { tier: null, tag: null }

/** Le produit passe-t-il les deux filtres ? */
export function passesFilter(filter: MarketFilter, productId: ProductId): boolean {
  const product = PRODUCTS[productId]
  return (filter.tier === null || product.tier === filter.tier) && (filter.tag === null || product.tags.includes(filter.tag))
}
