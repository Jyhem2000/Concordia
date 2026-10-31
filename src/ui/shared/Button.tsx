import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { FOCUS_RING } from './focus.ts'
import Tip from './Tip.tsx'

/** `primary` : action principale ; `danger` : action risquée ou destructrice ; `default` : le reste */
export type ButtonVariant = 'default' | 'primary' | 'danger'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  /** `sm` pour les boutons serrés d'une ligne de tableau */
  size?: 'sm' | 'md'
  /** Bouton grisé : la raison s'affiche au survol, au toucher ou au focus, plutôt que sous le bouton */
  reason?: string | null
  /** Bouton actif : ce que fera le clic, en aperçu au survol ou au focus (résultat d'une vente, coût d'un achat) */
  preview?: ReactNode
}

const variants: Record<ButtonVariant, string> = {
  default: 'border-line-strong bg-raised text-ink hover:bg-line-strong',
  primary: 'border-accent bg-accent font-bold text-base hover:bg-accent/85',
  danger: 'border-danger-strong bg-danger-strong font-bold text-white hover:bg-danger-strong/85',
}

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1.5 text-sm',
}

const BASE = 'inline-flex items-center justify-center gap-1.5 rounded-md border uppercase transition-colors'

/** Bouton de l'interface : `type="button"` par défaut pour ne jamais soumettre un formulaire par accident */
export default function Button({ variant = 'default', size = 'md', className = '', reason, preview, ...props }: ButtonProps) {
  // Grisé avec une raison : un déclencheur d'infobulle à l'allure du bouton grisé (un bouton désactivé ne reçoit ni survol ni toucher)
  if (props.disabled && reason)
    return (
      <Tip content={reason} className={`${BASE} opacity-35 ${variants[variant]} ${sizes[size]} ${className}`}>
        {props.children}
      </Tip>
    )
  // Actif avec un aperçu : le déclencheur d'infobulle agit au clic, l'aperçu s'ouvre au survol
  if (!props.disabled && preview && props.onClick)
    return (
      <Tip content={preview} onClick={props.onClick} className={`${BASE} ${variants[variant]} ${sizes[size]} ${className}`}>
        {props.children}
      </Tip>
    )
  return (
    <button
      type="button"
      className={`${BASE} disabled:cursor-not-allowed disabled:opacity-35 ${FOCUS_RING} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}
