import { ICC_MAX } from '../../data/balance.ts'
import { requirementProgress, type Unlock } from '../../engine/progress.ts'
import type { Requirement } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'

type LockedProps = {
  requires?: readonly Requirement[]
}

/** Conditions pas encore remplies d'un élément verrouillé, avec la progression vers chacune (chap. 10) */
export default function Locked({ requires = [] }: LockedProps) {
  // La progression se lit sur l'état entier de la partie (carnet, dette, ICC, patrimoine)
  const game = useGameStore((s) => s.game)
  const { t, credits, percent } = useI18n()
  const r = t.requirement
  const describe = (requirement: Requirement, { done, needed }: Unlock): string => {
    switch (requirement.kind) {
      case 'debtPaid':
        return r.debtPaid
      case 'deliveries':
        return r.deliveries(done, needed)
      case 'wanted':
        return r.wanted
      case 'iccTier':
        return r.iccTier(t.iccTier[requirement.tier], percent(done / ICC_MAX, 0))
      case 'wealth':
        return r.wealth(credits(needed), credits(done))
      case 'tagSales':
        return r.tagSales(t.tag[requirement.tag].name, done, needed)
      case 'controls':
        return r.controls(done, needed)
    }
  }
  const missing = requires.flatMap((requirement) => {
    const progress = requirementProgress(game, requirement)
    return progress.unlocked ? [] : [describe(requirement, progress)]
  })
  if (missing.length === 0) return null
  return (
    <ul className="text-xs text-amber-300">
      {missing.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  )
}
