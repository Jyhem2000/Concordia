import { useState } from 'react'
import { GAME_LENGTH_DAYS } from '../../data/balance.ts'
import { inflationIndex } from '../../engine/inflation.ts'
import { useI18n } from '../../i18n/useI18n.ts'

type InflationChartProps = {
  /** Jour courant : les jours passés sont tracés pleins, les suivants en projection atténuée */
  day: number
}

/** Géométrie du tracé (viewBox SVG), marges comprises pour les libellés d'axes */
const WIDTH = 300
const HEIGHT = 140
const MARGIN = { top: 12, right: 12, bottom: 22, left: 34 }

const DAYS = Array.from({ length: GAME_LENGTH_DAYS }, (_, i) => i + 1)
const MAX_INDEX = inflationIndex(GAME_LENGTH_DAYS)

const x = (day: number) => MARGIN.left + ((day - 1) / (GAME_LENGTH_DAYS - 1)) * (WIDTH - MARGIN.left - MARGIN.right)
const y = (index: number) => HEIGHT - MARGIN.bottom - ((index - 1) / (MAX_INDEX - 1)) * (HEIGHT - MARGIN.top - MARGIN.bottom)
const path = (days: readonly number[]) => days.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(d)},${y(inflationIndex(d))}`).join(' ')

/** Historique de l'indice d'inflation depuis le Jour 1 et projection jusqu'au Jour 30 (chap. 7 et 10) */
export default function InflationChart({ day }: InflationChartProps) {
  const { t, multiplier } = useI18n()
  // Jour survolé ou pointé au clavier : état d'interface éphémère
  const [hovered, setHovered] = useState<number | null>(null)
  const shown = hovered ?? day
  const past = DAYS.filter((d) => d <= day)
  const future = DAYS.filter((d) => d >= day)
  const step = (WIDTH - MARGIN.left - MARGIN.right) / (GAME_LENGTH_DAYS - 1)

  return (
    <figure>
      <figcaption className="mb-1 text-xs text-zinc-300">
        {t.inflation.readout(shown, multiplier(inflationIndex(shown)))}
        {shown > day && <span className="ml-1 text-zinc-500">{t.inflation.projected}</span>}
      </figcaption>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label={t.inflation.chartLabel(multiplier(inflationIndex(day)), day, GAME_LENGTH_DAYS)}
      >
        {/* Axes recessifs : traits fins, gris un cran au-dessus du fond */}
        {[1, MAX_INDEX].map((index) => (
          <g key={index}>
            <line x1={MARGIN.left} x2={WIDTH - MARGIN.right} y1={y(index)} y2={y(index)} className="stroke-zinc-800" strokeWidth={1} />
            <text x={MARGIN.left - 4} y={y(index) + 3} textAnchor="end" fontSize={9} className="fill-zinc-500">
              {multiplier(index)}
            </text>
          </g>
        ))}
        {[1, GAME_LENGTH_DAYS].map((d) => (
          <text key={d} x={x(d)} y={HEIGHT - 6} textAnchor="middle" fontSize={9} className="fill-zinc-500">
            {t.inflation.dayTick(d)}
          </text>
        ))}

        {/* Projection : même série, atténuée plutôt que pointillée */}
        <path d={path(future)} fill="none" className="stroke-amber-400/35" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <path d={path(past)} fill="none" className="stroke-amber-400" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {/* Repère du jour survolé (réticule) et du jour courant */}
        <line x1={x(shown)} x2={x(shown)} y1={MARGIN.top} y2={HEIGHT - MARGIN.bottom} className="stroke-zinc-600" strokeWidth={1} />
        <circle cx={x(day)} cy={y(inflationIndex(day))} r={4} className="fill-amber-400 stroke-zinc-900" strokeWidth={2} />

        {/* Zones de survol plus larges que le tracé : une colonne par jour */}
        {DAYS.map((d) => (
          <rect
            key={d}
            x={x(d) - step / 2}
            y={MARGIN.top}
            width={step}
            height={HEIGHT - MARGIN.top - MARGIN.bottom}
            fill="transparent"
            onPointerEnter={() => setHovered(d)}
            onPointerLeave={() => setHovered(null)}
          />
        ))}
      </svg>
      {/* Vue tableau pour les lecteurs d'écran : chaque valeur reste accessible sans survol */}
      <table className="sr-only">
        <caption>{t.inflation.title}</caption>
        <tbody>
          {DAYS.map((d) => (
            <tr key={d}>
              <th scope="row">{t.inflation.dayTick(d)}</th>
              <td>{multiplier(inflationIndex(d))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
