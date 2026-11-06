import { ListOrdered } from 'lucide-react'
import { useEffect, useState } from 'react'
import { openDays, type Board } from '../../../server/runs.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { fetchBoard } from '../../net/leaderboard.ts'
import { useSettingsStore } from '../../stores/settingsStore.ts'
import { FOCUS_RING } from '../shared/focus.ts'
import Hint from '../shared/Hint.tsx'
import Panel from '../shared/Panel.tsx'

/** Classement lu pour un jour et un mode : en cours de chargement, reçu, ou injoignable */
type Loaded = { key: string; board: Board | null }

/**
 * Classement du jour (chap. 7), dans le mode choisi : les meilleurs scores vérifiés et la ligne du joueur ; celui de la
 * veille, clos, à un clic
 */
export default function LeaderboardPanel() {
  const difficulty = useSettingsStore((s) => s.difficulty)
  const playerId = useSettingsStore((s) => s.playerId)
  const { t, credits, calendarDay } = useI18n()
  const b = t.ranked.board
  const [today, yesterday] = openDays(new Date())
  // Jour affiché (aujourd'hui ou la veille) et dernier classement reçu : états d'interface éphémères
  const [showYesterday, setShowYesterday] = useState(false)
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const day = showYesterday ? yesterday : today
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
    <Panel icon={ListOrdered} title={b.title} info={b.info} aside={t.difficulty.modes[difficulty].name}>
      <div className="mb-3 flex gap-1.5" role="group" aria-label={b.title}>
        {[
          { label: `${b.today} · ${calendarDay(today)}`, active: !showYesterday, select: () => setShowYesterday(false) },
          { label: `${b.yesterday} · ${calendarDay(yesterday)}`, active: showYesterday, select: () => setShowYesterday(true) },
        ].map(({ label, active, select }) => (
          <button
            key={label}
            type="button"
            aria-pressed={active}
            onClick={select}
            className={`rounded-full border px-2 py-0.5 text-xs ${FOCUS_RING} ${
              active ? 'border-accent bg-accent/15 text-accent' : 'border-line text-ink-muted hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {board === undefined ? <Hint>{b.loading}</Hint> : board === null ? <Hint tone="warning">{b.offline}</Hint> : <BoardList board={board} />}
      {own && (
        <p className="mt-2 text-sm text-ink">
          {own.status === 'pending' ? b.pending : own.status === 'rejected' ? b.rejected : b.own(b.rank(own.rank ?? 0), credits(own.score ?? 0))}
        </p>
      )}
    </Panel>
  )
}

type BoardListProps = {
  board: Board
}

/** Les lignes du classement : rang, pseudo, fin atteinte, score */
function BoardList({ board }: BoardListProps) {
  const { t, credits } = useI18n()
  const b = t.ranked.board
  if (board.entries.length === 0) return <Hint>{b.empty}</Hint>
  return (
    <ol className="flex flex-col gap-1 text-sm">
      {board.entries.map((entry) => (
        <li key={entry.rank} className="flex items-baseline gap-2">
          <span className="w-10 shrink-0 text-ink-muted">{b.rank(entry.rank)}</span>
          <span className="min-w-0 flex-1 truncate font-bold text-ink">{entry.pseudo}</span>
          <span className="hidden text-ink-muted sm:inline">{t.end.endings[entry.ending].title}</span>
          <span className="shrink-0 text-ink-soft">{credits(entry.score)}</span>
        </li>
      ))}
    </ol>
  )
}
