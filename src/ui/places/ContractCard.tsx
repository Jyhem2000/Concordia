import { Handshake } from 'lucide-react'
import { CONTRACT } from '../../data/locations.ts'
import { checkService } from '../../engine/actions.ts'
import { ownedQty } from '../../engine/cargo.ts'
import { checkAcceptContract, checkDeliverContract } from '../../engine/contracts.ts'
import type { Contract } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Hint from '../shared/Hint.tsx'

type ContractCardProps = {
  /** `offer` : contrat proposé chez Viktor ; `active` : contrat en cours */
  kind: 'offer' | 'active'
}

/** Contrat de la Pègre (chap. 3) : quoi livrer, où, avant quand, pour quelle prime ; accepter ou livrer quand c'est possible */
export default function ContractCard({ kind }: ContractCardProps) {
  // Guichet, soute et district se lisent sur l'état entier
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits, percent } = useI18n()
  const contract: Contract | null = kind === 'offer' ? game.contractOffer : game.contract
  if (!contract) return null
  const owned = ownedQty(game.cargo, contract.productId)
  const acceptError = checkService(game, 'debt') ?? checkAcceptContract(game)
  const deliverError = checkDeliverContract(game)

  return (
    <div className="rounded-md border border-warning/40 bg-warning/10 p-2 text-xs">
      <p className="flex items-center gap-1.5 font-bold text-warning">
        <Handshake size={14} aria-hidden="true" />
        {kind === 'offer' ? t.contract.offerTitle : t.contract.activeTitle}
      </p>
      <p className="mt-1 text-ink-soft">
        {t.contract.terms(
          contract.qty,
          t.product[contract.productId].name,
          t.district[contract.to].name,
          contract.deadline,
          credits(contract.reward),
        )}
      </p>
      <p className={owned >= contract.qty ? 'text-success' : 'text-ink-muted'}>{t.contract.owned(owned, contract.qty)}</p>
      {kind === 'offer' && (
        <>
          <Hint className="mt-1">{t.contract.rule(percent(CONTRACT.failDebtShare, 0))}</Hint>
          <Button size="sm" variant="primary" className="mt-2" disabled={acceptError !== null} onClick={() => dispatch({ type: 'acceptContract' })}>
            {t.contract.accept}
          </Button>
          {acceptError && acceptError !== 'not-at-location' && <Hint className="mt-1">{t.error[acceptError]}</Hint>}
        </>
      )}
      {kind === 'active' && game.districtId === contract.to && (
        <>
          <Button size="sm" variant="primary" className="mt-2" disabled={deliverError !== null} onClick={() => dispatch({ type: 'deliverContract' })}>
            {t.contract.deliver(credits(contract.reward))}
          </Button>
          {deliverError && <Hint className="mt-1">{t.error[deliverError]}</Hint>}
        </>
      )}
    </div>
  )
}
