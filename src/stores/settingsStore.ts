import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_LOCALE, type Locale } from '../i18n/index.ts'

type SettingsStore = {
  locale: Locale
  /** Panneaux repliés par le joueur (identifiants des panneaux) */
  collapsed: readonly string[]
  setLocale: (locale: Locale) => void
  toggleCollapsed: (id: string) => void
}

/** Réglages du joueur, sauvegardés à part de la partie (survivent à une nouvelle partie) */
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      collapsed: [],
      setLocale: (locale) => set({ locale }),
      toggleCollapsed: (id) =>
        set((s) => ({ collapsed: s.collapsed.includes(id) ? s.collapsed.filter((entry) => entry !== id) : [...s.collapsed, id] })),
    }),
    {
      name: 'concordia-settings',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      // Version 1 : la langue seulement (le français, seule langue pour l'instant) ; aucun panneau replié
      migrate: () => ({ locale: DEFAULT_LOCALE, collapsed: [] }),
      partialize: ({ locale, collapsed }) => ({ locale, collapsed }),
    },
  ),
)
