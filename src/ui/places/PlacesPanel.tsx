import { Landmark, Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import { SURVIVAL_ADVANCE } from '../../data/balance.ts'
import { LOCATIONS } from '../../data/locations.ts'
import { maxRepay } from '../../engine/actions.ts'
import { crewEffect } from '../../engine/crew.ts'
import {
  breakEvenDays,
  effectiveOffshoreRate,
  loanRoom,
  offshoreBalance,
  offshoreInterestBreakdown,
  withdrawalBreakdown,
} from '../../engine/finance.ts'
import type { LocationId, LocationService } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import AmountForm from '../shared/AmountForm.tsx'
import Detailed from '../shared/Detailed.tsx'
import Hint from '../shared/Hint.tsx'
import Panel from '../shared/Panel.tsx'
import CrewDesk from './CrewDesk.tsx'
import GarageDesk from './GarageDesk.tsx'
import { placesHere } from './placesHere.ts'
import { CassandreDesk, ForgeryDesk, KarmaDesk, MorgueDesk, VelvetDesk } from './SpecialDesks.tsx'

type PlaceProps = {
  locationId: LocationId
  children: ReactNode
}

type ServiceDeskProps = {
  service: LocationService
}

/** Guichets des lieux spéciaux du district courant ; rien s'il n'y en a pas */
export default function PlacesPanel() {
  const districtId = useGameStore((s) => s.game.districtId)
  const here = placesHere(districtId)
  if (here.length === 0) return null

  return (
    <>
      {here.map((id) => (
        <Place key={id} locationId={id}>
          {LOCATIONS[id].services.map((service) => (
            <ServiceDesk key={service} service={service} />
          ))}
        </Place>
      ))}
    </>
  )
}

/** Les lieux spéciaux ouvrent de 06h00 à 20h00 (chap. 1) */
function Place({ locationId, children }: PlaceProps) {
  const closed = useGameStore((s) => s.game.phase === 'night' || s.game.dayOver)
  const { t } = useI18n()

  return (
    <Panel icon={Landmark} title={t.location[locationId].name} subtitle={t.location[locationId].subtitle} collapseId={`place:${locationId}`}>
      {closed ? (
        <Hint tone="night" icon={Lock}>
          {t.place.closedAtNight}
        </Hint>
      ) : (
        <div className="flex flex-col gap-2">{children}</div>
      )}
    </Panel>
  )
}

function ServiceDesk({ service }: ServiceDeskProps) {
  switch (service) {
    case 'debt':
      return <DebtDesk />
    case 'offshore':
      return <OffshoreDesk />
    case 'garage':
      return <GarageDesk />
    case 'crew':
      return <CrewDesk />
    case 'influence':
      return <KarmaDesk />
    case 'morgue':
      return <MorgueDesk />
    case 'prophecy':
      return <CassandreDesk />
    case 'forgery':
      return <ForgeryDesk />
    case 'velvet':
      return <VelvetDesk />
  }
}

function DebtDesk() {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits } = useI18n()
  const room = loanRoom(game)

  return (
    <>
      <p>
        <span className="text-ink-muted">{t.place.debtTitle} </span>
        <span className="font-bold text-danger">{credits(game.debt)}</span>
      </p>
      <AmountForm label={t.place.repay} max={maxRepay(game)} onSubmit={(amount) => dispatch({ type: 'repay', amount })} />
      <AmountForm label={t.place.borrow} variant="danger" max={room} onSubmit={(amount) => dispatch({ type: 'borrow', amount })} />
      <Hint>
        {t.place.loanRoom(credits(room))} · {t.place.advanceRule(credits(SURVIVAL_ADVANCE))}
      </Hint>
    </>
  )
}

function OffshoreDesk() {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits, percent } = useI18n()
  const balance = offshoreBalance(game.offshore)
  const interest = offshoreInterestBreakdown(game.offshore, crewEffect(game, 'offshoreBonus') ?? 0)

  return (
    <>
      <p>
        <span className="text-ink-muted">{t.place.offshoreTitle} </span>
        <span className="font-bold text-offshore">{credits(balance)}</span>
        <span className="ml-1 text-xs text-ink-muted">{t.place.balance(credits(game.offshore.deposited), credits(game.offshore.interest))}</span>
      </p>
      <div className="flex flex-wrap gap-1.5">
        <span className="text-ink-muted">{t.place.rate}</span>
        <span>{percent(effectiveOffshoreRate(game.offshore, crewEffect(game, 'offshoreBonus') ?? 0), 2)}</span>
        {interest && (
          <div className="flex gap-1">
            ·
            <Detailed breakdown={interest} format={(amount) => t.place.nextInterest(credits(amount))} />
          </div>
        )}
      </div>
      <Hint>{t.place.breakEven(breakEvenDays(game.offshore, crewEffect(game, 'offshoreBonus') ?? 0))}</Hint>
      <AmountForm label={t.place.deposit} max={game.cash} onSubmit={(amount) => dispatch({ type: 'deposit', amount })} />
      <AmountForm
        label={t.place.withdraw}
        variant="default"
        max={balance}
        onSubmit={(amount) => dispatch({ type: 'withdraw', amount })}
        preview={(amount) => `${t.place.received} ${credits(withdrawalBreakdown(amount).total)}`}
      />
    </>
  )
}
