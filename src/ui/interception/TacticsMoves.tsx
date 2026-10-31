import { useState } from 'react'
import { BRIBE } from '../../data/balance.ts'
import { PRODUCT_IDS, PRODUCTS } from '../../data/products.ts'
import { averageCost, ownedQty } from '../../engine/cargo.ts'
import { paymentValue } from '../../engine/condition.ts'
import {
  bluffAids,
  bluffChance,
  bribeChance,
  bribeRate,
  dropBonus,
  fleeChance,
  isBribeGift,
  minimumOffer,
  offerValue,
} from '../../engine/interception.ts'
import type { Offer, ProductId, Tactics } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Detailed from '../shared/Detailed.tsx'
import { FOCUS_RING } from '../shared/focus.ts'
import Hint from '../shared/Hint.tsx'
import { FIELD, TIER_STYLES } from '../shared/styles.ts'
import Thumb from '../shared/Thumb.tsx'
import Tip from '../shared/Tip.tsx'
import MoveCard from './MoveCard.tsx'

type TacticalMoveProps = {
  label: string
  outcomes: readonly string[]
  info?: string
}

type ToggleProps = {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
}

type CrateOfferRowProps = {
  productId: ProductId
  qty: number
  onChange: (qty: number) => void
}

/** Bluff : les aides en soute (manuels, odeur couverte) jouent d'elles-mêmes, sans rien donner (chap. 5) */
export function BluffMove({ label, outcomes, info }: TacticalMoveProps) {
  const game = useGameStore((s) => s.game)
  const { t, signedPercent } = useI18n()
  const aids = bluffAids(game).flatMap((id) => {
    const aid = PRODUCTS[id].bluffAid
    return aid ? [t.interception.bluffAid(t.product[id].name, aid.cancelsSmell ? t.interception.cancelsSmell : signedPercent(aid.bonus, 0))] : []
  })

  return (
    <MoveCard move="bluff" label={label} chance={bluffChance(game)} outcomes={outcomes} info={info}>
      {aids.length > 0 && <Hint tone="success">{t.interception.bluffAids(aids.join(' · '))}</Hint>}
    </MoveCard>
  )
}

/** Fuite (ou forcer le passage), avec largage offensif et dopage pilote (chap. 2 et 5) */
export function FleeMove({ label, outcomes, info }: TacticalMoveProps) {
  const game = useGameStore((s) => s.game)
  const { t, signedPercent } = useI18n()
  // Tactiques choisies : état d'interface éphémère
  const [drop, setDrop] = useState<ProductId | undefined>(undefined)
  const [dope, setDope] = useState<ProductId | undefined>(undefined)
  const droppable = PRODUCT_IDS.filter((id) => dropBonus(id) > 0 && ownedQty(game.cargo, id) > 0)
  const dopes = PRODUCT_IDS.filter((id) => PRODUCTS[id].doping && ownedQty(game.cargo, id) > 0)
  const tactics: Tactics = { drop, dope }

  return (
    <MoveCard move="flee" label={label} chance={fleeChance(game, tactics)} outcomes={outcomes} tactics={tactics} info={info}>
      {droppable.length > 0 && (
        <label className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-ink-muted">{t.interception.drop}</span>
          <select value={drop ?? ''} onChange={(event) => setDrop(droppable.find((id) => id === event.target.value))} className={FIELD}>
            <option value="">{t.interception.noDrop}</option>
            {droppable.map((id) => (
              <option key={id} value={id}>
                {t.interception.dropOption(t.product[id].name, signedPercent(dropBonus(id), 0))}
              </option>
            ))}
          </select>
        </label>
      )}
      {dopes.map((id) => {
        const doping = PRODUCTS[id].doping
        if (!doping) return null
        return (
          <Toggle
            key={id}
            checked={dope === id}
            label={t.interception.dope(t.product[id].name, signedPercent(doping.fleeBonus, 0), doping.chassisLoss, doping.iccLoss)}
            onChange={(checked) => setDope(checked ? id : undefined)}
          />
        )
      })}
    </MoveCard>
  )
}

/**
 * Corruption (chap. 5) : une offre de Cash-Puce et de caisses de Luxe, comparée au tarif standard de l'agent ; la chance
 * se met à jour en temps réel. Le Cash-Puce proposé démarre au tarif standard, sans jamais dépasser ce que le joueur a.
 */
export function BribeMove({ label, outcomes, info }: TacticalMoveProps) {
  const game = useGameStore((s) => s.game)
  const { t, credits, percent } = useI18n()
  const rate = bribeRate(game)
  const minimum = minimumOffer(game)
  // Offre en cours de composition : état d'interface éphémère
  const [cashValue, setCashValue] = useState(String(Math.min(game.cash, rate.total)))
  const [crates, setCrates] = useState<Partial<Record<ProductId, number>>>({})

  const offeredCrates = PRODUCT_IDS.flatMap((productId) => {
    const qty = crates[productId] ?? 0
    return qty > 0 ? [{ productId, qty }] : []
  })
  const cash = Math.floor(Number(cashValue))
  const offer: Offer = { cash: Number.isFinite(cash) ? cash : -1, crates: offeredCrates }
  const cratesValue = paymentValue(game, offeredCrates)
  const presets = [BRIBE.minOfferRatio, ...BRIBE.offerBonuses.map(({ ratio }) => ratio)]
  // Seul le Luxe s'offre à un agent
  const gifts = [...new Set(game.cargo.map((lot) => lot.productId))].filter(isBribeGift)
  const setQty = (productId: ProductId, qty: number) => setCrates((current) => ({ ...current, [productId]: qty }))

  return (
    <MoveCard move="bribe" label={label} chance={bribeChance(game, offer)} outcomes={outcomes} offer={offer} info={info}>
      <p className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-ink-muted">{t.interception.bribeRate}</span>
        <Detailed breakdown={rate} format={credits} />
        <Tip label={t.interception.bribeRate} content={t.interception.bribeRateInfo(credits(minimum))} />
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-ink-muted">{t.interception.offerCash}</span>
        {presets.map((ratio) => {
          const amount = Math.max(0, Math.round(rate.total * ratio) - cratesValue)
          return (
            <Button key={ratio} size="sm" disabled={amount > game.cash} onClick={() => setCashValue(String(amount))}>
              {percent(ratio, 0)}
            </Button>
          )
        })}
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={game.cash}
          step={1}
          value={cashValue}
          aria-label={t.interception.offerCash}
          onChange={(event) => setCashValue(event.target.value)}
          className={`w-28 ${FIELD}`}
        />
      </div>
      {gifts.length > 0 ? (
        <div>
          <p className="text-xs text-ink-muted">{t.interception.offerCrates}</p>
          <ul className="mt-1 flex flex-col gap-1">
            {gifts.map((productId) => (
              <CrateOfferRow key={productId} productId={productId} qty={crates[productId] ?? 0} onChange={(qty) => setQty(productId, qty)} />
            ))}
          </ul>
        </div>
      ) : (
        <Hint>{t.interception.noGift}</Hint>
      )}
      <p className="text-xs text-ink-soft">{t.interception.offerTotal(credits(offerValue(game, offer)))}</p>
    </MoveCard>
  )
}

/** Une ligne de caisses de Luxe à offrir, dans la couleur de son tier : valeur en paiement, prix d'achat, gain ou perte face au cash */
function CrateOfferRow({ productId, qty, onChange }: CrateOfferRowProps) {
  const owned = useGameStore((s) => ownedQty(s.game.cargo, productId))
  const cost = useGameStore((s) => averageCost(s.game.cargo, productId) ?? 0)
  const { t, credits, signedCredits } = useI18n()
  const product = PRODUCTS[productId]
  const value = product.basePrice
  const gain = value - cost

  return (
    <li
      className={`flex flex-wrap items-center gap-1.5 rounded-md border border-l-4 border-line bg-raised/60 px-2 py-1 text-xs ${TIER_STYLES[product.tier].stripe}`}
    >
      <Thumb id={productId} tier={product.tier} />
      <span className={`font-bold ${TIER_STYLES[product.tier].text}`}>T{product.tier}</span>
      <span className="font-bold">{t.product[productId].name}</span>
      <span className="text-ink-muted">{t.interception.crateValue(credits(value), credits(Math.round(cost)))}</span>
      <span className={gain >= 0 ? 'text-success' : 'text-danger'}>{t.interception.crateGain(signedCredits(Math.round(gain)))}</span>
      <span className="ml-auto flex items-center gap-1">
        <Button size="sm" aria-label={t.interception.removeCrate(t.product[productId].name)} disabled={qty <= 0} onClick={() => onChange(qty - 1)}>
          −
        </Button>
        <span className="w-10 text-center">
          {qty}/{owned}
        </span>
        <Button size="sm" aria-label={t.interception.addCrate(t.product[productId].name)} disabled={qty >= owned} onClick={() => onChange(qty + 1)}>
          +
        </Button>
      </span>
    </li>
  )
}

function Toggle({ checked, label, onChange }: ToggleProps) {
  return (
    <label className="flex items-center gap-1.5 text-xs">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className={FOCUS_RING} />
      {label}
    </label>
  )
}
