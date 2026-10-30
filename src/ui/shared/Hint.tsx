import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { TONE_TEXT, type Tone } from './styles.ts'

type HintProps = {
  tone?: Tone
  icon?: LucideIcon
  className?: string
  children: ReactNode
}

/** Ligne d'explication en petit : règle, raison d'un refus, annonce */
export default function Hint({ tone = 'muted', icon: Icon, className = '', children }: HintProps) {
  return (
    <p className={`text-xs ${TONE_TEXT[tone]} ${Icon ? 'flex items-start gap-1' : ''} ${className}`}>
      {Icon && <Icon size={14} aria-hidden="true" className="mt-px shrink-0" />}
      {Icon ? <span>{children}</span> : children}
    </p>
  )
}
