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

/** Tris du tableau des cours (chap. 7) : par tier, par prix croissant ou décroissant */
export type MarketSort = 'tier' | 'priceAsc' | 'priceDesc'

export const MARKET_SORTS: readonly MarketSort[] = ['tier', 'priceAsc', 'priceDesc']

/** Produits triés ; `price` : cours ici, `name` : nom affiché, qui départage toujours (ordre stable, sans être un tri proposé) */
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
  }
  return [...ids].sort(compare[sort])
}
