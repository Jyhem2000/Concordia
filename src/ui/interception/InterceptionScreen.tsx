import { ShieldAlert, Skull } from 'lucide-react'
import { useState } from 'react'
import { BLUFF, BRIBE, DAMAGED_FACTOR, EJECT, FINE, FLEE, ICC_MAX, RACKET, SEARCH, WANTED } from '../../data/balance.ts'
import { DISTRICTS } from '../../data/districts.ts'
import { TAGS } from '../../data/tags.ts'
import { keysOf } from '../../engine/records.ts'
import { ejectMode } from '../../engine/equipment.ts'
import { MODULES } from '../../data/vehicles.ts'
import { PRODUCT_IDS, PRODUCTS } from '../../data/products.ts'
import { averageCost, ownedQty } from '../../engine/cargo.ts'
import { paymentValue } from '../../engine/condition.ts'
import {
  bribeChance,
  checkpointPlace,
  bribeRate,
  checkMove,
  compartmentDetection,
  ejectChance,
  fineAmount,
  fleeConsequences,
  hiddenCargo,
  isLethalSearch,
  minimumOffer,
  offerValue,
  searchSanction,
  toll,
  tollInKind,
} from '../../engine/interception.ts'
import type { InterceptionMove, Offer, ProductId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Detailed from '../shared/Detailed.tsx'
import InterceptionReportPanel from './InterceptionReportPanel.tsx'
import MoveCard from './MoveCard.tsx'
import { BluffMove, FleeMove } from './TacticsMoves.tsx'
import { FIELD } from '../shared/styles.ts'
import Hint from '../shared/Hint.tsx'
import Scene from '../shared/Scene.tsx'

type BribeFormProps = {
  label: string
}

type CrateOfferRowProps = {
  productId: ProductId
  qty: number
  onChange: (qty: number) => void
}

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
  // Risques propres à la soute pendant une fuite : casse des fragiles, explosion des inflammables (chap. 2)
  const cargoRisks = keysOf(TAGS).flatMap((tag) => {
    const { breakage, explosion } = TAGS[tag]
    if (!game.cargo.some((lot) => PRODUCTS[lot.productId].tags.includes(tag))) return []
    return [
      ...(breakage ? [t.interception.breakageRisk(t.tag[tag].name, pct(breakage.fleeChance), change(DAMAGED_FACTOR))] : []),
      ...(explosion ? [t.interception.explosionRisk(t.tag[tag].name, pct(explosion.chance), pv(explosion.chassisLoss))] : []),
    ]
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
            <p className="flex flex-wrap gap-1.5 text-info">
              {t.interception.compartment(hidden.join(', '))}
              <Detailed breakdown={compartmentDetection(game)} format={pct} />
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
        {available('search') && <MoveCard move="search" label={t.interception.moves.search} chance={null} outcomes={searchOutcome} />}
        {available('bluff') && (
          <BluffMove
            label={t.interception.moves.bluff}
            outcomes={[
              t.interception.bluffSuccess(icc(BLUFF.successIccGain)),
              t.interception.bluffFailure(icc(-BLUFF.failIccLoss), fine(failedFine), signedPercent(-BLUFF.followUpPenalty, 0), available('flee')),
            ]}
          />
        )}
        {available('bribe') && (
          <MoveCard
            move="bribe"
            label={t.interception.moves.bribe}
            chance={null}
            customAction
            outcomes={[
              t.interception.bribeFailure(fine(BRIBE.fail.fineRate), icc(-BRIBE.fail.iccLoss)),
              ...custody(BRIBE.fail.custodyDays),
              ...unpaid(BRIBE.fail.fineRate),
            ]}
          >
            <BribeForm label={t.interception.bribe} />
          </MoveCard>
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
            outcomes={[
              ...(racket
                ? [t.interception.fleeSuccessRacket(`${pv(fled.chassis.min)} / ${pv(fled.chassis.max)}`), t.interception.fleeFailureRacket]
                : [
                    t.interception.fleeSuccess(
                      `${pv(fled.chassis.min)} / ${pv(fled.chassis.max)}`,
                      icc(-fled.iccLoss),
                      t.hud.wantedGain(WANTED.perOffense),
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

/** Offre de corruption : Cash-Puce et caisses, chance mise à jour en temps réel (chap. 5 et 7) */
function BribeForm({ label }: BribeFormProps) {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits, percent } = useI18n()
  const rate = bribeRate(game)
  const minimum = minimumOffer(game)
  // Offre en cours de composition : état d'interface éphémère
  const [cashValue, setCashValue] = useState(String(minimum))
  const [crates, setCrates] = useState<Partial<Record<ProductId, number>>>({})

  const offeredCrates = PRODUCT_IDS.flatMap((productId) => {
    const qty = crates[productId] ?? 0
    return qty > 0 ? [{ productId, qty }] : []
  })
  const cash = Math.floor(Number(cashValue))
  const offer: Offer = { cash: Number.isFinite(cash) ? cash : -1, crates: offeredCrates }
  const error = checkMove(game, 'bribe', offer)
  const cratesValue = paymentValue(game, offeredCrates)
  const presets = [BRIBE.minOfferRatio, ...BRIBE.offerBonuses.map(({ ratio }) => ratio)]
  const owned = [...new Set(game.cargo.map((lot) => lot.productId))].filter((id) => !PRODUCTS[id].sealed)
  const setQty = (productId: ProductId, qty: number) => setCrates((current) => ({ ...current, [productId]: qty }))

  return (
    <div className="mt-2 flex flex-col gap-2">
      <p className="flex flex-wrap gap-1.5 text-xs">
        <span className="text-ink-muted">{t.interception.bribeRate}</span>
        <Detailed breakdown={rate} format={credits} />
      </p>

      {owned.length > 0 && (
        <div>
          <Hint>{t.interception.offerCrates}</Hint>
          <ul className="mt-1 space-y-1">
            {owned.map((productId) => (
              <CrateOfferRow key={productId} productId={productId} qty={crates[productId] ?? 0} onChange={(qty) => setQty(productId, qty)} />
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-ink-muted">{t.interception.offerCash}</span>
        {presets.map((ratio) => (
          <Button key={ratio} onClick={() => setCashValue(String(Math.max(0, Math.round(rate.total * ratio) - cratesValue)))}>
            {percent(ratio, 0)}
          </Button>
        ))}
        <input
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          value={cashValue}
          aria-label={t.interception.offerCash}
          onChange={(event) => setCashValue(event.target.value)}
          className={`w-28 ${FIELD}`}
        />
      </div>

      <Hint tone="neutral">{t.interception.offerTotal(credits(offerValue(game, offer)))}</Hint>
      {error ? (
        <Hint tone="danger">{t.error[error]}</Hint>
      ) : (
        <p className="flex flex-wrap gap-1.5 text-xs">
          <span className="text-ink-muted">{t.interception.chance}</span>
          <Detailed breakdown={bribeChance(game, offer)} format={(chance) => percent(chance, 0)} />
        </p>
      )}
      <div>
        <Button variant="primary" disabled={error !== null} onClick={() => dispatch({ type: 'intercept', move: 'bribe', offer })}>
          {label}
        </Button>
      </div>
    </div>
  )
}

/** Une ligne de caisses à offrir : valeur en paiement, prix d'achat, gain ou perte face au cash (chap. 2) */
function CrateOfferRow({ productId, qty, onChange }: CrateOfferRowProps) {
  const owned = useGameStore((s) => ownedQty(s.game.cargo, productId))
  const cost = useGameStore((s) => averageCost(s.game.cargo, productId) ?? 0)
  const favorite = useGameStore((s) => DISTRICTS[s.game.districtId].bribeFavorites.includes(productId))
  const { t, credits, signedCredits } = useI18n()
  const value = PRODUCTS[productId].basePrice
  const gain = value - cost

  return (
    <li className="flex flex-wrap items-center gap-1.5 text-xs">
      <Button aria-label={t.interception.removeCrate(t.product[productId].name)} disabled={qty <= 0} onClick={() => onChange(qty - 1)}>
        −
      </Button>
      <span className="w-10 text-center">
        {qty}/{owned}
      </span>
      <Button aria-label={t.interception.addCrate(t.product[productId].name)} disabled={qty >= owned} onClick={() => onChange(qty + 1)}>
        +
      </Button>
      <span className="font-bold">{t.product[productId].name}</span>
      <span className="text-ink-muted">{t.interception.crateValue(credits(value), credits(Math.round(cost)))}</span>
      <span className={gain >= 0 ? 'text-success' : 'text-danger'}>{t.interception.crateGain(signedCredits(Math.round(gain)))}</span>
      {favorite && <span className="text-accent">{t.interception.favorite}</span>}
    </li>
  )
}
