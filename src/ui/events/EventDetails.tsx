import type { GlobalEventId, LocalEventId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import Tip from '../shared/Tip.tsx'
import { useEventLines } from './useEventLines.ts'

type EventDetailsProps = {
  event: GlobalEventId | LocalEventId
  /** Libellé du déclencheur ; le nom de l'événement par défaut */
  label?: string
  className?: string
}

/** Événement souligné en pointillés : ses effets exacts s'ouvrent en infobulle (produits et facteurs, risque, tags, stocks ; chap. 6 et 7) */
export default function EventDetails({ event, label, className = '' }: EventDetailsProps) {
  const { t } = useI18n()
  const lines = useEventLines()(event)
  return (
    <Tip
      wide
      content={
        <ul className="list-disc space-y-0.5 pl-4">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      }
      className={`text-left underline decoration-ink-faint decoration-dotted underline-offset-4 ${className}`}
    >
      {label ?? t.event[event].name}
    </Tip>
  )
}
