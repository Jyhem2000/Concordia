import { DIFFICULTIES } from '../../data/balance.ts'
import { keysOf } from '../../engine/records.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useSettingsStore } from '../../stores/settingsStore.ts'
import { FOCUS_RING } from '../shared/focus.ts'

/**
 * Choix du mode de difficulté de la prochaine partie (chap. 1 et 7) : trois boutons, chacun avec sa description et ses
 * réglages chiffrés ; le choix est retenu dans les réglages du joueur
 */
export default function DifficultyPicker() {
  const selected = useSettingsStore((s) => s.difficulty)
  const setDifficulty = useSettingsStore((s) => s.setDifficulty)
  const { t, credits, change } = useI18n()

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-xs text-ink-muted">
        <span className="font-bold uppercase">{t.difficulty.title}</span> · {t.difficulty.scope}
      </legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {keysOf(DIFFICULTIES).map((id) => {
          const { startDebt, survivalAdvance, fineFactor } = DIFFICULTIES[id]
          const active = id === selected
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => setDifficulty(id)}
              className={`flex flex-col gap-1 rounded-md border p-2 text-left transition-colors ${FOCUS_RING} ${
                active ? 'border-accent bg-accent/10' : 'border-line bg-raised/60 hover:border-line-strong'
              }`}
            >
              <span className={`font-bold uppercase ${active ? 'text-accent' : 'text-ink'}`}>{t.difficulty.modes[id].name}</span>
              <span className="text-xs text-ink-soft">{t.difficulty.modes[id].blurb}</span>
              <span className="text-xs text-ink-muted">
                {t.difficulty.settings(
                  credits(startDebt),
                  survivalAdvance > 0 ? credits(survivalAdvance) : null,
                  fineFactor === 1 ? null : change(fineFactor),
                )}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
