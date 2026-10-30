import { useState } from 'react'
import { normalQuote } from '../../engine/market.ts'
import type { DistrictId, ProductId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'

type QuoteChartProps = {
  productId: ProductId
  districtId: DistrictId
}

type Point = { day: number; quote: number }

/** Géométrie du tracé (viewBox SVG), marges comprises pour les libellés d'axes */
const WIDTH = 320
const HEIGHT = 140
const MARGIN = { top: 10, right: 12, bottom: 20, left: 48 }

/**
 * Cours observés d'un produit dans un district, du Jour 1 à aujourd'hui, avec le cours normal en repère (chap. 2 et 7).
 * Seuls les jours où le joueur a vu ce marché ont un point ; la courbe s'interrompt entre deux visites espacées.
 */
export default function QuoteChart({ productId, districtId }: QuoteChartProps) {
  // Mémoire de marché et cours normal du district : état entier
  const game = useGameStore((s) => s.game)
  const { t, credits } = useI18n()
  // Relevé désigné (survol ou toucher) : état d'interface éphémère
  const [pointed, setPointed] = useState<number | null>(null)

  const points = (game.memory[districtId] ?? []).flatMap((seen): Point[] => {
    const quote = seen.quotes[productId]
    return quote === undefined ? [] : [{ day: seen.day, quote }]
  })
  if (points.length === 0) return <p className="text-xs text-ink-faint">{t.sheet.historyEmpty}</p>

  const normal = normalQuote(game, districtId, productId)
  const values = [...points.map((point) => point.quote), normal]
  const low = Math.min(...values)
  const high = Math.max(...values)
  // Axe du temps : toute la partie jusqu'à aujourd'hui
  const first = 1
  const last = Math.max(2, game.day)
  const x = (day: number) => MARGIN.left + ((day - first) / (last - first)) * (WIDTH - MARGIN.left - MARGIN.right)
  const y = (value: number) => HEIGHT - MARGIN.bottom - ((value - low) / Math.max(1, high - low)) * (HEIGHT - MARGIN.top - MARGIN.bottom)
  // Tronçons de jours consécutifs : pas de trait inventé entre deux visites
  const runs = points.reduce<Point[][]>((all, point) => {
    const run = all[all.length - 1]
    if (run && run[run.length - 1].day === point.day - 1) run.push(point)
    else all.push([point])
    return all
  }, [])
  const shown = points.find((point) => point.day === pointed) ?? points[points.length - 1]
  const step = (WIDTH - MARGIN.left - MARGIN.right) / (last - first)

  return (
    <figure>
      <figcaption className="mb-1 text-xs text-ink-soft">
        {t.sheet.historyReadout(t.district[districtId].name, shown.day, credits(shown.quote), credits(normal))}
      </figcaption>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label={t.sheet.historyLabel(t.district[districtId].name)}>
        {/* Cours normal : repère pointillé, récessif */}
        <line
          x1={MARGIN.left}
          x2={WIDTH - MARGIN.right}
          y1={y(normal)}
          y2={y(normal)}
          className="stroke-line-strong"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        {[low, high].map((value) => (
          <text key={value} x={MARGIN.left - 4} y={y(value) + 3} textAnchor="end" fontSize={9} className="fill-ink-faint">
            {credits(value)}
          </text>
        ))}
        {[first, last].map((day) => (
          <text key={day} x={x(day)} y={HEIGHT - 6} textAnchor="middle" fontSize={9} className="fill-ink-faint">
            {t.chart.dayTick(day)}
          </text>
        ))}

        {runs.map((run) => (
          <path
            key={run[0].day}
            d={run.map((point, i) => `${i === 0 ? 'M' : 'L'}${x(point.day)},${y(point.quote)}`).join(' ')}
            fill="none"
            className="stroke-accent"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {points.map((point) => (
          <circle
            key={point.day}
            cx={x(point.day)}
            cy={y(point.quote)}
            r={point.day === shown.day ? 4 : 2.5}
            className="fill-accent stroke-base"
            strokeWidth={point.day === shown.day ? 2 : 1}
          />
        ))}

        {/* Zones plus larges que les points, une colonne par relevé : survol à la souris, toucher sur mobile */}
        {points.map((point) => (
          <rect
            key={point.day}
            x={x(point.day) - Math.max(step, 8) / 2}
            y={MARGIN.top}
            width={Math.max(step, 8)}
            height={HEIGHT - MARGIN.top - MARGIN.bottom}
            fill="transparent"
            onPointerEnter={() => setPointed(point.day)}
            onPointerDown={() => setPointed(point.day)}
          />
        ))}
      </svg>
      {/* Vue tableau pour les lecteurs d'écran */}
      <table className="sr-only">
        <caption>{t.sheet.historyLabel(t.district[districtId].name)}</caption>
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
