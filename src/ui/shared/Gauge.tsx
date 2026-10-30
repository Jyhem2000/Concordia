import type { LucideIcon } from 'lucide-react'

type GaugeProps = {
  icon: LucideIcon
  label: string
  value: number
  max: number
}

/** Seuils de couleur de la barre (repère visuel seulement, aucun effet de jeu) */
const LOW = 0.25
const MEDIUM = 0.5

/** Jauge en barre : libellé, valeur sur maximum, barre verte, orange puis rouge quand elle se vide */
export default function Gauge({ icon: Icon, label, value, max }: GaugeProps) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0
  const color = ratio <= LOW ? 'bg-danger' : ratio <= MEDIUM ? 'bg-warning' : 'bg-success'
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-1 text-ink-muted">
          <Icon size={12} aria-hidden="true" />
          {label}
        </span>
        <span className="font-bold">
          {value}/{max}
        </span>
      </div>
      <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} className="mt-1 h-1.5 rounded-full bg-line">
        {/* Largeur calculée : la seule valeur de style qui ne peut pas être une classe */}
        <div className={`h-full rounded-full ${color}`} style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  )
}
