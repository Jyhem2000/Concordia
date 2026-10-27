import { Landmark, Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import { checkLocation, locationDistrict, maxRepay } from '../../engine/actions.ts'
import { depositBreakdown, effectiveOffshoreRate, loanRoom, offshoreBalance, offshoreInterestBreakdown } from '../../engine/finance.ts'
import type { LocationId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import AmountForm from '../shared/AmountForm.tsx'
import Detailed from '../shared/Detailed.tsx'

/** Lieux spéciaux gérés à ce stade : l'usurier et la banque offshore (chap. 4 et 7) */
const PLACES: readonly LocationId[] = ['LOC-D1-1', 'LOC-D5-1']

/** Guichets du district courant ; rien si le district n'en a pas */
export default function PlacesPanel() {
  const districtId = useGameStore((s) => s.game.districtId)
  const here = PLACES.filter((id) => locationDistrict(id) === districtId)
  if (here.length === 0) return null

  return (
    <>
      {here.map((id) => (
        <Place key={id} locationId={id}>
          {id === 'LOC-D1-1' ? <DebtDesk /> : <OffshoreDesk />}
        </Place>
      ))}
    </>
  )
}

function Place({ locationId, children }: { locationId: LocationId; children: ReactNode }) {
  const game = useGameStore((s) => s.game)
  const { t } = useI18n()
  const closed = checkLocation(game, locationId) === 'location-closed'

  return (
    <section className="rounded border border-zinc-800 bg-zinc-900/40 p-3 text-sm">
      <h2 className="flex items-center gap-1.5 font-bold text-amber-300 uppercase">
        <Landmark size={14} />
        {t.location[locationId].name}
      </h2>
      <p className="text-xs text-zinc-400">{t.location[locationId].subtitle}</p>
      {closed ? (
        <p className="mt-2 flex items-center gap-1.5 text-indigo-300">
          <Lock size={14} />
          {t.place.closedAtNight}
        </p>
      ) : (
        <div className="mt-2 flex flex-col gap-2">{children}</div>
      )}
    </section>
  )
}

function DebtDesk() {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits } = useI18n()
  const room = loanRoom(game)

  return (
    <>
      <p>
        <span className="text-zinc-400">{t.place.debtTitle} </span>
        <span className="font-bold text-red-300">{credits(game.debt)}</span>
      </p>
      <AmountForm label={t.place.repay} max={maxRepay(game)} onSubmit={(amount) => dispatch({ type: 'repay', amount })} />
      {game.initialDebtPaid ? (
        <>
          <AmountForm label={t.place.borrow} variant="danger" max={room} onSubmit={(amount) => dispatch({ type: 'borrow', amount })} />
          <p className="text-xs text-zinc-400">{t.place.loanRoom(credits(room))}</p>
        </>
      ) : (
        <p className="text-xs text-zinc-400">{t.place.borrowLocked}</p>
      )}
    </>
  )
}

function OffshoreDesk() {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits, percent } = useI18n()
  const balance = offshoreBalance(game.offshore)
  const interest = offshoreInterestBreakdown(game.offshore)

  return (
    <>
      <p>
        <span className="text-zinc-400">{t.place.offshoreTitle} </span>
        <span className="font-bold text-cyan-300">{credits(balance)}</span>
        <span className="ml-1 text-xs text-zinc-400">{t.place.balance(credits(game.offshore.deposited), credits(game.offshore.interest))}</span>
      </p>
      <div className="flex flex-wrap gap-1.5">
        <span className="text-zinc-400">{t.place.rate}</span>
        <span>{percent(effectiveOffshoreRate(game.offshore), 2)}</span>
        {interest && (
          <div className="flex gap-1">
            ·
            <Detailed breakdown={interest} format={(amount) => t.place.nextInterest(credits(amount))} />
          </div>
        )}
      </div>
      <AmountForm
        label={t.place.deposit}
        max={game.cash}
        onSubmit={(amount) => dispatch({ type: 'deposit', amount })}
        preview={(amount) => `${t.place.credited} ${credits(depositBreakdown(amount).total)}`}
      />
      <AmountForm label={t.place.withdraw} variant="default" max={balance} onSubmit={(amount) => dispatch({ type: 'withdraw', amount })} />
    </>
  )
}
