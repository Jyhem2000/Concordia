import type { ReactNode } from 'react'
import type { Breakdown } from '../../engine/breakdown.ts'
import { checkMove, NO_OFFER } from '../../engine/interception.ts'
import type { InterceptionMove, Offer, Tactics } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Card from '../shared/Card.tsx'
import Detailed from '../shared/Detailed.tsx'
import Tip from '../shared/Tip.tsx'

type MoveCardProps = {
  move: InterceptionMove
  label: string
  chance: Breakdown | null
  /** Conséquences annoncées avant de valider (succès, échec) */
  outcomes: readonly string[]
  /** Tactiques choisies, jouées avec l'option */
  tactics?: Tactics
  /** Offre de corruption composée dans la carte */
  offer?: Offer
  /** Quand cette option vaut le coup, en infobulle à côté du bouton */
  info?: string
  /** Réglages propres à l'option (largage, offre…), affichés sous les conséquences */
  children?: ReactNode
}

/** Intitulé d'une conséquence (« Succès », « Échec »…) : en gras, le reste à la suite */
const OUTCOME_HEAD = /^([^:]{1,24}) : (.*)$/s

/** Une option du barrage, toutes présentées pareil : bouton et chance, conséquences, réglages (chap. 7) */
export default function MoveCard({ move, label, chance, outcomes, tactics, offer = NO_OFFER, info, children }: MoveCardProps) {
  const dispatch = useGameStore((s) => s.dispatch)
  const error = useGameStore((s) => checkMove(s.game, move, offer, tactics))
  const { t, percent } = useI18n()

  return (
    <Card as="li">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          disabled={error !== null}
          reason={error && error !== 'move-unavailable' ? t.error[error] : null}
          onClick={() => dispatch({ type: 'intercept', move, tactics, offer })}
        >
          {label}
        </Button>
        {info && <Tip label={label} content={info} />}
        {chance && (
          <span className="ml-auto flex gap-1.5">
            <span className="text-ink-muted">{t.interception.chance}</span>
            <Detailed breakdown={chance} format={(value) => percent(value, 0)} percent className="font-bold" />
          </span>
        )}
      </div>
      <ul className="mt-1.5 space-y-0.5 text-xs text-ink-muted">
        {outcomes.map((outcome) => {
          const head = OUTCOME_HEAD.exec(outcome)
          return (
            <li key={outcome}>
              {head ? (
                <>
                  <span className="font-bold text-ink-soft">{head[1]} :</span> {head[2]}
                </>
              ) : (
                outcome
              )}
            </li>
          )
        })}
      </ul>
      {children && <div className="mt-2 flex flex-col gap-1.5 border-t border-line pt-2">{children}</div>}
    </Card>
  )
}
