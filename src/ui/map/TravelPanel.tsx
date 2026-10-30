import { Eye, MapPin, PartyPopper, Siren } from 'lucide-react'
import { ENDINGS, WANTED } from '../../data/balance.ts'
import { DISTRICT_IDS, DISTRICTS } from '../../data/districts.ts'
import { PRODUCT_IDS, PRODUCTS } from '../../data/products.ts'
import { VEHICLES } from '../../data/vehicles.ts'
import { planTravel } from '../../engine/actions.ts'
import { averageCost, cargoUsed, ownedQty } from '../../engine/cargo.ts'
import { crewEffect, isMemoryBlurred } from '../../engine/crew.ts'
import { blurredQuote, estimatedUnitSale, lastSeen, productStatus } from '../../engine/market.ts'
import { exposure, fineAmount, flyingCheckShare, hiddenCargo } from '../../engine/interception.ts'
import { checkDelivery, deliveryCrates, deliveryFee, deliveryOffer } from '../../engine/delivery.ts'
import { trustFactor } from '../../engine/progress.ts'
import { riskBreakdown } from '../../engine/risk.ts'
import type { DistrictId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import EventDetails from '../events/EventDetails.tsx'
import Chip from '../shared/Chip.tsx'
import Detailed from '../shared/Detailed.tsx'
import Hint from '../shared/Hint.tsx'
import Panel from '../shared/Panel.tsx'
import Margin from '../shared/Margin.tsx'

type DistrictRowProps = {
  districtId: DistrictId
}

type TravelButtonProps = {
  to: DistrictId
}

/** Ordre d'affichage : de la périphérie au sommet de la pyramide (carte du chap. 3) */
const order = [...DISTRICT_IDS].sort((a, b) => DISTRICTS[a].echelon - DISTRICTS[b].echelon)

/** Carte tactique : destinations, coût du trajet et mémoire de marché (chap. 7) */
export default function TravelPanel() {
  const tripDone = useGameStore((s) => (s.game.phase === 'day' ? s.game.dayTripDone : s.game.nightTripDone))
  const { t } = useI18n()
  return (
    <Panel title={t.travel.title} collapseId="travel" flush>
      {/* Raison commune à toutes les destinations : dite une fois plutôt que sous chaque bouton */}
      {tripDone && <Hint className="px-3 pt-2">{t.error['trip-done']}</Hint>}
      <LastTrip />
      <CargoSummary />
      <DayDelivery />
      <Exposure />
      <ul className="mt-2 divide-y divide-line border-t border-line">
        {order.map((id) => (
          <DistrictRow key={id} districtId={id} />
        ))}
      </ul>
    </Panel>
  )
}

/** Récapitulatif de la soute pour choisir la destination : produits, quantités, part du double fond (chap. 7) */
function CargoSummary() {
  // Le double fond dépend du véhicule et de la soute : état entier
  const game = useGameStore((s) => s.game)
  const { t } = useI18n()
  const { hidden } = hiddenCargo(game)
  const products = [...new Set(game.cargo.map((lot) => lot.productId))]
  const lines = products.map((id) => t.travel.cargoLine(ownedQty(game.cargo, id), t.product[id].name, ownedQty(hidden, id)))
  return (
    <Hint tone="neutral" className="px-3 pt-2">
      <span className="font-bold text-accent">{t.travel.cargoTitle(cargoUsed(game.cargo), VEHICLES[game.vehicleId].cargo)}</span>{' '}
      {lines.length > 0 ? lines.join(' · ') : t.travel.cargoEmpty}
    </Hint>
  )
}

/** Livraison officielle du jour (chap. 1) : offre de la plateforme, ou livraison en cours */
function DayDelivery() {
  // L'offre, la place et la prime se calculent sur l'état entier de la partie
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits, multiplier } = useI18n()
  const trust = t.travel.trust(game.progress.deliveries, multiplier(trustFactor(game)))
  if (game.phase !== 'day') return null
  if (game.delivery)
    return (
      <Hint tone="info" className="px-3 pt-2">
        {t.travel.deliveryActive(t.district[game.delivery.to].name)} {trust}
      </Hint>
    )
  const to = deliveryOffer(game)
  if (!to || game.dayTripDone) return null
  const error = checkDelivery(game)
  return (
    <div className="px-3 pt-2 text-xs">
      <p className="font-bold text-info">{t.travel.deliveryTitle}</p>
      <p className="text-ink-soft">{t.travel.deliveryOffer(t.district[to].name, deliveryCrates(game), credits(deliveryFee(game)))}</p>
      <p className="text-ink-muted">{trust}</p>
      <Button className="mt-1" size="sm" disabled={error !== null} onClick={() => dispatch({ type: 'acceptDelivery' })}>
        {t.travel.acceptDelivery}
      </Button>
      {error && <p className="mt-1 text-ink-muted">{t.error[error]}</p>}
    </div>
  )
}

/** Ce qu'un barrage raté coûterait : caisses illégales en soute et sanction de base d'une saisie (chap. 5) */
function Exposure() {
  // La sanction et le double fond se calculent sur l'état entier de la partie (véhicule, district)
  const game = useGameStore((s) => s.game)
  const { t, credits, percent } = useI18n()
  const { crates, hidden, cost, sanction } = exposure(game)
  if (crates === 0 || !sanction) return null
  return (
    <Hint tone="accent" className="px-3 pt-2">
      {t.travel.exposed(crates, credits(cost), hidden)}{' '}
      {t.travel.exposedSanction(
        t.interception.fine(percent(sanction.fineRate, 0), credits(fineAmount(game, sanction.fineRate))),
        sanction.custodyDays,
      )}
    </Hint>
  )
}

/** Ce que le dernier trajet a coûté hors barrage : usure ou refroidissement */
function LastTrip() {
  const report = useGameStore((s) => s.game.tripReport)
  const coolant = PRODUCT_IDS.find((id) => PRODUCTS[id].cooling)
  const { t, credits } = useI18n()
  if (!report) return null
  const parts = [
    ...(report.coolingCrates > 0 && coolant ? [t.travel.cooled(report.coolingCrates, t.product[coolant].name)] : []),
    ...(report.chassisWear > 0 ? [t.travel.wear(report.chassisWear)] : []),
    ...(report.heatHealth > 0 ? [t.travel.heatStroke(report.heatHealth)] : []),
    ...(report.mission === 'delivered' ? [t.travel.delivered(credits(report.missionFee))] : []),
    ...(report.mission === 'deviated' ? [t.travel.deviated(t.hud.wantedGain(WANTED.perOffense))] : []),
    ...(report.injection > 0 ? [t.travel.injected(report.injection, ENDINGS.resident.injections)] : []),
  ]
  if (parts.length === 0) return null
  return (
    <Hint className="px-3 pt-2">
      {t.travel.lastTrip} : {parts.join(' · ')}
    </Hint>
  )
}

function DistrictRow({ districtId }: DistrictRowProps) {
  const here = useGameStore((s) => s.game.districtId === districtId)
  const day = useGameStore((s) => s.game.day)
  const cargo = useGameStore((s) => s.game.cargo)
  const memory = useGameStore((s) => lastSeen(s.game, districtId))
  const blurred = useGameStore((s) => isMemoryBlurred(s.game, districtId))
  // Destination de la mission de nuit acceptée
  const missionHere = useGameStore((s) => s.game.phase === 'night' && s.game.mission?.to === districtId)
  // Vance révèle chaque matin le district de la ronde renforcée
  const patrolled = useGameStore((s) => Boolean(crewEffect(s.game, 'revealsPatrol')) && s.game.patrolDistrict === districtId)
  const events = useGameStore((s) => s.game.events)
  const phase = useGameStore((s) => s.game.phase)
  const peak = useGameStore((s) => s.game.suspiciousPeaks.includes(districtId))
  // After du couvre-feu de ce soir, annoncée dès 06h00
  const after = useGameStore((s) => s.game.after === districtId)
  const { t, credits } = useI18n()

  const memoryLabel = !memory ? t.travel.memoryNever : memory.day === day ? t.travel.memoryToday : t.travel.memoryDaysAgo(day - memory.day)
  const security = DISTRICTS[districtId].security

  // Cours mémorisés des produits en soute : ce qui compte pour décider où vendre
  const owned = [...new Set(cargo.map((lot) => lot.productId))]

  return (
    <li className={`px-3 py-2 text-sm ${here ? 'bg-accent/5' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-bold">
            {t.district[districtId].name}
            <span className="ml-2 font-normal text-accent" aria-hidden="true">
              {'★'.repeat(security)}
            </span>
            <span className="sr-only">{t.travel.security(security)}</span>
            {missionHere && (
              <span className="ml-2 font-normal">
                <Chip tone="info">{t.travel.mission}</Chip>
              </span>
            )}
            {patrolled && (
              <span className="ml-2 inline-flex text-info" title={t.travel.patrol}>
                <Siren size={14} aria-hidden="true" />
                <span className="sr-only">{t.travel.patrol}</span>
              </span>
            )}
            {after && (
              <span className="ml-2 inline-flex text-event" title={t.travel.after}>
                <PartyPopper size={14} aria-hidden="true" />
                <span className="sr-only">{t.travel.after}</span>
              </span>
            )}
            {peak && (
              <span className="ml-2 inline-flex text-danger" title={t.travel.peak}>
                <Eye size={14} aria-hidden="true" />
                <span className="sr-only">{t.travel.peak}</span>
              </span>
            )}
          </div>
          <div className="text-xs text-ink-muted">{t.district[districtId].subtitle}</div>
          {/* Événement local du jour, visible dès 06h00 (chap. 6) */}
          {events.local[districtId] && <EventDetails event={events.local[districtId]} className="text-xs text-accent" />}
        </div>
        {here ? (
          <span className="flex items-center gap-1 text-xs text-accent">
            <MapPin size={12} aria-hidden="true" />
            {t.travel.here}
          </span>
        ) : (
          <TravelButton to={districtId} />
        )}
      </div>

      {!here && (
        <div className="mt-1 text-xs text-ink-muted">
          {memoryLabel}
          {/* Produits en soute : statut public du district (chap. 2) et cours mémorisé, pour décider où vendre */}
          {owned.length > 0 && (
            <ul className="mt-0.5 text-ink-soft" title={t.travel.estimateHint}>
              {owned.map((id) => {
                const status = productStatus({ day, phase, events }, districtId, id)
                return (
                  <li key={id} className="flex justify-between gap-2">
                    <span className="truncate">
                      {t.product[id].name}
                      {status !== 'neutral' && (
                        <span className={`ml-1.5 ${status === 'strong' ? 'text-warning' : 'text-success'}`}>{t.market.status[status]}</span>
                      )}
                    </span>
                    {memory && blurred ? (
                      <span>{t.travel.blurred(credits(blurredQuote(memory.quotes[id]).low), credits(blurredQuote(memory.quotes[id]).high))}</span>
                    ) : memory ? (
                      <span className="flex items-center gap-1.5">
                        <Margin revenue={estimatedUnitSale(memory.quotes[id])} cost={averageCost(cargo, id) ?? 0} showAmount={false} />
                        {credits(memory.quotes[id])}
                      </span>
                    ) : (
                      <span className="text-ink-faint">{t.travel.neverSeen}</span>
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
  // Ronde renforcée cachée : la part affichée est celle du district
  const revealed = Boolean(crewEffect(game, 'revealsPatrol'))
  const flying = flyingCheckShare(game, to, revealed)
  const route = plan.crossed.length === 0 ? t.travel.direct : t.travel.via(plan.crossed.map((id) => t.district[id].name).join(', '))

  return (
    <div className="text-right">
      <Button variant="primary" disabled={plan.error !== null} onClick={() => dispatch({ type: 'travel', to })}>
        {t.travel.go[game.phase]}
      </Button>
      <div className="mt-0.5 text-xs text-ink-muted">
        {route} · {t.travel.fuel(plan.fuelCost)}
      </div>
      <div className="flex justify-end gap-1.5 text-xs" title={revealed ? t.travel.riskHintRevealed : t.travel.riskHint}>
        <span className="text-ink-muted">{t.travel.risk}</span>
        <Detailed breakdown={riskBreakdown(game, to, { includePatrol: revealed })} format={(risk) => percent(risk, 0)} align="right" />
      </div>
      {flying > 0 && <div className="text-xs text-ink-muted">{t.travel.flyingShare(percent(flying, 0))}</div>}
      {plan.error && plan.error !== 'trip-done' && <div className="text-xs text-danger">{t.error[plan.error]}</div>}
    </div>
  )
}
