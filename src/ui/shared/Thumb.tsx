import type { Tier } from '../../engine/types.ts'
import { FALLBACK_ICONS, imageUrl, type ImageId } from './images.ts'
import { TIER_STYLES } from './styles.ts'

type ThumbProps = {
  id: ImageId
  /** Tier du produit : couleur de la case ; neutre pour un véhicule ou un module */
  tier?: Tier
  /** `sm` : 40 px, pour les listes ; `lg` : 64 px, pour les fiches */
  size?: 'sm' | 'lg'
}

const sizes = {
  sm: { box: 'h-10 w-10', icon: 20 },
  lg: { box: 'h-16 w-16', icon: 36 },
}

/**
 * Case d'image d'une donnée : son image si elle est déposée (sans cadre, un léger retrait des bords), sinon son icône
 * dans une case à la couleur du tier. Décorative : le nom est écrit à côté
 */
export default function Thumb({ id, tier, size = 'sm' }: ThumbProps) {
  const url = imageUrl(id)
  const Icon = FALLBACK_ICONS[id]
  const tile = tier === undefined ? 'border-line-strong bg-raised text-ink-soft' : TIER_STYLES[tier].tile
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden ${url ? 'p-0.5' : `rounded-md border ${tile}`} ${sizes[size].box}`}
    >
      {url ? <img src={url} alt="" className="h-full w-full object-contain" /> : <Icon size={sizes[size].icon} />}
    </span>
  )
}
