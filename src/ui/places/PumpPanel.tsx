import { Fuel } from 'lucide-react'
import { DISTRICTS } from '../../data/districts.ts'
import { VEHICLES } from '../../data/vehicles.ts'
import { canSiphon, maxRefuel, pumpClosed } from '../../engine/actions.ts'
import { fuelPriceBreakdown } from '../../engine/market.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Detailed from '../shared/Detailed.tsx'
import Hint from '../shared/Hint.tsx'
import Panel from '../shared/Panel.tsx'

/** Pompe à Synthanol du district (chap. 3) : officielle (fermée la nuit sous un seuil d'ICC) ou pirate (toujours ouverte) */
export default function PumpPanel() {
  // Prix, ouverture et plein possible se calculent sur l'état entier
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits } = useI18n()
  const tank = VEHICLES[game.vehicleId].tank
  const refuelMax = maxRefuel(game)
  const closed = pumpClosed(game)

  return (
    <Panel
      icon={Fuel}
      title={t.pump.name[DISTRICTS[game.districtId].pump]}
      subtitle={t.pump.rule[DISTRICTS[game.districtId].pump]}
      aside={<span className="font-bold">{t.pump.reserve(game.fuel, tank)}</span>}
      collapseId="fuel"
    >
      {closed ? (
        <Hint tone="night">{t.error['pump-closed']}</Hint>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Detailed breakdown={fuelPriceBreakdown(game)} format={(price) => t.evening.pricePerRation(credits(price))} />
          <Button disabled={refuelMax < 1} onClick={() => dispatch({ type: 'refuel', qty: 1 })}>
            {t.evening.refuelOne}
          </Button>
          <Button disabled={refuelMax < 1} onClick={() => dispatch({ type: 'refuel', qty: refuelMax })}>
            {t.evening.refuelFull}
          </Button>
        </div>
      )}
      {canSiphon(game) && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button variant="danger" onClick={() => dispatch({ type: 'siphon' })}>
            {t.evening.siphon}
          </Button>
          <Hint>{t.evening.siphonHint}</Hint>
        </div>
      )}
    </Panel>
  )
}
