import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_DIFFICULTY } from '../data/balance.ts'
import type { DifficultyId } from '../engine/types.ts'
import { DEFAULT_LOCALE, type Locale } from '../i18n/index.ts'

type SettingsStore = {
  locale: Locale
  /** Panneaux repliés par le joueur (identifiants des panneaux) */
  collapsed: readonly string[]
  /** Mode de difficulté de la prochaine partie (chap. 1) */
  difficulty: DifficultyId
  setLocale: (locale: Locale) => void
  setDifficulty: (difficulty: DifficultyId) => void
  toggleCollapsed: (id: string) => void
}

/** Réglages du joueur, sauvegardés à part de la partie (survivent à une nouvelle partie) */
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      collapsed: [],
      difficulty: DEFAULT_DIFFICULTY,
      setLocale: (locale) => set({ locale }),
      setDifficulty: (difficulty) => set({ difficulty }),
      toggleCollapsed: (id) =>
        set((s) => ({ collapsed: s.collapsed.includes(id) ? s.collapsed.filter((entry) => entry !== id) : [...s.collapsed, id] })),
    }),
    {
      name: 'concordia-settings',
      storage: createJSONStorage(() => localStorage),
      version: 3,
      // Version 1 : la langue seulement ; version 2 : sans mode de difficulté. Les réglages gardés, le mode par défaut
      migrate: (saved) => ({ locale: DEFAULT_LOCALE, collapsed: [], ...(typeof saved === 'object' ? saved : {}), difficulty: DEFAULT_DIFFICULTY }),
      partialize: ({ locale, collapsed, difficulty }) => ({ locale, collapsed, difficulty }),
    },
  ),
)
