import type { ReactNode } from 'react'
import { PRODUCTS } from '../../data/products.ts'
import { FRESHNESS } from '../../data/balance.ts'
import { checkUseProduct, maxBuy } from '../../engine/actions.ts'
import { freshnessOf } from '../../engine/condition.ts'
import { averageCost, ownedQty } from '../../engine/cargo.ts'
import { demandQuota, demandRefill, productStatus, quoteBreakdown, saleQuote, shopProducts } from '../../engine/market.ts'
import type { FreshnessStage, ProductId, Tier } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Detailed from '../shared/Detailed.tsx'
import Margin from '../shared/Margin.tsx'
import ProductSheet from './ProductSheet.tsx'

type MarketRowProps = {
  productId: ProductId
}

type FieldProps = {
  label: string
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

/** Ordre d'affichage des états de fraîcheur */
const FRESHNESS_ORDER: readonly FreshnessStage[] = ['extra', 'standard', 'gamey', 'spoiled']

/** Couleur de chaque tier (chap. 10) */
const tierColors: Record<Tier, string> = {
  0: 'border-green-500 text-green-300',
  1: 'border-yellow-500 text-yellow-300',
  2: 'border-orange-500 text-orange-300',
  3: 'border-red-500 text-red-300',
  4: 'border-violet-500 text-violet-300',
}

/** Tableau des cours : la boutique du jour, plus tous les produits en soute (chap. 10) */
export default function MarketPanel() {
  const game = useGameStore((s) => s.game)
  const { t } = useI18n()

  const shop = shopProducts(game.markets[game.districtId])
  const owned = game.cargo.map((lot) => lot.productId)
  // Produits en soute d'abord, puis la boutique ; par tier puis par ID
  const rows = [...new Set([...owned, ...shop])].sort(
    (a, b) => Number(ownedQty(game.cargo, b) > 0) - Number(ownedQty(game.cargo, a) > 0) || PRODUCTS[a].tier - PRODUCTS[b].tier || a.localeCompare(b),
  )

  return (
    <section className="rounded border border-zinc-800 bg-zinc-900/40">
      <h2 className="border-b border-zinc-800 px-3 py-2 font-bold tracking-wide text-amber-300 uppercase">
        {t.market.title} — {t.district[game.districtId].name}
      </h2>
      {(game.phase === 'night' || game.dayOver) && <p className="px-3 pt-2 text-sm text-indigo-300">{t.market.streetOnly}</p>}
      <ul className="divide-y divide-zinc-800">
        {rows.map((id) => (
          <MarketRow key={id} productId={id} />
        ))}
      </ul>
    </section>
  )
}

function MarketRow({ productId }: MarketRowProps) {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits } = useI18n()

  const product = PRODUCTS[productId]
  const district = game.districtId
  const stock = game.markets[district].stock[productId]
  const owned = ownedQty(game.cargo, productId)
  const cost = averageCost(game.cargo, productId)
  const status = productStatus(district, productId)
  const quota = demandQuota(district, productId)
  const demandLeft = game.markets[district].demand[productId]
  const buyMax = maxBuy(game, productId)
  const sale = owned > 0 ? saleQuote(game, productId, 1) : null
  const saleAll = owned > 0 ? saleQuote(game, productId, owned) : null

  // État des caisses en soute : fraîcheur des périssables, casse des fragiles (chap. 3)
  const lots = game.cargo.filter((lot) => lot.productId === productId)
  const stages = FRESHNESS_ORDER.flatMap((stage) => {
    const qty = lots.reduce((total, lot) => (freshnessOf(game, lot) === stage ? total + lot.qty : total), 0)
    return qty > 0 ? [`${qty} ${t.market.freshness[stage]}`] : []
  })
  const damaged = lots.reduce((total, lot) => (lot.damaged ? total + lot.qty : total), 0)
  const oldest = lots.reduce((min, lot) => (freshnessOf(game, lot) ? Math.min(min, lot.boughtDay) : min), Infinity)
  const rotsIn = Number.isFinite(oldest) ? FRESHNESS.rottenFromAge - (game.day - oldest) : null
  const conditions = [...stages, ...(damaged > 0 ? [`${damaged} ${t.market.damaged}`] : []), ...(rotsIn !== null ? [t.market.rotsIn(rotsIn)] : [])]
  const iccRestore = PRODUCTS[productId].iccRestore
  const useError = useGameStore((s) => checkUseProduct(s.game, productId))

  const buy = (qty: number) => dispatch({ type: 'buy', productId, qty })
  const sell = (qty: number) => dispatch({ type: 'sell', productId, qty })

  return (
    <li className="px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded border px-1 text-xs ${tierColors[product.tier]}`}>T{product.tier}</span>
        <span className="font-bold">{t.product[productId].name}</span>
        {status !== 'neutral' && (
          <span className={`text-xs ${status === 'strong' ? 'text-orange-300' : 'text-green-300'}`}>{t.market.status[status]}</span>
        )}
        {product.tags.map((tag) => (
          <span key={tag} className="rounded bg-zinc-800 px-1 text-xs text-zinc-300">
            {t.tag[tag].name}
          </span>
        ))}
      </div>

      <dl className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5 text-sm sm:grid-cols-4">
        <Field label={t.market.quote}>
          <Detailed breakdown={quoteBreakdown(game, district, productId)} format={credits} />
        </Field>
        <Field label={t.market.stock}>{stock === undefined ? <span className="text-zinc-500">{t.market.notInShop}</span> : stock}</Field>
        <Field label={t.market.demand}>
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
          {cost !== null && <span className="ml-1 text-xs text-zinc-400">({t.market.averageCost(credits(cost))})</span>}
        </Field>
        {sale?.first && saleAll && (
          <Field label={t.market.sale}>
            <Detailed breakdown={sale.first} format={credits} className="inline-block" />
            {saleAll.saturatedQty > 0 && <span className="ml-1 text-xs text-red-300">{t.market.saturated(saleAll.saturatedQty)}</span>}
          </Field>
        )}
        {sale && saleAll && (
          <Field label={t.market.margin} wide>
            <Margin revenue={sale.total} cost={sale.cost} unit={t.market.marginUnit} />
            {owned > 1 && (
              <>
                <span className="ml-2 text-xs text-zinc-400">{t.market.marginAll(owned)}</span>
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
            <Button disabled={useError !== null} onClick={() => dispatch({ type: 'useProduct', productId })}>
              {t.market.use}
            </Button>
            <span className="text-xs text-zinc-400">{useError ? t.error[useError] : t.market.iccRestore(iccRestore)}</span>
          </span>
        )}
      </div>
    </li>
  )
}

function Field({ label, wide = false, children }: FieldProps) {
  return (
    <div className={`flex gap-1.5 ${wide ? 'col-span-2' : ''}`}>
      <dt className="text-zinc-500">{label}</dt>
      <dd className="flex flex-wrap items-baseline">{children}</dd>
    </div>
  )
}

/** Curseurs d'achat / vente : +1, +5, MAX (chap. 10) */
function QuantityButtons({ label, max, maxLabel, onPick, variant }: QuantityButtonsProps) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-xs text-zinc-400">{label}</span>
      <Button variant={variant} disabled={max < 1} aria-label={`${label} 1`} onClick={() => onPick(1)}>
        1
      </Button>
      <Button variant={variant} disabled={max < 5} aria-label={`${label} 5`} onClick={() => onPick(5)}>
        5
      </Button>
      <Button variant={variant} disabled={max < 1} onClick={() => onPick(max)}>
        {maxLabel} ({max})
      </Button>
    </span>
  )
}
