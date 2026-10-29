import { ENDINGS } from '../../data/balance.ts'
import { CREW } from '../../data/vehicles.ts'
import { checkHire, CREW_IDS, hireFee, inKindCrate, salary } from '../../engine/crew.ts'
import type { CrewId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Locked from '../shared/Locked.tsx'
import { FOCUS_RING } from '../shared/focus.ts'

type CrewOfferProps = {
  crewId: CrewId
}

/** Cantine des Chauffeurs : recrutement, renvoi et salaire de l'équipier (chap. 4 et 5) */
export default function CrewDesk() {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits } = useI18n()
  const { active, paidDay, payInKind } = game.crew
  const inKind = active ? CREW[active].inKindSalary : undefined
  const crate = inKindCrate(game)

  return (
    <div className="border-t border-zinc-800 pt-2">
      <p className="font-bold">{t.crewDesk.title}</p>
      <p className="text-xs text-zinc-400">{t.crewDesk.rule(credits(hireFee(game)))}</p>
      {active && (
        <div className="mt-1 text-xs">
          <p>
            {t.crewDesk.active(t.crew[active].name)}{' '}
            <span className={paidDay === game.day ? 'text-green-400' : 'text-red-300'}>
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
      <ul className="mt-1 space-y-2">
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
    <li className="text-xs">
      <p className="font-bold text-zinc-200">
        {t.crew[crewId].name}
        <span className="ml-1.5 font-normal text-zinc-400">{t.crewDesk.salary(credits(salary(crewId)))}</span>
      </p>
      <p className="text-zinc-400">{t.crew[crewId].subtitle}</p>
      <p className="text-zinc-300">{bonuses.join(' · ')}</p>
      {/* Verrou de progression : condition et avancement, tant qu'il ne s'est pas présenté (chap. 5) */}
      <Locked requires={crew.requires} />
      <div className="mt-1 flex items-center gap-2">
        <Button variant="primary" disabled={error !== null} onClick={() => dispatch({ type: 'hireCrew', crewId })}>
          {t.crewDesk.hire}
        </Button>
        {error && error !== 'locked' && <span className="text-red-300">{t.error[error]}</span>}
      </div>
    </li>
  )
}
