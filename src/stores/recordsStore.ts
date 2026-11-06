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
  /** Parties classées lancées, par jour (AAAA-MM-JJ) : une tentative par jour et par mode (chap. 1) */
  rankedTries: Partial<Record<string, readonly DifficultyId[]>>
  /** Note une partie terminée, son mode et ses hauts faits */
  record: (ending: Ending, difficulty: DifficultyId, feats?: readonly FeatId[]) => void
  /** Note la tentative classée du jour dans ce mode, en oubliant les jours dont le classement est clos */
  markRanked: (day: string, difficulty: DifficultyId, openDays: readonly string[]) => void
}

/** Carrière du joueur, sauvegardée à part de la partie : elle survit aux nouvelles parties (chap. 7) */
export const useRecordsStore = create<RecordsStore>()(
  persist(
    (set) => ({
      games: 0,
      endings: {},
      bestScores: {},
      feats: {},
      rankedTries: {},
      markRanked: (day, difficulty, openDays) =>
        set((s) => ({
          rankedTries: Object.fromEntries([
            ...Object.entries(s.rankedTries).filter(([kept]) => kept !== day && openDays.includes(kept)),
            [day, [...(s.rankedTries[day] ?? []), difficulty]],
          ]),
        })),
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
      version: 4,
      // Version 1 sans hauts faits (partis de zéro) ; avant la version 3, un seul meilleur score, joué en mode Contrebandier ;
      // avant la version 4, aucune partie classée
      migrate: (saved, version) => {
        const old = typeof saved === 'object' && saved !== null ? saved : {}
        if (version >= 3) return { feats: {}, bestScores: {}, ...old, rankedTries: {} }
        const best = 'bestScore' in old && typeof old.bestScore === 'number' ? old.bestScore : null
        return { feats: {}, ...old, bestScores: best === null ? {} : { smuggler: best }, rankedTries: {} }
      },
      partialize: ({ games, endings, bestScores, feats, rankedTries }) => ({ games, endings, bestScores, feats, rankedTries }),
    },
  ),
)
