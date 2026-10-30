import { useState, type FormEvent } from 'react'
import { useI18n } from '../../i18n/useI18n.ts'
import { FIELD } from './styles.ts'
import Button, { type ButtonVariant } from './Button.tsx'

type AmountFormProps = {
  label: string
  max: number
  onSubmit: (amount: number) => void
  variant?: ButtonVariant
  /** Aperçu à côté du champ, à partir du montant saisi (ex. somme créditée après commission) */
  preview?: (amount: number) => string
}

/** Saisie d'un montant en ₡ avec raccourci MAX, pour les guichets (dette, offshore) */
export default function AmountForm({ label, max, onSubmit, variant = 'primary', preview }: AmountFormProps) {
  const { t } = useI18n()
  // Saisie en cours : état d'interface éphémère, jamais sauvegardé
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
        className={`w-28 ${FIELD}`}
      />
      <Button disabled={max < 1} aria-label={`${label} — ${t.place.max}`} onClick={() => setValue(String(max))}>
        {t.place.max}
      </Button>
      <Button type="submit" variant={variant} disabled={!valid}>
        {label}
      </Button>
      {hint && <span className="text-xs text-ink-muted">{hint}</span>}
    </form>
  )
}
