import { DISTRICT_IDS } from '../../data/districts.ts'
import { AFTERSHOCK } from '../../data/events.ts'
import { KARMA } from '../../data/locations.ts'
import { aftershockEvents, rumorReliability } from '../../engine/events.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import EventDetails from '../events/EventDetails.tsx'
import Hint from '../shared/Hint.tsx'

/** Actualités du jour : événement global, locaux, contrecoups, Loterie, influence et rumeur du lendemain (chap. 6 et 7) */
export default function EventsList() {
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
  // Déclassement du dernier tirage (s'il y en a eu un) et durée de ses vices
  const demotion = lottery?.demoted && lottery.viceDistrict && day <= lottery.viceUntil ? { from: lottery.demoted, to: lottery.viceDistrict } : null
  const name = (index: number) => t.events.names[index % t.events.names.length]

  if (!events.global && locals.length === 0 && aftershocks.length === 0 && !drawToday && !demotion && !events.rumor && !influence)
    return <Hint>{t.fil.noNews}</Hint>

  return (
    <ul className="flex flex-col gap-1 text-xs text-ink-soft">
      {events.global && (
        <li className="font-bold text-accent">
          <EventDetails event={events.global} />
        </li>
      )}
      {locals.map(({ district, event }) => (
        <li key={district}>
          <EventDetails event={event} label={t.events.local(t.district[district].name, t.event[event].name)} />
        </li>
      ))}
      {aftershocks.map((event) => (
        <li key={event} className="text-ink-muted">
          {t.events.aftershock(t.event[event].name, multiplier(AFTERSHOCK.afterRush), multiplier(AFTERSHOCK.afterSale))}
        </li>
      ))}
      {lottery && drawToday && <li>{t.events.promoted(name(lottery.names.promoted), t.district[lottery.promoted].name)}</li>}
      {lottery && demotion && (
        <li>
          {t.events.demoted(name(lottery.names.demoted), t.district[demotion.from].name, t.district[demotion.to].name)}
          {lottery.vice && <> {t.events.vice(t.product[lottery.vice].name, t.district[demotion.to].name, lottery.viceUntil)}</>}
        </li>
      )}
      {influence && <li className="text-accent">{t.events.influence(t.tag[influence.tag].name, multiplier(KARMA.factor))}</li>}
      {events.rumor && (
        <li className="text-night italic">
          {foretold ? t.events.prophecy(t.rumor[events.rumor]) : t.events.rumor(t.rumor[events.rumor], percent(rumorReliability(), 0))}
        </li>
      )}
    </ul>
  )
}
