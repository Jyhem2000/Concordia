import { EyeOff } from 'lucide-react'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Hint from '../shared/Hint.tsx'

type CompartmentNoticeProps = {
  className?: string
}

/** Avertissement : des caisses ont quitté le double fond pour un produit plus cher arrivé à l'instant (chap. 4) */
export default function CompartmentNotice({ className = 'mt-2' }: CompartmentNoticeProps) {
  const notice = useGameStore((s) => s.game.compartmentNotice)
  const { t } = useI18n()
  if (!notice) return null
  const crates = notice.displaced.map(({ productId, qty }) => `${qty} ${t.product[productId].name}`).join(', ')
  return (
    <Hint tone="warning" icon={EyeOff} className={className}>
      {t.hold.notice(t.product[notice.productId].name, crates)}
    </Hint>
  )
}
