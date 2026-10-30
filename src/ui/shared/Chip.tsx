import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { TONE_CHIP, type Tone } from './styles.ts'

type ChipProps = {
  tone?: Tone
  icon?: LucideIcon
  children: ReactNode
}

/** Pastille : tag d'un produit, statut d'un district, indicateur */
export default function Chip({ tone = 'neutral', icon: Icon, children }: ChipProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs whitespace-nowrap ${TONE_CHIP[tone]}`}>
      {Icon && <Icon size={12} aria-hidden="true" className="shrink-0" />}
      {children}
    </span>
  )
}
