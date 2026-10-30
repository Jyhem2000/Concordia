import { daysBeforeRot, freshnessOf } from '../../engine/condition.ts'
import type { FreshnessStage, ProductId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'

/** Ordre d'affichage des états de fraîcheur */
const FRESHNESS_ORDER: readonly FreshnessStage[] = ['extra', 'standard', 'gamey', 'spoiled']

/** État des caisses d'un produit en soute (chap. 2) : caisses par fraîcheur, caisses abîmées, délai avant pourriture */
export function useConditions(productId: ProductId): string[] {
  // La fraîcheur dépend du jour et de l'équipement (caisson cryo, chaîne du froid) : état entier
  const game = useGameStore((s) => s.game)
  const { t } = useI18n()
  const lots = game.cargo.filter((lot) => lot.productId === productId)
  const stages = FRESHNESS_ORDER.flatMap((stage) => {
    const qty = lots.reduce((total, lot) => (freshnessOf(game, lot) === stage ? total + lot.qty : total), 0)
    return qty > 0 ? [`${qty} ${t.market.freshness[stage]}`] : []
  })
  const damaged = lots.reduce((total, lot) => (lot.damaged ? total + lot.qty : total), 0)
  // Délai avant que le lot le plus ancien pourrisse
  const rotDelays = lots.flatMap((lot) => daysBeforeRot(game, lot) ?? [])
  const rotsIn = rotDelays.length > 0 ? Math.min(...rotDelays) : null
  return [...stages, ...(damaged > 0 ? [`${damaged} ${t.market.damaged}`] : []), ...(rotsIn !== null ? [t.market.rotsIn(rotsIn)] : [])]
}
