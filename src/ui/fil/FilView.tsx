import { AlertTriangle, ArrowRight, Megaphone, TrendingUp } from 'lucide-react'
import { AFTER } from '../../data/balance.ts'
import { DISTRICT_IDS } from '../../data/districts.ts'
import { PRODUCTS } from '../../data/products.ts'
import { TAGS } from '../../data/tags.ts'
import { averageCost, canHide, ownedQty } from '../../engine/cargo.ts'
import { compartmentRoom } from '../../engine/compartment.ts'
import { daysBeforeRot } from '../../engine/condition.ts'
import { planTravel } from '../../engine/actions.ts'
import { crewEffect, isMemoryBlurred, workingCrew } from '../../engine/crew.ts'
import { deliveryCrates, deliveryFee, deliveryOffer } from '../../engine/delivery.ts'
import { bestRemembered, blurredQuote, estimatedUnitSale, productStatus, shopProducts } from '../../engine/market.ts'
import { missionFee, missionOffer, sealedCount } from '../../engine/night.ts'
import type { ProductId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import type { Tab } from '../TabBar.tsx'
import BriefingPanel from '../briefing/BriefingPanel.tsx'
import Exposure from '../map/Exposure.tsx'
import ObjectivesPanel from '../objectives/ObjectivesPanel.tsx'
import Button from '../shared/Button.tsx'
import Hint from '../shared/Hint.tsx'
import Margin from '../shared/Margin.tsx'
import Panel from '../shared/Panel.tsx'
import { TONE_TEXT, type Tone } from '../shared/styles.ts'
import EventsList from './EventsList.tsx'
import FlashInfo from './FlashInfo.tsx'
import CalendarPanel from './CalendarPanel.tsx'
import JournalPanel from './JournalPanel.tsx'
import RecordsPanel from './RecordsPanel.tsx'

type Line = {
  key: string
  text: string
  tone: Tone
  /** Onglet où agir sur cette information */
  go?: Tab
}

type FilViewProps = {
  /** Ouvre un onglet (téléphone) ou amène à son bloc (desktop) */
  onGo: (tab: Tab) => void
}

type GoProps = FilViewProps

/** Ligne colorée d'un panneau du Fil */
const line = (key: string, text: string, tone: Tone, go?: Tab): Line => ({ key, text, tone, go })

type DealRowProps = {
  productId: ProductId
}

/** Onglet En bref (chap. 7) : ce qui compte aujourd'hui, avant d'aller au marché puis sur la carte */
export default function FilView({ onGo }: FilViewProps) {
  return (
    <>
      <BriefingPanel />
      <TodayPanel onGo={onGo} />
      <AlertsPanel onGo={onGo} />
      <CalendarPanel />
      <DealsPanel />
      <ObjectivesPanel />
      <JournalPanel />
      <RecordsPanel />
    </>
  )
}

/**
 * Aujourd'hui : le Message Aeterna, ce qui concerne le joueur (commandes du jour et du soir, contrat, after, ronde renforcée,
 * pics suspects), chacun avec son raccourci vers l'onglet où agir, puis les actualités de la ville
 */
function TodayPanel({ onGo }: GoProps) {
  // Offres et primes se calculent sur l'état entier de la partie
  const game = useGameStore((s) => s.game)
  const { t, credits, multiplier, percent } = useI18n()
  const delivery = game.phase === 'day' && !game.dayTripDone ? deliveryOffer(game) : null
  const mission = game.phase === 'day' ? missionOffer(game) : null
  const patrol = crewEffect(game, 'revealsPatrol') ? game.patrolDistrict : null
  const lines: Line[] = [
    ...(game.delivery ? [line('delivery', t.fil.deliveryActive(t.district[game.delivery.to].name), 'info', 'map')] : []),
    ...(delivery
      ? [line('delivery', t.fil.deliveryOffer(t.district[delivery].name, deliveryCrates(game), credits(deliveryFee(game))), 'info', 'map')]
      : []),
    ...(game.contract
      ? [
          line(
            'contract',
            t.contract.fil(game.contract.qty, t.product[game.contract.productId].name, t.district[game.contract.to].name, game.contract.deadline),
            'warning',
            game.districtId === game.contract.to ? 'market' : 'map',
          ),
        ]
      : []),
    ...(game.contractOffer && game.phase === 'day'
      ? [
          line(
            'contractOffer',
            t.contract.offerFil(t.product[game.contractOffer.productId].name, credits(game.contractOffer.reward)),
            'warning',
            'places',
          ),
        ]
      : []),
    ...(mission
      ? [line('mission', t.fil.missionTonight(t.district[mission].name, sealedCount(game), credits(missionFee(game))), 'info', 'map')]
      : []),
    line(
      'after',
      t.evening.after(
        t.district[game.after].name,
        multiplier(AFTER.festiveFactor),
        multiplier(TAGS[AFTER.tag].nightSale ?? 1),
        percent(1 - AFTER.nightRiskFactor, 0),
      ),
      'event',
      'map',
    ),
    ...(patrol ? [line('patrol', t.fil.patrol(t.district[patrol].name), 'info', 'map')] : []),
    ...(game.suspiciousPeaks.length > 0
      ? [line('peaks', t.fil.peaks(game.suspiciousPeaks.map((id) => t.district[id].name).join(', ')), 'danger', 'map')]
      : []),
  ]

  return (
    <Panel icon={Megaphone} title={t.fil.today} collapseId="fil-today">
      <FlashInfo />
      <h3 className="mt-3 mb-1.5 border-t border-line pt-2 text-xs font-bold text-ink-soft uppercase">{t.fil.forYou}</h3>
      <Lines lines={lines} onGo={onGo} />
      <h3 className="mt-3 mb-1.5 border-t border-line pt-2 text-xs font-bold text-ink-soft uppercase">{t.fil.news}</h3>
      <EventsList />
    </Panel>
  )
}

/** Synthanol bas, balise à bord, caisses qui pourrissent demain, caisses abîmées, ce qu'une saisie coûterait, places libres au double fond */
function AlertsPanel({ onGo }: GoProps) {
  // Fraîcheur, saisie, double fond et trajets se calculent sur l'état entier
  const game = useGameStore((s) => s.game)
  const { t, percent } = useI18n()
  const products = [...new Set(game.cargo.map((lot) => lot.productId))]
  const rotting = products.flatMap((id) => {
    const qty = game.cargo.reduce((total, lot) => (lot.productId === id && (daysBeforeRot(game, lot) ?? Infinity) <= 1 ? total + lot.qty : total), 0)
    return qty > 0 ? [t.fil.rotsTomorrow(qty, t.product[id].name)] : []
  })
  const damaged = products.flatMap((id) => {
    const qty = game.cargo.reduce((total, lot) => (lot.productId === id && lot.damaged ? total + lot.qty : total), 0)
    return qty > 0 ? [t.fil.damaged(qty, t.product[id].name)] : []
  })
  // Places libres utiles : seulement s'il reste des caisses illégales visibles à cacher
  const hideable = products.some((id) => canHide(id) && ownedQty(game.cargo, id) > (game.compartment[id] ?? 0))
  const room = hideable ? compartmentRoom(game) : 0
  // Synthanol : trajets d'ici vers chaque autre district
  const costs = DISTRICT_IDS.filter((id) => id !== game.districtId).map((id) => planTravel(game, id).fuelCost)
  const shortest = Math.min(...costs)
  const longest = Math.max(...costs)
  const fuelLine: Line[] =
    game.fuel < shortest
      ? [line('fuel', t.fil.fuelOut(game.fuel, shortest), 'danger', 'places')]
      : game.fuel < longest
        ? [line('fuel', t.fil.fuelLow(game.fuel, longest), 'warning', 'places')]
        : []
  // Balise d'un produit à bord : risque ajouté partout, sauf si l'équipière la brouille
  const beacons = products.flatMap((id) => {
    const beacon = PRODUCTS[id].beaconRisk
    if (!beacon) return []
    return [
      crewEffect(game, 'masksBeacon') && workingCrew(game)
        ? line(id, t.fil.beaconJammed(t.product[id].name), 'info')
        : line(id, t.fil.beacon(t.product[id].name, percent(beacon, 0)), 'danger'),
    ]
  })
  const lines: Line[] = [
    ...fuelLine,
    ...beacons,
    ...rotting.map((text): Line => ({ key: text, text, tone: 'danger', go: 'market' })),
    ...damaged.map((text): Line => ({ key: text, text, tone: 'warning', go: 'market' })),
  ]
  return (
    <Panel icon={AlertTriangle} title={t.fil.alerts} collapseId="fil-alerts">
      <Lines lines={[...lines, ...(room > 0 ? [line('room', t.fil.compartmentRoom(room), 'night', 'vehicle')] : [])]} onGo={onGo} />
      <Exposure className="mt-1" />
      {lines.length === 0 && room === 0 && <Hint>{t.fil.noAlert}</Hint>}
    </Panel>
  )
}

/** Meilleurs cours vus ailleurs pour la soute, et où la boutique d'ici se vend en Forte demande (chap. 2) */
function DealsPanel() {
  // Mémoire de marché et profil public des districts : état entier
  const game = useGameStore((s) => s.game)
  const { t } = useI18n()
  const owned = [...new Set(game.cargo.map((lot) => lot.productId))].filter((id) => !PRODUCTS[id].sealed)
  // Boutique d'ici : seulement les produits dont on sait où les revendre mieux
  const shop = shopProducts(game.markets[game.districtId]).filter(
    (id) =>
      !owned.includes(id) && (bestRemembered(game, id) !== null || DISTRICT_IDS.some((district) => productStatus(game, district, id) === 'strong')),
  )

  return (
    <Panel icon={TrendingUp} title={t.fil.deals} collapseId="fil-deals">
      {owned.length > 0 && (
        <>
          <h3 className="text-xs text-ink-muted uppercase">{t.fil.dealsOwned}</h3>
          <ul className="mt-1 mb-2 flex flex-col gap-1">
            {owned.map((id) => (
              <DealRow key={id} productId={id} />
            ))}
          </ul>
        </>
      )}
      {shop.length > 0 && (
        <>
          <h3 className="text-xs text-ink-muted uppercase">{t.fil.dealsShop}</h3>
          <ul className="mt-1 flex flex-col gap-1">
            {shop.map((id) => (
              <DealRow key={id} productId={id} />
            ))}
          </ul>
        </>
      )}
      {owned.length === 0 && shop.length === 0 && <Hint>{t.fil.dealsEmpty}</Hint>}
    </Panel>
  )
}

/** Un produit : meilleur cours vu ailleurs (marge estimée pour la soute) et districts en Forte demande */
function DealRow({ productId }: DealRowProps) {
  // Mémoire de marché, profil public et prix d'achat moyen se lisent sur l'état entier
  const game = useGameStore((s) => s.game)
  const { t, credits } = useI18n()
  const best = bestRemembered(game, productId)
  const cost = averageCost(game.cargo, productId)
  const strong = DISTRICT_IDS.filter((id) => productStatus(game, id, productId) === 'strong')
  const blurred = best !== null && isMemoryBlurred(game, best.districtId)

  return (
    <li className="text-xs">
      <span className="font-bold">{t.product[productId].name}</span>
      <span className="ml-2 inline-flex flex-wrap items-center gap-x-1.5 text-ink-soft">
        {best ? (
          <>
            {cost !== null && !blurred && <Margin revenue={estimatedUnitSale(best.quote)} cost={cost} showAmount={false} />}
            {t.fil.best(
              blurred ? t.travel.blurred(credits(blurredQuote(best.quote).low), credits(blurredQuote(best.quote).high)) : credits(best.quote),
              t.district[best.districtId].name,
              best.age,
            )}
          </>
        ) : (
          <span className="text-ink-faint">{t.fil.neverSeen}</span>
        )}
        {strong.length > 0 && <span className="text-warning">· {t.fil.strongAt(strong.map((id) => t.district[id].name).join(', '))}</span>}
      </span>
    </li>
  )
}

type LinesProps = GoProps & {
  lines: readonly Line[]
}

/** Lignes d'information, chacune avec son raccourci vers l'onglet où agir */
function Lines({ lines, onGo }: LinesProps) {
  const { t } = useI18n()
  return (
    <ul className="flex flex-col gap-1.5 text-xs">
      {lines.map(({ key, text, tone, go }) => (
        <li key={key} className="flex items-start justify-between gap-2">
          <span className={TONE_TEXT[tone]}>{text}</span>
          {go && (
            <Button size="sm" className="shrink-0" aria-label={t.fil.goTo(t.tabs[go])} onClick={() => onGo(go)}>
              {t.tabs[go]}
              <ArrowRight size={12} aria-hidden="true" />
            </Button>
          )}
        </li>
      ))}
    </ul>
  )
}
