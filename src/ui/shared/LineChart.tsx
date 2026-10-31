import { useState } from 'react'

export type ChartPoint = {
  x: number
  y: number
  /** Libellé du point dans le tableau des lecteurs d'écran (« J4 ») */
  label: string
  /** Valeur dite dans le tableau des lecteurs d'écran à la place du nombre (courbe sans valeurs) */
  note?: string
}

type LineChartProps = {
  points: readonly ChartPoint[]
  /** Bornes de l'axe horizontal */
  from: number
  to: number
  /** Libellé d'une graduation de l'axe horizontal */
  tick: (x: number) => string
  format: (y: number) => string
  /** Ligne de repère pointillée (cours normal, zéro…) */
  reference?: number
  /** Lecture du point désigné, au-dessus du tracé */
  readout: (point: ChartPoint) => string
  /** Description du graphique pour les lecteurs d'écran */
  label: string
  /** Vrai : la courbe s'interrompt entre deux points non consécutifs (jours sans relevé) */
  gaps?: boolean
  /** Vrai : la forme seule, sans valeurs sur l'axe vertical (tendance publique) */
  shapeOnly?: boolean
}

/** Géométrie du tracé (viewBox SVG), marges comprises pour les libellés d'axes */
const WIDTH = 320
const HEIGHT = 140
const MARGIN = { top: 10, right: 12, bottom: 20, left: 56 }

/**
 * Courbe d'une série dans le temps (chap. 7) : un point désigné au survol ou au toucher et lu au-dessus,
 * une ligne de repère, et le tableau des valeurs pour les lecteurs d'écran
 */
export default function LineChart({ points, from, to, tick, format, reference, readout, label, gaps = false, shapeOnly = false }: LineChartProps) {
  // Point désigné : état d'interface éphémère
  const [pointed, setPointed] = useState<number | null>(null)
  if (points.length === 0) return null

  const values = [...points.map((point) => point.y), ...(reference === undefined ? [] : [reference])]
  const low = Math.min(...values)
  const high = Math.max(...values)
  const span = Math.max(1, to - from)
  const x = (value: number) => MARGIN.left + ((value - from) / span) * (WIDTH - MARGIN.left - MARGIN.right)
  const y = (value: number) => HEIGHT - MARGIN.bottom - ((value - low) / Math.max(1, high - low)) * (HEIGHT - MARGIN.top - MARGIN.bottom)
  // Tronçons : toute la série, ou des points consécutifs seulement (pas de trait inventé entre deux relevés espacés)
  const runs = points.reduce<ChartPoint[][]>((all, point) => {
    const run = all[all.length - 1]
    if (run && (!gaps || run[run.length - 1].x === point.x - 1)) run.push(point)
    else all.push([point])
    return all
  }, [])
  const shown = points.find((point) => point.x === pointed) ?? points[points.length - 1]
  const step = Math.max(8, (WIDTH - MARGIN.left - MARGIN.right) / span)

  return (
    <figure>
      <figcaption className="mb-1 text-xs text-ink-soft">{readout(shown)}</figcaption>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label={label}>
        {reference !== undefined && (
          <line
            x1={MARGIN.left}
            x2={WIDTH - MARGIN.right}
            y1={y(reference)}
            y2={y(reference)}
            className="stroke-line-strong"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        )}
        {(shapeOnly ? [] : [low, high]).map((value) => (
          <text key={value} x={MARGIN.left - 4} y={y(value) + 3} textAnchor="end" fontSize={9} className="fill-ink-faint">
            {format(value)}
          </text>
        ))}
        {[from, to].map((value) => (
          <text key={value} x={x(value)} y={HEIGHT - 6} textAnchor="middle" fontSize={9} className="fill-ink-faint">
            {tick(value)}
          </text>
        ))}
        {runs.map((run) => (
          <path
            key={run[0].x}
            d={run.map((point, i) => `${i === 0 ? 'M' : 'L'}${x(point.x)},${y(point.y)}`).join(' ')}
            fill="none"
            className="stroke-accent"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {points.map((point) => (
          <circle
            key={point.x}
            cx={x(point.x)}
            cy={y(point.y)}
            r={point.x === shown.x ? 4 : 2.5}
            className="fill-accent stroke-base"
            strokeWidth={point.x === shown.x ? 2 : 1}
          />
        ))}
        {/* Zones plus larges que les points, une colonne par point : survol à la souris, toucher sur mobile */}
        {points.map((point) => (
          <rect
            key={point.x}
            x={x(point.x) - step / 2}
            y={MARGIN.top}
            width={step}
            height={HEIGHT - MARGIN.top - MARGIN.bottom}
            fill="transparent"
            onPointerEnter={() => setPointed(point.x)}
            onPointerDown={() => setPointed(point.x)}
          />
        ))}
      </svg>
      {/* Vue tableau pour les lecteurs d'écran */}
      <table className="sr-only">
        <caption>{label}</caption>
        <tbody>
          {points.map((point) => (
            <tr key={point.x}>
              <th scope="row">{point.label}</th>
              <td>{point.note ?? format(point.y)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
