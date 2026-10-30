import { normalQuote } from '../../engine/market.ts'
import type { DistrictId, ProductId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import LineChart, { type ChartPoint } from '../shared/LineChart.tsx'

type QuoteChartProps = {
  productId: ProductId
  districtId: DistrictId
}

/**
 * Cours observés d'un produit dans un district, du Jour 1 à aujourd'hui, avec le cours normal en repère (chap. 2 et 7).
 * Seuls les jours où le joueur a vu ce marché ont un point ; la courbe s'interrompt entre deux visites espacées.
 */
export default function QuoteChart({ productId, districtId }: QuoteChartProps) {
  // Mémoire de marché et cours normal du district : état entier
  const game = useGameStore((s) => s.game)
  const { t, credits } = useI18n()
  const points = (game.memory[districtId] ?? []).flatMap((seen): ChartPoint[] => {
    const quote = seen.quotes[productId]
    return quote === undefined ? [] : [{ x: seen.day, y: quote, label: t.chart.dayTick(seen.day) }]
  })
  if (points.length === 0) return <p className="text-xs text-ink-faint">{t.sheet.historyEmpty}</p>
  const normal = normalQuote(game, districtId, productId)

  return (
    <LineChart
      points={points}
      from={1}
      to={Math.max(2, game.day)}
      tick={t.chart.dayTick}
      format={credits}
      reference={normal}
      readout={(point) => t.sheet.historyReadout(t.district[districtId].name, point.x, credits(point.y), credits(normal))}
      label={t.sheet.historyLabel(t.district[districtId].name)}
      gaps
    />
  )
}
