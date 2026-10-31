import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react'
import { publicTrend, type TrendDirection } from '../../engine/market.ts'
import type { DistrictId, ProductId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Tip from './Tip.tsx'

type TrendBadgeProps = {
  districtId: DistrictId
  productId: ProductId
}

const STYLES: Record<TrendDirection, { icon: typeof ArrowRight; className: string }> = {
  up: { icon: ArrowUpRight, className: 'text-success' },
  down: { icon: ArrowDownRight, className: 'text-danger' },
  flat: { icon: ArrowRight, className: 'text-ink-muted' },
}

/** Tendance publique d'un produit dans un district (chap. 2) : flèche et durée, en clair dans l'infobulle */
export default function TrendBadge({ districtId, productId }: TrendBadgeProps) {
  // Bulletin : état entier (un objet calculé ne peut pas sortir d'un sélecteur, il changerait à chaque lecture)
  const game = useGameStore((s) => s.game)
  const trend = publicTrend(game, districtId, productId)
  const { t } = useI18n()
  if (!trend) return null
  const { icon: Icon, className } = STYLES[trend.direction]
  const text = t.trendSince(t.trend[trend.direction], trend.days)
  return (
    <Tip content={text} className={`gap-0.5 text-xs ${className}`}>
      <Icon size={12} aria-hidden="true" />
      <span aria-hidden="true">{trend.days}</span>
      <span className="sr-only">{text}</span>
    </Tip>
  )
}
