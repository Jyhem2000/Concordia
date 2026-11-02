import { ShieldAlert, Skull } from 'lucide-react'
import { BLUFF, BRIBE, DAMAGED_FACTOR, EJECT, FINE, FLEE, ICC_MAX, RACKET, SEARCH } from '../../data/balance.ts'
import { TAGS } from '../../data/tags.ts'
import { keysOf } from '../../engine/records.ts'
import { ejectMode } from '../../engine/equipment.ts'
import { MODULES } from '../../data/vehicles.ts'
import { PRODUCT_IDS, PRODUCTS } from '../../data/products.ts'
import { ownedQty } from '../../engine/cargo.ts'
import { paymentValue } from '../../engine/condition.ts'
import {
  checkpointPlace,
  checkMove,
  compartmentDetection,
  ejectChance,
  fineAmount,
  fleeConsequences,
  hiddenCargo,
  isLethalSearch,
  searchSanction,
  toll,
  tollInKind,
} from '../../engine/interception.ts'
import type { InterceptionMove } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Detailed from '../shared/Detailed.tsx'
import InterceptionReportPanel from './InterceptionReportPanel.tsx'
import MoveCard from './MoveCard.tsx'
import { BluffMove, BribeMove, FleeMove } from './TacticsMoves.tsx'
import Scene from '../shared/Scene.tsx'

/** Écran d'interception (chap. 5 et 7) : chaque option affiche sa chance détaillable et ses conséquences */
export default function InterceptionScreen() {
  // Les chances et les sanctions se calculent sur l'état entier de la partie
  const game = useGameStore((s) => s.game)
  const { t, percent, signedPercent, credits, number, change } = useI18n()
  const interception = game.interception
  if (!interception) return null

  const racket = interception.kind === 'racket'
  const pct = (fraction: number) => percent(fraction, 0)
  const icc = (points: number) => signedPercent(points / ICC_MAX, 0)
  const pv = (points: number) => number(-points)
  const lethalProduct = isLethalSearch(game)
    ? PRODUCT_IDS.find((id) => PRODUCTS[id].lethalOnSearch && game.cargo.some((lot) => lot.productId === id))
    : undefined
  const sanction = searchSanction(game)
  // Double fond (chap. 4) : caisses cachées, regroupées par produit
  const hidden = PRODUCT_IDS.flatMap((id) => {
    const qty = ownedQty(hiddenCargo(game).hidden, id)
    return qty > 0 ? [`${qty} × ${t.product[id].name}`] : []
  })
  // Protection du parrain (chap. 3) : caisses de la commande VIP mises de côté
  const covered = (interception.covered ?? []).map((lot) => `${lot.qty} × ${t.product[lot.productId].name}`)
  const custody = (days: number) => (days > 0 ? [t.interception.custody(days)] : [])
  const available = (move: InterceptionMove) => checkMove(game, move) !== 'move-unavailable'

  // Amende : une part de la valeur des caisses saisies ; impayée faute de Cash-Puce, la garde à vue s'allonge
  const fine = (rate: number) => t.interception.fine(pct(rate), credits(fineAmount(game, rate)))
  const unpaid = (rate: number) => (fineAmount(game, rate) > game.cash ? [t.interception.unpaid(FINE.unpaidCustodyDays)] : [])
  const searchOutcome = sanction
    ? [t.interception.sanction(fine(sanction.fineRate), icc(-sanction.iccLoss)), ...custody(sanction.custodyDays), ...unpaid(sanction.fineRate)]
    : [t.interception.formality(icc(SEARCH.legalIccGain))]
  // Amende de la fouille si le bluff échoue : le moteur la relève
  const failedFine = searchSanction({ ...game, interception: { ...interception, bluffFailed: true } })?.fineRate ?? 0
  const { fail: caught } = FLEE
  // Dégâts et pertes annoncés avec l'équipement actuel (pare-buffles, transpondeur, plaque rotative)
  const fled = fleeConsequences(game)
  const mode = ejectMode(game)
  // Risques propres à la soute pendant une fuite : casse des fragiles (chap. 2)
  const cargoRisks = keysOf(TAGS).flatMap((tag) => {
    const { breakage } = TAGS[tag]
    if (!game.cargo.some((lot) => PRODUCTS[lot.productId].tags.includes(tag))) return []
    return [...(breakage ? [t.interception.breakageRisk(t.tag[tag].name, pct(breakage.fleeChance), change(DAMAGED_FACTOR))] : [])]
  })

  return (
    <Scene
      tone="danger"
      icon={ShieldAlert}
      title={t.interception.title[interception.kind]}
      intro={
        <>
          <p className="text-ink-soft">
            {t.interception.intro[interception.kind](t.interception.place[checkpointPlace(game)](t.district[game.districtId].name))}
          </p>
          {interception.jammed && <p className="text-info">{t.interception.jammed}</p>}
          {!racket && hidden.length > 0 && (
            <p className="text-info">
              {t.interception.compartment(hidden.join(', '))} <Detailed breakdown={compartmentDetection(game)} format={pct} percent />
            </p>
          )}
          {covered.length > 0 && <p className="text-accent">{t.interception.sponsorCovered(covered.join(', '))}</p>}
          {lethalProduct && !racket && (
            <p role="alert" className="mt-1 flex items-center gap-1.5 font-bold text-danger">
              <Skull size={16} aria-hidden="true" />
              {t.interception.lethal(t.product[lethalProduct].name)}
            </p>
          )}
        </>
      }
    >
      <InterceptionReportPanel />

      <ul className="flex flex-col gap-3">
        {available('search') && (
          <MoveCard move="search" label={t.interception.moves.search} chance={null} outcomes={searchOutcome} info={t.interception.searchInfo} />
        )}
        {available('bluff') && (
          <BluffMove
            label={t.interception.moves.bluff}
            info={t.interception.bluffInfo}
            outcomes={[
              t.interception.bluffSuccess(icc(BLUFF.successIccGain)),
              t.interception.bluffFailure(icc(-BLUFF.failIccLoss), fine(failedFine), signedPercent(-BLUFF.followUpPenalty, 0), available('flee')),
            ]}
          />
        )}
        {available('bribe') && (
          <BribeMove
            label={t.interception.moves.bribe}
            info={t.interception.bribeInfo}
            outcomes={[
              t.interception.bribeSuccess,
              t.interception.bribeFailure(fine(BRIBE.fail.fineRate), icc(-BRIBE.fail.iccLoss)),
              ...custody(BRIBE.fail.custodyDays),
              ...unpaid(BRIBE.fail.fineRate),
            ]}
          />
        )}
        {available('payToll') && (
          <MoveCard move="payToll" label={t.interception.moves.payToll} chance={null} outcomes={[t.interception.toll(credits(toll(game)))]} />
        )}
        {available('payTollInKind') && (
          <MoveCard
            move="payTollInKind"
            label={t.interception.moves.payTollInKind}
            chance={null}
            outcomes={[
              t.interception.tollInKind(
                tollInKind(game)
                  .map(({ productId, qty }) => `${qty} × ${t.product[productId].name}`)
                  .join(', '),
                credits(paymentValue(game, tollInKind(game))),
              ),
            ]}
          />
        )}
        {available('flee') && (
          <FleeMove
            label={racket ? t.interception.forceThrough : t.interception.moves.flee}
            info={racket ? undefined : t.interception.fleeInfo}
            outcomes={[
              ...(racket
                ? [t.interception.fleeSuccessRacket(`${pv(fled.chassis.min)} / ${pv(fled.chassis.max)}`), t.interception.fleeFailureRacket]
                : [
                    t.interception.fleeSuccess(
                      `${pv(fled.chassis.min)} / ${pv(fled.chassis.max)}`,
                      icc(-fled.iccLoss),
                      fled.wanted > 0 ? t.hud.wantedGain(fled.wanted) : t.interception.plateCovers,
                    ),
                    t.interception.fleeFailure(fine(caught.fineRate), icc(-caught.iccLoss), pv(fled.failChassis), pv(fled.failHealth)),
                    ...custody(caught.custodyDays),
                  ]),
              ...cargoRisks,
            ]}
          />
        )}
        {available('eject') && (
          <MoveCard
            move="eject"
            label={mode ? t.interception.ejectMode[mode] : t.interception.moves.eject}
            chance={ejectChance(game)}
            outcomes={[
              mode === 'trapdoor'
                ? t.interception.ejectTrapdoor(pct(MODULES['MOD-07'].trapdoor?.maxRecovery ?? 0), MODULES['MOD-07'].trapdoor?.cooldownDays ?? 0)
                : mode === 'crusher'
                  ? t.interception.ejectCrusher
                  : t.interception.ejectSuccess(pv(EJECT.chassisLoss)),
              t.interception.ejectFailure(pct(EJECT.fail.fineRaise), icc(-EJECT.fail.iccLoss)),
              ...custody(EJECT.fail.custodyDays),
            ]}
          />
        )}
        {available('refuseToll') && (
          <MoveCard
            move="refuseToll"
            label={t.interception.moves.refuseToll}
            chance={null}
            outcomes={[t.interception.refuse(pct(RACKET.refuse.lootShare), pv(RACKET.refuse.healthLoss), pv(RACKET.refuse.chassisLoss))]}
          />
        )}
      </ul>
    </Scene>
  )
}
