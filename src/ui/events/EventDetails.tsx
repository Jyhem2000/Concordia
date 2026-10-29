import type { GlobalEventId, LocalEventId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { FOCUS_RING } from '../shared/focus.ts'
import { useEventLines } from './useEventLines.ts'

type EventDetailsProps = {
  event: GlobalEventId | LocalEventId
  /** Libellé du résumé ; le nom de l'événement par défaut */
  label?: string
  className?: string
}

/** Événement dépliable sur ses effets exacts : produits et facteurs, risque, tags, stocks (chap. 6 et 7) */
export default function EventDetails({ event, label, className = '' }: EventDetailsProps) {
  const { t } = useI18n()
  const lines = useEventLines()(event)
  return (
    <details className={`group relative ${className}`}>
      <summary className={`cursor-pointer list-none rounded underline decoration-zinc-600 decoration-dotted underline-offset-4 ${FOCUS_RING}`}>
        {label ?? t.event[event].name}
      </summary>
      <ul className="absolute left-0 z-30 mt-1 w-72 list-disc space-y-0.5 rounded border border-zinc-700 bg-zinc-900 p-2 pl-6 text-xs text-zinc-300 shadow-lg">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </details>
  )
}
