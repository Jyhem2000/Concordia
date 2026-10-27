import type { Breakdown } from '../../engine/breakdown.ts'
import BreakdownView from './BreakdownView.tsx'

type Props = {
  breakdown: Breakdown
  format: (value: number) => string
  className?: string
}

/** Valeur calculée qu'on peut toucher pour révéler son détail */
export default function Detailed({ breakdown, format, className = '' }: Props) {
  return (
    <details className={`group relative ${className}`}>
      <summary className="cursor-pointer list-none underline decoration-zinc-600 decoration-dotted underline-offset-4 group-open:decoration-amber-400">
        {format(breakdown.total)}
      </summary>
      <div className="absolute left-0 z-10 mt-1 w-64 max-w-[calc(100vw-2rem)] rounded border border-zinc-700 bg-zinc-900 p-2 shadow-lg">
        <BreakdownView breakdown={breakdown} formatTotal={format} />
      </div>
    </details>
  )
}
