import type { Breakdown } from '../../engine/breakdown.ts'
import BreakdownView from './BreakdownView.tsx'
import Tip from './Tip.tsx'

type DetailedProps = {
  breakdown: Breakdown
  format: (value: number) => string
  /** Probabilité (risque, chance) : les lignes du détail en pourcentages, comme le total */
  percent?: boolean
  className?: string
}

/** Valeur calculée, soulignée en pointillés : son détail ligne par ligne s'ouvre en infobulle (chap. 7) */
export default function Detailed({ breakdown, format, percent = false, className = '' }: DetailedProps) {
  return (
    <Tip
      wide
      content={<BreakdownView breakdown={breakdown} formatTotal={format} percent={percent} />}
      className={`underline decoration-ink-faint decoration-dotted underline-offset-4 ${className}`}
    >
      {format(breakdown.total)}
    </Tip>
  )
}
