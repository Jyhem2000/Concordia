import { Lock, Trophy } from 'lucide-react'
import type { EndingId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useRecordsStore } from '../../stores/recordsStore.ts'
import Chip from '../shared/Chip.tsx'
import Hint from '../shared/Hint.tsx'
import Panel from '../shared/Panel.tsx'

/** Fins qui sont des accomplissements, de la plus prestigieuse à la plus modeste (chap. 1) */
const ACCOMPLISHMENTS: readonly EndingId[] = ['saboteur', 'resident', 'elite', 'mafia', 'standard']
const DEFEATS: readonly EndingId[] = ['bio-bricks', 'death', 'execution']

/** Palmarès, d'une partie à l'autre : parties jouées, meilleur score, fins atteintes (chap. 7) */
export default function RecordsPanel() {
  const games = useRecordsStore((s) => s.games)
  const endings = useRecordsStore((s) => s.endings)
  const bestScore = useRecordsStore((s) => s.bestScore)
  const { t, credits } = useI18n()
  const defeats = DEFEATS.reduce((total, id) => total + (endings[id] ?? 0), 0)

  return (
    <Panel icon={Trophy} title={t.records.title} collapseId="fil-records">
      {games === 0 ? (
        <Hint>{t.records.none}</Hint>
      ) : (
        <p className="text-xs text-ink-soft">
          {t.records.summary(games, defeats)}
          {bestScore !== null && <span className="ml-2 font-bold text-offshore">{t.records.best(credits(bestScore))}</span>}
        </p>
      )}
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {ACCOMPLISHMENTS.map((id) => {
          const count = endings[id] ?? 0
          return (
            <li key={id}>
              {count > 0 ? (
                <Chip tone="success" icon={Trophy}>
                  {t.records.reached(t.end.endings[id].title, count)}
                </Chip>
              ) : (
                <Chip tone="muted" icon={Lock}>
                  {t.end.endings[id].title}
                </Chip>
              )}
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
