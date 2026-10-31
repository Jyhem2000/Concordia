import { RotateCcw, Trophy } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import ConfirmButton from '../shared/ConfirmButton.tsx'
import Modal from '../shared/Modal.tsx'
import CareerView from './CareerView.tsx'

/** Fin d'En bref (chap. 7) : la carrière, d'une partie à l'autre, et la nouvelle partie */
export default function NewGamePanel() {
  const newGame = useGameStore((s) => s.newGame)
  const { t } = useI18n()
  // Fenêtre de la carrière ouverte : état d'interface éphémère
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => setOpen(true)}>
        <Trophy size={14} aria-hidden="true" />
        {t.records.open}
      </Button>
      <ConfirmButton onClick={newGame} confirm={{ title: t.hud.newGame, message: t.hud.newGameConfirm, action: t.hud.newGameAction }}>
        <RotateCcw size={14} aria-hidden="true" />
        {t.hud.newGame}
      </ConfirmButton>
      <Modal open={open} onClose={() => setOpen(false)} title={<h2 className="font-bold text-accent uppercase">{t.records.title}</h2>}>
        <CareerView />
      </Modal>
    </div>
  )
}
