import { Tv } from 'lucide-react'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import { tickerSlot } from './tickerSlot.ts'

/** Téléscripteur d'Aeterna (chap. 7) : message du jour */
export default function Ticker() {
  const day = useGameStore((s) => s.game.day)
  const phase = useGameStore((s) => s.game.phase)
  const { t } = useI18n()
  // Un message par demi-journée, d'un thème à l'autre
  const message = t.ticker.messages[tickerSlot(day, phase, t.ticker.messages.length)]

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line px-4 py-1 text-xs text-ink-soft">
      <span className="flex items-center gap-1.5 font-bold text-accent uppercase">
        <Tv size={12} aria-hidden="true" />
        {t.ticker.label}
      </span>
      <span className="text-ink-muted italic">{message}</span>
    </div>
  )
}
