import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'

/** Fin de partie provisoire : l'audit du Jour 30 et les fins viendront avec la dette (chap. 2) */
export default function EndScreen() {
  const cash = useGameStore((s) => s.game.cash)
  const newGame = useGameStore((s) => s.newGame)
  const { t, credits } = useI18n()

  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-2xl font-bold text-amber-300">{t.end.title}</h1>
      <p className="text-zinc-300">{t.end.body}</p>
      <p>
        <span className="text-zinc-400">{t.end.finalCash} </span>
        <span className="text-xl font-bold text-yellow-300">{credits(cash)}</span>
      </p>
      <Button variant="primary" onClick={newGame}>
        {t.hud.newGame}
      </Button>
    </main>
  )
}
