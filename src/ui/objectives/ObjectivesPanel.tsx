import { Check, Target, X } from 'lucide-react'
import { ENDINGS } from '../../data/balance.ts'
import { ownedQty } from '../../engine/cargo.ts'
import { offshoreBalance } from '../../engine/finance.ts'
import { iccTier } from '../../engine/gauges.ts'
import type { EndingId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'

type Condition = { label: string; met: boolean }

/** « Objectifs du Jour 30 » : les grandes fins et la progression vers chacune, une fois la dette initiale soldée (chap. 9) */
export default function ObjectivesPanel() {
  const game = useGameStore((s) => s.game)
  const { t, credits } = useI18n()
  if (!game.initialDebtPaid) return null

  const score = offshoreBalance(game.offshore)
  const scoreCondition = (min: number): Condition => ({ label: `${t.objectives.score} ${t.objectives.threshold(credits(min))}`, met: score >= min })
  const goals: { id: EndingId; conditions: Condition[] }[] = [
    {
      id: 'saboteur',
      conditions: [
        scoreCondition(ENDINGS.saboteur.minScore),
        {
          label: t.objectives.inCargo(t.product[ENDINGS.saboteur.requiredProduct].name),
          met: ownedQty(game.cargo, ENDINGS.saboteur.requiredProduct) > 0,
        },
        { label: t.objectives.atMidnight(t.district[ENDINGS.saboteur.district].name), met: game.districtId === ENDINGS.saboteur.district },
      ],
    },
    {
      id: 'elite',
      conditions: [scoreCondition(ENDINGS.elite.minScore), { label: t.objectives.goldStatus, met: iccTier(game.icc) === ENDINGS.elite.iccTier }],
    },
    { id: 'mafia', conditions: [scoreCondition(ENDINGS.mafia.minScore)] },
  ]

  return (
    <details className="rounded border border-zinc-800 bg-zinc-900/40 p-3 text-sm">
      <summary className="flex cursor-pointer items-center gap-1.5 font-bold text-amber-300 uppercase">
        <Target size={14} />
        {t.objectives.title}
        <span className="ml-auto font-normal text-cyan-300 normal-case">{credits(score)}</span>
      </summary>
      <ul className="mt-2 space-y-2">
        {goals.map(({ id, conditions }) => (
          <li key={id}>
            <div className="font-bold">{t.end.endings[id].title}</div>
            <ul className="text-xs">
              {conditions.map(({ label, met }) => (
                <li key={label} className={`flex items-center gap-1.5 ${met ? 'text-green-400' : 'text-zinc-400'}`}>
                  {met ? <Check size={12} /> : <X size={12} />}
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
