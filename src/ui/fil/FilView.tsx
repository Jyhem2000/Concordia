import { AlertTriangle, ArrowRight, Megaphone, TrendingUp } from 'lucide-react'
import { AFTER, WORN } from '../../data/balance.ts'
import { DISTRICT_IDS } from '../../data/districts.ts'
import { PRODUCTS } from '../../data/products.ts'
import { TAGS } from '../../data/tags.ts'
import { averageCost, canHide, ownedQty } from '../../engine/cargo.ts'
import { compartmentRoom } from '../../engine/compartment.ts'
import { daysBeforeRot } from '../../engine/condition.ts'
import { maxBuy, planTravel } from '../../engine/actions.ts'
import { crewEffect, isMemoryBlurred, workingCrew } from '../../engine/crew.ts'
import { isWorn } from '../../engine/gauges.ts'
import { deliveryCrates, deliveryFee, deliveryOffer } from '../../engine/delivery.ts'
import { bestRemembered, blurredQuote, estimatedUnitSale, productStatus, quote, shopProducts } from '../../engine/market.ts'
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

type Deal = {
  productId: ProductId
  /** Meilleur cours vu ailleurs, ou null si jamais vu */
  best: ReturnType<typeof bestRemembered>
  /** Revente estimée par caisse (commission déduite), null si inconnue ou brouillée */
  revenue: number | null
  /** Prix d'achat par caisse : moyen pour la soute, cours d'ici pour la boutique */
  cost: number | null
}

type ShopDeal = Deal & {
  /** Caisses achetables : stock, place en soute et cash */
  qty: number
}

type DealRowProps = {
  deal: Deal
  /** Caisses en soute, ou achetables ici */
  qty?: number
  /** Produit de la boutique d'ici : le prix d'achat précède la revente */
  here?: boolean
}

/** Colonne d'En bref sur grand écran ; sur téléphone, ses encarts se rangent directement dans la page */
const COLUMN = 'contents md:flex md:min-w-0 md:flex-col md:gap-4'

/** Intitulé d'une rubrique d'encart, et séparation de la précédente */
const SECTION = 'mb-1.5 text-xs font-bold text-ink-soft uppercase'
const SEPARATED = 'mt-3 border-t border-line pt-2'

/** Onglet En bref (chap. 7) : ce qui compte aujourd'hui, avant d'aller au marché puis sur la carte */
export default function FilView({ onGo }: FilViewProps) {
  return (
    <>
      {/* Grand écran : la journée, puis les décisions, puis le bilan ; sur téléphone, les encarts se suivent */}
      <div className={COLUMN}>
        <BriefingPanel />
        <TodayPanel onGo={onGo} />
        <AlertsPanel onGo={onGo} />
      </div>
      <div className={COLUMN}>
        <DealsPanel />
        <CalendarPanel />
        <ObjectivesPanel />
      </div>
      <div className={COLUMN}>
        <JournalPanel />
        <RecordsPanel />
      </div>
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
      ? [line('delivery', t.fil.deliveryOffer(t.district[delivery].name, deliveryCrates(game), credits(deliveryFee(game))), 'info', 'market')]
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
      <h3 className={`${SECTION} ${SEPARATED}`}>{t.fil.forYou}</h3>
      <Lines lines={lines} onGo={onGo} />
      <h3 className={`${SECTION} ${SEPARATED}`}>{t.fil.news}</h3>
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
    ...(isWorn(game) ? [line('worn', t.fil.worn(WORN.healthBelow, percent(WORN.penalty, 0)), 'danger')] : []),
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

/** Achats d'ici montrés au plus : les meilleurs gains seulement */
const SHOP_DEALS = 3

/** Marge d'une affaire, pour le tri : inconnue en dernier */
const marginOf = ({ revenue, cost }: Deal) => (revenue === null || cost === null ? -Infinity : revenue - cost)
const byMargin = (a: Deal, b: Deal) => marginOf(b) - marginOf(a)

/**
 * Bonnes affaires (chap. 2) : où revendre chaque produit de la soute, au meilleur cours vu ailleurs, puis les quelques
 * produits de la boutique d'ici qui rapporteraient le plus (marge par caisse × caisses achetables)
 */
function DealsPanel() {
  // Mémoire de marché, cours d'ici et prix d'achat moyen : état entier
  const game = useGameStore((s) => s.game)
  const { t } = useI18n()
  const market = game.markets[game.districtId]
  const owned = [...new Set(game.cargo.map((lot) => lot.productId))]
    .filter((id) => !PRODUCTS[id].sealed)
    .map((productId): Deal => {
      const best = bestRemembered(game, productId)
      // Sédation : cours brouillé, pas de marge à annoncer
      const revenue = best && !isMemoryBlurred(game, best.districtId) ? estimatedUnitSale(best.quote) : null
      return { productId, best, revenue, cost: averageCost(game.cargo, productId) }
    })
    .sort(byMargin)
  // Boutique d'ici : ce que le stock, la place et le cash permettent d'acheter, rangé par gain total possible
  const shop = shopProducts(market)
    .flatMap((productId): ShopDeal[] => {
      const best = bestRemembered(game, productId)
      const qty = maxBuy(game, productId)
      if (!best || qty === 0 || isMemoryBlurred(game, best.districtId)) return []
      const revenue = estimatedUnitSale(best.quote)
      const cost = quote(game, game.districtId, productId)
      return revenue > cost ? [{ productId, best, revenue, cost, qty }] : []
    })
    .sort((a, b) => marginOf(b) * b.qty - marginOf(a) * a.qty)
    .slice(0, SHOP_DEALS)

  return (
    <Panel icon={TrendingUp} title={t.fil.deals} collapseId="fil-deals">
      {owned.length > 0 && (
        <>
          <h3 className={SECTION}>{t.fil.dealsOwned}</h3>
          <ul className="flex flex-col gap-1.5">
            {owned.map((deal) => (
              <DealRow key={deal.productId} deal={deal} qty={ownedQty(game.cargo, deal.productId)} />
            ))}
          </ul>
        </>
      )}
      {shop.length > 0 && (
        <>
          <h3 className={`${SECTION} ${owned.length > 0 ? SEPARATED : ''}`}>{t.fil.dealsShop}</h3>
          <ul className="flex flex-col gap-1.5">
            {shop.map((deal) => (
              <DealRow key={deal.productId} deal={deal} qty={deal.qty} here />
            ))}
          </ul>
        </>
      )}
      {owned.length === 0 && shop.length === 0 && <Hint>{t.fil.dealsEmpty}</Hint>}
    </Panel>
  )
}

/** Une affaire : le produit, où le revendre (cours et ancienneté), et la marge estimée par caisse */
function DealRow({ deal: { productId, best, revenue, cost }, qty, here = false }: DealRowProps) {
  // Profil public des districts (Forte demande) : état entier
  const game = useGameStore((s) => s.game)
  const { t, credits } = useI18n()
  const sale = best
    ? t.fil.best(
        revenue === null ? t.travel.blurred(credits(blurredQuote(best.quote).low), credits(blurredQuote(best.quote).high)) : credits(best.quote),
        t.district[best.districtId].name,
        best.age,
      )
    : null
  // Jamais vu ailleurs : la Forte demande, publique, dit au moins où chercher
  const strong = DISTRICT_IDS.filter((id) => productStatus(game, id, productId) === 'strong').map((id) => t.district[id].name)
  const where = sale ?? (strong.length > 0 ? t.fil.strongAt(strong.join(', ')) : t.fil.neverSeen)

  return (
    <li className="flex items-center justify-between gap-2 text-xs">
      <div className="min-w-0">
        <p className="truncate font-bold text-ink">
          {t.product[productId].name}
          {qty !== undefined && <span className="ml-1 font-normal text-ink-muted">{here ? t.fil.canBuy(qty) : `×${qty}`}</span>}
        </p>
        <p className="text-ink-muted">{here && cost !== null ? t.fil.buyHere(credits(cost), where) : where}</p>
      </div>
      {revenue !== null && cost !== null && <Margin revenue={revenue} cost={cost} unit={t.market.marginUnit} className="shrink-0" />}
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
