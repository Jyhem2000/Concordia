import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { isDefeat } from '../engine/routine.ts'
import type { Ending, EndingId } from '../engine/types.ts'

type RecordsStore = {
  /** Parties terminées */
  games: number
  /** Fins atteintes : nombre de fois pour chacune (les accomplissements) */
  endings: Partial<Record<EndingId, number>>
  /** Meilleur score d'une partie gagnée ; null avant la première */
  bestScore: number | null
  /** Note une partie terminée */
  record: (ending: Ending) => void
}

/** Palmarès du joueur, sauvegardé à part de la partie : il survit aux nouvelles parties (chap. 7) */
export const useRecordsStore = create<RecordsStore>()(
  persist(
    (set) => ({
      games: 0,
      endings: {},
      bestScore: null,
      record: ({ id, score }) =>
        set((s) => ({
          games: s.games + 1,
          endings: { ...s.endings, [id]: (s.endings[id] ?? 0) + 1 },
          // Une défaite ne compte pas pour le meilleur score : elle vaut zéro
          bestScore: isDefeat(id) ? s.bestScore : Math.max(s.bestScore ?? 0, score),
        })),
    }),
    {
      name: 'concordia-records',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: ({ games, endings, bestScore }) => ({ games, endings, bestScore }),
    },
  ),
)
