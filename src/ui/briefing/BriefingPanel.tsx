import { Sunrise } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { ICC_MAX } from '../../data/balance.ts'
import type { MorningBriefing } from '../../engine/types.ts'
import { heatWave } from '../../engine/events.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Detailed from '../shared/Detailed.tsx'

type BriefingLinesProps = {
  briefing: MorningBriefing
}

type BriefingRowProps = {
  label: string
  className: string
  children: ReactNode
}

/** Briefing de 06h00 : ce que la nuit et la routine matinale ont changé (chap. 2 et 10) */
export default function BriefingPanel() {
  const briefing = useGameStore((s) => s.game.briefing)
  const day = useGameStore((s) => s.game.day)
  const isDay = useGameStore((s) => s.game.phase === 'day')
  const { t } = useI18n()
  // Briefing refermé par le joueur : état d'interface éphémère, le suivant s'affichera de nouveau
  const [dismissedDay, setDismissedDay] = useState<number | null>(null)

  if (!briefing || briefing.day !== day || !isDay || dismissedDay === day || isEmpty(briefing)) return null

  return (
    <section className="rounded border border-amber-700/60 bg-amber-950/20 p-3 text-sm">
      <h2 className="flex items-center gap-1.5 font-bold text-amber-300 uppercase">
        <Sunrise size={14} aria-hidden="true" />
        {t.briefing.title(briefing.day)}
      </h2>
      <BriefingLines briefing={briefing} />
      <Button className="mt-2" onClick={() => setDismissedDay(day)}>
        {t.briefing.dismiss}
      </Button>
    </section>
  )
}

function hasSleepGains({ sleep }: MorningBriefing): boolean {
  return sleep !== null && (sleep.icc > 0 || sleep.health > 0)
}

/** Vrai si la nuit n'a rien changé qui mérite d'être signalé */
function isEmpty(briefing: MorningBriefing): boolean {
  return (
    !hasSleepGains(briefing) &&
    briefing.custodyHealth === 0 &&
    briefing.rotten === 0 &&
    !briefing.heat &&
    !briefing.lockedIn &&
    !briefing.recovered &&
    !briefing.debtInterest &&
    briefing.beating === 0 &&
    !briefing.debtLate &&
    !briefing.protection &&
    !briefing.offshoreInterest
  )
}

/** Une ligne par effet de la routine, dans son ordre d'application (chap. 2) */
function BriefingLines({ briefing }: BriefingLinesProps) {
  const { t, credits, signedPercent } = useI18n()
  const districtId = useGameStore((s) => s.game.districtId)
  // Effet de canicule du jour, pour nommer le produit qui fond
  const heat = useGameStore((s) => (briefing.heat ? heatWave(s.game) : null))
  const { sleep, custodyHealth, debtInterest, beating, debtLate, protection, offshoreInterest } = briefing

  return (
    <ul className="mt-1 space-y-0.5">
      {sleep && hasSleepGains(briefing) && <li>{t.briefing.sleep(signedPercent(sleep.icc / ICC_MAX, 0), sleep.health)}</li>}
      {custodyHealth > 0 && <li className="text-red-300">{t.briefing.custody(custodyHealth)}</li>}
      {briefing.rotten > 0 && <li className="text-red-300">{t.briefing.rotten(briefing.rotten)}</li>}
      {heat && (
        <li className="text-red-300">
          {t.briefing.heat(t.product[heat.melts].name, briefing.heat?.melted ?? 0, briefing.heat?.aged ?? 0, briefing.heat?.rotten ?? 0)}
        </li>
      )}
      {briefing.lockedIn && <li className="text-red-300">{t.briefing.lockedIn(t.district[districtId].name)}</li>}
      {briefing.recovered && <li>{t.briefing.recovered(briefing.recovered.back, briefing.recovered.lost)}</li>}
      {debtInterest && (
        <li>
          <BriefingRow label={t.briefing.debtInterest} className="text-red-300">
            <Detailed breakdown={debtInterest} format={credits} />
          </BriefingRow>
        </li>
      )}
      {beating > 0 && <li className="text-red-300">{t.briefing.beating(beating)}</li>}
      {debtLate && <li className="text-red-300">{t.briefing.debtLate}</li>}
      {protection && (
        <li>
          <BriefingRow label={t.briefing.protection} className="text-red-300">
            <Detailed breakdown={protection.due} format={(amount) => `−${credits(amount)}`} />
          </BriefingRow>
        </li>
      )}
      {protection && protection.toDebt > 0 && <li className="text-red-300">{t.briefing.protectionToDebt(credits(protection.toDebt))}</li>}
      {offshoreInterest && (
        <li>
          <BriefingRow label={t.briefing.offshoreInterest} className="text-cyan-300">
            <Detailed breakdown={offshoreInterest} format={(amount) => `+${credits(amount)}`} />
          </BriefingRow>
        </li>
      )}
    </ul>
  )
}

function BriefingRow({ label, className, children }: BriefingRowProps) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      <span className="text-zinc-400">{label}</span>
      {children}
    </div>
  )
}
