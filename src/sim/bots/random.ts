import { createRng, seedRng } from '../../engine/rng.ts'
import { legalActions } from '../legal.ts'
import type { Bot } from '../runner.ts'

/**
 * Aléatoire (chap. 9) : une action légale au hasard. Ne mesure rien d'équilibre, éprouve la robustesse.
 * Il tire avec son propre générateur, jamais avec celui (caché) de la partie.
 */
export function randomBot(seed: number): Bot {
  const rng = createRng(seedRng(seed))
  return {
    name: 'Aléatoire',
    decide: (view) => {
      const actions = legalActions(view)
      return actions[Math.floor(rng.next() * actions.length)] ?? { type: 'sleep' }
    },
  }
}
