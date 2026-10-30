import { useState, type ReactNode } from 'react'
import { useI18n } from '../../i18n/useI18n.ts'
import Button, { type ButtonProps } from './Button.tsx'
import Modal from './Modal.tsx'

type ConfirmButtonProps = ButtonProps & {
  /** Demande de confirmation avant l'action ; sans elle, le bouton agit directement */
  confirm?: { title: string; message: ReactNode; action: string }
  onClick: () => void
}

/** Bouton d'une action coûteuse ou risquée : une fenêtre en rappelle le prix avant d'agir (chap. 7) */
export default function ConfirmButton({ confirm, onClick, ...props }: ConfirmButtonProps) {
  const { t } = useI18n()
  // Fenêtre de confirmation ouverte : état d'interface éphémère
  const [asking, setAsking] = useState(false)
  if (!confirm) return <Button {...props} onClick={onClick} />

  return (
    <>
      <Button {...props} onClick={() => setAsking(true)} />
      <Modal open={asking} onClose={() => setAsking(false)} title={<h2 className="font-bold text-accent uppercase">{confirm.title}</h2>}>
        <div className="text-sm text-ink-soft">{confirm.message}</div>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button onClick={() => setAsking(false)}>{t.modal.cancel}</Button>
          <Button
            variant="danger"
            onClick={() => {
              setAsking(false)
              onClick()
            }}
          >
            {confirm.action}
          </Button>
        </div>
      </Modal>
    </>
  )
}
