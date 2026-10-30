import type { LucideIcon } from 'lucide-react'
import { TONE_BG, type Tone } from './styles.ts'

type GaugeProps = {
  icon: LucideIcon
  label: string
  value: number
  max: number
  /** Valeur affichée à droite ; `valeur/max` par défaut */
  display?: string
  /** Couleur fixe de la barre ; sinon verte, orange puis rouge quand elle se vide */
  tone?: Tone
}

/** Seuils de couleur de la barre (repère visuel seulement, aucun effet de jeu) */
const LOW = 0.25
const MEDIUM = 0.5

/** Jauge en barre : libellé, valeur, barre colorée */
export default function Gauge({ icon: Icon, label, value, max, display, tone }: GaugeProps) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0
  const color = tone ? TONE_BG[tone] : ratio <= LOW ? 'bg-danger' : ratio <= MEDIUM ? 'bg-warning' : 'bg-success'
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-1 text-ink-muted">
          <Icon size={12} aria-hidden="true" />
          {label}
        </span>
        <span className="font-bold">{display ?? `${value}/${max}`}</span>
      </div>
      <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} className="mt-1 h-1.5 rounded-full bg-line">
        {/* Largeur calculée : la seule valeur de style qui ne peut pas être une classe */}
        <div className={`h-full rounded-full ${color}`} style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  )
}
