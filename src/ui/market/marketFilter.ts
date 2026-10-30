import { PRODUCTS } from '../../data/products.ts'
import type { ProductId, TagId, Tier } from '../../engine/types.ts'

/** Filtre du tableau des cours (chap. 7) : un seul à la fois */
export type MarketFilter = { kind: 'all' } | { kind: 'owned' } | { kind: 'tier'; tier: Tier } | { kind: 'tag'; tag: TagId }

/** Le produit passe-t-il le filtre ? `owned` : le joueur en a en soute */
export function passesFilter(filter: MarketFilter, productId: ProductId, owned: boolean): boolean {
  switch (filter.kind) {
    case 'all':
      return true
    case 'owned':
      return owned
    case 'tier':
      return PRODUCTS[productId].tier === filter.tier
    case 'tag':
      return PRODUCTS[productId].tags.includes(filter.tag)
  }
}

/** Identifiant du filtre : clé de sa pastille et comparaison avec le filtre choisi */
export function filterKey(filter: MarketFilter): string {
  switch (filter.kind) {
    case 'all':
    case 'owned':
      return filter.kind
    case 'tier':
      return `tier-${filter.tier}`
    case 'tag':
      return filter.tag
  }
}
