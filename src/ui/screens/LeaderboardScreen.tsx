import { ArrowLeft, ListOrdered, Medal } from 'lucide-react'
import { useEffect, useState } from 'react'
import { openDays, type Board } from '../../../server/runs.ts'
import { DIFFICULTIES, RANKED } from '../../data/balance.ts'
import { keysOf } from '../../engine/records.ts'
import { isDefeat } from '../../engine/routine.ts'
import type { DifficultyId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { fetchBoard } from '../../net/leaderboard.ts'
import { useSettingsStore } from '../../stores/settingsStore.ts'
import Button from '../shared/Button.tsx'
import { FOCUS_RING } from '../shared/focus.ts'
import Hint from '../shared/Hint.tsx'
import Panel from '../shared/Panel.tsx'

type LeaderboardScreenProps = {
  /** Revenir à l'accueil */
  onBack: () => void
}

type PillsProps<T extends string> = {
  label: string
  options: readonly { id: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

type BoardListProps = {
  board: Board
}

/** Classement lu pour un jour et un mode : en cours de chargement, reçu, ou injoignable */
type Loaded = { key: string; board: Board | null }

/**
 * Écran du classement (chap. 7), ouvert depuis l'accueil : un classement par jour (aujourd'hui, ou la veille, close) et
 * par mode, les meilleurs scores vérifiés et la ligne du joueur. Le mode affiché d'abord est celui choisi à l'accueil.
 */
export default function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const chosen = useSettingsStore((s) => s.difficulty)
  const playerId = useSettingsStore((s) => s.playerId)
  const { t, credits, calendarDay } = useI18n()
  const b = t.ranked.board
  const [today, yesterday] = openDays(new Date())
  // Mode et jour affichés, dernier classement reçu : états d'interface éphémères
  const [difficulty, setDifficulty] = useState<DifficultyId>(chosen)
  const [day, setDay] = useState(today)
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const key = `${day}:${difficulty}`

  // Synchronisation externe : le classement vit sur le serveur
  useEffect(() => {
    let current = true
    void fetchBoard(day, difficulty, playerId).then((board) => {
      if (current) setLoaded({ key: `${day}:${difficulty}`, board })
    })
    return () => {
      current = false
    }
  }, [day, difficulty, playerId])

  const board = loaded?.key === key ? loaded.board : undefined
  const own = board?.own

  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-4 px-4 py-8 motion-safe:animate-fade-in">
      <div>
        <Button onClick={onBack}>
          <ArrowLeft size={14} aria-hidden="true" />
          {b.back}
        </Button>
      </div>
      <header className="flex items-center gap-2">
        <ListOrdered size={28} aria-hidden="true" className="text-ranked-soft" />
        <h1 className="text-3xl font-bold tracking-widest text-ranked-soft uppercase">{b.title}</h1>
      </header>
      <p className="text-sm text-ink-soft">{b.intro}</p>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-6">
        <Pills
          label={b.modes}
          options={keysOf(DIFFICULTIES).map((id) => ({ id, label: t.difficulty.modes[id].name }))}
          value={difficulty}
          onChange={setDifficulty}
        />
        <Pills
          label={b.days}
          options={[
            { id: today, label: `${b.today} · ${calendarDay(today)}` },
            { id: yesterday, label: `${b.yesterday} · ${calendarDay(yesterday)}` },
          ]}
          value={day}
          onChange={setDay}
        />
      </div>

      <Panel icon={Medal} title={`${t.difficulty.modes[difficulty].name} · ${calendarDay(day)}`} subtitle={b.top(RANKED.top)}>
        {board === undefined ? <Hint>{b.loading}</Hint> : board === null ? <Hint tone="warning">{b.offline}</Hint> : <BoardList board={board} />}
        {own && (
          <p className="mt-3 border-t border-line pt-2 text-sm font-bold text-ranked-soft">
            {own.status === 'pending'
              ? b.pending
              : own.status === 'rejected'
                ? b.rejected
                : own.ending && isDefeat(own.ending)
                  ? b.ownDefeat(b.rank(own.rank ?? 0))
                  : b.own(b.rank(own.rank ?? 0), credits(own.score ?? 0))}
          </p>
        )}
      </Panel>
    </main>
  )
}

/** Choix exclusif en pastilles (mode, jour) */
function Pills<T extends string>({ label, options, value, onChange }: PillsProps<T>) {
  return (
    <div className="flex flex-col gap-1.5" role="group" aria-label={label}>
      <span className="text-xs font-bold text-ink-muted uppercase">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = option.id === value
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.id)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${FOCUS_RING} ${
                active
                  ? 'border-ranked-soft/60 bg-ranked/20 font-bold text-ranked-soft'
                  : 'border-line text-ink-muted hover:border-line-strong hover:text-ink'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Les lignes du classement : rang, pseudo, fin atteinte, score (ou « Défaite ») ; la ligne du joueur ressort */
function BoardList({ board }: BoardListProps) {
  const { t, credits } = useI18n()
  const b = t.ranked.board
  if (board.entries.length === 0) return <Hint>{b.empty}</Hint>
  const ownRank = board.own?.status === 'valid' ? board.own.rank : null
  return (
    <ol className="flex flex-col text-sm">
      {board.entries.map((entry) => {
        const mine = entry.rank === ownRank
        return (
          <li
            key={entry.rank}
            className={`flex items-baseline gap-3 rounded px-2 py-1.5 ${mine ? 'bg-ranked/20 ring-1 ring-ranked-soft/50' : 'even:bg-raised/40'}`}
          >
            <span className={`w-10 shrink-0 font-bold ${entry.rank <= 3 ? 'text-accent' : 'text-ink-muted'}`}>{b.rank(entry.rank)}</span>
            <span className="min-w-0 flex-1 truncate font-bold text-ink">
              {entry.pseudo}
              {mine && <span className="ml-2 text-xs font-normal text-ranked-soft">{b.you}</span>}
            </span>
            <span className="hidden text-ink-muted sm:inline">{t.end.endings[entry.ending].title}</span>
            {/* Une défaite n'a pas de score : elle le dit, et passe après toutes les victoires (chap. 1) */}
            <span className={`w-24 shrink-0 text-right ${isDefeat(entry.ending) ? 'font-bold text-danger' : 'text-ink-soft'}`}>
              {isDefeat(entry.ending) ? b.defeat : credits(entry.score)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
