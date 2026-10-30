import { useState, type ReactNode } from 'react'
import { PRODUCTS } from '../../data/products.ts'
import { TAGS } from '../../data/tags.ts'
import { bulkSales, checkUseProduct, maxBuy } from '../../engine/actions.ts'
import { averageCost, ownedQty } from '../../engine/cargo.ts'
import { demandQuota, demandRefill, productStatus, quote, quoteBreakdown, saleQuote, shopProducts } from '../../engine/market.ts'
import { keysOf } from '../../engine/records.ts'
import type { ProductId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Detailed from '../shared/Detailed.tsx'
import Chip from '../shared/Chip.tsx'
import Hint from '../shared/Hint.tsx'
import Margin from '../shared/Margin.tsx'
import Panel from '../shared/Panel.tsx'
import { TIER_STYLES } from '../shared/styles.ts'
import Thumb from '../shared/Thumb.tsx'
import Tip from '../shared/Tip.tsx'
import { useConditions } from '../shared/useConditions.ts'
import { filterKey, passesFilter, type MarketFilter } from './marketFilter.ts'
import ProductSheet from './ProductSheet.tsx'

type FilterBarProps = {
  filters: readonly MarketFilter[]
  current: MarketFilter
  ownedCount: number
  onPick: (filter: MarketFilter) => void
}

type MarketRowProps = {
  productId: ProductId
}

type FieldProps = {
  label: string
  /** Explication en infobulle, derrière une icône « i » */
  hint?: string
  /** Occupe deux colonnes de la grille */
  wide?: boolean
  children: ReactNode
}

type QuantityButtonsProps = {
  label: string
  max: number
  maxLabel: string
  onPick: (qty: number) => void
  variant: 'primary' | 'danger'
}

/** Filtre par défaut : tout le tableau */
const ALL: MarketFilter = { kind: 'all' }

/** Tableau des cours : la boutique du jour, plus tous les produits en soute (chap. 7) */
export default function MarketPanel() {
  const game = useGameStore((s) => s.game)
  const { t } = useI18n()

  const shop = shopProducts(game.markets[game.districtId])
  // Les caisses scellées d'une mission ne se vendent pas : elles ont leur propre ligne
  const owned = game.cargo.map((lot) => lot.productId).filter((id) => !PRODUCTS[id].sealed)
  const sealed = game.cargo.reduce((total, lot) => (PRODUCTS[lot.productId].sealed ? total + lot.qty : total), 0)
  // Ordre fixe, par tier puis par ID : acheter ou vendre ne déplace jamais une ligne (la page ne saute pas)
  const rows = [...new Set([...owned, ...shop])].sort((a, b) => PRODUCTS[a].tier - PRODUCTS[b].tier || a.localeCompare(b))
  const isOwned = (id: ProductId) => ownedQty(game.cargo, id) > 0
  const ownedCount = rows.filter(isOwned).length

  // Filtres proposés : ceux qui gardent au moins un produit du tableau, tiers puis tags dans l'ordre des données
  const tiers = [...new Set(rows.map((id) => PRODUCTS[id].tier))].sort((a, b) => a - b)
  const tags = keysOf(TAGS).filter((tag) => rows.some((id) => PRODUCTS[id].tags.includes(tag)))
  const filters: MarketFilter[] = [
    ALL,
    ...(ownedCount > 0 ? [{ kind: 'owned' } satisfies MarketFilter] : []),
    ...tiers.map((tier): MarketFilter => ({ kind: 'tier', tier })),
    ...tags.map((tag): MarketFilter => ({ kind: 'tag', tag })),
  ]
  // Filtre choisi : état d'interface éphémère ; s'il ne garde plus rien ici (autre district, soute vidée), tout s'affiche
  const [picked, setPicked] = useState<MarketFilter>(ALL)
  const filter = filters.some((candidate) => filterKey(candidate) === filterKey(picked)) ? picked : ALL
  const shown = rows.filter((id) => passesFilter(filter, id, isOwned(id)))

  return (
    <Panel title={`${t.market.title} — ${t.district[game.districtId].name}`} collapseId="market" flush>
      {(game.phase === 'night' || game.dayOver) && (
        <Hint tone="night" className="px-3 pt-2">
          {t.market.streetOnly}
        </Hint>
      )}
      {sealed > 0 && game.mission && (
        <Hint tone="info" className="px-3 pt-2">
          {t.travel.sealed(sealed, t.district[game.mission.to].name)}
        </Hint>
      )}
      <BulkSales />
      <FilterBar filters={filters} current={filter} ownedCount={ownedCount} onPick={setPicked} />
      {shown.length === 0 && <Hint className="px-3 pt-2">{t.market.noMatch}</Hint>}
      <ul className="space-y-2 p-2">
        {shown.map((id) => (
          <MarketRow key={id} productId={id} />
        ))}
      </ul>
    </Panel>
  )
}

/** Filtres par soute, tier et tag (chap. 7) : une rangée de pastilles qui défile sur téléphone */
function FilterBar({ filters, current, ownedCount, onPick }: FilterBarProps) {
  const { t } = useI18n()
  const label = (filter: MarketFilter) => {
    switch (filter.kind) {
      case 'all':
        return t.market.filterAll
      case 'owned':
        return t.market.filterOwned(ownedCount)
      case 'tier':
        return t.market.filterTier(filter.tier)
      case 'tag':
        return t.tag[filter.tag].name
    }
  }
  return (
    <div role="group" aria-label={t.market.filters} className="flex gap-1.5 overflow-x-auto px-3 pt-3 pb-1">
      {filters.map((filter) => (
        <Chip key={filterKey(filter)} pressed={filterKey(filter) === filterKey(current)} onClick={() => onPick(filter)}>
          {label(filter)}
        </Chip>
      ))}
    </div>
  )
}

/** Ventes groupées : tout vendre, ou seulement ce qui marge, avec le produit annoncé (chap. 7) */
function BulkSales() {
  // Les ventes se calculent sur l'état entier de la partie (lots, demande, fraîcheur)
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits } = useI18n()
  const revenue = (profitableOnly: boolean) =>
    bulkSales(game, profitableOnly).reduce((total, { productId, qty }) => total + saleQuote(game, productId, qty).total, 0)
  const all = bulkSales(game, false)
  if (all.length === 0) return null
  const profitable = bulkSales(game, true)
  return (
    <div className="flex flex-wrap gap-2 px-3 pt-3">
      <Button variant="primary" disabled={profitable.length === 0} onClick={() => dispatch({ type: 'sellAll', profitableOnly: true })}>
        {t.market.sellProfitable(credits(revenue(true)))}
      </Button>
      <Button variant="danger" onClick={() => dispatch({ type: 'sellAll', profitableOnly: false })}>
        {t.market.sellAll(credits(revenue(false)))}
      </Button>
    </div>
  )
}

function MarketRow({ productId }: MarketRowProps) {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits, signedPercent } = useI18n()

  const product = PRODUCTS[productId]
  const district = game.districtId
  const stock = game.markets[district].stock[productId]
  const owned = ownedQty(game.cargo, productId)
  const cost = averageCost(game.cargo, productId)
  const status = productStatus(game, district, productId)
  // Pourquoi il est en boutique : socle officiel, arrivage du jour (complément neutre), ou arrivage d'un événement (chap. 2)
  const origin =
    stock === undefined || status === 'production' ? null : product.tier === 0 ? 'official' : status === 'strong' ? 'exceptional' : 'arrival'
  const quota = demandQuota(game, district, productId)
  // Tendance : variation depuis le relevé de la veille dans ce district (chap. 2)
  const history = game.memory[district] ?? []
  const yesterday = history.find((seen) => seen.day === game.day - 1)?.quotes[productId]
  const today = quote(game, district, productId)
  const trend = yesterday ? today / yesterday - 1 : null
  const demandLeft = game.markets[district].demand[productId]
  const buyMax = maxBuy(game, productId)
  const sale = owned > 0 ? saleQuote(game, productId, 1) : null
  const saleAll = owned > 0 ? saleQuote(game, productId, owned) : null

  // État des caisses en soute : fraîcheur des périssables, casse des fragiles (chap. 2)
  const conditions = useConditions(productId)
  const iccRestore = PRODUCTS[productId].iccRestore
  const useError = useGameStore((s) => checkUseProduct(s.game, productId))

  const buy = (qty: number) => dispatch({ type: 'buy', productId, qty })
  const sell = (qty: number) => dispatch({ type: 'sell', productId, qty })

  return (
    <li className={`rounded-md border border-l-4 border-line bg-raised/60 px-3 py-2 ${TIER_STYLES[product.tier].stripe}`}>
      <div className="flex items-start gap-2">
        <Thumb id={productId} tier={product.tier} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-xs font-bold ${TIER_STYLES[product.tier].text}`}>T{product.tier}</span>
            <span className="mr-1 font-bold">{t.product[productId].name}</span>
            {status !== 'neutral' && <Chip tone={status === 'strong' ? 'warning' : 'success'}>{t.market.status[status]}</Chip>}
            {origin && <span className="text-xs text-ink-muted">{t.market.origin[origin]}</span>}
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {product.tags.map((tag) => (
              <Chip key={tag}>{t.tag[tag].name}</Chip>
            ))}
          </div>
        </div>
      </div>

      <dl className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5 text-sm sm:grid-cols-4">
        <Field label={t.market.quote}>
          <Detailed breakdown={quoteBreakdown(game, district, productId)} format={credits} />
          {trend !== null && trend !== 0 && (
            <span className={`ml-1 text-xs ${trend > 0 ? 'text-success' : 'text-danger'}`}>{t.market.trend(signedPercent(trend, 0))}</span>
          )}
        </Field>
        <Field label={t.market.stock}>{stock === undefined ? <span className="text-ink-faint">{t.market.notInShop}</span> : stock}</Field>
        <Field label={t.market.demand} hint={t.market.demandHint}>
          {quota === null || demandLeft === undefined
            ? t.market.unlimited
            : t.market.demandLeft(demandLeft, Math.min(quota - demandLeft, demandRefill(quota)))}
        </Field>
        {owned > 0 && conditions.length > 0 && (
          <Field label={t.market.condition} wide>
            {conditions.join(' · ')}
          </Field>
        )}
        <Field label={t.market.owned}>
          {owned}
          {cost !== null && <span className="ml-1 text-xs text-ink-muted">({t.market.averageCost(credits(cost))})</span>}
        </Field>
        {sale?.first && saleAll && (
          <Field label={t.market.sale}>
            <Detailed breakdown={sale.first} format={credits} className="inline-block" />
            {saleAll.saturatedQty > 0 && <span className="ml-1 text-xs text-danger">{t.market.saturated(saleAll.saturatedQty)}</span>}
          </Field>
        )}
        {sale && saleAll && (
          <Field label={t.market.margin} wide>
            <Margin revenue={sale.total} cost={sale.cost} unit={t.market.marginUnit} />
            {owned > 1 && (
              <>
                <span className="ml-2 text-xs text-ink-muted">{t.market.marginAll(owned)}</span>
                <Margin revenue={saleAll.total} cost={saleAll.cost} className="ml-1" />
              </>
            )}
          </Field>
        )}
      </dl>

      <ProductSheet productId={productId} />

      <div className="mt-2 flex flex-wrap gap-1.5">
        {stock !== undefined && <QuantityButtons label={t.market.buy} max={buyMax} onPick={buy} maxLabel={t.market.max} variant="primary" />}
        {owned > 0 && <QuantityButtons label={t.market.sell} max={owned} onPick={sell} maxLabel={t.market.max} variant="danger" />}
        {owned > 0 && iccRestore !== undefined && (
          <span className="flex items-center gap-1.5">
            <Button size="sm" disabled={useError !== null} onClick={() => dispatch({ type: 'useProduct', productId })}>
              {t.market.use}
            </Button>
            <span className="text-xs text-ink-muted">{useError ? t.error[useError] : t.market.iccRestore(iccRestore)}</span>
          </span>
        )}
      </div>
    </li>
  )
}

function Field({ label, hint, wide = false, children }: FieldProps) {
  return (
    <div className={`flex gap-1.5 ${wide ? 'col-span-2' : ''}`}>
      <dt className="flex items-center gap-1 text-ink-faint">
        {label}
        {hint && <Tip label={label} content={hint} />}
      </dt>
      <dd className="flex flex-wrap items-baseline">{children}</dd>
    </div>
  )
}

/** Curseurs d'achat / vente : +1, +5, MAX (chap. 7) */
function QuantityButtons({ label, max, maxLabel, onPick, variant }: QuantityButtonsProps) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-xs text-ink-muted">{label}</span>
      <Button variant={variant} size="sm" disabled={max < 1} aria-label={`${label} 1`} onClick={() => onPick(1)}>
        1
      </Button>
      <Button variant={variant} size="sm" disabled={max < 5} aria-label={`${label} 5`} onClick={() => onPick(5)}>
        5
      </Button>
      <Button variant={variant} size="sm" disabled={max < 1} onClick={() => onPick(max)}>
        {maxLabel} ({max})
      </Button>
    </span>
  )
}
