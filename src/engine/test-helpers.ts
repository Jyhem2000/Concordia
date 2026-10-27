import { applyAction, type Action, type ActionError } from './actions.ts'
import { createInitialState } from './state.ts'
import type { GameState } from './types.ts'

/*
 * Aides partagées par les tests du moteur. Importées uniquement par les fichiers *.test.ts,
 * elles ne sont jamais embarquées dans le build.
 */

/** Enchaîne des actions qui doivent réussir ; un refus fait échouer le test avec son code d'erreur */
export function run(state: GameState, ...actions: Action[]): GameState {
  return actions.reduce((current, action) => {
    const result = applyAction(current, action)
    if (!result.ok) throw new Error(`${action.type} : ${result.error}`)
    return result.state
  }, state)
}

/** Code d'erreur d'une action refusée, ou null si elle passe */
export function errorOf(state: GameState, action: Action): ActionError | null {
  const result = applyAction(state, action)
  return result.ok ? null : result.error
}

/** Valeur attendue non nulle : échoue explicitement plutôt qu'un `!` qui masquerait l'erreur */
export function defined<T>(value: T | null | undefined, what = 'valeur'): T {
  if (value === null || value === undefined) throw new Error(`${what} attendue, absente`)
  return value
}

/** Partie de référence à graine fixe, modifiable champ par champ pour isoler une règle */
export function gameAt(day: number, patch: Partial<GameState> = {}, seed = 99): GameState {
  return { ...createInitialState(seed), day, ...patch }
}
