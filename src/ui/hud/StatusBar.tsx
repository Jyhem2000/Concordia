import {
  Coins,
  Crosshair,
  Fuel,
  HandCoins,
  HeartPulse,
  Hourglass,
  Landmark,
  Lock,
  MapPin,
  Moon,
  Package,
  ShieldCheck,
  Sun,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { AUDIT_COUNTDOWN_DAY, GAME_LENGTH_DAYS, ICC_MAX, WANTED } from '../../data/balance.ts'
import { VEHICLES } from '../../data/vehicles.ts'
import { cargoUsed } from '../../engine/cargo.ts'
import { effectiveOffshoreRate, nextDebtDeadline, nextProtectionDay, offshoreBalance, protectionBreakdown } from '../../engine/finance.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import EventsTicker from './EventsTicker.tsx'
import Ticker from './Ticker.tsx'

type StatProps = {
  icon: LucideIcon
  label: string
  value?: string
  /** Précision entre parenthèses (taux, échéance…) */
  note?: string
  className?: string
}

/** Bandeau supérieur permanent : jour, portefeuilles, jauges (chap. 10) */
export default function StatusBar() {
  // Les échéances et la collecte se calculent sur l'état entier de la partie
  const game = useGameStore((s) => s.game)
  const lastError = useGameStore((s) => s.lastError)
  const newGame = useGameStore((s) => s.newGame)
  const { t, credits, number, percent } = useI18n()
  const vehicle = VEHICLES[game.vehicleId]
  const deadline = nextDebtDeadline(game)
  const protectionDay = nextProtectionDay(game)
  // Moment de la journée : Journée, 20h00 (journée finie avant l'heure), Nuit (chap. 2)
  const moment = game.phase === 'night' ? 'night' : game.dayOver ? 'curfew' : 'day'
  const tripDone = game.phase === 'day' ? game.dayTripDone : game.nightTripDone
  const debtNotes = [...(game.debtLate ? [t.hud.debtLate] : []), ...(deadline === null ? [] : [t.hud.nextBeating(deadline)])]

  const restart = () => {
    if (window.confirm(t.hud.newGameConfirm)) newGame()
  }

  return (
    <header className="z-20 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur md:sticky md:top-0">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2 text-sm">
        <span className="flex items-center gap-1.5 font-bold text-amber-300">
          {game.phase === 'day' ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
          {t.format.day(game.day, GAME_LENGTH_DAYS)}
        </span>
        <span className="text-zinc-300">
          {t.moment[moment]}
          {moment !== 'curfew' && <span className="text-zinc-400"> · {tripDone ? t.moment.tripDone : t.moment.tripLeft}</span>}
        </span>
        <Stat icon={MapPin} label={t.district[game.districtId].name} />
        <Stat icon={Coins} label={t.gauge.cash} value={credits(game.cash)} className="text-yellow-300" />
        <Stat
          icon={Lock}
          label={t.gauge.offshore}
          value={credits(offshoreBalance(game.offshore))}
          note={t.hud.offshoreRate(percent(effectiveOffshoreRate(game.offshore), 2))}
          className="text-cyan-300"
        />
        <Stat
          icon={Landmark}
          label={t.gauge.debt}
          value={credits(game.debt)}
          note={debtNotes.length > 0 ? debtNotes.join(' · ') : undefined}
          className="text-red-300"
        />
        <Stat icon={ShieldCheck} label={t.gauge.icc} value={percent(game.icc / ICC_MAX, 0)} />
        <Stat icon={HeartPulse} label={t.gauge.health} value={number(game.health, 0)} />
        <Stat icon={Wrench} label={t.gauge.chassis} value={`${game.chassis}/${vehicle.maxChassis}`} />
        {game.wanted > 0 && <Stat icon={Crosshair} label={t.hud.wanted(game.wanted, WANTED.maxLevel)} className="text-red-300" />}
        <Stat icon={Fuel} label={t.gauge.fuel} value={`${game.fuel}/${vehicle.tank}`} />
        <Stat icon={Package} label={t.hud.cargo} value={`${cargoUsed(game.cargo)}/${vehicle.cargo}`} />
        {protectionDay !== null && (
          <Stat icon={HandCoins} label={t.hud.nextProtection(protectionDay, credits(protectionBreakdown(game).total))} className="text-orange-300" />
        )}
        <Button className="ml-auto text-xs" onClick={restart}>
          {t.hud.newGame}
        </Button>
      </div>
      <Ticker />
      <EventsTicker />
      {game.day >= AUDIT_COUNTDOWN_DAY && (
        <p className="flex items-center justify-center gap-1.5 border-t border-amber-900 bg-amber-950/40 px-4 py-1 text-center text-xs text-amber-200">
          <Hourglass size={12} aria-hidden="true" />
          {t.hud.countdown}
        </p>
      )}
      {lastError && (
        <p role="alert" className="border-t border-red-900 bg-red-950/60 px-4 py-1 text-center text-sm text-red-200">
          {t.error[lastError]}
        </p>
      )}
    </header>
  )
}

function Stat({ icon: Icon, label, value, note, className = '' }: StatProps) {
  return (
    <span className={`flex items-center gap-1.5 ${className}`}>
      <Icon size={14} aria-hidden="true" />
      <span className="text-zinc-400">{label}</span>
      {value && <span className="font-bold">{value}</span>}
      {note && <span className="text-xs opacity-75">({note})</span>}
    </span>
  )
}
