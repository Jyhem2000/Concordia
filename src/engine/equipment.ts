import { DISTRICTS } from '../data/districts.ts'
import { GARAGE } from '../data/locations.ts'
import { MODULES, VEHICLES } from '../data/vehicles.ts'
import type { ActionError } from './actions.ts'
import { breakdown, type Breakdown } from './breakdown.ts'
import { cargoUsed } from './cargo.ts'
import { activeEffects } from './events.ts'
import { indexed } from './inflation.ts'
import { keysOf } from './records.ts'
import type { CargoLot, GameState, Module, ModuleId, TagId, Vehicle, VehicleId } from './types.ts'

/*
 * Véhicule et modules (chap. 5) : effets du châssis et des modules montés, garage de Mécano-Mitch (chap. 4).
 */

export type EquipmentResult = { ok: true; state: GameState } | { ok: false; error: ActionError }

const fail = (error: ActionError): EquipmentResult => ({ ok: false, error })

export function vehicleOf(state: GameState): Vehicle {
  return VEHICLES[state.vehicleId]
}

/** Effet d'un module monté, ou undefined : seuls les modules montés agissent */
export function mountedEffect<K extends keyof Module>(state: GameState, key: K): Module[K] | undefined {
  for (const id of state.modules.mounted) {
    const value = MODULES[id][key]
    if (value !== undefined) return value
  }
  return undefined
}

/** Module monté qui porte un effet, pour sourcer une ligne de détail */
export function mountedWith(state: GameState, key: keyof Module): ModuleId | undefined {
  return state.modules.mounted.find((id) => MODULES[id][key] !== undefined)
}

/** Facteur des modules sur les effets d'un tag (diffuseur d'odeur, cage de Faraday) */
export function moduleTagFactor(state: GameState, tag: TagId): number {
  return state.modules.mounted.reduce((factor, id) => {
    const effect = MODULES[id].tagFactor
    return effect && effect.tag === tag ? factor * effect.factor : factor
  }, 1)
}

// ─── Éjection (chap. 6) ───

export type EjectMode = 'trapdoor' | 'crusher' | 'manual'

/** La trappe de largage est-elle hors cooldown ? */
export function trapdoorReady(state: GameState): boolean {
  const trapdoor = mountedEffect(state, 'trapdoor')
  return trapdoor !== undefined && (state.trapdoorDay === null || state.day >= state.trapdoorDay + trapdoor.cooldownDays)
}

/** Mode d'éjection retenu, par priorité : trappe, broyeur, manuel ; null si aucun n'est possible ici */
export function ejectMode(state: GameState): EjectMode | null {
  const allowed = DISTRICTS[state.districtId].ejection
  if (allowed.trapdoor && trapdoorReady(state)) return 'trapdoor'
  if (vehicleOf(state).heavy) return 'crusher'
  if (allowed.manual) return 'manual'
  return null
}

// ─── Garage (chap. 4 et 5) ───

/** Prix d'un PV de châssis réparé : indexé, réduit par un événement du district */
export function repairPrice(state: GameState): Breakdown {
  const price = breakdown('rule.repair', indexed('LOC-D4-1', GARAGE.repairPerPv, state.day).total)
  for (const { source, effect } of activeEffects(state, state.districtId)) if (effect.kind === 'repair') price.mul(source, effect.factor)
  return price.round().build()
}

export function missingChassis(state: GameState): number {
  return vehicleOf(state).maxChassis - state.chassis
}

export function checkRepair(state: GameState, pv: number): ActionError | null {
  if (pv > missingChassis(state)) return 'invalid-amount'
  return repairPrice(state).total * pv > state.cash ? 'not-enough-cash' : null
}

export function repair(state: GameState, pv: number): EquipmentResult {
  const error = checkRepair(state, pv)
  if (error) return fail(error)
  return { ok: true, state: { ...state, cash: state.cash - repairPrice(state).total * pv, chassis: state.chassis + pv } }
}

export function checkBuyVehicle(state: GameState, vehicleId: VehicleId): ActionError | null {
  const vehicle = VEHICLES[vehicleId]
  if (vehicleId === state.vehicleId) return 'already-owned'
  if (vehicle.price > state.cash) return 'not-enough-cash'
  if (cargoUsed(state.cargo) > vehicle.cargo) return 'cargo-full'
  return null
}

/** Nouveau châssis : marchandise, carburant (dans la limite du réservoir) et modules repris ; l'ancien est perdu */
export function buyVehicle(state: GameState, vehicleId: VehicleId): EquipmentResult {
  const error = checkBuyVehicle(state, vehicleId)
  if (error) return fail(error)
  const vehicle = VEHICLES[vehicleId]
  return {
    ok: true,
    state: {
      ...state,
      vehicleId,
      cash: state.cash - vehicle.price,
      chassis: vehicle.maxChassis,
      fuel: Math.min(vehicle.tank, state.fuel),
      // Moins de slots : les derniers modules montés sont démontés
      modules: { ...state.modules, mounted: state.modules.mounted.slice(0, vehicle.moduleSlots) },
    },
  }
}

export function checkBuyModule(state: GameState, moduleId: ModuleId): ActionError | null {
  if (state.modules.owned.includes(moduleId)) return 'already-owned'
  return MODULES[moduleId].price > state.cash ? 'not-enough-cash' : null
}

/** Module acheté pour de bon, monté aussitôt s'il reste un slot */
export function buyModule(state: GameState, moduleId: ModuleId): EquipmentResult {
  const error = checkBuyModule(state, moduleId)
  if (error) return fail(error)
  const { owned, mounted } = state.modules
  const free = mounted.length < vehicleOf(state).moduleSlots
  return {
    ok: true,
    state: {
      ...state,
      cash: state.cash - MODULES[moduleId].price,
      modules: { owned: [...owned, moduleId], mounted: free ? [...mounted, moduleId] : mounted },
    },
  }
}

export function checkMount(state: GameState, moduleId: ModuleId, mount: boolean): ActionError | null {
  const { owned, mounted } = state.modules
  if (!owned.includes(moduleId)) return 'not-owned'
  if (mount && mounted.includes(moduleId)) return 'already-owned'
  if (mount && mounted.length >= vehicleOf(state).moduleSlots) return 'no-free-slot'
  if (!mount && !mounted.includes(moduleId)) return 'not-owned'
  return null
}

export function mountModule(state: GameState, moduleId: ModuleId, mount: boolean): EquipmentResult {
  const error = checkMount(state, moduleId, mount)
  if (error) return fail(error)
  const mounted = mount ? [...state.modules.mounted, moduleId] : state.modules.mounted.filter((id) => id !== moduleId)
  return { ok: true, state: { ...state, modules: { ...state.modules, mounted } } }
}

export const VEHICLE_IDS = keysOf(VEHICLES)
export const MODULE_IDS = keysOf(MODULES)

/** Caisses rapportées par les complices de la trappe : une part tirée au hasard, dans la limite de la place */
export function recoverDumped(state: GameState, share: number): { cargo: CargoLot[]; back: number; lost: number } {
  const total = state.dumped.reduce((sum, lot) => sum + lot.qty, 0)
  const room = Math.max(0, vehicleOf(state).cargo - cargoUsed(state.cargo))
  let left = Math.min(room, Math.floor(total * share))
  const back = left
  const cargo: CargoLot[] = [...state.cargo]
  for (const lot of state.dumped) {
    if (left === 0) break
    const qty = Math.min(lot.qty, left)
    left -= qty
    cargo.push({ ...lot, qty })
  }
  return { cargo, back, lost: total - back }
}
