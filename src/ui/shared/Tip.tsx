import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react'
import { Info } from 'lucide-react'
import { motion } from 'motion/react'
import { useState, type MouseEventHandler, type ReactNode } from 'react'
import { FOCUS_RING } from './focus.ts'
import { POP } from './motion.ts'
import { BUBBLE } from './styles.ts'

type TipProps = {
  /** Contenu de la bulle */
  content: ReactNode
  /** Déclencheur : une icône « i » par défaut, ou la donnée elle-même (valeur détaillable, indice) */
  children?: ReactNode
  /** Nom du déclencheur pour les lecteurs d'écran ; obligatoire avec l'icône « i » */
  label?: string
  /** Classes du déclencheur (soulignement d'une valeur détaillable…) */
  className?: string
  /** Bulle large : détail d'un calcul, liste d'effets */
  wide?: boolean
  /** Action du déclencheur au clic (une case de soute qui sort sa caisse du double fond) ; la bulle s'ouvre toujours au survol */
  onClick?: MouseEventHandler<HTMLButtonElement>
  /** Curseur du déclencheur : une explication par défaut, une action, ou un bouton grisé */
  cursor?: 'help' | 'pointer' | 'not-allowed'
}

const cursors = { help: 'cursor-help', pointer: 'cursor-pointer', 'not-allowed': 'cursor-not-allowed' }

/**
 * Infobulle (chap. 7) : s'ouvre au survol de la souris, au toucher sur mobile et au focus clavier ;
 * se ferme en quittant, en touchant ailleurs ou avec Échap. Rendue hors du panneau pour ne jamais être coupée.
 */
export default function Tip({ content, children, label, className = '', wide = false, onClick, cursor = 'help' }: TipProps) {
  // Bulle ouverte : état d'interface éphémère
  const [open, setOpen] = useState(false)
  // Éléments passés par état plutôt que par `refs` : le React Compiler interdit de lire un ref pendant le rendu
  const [reference, setReference] = useState<HTMLButtonElement | null>(null)
  const [floating, setFloating] = useState<HTMLDivElement | null>(null)
  const { floatingStyles, context } = useFloating({
    elements: { reference, floating },
    open,
    onOpenChange: setOpen,
    placement: 'bottom-start',
    middleware: [offset(6), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })
  const { getReferenceProps, getFloatingProps } = useInteractions([
    // Souris : survol, la bulle reste ouverte le temps d'y amener le pointeur
    useHover(context, { mouseOnly: true, handleClose: safePolygon() }),
    // Toucher et clavier : bascule au clic ; la souris passe par le survol
    useClick(context, { ignoreMouse: true }),
    useFocus(context, { visibleOnly: true }),
    useDismiss(context),
    useRole(context, { role: 'tooltip' }),
  ])

  return (
    <>
      <button
        type="button"
        ref={setReference}
        aria-label={children ? undefined : label}
        className={`inline-flex items-center rounded ${cursors[cursor]} ${children ? '' : 'align-middle text-ink-faint hover:text-ink-soft'} ${FOCUS_RING} ${className}`}
        {...getReferenceProps({ onClick })}
      >
        {children ?? <Info size={13} aria-hidden="true" />}
      </button>
      {open && (
        <FloatingPortal>
          <div ref={setFloating} style={floatingStyles} className={`z-50 ${wide ? 'w-72' : 'max-w-64'}`} {...getFloatingProps()}>
            <motion.div {...POP} className={BUBBLE}>
              {content}
            </motion.div>
          </div>
        </FloatingPortal>
      )}
    </>
  )
}
