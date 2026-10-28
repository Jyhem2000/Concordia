import { DSC_TRUST, WANTED } from '../data/balance.ts'
import { PRODUCTS } from '../data/products.ts'
import { CREW } from '../data/vehicles.ts'
import type { CrewId, GameState, ProductId } from './types.ts'

/*
 * Progression (chap. 2 et 5) : le carnet des actes du joueur, qui débloque les équipiers, la mission de nuit,
 * et fait monter la confiance du DSC. Chaque verrou rend sa condition et la progression vers elle.
 */

/** Progression vers un déblocage : acquis, et où en est le joueur */
export type Unlock = { unlocked: boolean; done: number; needed: number }

/** Un équipier se présente après l'acte qui le fait remarquer (contrôle franchi, ventes, Fiche S) */
export function crewUnlock(state: GameState, crewId: CrewId): Unlock {
  const unlock = CREW[crewId].unlock
  const { controlsPassed, tagSales, flagged } = state.progress
  switch (unlock.kind) {
    case 'controls':
      return { unlocked: controlsPassed >= unlock.count, done: Math.min(controlsPassed, unlock.count), needed: unlock.count }
    case 'sales': {
      const sold = tagSales[unlock.tag] ?? 0
      return { unlocked: sold >= unlock.count, done: Math.min(sold, unlock.count), needed: unlock.count }
    }
    case 'wanted':
      return { unlocked: flagged, done: flagged ? 1 : 0, needed: 1 }
  }
}

/** La plateforme ne confie la nuit qu'après quelques commandes livrées */
export function nightUnlock(state: GameState): Unlock {
  const done = state.progress.deliveries
  return {
    unlocked: done >= DSC_TRUST.nightAfterDeliveries,
    done: Math.min(done, DSC_TRUST.nightAfterDeliveries),
    needed: DSC_TRUST.nightAfterDeliveries,
  }
}

/** Multiplicateur de prime des commandes du DSC selon les commandes déjà livrées */
export function trustFactor(state: GameState): number {
  return 1 + Math.min(DSC_TRUST.maxBonus, DSC_TRUST.feeBonusPerDelivery * state.progress.deliveries)
}

/** Vente notée au carnet, par tag (déblocages par ventes) */
export function noteSale(state: GameState, productId: ProductId, qty: number): GameState {
  const tagSales = { ...state.progress.tagSales }
  for (const tag of PRODUCTS[productId].tags) tagSales[tag] = (tagSales[tag] ?? 0) + qty
  return { ...state, progress: { ...state.progress, tagSales } }
}

/** Contrôle de la BRC franchi sans garde à vue */
export function noteControlPassed(state: GameState): GameState {
  return { ...state, progress: { ...state.progress, controlsPassed: state.progress.controlsPassed + 1 } }
}

/** Commande du DSC livrée (jour ou nuit) : la confiance monte */
export function noteDelivery(state: GameState): GameState {
  return { ...state, progress: { ...state.progress, deliveries: state.progress.deliveries + 1 } }
}

/** Un niveau de Fiche S de plus (fuite, écart de nuit, faux dossier raté) : le nom du joueur entre dans les fichiers */
export function raiseWanted(state: GameState): GameState {
  const wanted = Math.min(WANTED.maxLevel, state.wanted + WANTED.perOffense)
  return { ...state, wanted, progress: { ...state.progress, flagged: true } }
}
