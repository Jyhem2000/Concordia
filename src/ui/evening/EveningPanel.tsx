import { BedDouble, Fuel, Siren } from 'lucide-react'
import { ENDINGS, WANTED } from '../../data/balance.ts'
import { PRODUCT_IDS, PRODUCTS } from '../../data/products.ts'
import { VEHICLES } from '../../data/vehicles.ts'
import { ownedQty } from '../../engine/cargo.ts'
import { canSiphon, checkForceCurfew, maxRefuel } from '../../engine/actions.ts'
import { fuelPriceBreakdown } from '../../engine/market.ts'
import { canInject, checkMission, missionFee, missionOffer, sealedCount } from '../../engine/night.ts'
import { nightUnlock } from '../../engine/progress.ts'
import { sleepsAtRelay } from '../../engine/routine.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Detailed from '../shared/Detailed.tsx'
import CollapseToggle from '../shared/CollapseToggle.tsx'
import { FOCUS_RING } from '../shared/focus.ts'
import { useCollapsed } from '../shared/useCollapsed.ts'

/** Plein de Synthanol et dilemme de 20h00 (chap. 2) */
export default function EveningPanel() {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits } = useI18n()

  const tank = VEHICLES[game.vehicleId].tank
  const fuelCollapsed = useCollapsed('fuel')
  const curfewCollapsed = useCollapsed('curfew')
  const refuelMax = maxRefuel(game)
  // Trois choix le soir (chap. 2) : dormir, livraison de nuit autorisée (mission), ou tournée clandestine
  const offer = missionOffer(game)
  // Mission de nuit : seulement après quelques commandes livrées (confiance du DSC)
  const night = nightUnlock(game)
  // Épuisé : une boisson pour une nuit blanche malgré tout, si le joueur en a (chap. 3)
  const exhausted = checkForceCurfew(game) === 'exhausted'
  const drink = exhausted ? PRODUCT_IDS.find((id) => ownedQty(game.cargo, id) > 0 && !checkForceCurfew(game, id)) : undefined
  const sleepless = drink ? PRODUCTS[drink].sleeplessNight : undefined
  const drinkLabel = drink && sleepless ? t.evening.withDrink(t.product[drink].name, sleepless.healthLoss) : ''
  const curfewError = checkForceCurfew(game, drink)
  const missionError = curfewError ?? (offer ? checkMission(game) : 'no-mission')
  const sleepLabel = sleepsAtRelay(game) ? t.evening.sleepRelay : t.evening.bivouac
  // Eau qui refroidit le moteur la nuit (chap. 3)
  const coolants = PRODUCT_IDS.filter((id) => PRODUCTS[id].cooling && ownedQty(game.cargo, id) > 0)

  return (
    <section className="rounded border border-zinc-800 bg-zinc-900/40 text-sm">
      <div className="border-b border-zinc-800 p-3">
        <h2 className="text-amber-300">
          <CollapseToggle id="fuel">
            <Fuel size={14} aria-hidden="true" />
            {t.evening.fuelTitle} {game.fuel}/{tank}
          </CollapseToggle>
        </h2>
        <div className={`mt-1 flex flex-wrap items-center gap-2 ${fuelCollapsed ? 'hidden' : ''}`}>
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
            <h2 className="text-amber-300">
              <CollapseToggle id="curfew">
                <Siren size={14} aria-hidden="true" />
                {t.evening.curfewTitle}
              </CollapseToggle>
            </h2>
            <div className={curfewCollapsed ? 'hidden' : ''}>
              <p className="mt-1 text-xs text-sky-300">
                {!night.unlocked
                  ? t.evening.missionLocked(night.done, night.needed)
                  : offer
                    ? t.evening.missionOffer(t.district[offer].name, sealedCount(game), credits(missionFee(game)))
                    : game.nightOffer
                      ? t.evening.missionHere(t.district[game.nightOffer].name)
                      : t.evening.noMission}
              </p>
              <p className="mt-1 text-xs text-zinc-400">{t.evening.nightRule}</p>
              <ul className="mt-2 flex flex-col gap-2">
                <li>
                  <Button variant="primary" onClick={() => dispatch({ type: 'sleep' })}>
                    <BedDouble size={14} className="mr-1 inline" aria-hidden="true" />
                    {sleepLabel}
                  </Button>
                </li>
                {offer && (
                  <li>
                    <Button disabled={missionError !== null} onClick={() => dispatch({ type: 'forceCurfew', mission: true, drink })}>
                      {t.evening.missionTour(t.district[offer].name, credits(missionFee(game)))}
                      {drinkLabel}
                    </Button>
                    <p className="text-xs text-zinc-400">{missionError ? t.error[missionError] : t.evening.missionTourHint(sealedCount(game))}</p>
                  </li>
                )}
                <li>
                  <Button variant="danger" disabled={curfewError !== null} onClick={() => dispatch({ type: 'forceCurfew', drink })}>
                    {t.evening.clandestineTour}
                    {drinkLabel}
                  </Button>
                  <p className="text-xs text-zinc-400">
                    {curfewError ? t.error[curfewError] : t.evening.clandestineHint(t.hud.wantedGain(WANTED.perOffense))}
                  </p>
                  {canInject(game) && (
                    <p className="text-xs text-amber-300">{t.evening.injectionHint(game.progress.injections + 1, ENDINGS.resident.injections)}</p>
                  )}
                </li>
              </ul>
              {coolants.map((id) => (
                <label key={id} className="mt-2 flex items-center gap-1.5 text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={game.autoCooling}
                    onChange={(event) => dispatch({ type: 'setAutoCooling', enabled: event.target.checked })}
                    className={FOCUS_RING}
                  />
                  {t.evening.cooling(PRODUCTS[id].cooling?.crates ?? 0, t.product[id].name)}
                </label>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-indigo-300">{t.evening.nightNotice}</p>
            <p className="mt-1 text-xs text-sky-300">
              {game.mission ? t.evening.missionActive(t.district[game.mission.to].name) : t.evening.offMission}
            </p>
            {!game.mission && canInject(game) && (
              <p className="mt-1 text-xs text-amber-300">{t.evening.injectionHint(game.progress.injections + 1, ENDINGS.resident.injections)}</p>
            )}
            <Button variant="primary" className="mt-2" onClick={() => dispatch({ type: 'sleep' })}>
              <BedDouble size={14} className="mr-1 inline" aria-hidden="true" />
              {sleepLabel}
            </Button>
          </>
        )}
      </div>
    </section>
  )
}
