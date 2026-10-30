import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { FOCUS_RING } from './focus.ts'
import { TONE_CHIP, type Tone } from './styles.ts'

type ChipProps = {
  tone?: Tone
  icon?: LucideIcon
  /** Pastille cliquable (filtre) : bouton à bascule, en couleur d'accent quand il est enfoncé */
  onClick?: () => void
  pressed?: boolean
  children: ReactNode
}

const BASE = 'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs whitespace-nowrap'

/** Pastille : tag d'un produit, statut d'un district, indicateur, filtre */
export default function Chip({ tone = 'neutral', icon: Icon, onClick, pressed = false, children }: ChipProps) {
  const content = (
    <>
      {Icon && <Icon size={12} aria-hidden="true" className="shrink-0" />}
      {children}
    </>
  )
  if (onClick)
    return (
      <button type="button" aria-pressed={pressed} onClick={onClick} className={`${BASE} ${FOCUS_RING} ${TONE_CHIP[pressed ? 'accent' : tone]}`}>
        {content}
      </button>
    )
  return <span className={`${BASE} ${TONE_CHIP[tone]}`}>{content}</span>
}
