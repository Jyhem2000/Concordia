import type { Breakdown } from '../../engine/breakdown.ts'
import BreakdownView from './BreakdownView.tsx'
import { FOCUS_RING } from './focus.ts'
import { POPOVER } from './styles.ts'

type DetailedProps = {
  breakdown: Breakdown
  format: (value: number) => string
  /** Côté d'ancrage du détail : à droite pour une valeur collée au bord droit de l'écran */
  align?: 'left' | 'right'
  className?: string
}

/** Valeur calculée qu'on peut toucher pour révéler son détail */
export default function Detailed({ breakdown, format, align = 'left', className = '' }: DetailedProps) {
  return (
    <details className={`group relative ${className}`}>
      <summary
        className={`cursor-pointer list-none rounded underline ${FOCUS_RING} decoration-ink-faint decoration-dotted underline-offset-4 group-open:decoration-accent`}
      >
        {format(breakdown.total)}
      </summary>
      <div className={`${align === 'left' ? 'left-0' : 'right-0'} w-64 ${POPOVER}`}>
        <BreakdownView breakdown={breakdown} formatTotal={format} />
      </div>
    </details>
  )
}
