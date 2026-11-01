import { MapPin } from 'lucide-react'
import { motion } from 'motion/react'
import { ENDINGS, WANTED } from '../../data/balance.ts'
import { DISTRICT_IDS, DISTRICTS } from '../../data/districts.ts'
import { PRODUCT_IDS, PRODUCTS } from '../../data/products.ts'
import { beginNight, planTravel, sleeplessDrink } from '../../engine/actions.ts'
import { averageCost, ownedQty } from '../../engine/cargo.ts'
import { crewEffect } from '../../engine/crew.ts'
import { estimatedUnitSale, fuelPriceBreakdown, lastSeen, productStatus } from '../../engine/market.ts'
import { flyingCheckShare } from '../../engine/interception.ts'
import { riskBreakdown } from '../../engine/risk.ts'
import { missionFee, missionOffer } from '../../engine/night.ts'
import type { DistrictId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import ConfirmButton from '../shared/ConfirmButton.tsx'
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
import TrendBadge from '../shared/TrendBadge.tsx'

type DistrictDetailsProps = {
  districtId: DistrictId
  /** Fiche mise en avant (district désigné) ; sinon, ligne de la liste des destinations */
  featured?: boolean
}

type DistrictIdProps = {
  districtId: DistrictId
}

/** Ordre d'affichage : de la périphérie au sommet de la pyramide (carte du chap. 3) */
const order = [...DISTRICT_IDS].sort((a, b) => DISTRICTS[a].echelon - DISTRICTS[b].echelon)

/** Carte tactique (chap. 7) : la carte des districts, le mode d'emploi derrière le « i » du titre */
export default function MapPanel() {
  const { t } = useI18n()
  const selected = useMapFocus((s) => s.selected)
  const select = useMapFocus((s) => s.select)
  const hover = useMapFocus((s) => s.hover)
  return (
    <Panel title={t.travel.title} info={t.travel.mapHint} collapseId="travel">
      <DistrictMap selected={selected} onSelect={select} onHover={hover} />
    </Panel>
  )
}

/** Fiche du district désigné (chap. 7) : survolé, sinon touché, sinon le district actuel */
export function FeaturedDistrict() {
  const here = useGameStore((s) => s.game.districtId)
  const featured = useMapFocus((s) => s.hovered ?? s.selected ?? here)
  return <DistrictDetails key={featured} districtId={featured} featured />
}

/** Les autres destinations, sous la carte, de la périphérie au sommet ; le district de la fiche n'y figure pas */
export function DestinationsPanel() {
  // Le trajet du jour fait, c'est le soir : on peut encore partir de nuit ; seule la nuit, une fois sa tournée faite, ferme la carte
  const tripDone = useGameStore((s) => s.game.phase === 'night' && s.game.nightTripDone)
  const here = useGameStore((s) => s.game.districtId)
  // Le district de la fiche (touché, sinon actuel) quitte la liste ; le simple survol ne la fait pas bouger
  const pinned = useMapFocus((s) => s.selected ?? here)
  const { t } = useI18n()
  return (
    <Panel title={t.travel.destinations} collapseId="destinations" flush>
      {/* Raison commune à toutes les destinations : dite une fois plutôt que sous chaque bouton */}
      {tripDone && <Hint className="px-3 pt-2">{t.error['trip-done']}</Hint>}
      <LastTrip />
      <Exposure className="px-3 pt-2" />
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

/** Ce que le dernier trajet a coûté hors barrage : usure ou refroidissement, mission, écart, injection */
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
    ...(report.mission === 'unfilmed' ? [t.travel.unfilmed] : []),
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
 * Un district, avec tout ce qu'il faut pour choisir où aller : en-tête (nom, étoiles, indices), description sur toute la
 * largeur, faits (événement, Synthanol, lieux, mémoire), produits en soute (statut, tendance, cours vu), puis une barre
 * de départ pleine largeur : itinéraire, rations et risque à gauche, « Aller » à droite.
 */
function DistrictDetails({ districtId, featured = false }: DistrictDetailsProps) {
  const here = useGameStore((s) => s.game.districtId === districtId)
  const day = useGameStore((s) => s.game.day)
  const cargo = useGameStore((s) => s.game.cargo)
  const memory = useGameStore((s) => lastSeen(s.game, districtId))
  const events = useGameStore((s) => s.game.events)
  const phase = useGameStore((s) => s.game.phase)
  const { t, credits } = useI18n()

  const memoryLabel = !memory ? t.travel.memoryNever : memory.day === day ? t.travel.memoryToday : t.travel.memoryDaysAgo(day - memory.day)
  const security = DISTRICTS[districtId].security
  // Cours mémorisés des produits en soute : ce qui compte pour décider où vendre
  const owned = [...new Set(cargo.map((lot) => lot.productId))].filter((id) => !PRODUCTS[id].sealed)
  // Position actuelle en bleu, district choisi en ambre : deux surbrillances distinctes
  const frame = featured
    ? `rounded-lg border p-3 ${here ? 'border-info/40 bg-info/5' : 'border-accent/40 bg-accent/5'}`
    : `px-3 py-2 ${here ? 'bg-info/5' : ''}`
  const Wrapper = featured ? motion.section : motion.li

  return (
    <Wrapper {...(featured ? APPEAR : {})} className={`text-sm ${frame}`}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <p className={`font-bold ${featured ? (here ? 'text-info' : 'text-accent') : ''}`}>{t.district[districtId].name}</p>
        <span className="text-accent" aria-hidden="true">
          {'★'.repeat(security)}
        </span>
        <span className="sr-only">{t.travel.security(security)}</span>
        {!featured && <DistrictSigns districtId={districtId} />}
        {here && (
          <span className="ml-auto flex items-center gap-1 text-xs text-info">
            <MapPin size={12} aria-hidden="true" />
            {t.travel.here}
          </span>
        )}
      </div>
      <p className="text-xs text-ink-muted">{t.district[districtId].subtitle}</p>

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
      </div>

      {/* Produits en soute : statut public du district (chap. 2), tendance publique et cours vu, pour décider où vendre */}
      {!here && owned.length > 0 && (
        <ul className="mt-1 grid gap-x-4 gap-y-0.5 text-xs text-ink-soft sm:grid-cols-2">
          {owned.map((id) => {
            const status = productStatus({ day, phase, events }, districtId, id)
            return (
              <li key={id} className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate">
                  {t.product[id].name}
                  {status === 'strong' && <span className="ml-1.5 text-warning">{t.market.status.strong}</span>}
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <TrendBadge districtId={districtId} productId={id} />
                  {memory ? (
                    <>
                      <Margin revenue={estimatedUnitSale(memory.quotes[id])} cost={averageCost(cargo, id) ?? 0} showAmount={false} />
                      {credits(memory.quotes[id])}
                    </>
                  ) : (
                    <span className="text-ink-faint">{t.travel.neverSeen}</span>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {!here && <TravelBar districtId={districtId} />}
    </Wrapper>
  )
}

/** Prix du Synthanol à l'arrivée et lieux spéciaux du district (panneau de prévision, chap. 7) */
function DestinationFacts({ districtId }: DistrictIdProps) {
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

/** Barre de départ, sur toute la largeur : itinéraire, rations, risque détaillable et part de contrôles volants, puis « Aller » */
function TravelBar({ districtId }: DistrictIdProps) {
  // planTravel lit plusieurs champs de la partie (phase, carburant, trajets faits…) : on passe l'état entier
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, percent, credits } = useI18n()
  // Le soir venu, le départ est une tournée de nuit : aperçu sur l'état une fois la nuit tombée (mission comprise)
  const evening = game.phase === 'day' && game.dayTripDone
  const drink = evening ? sleeplessDrink(game) : undefined
  const night = evening ? beginNight(game, districtId, drink) : null
  const from = night?.ok ? night.state : game
  const plan = planTravel(from, districtId)
  const error = night && !night.ok ? night.error : plan.error
  const mission = evening && missionOffer(game) === districtId
  // Ronde renforcée cachée : la part affichée est celle du district
  const revealed = Boolean(crewEffect(game, 'revealsPatrol'))
  const flying = flyingCheckShare(from, districtId, revealed)
  const route = plan.crossed.length === 0 ? t.travel.direct : t.travel.via(plan.crossed.map((id) => t.district[id].name).join(', '))
  // Produit qui mène à l'exécution sommaire si la soute est fouillée : la tournée de nuit demande confirmation
  const lethal = PRODUCT_IDS.find((id) => PRODUCTS[id].lethalOnSearch && ownedQty(game.cargo, id) > 0)
  const sleepless = drink ? PRODUCTS[drink].sleeplessNight : undefined
  const label = !evening
    ? t.travel.go
    : mission
      ? t.travel.goMission(credits(missionFee(game)))
      : drink && sleepless
        ? t.travel.goNightDrink(t.product[drink].name, sleepless.healthLoss)
        : t.travel.goNight

  return (
    <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-t border-line pt-2 text-xs">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-ink-muted">
        <span>{route}</span>
        <span>· {t.travel.fuel(plan.fuelCost)}</span>
        <span className="flex items-center gap-1">
          · {t.travel.risk}
          <Tip label={t.travel.risk} content={revealed ? t.travel.riskHintRevealed : t.travel.riskHint} />
          <Detailed
            breakdown={riskBreakdown(from, districtId, { includePatrol: revealed })}
            format={(risk) => percent(risk, 0)}
            percent
            className="font-bold text-ink"
          />
        </span>
        {flying > 0 && <span>· {t.travel.flyingShare(percent(flying, 0))}</span>}
      </div>
      <ConfirmButton
        variant={evening && !mission ? 'danger' : 'primary'}
        disabled={error !== null}
        reason={error ? t.error[error] : null}
        onClick={() => dispatch(evening ? { type: 'nightTrip', to: districtId, drink } : { type: 'travel', to: districtId })}
        confirm={
          evening && lethal
            ? { title: t.evening.lethalConfirm, message: t.evening.lethalWarning(t.product[lethal].name), action: t.evening.lethalAction }
            : undefined
        }
      >
        {label}
      </ConfirmButton>
    </div>
  )
}
