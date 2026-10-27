import { Landmark, Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import { GRINDER, SURVIVAL_ADVANCE } from '../../data/balance.ts'
import { LOCATIONS } from '../../data/locations.ts'
import { PRODUCT_IDS } from '../../data/products.ts'
import { maxRepay } from '../../engine/actions.ts'
import { keysOf } from '../../engine/records.ts'
import { grindableQty, grinderPrice, isGrindable } from '../../engine/market.ts'
import { depositBreakdown, effectiveOffshoreRate, loanRoom, offshoreBalance, offshoreInterestBreakdown } from '../../engine/finance.ts'
import type { LocationId, LocationService } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import AmountForm from '../shared/AmountForm.tsx'
import Detailed from '../shared/Detailed.tsx'
import GarageDesk from './GarageDesk.tsx'

type PlaceProps = {
  locationId: LocationId
  children: ReactNode
}

type ServiceDeskProps = {
  service: LocationService
}

/** Guichets des lieux spéciaux du district courant qui rendent un service implémenté ; rien sinon */
export default function PlacesPanel() {
  const districtId = useGameStore((s) => s.game.districtId)
  const here = keysOf(LOCATIONS).filter((id) => LOCATIONS[id].district === districtId && LOCATIONS[id].services.length > 0)
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

/** Les lieux spéciaux ouvrent de 06h00 à 20h00 (chap. 2) */
function Place({ locationId, children }: PlaceProps) {
  const closed = useGameStore((s) => s.game.phase === 'night' || s.game.dayOver)
  const { t } = useI18n()

  return (
    <section className="rounded border border-zinc-800 bg-zinc-900/40 p-3 text-sm">
      <h2 className="flex items-center gap-1.5 font-bold text-amber-300 uppercase">
        <Landmark size={14} aria-hidden="true" />
        {t.location[locationId].name}
      </h2>
      <p className="text-xs text-zinc-400">{t.location[locationId].subtitle}</p>
      {closed ? (
        <p className="mt-2 flex items-center gap-1.5 text-indigo-300">
          <Lock size={14} aria-hidden="true" />
          {t.place.closedAtNight}
        </p>
      ) : (
        <div className="mt-2 flex flex-col gap-2">{children}</div>
      )}
    </section>
  )
}

function ServiceDesk({ service }: ServiceDeskProps) {
  switch (service) {
    case 'debt':
      return <DebtDesk />
    case 'grinder':
      return <GrinderDesk />
    case 'offshore':
      return <OffshoreDesk />
    case 'garage':
      return <GarageDesk />
  }
}

/** Hachoir de Viktor : rachat des périssables dégradés, au profit de la dette (chap. 4) */
function GrinderDesk() {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits } = useI18n()
  const left = Math.max(0, GRINDER.dailyLimit - game.grinderToday)
  const offers = PRODUCT_IDS.flatMap((productId) => {
    const qty = grindableQty(game, productId)
    const lot = game.cargo.find((candidate) => candidate.productId === productId && isGrindable(game, candidate))
    return qty > 0 && lot ? [{ productId, qty, price: grinderPrice(game, lot) }] : []
  })

  return (
    <div className="border-t border-zinc-800 pt-2">
      <p className="font-bold">{t.place.grinderTitle}</p>
      <p className="text-xs text-zinc-400">{t.place.grinderRule(GRINDER.dailyLimit, left)}</p>
      {offers.length === 0 && <p className="mt-1 text-xs text-zinc-500">{t.place.grinderNothing}</p>}
      <ul className="mt-1 space-y-2">
        {offers.map(({ productId, qty, price }) => (
          <li key={productId} className="flex flex-col gap-1">
            <span className="flex flex-wrap gap-1.5 text-xs">
              {t.place.grinderOffer(qty, t.product[productId].name)}
              <Detailed breakdown={price} format={credits} />
            </span>
            <AmountForm label={t.place.grind} max={Math.min(qty, left)} onSubmit={(amount) => dispatch({ type: 'grind', productId, qty: amount })} />
          </li>
        ))}
      </ul>
    </div>
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
      <AmountForm label={t.place.borrow} variant="danger" max={room} onSubmit={(amount) => dispatch({ type: 'borrow', amount })} />
      <p className="text-xs text-zinc-400">
        {t.place.loanRoom(credits(room))}
        {!game.initialDebtPaid && <> · {t.place.advanceRule(credits(SURVIVAL_ADVANCE))}</>}
      </p>
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
