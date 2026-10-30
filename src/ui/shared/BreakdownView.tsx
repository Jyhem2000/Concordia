import type { Breakdown, BreakdownLine } from '../../engine/breakdown.ts'
import { useI18n } from '../../i18n/useI18n.ts'

type BreakdownViewProps = {
  breakdown: Breakdown
  /** Mise en forme du total (₡, %…) ; les opérandes sont des nombres bruts */
  formatTotal: (value: number) => string
}

type LinesProps = {
  lines: readonly BreakdownLine[]
}

/** Détail ligne par ligne d'un calcul : « zéro calculatrice, zéro boîte noire » (chap. 7) */
export default function BreakdownView({ breakdown, formatTotal }: BreakdownViewProps) {
  const { t } = useI18n()
  return (
    <div className="text-xs">
      <Lines lines={breakdown.lines} />
      <div className="mt-1 flex justify-between border-t border-line-strong pt-1 font-bold">
        <span>{t.breakdown.total}</span>
        <span>{formatTotal(breakdown.total)}</span>
      </div>
    </div>
  )
}

function Lines({ lines }: LinesProps) {
  const { label, number, multiplier } = useI18n()

  const operand = (line: BreakdownLine) => {
    switch (line.op) {
      case 'add':
        return `${line.value >= 0 ? '+' : '−'}${number(Math.abs(line.value))}`
      case 'mul':
        return multiplier(line.value)
      case 'base':
        return number(line.value)
      default:
        return `= ${number(line.value)}`
    }
  }

  return (
    <ul className="space-y-0.5">
      {/* Liste figée (Breakdown gelé, jamais réordonné ni filtré) et sans identifiant propre :
          la position est l'identité de la ligne, l'index est donc une clé stable ici */}
      {lines.map((line, position) => (
        <li key={position}>
          <div className="flex justify-between gap-3">
            <span className="text-ink-muted">{label(line.source)}</span>
            <span>{operand(line)}</span>
          </div>
          {line.detail && line.op !== 'base' && (
            <div className="ml-3 border-l border-line pl-2">
              <Lines lines={line.detail.lines} />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
