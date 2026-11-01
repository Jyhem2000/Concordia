import { RotateCcw } from 'lucide-react'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import ManualButton from '../manual/ManualModal.tsx'
import ConfirmButton from '../shared/ConfirmButton.tsx'

/** Fin d'En bref (chap. 7) : le manuel du passeur, et la nouvelle partie ; la carrière attend la fin de partie */
export default function NewGamePanel() {
  const newGame = useGameStore((s) => s.newGame)
  const { t } = useI18n()
  return (
    <div className="flex flex-wrap gap-2">
      <ManualButton />
      <ConfirmButton onClick={newGame} confirm={{ title: t.hud.newGame, message: t.hud.newGameConfirm, action: t.hud.newGameAction }}>
        <RotateCcw size={14} aria-hidden="true" />
        {t.hud.newGame}
      </ConfirmButton>
    </div>
  )
}
