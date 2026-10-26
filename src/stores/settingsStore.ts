import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_LOCALE, type Locale } from '../i18n/index.ts'

type SettingsStore = {
  locale: Locale
  setLocale: (locale: Locale) => void
}

/** Réglages du joueur, sauvegardés à part de la partie (survivent à une nouvelle partie) */
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'concordia-settings',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: ({ locale }) => ({ locale }),
    },
  ),
)
