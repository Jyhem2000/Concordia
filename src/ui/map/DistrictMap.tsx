import { motion } from 'motion/react'
import { DISTRICT_IDS, DISTRICTS, MAP_LINKS } from '../../data/districts.ts'
import { shortestRoute } from '../../engine/map.ts'
import type { DistrictId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import { FOCUS_RING } from '../shared/focus.ts'
import DistrictSigns from './DistrictSigns.tsx'

type DistrictMapProps = {
  /** Destination touchée, dont l'itinéraire est tracé */
  selected: DistrictId | null
  onSelect: (districtId: DistrictId) => void
  /** District survolé à la souris, ou null en le quittant */
  onHover: (districtId: DistrictId | null) => void
}

/**
 * Place de chaque district sur le schéma, en % de la carte : de la périphérie (en bas à gauche) au sommet
 * de la pyramide (en haut à droite), comme le schéma du chap. 3. Présentation seulement : les liaisons sont dans `MAP_LINKS`.
 */
const POSITIONS: Record<DistrictId, { x: number; y: number }> = {
  D4: { x: 14, y: 78 },
  D1: { x: 30, y: 52 },
  D2: { x: 50, y: 34 },
  D3: { x: 52, y: 80 },
  D5: { x: 70, y: 52 },
  D6: { x: 86, y: 16 },
}

/** Carte schématique des districts et de leurs liaisons (chap. 7) ; survoler ou toucher un district l'affiche, le toucher le choisit */
export default function DistrictMap({ selected, onSelect, onHover }: DistrictMapProps) {
  const here = useGameStore((s) => s.game.districtId)
  const { t } = useI18n()
  const route = selected && selected !== here ? shortestRoute(here, selected) : []
  // Liaison empruntée par l'itinéraire, dans un sens ou dans l'autre
  const onRoute = (a: DistrictId, b: DistrictId) =>
    route.some((step, index) => index > 0 && ((route[index - 1] === a && step === b) || (route[index - 1] === b && step === a)))

  return (
    <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg border border-line bg-base sm:aspect-video">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 h-full w-full">
        {/* Quadrillage de terminal, récessif */}
        <defs>
          <pattern id="map-grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" className="stroke-line" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#map-grid)" />
        {MAP_LINKS.map(([a, b]) => (
          <g key={`${a}-${b}`}>
            {/* Halo de l'itinéraire, sous le trait */}
            {onRoute(a, b) && (
              <line
                x1={POSITIONS[a].x}
                y1={POSITIONS[a].y}
                x2={POSITIONS[b].x}
                y2={POSITIONS[b].y}
                vectorEffect="non-scaling-stroke"
                className="stroke-accent/30"
                strokeWidth={9}
                strokeLinecap="round"
              />
            )}
            <line
              x1={POSITIONS[a].x}
              y1={POSITIONS[a].y}
              x2={POSITIONS[b].x}
              y2={POSITIONS[b].y}
              vectorEffect="non-scaling-stroke"
              className={onRoute(a, b) ? 'stroke-accent' : 'stroke-line-strong'}
              strokeWidth={onRoute(a, b) ? 3 : 1.5}
              strokeDasharray={onRoute(a, b) ? undefined : '4 3'}
              strokeLinecap="round"
            />
          </g>
        ))}
      </svg>
      <ul>
        {DISTRICT_IDS.map((id) => {
          const isHere = id === here
          const isSelected = id === selected
          return (
            <li
              key={id}
              className="absolute -translate-x-1/2 -translate-y-2"
              // Position calculée sur le schéma : la seule valeur de style qui ne peut pas être une classe
              style={{ left: `${POSITIONS[id].x}%`, top: `${POSITIONS[id].y}%` }}
            >
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect(id)}
                // Survol à la souris seulement : sur mobile, le toucher choisit le district
                onPointerEnter={(event) => event.pointerType === 'mouse' && onHover(id)}
                onPointerLeave={(event) => event.pointerType === 'mouse' && onHover(null)}
                className={`group flex flex-col items-center rounded-md px-1 text-xs leading-tight ${FOCUS_RING}`}
              >
                <span className="relative flex h-5 w-5 items-center justify-center">
                  {/* Position actuelle : un anneau qui pulse en boucle (indicateur permanent, pas une transition) */}
                  {isHere && (
                    <motion.span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full border-2 border-accent"
                      animate={{ scale: [1, 1.9], opacity: [0.7, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                    />
                  )}
                  <span
                    className={`h-4 w-4 rounded-full border-2 transition-transform group-hover:scale-125 ${
                      isHere ? 'border-accent bg-accent' : isSelected ? 'border-accent bg-accent/30' : 'border-ink-muted bg-panel'
                    }`}
                  />
                </span>
                <span
                  className={`mt-0.5 rounded bg-base/80 px-1 font-bold whitespace-nowrap ${isHere || isSelected ? 'text-accent' : 'text-ink group-hover:text-accent'}`}
                >
                  {t.district[id].name}
                </span>
                <span className="text-accent" aria-hidden="true">
                  {'★'.repeat(DISTRICTS[id].security)}
                </span>
                <span className="sr-only">
                  {t.travel.security(DISTRICTS[id].security)}
                  {isHere && ` — ${t.travel.here}`}
                </span>
              </button>
              {/* Hors du bouton : chaque indice ouvre sa propre infobulle */}
              <div className="flex justify-center">
                <DistrictSigns districtId={id} withEvent />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
