import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { FOCUS_RING } from './focus.ts'
import Tip from './Tip.tsx'

/** `primary` : action principale ; `danger` : action risquée ou destructrice ; `ranked` : partie classée et classement ; `default` : le reste */
export type ButtonVariant = 'default' | 'primary' | 'danger' | 'ranked'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  /** `sm` pour les boutons serrés d'une ligne de tableau */
  size?: 'sm' | 'md'
  /** Bouton grisé : la raison s'affiche au survol, au toucher ou au focus, plutôt que sous le bouton */
  reason?: string | null
  /** Bouton actif : ce que fera le clic, en aperçu au survol ou au focus (résultat d'une vente, coût d'un achat) */
  preview?: ReactNode
}

/** Couleurs au repos : le bouton principal et le bouton risqué portent un halo de leur couleur (chap. 7) */
const variants: Record<ButtonVariant, string> = {
  default: 'border-line-strong bg-raised text-ink shadow-black/40',
  primary: 'border-accent bg-accent font-bold text-base shadow-accent/20',
  danger: 'border-danger-strong bg-danger-strong font-bold text-white shadow-danger/20',
  ranked: 'border-ranked bg-ranked font-bold text-white shadow-ranked/30',
}

/** Survol d'un bouton actif : il se soulève, s'éclaire et son halo grandit ; il s'enfonce au clic */
const hovers: Record<ButtonVariant, string> = {
  default: 'hover:border-accent/60 hover:text-accent',
  primary: 'hover:bg-cash hover:shadow-accent/40',
  danger: 'hover:bg-danger-strong/90 hover:shadow-danger/40',
  ranked: 'hover:bg-ranked/85 hover:shadow-ranked/50',
}

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1.5 text-sm',
}

const BASE = 'inline-flex items-center justify-center gap-1.5 rounded-md border tracking-wide uppercase shadow-md transition duration-200'
const ACTIVE = 'hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm'
const BLOCKED = 'opacity-35 shadow-none'

/** Bouton de l'interface : `type="button"` par défaut pour ne jamais soumettre un formulaire par accident */
export default function Button({ variant = 'default', size = 'md', className = '', reason, preview, ...props }: ButtonProps) {
  const look = `${BASE} ${variants[variant]} ${sizes[size]}`
  const live = `${ACTIVE} ${hovers[variant]}`
  // Grisé avec une raison : un déclencheur d'infobulle à l'allure du bouton grisé (un bouton désactivé ne reçoit ni survol ni toucher)
  if (props.disabled && reason)
    return (
      <Tip content={reason} cursor="not-allowed" className={`${look} ${BLOCKED} ${className}`}>
        {props.children}
      </Tip>
    )
  // Actif avec un aperçu : le déclencheur d'infobulle agit au clic, l'aperçu s'ouvre au survol
  if (!props.disabled && preview && props.onClick)
    return (
      <Tip content={preview} onClick={props.onClick} cursor="pointer" className={`${look} ${live} ${className}`}>
        {props.children}
      </Tip>
    )
  return (
    <button type="button" className={`${look} ${props.disabled ? `cursor-not-allowed ${BLOCKED}` : live} ${FOCUS_RING} ${className}`} {...props} />
  )
}
