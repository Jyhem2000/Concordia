import { MAP_LINKS } from '../data/districts.ts'
import type { DistrictId } from './types.ts'

/** Itinéraire le plus court (en districts) de `from` à `to`, extrémités comprises (chap. 4) */
export function shortestRoute(from: DistrictId, to: DistrictId): DistrictId[] {
  const previous = new Map<DistrictId, DistrictId | null>([[from, null]])
  const queue: DistrictId[] = [from]

  for (let current = queue.shift(); current !== undefined; current = queue.shift()) {
    if (current === to) break
    for (const [a, b] of MAP_LINKS) {
      const next = a === current ? b : b === current ? a : null
      if (next && !previous.has(next)) {
        previous.set(next, current)
        queue.push(next)
      }
    }
  }

  if (!previous.has(to)) throw new Error(`Aucun itinéraire de ${from} à ${to}`)
  const route: DistrictId[] = []
  for (let step: DistrictId | null = to; step; step = previous.get(step) ?? null) route.unshift(step)
  return route
}

/** Districts traversés sans arrêt entre le départ et la destination */
export function crossedDistricts(route: readonly DistrictId[]): DistrictId[] {
  return route.slice(1, -1)
}
