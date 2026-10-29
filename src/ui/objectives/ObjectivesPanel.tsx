import { Check, Target, X } from 'lucide-react'
import { ENDINGS, GAME_LENGTH_DAYS } from '../../data/balance.ts'
import { ownedQty } from '../../engine/cargo.ts'
import { offshoreBalance } from '../../engine/finance.ts'
import { iccTier } from '../../engine/gauges.ts'
import type { EndingId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import { FOCUS_RING } from '../shared/focus.ts'

type Condition = {
  label: string
  met: boolean
}

/** « Objectifs du Jour 30 » : les grandes fins et la progression vers chacune, une fois la dette initiale soldée (chap. 10) */
export default function ObjectivesPanel() {
  const unlocked = useGameStore((s) => s.game.initialDebtPaid)
  const score = useGameStore((s) => offshoreBalance(s.game.offshore))
  const cargo = useGameStore((s) => s.game.cargo)
  const districtId = useGameStore((s) => s.game.districtId)
  const icc = useGameStore((s) => s.game.icc)
  const progress = useGameStore((s) => s.game.progress)
  const { t, credits } = useI18n()
  if (!unlocked) return null

  const scoreCondition = (min: number): Condition => ({ label: `${t.objectives.score} ${t.objectives.threshold(credits(min))}`, met: score >= min })
  const goals: { id: EndingId; conditions: Condition[] }[] = [
    {
      id: 'saboteur',
      conditions: [
        scoreCondition(ENDINGS.saboteur.minScore),
        {
          label: t.objectives.inCargo(t.product[ENDINGS.saboteur.requiredProduct].name),
          met: ownedQty(cargo, ENDINGS.saboteur.requiredProduct) > 0,
        },
        { label: t.objectives.atMidnight(t.district[ENDINGS.saboteur.district].name), met: districtId === ENDINGS.saboteur.district },
      ],
    },
    {
      id: 'resident',
      conditions: [
        scoreCondition(ENDINGS.resident.minScore),
        {
          label: t.objectives.injections(Math.min(progress.injections, ENDINGS.resident.injections), ENDINGS.resident.injections),
          met: progress.injections >= ENDINGS.resident.injections,
        },
      ],
    },
    {
      id: 'elite',
      conditions: [
        scoreCondition(ENDINGS.elite.minScore),
        {
          label: t.objectives.sponsor(Math.min(progress.vipOrders, ENDINGS.elite.sponsorOrders), ENDINGS.elite.sponsorOrders),
          met: progress.vipOrders >= ENDINGS.elite.sponsorOrders,
        },
        { label: t.objectives.goldStatus, met: iccTier(icc) === ENDINGS.elite.iccTier },
      ],
    },
    { id: 'mafia', conditions: [scoreCondition(ENDINGS.mafia.minScore)] },
  ]

  return (
    <details className="rounded border border-zinc-800 bg-zinc-900/40 p-3 text-sm">
      <summary className={`flex cursor-pointer items-center gap-1.5 rounded font-bold text-amber-300 uppercase ${FOCUS_RING}`}>
        <Target size={14} aria-hidden="true" />
        {t.objectives.title(GAME_LENGTH_DAYS)}
        <span className="ml-auto font-normal text-cyan-300 normal-case">{credits(score)}</span>
      </summary>
      <ul className="mt-2 space-y-2">
        {goals.map(({ id, conditions }) => (
          <li key={id}>
            <div className="font-bold">{t.end.endings[id].title}</div>
            <ul className="text-xs">
              {conditions.map(({ label, met }) => (
                <li key={label} className={`flex items-center gap-1.5 ${met ? 'text-green-400' : 'text-zinc-400'}`}>
                  {met ? <Check size={12} aria-hidden="true" /> : <X size={12} aria-hidden="true" />}
                  <span className="sr-only">{met ? t.objectives.met : t.objectives.unmet}</span>
                  {label}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </details>
  )
}
