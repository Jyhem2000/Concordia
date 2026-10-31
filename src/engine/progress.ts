import { DSC_TRUST, ICC_TIERS, WANTED } from '../data/balance.ts'
import { PRODUCTS } from '../data/products.ts'
import { CREW } from '../data/vehicles.ts'
import type { ActionError } from './actions.ts'
import { scoreOf } from './finance.ts'
import type { CrewId, GameState, ProductId, Requirement } from './types.ts'

/*
 * Progression (chap. 1, 3 et 4) : le carnet des actes du joueur, qui débloque les équipiers, la mission de nuit,
 * le garage en rayons et les services réservés, et fait monter la confiance du DSC. Chaque verrou rend sa condition et la progression vers elle.
 */

/** Progression vers un déblocage : acquis, et où en est le joueur */
export type Unlock = { unlocked: boolean; done: number; needed: number }

/** Progression vers une condition (chap. 1, 3 et 4) */
export function requirementProgress(state: GameState, requirement: Requirement): Unlock {
  const { controlsPassed, tagSales, flagged, deliveries, compartmentHeld } = state.progress
  const count = (done: number, needed: number): Unlock => ({ unlocked: done >= needed, done: Math.min(done, needed), needed })
  switch (requirement.kind) {
    case 'debtPaid':
      return count(state.initialDebtPaid ? 1 : 0, 1)
    case 'deliveries':
      return count(deliveries, requirement.count)
    case 'wanted':
      return count(flagged ? 1 : 0, 1)
    case 'iccTier': {
      const min = ICC_TIERS.find((entry) => entry.tier === requirement.tier)?.min ?? 0
      return { unlocked: state.icc >= min, done: Math.round(state.icc), needed: min }
    }
    case 'wealth': {
      const wealth = state.cash + scoreOf(state)
      return { unlocked: wealth >= requirement.amount, done: Math.round(wealth), needed: requirement.amount }
    }
    case 'tagSales':
      return count(tagSales[requirement.tag] ?? 0, requirement.count)
    case 'controls':
      return count(controlsPassed, requirement.count)
    case 'compartmentHeld':
      return count(compartmentHeld, requirement.count)
  }
}

/** Toutes les conditions remplies (aucune condition : ouvert) */
export function meets(state: GameState, requirements: readonly Requirement[] = []): boolean {
  return requirements.every((requirement) => requirementProgress(state, requirement).unlocked)
}

/** Refus d'un élément pas encore débloqué */
export function checkRequirements(state: GameState, requirements?: readonly Requirement[]): ActionError | null {
  return meets(state, requirements) ? null : 'locked'
}

/** Un équipier se présente après l'acte qui le fait remarquer (contrôle franchi, ventes, Fiche S) */
export function crewUnlocked(state: GameState, crewId: CrewId): boolean {
  return meets(state, CREW[crewId].requires)
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
  // Un nouvel écart : le compte des jours sans écart repart de zéro
  return { ...state, wanted, wantedSince: state.day, progress: { ...state.progress, flagged: true } }
}
