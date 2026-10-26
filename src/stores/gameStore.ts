import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { randomSeed } from '../engine/rng.ts'
import { createInitialState } from '../engine/state.ts'
import type { GameState } from '../engine/types.ts'

type GameStore = {
  /** État de la partie, remplacé en bloc par le moteur à chaque action */
  game: GameState
  newGame: () => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      game: createInitialState(randomSeed()),
      newGame: () => set({ game: createInitialState(randomSeed()) }),
    }),
    {
      name: 'concordia-save',
      storage: createJSONStorage(() => localStorage),
      // Incrémenter à chaque changement de forme de GameState et gérer la migration
      version: 2,
      // Pas de migration avant la première version publique : une sauvegarde obsolète repart de zéro
      migrate: () => ({ game: createInitialState(randomSeed()) }),
      // Seules les données sont sauvegardées, pas les actions
      partialize: ({ game }) => ({ game }),
    },
  ),
)
