import { Crosshair, Droplet, HandCoins, Hourglass, MapPin, Moon, RotateCcw, Sun, UserRound, type LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import {
  AUDIT_COUNTDOWN_DAY,
  DEBT_LATE,
  GAME_LENGTH_DAYS,
  HEALTH_MAX,
  ICC_DAILY_ROUTE_GAIN_CAP,
  ICC_MAX,
  SEDATION,
  WANTED,
} from '../../data/balance.ts'
import { cantineDistrict, crewEffect } from '../../engine/crew.ts'
import { effectiveOffshoreRate, nextDebtDeadline, nextProtectionDay, offshoreBalance, protectionBreakdown } from '../../engine/finance.ts'
import { checkForceCurfew } from '../../engine/actions.ts'
import { iccRouteGainLeft, iccTier } from '../../engine/gauges.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import ConfirmButton from '../shared/ConfirmButton.tsx'
import { APPEAR } from '../shared/motion.ts'
import Tip from '../shared/Tip.tsx'
import { ICC_TONE, TONE_TEXT, type Tone } from '../shared/styles.ts'

type CellProps = {
  label: string
  tone?: Tone
  /** Précision sous la valeur (échéance, palier…) */
  note?: string
  /** Couleur de la précision, si elle diffère de la valeur */
  noteTone?: Tone
  /** Explication de la règle, en infobulle */
  info?: string
  /** Valeur affichée : quand elle change, la case le montre */
  valueKey: string | number
  children: ReactNode
}

type StatProps = {
  icon: LucideIcon
  label: string
  value?: string
  /** Précision entre parenthèses (taux, alerte…) */
  note?: string
  tone?: Tone
  /** Explication de la règle, en infobulle */
  info?: string
}

/** Seuils de couleur de la Santé : rouge, puis orange (repères visuels seulement, aucun effet de jeu) */
const LOW_HEALTH = 0.25
const MEDIUM_HEALTH = 0.5

/** Bandeau supérieur permanent : jour, argent, ICC et Santé en tête, puis district, moment et états du chauffeur (chap. 7) */
export default function StatusBar() {
  // Les échéances et la collecte se calculent sur l'état entier de la partie
  const game = useGameStore((s) => s.game)
  const lastError = useGameStore((s) => s.lastError)
  const newGame = useGameStore((s) => s.newGame)
  const { t, credits, signedCredits, number, percent } = useI18n()
  const offshore = offshoreBalance(game.offshore)
  const venture = offshoreBalance(game.venture)
  const offshoreRate = effectiveOffshoreRate(crewEffect(game, 'offshoreBonus') ?? 0)
  const tier = iccTier(game.icc)
  const deadline = nextDebtDeadline(game)
  const protectionDay = nextProtectionDay(game)
  // Moment de la journée : Journée, 20h00 (journée finie avant l'heure), Nuit (chap. 1)
  const moment = game.phase === 'night' ? 'night' : game.dayOver ? 'curfew' : 'day'
  const tripDone = game.phase === 'day' ? game.dayTripDone : game.nightTripDone
  // Écart du Cash-Puce depuis 06h00, d'après le carnet de route
  const cashToday = game.cash - (game.journal.at(-1)?.start.cash ?? game.cash)
  // Épuisé : tournée de nuit la veille, pas de nouvelle nuit sur la route ce soir (chap. 1)
  const exhausted = checkForceCurfew(game) === 'exhausted'
  const PhaseIcon = game.phase === 'day' ? Sun : Moon

  return (
    <header className="z-20 border-b border-line bg-base/95 backdrop-blur md:sticky md:top-0">
      <div className="mx-auto max-w-7xl px-3 py-2 text-sm">
        {/* Téléphone : deux rangées de trois cases ; desktop : une rangée de six */}
        <div className="grid grid-cols-3 gap-y-2 sm:grid-cols-6 sm:divide-x sm:divide-line">
          <Cell label={t.hud.day} tone="accent" valueKey={`${game.day}-${game.phase}`} note={t.moment.short[moment]}>
            <PhaseIcon size={14} aria-hidden="true" />
            {t.format.dayShort(game.day, GAME_LENGTH_DAYS)}
          </Cell>
          <Cell
            label={t.hud.cash}
            tone="cash"
            valueKey={game.cash}
            note={cashToday === 0 ? undefined : t.hud.cashToday(signedCredits(cashToday))}
            noteTone={cashToday > 0 ? 'success' : 'danger'}
          >
            {credits(game.cash)}
          </Cell>
          <Cell
            label={t.hud.offshore}
            tone="offshore"
            valueKey={offshore}
            note={venture > 0 ? t.hud.withVenture(credits(venture)) : t.hud.offshoreRate(percent(offshoreRate, 2))}
            info={t.hud.offshoreInfo(percent(offshoreRate, 2))}
          >
            {credits(offshore)}
          </Cell>
          <Cell
            label={t.gauge.debt}
            valueKey={game.debt}
            tone="danger"
            note={game.debtLate ? t.hud.debtLate : deadline === null ? undefined : t.hud.daysLeft(deadline - game.day)}
            info={t.hud.debtInfo(DEBT_LATE.day, GAME_LENGTH_DAYS)}
          >
            {credits(game.debt)}
          </Cell>
          <Cell
            label={t.gauge.icc}
            tone={ICC_TONE[tier]}
            note={t.iccTier[tier]}
            valueKey={game.icc}
            info={t.hud.iccInfo(iccRouteGainLeft(game), ICC_DAILY_ROUTE_GAIN_CAP)}
          >
            {percent(game.icc / ICC_MAX, 0)}
          </Cell>
          <Cell
            label={t.gauge.health}
            tone={game.health <= HEALTH_MAX * LOW_HEALTH ? 'danger' : game.health <= HEALTH_MAX * MEDIUM_HEALTH ? 'warning' : 'success'}
            valueKey={game.health}
            note={exhausted ? t.hud.exhausted : undefined}
            noteTone="warning"
            info={exhausted ? t.hud.exhaustedInfo : t.hud.healthInfo}
          >
            {t.hud.healthValue(number(game.health, 0))}
          </Cell>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className="flex shrink-0 items-center gap-1 font-bold text-ink-soft">
            <MapPin size={12} aria-hidden="true" />
            {t.district[game.districtId].name}
          </span>
          <span className="min-w-0 flex-1 truncate text-ink-muted">{moment !== 'curfew' && (tripDone ? t.moment.tripDone : t.moment.tripLeft)}</span>
          <ConfirmButton
            size="sm"
            onClick={newGame}
            aria-label={t.hud.newGame}
            confirm={{ title: t.hud.newGame, message: t.hud.newGameConfirm, action: t.hud.newGameAction }}
          >
            <RotateCcw size={14} aria-hidden="true" />
            {/* Libellé visible là où il y a la place ; le nom accessible vient de aria-label */}
            <span aria-hidden="true" className="hidden md:inline">
              {t.hud.newGame}
            </span>
          </ConfirmButton>
        </div>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {/* Exemption Métabolique : jours de protection, alerte la veille, Sédation à 0 (chap. 1) */}
          <Stat
            icon={Droplet}
            label={t.hud.exemption(game.exemption)}
            note={
              game.exemption === 0 ? t.hud.sedated : game.exemption === 1 ? t.hud.sedationTomorrow(t.district[cantineDistrict()].name) : undefined
            }
            tone={game.exemption <= 1 ? 'danger' : 'info'}
            info={t.hud.exemptionInfo(SEDATION.protectionDays, t.district[cantineDistrict()].name, percent(SEDATION.penalty, 0))}
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
        <motion.p
          key={lastError}
          {...APPEAR}
          role="alert"
          className="border-t border-danger/40 bg-danger/10 px-4 py-1 text-center text-sm text-danger"
        >
          {t.error[lastError]}
        </motion.p>
      )}
    </header>
  )
}

/** Case de la rangée de tête : libellé en petit, valeur en gras, précision dessous */
function Cell({ label, tone = 'neutral', note, noteTone, info, valueKey, children }: CellProps) {
  return (
    <div className="flex min-w-0 flex-col px-1 text-center first:pl-0 last:pr-0">
      <div className="flex items-center justify-center gap-0.5 text-xs text-ink-muted uppercase">
        <span className="truncate">{label}</span>
        {info && <Tip label={label} content={info} />}
      </div>
      {/* Nouvelle valeur, nouvelle clé : Motion rejoue l'apparition */}
      {/* Sans précision, la valeur occupe toute la case, plus grande */}
      <motion.div
        key={valueKey}
        {...APPEAR}
        className={`flex items-center justify-center gap-1 font-bold whitespace-nowrap ${TONE_TEXT[tone]} ${note ? '' : 'flex-1 text-base'}`}
      >
        {children}
      </motion.div>
      {note && <div className={`truncate text-xs leading-tight opacity-80 ${TONE_TEXT[noteTone ?? tone]}`}>{note}</div>}
    </div>
  )
}

function Stat({ icon: Icon, label, value, note, tone = 'neutral', info }: StatProps) {
  return (
    <span className={`flex items-center gap-1 ${TONE_TEXT[tone]}`}>
      <Icon size={12} aria-hidden="true" />
      <span className="text-ink-muted">{label}</span>
      {value && <span className="font-bold">{value}</span>}
      {note && <span className="opacity-75">({note})</span>}
      {info && <Tip label={label} content={info} />}
    </span>
  )
}
