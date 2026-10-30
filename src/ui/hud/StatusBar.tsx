import {
  Crosshair,
  Droplet,
  Fuel,
  HandCoins,
  Hourglass,
  Lock,
  MapPin,
  Moon,
  Package,
  RotateCcw,
  Sun,
  UserRound,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { AUDIT_COUNTDOWN_DAY, GAME_LENGTH_DAYS, HEALTH_MAX, ICC_MAX, WANTED } from '../../data/balance.ts'
import { VEHICLES } from '../../data/vehicles.ts'
import { cargoUsed } from '../../engine/cargo.ts'
import { cantineDistrict, crewEffect } from '../../engine/crew.ts'
import { effectiveOffshoreRate, nextDebtDeadline, nextProtectionDay, offshoreBalance, protectionBreakdown } from '../../engine/finance.ts'
import { iccTier } from '../../engine/gauges.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import { FOCUS_RING } from '../shared/focus.ts'
import Gauge from '../shared/Gauge.tsx'
import Tip from '../shared/Tip.tsx'
import { ICC_TONE, TONE_TEXT, type Tone } from '../shared/styles.ts'

type CellProps = {
  label: string
  tone?: Tone
  /** Précision sous la valeur (échéance, palier…) */
  note?: string
  /** Texte complet en infobulle, quand la case est abrégée */
  info?: string
  children: ReactNode
}

type StatProps = {
  icon: LucideIcon
  label: string
  value?: string
  /** Précision entre parenthèses (taux, alerte…) */
  note?: string
  tone?: Tone
}

/** Sous ce seuil, la Santé passe au rouge (repère visuel seulement, aucun effet de jeu) */
const LOW_HEALTH = 0.25

/** Bandeau supérieur permanent : jour, argent, ICC et Santé en tête, puis jauges et états (chap. 7) */
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
  const PhaseIcon = game.phase === 'day' ? Sun : Moon

  const restart = () => {
    if (window.confirm(t.hud.newGameConfirm)) newGame()
  }

  return (
    <header className="z-20 border-b border-line bg-base/95 backdrop-blur md:sticky md:top-0">
      <div className="mx-auto max-w-7xl px-3 py-2 text-sm">
        {/* Desktop : jauges à droite des cases */}
        <div className="md:flex md:items-center md:gap-6">
          <div className="grid flex-1 grid-cols-5 divide-x divide-line">
            <Cell label={t.hud.day} tone="accent">
              <PhaseIcon size={14} aria-hidden="true" />
              {t.format.dayShort(game.day, GAME_LENGTH_DAYS)}
            </Cell>
            <Cell label={t.hud.cash} tone="cash">
              {credits(game.cash)}
            </Cell>
            <Cell
              label={t.gauge.debt}
              tone="danger"
              note={game.debtLate ? t.hud.debtLate : deadline === null ? undefined : t.hud.deadlineShort(deadline)}
              info={debtNotes.length > 0 ? debtNotes.join(' · ') : undefined}
            >
              {credits(game.debt)}
            </Cell>
            <Cell label={t.gauge.icc} tone={ICC_TONE[tier]} note={t.iccTier[tier]}>
              {percent(game.icc / ICC_MAX, 0)}
            </Cell>
            <Cell label={t.gauge.health} tone={game.health <= HEALTH_MAX * LOW_HEALTH ? 'danger' : 'success'}>
              {number(game.health, 0)}
            </Cell>
          </div>

          <div className="mt-2 flex gap-4 md:mt-0 md:w-96">
            <Gauge icon={Wrench} label={t.gauge.chassis} value={game.chassis} max={vehicle.maxChassis} />
            <Gauge icon={Fuel} label={t.gauge.fuel} value={game.fuel} max={vehicle.tank} />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className="flex shrink-0 items-center gap-1 font-bold text-ink-soft">
            <MapPin size={12} aria-hidden="true" />
            {t.district[game.districtId].name}
          </span>
          <span className="min-w-0 flex-1 truncate text-ink-muted">
            {t.moment[moment]}
            {moment !== 'curfew' && <> · {tripDone ? t.moment.tripDone : t.moment.tripLeft}</>}
          </span>
          <button
            type="button"
            onClick={restart}
            aria-label={t.hud.newGame}
            className={`flex shrink-0 items-center gap-1 rounded-md border border-line-strong p-1 text-ink-muted hover:text-ink ${FOCUS_RING}`}
          >
            <RotateCcw size={14} aria-hidden="true" />
            {/* Libellé visible là où il y a la place ; le nom accessible vient de aria-label */}
            <span aria-hidden="true" className="hidden md:inline">
              {t.hud.newGame}
            </span>
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <Stat icon={Package} label={t.hud.cargo} value={`${cargoUsed(game.cargo)}/${vehicle.cargo}`} />
          <Stat
            icon={Lock}
            label={t.gauge.offshore}
            value={credits(offshoreBalance(game.offshore))}
            note={t.hud.offshoreRate(percent(effectiveOffshoreRate(game.offshore, crewEffect(game, 'offshoreBonus') ?? 0), 2))}
            tone="offshore"
          />
          {/* Exemption Métabolique : jours de protection, alerte la veille, Sédation à 0 (chap. 1) */}
          <Stat
            icon={Droplet}
            label={t.hud.exemption(game.exemption)}
            note={
              game.exemption === 0 ? t.hud.sedated : game.exemption === 1 ? t.hud.sedationTomorrow(t.district[cantineDistrict()].name) : undefined
            }
            tone={game.exemption <= 1 ? 'danger' : 'info'}
          />
          {game.wanted > 0 && <Stat icon={Crosshair} label={t.hud.wanted(game.wanted, WANTED.maxLevel)} tone="danger" />}
          {game.crew.active && (
            <Stat
              icon={UserRound}
              label={t.hud.crew(t.crew[game.crew.active].name)}
              note={game.crew.paidDay === game.day ? undefined : t.hud.crewUnpaid}
              tone={game.crew.paidDay === game.day ? 'neutral' : 'danger'}
            />
          )}
          {protectionDay !== null && (
            <Stat icon={HandCoins} label={t.hud.nextProtection(protectionDay, credits(protectionBreakdown(game).total))} tone="warning" />
          )}
        </div>
      </div>
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

/** Case de la rangée de tête : libellé en petit, valeur en gras, précision dessous */
function Cell({ label, tone = 'neutral', note, info, children }: CellProps) {
  return (
    <div className="min-w-0 px-1 text-center first:pl-0 last:pr-0">
      <div className="flex items-center justify-center gap-0.5 text-xs text-ink-muted uppercase">
        <span className="truncate">{label}</span>
        {info && <Tip label={label} content={info} />}
      </div>
      <div className={`flex items-center justify-center gap-1 font-bold whitespace-nowrap ${TONE_TEXT[tone]}`}>{children}</div>
      {note && <div className={`truncate text-xs leading-tight opacity-80 ${TONE_TEXT[tone]}`}>{note}</div>}
    </div>
  )
}

function Stat({ icon: Icon, label, value, note, tone = 'neutral' }: StatProps) {
  return (
    <span className={`flex items-center gap-1 ${TONE_TEXT[tone]}`}>
      <Icon size={12} aria-hidden="true" />
      <span className="text-ink-muted">{label}</span>
      {value && <span className="font-bold">{value}</span>}
      {note && <span className="opacity-75">({note})</span>}
    </span>
  )
}
