import { exposure, fineAmount } from '../../engine/interception.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Hint from '../shared/Hint.tsx'

type ExposureProps = {
  className?: string
}

/** Ce qu'un barrage raté coûterait : caisses illégales en soute et sanction de base d'une saisie (chap. 5) */
export default function Exposure({ className = '' }: ExposureProps) {
  // La sanction et le double fond se calculent sur l'état entier de la partie (véhicule, district)
  const game = useGameStore((s) => s.game)
  const { t, credits, percent } = useI18n()
  const { crates, hidden, cost, sanction } = exposure(game)
  if (crates === 0 || !sanction) return null
  return (
    <Hint tone="accent" className={className}>
      {t.travel.exposed(crates, credits(cost), hidden)}{' '}
      {t.travel.exposedSanction(
        t.interception.fine(percent(sanction.fineRate, 0), credits(fineAmount(game, sanction.fineRate))),
        sanction.custodyDays,
      )}
    </Hint>
  )
}
