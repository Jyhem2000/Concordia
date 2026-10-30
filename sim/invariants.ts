import { HEALTH_MAX, ICC_MAX, WANTED } from '../src/data/balance.ts'
import { VEHICLES } from '../src/data/vehicles.ts'
import { cargoUsed } from '../src/engine/cargo.ts'
import type { GameState } from '../src/engine/types.ts'

/*
 * Invariants de la partie (chap. 8) : vérifiés après chaque action simulée. Une violation est un bug du moteur.
 */

/** Liste des invariants violés par un état (vide si tout va bien) */
export function violations(state: GameState): string[] {
  const vehicle = VEHICLES[state.vehicleId]
  const checks: [boolean, string][] = [
    [state.cash >= 0, `Cash-Puce négatif : ${state.cash}`],
    [state.debt >= 0, `dette négative : ${state.debt}`],
    [Number.isInteger(state.cash) && Number.isInteger(state.debt), 'montants non entiers'],
    [state.offshore.deposited >= 0 && state.offshore.interest >= 0, 'compte offshore négatif'],
    [cargoUsed(state.cargo) <= vehicle.cargo, `soute pleine au-delà de sa capacité : ${cargoUsed(state.cargo)}/${vehicle.cargo}`],
    [state.cargo.every((lot) => lot.qty > 0 && Number.isInteger(lot.qty)), 'lot vide ou fractionnaire'],
    [state.icc >= 0 && state.icc <= ICC_MAX, `ICC hors bornes : ${state.icc}`],
    [state.health >= 0 && state.health <= HEALTH_MAX, `Santé hors bornes : ${state.health}`],
    [state.chassis >= 0 && state.chassis <= vehicle.maxChassis, `châssis hors bornes : ${state.chassis}`],
    [state.fuel >= 0 && state.fuel <= vehicle.tank, `réservoir hors bornes : ${state.fuel}`],
    [state.wanted >= 0 && state.wanted <= WANTED.maxLevel, `Fiche S hors bornes : ${state.wanted}`],
    [state.modules.mounted.length <= vehicle.moduleSlots, 'plus de modules montés que de slots'],
    [state.modules.mounted.every((id) => state.modules.owned.includes(id)), 'module monté non possédé'],
    [!(state.interception && state.roadEvent), 'barrage et aléa routier en même temps'],
    [state.day >= 1 && state.day <= 30, `jour hors bornes : ${state.day}`],
    [state.lucidity >= 0, 'Lucidité négative'],
  ]
  return checks.flatMap(([ok, message]) => (ok ? [] : [message]))
}
