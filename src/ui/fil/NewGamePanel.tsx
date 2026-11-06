import { House, RotateCcw } from 'lucide-react'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import ManualButton from '../manual/ManualModal.tsx'
import Button from '../shared/Button.tsx'
import ConfirmButton from '../shared/ConfirmButton.tsx'
import Hint from '../shared/Hint.tsx'

type NewGamePanelProps = {
  /** Revenir à l'accueil, où se choisissent le mode et la partie classée */
  onHome: () => void
}

/**
 * Fin d'En bref (chap. 7) : le manuel du passeur, le retour à l'accueil, et une nouvelle partie libre dans le mode de la
 * partie en cours ; le mode se choisit à l'accueil, avant de lancer une partie
 */
export default function NewGamePanel({ onHome }: NewGamePanelProps) {
  const newGame = useGameStore((s) => s.newGame)
  const difficulty = useGameStore((s) => s.game.difficulty)
  const { t } = useI18n()
  const mode = t.difficulty.modes[difficulty].name
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <ManualButton />
        <Button onClick={onHome}>
          <House size={14} aria-hidden="true" />
          {t.hud.home}
        </Button>
        <ConfirmButton
          onClick={() => newGame(difficulty)}
          confirm={{ title: t.hud.newGame, message: t.hud.newGameConfirm(mode), action: t.hud.newGameAction }}
        >
          <RotateCcw size={14} aria-hidden="true" />
          {t.hud.newGame}
        </ConfirmButton>
      </div>
      <Hint>{t.hud.homeHint}</Hint>
    </div>
  )
}
