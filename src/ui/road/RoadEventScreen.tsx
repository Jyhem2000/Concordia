import { Signpost } from 'lucide-react'
import { useState } from 'react'
import { ICC_MAX } from '../../data/balance.ts'
import { ROAD_EVENTS } from '../../data/events.ts'
import { checkRoadChoice, roadCrates, type RoadChoiceId } from '../../engine/road.ts'
import type { RoadCost, RoadEventId, RoadOutcome } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import { FOCUS_RING } from '../shared/focus.ts'

type RoadOptionProps = {
  eventId: RoadEventId
  choice: RoadChoiceId
}

/** Aléa routier (chap. 8 et 10) : la situation, puis deux options avec leurs coûts et effets exacts */
export default function RoadEventScreen() {
  const eventId = useGameStore((s) => s.game.roadEvent)
  const { t } = useI18n()
  if (!eventId) return null

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4">
      <section className="rounded border border-amber-700 bg-amber-950/20 p-4">
        <h1 className="flex items-center gap-2 text-xl font-bold text-amber-300 uppercase">
          <Signpost size={20} aria-hidden="true" />
          {t.road.title} — {t.event[eventId].name}
        </h1>
        <p className="mt-2">{t.road.events[eventId].situation}</p>
      </section>
      <ul className="flex flex-col gap-3">
        <RoadOption eventId={eventId} choice="a" />
        <RoadOption eventId={eventId} choice="b" />
      </ul>
    </main>
  )
}

function RoadOption({ eventId, choice }: RoadOptionProps) {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, percent } = useI18n()
  const describe = useRoadDescriptions()
  // Paiement choisi quand l'option en propose plusieurs : état d'interface éphémère
  const [pay, setPay] = useState(0)
  const option = ROAD_EVENTS[eventId][choice]
  const pays = option.pay ?? []
  const error = checkRoadChoice(game, choice, pay)
  const effects = option.gamble
    ? t.road.gamble(percent(option.gamble.chance, 0), describe.outcome(option.gamble.win), describe.outcome(option.gamble.lose))
    : describe.outcome(option.outcome ?? {})

  return (
    <li className="rounded border border-zinc-800 bg-zinc-900/40 p-3 text-sm">
      <Button variant="primary" disabled={error !== null} onClick={() => dispatch({ type: 'road', choice, pay })}>
        {t.road.events[eventId][choice]}
      </Button>
      {pays.length === 1 && <p className="mt-1 text-xs text-zinc-300">{describe.cost(pays[0])}</p>}
      {pays.length > 1 && (
        <fieldset className="mt-1 text-xs">
          <legend className="text-zinc-400">{t.road.payWith}</legend>
          {pays.map((cost, index) => (
            <label key={describe.cost(cost)} className="mr-3 inline-flex items-center gap-1.5">
              <input type="radio" name={`${eventId}-${choice}`} checked={pay === index} onChange={() => setPay(index)} className={FOCUS_RING} />
              {describe.cost(cost)}
            </label>
          ))}
        </fieldset>
      )}
      <p className="mt-1 text-xs text-zinc-400">{effects}</p>
      {error && <p className="mt-1 text-xs text-red-300">{t.error[error]}</p>}
    </li>
  )
}

/** Libellés des coûts et des effets d'une option, montants indexés compris */
function useRoadDescriptions() {
  const game = useGameStore((s) => s.game)
  const { t, credits, signedCredits, signedPercent, number } = useI18n()
  const signed = (value: number) => (value > 0 ? `+${number(value)}` : number(value))

  const cost = (paid: RoadCost): string => {
    const crates = roadCrates(game, paid)
    const wanted = paid.crates
    const parts = [
      ...(paid.cash ? [credits(paid.cash ?? 0)] : []),
      ...(paid.fuel ? [t.road.cost.fuel(paid.fuel)] : []),
      ...(wanted && crates && crates.length > 0 ? crates.map((crate) => t.road.cost.crates(crate.qty, t.product[crate.productId].name)) : []),
      ...(wanted && !crates
        ? [
            wanted.productId
              ? t.road.cost.crates(wanted.qty, t.product[wanted.productId].name)
              : t.road.cost.cratesMissing(wanted.qty, wanted.tag ? t.tag[wanted.tag].name : t.road.cost.tier((wanted.tiers ?? []).join(', '))),
          ]
        : []),
      ...(paid.freeSlot ? [t.road.cost.freeSlot] : []),
    ]
    return parts.join(' + ')
  }

  const outcome = (result: RoadOutcome): string => {
    const parts = [
      ...(result.cash ? [t.road.outcome.cash(signedCredits(result.cash ?? 0))] : []),
      ...(result.icc ? [t.road.outcome.icc(signedPercent(result.icc / ICC_MAX, 0))] : []),
      ...(result.health ? [t.road.outcome.health(signed(result.health))] : []),
      ...(result.chassis ? [t.road.outcome.chassis(signed(result.chassis))] : []),
      ...(result.fuel ? [t.road.outcome.fuel(signed(result.fuel))] : []),
      ...(result.crateTier !== undefined ? [t.road.outcome.crate(result.crateTier)] : []),
    ]
    return parts.length > 0 ? parts.join(', ') : t.road.outcome.nothing
  }

  return { cost, outcome }
}
