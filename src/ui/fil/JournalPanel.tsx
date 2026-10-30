import { BookMarked } from 'lucide-react'
import { useState } from 'react'
import { wealthOf } from '../../engine/journal.ts'
import type { DayLog, WealthSnapshot } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Hint from '../shared/Hint.tsx'
import Panel from '../shared/Panel.tsx'
import { useHighlightText } from './useHighlightText.ts'

type DayEntryProps = {
  log: DayLog
  /** Patrimoine qui ferme la journée : le matin suivant, ou maintenant pour aujourd'hui */
  end: WealthSnapshot
}

/** Patrimoine net : Cash-Puce et offshore, moins la dette */
const net = ({ cash, offshore, debt }: WealthSnapshot) => cash + offshore - debt

/** Bilan de la veille, puis tout le carnet de route sur demande (chap. 7) */
export default function JournalPanel() {
  // Le patrimoine du moment ferme la journée en cours : état entier
  const game = useGameStore((s) => s.game)
  const { t } = useI18n()
  // Carnet complet déplié : état d'interface éphémère
  const [all, setAll] = useState(false)
  const days = game.journal.map((log, index) => ({ log, end: game.journal[index + 1]?.start ?? wealthOf(game) }))
  const yesterday = days.length > 1 ? days[days.length - 2] : null

  return (
    <Panel icon={BookMarked} title={t.fil.journal} collapseId="fil-journal">
      {yesterday ? <DayEntry log={yesterday.log} end={yesterday.end} /> : <Hint>{t.fil.noYesterday}</Hint>}
      {days.length > 2 && (
        <>
          <Button size="sm" className="mt-2" onClick={() => setAll(!all)}>
            {all ? t.fil.hideAll : t.fil.showAll}
          </Button>
          {all && (
            <ul className="mt-2 flex flex-col gap-3 border-t border-line pt-2">
              {days
                .slice(0, -2)
                .reverse()
                .map(({ log, end }) => (
                  <li key={log.day}>
                    <DayEntry log={log} end={end} />
                  </li>
                ))}
            </ul>
          )}
        </>
      )}
    </Panel>
  )
}

/** Une journée : écart de patrimoine, achats et ventes, faits marquants */
export function DayEntry({ log, end }: DayEntryProps) {
  const { t, credits, signedCredits } = useI18n()
  const text = useHighlightText()
  const delta = net(end) - net(log.start)
  return (
    <div className="text-xs">
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-bold text-accent">{t.fil.yesterday(log.day)}</span>
        <span className={delta >= 0 ? 'text-success' : 'text-danger'}>{signedCredits(delta)}</span>
        <span className="text-ink-muted">{t.fil.flows(credits(log.bought), credits(log.sold))}</span>
      </p>
      {log.highlights.length > 0 && (
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-ink-soft">
          {/* Liste figée du carnet, jamais réordonnée, et dont deux faits peuvent se ressembler : la position sert de clé */}
          {log.highlights.map((highlight, position) => (
            <li key={position}>{text(highlight)}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
