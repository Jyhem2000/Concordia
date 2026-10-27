import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'danger'
}

const variants = {
  default: 'border-zinc-600 bg-zinc-800 hover:bg-zinc-700',
  primary: 'border-amber-500 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25',
  danger: 'border-red-500 bg-red-500/15 text-red-200 hover:bg-red-500/25',
}

export default function Button({ variant = 'default', className = '', ...props }: Props) {
  return (
    <button
      type="button"
      className={`rounded border px-2 py-1 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
