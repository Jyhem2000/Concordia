import { applyAction, type Action, type ActionError } from './actions.ts'
import { createRng, seedRng, type RngState } from './rng.ts'
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

/** Premier état du générateur dont le prochain tirage satisfait `accept` */
function findRng(accept: (draw: number) => boolean): RngState {
  for (let seed = 1; ; seed++) {
    if (accept(createRng(seedRng(seed)).next())) return seedRng(seed)
  }
}

/*
 * Un jet réussit quand le tirage est sous la probabilité (`rng.chance`). Les risques et les chances
 * étant bornés (au moins 5 %, au plus 95 %), ces deux graines fixent l'issue du prochain jet :
 */

/** Carnet où tout est débloqué : équipiers, mission de nuit, rayons du garage, services réservés (chap. 1, 3 et 4) */
export const EARNED: GameState['progress'] = {
  controlsPassed: 1,
  tagSales: { 'TAG-GOURMET': 10, 'TAG-CHEMICAL': 10 },
  flagged: true,
  deliveries: 3,
  vipOrders: 0,
  injections: 0,
  compartmentHeld: 1,
}

/** Tirage haut : aucun barrage au prochain trajet, échec de la prochaine option tentée */
export const HIGH_ROLL_RNG = findRng((draw) => draw >= 0.99)

/** Tirage bas : barrage assuré au prochain trajet, succès de la prochaine option tentée */
export const LOW_ROLL_RNG = findRng((draw) => draw < 0.01)

/** Enchaîne des actions en acceptant la fouille à chaque barrage, et la première option possible à chaque aléa routier */
export function play(state: GameState, ...actions: Action[]): GameState {
  return actions.reduce((current, action) => {
    const next = run(current, action)
    const searched = next.interception ? run(next, { type: 'intercept', move: 'search' }) : next
    return searched.roadEvent ? settleRoad(searched) : searched
  }, state)
}

const ROAD_TRIES: readonly Action[] = [
  { type: 'road', choice: 'a', pay: 0 },
  { type: 'road', choice: 'a', pay: 1 },
  { type: 'road', choice: 'b', pay: 0 },
]

/** Règle un aléa routier par la première option possible */
export function settleRoad(state: GameState): GameState {
  const action = defined(
    ROAD_TRIES.find((tried) => errorOf(state, tried) === null),
    'option d’aléa possible',
  )
  return run(state, action)
}
