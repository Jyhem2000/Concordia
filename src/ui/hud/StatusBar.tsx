import { Coins, Fuel, HandCoins, HeartPulse, Hourglass, Landmark, Lock, MapPin, Moon, Package, ShieldCheck, Sun, TrendingUp } from 'lucide-react'
import type { ReactNode } from 'react'
import { AUDIT_COUNTDOWN_DAY, GAME_LENGTH_DAYS } from '../../data/balance.ts'
import { VEHICLES } from '../../data/vehicles.ts'
import { cargoUsed } from '../../engine/cargo.ts'
import { effectiveOffshoreRate, nextDebtDeadline, nextProtectionDay, offshoreBalance, protectionBreakdown } from '../../engine/finance.ts'
import { inflationIndex } from '../../engine/inflation.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'

/** Bandeau supérieur permanent : jour, portefeuilles, jauges (chap. 9) */
export default function StatusBar() {
  const game = useGameStore((s) => s.game)
  const lastError = useGameStore((s) => s.lastError)
  const newGame = useGameStore((s) => s.newGame)
  const { t, credits, multiplier, number, percent } = useI18n()
  const vehicle = VEHICLES[game.vehicleId]
  const deadline = nextDebtDeadline(game)
  const protectionDay = nextProtectionDay(game)

  const restart = () => {
    if (window.confirm(t.hud.newGameConfirm)) newGame()
  }

  return (
    <header className="z-20 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur md:sticky md:top-0">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2 text-sm">
        <span className="flex items-center gap-1.5 font-bold text-amber-300">
          {game.phase === 'day' ? <Sun size={16} /> : <Moon size={16} />}
          {t.format.day(game.day, GAME_LENGTH_DAYS)}
        </span>
        <Stat icon={<MapPin size={14} />} label={t.district[game.districtId].name} />
        <Stat icon={<Coins size={14} />} label={t.gauge.cash} value={credits(game.cash)} className="text-yellow-300" />
        <Stat
          icon={<Lock size={14} />}
          label={t.gauge.offshore}
          value={credits(offshoreBalance(game.offshore))}
          note={t.hud.offshoreRate(percent(effectiveOffshoreRate(game.offshore), 2))}
          className="text-cyan-300"
        />
        <Stat
          icon={<Landmark size={14} />}
          label={t.gauge.debt}
          value={credits(game.debt)}
          note={[game.debtLate && t.hud.debtLate, deadline && t.hud.nextBeating(deadline)].filter(Boolean).join(' · ') || undefined}
          className="text-red-300"
        />
        <Stat icon={<ShieldCheck size={14} />} label={t.gauge.icc} value={percent(game.icc / 100, 0)} />
        <Stat icon={<HeartPulse size={14} />} label={t.gauge.health} value={number(game.health, 0)} />
        <Stat icon={<Fuel size={14} />} label={t.gauge.fuel} value={`${game.fuel}/${vehicle.tank}`} />
        <Stat icon={<Package size={14} />} label={t.hud.cargo} value={`${cargoUsed(game.cargo)}/${vehicle.cargo}`} />
        <Stat icon={<TrendingUp size={14} />} label={t.hud.inflation(multiplier(inflationIndex(game.day)))} />
        {protectionDay && (
          <Stat
            icon={<HandCoins size={14} />}
            label={t.hud.nextProtection(protectionDay, credits(protectionBreakdown(game).total))}
            className="text-orange-300"
          />
        )}
        <Button className="ml-auto text-xs" onClick={restart}>
          {t.hud.newGame}
        </Button>
      </div>
      {game.day >= AUDIT_COUNTDOWN_DAY && (
        <p className="flex items-center justify-center gap-1.5 border-t border-amber-900 bg-amber-950/40 px-4 py-1 text-center text-xs text-amber-200">
          <Hourglass size={12} />
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

type StatProps = { icon: ReactNode; label: string; value?: string; note?: string; className?: string }

function Stat({ icon, label, value, note, className = '' }: StatProps) {
  return (
    <span className={`flex items-center gap-1.5 ${className}`}>
      {icon}
      <span className="text-zinc-400">{label}</span>
      {value && <span className="font-bold">{value}</span>}
      {note && <span className="text-xs opacity-75">({note})</span>}
    </span>
  )
}
