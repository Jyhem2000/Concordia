import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type SceneProps = {
  /** `danger` : barrage ; `accent` : aléa routier */
  tone: 'accent' | 'danger'
  icon: LucideIcon
  title: string
  /** Nom de la scène sous le titre (l'aléa routier rencontré) : le titre reste court, sur une ligne */
  subtitle?: string
  /** Situation, sous le titre */
  intro: ReactNode
  /** Les options, sous la situation */
  children: ReactNode
}

const tones = {
  accent: { box: 'border-accent/40 bg-accent/10', title: 'text-accent' },
  danger: { box: 'border-danger/40 bg-danger/10', title: 'text-danger' },
}

/** Scène qui occupe tout l'écran jusqu'au choix du joueur : la situation, puis les options (chap. 7) */
export default function Scene({ tone, icon: Icon, title, subtitle, intro, children }: SceneProps) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4">
      <section className={`rounded-lg border p-4 ${tones[tone].box}`}>
        <h1 className={`flex items-center gap-2 text-xl font-bold uppercase ${tones[tone].title}`}>
          <Icon size={20} aria-hidden="true" />
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-lg font-bold text-ink">{subtitle}</p>}
        <div className="mt-2 flex flex-col gap-1">{intro}</div>
      </section>
      {children}
    </main>
  )
}
