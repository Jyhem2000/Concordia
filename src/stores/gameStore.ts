import { featsOf } from '../engine/feats.ts'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { applyAction, type Action, type ActionError } from '../engine/actions.ts'
import { randomSeed } from '../engine/rng.ts'
import { createInitialState } from '../engine/state.ts'
import { useRecordsStore } from './recordsStore.ts'
import type { GameState } from '../engine/types.ts'

type GameStore = {
  /** État de la partie, remplacé en bloc par le moteur à chaque action */
  game: GameState
  /** Erreur de la dernière action refusée, effacée à la suivante */
  lastError: ActionError | null
  dispatch: (action: Action) => void
  newGame: () => void
}

/** Seule la partie est sauvegardée, pas les actions ni l'erreur affichée */
export function savedPart({ game }: GameStore): Pick<GameStore, 'game'> {
  return { game }
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      game: createInitialState(randomSeed()),
      lastError: null,
      dispatch: (action) => {
        const result = applyAction(get().game, action)
        if (!result.ok) return set({ lastError: result.error })
        // Une partie qui s'achève entre à la carrière, une seule fois, avec ses hauts faits
        if (result.state.ending && !get().game.ending) useRecordsStore.getState().record(result.state.ending, featsOf(result.state))
        set({ game: result.state, lastError: null })
      },
      newGame: () => set({ game: createInitialState(randomSeed()), lastError: null }),
    }),
    {
      name: 'concordia-save',
      storage: createJSONStorage(() => localStorage),
      // Incrémenter à chaque changement de forme de GameState et gérer la migration
      version: 32,
      // Pas de migration avant la première version publique : une sauvegarde obsolète repart de zéro
      migrate: () => ({ game: createInitialState(randomSeed()) }),
      partialize: savedPart,
    },
  ),
)
