import { MapPin, Package } from 'lucide-react'
import { motion } from 'motion/react'
import { ENDINGS, WANTED } from '../../data/balance.ts'
import { DISTRICT_IDS, DISTRICTS } from '../../data/districts.ts'
import { PRODUCT_IDS, PRODUCTS } from '../../data/products.ts'
import { VEHICLES } from '../../data/vehicles.ts'
import { planTravel } from '../../engine/actions.ts'
import { averageCost, cargoUsed, ownedQty } from '../../engine/cargo.ts'
import { crewEffect, isMemoryBlurred } from '../../engine/crew.ts'
import { blurredQuote, estimatedUnitSale, fuelPriceBreakdown, lastSeen, productStatus } from '../../engine/market.ts'
import { flyingCheckShare, hiddenCargo } from '../../engine/interception.ts'
import { riskBreakdown } from '../../engine/risk.ts'
import type { DistrictId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import EventDetails from '../events/EventDetails.tsx'
import DistrictMap from './DistrictMap.tsx'
import Exposure from './Exposure.tsx'
import DistrictSigns from './DistrictSigns.tsx'
import { useMapFocus } from './mapFocus.ts'
import { allPlacesHere } from '../places/placesHere.ts'
import Detailed from '../shared/Detailed.tsx'
import { APPEAR } from '../shared/motion.ts'
import Tip from '../shared/Tip.tsx'
import Hint from '../shared/Hint.tsx'
import Panel from '../shared/Panel.tsx'
import Margin from '../shared/Margin.tsx'

type DistrictDetailsProps = {
  districtId: DistrictId
  /** Fiche mise en avant sous la carte ; sinon, ligne de la liste des destinations */
  featured?: boolean
}

type DestinationFactsProps = {
  districtId: DistrictId
}

type TravelButtonProps = {
  to: DistrictId
}

/** Ordre d'affichage : de la périphérie au sommet de la pyramide (carte du chap. 3) */
const order = [...DISTRICT_IDS].sort((a, b) => DISTRICTS[a].echelon - DISTRICTS[b].echelon)

/** District de la fiche sous la carte : survolé, sinon touché, sinon le district actuel */
function useFeatured(): DistrictId {
  const here = useGameStore((s) => s.game.districtId)
  return useMapFocus((s) => s.hovered ?? s.selected ?? here)
}

/** Carte tactique (chap. 7) : la carte des districts, puis la fiche complète du district désigné */
export default function MapPanel() {
  const { t } = useI18n()
  const selected = useMapFocus((s) => s.selected)
  const select = useMapFocus((s) => s.select)
  const hover = useMapFocus((s) => s.hover)
  const featured = useFeatured()
  return (
    <Panel title={t.travel.title} info={t.travel.mapHint} collapseId="travel">
      <DistrictMap selected={selected} onSelect={select} onHover={hover} />
      <DistrictDetails key={featured} districtId={featured} featured />
    </Panel>
  )
}

/** Soute à bord (chap. 7) : réserve de Synthanol, produits et part du double fond, ce qu'une saisie coûterait */
export function CargoRecap() {
  // Le double fond dépend du véhicule et de la soute : état entier
  const game = useGameStore((s) => s.game)
  const { t } = useI18n()
  const { hidden } = hiddenCargo(game)
  const products = [...new Set(game.cargo.map((lot) => lot.productId))]
  const lines = products.map((id) => t.travel.cargoLine(ownedQty(game.cargo, id), t.product[id].name, ownedQty(hidden, id)))
  return (
    <Panel icon={Package} title={t.travel.cargoTitle(cargoUsed(game.cargo), VEHICLES[game.vehicleId].cargo)} collapseId="cargo-recap">
      <p className="text-xs text-ink-soft">{lines.length > 0 ? lines.join(' · ') : t.travel.cargoEmpty}</p>
      <Hint className="mt-1">{t.travel.fuelReminder(game.fuel, VEHICLES[game.vehicleId].tank)}</Hint>
      <Exposure className="mt-1" />
    </Panel>
  )
}

/** Les autres destinations, de la périphérie au sommet : tout ce que dit la fiche, sauf le district déjà sous la carte */
export function DestinationsPanel() {
  const tripDone = useGameStore((s) => (s.game.phase === 'day' ? s.game.dayTripDone : s.game.nightTripDone))
  const here = useGameStore((s) => s.game.districtId)
  // Le district sous la carte quitte la liste ; le simple survol ne la fait pas bouger
  const pinned = useMapFocus((s) => s.selected ?? here)
  const { t } = useI18n()
  return (
    <Panel title={t.travel.destinations} collapseId="destinations" flush>
      {/* Raison commune à toutes les destinations : dite une fois plutôt que sous chaque bouton */}
      {tripDone && <Hint className="px-3 pt-2">{t.error['trip-done']}</Hint>}
      <LastTrip />
      <ul className="mt-2 divide-y divide-line border-t border-line">
        {order
          .filter((id) => id !== pinned)
          .map((id) => (
            <DistrictDetails key={id} districtId={id} />
          ))}
      </ul>
    </Panel>
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

/**
 * Un district, avec tout ce qu'il faut pour choisir où aller : étoiles, indices, événement, Synthanol et lieux,
 * mémoire de marché et produits en soute, puis itinéraire, risque et départ. Mis en avant sous la carte, ou ligne de liste.
 */
function DistrictDetails({ districtId, featured = false }: DistrictDetailsProps) {
  const here = useGameStore((s) => s.game.districtId === districtId)
  const day = useGameStore((s) => s.game.day)
  const cargo = useGameStore((s) => s.game.cargo)
  const memory = useGameStore((s) => lastSeen(s.game, districtId))
  const blurred = useGameStore((s) => isMemoryBlurred(s.game, districtId))
  const events = useGameStore((s) => s.game.events)
  const phase = useGameStore((s) => s.game.phase)
  const { t, credits } = useI18n()

  const memoryLabel = !memory ? t.travel.memoryNever : memory.day === day ? t.travel.memoryToday : t.travel.memoryDaysAgo(day - memory.day)
  const security = DISTRICTS[districtId].security
  // Cours mémorisés des produits en soute : ce qui compte pour décider où vendre
  const owned = [...new Set(cargo.map((lot) => lot.productId))].filter((id) => !PRODUCTS[id].sealed)
  // Position actuelle en bleu, district choisi en ambre : deux surbrillances distinctes
  const frame = featured
    ? `mt-3 rounded-lg border p-3 ${here ? 'border-info/40 bg-info/5' : 'border-accent/40 bg-accent/5'}`
    : `px-3 py-2 ${here ? 'bg-info/5' : ''}`
  const Wrapper = featured ? motion.div : motion.li

  return (
    <Wrapper {...(featured ? APPEAR : {})} className={`text-sm ${frame}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={`font-bold ${featured ? (here ? 'text-info' : 'text-accent') : ''}`}>
            {t.district[districtId].name}
            <span className="ml-2 font-normal text-accent" aria-hidden="true">
              {'★'.repeat(security)}
            </span>
            <span className="sr-only">{t.travel.security(security)}</span>
            {!featured && (
              <span className="ml-2">
                <DistrictSigns districtId={districtId} />
              </span>
            )}
          </p>
          <p className="text-xs text-ink-muted">{t.district[districtId].subtitle}</p>
        </div>
        {here ? (
          <span className="flex shrink-0 items-center gap-1 text-xs text-info">
            <MapPin size={12} aria-hidden="true" />
            {t.travel.here}
          </span>
        ) : (
          !featured && <TravelButton to={districtId} />
        )}
      </div>

      <div className="mt-1 flex flex-col gap-0.5 text-xs text-ink-muted">
        {featured && <DistrictSigns districtId={districtId} labelled />}
        {/* Événement local du jour, visible dès 06h00 (chap. 6) */}
        {events.local[districtId] && <EventDetails event={events.local[districtId]} className="text-event" />}
        <DestinationFacts districtId={districtId} />
        {!here && (
          <span className="flex items-center gap-1">
            {memoryLabel}
            {owned.length > 0 && <Tip label={memoryLabel} content={t.travel.estimateHint} />}
          </span>
        )}
        {/* Produits en soute : statut public du district (chap. 2) et cours mémorisé, pour décider où vendre */}
        {!here && owned.length > 0 && (
          <ul className="mt-0.5 text-ink-soft">
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
      {featured && !here && (
        <div className="mt-2 flex justify-end border-t border-line pt-2">
          <TravelButton to={districtId} />
        </div>
      )}
    </Wrapper>
  )
}

/** Prix du Synthanol à l'arrivée et lieux spéciaux du district (panneau de prévision, chap. 7) */
function DestinationFacts({ districtId }: DestinationFactsProps) {
  // Le prix du Synthanol dépend du moment et du district : état entier, placé à destination
  const game = useGameStore((s) => s.game)
  const { t, credits } = useI18n()
  const places = allPlacesHere(districtId).map((id) => t.location[id].name)
  return (
    <div className="flex flex-wrap items-center gap-x-1.5">
      <Detailed breakdown={fuelPriceBreakdown({ ...game, districtId })} format={(price) => t.travel.fuelPrice(credits(price))} />
      {places.length > 0 && <span>· {t.travel.places(places.join(', '))}</span>}
    </div>
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
    <div className="shrink-0 text-right">
      <Button
        variant="primary"
        disabled={plan.error !== null}
        reason={plan.error ? t.error[plan.error] : null}
        onClick={() => dispatch({ type: 'travel', to })}
      >
        {t.travel.go}
      </Button>
      <div className="mt-0.5 text-xs text-ink-muted">
        {route} · {t.travel.fuel(plan.fuelCost)}
      </div>
      <div className="flex items-center justify-end gap-1.5 text-xs">
        <span className="text-ink-muted">{t.travel.risk}</span>
        <Tip label={t.travel.risk} content={revealed ? t.travel.riskHintRevealed : t.travel.riskHint} />
        <Detailed breakdown={riskBreakdown(game, to, { includePatrol: revealed })} format={(risk) => percent(risk, 0)} />
      </div>
      {flying > 0 && <div className="text-xs text-ink-muted">{t.travel.flyingShare(percent(flying, 0))}</div>}
    </div>
  )
}
