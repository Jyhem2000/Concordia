import { CalendarDays } from 'lucide-react'
import { GAME_LENGTH_DAYS } from '../../data/balance.ts'
import { DISTRICT_IDS } from '../../data/districts.ts'
import { agenda, type AgendaItem } from '../../engine/agenda.ts'
import { protectionBreakdown } from '../../engine/finance.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Panel from '../shared/Panel.tsx'
import { TONE_BG, TONE_TEXT, type Tone } from '../shared/styles.ts'
import Tip from '../shared/Tip.tsx'
import { useHighlightText } from './useHighlightText.ts'

type Line = { text: string; tone: Tone }

/** Ligne colorée du détail d'un jour */
const ln = (text: string, tone: Tone): Line => ({ text, tone })

/** Couleur de chaque échéance */
const AGENDA_TONES: Record<AgendaItem['kind'], Tone> = {
  debt: 'danger',
  debtLate: 'danger',
  protection: 'warning',
  lottery: 'neutral',
  vice: 'neutral',
  prophecy: 'accent',
  service: 'muted',
  trapdoor: 'muted',
  contract: 'warning',
  audit: 'accent',
}

/** Pastilles au plus par case : le détail est dans l'infobulle */
const MAX_DOTS = 3

/**
 * Calendrier de la partie (chap. 7) : chaque jour passé avec ses événements et ses faits marquants (carnet de route),
 * chaque jour à venir avec les échéances connues à coup sûr
 */
export default function CalendarPanel() {
  // Carnet, échéances et collecte se lisent sur l'état entier
  const game = useGameStore((s) => s.game)
  const { t, credits } = useI18n()
  const highlight = useHighlightText()
  const items = agenda(game)

  const itemLine = (item: AgendaItem): Line => {
    const tone = AGENDA_TONES[item.kind]
    switch (item.kind) {
      case 'debt':
        return { text: t.fil.debt(credits(game.debt)), tone }
      case 'debtLate':
        return { text: t.fil.debtLate, tone }
      case 'protection':
        return { text: t.fil.protection(credits(protectionBreakdown(game).total)), tone }
      case 'lottery':
        return { text: t.fil.lottery, tone }
      case 'vice':
        return { text: t.fil.viceEnd(t.product[item.productId].name, t.district[item.districtId].name), tone }
      case 'prophecy':
        return { text: t.fil.prophecy(t.event[item.event].name), tone }
      case 'service':
        return { text: t.fil.serviceReady(t.fil.service[item.key]), tone }
      case 'trapdoor':
        return { text: t.fil.trapdoorReady, tone }
      case 'contract':
        return { text: t.fil.agendaContract(t.district[item.districtId].name), tone }
      case 'audit':
        return { text: t.fil.audit(GAME_LENGTH_DAYS), tone }
    }
  }

  // Lignes de chaque jour : le carnet pour le passé et aujourd'hui, les échéances pour aujourd'hui et l'avenir
  const linesOf = (day: number): Line[] => {
    const log = day <= game.day ? game.journal.find((entry) => entry.day === day) : undefined
    const past: Line[] = log
      ? [
          ...(log.events.global ? [ln(t.event[log.events.global].name, 'accent')] : []),
          ...DISTRICT_IDS.flatMap((id) => {
            const event = log.events.local[id]
            return event ? [ln(t.events.local(t.district[id].name, t.event[event].name), 'info')] : []
          }),
          ...log.highlights.filter((entry) => entry.kind !== 'trip').map((entry) => ln(highlight(entry), 'neutral')),
        ]
      : []
    return [...past, ...items.filter((item) => item.day === day).map(itemLine)]
  }
  const days = Array.from({ length: GAME_LENGTH_DAYS }, (_, index) => index + 1)

  return (
    <Panel icon={CalendarDays} title={t.fil.agenda} collapseId="fil-agenda">
      <ol className="grid grid-cols-6 gap-1">
        {days.map((day) => {
          const lines = linesOf(day)
          const state = day < game.day ? 'past' : day === game.day ? 'today' : 'future'
          return (
            <li key={day}>
              <Tip
                content={
                  <div>
                    <p className="font-bold text-ink">{t.fil.calendarDay(day)}</p>
                    {lines.length === 0 ? (
                      <p className="text-ink-muted">{t.fil.calendarEmpty}</p>
                    ) : (
                      <ul className="mt-1 flex flex-col gap-0.5">
                        {/* Lignes d'un jour, recalculées à chaque rendu et sans identité propre : la position sert de clé */}
                        {lines.map((line, position) => (
                          <li key={position} className={TONE_TEXT[line.tone]}>
                            {line.text}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                }
                className={`flex h-14 w-full flex-col items-center justify-center gap-1 rounded-md border text-xs ${
                  state === 'today'
                    ? 'border-accent bg-accent/15 font-bold text-accent'
                    : state === 'past'
                      ? 'border-line bg-base text-ink-faint'
                      : 'border-line-strong bg-raised text-ink-soft'
                }`}
              >
                {day}
                <span className="flex h-2.5 gap-1" aria-hidden="true">
                  {lines.slice(0, MAX_DOTS).map((line, position) => (
                    <span key={position} className={`h-2.5 w-2.5 rounded-full ${state === 'past' ? 'bg-ink-faint' : TONE_BG[line.tone]}`} />
                  ))}
                </span>
                <span className="sr-only">{t.fil.calendarCount(lines.length)}</span>
              </Tip>
            </li>
          )
        })}
      </ol>
    </Panel>
  )
}
