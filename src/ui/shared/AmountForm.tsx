import { useState, type FormEvent } from 'react'
import { useI18n } from '../../i18n/useI18n.ts'
import Button from './Button.tsx'

type Props = {
  label: string
  max: number
  onSubmit: (amount: number) => void
  variant?: 'default' | 'primary' | 'danger'
  /** Aperçu sous le champ, à partir du montant saisi (ex. somme créditée après commission) */
  preview?: (amount: number) => string | null
}

/** Saisie d'un montant en ₡ avec raccourci MAX, pour les guichets (dette, offshore) */
export default function AmountForm({ label, max, onSubmit, variant = 'primary', preview }: Props) {
  const { t } = useI18n()
  const [value, setValue] = useState('')
  const amount = Math.floor(Number(value))
  const valid = Number.isFinite(amount) && amount > 0 && amount <= max
  const hint = valid && preview ? preview(amount) : null

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!valid) return
    onSubmit(amount)
    setValue('')
  }

  return (
    <form className="flex flex-wrap items-center gap-1.5" onSubmit={submit}>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={max}
        step={1}
        value={value}
        placeholder={t.place.amount}
        aria-label={`${label} — ${t.place.amount}`}
        disabled={max < 1}
        onChange={(event) => setValue(event.target.value)}
        className="w-28 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm disabled:opacity-35"
      />
      <Button disabled={max < 1} onClick={() => setValue(String(max))}>
        {t.place.max}
      </Button>
      <Button type="submit" variant={variant} disabled={!valid}>
        {label}
      </Button>
      {hint && <span className="text-xs text-zinc-400">{hint}</span>}
    </form>
  )
}
