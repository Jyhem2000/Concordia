import { normalQuote, publishedQuotes, TREND_FLAT, type TrendDirection } from '../../engine/market.ts'
import type { DistrictId, ProductId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import LineChart, { type ChartPoint } from '../shared/LineChart.tsx'

type QuoteChartProps = {
  productId: ProductId
  districtId: DistrictId
}

/**
 * Tendance publique d'un produit dans un district (chap. 2 et 7) : la forme de la courbe publiée par le Fil, jour par jour
 * jusqu'à la veille, sans prix ; dessous, les cours exacts vus sur place.
 */
export default function QuoteChart({ productId, districtId }: QuoteChartProps) {
  // Bulletin, mémoire de marché et cours normal du district : état entier
  const game = useGameStore((s) => s.game)
  const { t, credits } = useI18n()
  const published = publishedQuotes(game, districtId, productId)
  // Cours exacts vus sur place, du plus récent au plus ancien
  const seen = (game.memory[districtId] ?? [])
    .flatMap((entry) => {
      const quote = entry.quotes[productId]
      return quote === undefined ? [] : [{ day: entry.day, quote }]
    })
    .reverse()
  const directionOf = (index: number): TrendDirection => {
    if (index === 0) return 'flat'
    const change = published[index].quote / published[index - 1].quote - 1
    return change > TREND_FLAT ? 'up' : change < -TREND_FLAT ? 'down' : 'flat'
  }
  const points = published.map(({ day, quote }, index): ChartPoint => ({
    x: day,
    y: quote,
    label: t.chart.dayTick(day),
    note: t.trend[directionOf(index)],
  }))

  return (
    <>
      {points.length < 2 ? (
        <p className="text-xs text-ink-faint">{t.sheet.trendSoon}</p>
      ) : (
        <LineChart
          points={points}
          from={1}
          to={Math.max(2, game.day - 1)}
          tick={t.chart.dayTick}
          format={credits}
          reference={normalQuote(game, districtId, productId)}
          readout={(point) => t.sheet.trendReadout(t.district[districtId].name, point.x, point.note ?? '')}
          label={t.sheet.historyLabel(t.district[districtId].name)}
          shapeOnly
        />
      )}
      {seen.length > 0 ? (
        <table className="mt-2 w-full text-xs tabular-nums">
          <caption className="mb-1 text-left text-ink-muted">{t.sheet.seenTitle}</caption>
          <thead>
            <tr className="border-b border-line text-ink-faint">
              <th scope="col" className="py-0.5 text-left font-normal">
                {t.sheet.seenDay}
              </th>
              <th scope="col" className="py-0.5 text-right font-normal">
                {t.sheet.seenQuote}
              </th>
            </tr>
          </thead>
          <tbody>
            {seen.map(({ day, quote }) => (
              <tr key={day} className="border-b border-line/50 text-ink-soft">
                <td className="py-0.5">{t.chart.dayTick(day)}</td>
                <td className="py-0.5 text-right">{credits(quote)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mt-1 text-xs text-ink-soft">{t.sheet.historyEmpty}</p>
      )}
    </>
  )
}
