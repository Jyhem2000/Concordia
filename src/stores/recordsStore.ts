import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { isDefeat } from '../engine/routine.ts'
import type { FeatId } from '../engine/feats.ts'
import type { Ending, EndingId } from '../engine/types.ts'

type RecordsStore = {
  /** Parties terminées */
  games: number
  /** Fins atteintes : nombre de fois pour chacune (les accomplissements) */
  endings: Partial<Record<EndingId, number>>
  /** Meilleur score d'une partie gagnée ; null avant la première */
  bestScore: number | null
  /** Hauts faits : nombre de parties où chacun a été accompli */
  feats: Partial<Record<FeatId, number>>
  /** Note une partie terminée et ses hauts faits */
  record: (ending: Ending, feats?: readonly FeatId[]) => void
}

/** Carrière du joueur, sauvegardée à part de la partie : elle survit aux nouvelles parties (chap. 7) */
export const useRecordsStore = create<RecordsStore>()(
  persist(
    (set) => ({
      games: 0,
      endings: {},
      bestScore: null,
      feats: {},
      record: ({ id, score }, feats = []) =>
        set((s) => ({
          games: s.games + 1,
          endings: { ...s.endings, [id]: (s.endings[id] ?? 0) + 1 },
          feats: Object.fromEntries([...Object.entries(s.feats), ...feats.map((feat) => [feat, (s.feats[feat] ?? 0) + 1])]),
          // Une défaite ne compte pas pour le meilleur score : elle vaut zéro
          bestScore: isDefeat(id) ? s.bestScore : Math.max(s.bestScore ?? 0, score),
        })),
    }),
    {
      name: 'concordia-records',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      // Version 1 sans hauts faits : la carrière est gardée, les hauts faits partent de zéro
      migrate: (saved) => ({ feats: {}, ...(typeof saved === 'object' ? saved : {}) }),
      partialize: ({ games, endings, bestScore, feats }) => ({ games, endings, bestScore, feats }),
    },
  ),
)
