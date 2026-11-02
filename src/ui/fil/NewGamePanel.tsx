import { RotateCcw } from 'lucide-react'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import { useSettingsStore } from '../../stores/settingsStore.ts'
import ManualButton from '../manual/ManualModal.tsx'
import DifficultyPicker from '../screens/DifficultyPicker.tsx'
import ConfirmButton from '../shared/ConfirmButton.tsx'

/** Fin d'En bref (chap. 7) : le manuel du passeur, et la nouvelle partie dans le mode choisi ; la carrière attend la fin de partie */
export default function NewGamePanel() {
  const newGame = useGameStore((s) => s.newGame)
  const difficulty = useSettingsStore((s) => s.difficulty)
  const { t } = useI18n()
  const mode = t.difficulty.modes[difficulty].name
  return (
    <div className="flex flex-col gap-3">
      <DifficultyPicker />
      <div className="flex flex-wrap gap-2">
        <ManualButton />
        <ConfirmButton
          onClick={() => newGame(difficulty)}
          confirm={{ title: t.hud.newGame, message: t.hud.newGameConfirm(mode), action: t.hud.newGameAction }}
        >
          <RotateCcw size={14} aria-hidden="true" />
          {t.hud.newGame}
        </ConfirmButton>
      </div>
    </div>
  )
}
