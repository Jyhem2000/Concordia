import { BedDouble, Fuel, Siren } from 'lucide-react'
import { VEHICLES } from '../../data/vehicles.ts'
import { canSiphon, checkForceCurfew, maxRefuel } from '../../engine/actions.ts'
import { fuelPriceBreakdown } from '../../engine/market.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Detailed from '../shared/Detailed.tsx'

/** Plein de Synthanol et dilemme de 20h00 (chap. 2) */
export default function EveningPanel() {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits } = useI18n()

  const tank = VEHICLES[game.vehicleId].tank
  const refuelMax = maxRefuel(game)
  const curfewError = checkForceCurfew(game)
  // Rust Valley n'a pas de relais routier du DSC : on y bivouaque
  const sleepLabel = game.districtId === 'D4' ? t.evening.bivouac : t.evening.sleepRelay

  return (
    <section className="rounded border border-zinc-800 bg-zinc-900/40 text-sm">
      <div className="border-b border-zinc-800 p-3">
        <h2 className="flex items-center gap-1.5 font-bold text-amber-300 uppercase">
          <Fuel size={14} />
          {t.evening.fuelTitle} {game.fuel}/{tank}
        </h2>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Detailed breakdown={fuelPriceBreakdown(game)} format={(price) => t.evening.pricePerRation(credits(price))} />
          <Button disabled={refuelMax < 1} onClick={() => dispatch({ type: 'refuel', qty: 1 })}>
            {t.evening.refuelOne}
          </Button>
          <Button disabled={refuelMax < 1} onClick={() => dispatch({ type: 'refuel', qty: refuelMax })}>
            {t.evening.refuelFull}
          </Button>
          {canSiphon(game) && (
            <>
              <Button variant="danger" onClick={() => dispatch({ type: 'siphon' })}>
                {t.evening.siphon}
              </Button>
              <span className="text-xs text-zinc-400">{t.evening.siphonHint}</span>
            </>
          )}
        </div>
      </div>

      <div className="p-3">
        {game.phase === 'day' ? (
          <>
            <h2 className="flex items-center gap-1.5 font-bold text-amber-300 uppercase">
              <Siren size={14} />
              {t.evening.curfewTitle}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button variant="primary" onClick={() => dispatch({ type: 'sleep' })}>
                <BedDouble size={14} className="mr-1 inline" />
                {sleepLabel}
              </Button>
              <Button variant="danger" disabled={curfewError !== null} onClick={() => dispatch({ type: 'forceCurfew' })}>
                {t.evening.forceCurfew}
              </Button>
            </div>
            <p className="mt-1 text-xs text-zinc-400">{curfewError ? t.error[curfewError] : t.evening.forceCurfewHint}</p>
          </>
        ) : (
          <>
            <p className="text-indigo-300">{t.evening.nightNotice}</p>
            <Button variant="primary" className="mt-2" onClick={() => dispatch({ type: 'sleep' })}>
              <BedDouble size={14} className="mr-1 inline" />
              {sleepLabel}
            </Button>
          </>
        )}
      </div>
    </section>
  )
}
