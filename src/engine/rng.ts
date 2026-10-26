/*
 * Générateur pseudo-aléatoire à graine (mulberry32).
 * Son état tient dans un entier 32 bits stocké dans GameState : une partie est reproductible,
 * un bug se rejoue à l'identique, et recharger une sauvegarde ne relance pas les dés.
 *
 * Usage dans le moteur (fonctions pures) :
 *   const rng = createRng(state.rng)
 *   const noise = rng.float(0.7, 1.3)
 *   return { ...state, rng: rng.state }
 */

export type RngState = number

export type Rng = {
  /** État courant, à réécrire dans GameState après usage */
  readonly state: RngState
  /** Flottant uniforme dans [0, 1[ */
  next(): number
  /** Flottant uniforme dans [min, max[ */
  float(min: number, max: number): number
  /** Entier uniforme dans [min, max], bornes incluses */
  int(min: number, max: number): number
  /** Vrai avec la probabilité p (fraction : 0.25 = 25 %) */
  chance(p: number): boolean
  /** Élément uniforme d'une liste non vide */
  pick<T>(items: readonly T[]): T
  /** Copie mélangée (Fisher-Yates), la liste d'origine n'est pas modifiée */
  shuffle<T>(items: readonly T[]): T[]
}

export function seedRng(seed: number): RngState {
  return seed >>> 0
}

/** Graine d'une nouvelle partie. Seule fonction impure du module : à appeler hors du moteur. */
export function randomSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0]
}

export function createRng(initial: RngState): Rng {
  let state = initial >>> 0

  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296
  }

  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1))

  return {
    get state() {
      return state
    },
    next,
    float: (min, max) => min + next() * (max - min),
    int,
    chance: (p) => next() < p,
    pick: (items) => {
      if (items.length === 0) throw new Error('rng.pick : liste vide')
      return items[int(0, items.length - 1)]
    },
    shuffle: (items) => {
      const copy = [...items]
      for (let i = copy.length - 1; i > 0; i--) {
        const j = int(0, i)
        ;[copy[i], copy[j]] = [copy[j], copy[i]]
      }
      return copy
    },
  }
}
