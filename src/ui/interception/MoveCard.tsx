import type { ReactNode } from 'react'
import type { Breakdown } from '../../engine/breakdown.ts'
import { checkMove, NO_OFFER } from '../../engine/interception.ts'
import type { InterceptionMove, Tactics } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Card from '../shared/Card.tsx'
import Detailed from '../shared/Detailed.tsx'
import Hint from '../shared/Hint.tsx'

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

/** Une option du barrage : chance détaillable, conséquences, réglages et bouton (chap. 7) */
export default function MoveCard({ move, label, chance, outcomes, tactics, customAction = false, children }: MoveCardProps) {
  const dispatch = useGameStore((s) => s.dispatch)
  const error = useGameStore((s) => checkMove(s.game, move, NO_OFFER, tactics))
  const { t, percent } = useI18n()

  return (
    <Card as="li">
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
            <span className="text-ink-muted">{t.interception.chance}</span>
            <Detailed breakdown={chance} format={(value) => percent(value, 0)} />
          </span>
        )}
      </div>
      <ul className="mt-1 space-y-0.5 text-xs text-ink-muted">
        {outcomes.map((outcome) => (
          <li key={outcome}>{outcome}</li>
        ))}
      </ul>
      {children && <div className="mt-2 flex flex-col gap-1">{children}</div>}
      {!customAction && error && error !== 'move-unavailable' && (
        <Hint tone="danger" className="mt-1">
          {t.error[error]}
        </Hint>
      )}
    </Card>
  )
}
