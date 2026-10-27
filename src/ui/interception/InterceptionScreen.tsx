import { ShieldAlert, Skull } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { BLUFF, BRIBE, EJECT, FLEE, ICC_MAX, RACKET, SEARCH } from '../../data/balance.ts'
import { PRODUCT_IDS, PRODUCTS } from '../../data/products.ts'
import type { Breakdown } from '../../engine/breakdown.ts'
import {
  bluffChance,
  bribeChance,
  bribeRate,
  checkMove,
  ejectChance,
  fleeChance,
  isLethalSearch,
  minimumOffer,
  searchSanction,
  toll,
} from '../../engine/interception.ts'
import type { InterceptionMove } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Detailed from '../shared/Detailed.tsx'
import { FOCUS_RING } from '../shared/focus.ts'
import InterceptionReportPanel from './InterceptionReportPanel.tsx'

type MoveCardProps = {
  move: InterceptionMove
  label: string
  chance: Breakdown | null
  /** Conséquences annoncées avant de valider (succès, échec) */
  outcomes: readonly string[]
  /** Contrôles propres à l'option (offre de corruption) ; sinon un bouton qui joue l'option */
  children?: ReactNode
}

type BribeFormProps = {
  label: string
}

/** Écran d'interception (chap. 6 et 9) : chaque option affiche sa chance détaillable et ses conséquences */
export default function InterceptionScreen() {
  // Les chances et les sanctions se calculent sur l'état entier de la partie
  const game = useGameStore((s) => s.game)
  const { t, percent, signedPercent, credits, number } = useI18n()
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
  const available = (move: InterceptionMove) => checkMove(game, move, move === 'bribe' ? minimumOffer(game) : 0) !== 'move-unavailable'

  const searchOutcome = sanction
    ? [t.interception.sanction(pct(sanction.fine), icc(-sanction.iccLoss)), ...custody(sanction.custodyDays)]
    : [t.interception.formality(icc(SEARCH.legalIccGain))]
  // Amende de la fouille si le bluff échoue : le moteur la relève
  const failedFine = searchSanction({ ...game, interception: { ...interception, bluffFailed: true } })?.fine ?? 0
  const { success: fled, fail: caught } = FLEE

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
          <MoveCard
            move="bluff"
            label={t.interception.moves.bluff}
            chance={bluffChance(game)}
            outcomes={[
              t.interception.bluffSuccess(icc(BLUFF.successIccGain)),
              t.interception.bluffFailure(icc(-BLUFF.failIccLoss), pct(failedFine), signedPercent(-BLUFF.followUpPenalty, 0)),
            ]}
          />
        )}
        {available('bribe') && (
          <MoveCard
            move="bribe"
            label={t.interception.moves.bribe}
            chance={null}
            outcomes={[t.interception.bribeFailure(pct(BRIBE.fail.fine), icc(-BRIBE.fail.iccLoss)), ...custody(BRIBE.fail.custodyDays)]}
          >
            <BribeForm label={t.interception.bribe} />
          </MoveCard>
        )}
        {available('payToll') && (
          <MoveCard move="payToll" label={t.interception.moves.payToll} chance={null} outcomes={[t.interception.toll(credits(toll(game)))]} />
        )}
        {available('flee') && (
          <MoveCard
            move="flee"
            label={racket ? t.interception.forceThrough : t.interception.moves.flee}
            chance={fleeChance(game)}
            outcomes={
              racket
                ? [t.interception.fleeSuccessRacket(`${pv(fled.chassisLoss.min)} / ${pv(fled.chassisLoss.max)}`), t.interception.fleeFailureRacket]
                : [
                    t.interception.fleeSuccess(`${pv(fled.chassisLoss.min)} / ${pv(fled.chassisLoss.max)}`, icc(-fled.iccLoss)),
                    t.interception.fleeFailure(pct(caught.cashSeizure), icc(-caught.iccLoss), pv(caught.chassisLoss), pv(caught.healthLoss)),
                    ...custody(caught.custodyDays),
                  ]
            }
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

function MoveCard({ move, label, chance, outcomes, children }: MoveCardProps) {
  const dispatch = useGameStore((s) => s.dispatch)
  const error = useGameStore((s) => checkMove(s.game, move))
  const racket = useGameStore((s) => s.game.interception?.kind === 'racket')
  const { t, percent } = useI18n()

  return (
    <li className="rounded border border-zinc-800 bg-zinc-900/40 p-3 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        {!children && (
          <Button variant="primary" disabled={error !== null} onClick={() => dispatch({ type: 'intercept', move })}>
            {label}
          </Button>
        )}
        {children && <span className="font-bold">{label}</span>}
        {chance && (
          <span className="flex gap-1.5">
            <span className="text-zinc-400">{t.interception.chance}</span>
            <Detailed breakdown={chance} format={(value) => percent(value, 0)} />
          </span>
        )}
      </div>
      {chance && !racket && <p className="mt-1 text-xs text-amber-200">{t.interception.odds(percent(chance.total, 0))}</p>}
      <ul className="mt-1 space-y-0.5 text-xs text-zinc-400">
        {outcomes.map((outcome) => (
          <li key={outcome}>{outcome}</li>
        ))}
      </ul>
      {!children && error && error !== 'move-unavailable' && <p className="mt-1 text-xs text-red-300">{t.error[error]}</p>}
      {children}
    </li>
  )
}

/** Offre de corruption : curseur de 0,5× le tarif à 3× et plus, chance mise à jour en temps réel (chap. 9) */
function BribeForm({ label }: BribeFormProps) {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits, percent, multiplier } = useI18n()
  const rate = bribeRate(game)
  const minimum = minimumOffer(game)
  // Offre en cours de saisie : état d'interface éphémère
  const [value, setValue] = useState(String(minimum))
  const offer = Math.floor(Number(value))
  const error = Number.isFinite(offer) ? checkMove(game, 'bribe', offer) : 'invalid-amount'
  const presets = [BRIBE.minOfferRatio, ...BRIBE.offerBonuses.map(({ ratio }) => ratio)]

  return (
    <div className="mt-2 flex flex-col gap-1.5">
      <p className="flex flex-wrap gap-1.5 text-xs">
        <span className="text-zinc-400">{t.interception.bribeRate}</span>
        <Detailed breakdown={rate} format={credits} />
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        {presets.map((ratio) => (
          <Button key={ratio} onClick={() => setValue(String(Math.max(minimum, Math.round(rate.total * ratio))))}>
            {multiplier(ratio)}
          </Button>
        ))}
        <input
          type="number"
          inputMode="numeric"
          min={minimum}
          step={1}
          value={value}
          aria-label={t.interception.offer}
          onChange={(event) => setValue(event.target.value)}
          className={`w-28 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm ${FOCUS_RING}`}
        />
        <Button variant="primary" disabled={error !== null} onClick={() => dispatch({ type: 'intercept', move: 'bribe', amount: offer })}>
          {label}
        </Button>
      </div>
      {error ? (
        <p className="text-xs text-red-300">{t.error[error]}</p>
      ) : (
        <p className="flex flex-wrap gap-1.5 text-xs">
          <span className="text-zinc-400">{t.interception.chance}</span>
          <Detailed breakdown={bribeChance(game, offer)} format={(chance) => percent(chance, 0)} />
          <span className="text-amber-200">{t.interception.odds(percent(bribeChance(game, offer).total, 0))}</span>
        </p>
      )}
    </div>
  )
}
