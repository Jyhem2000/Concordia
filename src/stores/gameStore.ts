import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type GameState = {
  day: number
}

type GameActions = {
  reset: () => void
}

const initialState: GameState = {
  day: 1,
}

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set) => ({
      ...initialState,
      reset: () => set(initialState),
    }),
    {
      name: 'concordia-save',
      storage: createJSONStorage(() => localStorage),
      // Incrémenter à chaque changement de forme de GameState et gérer la migration
      version: 1,
      // Seules les données sont sauvegardées, pas les actions
      partialize: ({ day }) => ({ day }),
    },
  ),
)
