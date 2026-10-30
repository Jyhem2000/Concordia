import { isDefeat } from '../../engine/routine.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import { useHighlightText } from '../fil/useHighlightText.ts'
import RecordsPanel from '../fil/RecordsPanel.tsx'
import WealthChart from '../fil/WealthChart.tsx'

/** Écran de fin : la fin débloquée à l'audit du Jour 30, ou la défaite (chap. 1) */
export default function EndScreen() {
  const ending = useGameStore((s) => s.game.ending)
  const newGame = useGameStore((s) => s.newGame)
  const journal = useGameStore((s) => s.game.journal)
  const { t, credits } = useI18n()
  const text = useHighlightText()
  // Cartouche de la partie : les faits marquants de chaque journée, sans les simples trajets
  const highlights = journal.flatMap((log) =>
    log.highlights.filter((highlight) => highlight.kind !== 'trip').map((highlight) => ({ day: log.day, line: text(highlight) })),
  )
  const id = ending?.id ?? 'standard'
  const defeat = isDefeat(id)

  return (
    <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
      {defeat && <p className="text-sm font-bold tracking-widest text-danger uppercase">{t.end.gameOver}</p>}
      <h1 className={`text-2xl font-bold ${defeat ? 'text-danger' : 'text-accent'}`}>{t.end.endings[id].title}</h1>
      <p className="text-ink-soft">{t.end.endings[id].epilogue}</p>
      {!defeat && ending && (
        <p>
          <span className="text-ink-muted">{t.end.score} </span>
          <span className="text-xl font-bold text-offshore">{credits(ending.score)}</span>
        </p>
      )}
      <section className="w-full rounded-lg border border-line bg-panel p-3 text-left">
        <WealthChart />
      </section>
      <section className="w-full rounded-lg border border-line bg-panel p-3 text-left">
        <h2 className="text-xs font-bold tracking-wide text-accent uppercase">{t.journal.highlights}</h2>
        {highlights.length === 0 ? (
          <p className="mt-1 text-xs text-ink-muted">{t.journal.noHighlight}</p>
        ) : (
          <ul className="mt-1 flex flex-col gap-0.5 text-xs text-ink-soft">
            {/* Liste figée du carnet, jamais réordonnée : la position sert de clé */}
            {highlights.map(({ day, line }, position) => (
              <li key={position} className="flex gap-2">
                <span className="w-8 shrink-0 text-ink-muted">{t.chart.dayTick(day)}</span>
                {line}
              </li>
            ))}
          </ul>
        )}
      </section>
      <div className="w-full text-left">
        <RecordsPanel />
      </div>
      <Button variant="primary" onClick={newGame}>
        {t.hud.newGame}
      </Button>
    </main>
  )
}
