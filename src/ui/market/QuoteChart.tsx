import { useState } from 'react'
import { normalQuote } from '../../engine/market.ts'
import type { ProductId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'

type QuoteChartProps = {
  productId: ProductId
}

/** Géométrie du tracé (viewBox SVG), marges comprises pour les libellés d'axes */
const WIDTH = 300
const HEIGHT = 110
const MARGIN = { top: 10, right: 12, bottom: 20, left: 44 }

/** Historique des cours observés dans le district actuel, avec le cours normal en repère (chap. 7 et 10) */
export default function QuoteChart({ productId }: QuoteChartProps) {
  const game = useGameStore((s) => s.game)
  const { t, credits } = useI18n()
  // Relevé survolé : état d'interface éphémère
  const [hovered, setHovered] = useState<number | null>(null)

  const district = game.districtId
  const points = (game.memory[district] ?? []).map((seen) => ({ day: seen.day, quote: seen.quotes[productId] }))
  if (points.length < 2) return <p className="text-zinc-500">{t.sheet.historyEmpty}</p>

  const normal = normalQuote(game, district, productId)
  const values = [...points.map((point) => point.quote), normal]
  const low = Math.min(...values)
  const high = Math.max(...values)
  const first = points[0].day
  const last = points[points.length - 1].day
  const x = (day: number) => MARGIN.left + ((day - first) / Math.max(1, last - first)) * (WIDTH - MARGIN.left - MARGIN.right)
  const y = (value: number) => HEIGHT - MARGIN.bottom - ((value - low) / Math.max(1, high - low)) * (HEIGHT - MARGIN.top - MARGIN.bottom)
  const line = points.map((point, i) => `${i === 0 ? 'M' : 'L'}${x(point.day)},${y(point.quote)}`).join(' ')
  const shown = points.find((point) => point.day === hovered) ?? points[points.length - 1]
  const step = (WIDTH - MARGIN.left - MARGIN.right) / Math.max(1, last - first)

  return (
    <figure className="mt-1">
      <figcaption className="mb-1 text-zinc-300">
        {t.sheet.historyReadout(t.district[district].name, shown.day, credits(shown.quote), credits(normal))}
      </figcaption>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full max-w-sm" role="img" aria-label={t.sheet.historyLabel(t.district[district].name)}>
        {/* Cours normal : repère pointillé, récessif */}
        <line
          x1={MARGIN.left}
          x2={WIDTH - MARGIN.right}
          y1={y(normal)}
          y2={y(normal)}
          className="stroke-zinc-600"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        {[low, high].map((value) => (
          <text key={value} x={MARGIN.left - 4} y={y(value) + 3} textAnchor="end" fontSize={9} className="fill-zinc-500">
            {credits(value)}
          </text>
        ))}
        {[first, last].map((day) => (
          <text key={day} x={x(day)} y={HEIGHT - 6} textAnchor="middle" fontSize={9} className="fill-zinc-500">
            {t.chart.dayTick(day)}
          </text>
        ))}

        <path d={line} fill="none" className="stroke-amber-400" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point) => (
          <circle
            key={point.day}
            cx={x(point.day)}
            cy={y(point.quote)}
            r={point.day === shown.day ? 4 : 2.5}
            className="fill-amber-400 stroke-zinc-900"
            strokeWidth={point.day === shown.day ? 2 : 1}
          />
        ))}

        {/* Zones de survol plus larges que les points : une colonne par relevé */}
        {points.map((point) => (
          <rect
            key={point.day}
            x={x(point.day) - step / 2}
            y={MARGIN.top}
            width={step}
            height={HEIGHT - MARGIN.top - MARGIN.bottom}
            fill="transparent"
            onPointerEnter={() => setHovered(point.day)}
            onPointerLeave={() => setHovered(null)}
          />
        ))}
      </svg>
      {/* Vue tableau pour les lecteurs d'écran */}
      <table className="sr-only">
        <caption>{t.sheet.historyLabel(t.district[district].name)}</caption>
        <tbody>
          {points.map((point) => (
            <tr key={point.day}>
              <th scope="row">{t.chart.dayTick(point.day)}</th>
              <td>{credits(point.quote)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
