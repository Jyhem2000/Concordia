import { Tv } from 'lucide-react'
import { INFLATION_PERIOD_DAYS } from '../../data/balance.ts'
import { inflationIndex } from '../../engine/inflation.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import { FOCUS_RING } from '../shared/focus.ts'
import InflationChart from './InflationChart.tsx'

/** Téléscripteur d'Aeterna (chap. 10) : indice d'inflation du jour, détaillable, et message du jour */
export default function Ticker() {
  const day = useGameStore((s) => s.game.day)
  const { t, multiplier, signedPercent } = useI18n()
  const index = inflationIndex(day)
  const change = day > 1 ? index / inflationIndex(day - 1) - 1 : 0
  // Un message par jour, dans l'ordre du catalogue : le téléscripteur change chaque matin
  const message = t.ticker.messages[(day - 1) % t.ticker.messages.length]

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-zinc-800 px-4 py-1 text-xs text-zinc-300">
      <span className="flex items-center gap-1.5 font-bold text-amber-300 uppercase">
        <Tv size={12} aria-hidden="true" />
        {t.ticker.label}
      </span>
      <details className="group relative">
        <summary className={`cursor-pointer list-none rounded underline decoration-zinc-600 decoration-dotted underline-offset-4 ${FOCUS_RING}`}>
          {t.ticker.index(multiplier(index))}
          {day > 1 && <span className="ml-1 text-zinc-500">{t.ticker.sinceYesterday(signedPercent(change, 1))}</span>}
        </summary>
        <div className="absolute left-0 z-30 mt-1 w-80 max-w-full rounded border border-zinc-700 bg-zinc-900 p-3 shadow-lg">
          <p className="font-bold text-amber-300">{t.inflation.title}</p>
          <p className="mt-1 text-zinc-400">{t.inflation.rule(INFLATION_PERIOD_DAYS)}</p>
          <div className="mt-2">
            <InflationChart day={day} />
          </div>
          <p className="mt-2 text-zinc-300">{t.inflation.indexed}</p>
          <p className="mt-1 text-zinc-400">{t.inflation.notIndexed}</p>
        </div>
      </details>
      <span className="text-zinc-400 italic">{message}</span>
    </div>
  )
}
