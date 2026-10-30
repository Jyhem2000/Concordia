import { Tv } from 'lucide-react'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import { tickerSlot } from '../hud/tickerSlot.ts'

/** Téléscripteur d'Aeterna (chap. 7) : le message de la demi-journée, en bandeau défilant (fixe si l'OS réduit les animations) */
export default function FlashInfo() {
  const day = useGameStore((s) => s.game.day)
  const phase = useGameStore((s) => s.game.phase)
  const { t } = useI18n()
  // Un message par demi-journée, d'un thème à l'autre
  const message = t.ticker.messages[tickerSlot(day, phase, t.ticker.messages.length)]

  return (
    <div className="flex items-center gap-2 rounded-md border border-accent/40 bg-accent/10 px-2 py-1 text-xs">
      <span className="flex shrink-0 items-center gap-1.5 font-bold text-accent uppercase">
        <Tv size={12} aria-hidden="true" />
        {t.ticker.label}
      </span>
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="flex w-max gap-12 text-ink-soft italic motion-safe:animate-marquee motion-reduce:w-auto">
          <span>{message}</span>
          {/* Seconde copie pour boucler sans saut ; ignorée des lecteurs d'écran et sans animation */}
          <span aria-hidden="true" className="motion-reduce:hidden">
            {message}
          </span>
        </p>
      </div>
    </div>
  )
}
