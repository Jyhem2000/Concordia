import { DISTRICT_IDS } from '../../data/districts.ts'
import { AFTERSHOCK } from '../../data/events.ts'
import { KARMA } from '../../data/locations.ts'
import { aftershockEvents, globalsInForce, rumorReliability } from '../../engine/events.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import type { ReactNode } from 'react'
import EventDetails from '../events/EventDetails.tsx'
import Hint from '../shared/Hint.tsx'
import Tip from '../shared/Tip.tsx'

type NewsGroupProps = {
  title: string
  /** Explication de la rubrique, en infobulle */
  info?: string
  children: ReactNode
}

/** Actualités du jour : événement global, locaux, contrecoups, Loterie, influence et rumeur du lendemain (chap. 6 et 7) */
export default function EventsList() {
  const events = useGameStore((s) => s.game.events)
  const day = useGameStore((s) => s.game.day)
  const phase = useGameStore((s) => s.game.phase)
  const { t, percent, change } = useI18n()
  const ctx = { day, phase, events }
  const globals = globalsInForce(ctx)

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
  // Équipier « promu » ce matin (disparu) : c'est son nom que la Loterie affiche (chap. 6)
  const crewLost = useGameStore((s) => (s.game.briefing?.day === s.game.day ? s.game.briefing.crewLost : null))

  if (globals.length === 0 && locals.length === 0 && aftershocks.length === 0 && !drawToday && !demotion && !events.rumor && !influence)
    return <Hint>{t.fil.noNews}</Hint>

  return (
    <dl className="flex flex-col gap-3 text-xs text-ink-soft">
      {globals.length > 0 && (
        <NewsGroup title={t.fil.newsGlobal}>
          <ul className="flex flex-col gap-0.5">
            {globals.map((event) => (
              <li key={event} className="font-bold text-ink">
                <EventDetails event={event} />
                {/* Événement qui dure (canicule) : son dernier jour */}
                {events.lasting?.event === event && events.lasting.until > day && (
                  <span className="ml-1.5 font-normal text-ink-muted">{t.fil.lastsUntil(events.lasting.until)}</span>
                )}
              </li>
            ))}
          </ul>
        </NewsGroup>
      )}
      {locals.length > 0 && (
        <NewsGroup title={t.fil.newsLocal}>
          <ul className="flex flex-col gap-1">
            {locals.map(({ district, event }) => (
              <li key={district} className="flex flex-wrap items-baseline gap-x-1.5">
                <span className="font-bold text-ink">{t.format.label(t.district[district].name)}</span>
                <EventDetails event={event} />
              </li>
            ))}
          </ul>
        </NewsGroup>
      )}
      {aftershocks.length > 0 && (
        <NewsGroup title={t.fil.newsAftershock} info={t.fil.newsAftershockInfo}>
          <ul className="flex flex-col gap-0.5 text-ink-muted">
            {aftershocks.map((event) => (
              <li key={event}>{t.events.aftershock(t.event[event].name, change(AFTERSHOCK.afterRush), change(AFTERSHOCK.afterSale))}</li>
            ))}
          </ul>
        </NewsGroup>
      )}
      {lottery && (drawToday || demotion) && (
        <NewsGroup title={t.fil.newsLottery}>
          {drawToday && (
            <p>{t.events.promoted(crewLost ? t.crew[crewLost].name : name(lottery.names.promoted), t.district[lottery.promoted].name)}</p>
          )}
          {demotion && (
            <p>
              {t.events.demoted(name(lottery.names.demoted), t.district[demotion.from].name, t.district[demotion.to].name)}
              {lottery.vice && <> {t.events.vice(t.product[lottery.vice].name, t.district[demotion.to].name, lottery.viceUntil)}</>}
            </p>
          )}
        </NewsGroup>
      )}
      {influence && (
        <NewsGroup title={t.fil.newsInfluence}>
          <p className="text-accent">{t.events.influence(t.tag[influence.tag].name, change(KARMA.factor))}</p>
        </NewsGroup>
      )}
      {events.rumor && (
        <NewsGroup title={t.fil.newsTomorrow}>
          <p className="text-night italic">
            {foretold ? t.events.prophecy(t.rumor[events.rumor]) : t.events.rumor(t.rumor[events.rumor], percent(rumorReliability(), 0))}
          </p>
        </NewsGroup>
      )}
    </dl>
  )
}

/** Une rubrique des actualités : son intitulé, puis son contenu */
function NewsGroup({ title, info, children }: NewsGroupProps) {
  return (
    <div>
      <dt className="flex items-center gap-1 font-bold text-ink-muted uppercase">
        {title}
        {info && <Tip label={title} content={info} />}
      </dt>
      <dd className="mt-1">{children}</dd>
    </div>
  )
}
