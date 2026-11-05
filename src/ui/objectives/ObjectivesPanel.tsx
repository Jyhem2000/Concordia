import { Check, Target, X } from 'lucide-react'
import { ENDINGS, GAME_LENGTH_DAYS } from '../../data/balance.ts'
import { ownedQty } from '../../engine/cargo.ts'
import { scoreOf } from '../../engine/finance.ts'
import { iccTier } from '../../engine/gauges.ts'
import type { EndingId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Panel from '../shared/Panel.tsx'

type Condition = {
  label: string
  met: boolean
}

/** « Objectifs du Jour 30 » : les grandes fins et la progression vers chacune, une fois la dette initiale soldée (chap. 7) */
export default function ObjectivesPanel() {
  const unlocked = useGameStore((s) => s.game.initialDebtPaid)
  const score = useGameStore((s) => scoreOf(s.game))
  const cargo = useGameStore((s) => s.game.cargo)
  const districtId = useGameStore((s) => s.game.districtId)
  const icc = useGameStore((s) => s.game.icc)
  const wanted = useGameStore((s) => s.game.wanted)
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
    { id: 'notable', conditions: [scoreCondition(ENDINGS.notable.minScore)] },
    {
      id: 'exemplary',
      conditions: [
        scoreCondition(ENDINGS.exemplary.minScore),
        { label: t.objectives.goldAtMidnight, met: iccTier(icc) === ENDINGS.exemplary.iccTier },
        { label: t.objectives.cleanRecord, met: wanted <= ENDINGS.exemplary.maxWanted },
      ],
    },
  ]

  return (
    <Panel
      icon={Target}
      title={t.objectives.title(GAME_LENGTH_DAYS)}
      collapseId="objectives"
      aside={<span className="font-bold text-offshore">{credits(score)}</span>}
    >
      <ul className="space-y-2">
        {goals.map(({ id, conditions }) => (
          <li key={id}>
            <div className="font-bold">{t.end.endings[id].title}</div>
            <ul className="text-xs">
              {conditions.map(({ label, met }) => (
                <li key={label} className={`flex items-center gap-1.5 ${met ? 'text-success' : 'text-ink-muted'}`}>
                  {met ? <Check size={12} aria-hidden="true" /> : <X size={12} aria-hidden="true" />}
                  <span className="sr-only">{met ? t.objectives.met : t.objectives.unmet}</span>
                  {label}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
