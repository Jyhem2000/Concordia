import { Minus, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react'
import { useI18n } from '../../i18n/useI18n.ts'

type MarginProps = {
  /** Produit de la vente */
  revenue: number
  /** Prix d'achat des caisses vendues */
  cost: number
  /** Affiche la marge en crédits et en pourcentage du prix d'achat */
  showAmount?: boolean
  /** Suffixe accolé au montant, ex. « /u » */
  unit?: string
  className?: string
}

/** En dessous de ce taux, la marge est jugée faible (repère visuel seulement, aucun effet de jeu) */
const LOW_MARGIN_RATE = 0.15

type Trend = 'up' | 'flat' | 'down'

const trendStyles: Record<Trend, { icon: LucideIcon; className: string }> = {
  up: { icon: TrendingUp, className: 'text-green-400' },
  flat: { icon: Minus, className: 'text-amber-300' },
  down: { icon: TrendingDown, className: 'text-red-400' },
}

function trendOf(revenue: number, cost: number): Trend {
  if (revenue < cost) return 'down'
  return revenue - cost < cost * LOW_MARGIN_RATE ? 'flat' : 'up'
}

/** Marge d'une vente : vert si rentable, ambre si faible, rouge à perte */
export default function Margin({ revenue, cost, showAmount = true, unit = '', className = '' }: MarginProps) {
  const { t, signedCredits, signedPercent } = useI18n()
  const trend = trendOf(revenue, cost)
  const { icon: Icon, className: color } = trendStyles[trend]
  const margin = revenue - cost

  return (
    <span className={`inline-flex items-center gap-1 ${color} ${className}`} title={t.margin.trend[trend]}>
      <Icon size={14} aria-hidden="true" />
      {/* La couleur et l'icône ne suffisent pas : le verdict est aussi donné en texte aux lecteurs d'écran */}
      <span className="sr-only">{t.margin.trend[trend]}</span>
      {showAmount && (
        <span>
          {signedCredits(margin)}
          {unit}
          {cost > 0 && <span className="ml-1 text-xs">({signedPercent(margin / cost, 0)})</span>}
        </span>
      )}
    </span>
  )
}
