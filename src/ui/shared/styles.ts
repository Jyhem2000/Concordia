import { FOCUS_RING } from './focus.ts'
import type { IccTier, Tier } from '../../engine/types.ts'

/** Rôles de couleur de la charte (chap. 7) ; chaque rôle est une variable du thème dans `src/index.css` */
export type Tone = 'neutral' | 'muted' | 'accent' | 'danger' | 'success' | 'warning' | 'info' | 'night' | 'event' | 'cash' | 'offshore' | 'wanted'

/** Texte dans la couleur d'un rôle */
export const TONE_TEXT: Record<Tone, string> = {
  neutral: 'text-ink',
  muted: 'text-ink-muted',
  accent: 'text-accent',
  danger: 'text-danger',
  success: 'text-success',
  warning: 'text-warning',
  info: 'text-info',
  night: 'text-night',
  event: 'text-event',
  cash: 'text-cash',
  offshore: 'text-offshore',
  wanted: 'text-wanted',
}

/** Fond plein d'un rôle (barre de jauge) */
export const TONE_BG: Record<Tone, string> = {
  neutral: 'bg-ink',
  muted: 'bg-ink-muted',
  accent: 'bg-accent',
  danger: 'bg-danger',
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  night: 'bg-night',
  event: 'bg-event',
  cash: 'bg-cash',
  offshore: 'bg-offshore',
  wanted: 'bg-wanted',
}

/** Pastille teintée d'un rôle : bord, fond et texte */
export const TONE_CHIP: Record<Tone, string> = {
  neutral: 'border-line-strong bg-raised text-ink-soft',
  muted: 'border-line bg-panel text-ink-muted',
  accent: 'border-accent/40 bg-accent/10 text-accent',
  danger: 'border-danger/40 bg-danger/10 text-danger',
  success: 'border-success/40 bg-success/10 text-success',
  warning: 'border-warning/40 bg-warning/10 text-warning',
  info: 'border-info/40 bg-info/10 text-info',
  night: 'border-night/40 bg-night/10 text-night',
  event: 'border-event/40 bg-event/10 text-event',
  cash: 'border-cash/40 bg-cash/10 text-cash',
  offshore: 'border-offshore/40 bg-offshore/10 text-offshore',
  wanted: 'border-wanted/40 bg-wanted/10 text-wanted',
}

/** Couleurs d'une caisse (chap. 7) : texte, liseré gauche des lignes de produit, fond teinté au survol, case d'image, emplacement de soute (plein ou caché) */
export type CrateStyle = { text: string; stripe: string; hover: string; tile: string; slot: string; hiddenSlot: string }

export const TIER_STYLES: Record<Tier, CrateStyle> = {
  0: {
    text: 'text-tier-0',
    stripe: 'border-l-tier-0',
    hover: 'hover:bg-tier-0/10',
    tile: 'border-tier-0/50 bg-tier-0/10 text-tier-0',
    slot: 'bg-tier-0',
    hiddenSlot: 'border-tier-0 bg-tier-0/25',
  },
  1: {
    text: 'text-tier-1',
    stripe: 'border-l-tier-1',
    hover: 'hover:bg-tier-1/10',
    tile: 'border-tier-1/50 bg-tier-1/10 text-tier-1',
    slot: 'bg-tier-1',
    hiddenSlot: 'border-tier-1 bg-tier-1/25',
  },
  2: {
    text: 'text-tier-2',
    stripe: 'border-l-tier-2',
    hover: 'hover:bg-tier-2/10',
    tile: 'border-tier-2/50 bg-tier-2/10 text-tier-2',
    slot: 'bg-tier-2',
    hiddenSlot: 'border-tier-2 bg-tier-2/25',
  },
  3: {
    text: 'text-tier-3',
    stripe: 'border-l-tier-3',
    hover: 'hover:bg-tier-3/10',
    tile: 'border-tier-3/50 bg-tier-3/10 text-tier-3',
    slot: 'bg-tier-3',
    hiddenSlot: 'border-tier-3 bg-tier-3/25',
  },
  4: {
    text: 'text-tier-4',
    stripe: 'border-l-tier-4',
    hover: 'hover:bg-tier-4/10',
    tile: 'border-tier-4/50 bg-tier-4/10 text-tier-4',
    slot: 'bg-tier-4',
    hiddenSlot: 'border-tier-4 bg-tier-4/25',
  },
}

/** Couleur de l'ICC selon son palier (chap. 7) */
export const ICC_TONE: Record<IccTier, Tone> = {
  gold: 'success',
  ordinary: 'cash',
  probation: 'warning',
  deviant: 'danger',
}

/** Bulle flottante (infobulle, menu) : placée par Floating UI */
export const BUBBLE = 'z-50 rounded-lg border border-line-strong bg-raised p-2 text-xs text-ink-soft shadow-lg shadow-black/40'

/** Champ de saisie ou liste déroulante */
export const FIELD = `rounded-md border border-line-strong bg-base px-2 py-1 text-sm disabled:opacity-35 ${FOCUS_RING}`

/** Caisses scellées du DSC : hors commerce, en gris plutôt qu'au vert du Tier 0 (chap. 2) */
export const SEALED_STYLE: CrateStyle = {
  text: 'text-ink-muted',
  stripe: 'border-l-ink-faint',
  hover: 'hover:bg-raised',
  tile: 'border-line-strong bg-raised text-ink-muted',
  slot: 'bg-ink-faint',
  hiddenSlot: 'border-ink-faint bg-ink-faint/25',
}
