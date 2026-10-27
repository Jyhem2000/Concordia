import type { ReactNode } from 'react'
import type { Breakdown } from '../../engine/breakdown.ts'
import { checkMove, NO_OFFER } from '../../engine/interception.ts'
import type { InterceptionMove, Tactics } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Detailed from '../shared/Detailed.tsx'

type MoveCardProps = {
  move: InterceptionMove
  label: string
  chance: Breakdown | null
  /** Conséquences annoncées avant de valider (succès, échec) */
  outcomes: readonly string[]
  /** Tactiques choisies, jouées avec l'option */
  tactics?: Tactics
  /** L'option a son propre bouton de validation (offre de corruption) */
  customAction?: boolean
  /** Réglages propres à l'option (aides, largage, offre…), affichés sous les conséquences */
  children?: ReactNode
}

/** Une option du barrage : chance détaillable, conséquences, réglages et bouton (chap. 10) */
export default function MoveCard({ move, label, chance, outcomes, tactics, customAction = false, children }: MoveCardProps) {
  const dispatch = useGameStore((s) => s.dispatch)
  const error = useGameStore((s) => checkMove(s.game, move, NO_OFFER, tactics))
  const { t, percent } = useI18n()

  return (
    <li className="rounded border border-zinc-800 bg-zinc-900/40 p-3 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        {customAction ? (
          <span className="font-bold">{label}</span>
        ) : (
          <Button variant="primary" disabled={error !== null} onClick={() => dispatch({ type: 'intercept', move, tactics })}>
            {label}
          </Button>
        )}
        {chance && (
          <span className="flex gap-1.5">
            <span className="text-zinc-400">{t.interception.chance}</span>
            <Detailed breakdown={chance} format={(value) => percent(value, 0)} />
          </span>
        )}
      </div>
      <ul className="mt-1 space-y-0.5 text-xs text-zinc-400">
        {outcomes.map((outcome) => (
          <li key={outcome}>{outcome}</li>
        ))}
      </ul>
      {children && <div className="mt-2 flex flex-col gap-1">{children}</div>}
      {!customAction && error && error !== 'move-unavailable' && <p className="mt-1 text-xs text-red-300">{t.error[error]}</p>}
    </li>
  )
}
