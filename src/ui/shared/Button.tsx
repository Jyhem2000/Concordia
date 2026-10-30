import type { ButtonHTMLAttributes } from 'react'
import { FOCUS_RING } from './focus.ts'

/** `primary` : action principale ; `danger` : action risquée ou destructrice ; `default` : le reste */
export type ButtonVariant = 'default' | 'primary' | 'danger'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  /** `sm` pour les boutons serrés d'une ligne de tableau */
  size?: 'sm' | 'md'
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

/** Bouton de l'interface : `type="button"` par défaut pour ne jamais soumettre un formulaire par accident */
export default function Button({ variant = 'default', size = 'md', className = '', ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 rounded-md border uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${FOCUS_RING} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}
