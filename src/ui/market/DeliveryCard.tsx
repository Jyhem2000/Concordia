import { checkDelivery, deliveryCrates, deliveryFee, deliveryOffer } from '../../engine/delivery.ts'
import { trustFactor } from '../../engine/progress.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Hint from '../shared/Hint.tsx'

/** Livraison officielle du jour (chap. 1), en tête du marché : offre de la plateforme à accepter avant d'acheter, ou livraison en cours */
export default function DeliveryCard() {
  // L'offre, la place et la prime se calculent sur l'état entier de la partie
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits, multiplier } = useI18n()
  const trust = t.travel.trust(game.progress.deliveries, multiplier(trustFactor(game)))
  if (game.phase !== 'day') return null
  if (game.delivery)
    return (
      <Hint tone="info" className="px-3 pt-2">
        {t.travel.deliveryActive(t.district[game.delivery.to].name)} {trust}
      </Hint>
    )
  const to = deliveryOffer(game)
  if (!to || game.dayTripDone) return null
  const error = checkDelivery(game)
  return (
    <div className="px-3 pt-2 text-xs">
      <p className="font-bold text-info">{t.travel.deliveryTitle}</p>
      <p className="text-ink-soft">{t.travel.deliveryOffer(t.district[to].name, deliveryCrates(game), credits(deliveryFee(game)))}</p>
      <p className="text-ink-muted">{trust}</p>
      <Button className="mt-1" size="sm" disabled={error !== null} onClick={() => dispatch({ type: 'acceptDelivery' })}>
        {t.travel.acceptDelivery}
      </Button>
      {error && <p className="mt-1 text-ink-muted">{t.error[error]}</p>}
    </div>
  )
}
