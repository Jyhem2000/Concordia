import DeliveryCard from './DeliveryCard.tsx'
import { ArrowUpDown, Filter, RotateCcw } from 'lucide-react'
import { useState, type MouseEvent, type ReactNode } from 'react'
import { PRODUCTS } from '../../data/products.ts'
import { TAGS } from '../../data/tags.ts'
import { checkUseProduct, fullRateQty, maxBuy } from '../../engine/actions.ts'
import { ownedQty } from '../../engine/cargo.ts'
import { demandQuota, demandRefill, productStatus, quote, quoteBreakdown, saleQuote, shopProducts } from '../../engine/market.ts'
import { keysOf } from '../../engine/records.ts'
import type { ProductId, TagId, Tier } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Detailed from '../shared/Detailed.tsx'
import Chip from '../shared/Chip.tsx'
import Hint from '../shared/Hint.tsx'
import Margin from '../shared/Margin.tsx'
import Panel from '../shared/Panel.tsx'
import { FIELD, TIER_STYLES } from '../shared/styles.ts'
import Thumb from '../shared/Thumb.tsx'
import CompartmentNotice from '../cargo/CompartmentNotice.tsx'
import ContractCard from '../places/ContractCard.tsx'
import { FOCUS_RING } from '../shared/focus.ts'
import { useConditions } from '../shared/useConditions.ts'
import { MARKET_SORTS, NO_FILTER, passesFilter, sortProducts, type MarketFilter, type MarketSort } from './marketFilter.ts'
import ProductSheet from './ProductSheet.tsx'

type FilterBarProps = {
  /** Tiers et tags présents dans le tableau */
  tiers: readonly Tier[]
  tags: readonly TagId[]
  current: MarketFilter
  onPick: (filter: MarketFilter) => void
  sort: MarketSort
  onSort: (sort: MarketSort) => void
}

type MarketRowProps = {
  productId: ProductId
}

type FieldProps = {
  label: string
  children: ReactNode
}

type TradeControlProps = {
  productId: ProductId
  kind: 'buy' | 'sell'
  /** Caisses au plus : achetables (stock, place, cash) ou en soute */
  max: number
  /** Raccourci de plus après MAX : la vente au plein cours */
  fullRate?: number
}

/** Tableau des cours : la boutique du jour, plus tous les produits en soute (chap. 7) */
export default function MarketPanel() {
  const game = useGameStore((s) => s.game)
  const { t } = useI18n()

  const shop = shopProducts(game.markets[game.districtId])
  // Contrat de la Pègre à livrer ici
  const contractHere = game.contract?.to === game.districtId
  // Les caisses scellées d'une mission ne se vendent pas : elles ont leur propre ligne
  const owned = game.cargo.map((lot) => lot.productId).filter((id) => !PRODUCTS[id].sealed)
  const sealed = game.cargo.reduce((total, lot) => (PRODUCTS[lot.productId].sealed ? total + lot.qty : total), 0)
  // Boutique et soute, sans doublon ; le tri choisi s'applique plus bas
  const rows = [...new Set([...owned, ...shop])]
  // Choix proposés : les tiers et les tags présents dans le tableau, dans l'ordre des données
  const tiers = [...new Set(rows.map((id) => PRODUCTS[id].tier))].sort((a, b) => a - b)
  const tags = keysOf(TAGS).filter((tag) => rows.some((id) => PRODUCTS[id].tags.includes(tag)))
  // Filtres choisis : état d'interface éphémère ; un choix absent du tableau ici (autre district) ne filtre pas
  const [picked, setPicked] = useState<MarketFilter>(NO_FILTER)
  const filter: MarketFilter = {
    tier: picked.tier !== null && tiers.includes(picked.tier) ? picked.tier : null,
    tag: picked.tag !== null && tags.includes(picked.tag) ? picked.tag : null,
  }
  // Tri choisi : état d'interface éphémère ; il ne bouge pas à l'achat (le cours du jour reste le même)
  const [sort, setSort] = useState<MarketSort>('tier')
  const shown = sortProducts(
    rows.filter((id) => passesFilter(filter, id)),
    sort,
    (id) => quote(game, game.districtId, id),
    (id) => t.product[id].name,
  )

  return (
    <Panel
      title={`${t.market.title} — ${t.district[game.districtId].name}`}
      subtitle={t.market.localEconomy(t.district[game.districtId].name)}
      collapseId="market"
      flush
    >
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
      <DeliveryCard />
      <CompartmentNotice className="px-3 pt-2" />
      {contractHere && (
        <div className="px-3 pt-3">
          <ContractCard kind="active" />
        </div>
      )}
      <FilterBar tiers={tiers} tags={tags} current={filter} onPick={setPicked} sort={sort} onSort={setSort} />
      {shown.length === 0 && <Hint className="px-3 pt-2">{t.market.noMatch}</Hint>}
      <ul className="space-y-2 p-2">
        {shown.map((id) => (
          <MarketRow key={id} productId={id} />
        ))}
      </ul>
    </Panel>
  )
}

/** Filtres par tier et par tag, cumulables, avec leur remise à zéro (chap. 7) */
function FilterBar({ tiers, tags, current, onPick, sort, onSort }: FilterBarProps) {
  const { t } = useI18n()
  const active = current.tier !== null || current.tag !== null
  return (
    <div role="group" aria-label={t.market.filters} className="flex flex-wrap items-center gap-2 px-3 pt-3">
      <Filter size={14} aria-hidden="true" className="text-ink-muted" />
      <select
        aria-label={t.market.filterTierLabel}
        value={current.tier ?? ''}
        onChange={(event) => onPick({ ...current, tier: tiers.find((tier) => String(tier) === event.target.value) ?? null })}
        className={FIELD}
      >
        <option value="">{t.market.allTiers}</option>
        {tiers.map((tier) => (
          <option key={tier} value={tier}>
            {t.market.filterTier(tier)}
          </option>
        ))}
      </select>
      <select
        aria-label={t.market.filterTagLabel}
        value={current.tag ?? ''}
        onChange={(event) => onPick({ ...current, tag: tags.find((tag) => tag === event.target.value) ?? null })}
        className={FIELD}
      >
        <option value="">{t.market.allTags}</option>
        {tags.map((tag) => (
          <option key={tag} value={tag}>
            {t.tag[tag].name}
          </option>
        ))}
      </select>
      {active && (
        <Button size="sm" onClick={() => onPick(NO_FILTER)}>
          <RotateCcw size={12} aria-hidden="true" />
          {t.market.resetFilters}
        </Button>
      )}
      <span className="ml-auto flex items-center gap-1.5">
        <ArrowUpDown size={14} aria-hidden="true" className="text-ink-muted" />
        <select
          aria-label={t.market.sortLabel}
          value={sort}
          onChange={(event) => onSort(MARKET_SORTS.find((option) => option === event.target.value) ?? 'tier')}
          className={FIELD}
        >
          {MARKET_SORTS.map((option) => (
            <option key={option} value={option}>
              {t.market.sort[option]}
            </option>
          ))}
        </select>
      </span>
    </div>
  )
}

/**
 * Ligne d'un produit : tout le cartouche ouvre sa fiche (sauf ses boutons). En haut, image, tier, nom, Forte demande et
 * tags ; dessous, cours (et tendance), stock, rachat et, en soute, quantité, vente et marge ; en bas, une barre fixe :
 * acheter contre le bord gauche, vendre contre le bord droit. Les précisions sont dans la fiche.
 */
function MarketRow({ productId }: MarketRowProps) {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits, signedPercent } = useI18n()
  // Fiche ouverte : état d'interface éphémère
  const [open, setOpen] = useState(false)

  const product = PRODUCTS[productId]
  const district = game.districtId
  const stock = game.markets[district].stock[productId]
  const owned = ownedQty(game.cargo, productId)
  const status = productStatus(game, district, productId)
  const quota = demandQuota(game, district, productId)
  // Tendance : variation depuis le relevé de la veille dans ce district (chap. 2)
  const history = game.memory[district] ?? []
  const yesterday = history.find((seen) => seen.day === game.day - 1)?.quotes[productId]
  const today = quote(game, district, productId)
  const trend = yesterday ? today / yesterday - 1 : null
  const demandLeft = game.markets[district].demand[productId]
  const buyMax = maxBuy(game, productId)
  const fullRate = fullRateQty(game, productId)
  const sale = owned > 0 ? saleQuote(game, productId, 1) : null
  const saleAll = owned > 0 ? saleQuote(game, productId, owned) : null

  // État des caisses en soute : signalé en orange, détaillé dans la fiche (chap. 2)
  const conditions = useConditions(productId)
  const iccRestore = PRODUCTS[productId].iccRestore
  const useError = useGameStore((s) => checkUseProduct(s.game, productId))

  // Un clic sur le cartouche ouvre la fiche, sauf sur ses commandes (boutons, infobulles) et dans la fiche elle-même
  const openSheet = (event: MouseEvent<HTMLLIElement>) => {
    if (event.target instanceof Element && event.target.closest('button, select, input, dialog')) return
    setOpen(true)
  }

  return (
    <li
      onClick={openSheet}
      className={`cursor-pointer rounded-md border border-l-4 border-line bg-raised/60 px-2 py-1.5 transition-colors hover:border-line-strong hover:bg-raised ${TIER_STYLES[product.tier].stripe}`}
    >
      <div className="flex items-start gap-2">
        <Thumb id={productId} tier={product.tier} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-xs font-bold ${TIER_STYLES[product.tier].text}`}>T{product.tier}</span>
            {/* Accès clavier à la fiche ; à la souris, tout le cartouche l'ouvre */}
            <button
              type="button"
              aria-haspopup="dialog"
              aria-label={t.market.rowHint(t.product[productId].name)}
              onClick={() => setOpen(true)}
              className={`rounded text-left font-bold text-ink ${FOCUS_RING}`}
            >
              {t.product[productId].name}
            </button>
            {status === 'strong' && <Chip tone="warning">{t.market.status.strong}</Chip>}
            {product.tags.map((tag) => (
              <Chip key={tag}>{t.tag[tag].name}</Chip>
            ))}
          </div>
          <dl className="mt-0.5 flex flex-wrap gap-x-3 text-xs">
            <Field label={t.market.quote}>
              <Detailed breakdown={quoteBreakdown(game, district, productId)} format={credits} className="font-bold text-ink" />
              {trend !== null && trend !== 0 && (
                <span className={`ml-1 ${trend > 0 ? 'text-success' : 'text-danger'}`}>{t.market.trend(signedPercent(trend, 0))}</span>
              )}
            </Field>
            <Field label={t.market.stock}>{stock === undefined ? <span className="text-ink-faint">{t.market.notInShop}</span> : stock}</Field>
            <Field label={t.market.demand}>
              {quota === null || demandLeft === undefined
                ? t.market.unlimited
                : t.market.demandLeft(demandLeft, Math.min(quota - demandLeft, demandRefill(quota)))}
            </Field>
            {owned > 0 && (
              <Field label={t.market.owned}>
                <span className={conditions.length > 0 ? 'text-warning' : ''}>{owned}</span>
              </Field>
            )}
            {sale?.first && saleAll && (
              <Field label={t.market.sale}>
                <Detailed breakdown={sale.first} format={credits} />
                {saleAll.saturatedQty > 0 && <span className="ml-1 text-danger">{t.market.saturated(saleAll.saturatedQty)}</span>}
              </Field>
            )}
            {sale && (
              <Field label={t.market.margin}>
                <Margin revenue={sale.total} cost={sale.cost} unit={t.market.marginUnit} />
              </Field>
            )}
          </dl>
        </div>
      </div>

      {/* Barre d'achat et de vente, toujours à la même place : acheter à gauche, vendre à droite */}
      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-1.5">
        <div>{stock !== undefined && <TradeControl productId={productId} kind="buy" max={buyMax} />}</div>
        <div className="flex flex-wrap items-center gap-1.5">
          {owned > 0 && iccRestore !== undefined && (
            <Button
              size="sm"
              disabled={useError !== null}
              reason={useError ? t.error[useError] : t.market.iccRestore(iccRestore)}
              onClick={() => dispatch({ type: 'useProduct', productId })}
            >
              {t.market.use}
            </Button>
          )}
          {owned > 0 && <TradeControl productId={productId} kind="sell" max={owned} fullRate={fullRate} />}
        </div>
      </div>
      <ProductSheet productId={productId} open={open} onClose={() => setOpen(false)} />
    </li>
  )
}

function Field({ label, children }: FieldProps) {
  return (
    <div className="flex items-baseline gap-1">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="flex flex-wrap items-baseline text-ink-soft">{children}</dd>
    </div>
  )
}

/**
 * Achat ou vente d'un produit (chap. 7) : une quantité (−/+, raccourcis 1, 5, MAX et plein cours qui la remplissent),
 * puis un seul bouton qui annonce le résultat exact de cette quantité : coût de l'achat, ou produit et marge de la vente
 */
function TradeControl({ productId, kind, max, fullRate }: TradeControlProps) {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits, signedCredits } = useI18n()
  // Quantité choisie : état d'interface éphémère, ramenée au maximum du moment
  const [picked, setPicked] = useState(1)
  const qty = Math.max(0, Math.min(picked, max))
  const variant = kind === 'buy' ? 'primary' : 'danger'
  const presets = [
    { label: '1', qty: 1 },
    { label: '5', qty: 5 },
    { label: t.market.max, qty: max },
    ...(kind === 'sell' && fullRate !== undefined && fullRate > 0 && fullRate < max ? [{ label: t.market.fullRateShort, qty: fullRate }] : []),
  ]
  const sale = kind === 'sell' && qty > 0 ? saleQuote(game, productId, qty) : null
  const result =
    kind === 'buy'
      ? t.market.buyFor(qty, credits(quote(game, game.districtId, productId) * qty))
      : sale
        ? t.market.sellFor(qty, credits(sale.total), signedCredits(sale.total - sale.cost))
        : t.market.sellFor(0, credits(0), signedCredits(0))
  const label = kind === 'buy' ? t.market.buy : t.market.sell

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Button size="sm" aria-label={t.market.less(label)} disabled={qty <= 1} onClick={() => setPicked(qty - 1)}>
        −
      </Button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={max}
        value={qty}
        aria-label={t.market.quantity(label, t.product[productId].name)}
        onChange={(event) => setPicked(Math.floor(Number(event.target.value)) || 0)}
        className={`w-12 text-center ${FIELD}`}
      />
      <Button size="sm" aria-label={t.market.more(label)} disabled={qty >= max} onClick={() => setPicked(qty + 1)}>
        +
      </Button>
      {presets.map((preset) => (
        <Button key={preset.label} size="sm" disabled={preset.qty < 1 || preset.qty > max} onClick={() => setPicked(preset.qty)}>
          {preset.label === t.market.max || preset.label === t.market.fullRateShort ? `${preset.label} (${preset.qty})` : preset.label}
        </Button>
      ))}
      <Button
        variant={variant}
        size="sm"
        disabled={qty < 1}
        onClick={() => dispatch(kind === 'buy' ? { type: 'buy', productId, qty } : { type: 'sell', productId, qty })}
      >
        {result}
      </Button>
    </div>
  )
}
