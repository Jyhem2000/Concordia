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

/** Tris du tableau des cours (chap. 7) : tier puis nom, prix croissant ou décroissant, nom */
export type MarketSort = 'tier' | 'priceAsc' | 'priceDesc' | 'name'

export const MARKET_SORTS: readonly MarketSort[] = ['tier', 'priceAsc', 'priceDesc', 'name']

/** Produits triés ; `price` : cours ici, `name` : nom affiché. Le nom départage toujours, pour un ordre stable */
export function sortProducts(
  ids: readonly ProductId[],
  sort: MarketSort,
  price: (id: ProductId) => number,
  name: (id: ProductId) => string,
): ProductId[] {
  const byName = (a: ProductId, b: ProductId) => name(a).localeCompare(name(b), 'fr')
  const compare: Record<MarketSort, (a: ProductId, b: ProductId) => number> = {
    tier: (a, b) => PRODUCTS[a].tier - PRODUCTS[b].tier || byName(a, b),
    priceAsc: (a, b) => price(a) - price(b) || byName(a, b),
    priceDesc: (a, b) => price(b) - price(a) || byName(a, b),
    name: byName,
  }
  return [...ids].sort(compare[sort])
}
