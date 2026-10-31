import { BedDouble, Hourglass, PartyPopper, Siren } from 'lucide-react'
import { AFTER, ENDINGS, WANTED } from '../../data/balance.ts'
import { TAGS } from '../../data/tags.ts'
import { PRODUCT_IDS, PRODUCTS } from '../../data/products.ts'
import { ownedQty } from '../../engine/cargo.ts'
import { checkForceCurfew } from '../../engine/actions.ts'
import { canInject, checkMission, missionFee, missionOffer, sealedCount } from '../../engine/night.ts'
import { nightUnlock } from '../../engine/progress.ts'
import { sleepsAtRelay } from '../../engine/routine.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import ConfirmButton from '../shared/ConfirmButton.tsx'
import { FOCUS_RING } from '../shared/focus.ts'
import Hint from '../shared/Hint.tsx'
import Panel from '../shared/Panel.tsx'
import Tip from '../shared/Tip.tsx'

/** Un choix du soir : côte à côte sur grand écran, l'un sous l'autre quand la place manque */
const CHOICE = 'flex min-w-0 flex-1 basis-48 flex-col gap-1'

/**
 * Dilemme de 20h00 (chap. 1) : de jour, attendre le soir sur place ; le soir venu, mission de nuit, tournée clandestine ou
 * sommeil ; le plein se fait à la pompe (onglet Lieux)
 */
export default function EveningPanel() {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits, change, percent } = useI18n()

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
  // Produit qui mène à l'exécution sommaire si la soute est fouillée (chap. 5)
  const lethal = PRODUCT_IDS.find((id) => PRODUCTS[id].lethalOnSearch && ownedQty(game.cargo, id) > 0)
  // Eau qui refroidit le moteur la nuit (chap. 2)
  const coolants = PRODUCT_IDS.filter((id) => PRODUCTS[id].cooling && ownedQty(game.cargo, id) > 0)
  // After du couvre-feu de ce soir, annoncée dès 06h00 (chap. 1)
  const afterLine = (
    <Hint tone="event" icon={PartyPopper} className="mt-1">
      {t.evening.after(
        t.district[game.after].name,
        change(AFTER.festiveFactor),
        change(TAGS[AFTER.tag].nightSale ?? 1),
        percent(1 - AFTER.nightRiskFactor, 0),
      )}
    </Hint>
  )

  return (
    <>
      <Panel
        icon={Siren}
        title={t.evening.curfewTitle}
        info={
          <>
            <p>{t.evening.curfewInfo}</p>
            <p className="mt-1">{t.evening.nightRule}</p>
            <p className="mt-1">{t.evening.beforeEvening}</p>
          </>
        }
        collapseId="curfew"
      >
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
            {game.contract && (
              <Hint tone="warning" className="mt-1">
                {t.evening.contractTonight(t.district[game.contract.to].name)}
              </Hint>
            )}
            {!game.dayTripDone ? (
              // Journée en cours : rester sur place jusqu'au soir ; les trajets de jour partent de la carte (Aller)
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Button onClick={() => dispatch({ type: 'waitEvening' })}>
                  <Hourglass size={14} aria-hidden="true" />
                  {t.evening.wait}
                </Button>
                <Tip label={t.evening.wait} content={t.evening.waitHint} />
              </div>
            ) : (
              /* Le soir : les choix côte à côte */
              <ul className="mt-2 flex flex-wrap items-start gap-2">
                {offer && (
                  <li className={CHOICE}>
                    <Button
                      className="w-full"
                      disabled={missionError !== null}
                      reason={missionError ? t.error[missionError] : null}
                      onClick={() => dispatch({ type: 'forceCurfew', mission: true, drink })}
                    >
                      {t.evening.missionTour(t.district[offer].name, credits(missionFee(game)))}
                      {drinkLabel}
                    </Button>
                    <Hint>
                      {t.evening.missionTourShort} <Tip label={t.evening.missionTourShort} content={t.evening.missionTourHint(sealedCount(game))} />
                    </Hint>
                  </li>
                )}
                <li className={CHOICE}>
                  <ConfirmButton
                    variant="danger"
                    className="w-full"
                    disabled={curfewError !== null}
                    reason={curfewError ? t.error[curfewError] : null}
                    onClick={() => dispatch({ type: 'forceCurfew', drink })}
                    confirm={
                      lethal
                        ? { title: t.evening.lethalConfirm, message: t.evening.lethalWarning(t.product[lethal].name), action: t.evening.lethalAction }
                        : undefined
                    }
                  >
                    {t.evening.clandestineTour}
                    {drinkLabel}
                  </ConfirmButton>
                  <Hint>
                    {t.evening.clandestineShort}{' '}
                    <Tip label={t.evening.clandestineShort} content={t.evening.clandestineHint(t.hud.wantedGain(WANTED.perOffense))} />
                  </Hint>
                  {canInject(game) && <Hint tone="accent">{t.evening.injectionHint(game.progress.injections + 1, ENDINGS.resident.injections)}</Hint>}
                </li>
                <li className={CHOICE}>
                  <Button variant="primary" className="w-full" onClick={() => dispatch({ type: 'sleep' })}>
                    <BedDouble size={14} aria-hidden="true" />
                    {sleepLabel}
                  </Button>
                  <Hint>
                    {t.evening.sleepShort} <Tip label={sleepLabel} content={sleepsAtRelay(game) ? t.evening.sleepRelayHint : t.evening.bivouacHint} />
                  </Hint>
                </li>
              </ul>
            )}
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
