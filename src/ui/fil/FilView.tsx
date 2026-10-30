import { AlertTriangle, CalendarDays, Megaphone, Newspaper, TrendingUp } from 'lucide-react'
import { AFTER, GAME_LENGTH_DAYS } from '../../data/balance.ts'
import { DISTRICT_IDS } from '../../data/districts.ts'
import { LOTTERY } from '../../data/events.ts'
import { PRODUCTS } from '../../data/products.ts'
import { TAGS } from '../../data/tags.ts'
import { averageCost, canHide, cargoUsed, ownedQty } from '../../engine/cargo.ts'
import { compartmentRoom } from '../../engine/compartment.ts'
import { daysBeforeRot } from '../../engine/condition.ts'
import { crewEffect, isMemoryBlurred } from '../../engine/crew.ts'
import { deliveryCrates, deliveryFee, deliveryOffer } from '../../engine/delivery.ts'
import { trapdoorReadyDay } from '../../engine/equipment.ts'
import { nextDebtDeadline, nextProtectionDay, protectionBreakdown } from '../../engine/finance.ts'
import { bestRemembered, blurredQuote, estimatedUnitSale, productStatus, shopProducts } from '../../engine/market.ts'
import { missionFee, missionOffer, sealedCount } from '../../engine/night.ts'
import { pendingServices } from '../../engine/services.ts'
import type { ProductId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import BriefingPanel from '../briefing/BriefingPanel.tsx'
import Exposure from '../map/Exposure.tsx'
import ObjectivesPanel from '../objectives/ObjectivesPanel.tsx'
import Hint from '../shared/Hint.tsx'
import Margin from '../shared/Margin.tsx'
import Panel from '../shared/Panel.tsx'
import { TONE_TEXT, type Tone } from '../shared/styles.ts'
import EventsList from './EventsList.tsx'
import FlashInfo from './FlashInfo.tsx'
import JournalPanel from './JournalPanel.tsx'

type AgendaEntry = {
  key: string
  day: number
  label: string
  tone: Tone
}

type Line = {
  key: string
  text: string
  tone: Tone
}

/** Ligne colorée d'un panneau du Fil */
const line = (key: string, text: string, tone: Tone): Line => ({ key, text, tone })

/** Échéance de l'agenda */
const entry = (key: string, day: number, label: string, tone: Tone): AgendaEntry => ({ key, day, label, tone })

type DealRowProps = {
  productId: ProductId
}

/** Onglet Le Fil (chap. 7) : ce qui compte aujourd'hui, avant d'aller au marché puis sur la carte */
export default function FilView() {
  return (
    <>
      <BriefingPanel />
      <NewsPanel />
      <TodayPanel />
      <AlertsPanel />
      <AgendaPanel />
      <DealsPanel />
      <ObjectivesPanel />
      <JournalPanel />
    </>
  )
}

/** Flash Info d'Aeterna, puis les événements du jour, la Loterie et la rumeur du lendemain */
function NewsPanel() {
  const { t } = useI18n()
  return (
    <Panel icon={Newspaper} title={t.fil.news} collapseId="fil-news">
      <FlashInfo />
      <div className="mt-2">
        <EventsList />
      </div>
    </Panel>
  )
}

/** Commandes du jour et du soir, after du couvre-feu, ronde renforcée et pics suspects */
function TodayPanel() {
  // Offres et primes se calculent sur l'état entier de la partie
  const game = useGameStore((s) => s.game)
  const { t, credits, multiplier, percent } = useI18n()
  const delivery = game.phase === 'day' && !game.dayTripDone ? deliveryOffer(game) : null
  const mission = game.phase === 'day' ? missionOffer(game) : null
  const patrol = crewEffect(game, 'revealsPatrol') ? game.patrolDistrict : null
  const lines: Line[] = [
    ...(game.delivery ? [line('delivery', t.fil.deliveryActive(t.district[game.delivery.to].name), 'info')] : []),
    ...(delivery ? [line('delivery', t.fil.deliveryOffer(t.district[delivery].name, deliveryCrates(game), credits(deliveryFee(game))), 'info')] : []),
    ...(mission ? [line('mission', t.fil.missionTonight(t.district[mission].name, sealedCount(game), credits(missionFee(game))), 'info')] : []),
    line(
      'after',
      t.evening.after(
        t.district[game.after].name,
        multiplier(AFTER.festiveFactor),
        multiplier(TAGS[AFTER.tag].nightSale ?? 1),
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
      <ul className="flex flex-col gap-1 text-xs">
        {lines.map(({ key, text, tone }) => (
          <li key={key} className={TONE_TEXT[tone]}>
            {text}
          </li>
        ))}
      </ul>
    </Panel>
  )
}

/** Caisses qui pourrissent demain, caisses abîmées, ce qu'une saisie coûterait, places libres au double fond */
function AlertsPanel() {
  // Fraîcheur, saisie et double fond se calculent sur l'état entier
  const game = useGameStore((s) => s.game)
  const { t } = useI18n()
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
  const lines: Line[] = [
    ...rotting.map((text): Line => ({ key: text, text, tone: 'danger' })),
    ...damaged.map((text): Line => ({ key: text, text, tone: 'warning' })),
  ]
  if (cargoUsed(game.cargo) === 0) return null

  return (
    <Panel icon={AlertTriangle} title={t.fil.alerts} collapseId="fil-alerts">
      <ul className="flex flex-col gap-1 text-xs">
        {lines.map(({ key, text, tone }) => (
          <li key={key} className={TONE_TEXT[tone]}>
            {text}
          </li>
        ))}
        {room > 0 && <li className="text-night">{t.fil.compartmentRoom(room)}</li>}
      </ul>
      <Exposure className="mt-1" />
      {lines.length === 0 && room === 0 && <Hint>{t.fil.noAlert}</Hint>}
    </Panel>
  )
}

/** Échéances à venir, du plus proche au plus lointain */
function AgendaPanel() {
  // Échéances et délais se calculent sur l'état entier
  const game = useGameStore((s) => s.game)
  const { t, credits } = useI18n()
  const debtDay = nextDebtDeadline(game)
  const protectionDay = nextProtectionDay(game)
  const lottery = LOTTERY.days.find((day) => day > game.day)
  const vice = game.events.lottery
  const trapdoor = trapdoorReadyDay(game)
  const entries: AgendaEntry[] = [
    ...(debtDay !== null ? [entry('debt', debtDay, t.fil.debt(credits(game.debt)), 'danger')] : []),
    ...(game.debtLate ? [entry('late', game.day, t.fil.debtLate, 'danger')] : []),
    ...(protectionDay !== null ? [entry('protection', protectionDay, t.fil.protection(credits(protectionBreakdown(game).total)), 'warning')] : []),
    game.exemption === 0
      ? entry('sedation', game.day, t.fil.sedated, 'danger')
      : entry('sedation', game.day + game.exemption, t.fil.sedation, 'info'),
    ...(lottery !== undefined ? [entry('lottery', lottery, t.fil.lottery, 'neutral')] : []),
    ...(vice?.vice && vice.viceDistrict && game.day <= vice.viceUntil
      ? [entry('vice', vice.viceUntil, t.fil.viceEnd(t.product[vice.vice].name, t.district[vice.viceDistrict].name), 'neutral')]
      : []),
    ...pendingServices(game).map(({ key, day }): AgendaEntry => ({ key, day, label: t.fil.serviceReady(t.fil.service[key]), tone: 'muted' })),
    ...(trapdoor !== null ? [entry('trapdoor', trapdoor, t.fil.trapdoorReady, 'muted')] : []),
    entry('audit', GAME_LENGTH_DAYS, t.fil.audit(GAME_LENGTH_DAYS), 'accent'),
  ]
  entries.sort((a, b) => a.day - b.day)

  return (
    <Panel icon={CalendarDays} title={t.fil.agenda} collapseId="fil-agenda">
      <ul className="flex flex-col gap-1 text-xs">
        {entries.map(({ key, day, label, tone }) => (
          <li key={key} className="flex gap-2">
            <span className="w-20 shrink-0 font-bold text-ink-muted">{t.fil.dayLabel(day, day - game.day)}</span>
            <span className={TONE_TEXT[tone]}>{label}</span>
          </li>
        ))}
      </ul>
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
