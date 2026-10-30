import { netWealth, wealthOf } from '../../engine/journal.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import LineChart, { type ChartPoint } from '../shared/LineChart.tsx'

/** Patrimoine net chaque matin depuis le Jour 1, puis maintenant, d'après le carnet de route (chap. 7) */
export default function WealthChart() {
  // Le patrimoine du moment ferme la courbe : état entier
  const game = useGameStore((s) => s.game)
  const { t, credits } = useI18n()
  const now = game.day + 1
  const points: ChartPoint[] = [
    ...game.journal.map((log) => ({ x: log.day, y: netWealth(log.start), label: t.fil.morningOf(log.day) })),
    { x: now, y: netWealth(wealthOf(game)), label: t.fil.now },
  ]

  return (
    <LineChart
      points={points}
      from={1}
      to={now}
      tick={(x) => (x === now ? t.fil.now : t.chart.dayTick(x))}
      format={credits}
      reference={0}
      readout={(point) => t.fil.wealthReadout(point.label, credits(point.y))}
      label={t.fil.wealthLabel}
    />
  )
}
