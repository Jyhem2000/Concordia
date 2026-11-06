import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_DIFFICULTY } from '../data/balance.ts'
import type { DifficultyId } from '../engine/types.ts'
import { detectLocale, type Locale } from '../i18n/index.ts'

type SettingsStore = {
  locale: Locale
  /** Panneaux repliés par le joueur (identifiants des panneaux) */
  collapsed: readonly string[]
  /** Mode de difficulté de la prochaine partie (chap. 1) */
  difficulty: DifficultyId
  /** Pseudo du classement (chap. 1), tel que saisi */
  pseudo: string
  /** Identifiant anonyme du joueur, tiré au hasard une fois : une tentative par jour et par mode côté serveur */
  playerId: string
  setLocale: (locale: Locale) => void
  setDifficulty: (difficulty: DifficultyId) => void
  setPseudo: (pseudo: string) => void
  toggleCollapsed: (id: string) => void
}

/** Langue d'un premier lancement : celle du navigateur si le jeu la parle, sinon l'anglais (chap. 7) */
const firstLocale = (): Locale => detectLocale(typeof navigator === 'undefined' ? [] : navigator.languages)

/** Réglages du joueur, sauvegardés à part de la partie (survivent à une nouvelle partie) */
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      locale: firstLocale(),
      collapsed: [],
      difficulty: DEFAULT_DIFFICULTY,
      pseudo: '',
      playerId: crypto.randomUUID(),
      setLocale: (locale) => set({ locale }),
      setDifficulty: (difficulty) => set({ difficulty }),
      setPseudo: (pseudo) => set({ pseudo }),
      toggleCollapsed: (id) =>
        set((s) => ({ collapsed: s.collapsed.includes(id) ? s.collapsed.filter((entry) => entry !== id) : [...s.collapsed, id] })),
    }),
    {
      name: 'concordia-settings',
      storage: createJSONStorage(() => localStorage),
      version: 4,
      // Version 1 : la langue seulement ; 2 : sans mode de difficulté (mode par défaut) ; 3 : sans pseudo ni identifiant
      // (ceux de l'état initial). Les réglages déjà là sont gardés
      migrate: (saved, version) => ({
        locale: firstLocale(),
        collapsed: [],
        difficulty: DEFAULT_DIFFICULTY,
        pseudo: '',
        playerId: crypto.randomUUID(),
        ...(typeof saved === 'object' ? saved : {}),
        ...(version < 3 ? { difficulty: DEFAULT_DIFFICULTY } : {}),
      }),
      partialize: ({ locale, collapsed, difficulty, pseudo, playerId }) => ({ locale, collapsed, difficulty, pseudo, playerId }),
    },
  ),
)
