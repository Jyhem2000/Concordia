export type Delta = {
  key: string
  label: string
  /** Signe de l'écart : un gain en vert, une perte en rouge ; zéro n'est pas affiché */
  value: number
  text: string
}

type DeltasProps = {
  deltas: readonly Delta[]
}

/** Écarts chiffrés d'un compte rendu (₡, ICC, Santé, caisses…) : seuls ceux qui ont bougé */
export default function Deltas({ deltas }: DeltasProps) {
  return (
    <>
      {deltas
        .filter(({ value }) => value !== 0)
        .map(({ key, label, text, value }) => (
          <li key={key} className={`flex gap-1.5 ${value < 0 ? 'text-danger' : 'text-success'}`}>
            <span className="text-ink-muted">{label}</span>
            {text}
          </li>
        ))}
    </>
  )
}
