import { ENDINGS } from '../../data/balance.ts'
import { CREW } from '../../data/vehicles.ts'
import { checkHire, CREW_IDS, hireFee, inKindCrate, salary } from '../../engine/crew.ts'
import type { CrewId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Locked from '../shared/Locked.tsx'
import { FOCUS_RING } from '../shared/focus.ts'
import Hint from '../shared/Hint.tsx'
import Thumb from '../shared/Thumb.tsx'

type CrewOfferProps = {
  crewId: CrewId
}

/** Le Quai 9 : recrutement, renvoi et salaire de l'équipier (chap. 3 et 4) */
export default function CrewDesk() {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits } = useI18n()
  const { active, paidDay, payInKind } = game.crew
  const inKind = active ? CREW[active].inKindSalary : undefined
  const crate = inKindCrate(game)

  return (
    <div className="border-t border-line pt-2">
      <p className="font-bold">{t.crewDesk.title}</p>
      <Hint>{t.crewDesk.rule(credits(hireFee(game)))}</Hint>
      {active && (
        <div className="mt-1 text-xs">
          <p>
            {t.crewDesk.active(t.crew[active].name)}{' '}
            <span className={paidDay === game.day ? 'text-success' : 'text-danger'}>
              {paidDay === game.day ? t.crewDesk.working : t.crewDesk.unpaid}
            </span>
          </p>
          {inKind && (
            <label className="mt-1 flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={payInKind}
                onChange={(event) => dispatch({ type: 'setPayInKind', enabled: event.target.checked })}
                className={FOCUS_RING}
              />
              {t.crewDesk.inKind(credits(salary(active, inKind.amount)), crate ? t.product[crate].name : t.crewDesk.noCrate)}
            </label>
          )}
          <Button className="mt-1" onClick={() => dispatch({ type: 'dismissCrew' })}>
            {t.crewDesk.dismiss}
          </Button>
        </div>
      )}
      <ul className="mt-2 space-y-3">
        {CREW_IDS.filter((id) => id !== active).map((id) => (
          <CrewOffer key={id} crewId={id} />
        ))}
      </ul>
    </div>
  )
}

function CrewOffer({ crewId }: CrewOfferProps) {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits, multiplier, signedPercent } = useI18n()
  const error = checkHire(game, crewId)
  const crew = CREW[crewId]
  const bonuses = [
    ...(crew.riskFactor !== undefined ? [t.crewDesk.risk(multiplier(crew.riskFactor))] : []),
    ...(crew.bribeBonus ? [t.crewDesk.bribe(signedPercent(crew.bribeBonus, 0))] : []),
    ...(crew.revealsPatrol ? [t.crewDesk.patrol] : []),
    ...(crew.liveQuotes ? [t.crewDesk.liveQuotes] : []),
    ...(crew.masksBeacon ? [t.crewDesk.masksBeacon] : []),
    ...(crewId === ENDINGS.resident.crew
      ? [t.crewDesk.injection(Math.min(game.progress.injections, ENDINGS.resident.injections), ENDINGS.resident.injections)]
      : []),
    ...(crew.offshoreBonus ? [t.crewDesk.offshore(signedPercent(crew.offshoreBonus, 1))] : []),
    ...(crew.fleeBonus ? [t.crewDesk.flee(signedPercent(crew.fleeBonus, 0))] : []),
    ...(crew.forgeryBonus ? [t.crewDesk.forgery(signedPercent(crew.forgeryBonus, 0))] : []),
    ...(crew.perishableKnowHow ? [t.crewDesk.knowHow(multiplier(crew.perishableKnowHow))] : []),
    ...(crew.refining ? [t.crewDesk.refining] : []),
    ...(crew.perishableQuota ? [t.crewDesk.quota(multiplier(crew.perishableQuota))] : []),
    ...(crew.inKindSalary ? [t.crewDesk.inKindRule(credits(salary(crewId, crew.inKindSalary.amount)), crew.inKindSalary.minTier)] : []),
  ]

  return (
    <li className="flex items-start gap-3 text-xs">
      {/* Portrait et données de base */}
      <div className="flex w-24 shrink-0 flex-col items-center gap-1 text-center">
        <Thumb id={crewId} size="lg" />
        <p className="font-bold text-ink">{t.crew[crewId].name}</p>
        <p className="text-ink-muted">{t.crewDesk.salary(credits(salary(crewId)))}</p>
      </div>
      {/* Description et effets */}
      <div className="min-w-0 flex-1">
        <p className="text-ink-muted">{t.crew[crewId].subtitle}</p>
        <p className="mt-1 text-ink-soft">{bonuses.join(' · ')}</p>
        {/* Verrou de progression : condition et avancement, tant qu'il ne s'est pas présenté (chap. 4) */}
        <Locked requires={crew.requires} />
      </div>
      {/* Recrutement */}
      <div className="flex w-24 shrink-0 flex-col items-end gap-1 text-right">
        <Button variant="primary" disabled={error !== null} onClick={() => dispatch({ type: 'hireCrew', crewId })}>
          {t.crewDesk.hire}
        </Button>
        {error && error !== 'locked' && <span className="text-danger">{t.error[error]}</span>}
      </div>
    </li>
  )
}
