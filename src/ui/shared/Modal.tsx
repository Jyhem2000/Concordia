import { X } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useRef, type ReactNode } from 'react'
import { useI18n } from '../../i18n/useI18n.ts'
import { FOCUS_RING } from './focus.ts'
import { POP } from './motion.ts'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: ReactNode
  children: ReactNode
}

/**
 * Fenêtre par-dessus l'écran (fiche produit…) : élément `<dialog>` natif, qui piège le focus et se ferme avec Échap ;
 * un clic sur le fond la ferme aussi
 */
export default function Modal({ open, onClose, title, children }: ModalProps) {
  const { t } = useI18n()
  const dialog = useRef<HTMLDialogElement>(null)

  // Synchronisation avec l'API du navigateur : seul showModal() rend le fond inerte
  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="m-auto max-h-dvh w-full max-w-lg overflow-y-auto rounded-lg border border-line-strong bg-panel p-0 text-sm text-ink shadow-xl shadow-black/60 backdrop:bg-black/70"
    >
      {open && (
        <motion.div {...POP}>
          <div className="sticky top-0 z-10 flex items-start gap-2 border-b border-line bg-panel px-4 py-3">
            <div className="min-w-0 flex-1">{title}</div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.modal.close}
              className={`rounded-md p-1 text-ink-muted hover:text-ink ${FOCUS_RING}`}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="p-4">{children}</div>
        </motion.div>
      )}
    </dialog>
  )
}
