import { useState } from 'react'
import { PRODUCT_IDS, PRODUCTS } from '../../data/products.ts'
import { ownedQty } from '../../engine/cargo.ts'
import { bluffChance, dropBonus, fleeChance } from '../../engine/interception.ts'
import type { ProductId, Tactics } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import { FOCUS_RING } from '../shared/focus.ts'
import MoveCard from './MoveCard.tsx'

type TacticalMoveProps = {
  label: string
  outcomes: readonly string[]
}

type ToggleProps = {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
}

/** Bluff, avec les aides possibles : caisses données ou sacrifiées à l'agent (chap. 2) */
export function BluffMove({ label, outcomes }: TacticalMoveProps) {
  const game = useGameStore((s) => s.game)
  const { t, signedPercent } = useI18n()
  // Aides cochées : état d'interface éphémère
  const [aids, setAids] = useState<readonly ProductId[]>([])
  const available = PRODUCT_IDS.filter((id) => {
    const aid = PRODUCTS[id].bluffAid
    return aid !== undefined && ownedQty(game.cargo, id) >= aid.crates
  })
  const tactics: Tactics = { bluffAids: aids }
  const toggle = (id: ProductId, checked: boolean) => setAids(checked ? [...aids, id] : aids.filter((aid) => aid !== id))

  return (
    <MoveCard move="bluff" label={label} chance={bluffChance(game, tactics)} outcomes={outcomes} tactics={tactics}>
      {available.map((id) => {
        const aid = PRODUCTS[id].bluffAid
        if (!aid) return null
        const effect = aid.cancelsSmell ? t.interception.cancelsSmell : signedPercent(aid.bonus, 0)
        return (
          <Toggle
            key={id}
            checked={aids.includes(id)}
            label={t.interception.bluffAid(aid.crates, t.product[id].name, effect)}
            onChange={(checked) => toggle(id, checked)}
          />
        )
      })}
    </MoveCard>
  )
}

/** Fuite (ou forcer le passage), avec largage offensif et dopage pilote (chap. 2 et 5) */
export function FleeMove({ label, outcomes }: TacticalMoveProps) {
  const game = useGameStore((s) => s.game)
  const { t, signedPercent } = useI18n()
  // Tactiques choisies : état d'interface éphémère
  const [drop, setDrop] = useState<ProductId | undefined>(undefined)
  const [dope, setDope] = useState<ProductId | undefined>(undefined)
  const droppable = PRODUCT_IDS.filter((id) => dropBonus(id) > 0 && ownedQty(game.cargo, id) > 0)
  const dopes = PRODUCT_IDS.filter((id) => PRODUCTS[id].doping && ownedQty(game.cargo, id) > 0)
  const tactics: Tactics = { drop, dope }

  return (
    <MoveCard move="flee" label={label} chance={fleeChance(game, tactics)} outcomes={outcomes} tactics={tactics}>
      {droppable.length > 0 && (
        <label className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-zinc-400">{t.interception.drop}</span>
          <select
            value={drop ?? ''}
            onChange={(event) => setDrop(droppable.find((id) => id === event.target.value))}
            className={`rounded border border-zinc-700 bg-zinc-950 px-1 py-0.5 ${FOCUS_RING}`}
          >
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

function Toggle({ checked, label, onChange }: ToggleProps) {
  return (
    <label className="flex items-center gap-1.5 text-xs">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className={FOCUS_RING} />
      {label}
    </label>
  )
}
