import { DISTRICT_IDS } from '../../data/districts.ts'
import { AFTERSHOCK } from '../../data/events.ts'
import { KARMA } from '../../data/locations.ts'
import { aftershockEvents, rumorReliability } from '../../engine/events.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import EventDetails from '../events/EventDetails.tsx'

/** Ligne des événements du téléscripteur : global, locaux, contrecoups, Loterie et rumeur du lendemain (chap. 8 et 10) */
export default function EventsTicker() {
  const events = useGameStore((s) => s.game.events)
  const day = useGameStore((s) => s.game.day)
  const phase = useGameStore((s) => s.game.phase)
  const { t, percent, multiplier } = useI18n()
  const ctx = { day, phase, events }

  const locals = DISTRICT_IDS.flatMap((id) => {
    const event = events.local[id]
    return event ? [{ district: id, event }] : []
  })
  const aftershocks = [...new Set(DISTRICT_IDS.flatMap((id) => aftershockEvents(ctx, id)))]
  const lottery = events.lottery
  // Panique de Karma-Cham du jour ; prédiction de Cassandre-88 pour demain
  const influence = useGameStore((s) => (s.game.influence?.day === s.game.day ? s.game.influence : null))
  const foretold = events.prophecy?.day === day + 1
  const drawToday = lottery !== null && lottery.day === day
  const vicesLive = lottery !== null && day <= lottery.viceUntil
  const name = (index: number) => t.events.names[index % t.events.names.length]

  if (!events.global && locals.length === 0 && aftershocks.length === 0 && !drawToday && !vicesLive && !events.rumor && !influence) return null

  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-zinc-800 px-4 py-1 text-xs text-zinc-300">
      {events.global && (
        <li className="font-bold text-amber-200">
          <EventDetails event={events.global} />
        </li>
      )}
      {locals.map(({ district, event }) => (
        <li key={district}>
          <EventDetails event={event} label={t.events.local(t.district[district].name, t.event[event].name)} />
        </li>
      ))}
      {aftershocks.map((event) => (
        <li key={event} className="text-zinc-400">
          {t.events.aftershock(t.event[event].name, multiplier(AFTERSHOCK.afterRush), multiplier(AFTERSHOCK.afterSale))}
        </li>
      ))}
      {lottery && drawToday && <li>{t.events.promoted(name(lottery.names.promoted), t.district[lottery.promoted].name)}</li>}
      {lottery && vicesLive && (
        <li>
          {t.events.demoted(name(lottery.names.demoted), t.district[lottery.demoted].name, t.district[lottery.viceDistrict].name)}
          {lottery.vice && <> {t.events.vice(t.product[lottery.vice].name, t.district[lottery.viceDistrict].name, lottery.viceUntil)}</>}
        </li>
      )}
      {influence && <li className="text-amber-200">{t.events.influence(t.tag[influence.tag].name, multiplier(KARMA.factor))}</li>}
      {events.rumor && (
        <li className="text-indigo-300 italic">
          {foretold ? t.events.prophecy(t.rumor[events.rumor]) : t.events.rumor(t.rumor[events.rumor], percent(rumorReliability(), 0))}
        </li>
      )}
    </ul>
  )
}
