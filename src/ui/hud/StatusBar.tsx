import {
  Coins,
  Crosshair,
  Droplet,
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
  UserRound,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { AUDIT_COUNTDOWN_DAY, GAME_LENGTH_DAYS, ICC_MAX, WANTED } from '../../data/balance.ts'
import { VEHICLES } from '../../data/vehicles.ts'
import { cargoUsed } from '../../engine/cargo.ts'
import { cantineDistrict, crewEffect } from '../../engine/crew.ts'
import { iccTier } from '../../engine/gauges.ts'
import { effectiveOffshoreRate, nextDebtDeadline, nextProtectionDay, offshoreBalance, protectionBreakdown } from '../../engine/finance.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import { ICC_TONE, TONE_TEXT } from '../shared/styles.ts'
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

/** Bandeau supérieur permanent : jour, portefeuilles, jauges (chap. 7) */
export default function StatusBar() {
  // Les échéances et la collecte se calculent sur l'état entier de la partie
  const game = useGameStore((s) => s.game)
  const lastError = useGameStore((s) => s.lastError)
  const newGame = useGameStore((s) => s.newGame)
  const { t, credits, number, percent } = useI18n()
  const vehicle = VEHICLES[game.vehicleId]
  const tier = iccTier(game.icc)
  const deadline = nextDebtDeadline(game)
  const protectionDay = nextProtectionDay(game)
  // Moment de la journée : Journée, 20h00 (journée finie avant l'heure), Nuit (chap. 1)
  const moment = game.phase === 'night' ? 'night' : game.dayOver ? 'curfew' : 'day'
  const tripDone = game.phase === 'day' ? game.dayTripDone : game.nightTripDone
  const debtNotes = [...(game.debtLate ? [t.hud.debtLate] : []), ...(deadline === null ? [] : [t.hud.nextDeadline(deadline)])]

  const restart = () => {
    if (window.confirm(t.hud.newGameConfirm)) newGame()
  }

  return (
    <header className="z-20 border-b border-line bg-base/95 backdrop-blur md:sticky md:top-0">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2 text-sm">
        <span className="flex items-center gap-1.5 font-bold text-accent">
          {game.phase === 'day' ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
          {t.format.day(game.day, GAME_LENGTH_DAYS)}
        </span>
        <span className="text-ink-soft">
          {t.moment[moment]}
          {moment !== 'curfew' && <span className="text-ink-muted"> · {tripDone ? t.moment.tripDone : t.moment.tripLeft}</span>}
        </span>
        <Stat icon={MapPin} label={t.district[game.districtId].name} />
        <Stat icon={Coins} label={t.gauge.cash} value={credits(game.cash)} className="text-cash" />
        <Stat
          icon={Lock}
          label={t.gauge.offshore}
          value={credits(offshoreBalance(game.offshore))}
          note={t.hud.offshoreRate(percent(effectiveOffshoreRate(game.offshore, crewEffect(game, 'offshoreBonus') ?? 0), 2))}
          className="text-offshore"
        />
        <Stat
          icon={Landmark}
          label={t.gauge.debt}
          value={credits(game.debt)}
          note={debtNotes.length > 0 ? debtNotes.join(' · ') : undefined}
          className="text-danger"
        />
        <Stat
          icon={ShieldCheck}
          label={t.gauge.icc}
          value={percent(game.icc / ICC_MAX, 0)}
          note={t.iccTier[tier]}
          className={TONE_TEXT[ICC_TONE[tier]]}
        />
        <Stat icon={HeartPulse} label={t.gauge.health} value={number(game.health, 0)} />
        <Stat icon={Wrench} label={t.gauge.chassis} value={`${game.chassis}/${vehicle.maxChassis}`} />
        {game.wanted > 0 && <Stat icon={Crosshair} label={t.hud.wanted(game.wanted, WANTED.maxLevel)} className="text-danger" />}
        <Stat icon={Fuel} label={t.gauge.fuel} value={`${game.fuel}/${vehicle.tank}`} />
        <Stat icon={Package} label={t.hud.cargo} value={`${cargoUsed(game.cargo)}/${vehicle.cargo}`} />
        {/* Exemption Métabolique : jours de protection, alerte la veille, Sédation à 0 (chap. 1) */}
        <Stat
          icon={Droplet}
          label={t.hud.exemption(game.exemption)}
          note={game.exemption === 0 ? t.hud.sedated : game.exemption === 1 ? t.hud.sedationTomorrow(t.district[cantineDistrict()].name) : undefined}
          className={game.exemption <= 1 ? 'text-danger' : 'text-info'}
        />
        {game.crew.active && (
          <Stat
            icon={UserRound}
            label={t.hud.crew(t.crew[game.crew.active].name)}
            note={game.crew.paidDay === game.day ? undefined : t.hud.crewUnpaid}
            className={game.crew.paidDay === game.day ? 'text-ink' : 'text-danger'}
          />
        )}
        {protectionDay !== null && (
          <Stat icon={HandCoins} label={t.hud.nextProtection(protectionDay, credits(protectionBreakdown(game).total))} className="text-warning" />
        )}
        <Button className="ml-auto text-xs" onClick={restart}>
          {t.hud.newGame}
        </Button>
      </div>
      <Ticker />
      <EventsTicker />
      {game.day >= AUDIT_COUNTDOWN_DAY && (
        <p className="flex items-center justify-center gap-1.5 border-t border-accent/40 bg-accent/10 px-4 py-1 text-center text-xs text-accent">
          <Hourglass size={12} aria-hidden="true" />
          {t.hud.countdown(GAME_LENGTH_DAYS)}
        </p>
      )}
      {lastError && (
        <p role="alert" className="border-t border-danger/40 bg-danger/10 px-4 py-1 text-center text-sm text-danger">
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
      <span className="text-ink-muted">{label}</span>
      {value && <span className="font-bold">{value}</span>}
      {note && <span className="text-xs opacity-75">({note})</span>}
    </span>
  )
}
