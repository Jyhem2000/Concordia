import { featsOf } from '../engine/feats.ts'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { openDays } from '../../server/runs.ts'
import { applyAction, type Action, type ActionError } from '../engine/actions.ts'
import { dailySeed, utcDay } from '../engine/ranked.ts'
import { randomSeed } from '../engine/rng.ts'
import { createInitialState } from '../engine/state.ts'
import { sendRun } from '../net/leaderboard.ts'
import { useRecordsStore } from './recordsStore.ts'
import { LOCAL_BUILD, RULES_VERSION } from './rulesVersion.ts'
import { useSettingsStore } from './settingsStore.ts'
import type { DifficultyId, GameState } from '../engine/types.ts'

/** Partie classée en cours (chap. 1) : son jour, sa graine et la version des règles avec laquelle elle a commencé */
export type RankedRun = { day: string; seed: number; rulesVersion: string }

/**
 * Envoi d'une partie classée finie : pas encore, en cours, reçue (en attente de vérification), déjà reçue pour ce jour
 * et ce mode, refusée (classement clos, pseudo), ou échouée (réseau)
 */
export type Submission = 'idle' | 'sending' | 'sent' | 'duplicate' | 'refused' | 'failed'

/** Ce qui empêche une partie classée de concourir : jouée avec d'autres règles, ou sur un build sans serveur */
export type RankedBlock = 'stale' | 'local' | null

type GameStore = {
  /** État de la partie, remplacé en bloc par le moteur à chaque action */
  game: GameState
  /** Partie classée, ou null pour une partie libre */
  ranked: RankedRun | null
  /** Actions acceptées d'une partie classée, dans l'ordre : de quoi la rejouer (chap. 1) */
  actions: readonly Action[]
  submission: Submission
  /** Erreur de la dernière action refusée, effacée à la suivante */
  lastError: ActionError | null
  dispatch: (action: Action) => void
  /** Nouvelle partie libre dans ce mode de difficulté (chap. 1) */
  newGame: (difficulty: DifficultyId) => void
  /** Partie classée du jour dans ce mode : la tentative du jour est notée dès le lancement */
  newRankedGame: (difficulty: DifficultyId) => void
  /** Envoie la partie classée finie, sauf si elle ne peut pas concourir */
  submit: () => Promise<void>
}

/** Version de la sauvegarde ; la première version publique est la référence des migrations (README) */
export const SAVE_VERSION = 36
export const PUBLIC_SAVE_VERSION = 36

/** Pourquoi une partie classée ne concourt pas, ou null si elle peut s'envoyer */
export function rankedBlock(ranked: RankedRun): RankedBlock {
  if (ranked.rulesVersion !== RULES_VERSION) return 'stale'
  return LOCAL_BUILD ? 'local' : null
}

/** La partie, son statut classé et ses actions sont sauvegardés ; un envoi interrompu se refera à la main */
export function savedPart({ game, ranked, actions, submission }: GameStore): Pick<GameStore, 'game' | 'ranked' | 'actions' | 'submission'> {
  return { game, ranked, actions, submission: submission === 'sending' ? 'failed' : submission }
}

/**
 * Migration d'une sauvegarde d'une version antérieure. Première version publique : une sauvegarde plus ancienne repart
 * de zéro. Les versions suivantes ajouteront ici leur migration, de PUBLIC_SAVE_VERSION à SAVE_VERSION
 */
export function migrateSave(): Pick<GameStore, 'game' | 'ranked' | 'actions' | 'submission'> {
  return freeGame()
}

function freeGame(difficulty?: DifficultyId): Pick<GameStore, 'game' | 'ranked' | 'actions' | 'submission'> {
  return { game: createInitialState(randomSeed(), difficulty), ranked: null, actions: [], submission: 'idle' }
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...freeGame(),
      lastError: null,
      dispatch: (action) => {
        const { game, ranked, actions } = get()
        const result = applyAction(game, action)
        if (!result.ok) return set({ lastError: result.error })
        // Une partie qui s'achève entre à la carrière, une seule fois, avec ses hauts faits
        const ending = game.ending ? null : result.state.ending
        if (ending) useRecordsStore.getState().record(ending, result.state.difficulty, featsOf(result.state))
        set({ game: result.state, lastError: null, actions: ranked ? [...actions, action] : actions })
        // Fin d'une partie classée : envoi au classement
        if (ending && ranked) void get().submit()
      },
      newGame: (difficulty) => set({ ...freeGame(difficulty), lastError: null }),
      newRankedGame: (difficulty) => {
        const now = new Date()
        const day = utcDay(now)
        const seed = dailySeed(day)
        useRecordsStore.getState().markRanked(day, difficulty, openDays(now))
        set({
          game: createInitialState(seed, difficulty),
          ranked: { day, seed, rulesVersion: RULES_VERSION },
          actions: [],
          submission: 'idle',
          lastError: null,
        })
      },
      submit: async () => {
        const { game, ranked, actions, submission } = get()
        if (!ranked || game.status !== 'finished' || rankedBlock(ranked) !== null) return
        if (submission === 'sending' || submission === 'sent' || submission === 'duplicate') return
        const { playerId, pseudo } = useSettingsStore.getState()
        set({ submission: 'sending' })
        const outcome = await sendRun({ playerId, pseudo, day: ranked.day, difficulty: game.difficulty, rulesVersion: ranked.rulesVersion, actions })
        set({ submission: outcome })
      },
    }),
    {
      name: 'concordia-save',
      storage: createJSONStorage(() => localStorage),
      // Incrémenter à chaque changement de forme de l'état sauvegardé, et ajouter sa migration (README, Sauvegardes migrées)
      version: SAVE_VERSION,
      migrate: migrateSave,
      partialize: savedPart,
    },
  ),
)
