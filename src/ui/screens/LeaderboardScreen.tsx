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

/** Choix du mode : tous réunis, ou un seul */
type ModeFilter = DifficultyId | 'all'

/** Classement lu pour un jour et un mode : en cours de chargement, reçu, ou injoignable */
type Loaded = { key: string; board: Board | null }

/**
 * Écran du classement (chap. 7), ouvert depuis l'accueil : un classement par jour (aujourd'hui, ou la veille, close),
 * tous modes réunis avec le mode de chaque partie, ou filtré sur un mode ; les meilleurs scores vérifiés et les parties
 * du joueur.
 */
export default function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const playerId = useSettingsStore((s) => s.playerId)
  const { t, credits, calendarDay } = useI18n()
  const b = t.ranked.board
  const [today, yesterday] = openDays(new Date())
  // Mode et jour affichés, dernier classement reçu : états d'interface éphémères
  const [mode, setMode] = useState<ModeFilter>('all')
  const [day, setDay] = useState(today)
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const key = `${day}:${mode}`

  // Synchronisation externe : le classement vit sur le serveur
  useEffect(() => {
    let current = true
    void fetchBoard(day, mode === 'all' ? null : mode, playerId).then((board) => {
      if (current) setLoaded({ key: `${day}:${mode}`, board })
    })
    return () => {
      current = false
    }
  }, [day, mode, playerId])

  const board = loaded?.key === key ? loaded.board : undefined
  const modeName = (id: DifficultyId) => t.difficulty.modes[id].name

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
          options={[{ id: 'all', label: b.allModes }, ...keysOf(DIFFICULTIES).map((id) => ({ id, label: modeName(id) }))]}
          value={mode}
          onChange={setMode}
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

      <Panel icon={Medal} title={`${mode === 'all' ? b.allModes : modeName(mode)} · ${calendarDay(day)}`} subtitle={b.top(RANKED.top)}>
        {board === undefined ? <Hint>{b.loading}</Hint> : board === null ? <Hint tone="warning">{b.offline}</Hint> : <BoardList board={board} />}
        {board && board.mine.length > 0 && (
          <ul className="mt-3 flex flex-col gap-1 border-t border-line pt-2 text-sm font-bold text-ranked-soft">
            {board.mine.map((own) => (
              <li key={own.difficulty}>
                {own.status === 'pending'
                  ? b.pending(modeName(own.difficulty))
                  : own.status === 'rejected'
                    ? b.rejected(modeName(own.difficulty))
                    : own.ending && isDefeat(own.ending)
                      ? b.ownDefeat(modeName(own.difficulty), b.rank(own.rank ?? 0))
                      : b.own(modeName(own.difficulty), b.rank(own.rank ?? 0), credits(own.score ?? 0))}
              </li>
            ))}
          </ul>
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

/** Les lignes du classement : rang, pseudo, mode, fin atteinte, score (ou « Défaite ») ; les lignes du joueur ressortent */
function BoardList({ board }: BoardListProps) {
  const { t, credits } = useI18n()
  const b = t.ranked.board
  if (board.entries.length === 0) return <Hint>{b.empty}</Hint>
  const ownRanks = board.mine.flatMap((own) => (own.status === 'valid' && own.rank !== null ? [own.rank] : []))
  return (
    <ol className="flex flex-col text-sm">
      {board.entries.map((entry) => {
        const mine = ownRanks.includes(entry.rank)
        const mode = t.difficulty.modes[entry.difficulty].name
        return (
          <li
            key={entry.rank}
            className={`flex items-baseline gap-3 rounded px-2 py-1.5 ${mine ? 'bg-ranked/20 ring-1 ring-ranked-soft/50' : 'even:bg-raised/40'}`}
          >
            <span className={`w-10 shrink-0 font-bold ${entry.rank <= 3 ? 'text-accent' : 'text-ink-muted'}`}>{b.rank(entry.rank)}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-bold text-ink">
                {entry.pseudo}
                {mine && <span className="ml-2 text-xs font-normal text-ranked-soft">{b.you}</span>}
              </span>
              {/* Sur téléphone, le mode passe sous le pseudo pour lui laisser la largeur */}
              <span className="block text-xs text-ink-muted sm:hidden">{mode}</span>
            </span>
            <span className="hidden w-28 shrink-0 truncate text-xs text-ink-muted sm:inline">{mode}</span>
            <span className="hidden w-36 shrink-0 truncate text-ink-muted sm:inline">{t.end.endings[entry.ending].title}</span>
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
