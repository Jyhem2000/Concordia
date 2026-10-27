import { Sunrise } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Detailed from '../shared/Detailed.tsx'

/** Briefing de 06h00 : ce que la nuit et la routine matinale ont changé (chap. 2 et 9) */
export default function BriefingPanel() {
  const game = useGameStore((s) => s.game)
  const { t, credits, signedPercent } = useI18n()
  // Jour du briefing refermé par le joueur : le suivant s'affichera de nouveau
  const [dismissedDay, setDismissedDay] = useState<number | null>(null)
  const briefing = game.briefing

  if (!briefing || briefing.day !== game.day || game.phase !== 'day' || dismissedDay === game.day) return null

  const lines: ReactNode[] = []
  if (briefing.sleep && (briefing.sleep.icc > 0 || briefing.sleep.health > 0))
    lines.push(t.briefing.sleep(signedPercent(briefing.sleep.icc / 100, 0), briefing.sleep.health))
  if (briefing.debtInterest) {
    lines.push(
      <Row label={t.briefing.debtInterest} className="text-red-300">
        <Detailed breakdown={briefing.debtInterest} format={credits} />
      </Row>,
    )
  }
  if (briefing.beating > 0) lines.push(<span className="text-red-300">{t.briefing.beating(briefing.beating)}</span>)
  if (briefing.debtLate) lines.push(<span className="text-red-300">{t.briefing.debtLate}</span>)
  if (briefing.protection) {
    lines.push(
      <Row label={t.briefing.protection} className="text-red-300">
        <Detailed breakdown={briefing.protection.due} format={(amount) => `−${credits(amount)}`} />
      </Row>,
    )
    if (briefing.protection.toDebt > 0)
      lines.push(<span className="text-red-300">{t.briefing.protectionToDebt(credits(briefing.protection.toDebt))}</span>)
  }
  if (briefing.offshoreInterest) {
    lines.push(
      <Row label={t.briefing.offshoreInterest} className="text-cyan-300">
        <Detailed breakdown={briefing.offshoreInterest} format={(amount) => `+${credits(amount)}`} />
      </Row>,
    )
  }
  if (lines.length === 0) return null

  return (
    <section className="rounded border border-amber-700/60 bg-amber-950/20 p-3 text-sm">
      <h2 className="flex items-center gap-1.5 font-bold text-amber-300 uppercase">
        <Sunrise size={14} />
        {t.briefing.title(briefing.day)}
      </h2>
      <ul className="mt-1 space-y-0.5">
        {lines.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
      <Button className="mt-2" onClick={() => setDismissedDay(game.day)}>
        {t.briefing.dismiss}
      </Button>
    </section>
  )
}

function Row({ label, className, children }: { label: string; className: string; children: ReactNode }) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      <span className="text-zinc-400">{label}</span>
      {children}
    </div>
  )
}
