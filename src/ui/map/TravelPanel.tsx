import { Eye, MapPin } from 'lucide-react'
import { HIGH_TIER, SEARCH } from '../../data/balance.ts'
import { DISTRICT_IDS, DISTRICTS } from '../../data/districts.ts'
import { PRODUCT_IDS, PRODUCTS } from '../../data/products.ts'
import { planTravel } from '../../engine/actions.ts'
import { averageCost, isIllegal } from '../../engine/cargo.ts'
import { estimatedUnitSale, lastSeen, productStatus } from '../../engine/market.ts'
import { riskBreakdown } from '../../engine/risk.ts'
import type { DistrictId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import EventDetails from '../events/EventDetails.tsx'
import Detailed from '../shared/Detailed.tsx'
import Margin from '../shared/Margin.tsx'

type DistrictRowProps = {
  districtId: DistrictId
}

type TravelButtonProps = {
  to: DistrictId
}

/** Ordre d'affichage : de la périphérie au sommet de la pyramide (carte du chap. 4) */
const order = [...DISTRICT_IDS].sort((a, b) => DISTRICTS[a].echelon - DISTRICTS[b].echelon)

/** Carte tactique : destinations, coût du trajet et mémoire de marché (chap. 10) */
export default function TravelPanel() {
  const tripDone = useGameStore((s) => (s.game.phase === 'day' ? s.game.dayTripDone : s.game.nightTripDone))
  const { t } = useI18n()
  return (
    <section className="rounded border border-zinc-800 bg-zinc-900/40">
      <h2 className="border-b border-zinc-800 px-3 py-2 font-bold tracking-wide text-amber-300 uppercase">{t.travel.title}</h2>
      {/* Raison commune à toutes les destinations : dite une fois plutôt que sous chaque bouton */}
      {tripDone && <p className="px-3 pt-2 text-xs text-zinc-400">{t.error['trip-done']}</p>}
      <LastTrip />
      <Exposure />
      <ul className="divide-y divide-zinc-800">
        {order.map((id) => (
          <DistrictRow key={id} districtId={id} />
        ))}
      </ul>
    </section>
  )
}

/** Ce qu'un barrage raté coûterait : caisses illégales en soute et sanction de base d'une saisie (chap. 6) */
function Exposure() {
  const cargo = useGameStore((s) => s.game.cargo)
  const { t, credits, percent } = useI18n()
  const illegal = cargo.filter(isIllegal)
  const crates = illegal.reduce((total, lot) => total + lot.qty, 0)
  if (crates === 0) return null
  const cost = illegal.reduce((total, lot) => total + lot.qty * lot.unitCost, 0)
  const high = illegal.some((lot) => PRODUCTS[lot.productId].tier >= HIGH_TIER)
  return (
    <p className="px-3 pt-2 text-xs text-amber-200">
      {t.travel.exposed(crates, credits(cost))} {t.travel.exposedSanction(percent((high ? SEARCH.high : SEARCH.low).fine, 0), high)}
    </p>
  )
}

/** Ce que le dernier trajet a coûté hors barrage : usure ou refroidissement */
function LastTrip() {
  const report = useGameStore((s) => s.game.tripReport)
  const coolant = PRODUCT_IDS.find((id) => PRODUCTS[id].cooling)
  const { t } = useI18n()
  if (!report) return null
  const parts = [
    ...(report.coolingCrates > 0 && coolant ? [t.travel.cooled(report.coolingCrates, t.product[coolant].name)] : []),
    ...(report.chassisWear > 0 ? [t.travel.wear(report.chassisWear)] : []),
    ...(report.heatHealth > 0 ? [t.travel.heatStroke(report.heatHealth)] : []),
  ]
  if (parts.length === 0) return null
  return (
    <p className="px-3 pt-2 text-xs text-zinc-400">
      {t.travel.lastTrip} : {parts.join(' · ')}
    </p>
  )
}

function DistrictRow({ districtId }: DistrictRowProps) {
  const here = useGameStore((s) => s.game.districtId === districtId)
  const day = useGameStore((s) => s.game.day)
  const cargo = useGameStore((s) => s.game.cargo)
  const memory = useGameStore((s) => lastSeen(s.game, districtId))
  const events = useGameStore((s) => s.game.events)
  const phase = useGameStore((s) => s.game.phase)
  const peak = useGameStore((s) => s.game.suspiciousPeaks.includes(districtId))
  const { t, credits } = useI18n()

  const memoryLabel = !memory ? t.travel.memoryNever : memory.day === day ? t.travel.memoryToday : t.travel.memoryDaysAgo(day - memory.day)
  const security = DISTRICTS[districtId].security

  // Cours mémorisés des produits en soute : ce qui compte pour décider où vendre
  const owned = [...new Set(cargo.map((lot) => lot.productId))]

  return (
    <li className={`px-3 py-2 text-sm ${here ? 'bg-amber-500/5' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-bold">
            {t.district[districtId].name}
            <span className="ml-2 font-normal text-amber-400" aria-hidden="true">
              {'★'.repeat(security)}
            </span>
            <span className="sr-only">{t.travel.security(security)}</span>
            {peak && (
              <span className="ml-2 inline-flex text-red-300" title={t.travel.peak}>
                <Eye size={14} aria-hidden="true" />
                <span className="sr-only">{t.travel.peak}</span>
              </span>
            )}
          </div>
          <div className="text-xs text-zinc-400">{t.district[districtId].subtitle}</div>
          {/* Événement local du jour, visible dès 06h00 (chap. 8) */}
          {events.local[districtId] && <EventDetails event={events.local[districtId]} className="text-xs text-amber-200" />}
        </div>
        {here ? (
          <span className="flex items-center gap-1 text-xs text-amber-300">
            <MapPin size={12} aria-hidden="true" />
            {t.travel.here}
          </span>
        ) : (
          <TravelButton to={districtId} />
        )}
      </div>

      {!here && (
        <div className="mt-1 text-xs text-zinc-400">
          {memoryLabel}
          {/* Produits en soute : statut public du district (chap. 7) et cours mémorisé, pour décider où vendre */}
          {owned.length > 0 && (
            <ul className="mt-0.5 text-zinc-300" title={t.travel.estimateHint}>
              {owned.map((id) => {
                const status = productStatus({ day, phase, events }, districtId, id)
                return (
                  <li key={id} className="flex justify-between gap-2">
                    <span className="truncate">
                      {t.product[id].name}
                      {status !== 'neutral' && (
                        <span className={`ml-1.5 ${status === 'strong' ? 'text-orange-300' : 'text-green-300'}`}>{t.market.status[status]}</span>
                      )}
                    </span>
                    {memory ? (
                      <span className="flex items-center gap-1.5">
                        <Margin revenue={estimatedUnitSale(memory.quotes[id])} cost={averageCost(cargo, id) ?? 0} showAmount={false} />
                        {credits(memory.quotes[id])}
                      </span>
                    ) : (
                      <span className="text-zinc-500">{t.travel.neverSeen}</span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </li>
  )
}

function TravelButton({ to }: TravelButtonProps) {
  // planTravel lit plusieurs champs de la partie (phase, carburant, trajets faits…) : on passe l'état entier
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, percent } = useI18n()
  const plan = planTravel(game, to)
  const route = plan.crossed.length === 0 ? t.travel.direct : t.travel.via(plan.crossed.map((id) => t.district[id].name).join(', '))

  return (
    <div className="text-right">
      <Button variant="primary" disabled={plan.error !== null} onClick={() => dispatch({ type: 'travel', to })}>
        {t.travel.go[game.phase]}
      </Button>
      <div className="mt-0.5 text-xs text-zinc-400">
        {route} · {t.travel.fuel(plan.fuelCost)}
      </div>
      <div className="flex justify-end gap-1.5 text-xs" title={t.travel.riskHint}>
        <span className="text-zinc-400">{t.travel.risk}</span>
        <Detailed breakdown={riskBreakdown(game, to, { includePatrol: false })} format={(risk) => percent(risk, 0)} align="right" />
      </div>
      {plan.error && plan.error !== 'trip-done' && <div className="text-xs text-red-300">{t.error[plan.error]}</div>}
    </div>
  )
}
