import { isDefeat } from '../../engine/routine.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'

/** Écran de fin : la fin débloquée à l'audit du Jour 30, ou la défaite (chap. 1) */
export default function EndScreen() {
  const ending = useGameStore((s) => s.game.ending)
  const newGame = useGameStore((s) => s.newGame)
  const { t, credits } = useI18n()
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
      <Button variant="primary" onClick={newGame}>
        {t.hud.newGame}
      </Button>
    </main>
  )
}
