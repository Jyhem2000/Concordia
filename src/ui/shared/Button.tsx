import type { ButtonHTMLAttributes } from 'react'
import { FOCUS_RING } from './focus.ts'

export type ButtonVariant = 'default' | 'primary' | 'danger'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

const variants: Record<ButtonVariant, string> = {
  default: 'border-zinc-600 bg-zinc-800 hover:bg-zinc-700',
  primary: 'border-amber-500 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25',
  danger: 'border-red-500 bg-red-500/15 text-red-200 hover:bg-red-500/25',
}

/** Bouton de l'interface : `type="button"` par défaut pour ne jamais soumettre un formulaire par accident */
export default function Button({ variant = 'default', className = '', ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`rounded border px-2 py-1 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent ${FOCUS_RING} ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
