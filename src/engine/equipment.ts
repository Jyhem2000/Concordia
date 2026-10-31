import { DISTRICTS } from '../data/districts.ts'
import { GARAGE } from '../data/locations.ts'
import { MODULES, VEHICLES } from '../data/vehicles.ts'
import { meets } from './progress.ts'
import type { ActionError } from './actions.ts'
import { breakdown, type Breakdown } from './breakdown.ts'
import { cargoUsed } from './cargo.ts'
import { activeEffects } from './events.ts'
import { keysOf } from './records.ts'
import type { CargoLot, GameState, Module, ModuleId, TagId, Vehicle, VehicleId } from './types.ts'

/*
 * Véhicule et modules (chap. 4) : effets du châssis et des modules montés, garage de Mécano-Mitch (chap. 3).
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

// ─── Éjection (chap. 5) ───

export type EjectMode = 'trapdoor' | 'crusher' | 'manual'

/** Jour où la trappe de largage montée sera rechargée, ou null si elle l'est déjà (ou n'est pas montée) */
export function trapdoorReadyDay(state: GameState): number | null {
  const trapdoor = mountedEffect(state, 'trapdoor')
  if (trapdoor === undefined || state.trapdoorDay === null) return null
  const ready = state.trapdoorDay + trapdoor.cooldownDays
  return state.day < ready ? ready : null
}

/** La trappe de largage est-elle hors cooldown ? */
export function trapdoorReady(state: GameState): boolean {
  return mountedEffect(state, 'trapdoor') !== undefined && trapdoorReadyDay(state) === null
}

/** Mode d'éjection retenu, par priorité : trappe, broyeur, manuel ; null si aucun n'est possible ici */
export function ejectMode(state: GameState): EjectMode | null {
  const allowed = DISTRICTS[state.districtId].ejection
  if (allowed.trapdoor && trapdoorReady(state)) return 'trapdoor'
  if (vehicleOf(state).heavy) return 'crusher'
  if (allowed.manual) return 'manual'
  return null
}

// ─── Garage (chap. 3 et 4) ───

/** Prix d'un PV de châssis réparé, réduit par un événement du district */
export function repairPrice(state: GameState): Breakdown {
  const price = breakdown('rule.repair', GARAGE.repairPerPv)
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

/** Prix d'adaptation d'un module mécanique à un nouveau châssis (chap. 4) ; 0 pour les autres */
export function refitPrice(moduleId: ModuleId): number {
  const { fitting, price } = MODULES[moduleId]
  return fitting === 'adaptable' ? Math.round(price * GARAGE.refitShare) : 0
}

/** Au changement de châssis : modules qui suivent (électronique, mécanique adaptée), soudés perdus, prix des adaptations */
export function vehicleSwap(state: GameState): { kept: ModuleId[]; lost: ModuleId[]; refit: number } {
  const { owned } = state.modules
  return {
    kept: owned.filter((id) => MODULES[id].fitting !== 'welded'),
    lost: owned.filter((id) => MODULES[id].fitting === 'welded'),
    refit: owned.reduce((total, id) => total + refitPrice(id), 0),
  }
}

/** Prix total d'un nouveau châssis : le véhicule, plus l'adaptation des modules mécaniques possédés */
export function vehicleTotal(state: GameState, vehicleId: VehicleId): number {
  return VEHICLES[vehicleId].price + vehicleSwap(state).refit
}

export function checkBuyVehicle(state: GameState, vehicleId: VehicleId): ActionError | null {
  const vehicle = VEHICLES[vehicleId]
  if (vehicleId === state.vehicleId) return 'already-owned'
  if (!meets(state, vehicle.requires)) return 'locked'
  if (vehicleTotal(state, vehicleId) > state.cash) return 'not-enough-cash'
  if (cargoUsed(state.cargo) > vehicle.cargo) return 'cargo-full'
  return null
}

/**
 * Nouveau châssis : marchandise, carburant (dans la limite du réservoir) et modules repris, sauf les modules soudés,
 * perdus avec l'ancien ; les modules mécaniques sont adaptés (payants). L'ancien châssis est perdu.
 */
export function buyVehicle(state: GameState, vehicleId: VehicleId): EquipmentResult {
  const error = checkBuyVehicle(state, vehicleId)
  if (error) return fail(error)
  const vehicle = VEHICLES[vehicleId]
  const { kept } = vehicleSwap(state)
  return {
    ok: true,
    state: {
      ...state,
      vehicleId,
      cash: state.cash - vehicleTotal(state, vehicleId),
      chassis: vehicle.maxChassis,
      fuel: Math.min(vehicle.tank, state.fuel),
      // Moins de slots : les derniers modules montés sont démontés
      modules: { owned: kept, mounted: state.modules.mounted.filter((id) => kept.includes(id)).slice(0, vehicle.moduleSlots) },
    },
  }
}

export function checkBuyModule(state: GameState, moduleId: ModuleId): ActionError | null {
  if (state.modules.owned.includes(moduleId)) return 'already-owned'
  if (!meets(state, MODULES[moduleId].requires)) return 'locked'
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
