import { ShieldAlert, Skull } from 'lucide-react'
import { useState } from 'react'
import { BLUFF, BRIBE, DAMAGED_FACTOR, EJECT, FLEE, ICC_MAX, RACKET, SEARCH } from '../../data/balance.ts'
import { DISTRICTS } from '../../data/districts.ts'
import { TAGS } from '../../data/tags.ts'
import { keysOf } from '../../engine/records.ts'
import { PRODUCT_IDS, PRODUCTS } from '../../data/products.ts'
import { averageCost, ownedQty } from '../../engine/cargo.ts'
import { paymentValue } from '../../engine/condition.ts'
import {
  bribeChance,
  bribeRate,
  checkMove,
  ejectChance,
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
import { FOCUS_RING } from '../shared/focus.ts'
import InterceptionReportPanel from './InterceptionReportPanel.tsx'
import MoveCard from './MoveCard.tsx'
import { BluffMove, FleeMove } from './TacticsMoves.tsx'

type BribeFormProps = {
  label: string
}

type CrateOfferRowProps = {
  productId: ProductId
  qty: number
  onChange: (qty: number) => void
}

/** Écran d'interception (chap. 6 et 10) : chaque option affiche sa chance détaillable et ses conséquences */
export default function InterceptionScreen() {
  // Les chances et les sanctions se calculent sur l'état entier de la partie
  const game = useGameStore((s) => s.game)
  const { t, percent, signedPercent, credits, number, multiplier } = useI18n()
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
  const custody = (days: number) => (days > 0 ? [t.interception.custody(days)] : [])
  const available = (move: InterceptionMove) => checkMove(game, move) !== 'move-unavailable'

  const searchOutcome = sanction
    ? [t.interception.sanction(pct(sanction.fine), icc(-sanction.iccLoss)), ...custody(sanction.custodyDays)]
    : [t.interception.formality(icc(SEARCH.legalIccGain))]
  // Amende de la fouille si le bluff échoue : le moteur la relève
  const failedFine = searchSanction({ ...game, interception: { ...interception, bluffFailed: true } })?.fine ?? 0
  const { success: fled, fail: caught } = FLEE
  // Risques propres à la soute pendant une fuite : casse des fragiles, explosion des inflammables (chap. 3)
  const cargoRisks = keysOf(TAGS).flatMap((tag) => {
    const { breakage, explosion } = TAGS[tag]
    if (!game.cargo.some((lot) => PRODUCTS[lot.productId].tags.includes(tag))) return []
    return [
      ...(breakage ? [t.interception.breakageRisk(t.tag[tag].name, pct(breakage.fleeChance), multiplier(DAMAGED_FACTOR))] : []),
      ...(explosion ? [t.interception.explosionRisk(t.tag[tag].name, pct(explosion.chance), pv(explosion.chassisLoss))] : []),
    ]
  })

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4">
      <section className="rounded border border-red-800 bg-red-950/30 p-4">
        <h1 className="flex items-center gap-2 text-xl font-bold text-red-300 uppercase">
          <ShieldAlert size={20} aria-hidden="true" />
          {t.interception.title[interception.kind]}
        </h1>
        <p className="mt-1 text-zinc-300">{t.interception.intro[interception.kind](t.district[game.districtId].name)}</p>
        {lethalProduct && !racket && (
          <p role="alert" className="mt-2 flex items-center gap-1.5 font-bold text-red-400">
            <Skull size={16} aria-hidden="true" />
            {t.interception.lethal(t.product[lethalProduct].name)}
          </p>
        )}
      </section>

      <InterceptionReportPanel />

      <ul className="flex flex-col gap-3">
        {available('search') && <MoveCard move="search" label={t.interception.moves.search} chance={null} outcomes={searchOutcome} />}
        {available('bluff') && (
          <BluffMove
            label={t.interception.moves.bluff}
            outcomes={[
              t.interception.bluffSuccess(icc(BLUFF.successIccGain)),
              t.interception.bluffFailure(icc(-BLUFF.failIccLoss), pct(failedFine), signedPercent(-BLUFF.followUpPenalty, 0), available('flee')),
            ]}
          />
        )}
        {available('bribe') && (
          <MoveCard
            move="bribe"
            label={t.interception.moves.bribe}
            chance={null}
            customAction
            outcomes={[t.interception.bribeFailure(pct(BRIBE.fail.fine), icc(-BRIBE.fail.iccLoss)), ...custody(BRIBE.fail.custodyDays)]}
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
                ? [t.interception.fleeSuccessRacket(`${pv(fled.chassisLoss.min)} / ${pv(fled.chassisLoss.max)}`), t.interception.fleeFailureRacket]
                : [
                    t.interception.fleeSuccess(`${pv(fled.chassisLoss.min)} / ${pv(fled.chassisLoss.max)}`, icc(-fled.iccLoss)),
                    t.interception.fleeFailure(pct(caught.cashSeizure), icc(-caught.iccLoss), pv(caught.chassisLoss), pv(caught.healthLoss)),
                    ...custody(caught.custodyDays),
                  ]),
              ...cargoRisks,
            ]}
          />
        )}
        {available('eject') && (
          <MoveCard
            move="eject"
            label={t.interception.moves.eject}
            chance={ejectChance()}
            outcomes={[
              t.interception.ejectSuccess(pv(EJECT.chassisLoss)),
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
    </main>
  )
}

/** Offre de corruption : Cash-Puce et caisses, chance mise à jour en temps réel (chap. 6 et 10) */
function BribeForm({ label }: BribeFormProps) {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits, percent, multiplier } = useI18n()
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
  const owned = [...new Set(game.cargo.map((lot) => lot.productId))]
  const setQty = (productId: ProductId, qty: number) => setCrates((current) => ({ ...current, [productId]: qty }))

  return (
    <div className="mt-2 flex flex-col gap-2">
      <p className="flex flex-wrap gap-1.5 text-xs">
        <span className="text-zinc-400">{t.interception.bribeRate}</span>
        <Detailed breakdown={rate} format={credits} />
      </p>

      {owned.length > 0 && (
        <div>
          <p className="text-xs text-zinc-400">{t.interception.offerCrates}</p>
          <ul className="mt-1 space-y-1">
            {owned.map((productId) => (
              <CrateOfferRow key={productId} productId={productId} qty={crates[productId] ?? 0} onChange={(qty) => setQty(productId, qty)} />
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-zinc-400">{t.interception.offerCash}</span>
        {presets.map((ratio) => (
          <Button key={ratio} onClick={() => setCashValue(String(Math.max(0, Math.round(rate.total * ratio) - cratesValue)))}>
            {multiplier(ratio)}
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
          className={`w-28 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm ${FOCUS_RING}`}
        />
      </div>

      <p className="text-xs">{t.interception.offerTotal(credits(offerValue(game, offer)))}</p>
      {error ? (
        <p className="text-xs text-red-300">{t.error[error]}</p>
      ) : (
        <p className="flex flex-wrap gap-1.5 text-xs">
          <span className="text-zinc-400">{t.interception.chance}</span>
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

/** Une ligne de caisses à offrir : valeur en paiement, prix d'achat, gain ou perte face au cash (chap. 7) */
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
      <span className="text-zinc-400">{t.interception.crateValue(credits(value), credits(Math.round(cost)))}</span>
      <span className={gain >= 0 ? 'text-green-400' : 'text-red-300'}>{t.interception.crateGain(signedCredits(Math.round(gain)))}</span>
      {favorite && <span className="text-amber-300">{t.interception.favorite}</span>}
    </li>
  )
}
