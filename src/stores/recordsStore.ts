import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { isDefeat } from '../engine/routine.ts'
import type { FeatId } from '../engine/feats.ts'
import type { DifficultyId, Ending, EndingId } from '../engine/types.ts'

type RecordsStore = {
  /** Parties terminées */
  games: number
  /** Fins atteintes : nombre de fois pour chacune (les accomplissements) */
  endings: Partial<Record<EndingId, number>>
  /** Meilleur score d'une partie gagnée, par mode de difficulté (chap. 1) */
  bestScores: Partial<Record<DifficultyId, number>>
  /** Hauts faits : nombre de parties où chacun a été accompli */
  feats: Partial<Record<FeatId, number>>
  /** Note une partie terminée, son mode et ses hauts faits */
  record: (ending: Ending, difficulty: DifficultyId, feats?: readonly FeatId[]) => void
}

/** Carrière du joueur, sauvegardée à part de la partie : elle survit aux nouvelles parties (chap. 7) */
export const useRecordsStore = create<RecordsStore>()(
  persist(
    (set) => ({
      games: 0,
      endings: {},
      bestScores: {},
      feats: {},
      record: ({ id, score }, difficulty, feats = []) =>
        set((s) => ({
          games: s.games + 1,
          endings: { ...s.endings, [id]: (s.endings[id] ?? 0) + 1 },
          feats: Object.fromEntries([...Object.entries(s.feats), ...feats.map((feat) => [feat, (s.feats[feat] ?? 0) + 1])]),
          // Une défaite ne compte pas pour le meilleur score : elle vaut zéro
          bestScores: isDefeat(id) ? s.bestScores : { ...s.bestScores, [difficulty]: Math.max(s.bestScores[difficulty] ?? 0, score) },
        })),
    }),
    {
      name: 'concordia-records',
      storage: createJSONStorage(() => localStorage),
      version: 3,
      // Version 1 sans hauts faits (partis de zéro) ; avant la version 3, un seul meilleur score, joué en mode Contrebandier
      migrate: (saved) => {
        const old = typeof saved === 'object' && saved !== null ? saved : {}
        const best = 'bestScore' in old && typeof old.bestScore === 'number' ? old.bestScore : null
        return { feats: {}, ...old, bestScores: best === null ? {} : { smuggler: best } }
      },
      partialize: ({ games, endings, bestScores, feats }) => ({ games, endings, bestScores, feats }),
    },
  ),
)
