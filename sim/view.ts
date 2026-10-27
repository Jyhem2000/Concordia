import { DISTRICT_IDS } from '../src/data/districts.ts'
import { PRODUCT_IDS } from '../src/data/products.ts'
import { crewEffect } from '../src/engine/crew.ts'
import { recordOf } from '../src/engine/records.ts'
import type { DistrictMarket, GameState } from '../src/engine/types.ts'

/*
 * Information honnête (chap. 9) : ce que voit le joueur. Les bots décident sur cette vue, où l'état caché
 * est neutralisé ; un test vérifie qu'ils décident pareil sur l'état complet.
 */

/** Marché neutre : ce que le joueur ignore d'un district où il n'est pas */
const UNKNOWN_MARKET: DistrictMarket = { noise: recordOf(PRODUCT_IDS, () => 1), stock: {}, demand: {} }

/** Vue publique : générateur, ronde renforcée (sauf Vance), événement de demain et marchés lointains neutralisés */
export function publicView(state: GameState): GameState {
  const patrolRevealed = Boolean(crewEffect(state, 'revealsPatrol'))
  return {
    ...state,
    rng: 0,
    patrolDistrict: patrolRevealed ? state.patrolDistrict : null,
    events: { ...state.events, tomorrow: null },
    markets: recordOf(DISTRICT_IDS, (id) => (id === state.districtId ? state.markets[id] : UNKNOWN_MARKET)),
  }
}
