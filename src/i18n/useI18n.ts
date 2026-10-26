import { useSettingsStore } from '../stores/settingsStore.ts'
import { getI18n, type I18n } from './index.ts'

/** Textes et formateurs dans la langue choisie par le joueur */
export function useI18n(): I18n {
  const locale = useSettingsStore((s) => s.locale)
  return getI18n(locale)
}
