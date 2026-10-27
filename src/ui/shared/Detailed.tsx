import type { Breakdown } from '../../engine/breakdown.ts'
import BreakdownView from './BreakdownView.tsx'
import { FOCUS_RING } from './focus.ts'

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
        className={`cursor-pointer list-none rounded underline ${FOCUS_RING} decoration-zinc-600 decoration-dotted underline-offset-4 group-open:decoration-amber-400`}
      >
        {format(breakdown.total)}
      </summary>
      <div className={`absolute ${align === 'left' ? 'left-0' : 'right-0'} z-10 mt-1 w-64 rounded border border-zinc-700 bg-zinc-900 p-2 shadow-lg`}>
        <BreakdownView breakdown={breakdown} formatTotal={format} />
      </div>
    </details>
  )
}
