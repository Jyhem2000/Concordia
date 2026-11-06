import { Languages } from 'lucide-react'
import { keysOf } from '../../engine/records.ts'
import { LOCALE_NAMES, locales } from '../../i18n/index.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useSettingsStore } from '../../stores/settingsStore.ts'
import { FOCUS_RING } from '../shared/focus.ts'

/** Choix de la langue, en haut de l'accueil (chap. 7) : chaque langue sous son propre nom, retenue dans les réglages */
export default function LanguagePicker() {
  const locale = useSettingsStore((s) => s.locale)
  const setLocale = useSettingsStore((s) => s.setLocale)
  const { t } = useI18n()
  return (
    <div className="flex items-center justify-end gap-1.5" role="group" aria-label={t.language.label}>
      <Languages size={14} aria-hidden="true" className="text-ink-muted" />
      {keysOf(locales).map((id) => (
        <button
          key={id}
          type="button"
          lang={id}
          aria-pressed={id === locale}
          onClick={() => setLocale(id)}
          className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${FOCUS_RING} ${
            id === locale
              ? 'border-accent/60 bg-accent/15 font-bold text-accent'
              : 'border-line text-ink-muted hover:border-line-strong hover:text-ink'
          }`}
        >
          {LOCALE_NAMES[id]}
        </button>
      ))}
    </div>
  )
}
