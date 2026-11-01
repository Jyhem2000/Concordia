import { LOCATIONS } from '../data/locations.ts'
import { PRODUCT_IDS, PRODUCTS } from '../data/products.ts'
import { CREW, CREW_HIRE_FEE } from '../data/vehicles.ts'
import type { ActionError } from './actions.ts'
import { giveCrates, ownedQty } from './cargo.ts'
import { crewUnlocked } from './progress.ts'
import { keysOf } from './records.ts'
import type { Crew, CrewId, DistrictId, GameState, ProductId } from './types.ts'

/*
 * Équipage (chap. 4) : recrutement au Quai 9, salaires payés d'avance, bonus des équipiers qui travaillent ;
 * présence à la Cantine des Chauffeurs (chap. 3).
 */

export type CrewResult = { ok: true; state: GameState } | { ok: false; error: ActionError }

export const CREW_IDS = keysOf(CREW)

/** Bonus d'un équipier : seulement s'il est actif et payé aujourd'hui (il travaille) */
export function crewEffect<K extends keyof Crew>(state: GameState, key: K): Crew[K] | undefined {
  const { active, paidDay } = state.crew
  if (!active || paidDay !== state.day) return undefined
  return CREW[active][key]
}

/** Équipier qui travaille aujourd'hui, pour sourcer une ligne de détail */
export function workingCrew(state: GameState): CrewId | null {
  const { active, paidDay } = state.crew
  return active && paidDay === state.day ? active : null
}

/** Salaire du jour d'un équipier : son tarif, ou le tarif réduit s'il consomme une caisse */
export function salary(crewId: CrewId, amount = CREW[crewId].dailySalary): number {
  return amount
}

/** Frais de recrutement : gratuit la première fois, et après une disparition à la Loterie */
export function hireFee(state: GameState): number {
  return state.crew.hires === 0 || state.crew.freeHire ? 0 : CREW_HIRE_FEE
}

export function checkHire(state: GameState, crewId: CrewId): ActionError | null {
  if (state.crew.lost.includes(crewId)) return 'crew-lost'
  if (!crewUnlocked(state, crewId)) return 'locked'
  if (state.crew.active === crewId) return 'already-owned'
  return hireFee(state) + salary(crewId) > state.cash ? 'not-enough-cash' : null
}

/** Recrutement : frais, puis salaire du jour payé d'avance ; remplace l'équipier actif */
export function hire(state: GameState, crewId: CrewId): CrewResult {
  const error = checkHire(state, crewId)
  if (error) return { ok: false, error }
  return {
    ok: true,
    state: {
      ...state,
      cash: state.cash - hireFee(state) - salary(crewId),
      crew: { ...state.crew, active: crewId, paidDay: state.day, hires: state.crew.hires + 1, freeHire: false },
    },
  }
}

export function dismiss(state: GameState): CrewResult {
  if (!state.crew.active) return { ok: false, error: 'no-crew' }
  return { ok: true, state: { ...state, crew: { ...state.crew, active: null, paidDay: null } } }
}

/** Caisse que Vance consommerait à 06h00 pour un salaire réduit : la moins chère des produits éligibles */
export function inKindCrate(state: GameState): ProductId | null {
  const active = state.crew.active
  const inKind = active ? CREW[active].inKindSalary : undefined
  if (!inKind) return null
  const eligible = PRODUCT_IDS.filter(
    (id) => PRODUCTS[id].tier >= inKind.minTier && PRODUCTS[id].tags.includes(inKind.tag) && ownedQty(state.cargo, id) > 0,
  )
  return eligible.reduce<ProductId | null>((best, id) => (best === null || PRODUCTS[id].basePrice < PRODUCTS[best].basePrice ? id : best), null)
}

/**
 * Salaire du matin (routine, étape 2), payé d'avance : rien en cellule (l'équipier reste à son poste),
 * sinon une caisse consommée pour un salaire réduit si le joueur l'a permis, puis le Cash-Puce.
 */
export function payCrew(state: GameState, inCell: boolean): { state: GameState; paid: number | null; crate: ProductId | null } {
  const active = state.crew.active
  if (!active) return { state, paid: null, crate: null }
  if (inCell) return { state: { ...state, crew: { ...state.crew, paidDay: state.day } }, paid: 0, crate: null }

  const inKind = CREW[active].inKindSalary
  const crate = state.crew.payInKind && inKind ? inKindCrate(state) : null
  const due = salary(active, crate && inKind ? inKind.amount : undefined)
  if (due > state.cash) return { state, paid: null, crate: null }
  const cargo = crate ? giveCrates(state.cargo, [{ productId: crate, qty: 1 }]) : state.cargo
  return { state: { ...state, cash: state.cash - due, cargo, crew: { ...state.crew, paidDay: state.day } }, paid: due, crate }
}

// ─── Cantine des Chauffeurs (chap. 3) ───

/** District de la Cantine des Chauffeurs */
export const cantineDistrict = (): DistrictId => LOCATIONS['LOC-D1-2'].district

/** De jour, au district de la Cantine : Synthanol au tarif syndical, plat du routier */
export function atCantine(state: GameState): boolean {
  return state.districtId === cantineDistrict() && state.phase === 'day' && !state.dayOver
}
