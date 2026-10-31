import { AlertTriangle, Megaphone, TrendingUp } from 'lucide-react'
import { AFTER, WANTED, WORN } from '../../data/balance.ts'
import { DISTRICT_IDS } from '../../data/districts.ts'
import { PRODUCTS } from '../../data/products.ts'
import { TAGS } from '../../data/tags.ts'
import { averageCost, canHide, ownedQty } from '../../engine/cargo.ts'
import { compartmentRoom } from '../../engine/compartment.ts'
import { daysBeforeRot } from '../../engine/condition.ts'
import { maxBuy, planTravel } from '../../engine/actions.ts'
import { exposure } from '../../engine/interception.ts'
import { crewEffect, workingCrew } from '../../engine/crew.ts'
import { nextProtectionDay, protectionBreakdown } from '../../engine/finance.ts'
import { isWorn } from '../../engine/gauges.ts'
import { deliveryCrates, deliveryFee, deliveryOffer } from '../../engine/delivery.ts'
import { bestRemembered, estimatedUnitSale, productStatus, quote, shopProducts } from '../../engine/market.ts'
import { missionFee, missionOffer, sealedCount } from '../../engine/night.ts'
import type { ProductId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import BriefingPanel from '../briefing/BriefingPanel.tsx'
import Exposure from '../map/Exposure.tsx'
import ObjectivesPanel from '../objectives/ObjectivesPanel.tsx'
import Hint from '../shared/Hint.tsx'
import Margin from '../shared/Margin.tsx'
import Panel from '../shared/Panel.tsx'
import Tip from '../shared/Tip.tsx'
import { TIER_STYLES, TONE_TEXT, type Tone } from '../shared/styles.ts'
import EventsList from './EventsList.tsx'
import CalendarPanel from './CalendarPanel.tsx'
import JournalPanel from './JournalPanel.tsx'
import NewGamePanel from './NewGamePanel.tsx'

type Line = {
  key: string
  text: string
  tone: Tone
}

/** Ligne colorée d'un panneau du Fil */
const line = (key: string, text: string, tone: Tone): Line => ({ key, text, tone })

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

/** Intitulé d'une rubrique d'encart, et séparation de la précédente */
const SECTION = 'mb-1.5 text-xs font-bold text-ink-soft uppercase'
const SEPARATED = 'mt-3 border-t border-line pt-2'

/** Onglet En bref (chap. 7) : ce qui compte aujourd'hui, avant d'aller au marché puis sur la carte */
export default function FilView() {
  return (
    <>
      {/* Dans l'ordre de lecture : la journée, les décisions, le bilan ; sur grand écran, répartis en colonnes */}
      <BriefingPanel />
      <TodayPanel />
      <AlertsPanel />
      <DealsPanel />
      <CalendarPanel />
      <ObjectivesPanel />
      <JournalPanel />
      <NewGamePanel />
    </>
  )
}

/**
 * Aujourd'hui : ce qui concerne le joueur (commandes du jour et du soir, contrat, after, ronde renforcée, pics suspects),
 * puis les actualités de la ville
 */
function TodayPanel() {
  // Offres et primes se calculent sur l'état entier de la partie
  const game = useGameStore((s) => s.game)
  const { t, credits, change, percent } = useI18n()
  const delivery = game.phase === 'day' && !game.dayTripDone ? deliveryOffer(game) : null
  const mission = game.phase === 'day' ? missionOffer(game) : null
  const patrol = crewEffect(game, 'revealsPatrol') ? game.patrolDistrict : null
  const lines: Line[] = [
    ...(game.delivery ? [line('delivery', t.fil.deliveryActive(t.district[game.delivery.to].name), 'info')] : []),
    ...(delivery ? [line('delivery', t.fil.deliveryOffer(t.district[delivery].name, deliveryCrates(game), credits(deliveryFee(game))), 'info')] : []),
    ...(game.contract
      ? [
          line(
            'contract',
            t.contract.fil(game.contract.qty, t.product[game.contract.productId].name, t.district[game.contract.to].name, game.contract.deadline),
            'warning',
          ),
        ]
      : []),
    ...(game.contractOffer && game.phase === 'day'
      ? [line('contractOffer', t.contract.offerFil(t.product[game.contractOffer.productId].name, credits(game.contractOffer.reward)), 'warning')]
      : []),
    ...(mission ? [line('mission', t.fil.missionTonight(t.district[mission].name, sealedCount(game), credits(missionFee(game))), 'info')] : []),
    line(
      'after',
      t.evening.after(
        t.district[game.after].name,
        change(AFTER.festiveFactor),
        change(TAGS[AFTER.tag].nightSale ?? 1),
        percent(1 - AFTER.nightRiskFactor, 0),
      ),
      'event',
    ),
    ...(patrol ? [line('patrol', t.fil.patrol(t.district[patrol].name), 'info')] : []),
    ...(game.suspiciousPeaks.length > 0
      ? [line('peaks', t.fil.peaks(game.suspiciousPeaks.map((id) => t.district[id].name).join(', ')), 'danger')]
      : []),
  ]

  return (
    <Panel icon={Megaphone} title={t.fil.today} collapseId="fil-today">
      <h3 className={SECTION}>{t.fil.forYou}</h3>
      <Lines lines={lines} />
      <h3 className={`flex items-center gap-1 ${SECTION} ${SEPARATED}`}>
        {t.fil.news}
        <Tip label={t.fil.news} content={t.fil.newsInfo} />
      </h3>
      <EventsList />
    </Panel>
  )
}

/**
 * Chauffeur à bout, Fiche S, Synthanol bas, balise à bord, caisses qui pourrissent demain, caisses abîmées, places libres
 * au double fond, ce qu'une saisie coûterait ; rien à signaler, pas d'encart
 */
function AlertsPanel() {
  // Fraîcheur, saisie, double fond et trajets se calculent sur l'état entier
  const game = useGameStore((s) => s.game)
  const { t, percent, credits } = useI18n()
  const protectionDay = nextProtectionDay(game)
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
      ? [line('fuel', t.fil.fuelOut(game.fuel, shortest), 'danger')]
      : game.fuel < longest
        ? [line('fuel', t.fil.fuelLow(game.fuel, longest), 'warning')]
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
    ...(game.wanted > 0
      ? [
          line(
            'wanted',
            t.fil.wanted(
              game.wanted,
              WANTED.maxLevel,
              percent(WANTED.riskPerLevel * game.wanted, 0),
              percent(WANTED.fleePenaltyPerLevel * game.wanted, 0),
            ),
            'danger',
          ),
        ]
      : []),
    ...fuelLine,
    // Collecte de Viktor demain matin : arriver léger, ou blanchir avant (chap. 1)
    ...(protectionDay === game.day + 1 ? [line('protection', t.fil.protectionTomorrow(credits(protectionBreakdown(game).total)), 'warning')] : []),
    ...(game.crew.active && game.crew.paidDay !== game.day ? [line('crew', t.fil.crewUnpaid(t.crew[game.crew.active].name), 'danger')] : []),
    ...beacons,
    ...rotting.map((text): Line => ({ key: text, text, tone: 'danger' })),
    ...damaged.map((text): Line => ({ key: text, text, tone: 'warning' })),
    ...(room > 0 ? [line('room', t.fil.compartmentRoom(room), 'night')] : []),
  ]
  // Ce qu'une saisie coûterait : seulement avec de l'illégal à bord
  const exposed = exposure(game).crates > 0
  if (lines.length === 0 && !exposed) return null
  return (
    <Panel icon={AlertTriangle} title={t.fil.alerts} collapseId="fil-alerts">
      <Lines lines={lines} />
      <Exposure className={lines.length > 0 ? 'mt-1' : ''} />
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
      const revenue = best ? estimatedUnitSale(best.quote) : null
      return { productId, best, revenue, cost: averageCost(game.cargo, productId) }
    })
    .sort(byMargin)
  // Boutique d'ici : ce que le stock, la place et le cash permettent d'acheter, rangé par gain total possible
  const shop = shopProducts(market)
    .flatMap((productId): ShopDeal[] => {
      const best = bestRemembered(game, productId)
      const qty = maxBuy(game, productId)
      if (!best || qty === 0) return []
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
          <h3 className={`flex items-center gap-1 ${SECTION}`}>
            {t.fil.dealsOwned}
            <Tip label={t.fil.dealsOwned} content={t.fil.dealsSeen} />
          </h3>
          <ul className="flex flex-col gap-1.5">
            {owned.map((deal) => (
              <DealRow key={deal.productId} deal={deal} qty={ownedQty(game.cargo, deal.productId)} />
            ))}
          </ul>
        </>
      )}
      {shop.length > 0 && (
        <>
          <h3 className={`flex items-center gap-1 ${SECTION} ${owned.length > 0 ? SEPARATED : ''}`}>
            {t.fil.dealsShop}
            <Tip label={t.fil.dealsShop} content={t.fil.dealsSeen} />
          </h3>
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

/** Une affaire : le produit en entier, dessous où le revendre (district, cours vu et ancienneté), et la marge estimée par caisse */
function DealRow({ deal: { productId, best, revenue, cost }, qty, here = false }: DealRowProps) {
  // Profil public des districts (Forte demande) : état entier
  const game = useGameStore((s) => s.game)
  const { t, credits } = useI18n()
  // Jamais vu ailleurs : la Forte demande, publique, dit au moins où chercher
  const strong = DISTRICT_IDS.filter((id) => productStatus(game, id, productId) === 'strong').map((id) => t.district[id].name)
  const tier = PRODUCTS[productId].tier

  return (
    <li className="flex items-center justify-between gap-2 text-xs">
      <div className="min-w-0">
        <p className="font-bold text-ink">
          <span className={`mr-1.5 ${TIER_STYLES[tier].text}`}>T{tier}</span>
          {t.product[productId].name}
        </p>
        {qty !== undefined && <p className="text-ink-muted">{here ? t.fil.canBuy(qty) : t.fil.held(qty)}</p>}
        <p className="text-ink-muted">
          {best ? (
            <>
              <span className="font-bold text-ink-soft">{t.district[best.districtId].name}</span> {t.fil.bestQuote(credits(best.quote), best.age)}
            </>
          ) : strong.length > 0 ? (
            t.fil.strongAt(strong.join(', '))
          ) : (
            t.fil.neverSeen
          )}
        </p>
      </div>
      {revenue !== null && cost !== null && <Margin revenue={revenue} cost={cost} unit={t.market.marginUnit} className="shrink-0" />}
    </li>
  )
}

type LinesProps = {
  lines: readonly Line[]
}

/** Lignes d'information colorées */
function Lines({ lines }: LinesProps) {
  return (
    <ul className="flex flex-col gap-1.5 text-xs">
      {lines.map(({ key, text, tone }) => (
        <li key={key} className={TONE_TEXT[tone]}>
          {text}
        </li>
      ))}
    </ul>
  )
}
