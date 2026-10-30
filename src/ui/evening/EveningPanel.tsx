import { BedDouble, Fuel, PartyPopper, Siren } from 'lucide-react'
import { AFTER, ENDINGS, WANTED } from '../../data/balance.ts'
import { TAGS } from '../../data/tags.ts'
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
import { FOCUS_RING } from '../shared/focus.ts'
import Hint from '../shared/Hint.tsx'
import Panel from '../shared/Panel.tsx'

/** Plein de Synthanol et dilemme de 20h00 (chap. 1) */
export default function EveningPanel() {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits, multiplier, percent } = useI18n()

  const tank = VEHICLES[game.vehicleId].tank
  const refuelMax = maxRefuel(game)
  // Trois choix le soir (chap. 1) : dormir, livraison de nuit autorisée (mission), ou tournée clandestine
  const offer = missionOffer(game)
  // Mission de nuit : seulement après quelques commandes livrées (confiance du DSC)
  const night = nightUnlock(game)
  // Épuisé : une boisson pour une nuit blanche malgré tout, si le joueur en a (chap. 2)
  const exhausted = checkForceCurfew(game) === 'exhausted'
  const drink = exhausted ? PRODUCT_IDS.find((id) => ownedQty(game.cargo, id) > 0 && !checkForceCurfew(game, id)) : undefined
  const sleepless = drink ? PRODUCTS[drink].sleeplessNight : undefined
  const drinkLabel = drink && sleepless ? t.evening.withDrink(t.product[drink].name, sleepless.healthLoss) : ''
  const curfewError = checkForceCurfew(game, drink)
  const missionError = curfewError ?? (offer ? checkMission(game) : 'no-mission')
  const sleepLabel = sleepsAtRelay(game) ? t.evening.sleepRelay : t.evening.bivouac
  // Eau qui refroidit le moteur la nuit (chap. 2)
  const coolants = PRODUCT_IDS.filter((id) => PRODUCTS[id].cooling && ownedQty(game.cargo, id) > 0)
  // After du couvre-feu de ce soir, annoncée dès 06h00 (chap. 1)
  const afterLine = (
    <Hint tone="event" icon={PartyPopper} className="mt-1">
      {t.evening.after(
        t.district[game.after].name,
        multiplier(AFTER.festiveFactor),
        multiplier(TAGS[AFTER.tag].nightSale ?? 1),
        percent(1 - AFTER.nightRiskFactor, 0),
      )}
    </Hint>
  )

  return (
    <>
      <Panel icon={Fuel} title={`${t.evening.fuelTitle} ${game.fuel}/${tank}`} collapseId="fuel">
        <div className="flex flex-wrap items-center gap-2">
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
              <Hint>{t.evening.siphonHint}</Hint>
            </>
          )}
        </div>
      </Panel>

      <Panel icon={Siren} title={t.evening.curfewTitle} collapseId="curfew">
        {game.phase === 'day' ? (
          <>
            <Hint tone="info">
              {!night.unlocked
                ? t.evening.missionLocked(night.done, night.needed)
                : offer
                  ? t.evening.missionOffer(t.district[offer].name, sealedCount(game), credits(missionFee(game)))
                  : game.nightOffer
                    ? t.evening.missionHere(t.district[game.nightOffer].name)
                    : t.evening.noMission}
            </Hint>
            {afterLine}
            <Hint className="mt-1">{t.evening.nightRule}</Hint>
            <ul className="mt-2 flex flex-col gap-2">
              <li>
                <Button variant="primary" onClick={() => dispatch({ type: 'sleep' })}>
                  <BedDouble size={14} aria-hidden="true" />
                  {sleepLabel}
                </Button>
              </li>
              {offer && (
                <li>
                  <Button disabled={missionError !== null} onClick={() => dispatch({ type: 'forceCurfew', mission: true, drink })}>
                    {t.evening.missionTour(t.district[offer].name, credits(missionFee(game)))}
                    {drinkLabel}
                  </Button>
                  <Hint>{missionError ? t.error[missionError] : t.evening.missionTourHint(sealedCount(game))}</Hint>
                </li>
              )}
              <li>
                <Button variant="danger" disabled={curfewError !== null} onClick={() => dispatch({ type: 'forceCurfew', drink })}>
                  {t.evening.clandestineTour}
                  {drinkLabel}
                </Button>
                <Hint>{curfewError ? t.error[curfewError] : t.evening.clandestineHint(t.hud.wantedGain(WANTED.perOffense))}</Hint>
                {canInject(game) && <Hint tone="accent">{t.evening.injectionHint(game.progress.injections + 1, ENDINGS.resident.injections)}</Hint>}
              </li>
            </ul>
            {coolants.map((id) => (
              <label key={id} className="mt-2 flex items-center gap-1.5 text-xs text-ink-soft">
                <input
                  type="checkbox"
                  checked={game.autoCooling}
                  onChange={(event) => dispatch({ type: 'setAutoCooling', enabled: event.target.checked })}
                  className={FOCUS_RING}
                />
                {t.evening.cooling(PRODUCTS[id].cooling?.crates ?? 0, t.product[id].name)}
              </label>
            ))}
          </>
        ) : (
          <>
            <p className="text-night">{t.evening.nightNotice}</p>
            <Hint tone="info" className="mt-1">
              {game.mission ? t.evening.missionActive(t.district[game.mission.to].name) : t.evening.offMission}
            </Hint>
            {afterLine}
            {!game.mission && canInject(game) && (
              <Hint tone="accent" className="mt-1">
                {t.evening.injectionHint(game.progress.injections + 1, ENDINGS.resident.injections)}
              </Hint>
            )}
            <Button variant="primary" className="mt-2" onClick={() => dispatch({ type: 'sleep' })}>
              <BedDouble size={14} aria-hidden="true" />
              {sleepLabel}
            </Button>
          </>
        )}
      </Panel>
    </>
  )
}
