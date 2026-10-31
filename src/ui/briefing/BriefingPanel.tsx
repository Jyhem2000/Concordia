import { Sunrise } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { ICC_MAX, WANTED } from '../../data/balance.ts'
import type { MorningBriefing } from '../../engine/types.ts'
import { heatWave } from '../../engine/events.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Detailed from '../shared/Detailed.tsx'
import Panel from '../shared/Panel.tsx'
import { allPlacesHere } from '../places/placesHere.ts'

type BriefingLinesProps = {
  briefing: MorningBriefing
}

type BriefingRowProps = {
  label: string
  className: string
  children: ReactNode
}

/** Briefing de 06h00 : ce que la nuit et la routine matinale ont changé (chap. 1 et 7) */
export default function BriefingPanel() {
  const briefing = useGameStore((s) => s.game.briefing)
  const day = useGameStore((s) => s.game.day)
  const isDay = useGameStore((s) => s.game.phase === 'day')
  const { t } = useI18n()
  // Briefing refermé par le joueur : état d'interface éphémère, le suivant s'affichera de nouveau
  const [dismissedDay, setDismissedDay] = useState<number | null>(null)

  if (!briefing || briefing.day !== day || !isDay || dismissedDay === day) return null

  return (
    <Panel tone="highlight" icon={Sunrise} title={t.briefing.title(briefing.day)}>
      <BriefingLines briefing={briefing} />
      <div className="mt-3 flex justify-center">
        <Button onClick={() => setDismissedDay(day)}>{t.briefing.dismiss}</Button>
      </div>
    </Panel>
  )
}

function hasSleepGains({ sleep }: MorningBriefing): boolean {
  return sleep !== null && (sleep.icc > 0 || sleep.health > 0)
}

/** Salaire du matin : payé (en caisses ou non), dispensé en cellule, ou impayé */
function CrewLine({ crew }: { crew: NonNullable<MorningBriefing['crew']> }) {
  const { t, credits } = useI18n()
  const name = t.crew[crew.id].name
  if (crew.paid === null) return <li className="text-danger">{t.briefing.unpaid(name)}</li>
  if (crew.paid === 0) return <li>{t.briefing.salaryCell(name)}</li>
  return (
    <li>
      {crew.crate ? t.briefing.salaryInKind(name, credits(crew.paid), t.product[crew.crate].name) : t.briefing.salary(name, credits(crew.paid))}
    </li>
  )
}

/** Une ligne par effet de la routine, dans son ordre d'application (chap. 1) */
function BriefingLines({ briefing }: BriefingLinesProps) {
  const { t, credits, signedPercent, percent } = useI18n()
  const districtId = useGameStore((s) => s.game.districtId)
  // Effet de canicule du jour, pour nommer le produit qui fond
  const heat = useGameStore((s) => (briefing.heat ? heatWave(s.game) : null))
  // Fiche S montée la veille (fuite, écart de nuit filmé) : rappelée au réveil avec ce qu'elle coûte
  const wanted = useGameStore((s) => s.game.wanted)
  const raised = useGameStore((s) => (s.game.journal.at(-2)?.highlights ?? []).some((highlight) => highlight.kind === 'wanted'))
  const { sleep, custodyHealth, debtInterest, debtLate, protection, offshoreInterest, ventureRaid, ventureInterest } = briefing
  const wokeIn = t.district[briefing.districtId].name
  const places = allPlacesHere(briefing.districtId).map((id) => t.location[id].name)

  return (
    <ul className="space-y-0.5">
      {/* Où la journée commence, et ce qu'on peut y faire */}
      <li className="font-bold">
        {custodyHealth > 0 ? t.briefing.nightCell(wokeIn) : sleep ? t.briefing.nightRelay(wokeIn) : t.briefing.nightBivouac(wokeIn)}
      </li>
      <li className="text-ink-muted">{places.length > 0 ? t.briefing.places(places.join(', ')) : t.briefing.noPlace}</li>
      {sleep && hasSleepGains(briefing) && <li>{t.briefing.sleep(signedPercent(sleep.icc / ICC_MAX, 0), sleep.health)}</li>}
      {custodyHealth > 0 && <li className="text-danger">{t.briefing.custody(custodyHealth)}</li>}
      {briefing.rotten > 0 && <li className="text-danger">{t.briefing.rotten(briefing.rotten)}</li>}
      {heat && (
        <li className="text-danger">
          {t.briefing.heat(t.product[heat.melts].name, briefing.heat?.melted ?? 0, briefing.heat?.aged ?? 0, briefing.heat?.rotten ?? 0)}
        </li>
      )}
      {raised && wanted > 0 && (
        <li className="text-danger">
          {t.briefing.wanted(wanted, WANTED.maxLevel, percent(WANTED.riskPerLevel * wanted, 0), percent(WANTED.fleePenaltyPerLevel * wanted, 0))}
        </li>
      )}
      {briefing.lockedIn && <li className="text-danger">{t.briefing.lockedIn(t.district[districtId].name)}</li>}
      {briefing.crew && <CrewLine crew={briefing.crew} />}
      {briefing.missionReclaimed > 0 && <li className="text-danger">{t.briefing.missionReclaimed(briefing.missionReclaimed)}</li>}
      {briefing.vipFailed && <li className="text-danger">{t.briefing.vipFailed}</li>}
      {briefing.informant && <li className="text-success">{t.briefing.informant}</li>}
      {briefing.crewLost && <li className="text-danger">{t.briefing.crewLost(t.crew[briefing.crewLost].name)}</li>}
      {briefing.recovered && <li>{t.briefing.recovered(briefing.recovered.back, briefing.recovered.lost)}</li>}
      {debtInterest && (
        <li>
          <BriefingRow label={t.briefing.debtInterest} className="text-danger">
            <Detailed breakdown={debtInterest} format={credits} />
          </BriefingRow>
        </li>
      )}
      {debtLate && <li className="text-danger">{t.briefing.debtLate}</li>}
      {protection && (
        <li>
          <BriefingRow label={t.briefing.protection} className="text-danger">
            <Detailed breakdown={protection.due} format={(amount) => `−${credits(amount)}`} />
          </BriefingRow>
        </li>
      )}
      {protection && protection.toDebt > 0 && <li className="text-danger">{t.briefing.protectionToDebt(credits(protection.toDebt))}</li>}
      {offshoreInterest && (
        <li>
          <BriefingRow label={t.briefing.offshoreInterest} className="text-offshore">
            <Detailed breakdown={offshoreInterest} format={(amount) => `+${credits(amount)}`} />
          </BriefingRow>
        </li>
      )}
      {ventureRaid > 0 && <li className="text-danger">{t.briefing.ventureRaid(credits(ventureRaid))}</li>}
      {briefing.contractFailed > 0 && <li className="text-danger">{t.briefing.contractFailed(credits(briefing.contractFailed))}</li>}
      {ventureInterest && (
        <li>
          <BriefingRow label={t.briefing.ventureInterest} className="text-warning">
            <Detailed breakdown={ventureInterest} format={(amount) => `+${credits(amount)}`} />
          </BriefingRow>
        </li>
      )}
    </ul>
  )
}

function BriefingRow({ label, className, children }: BriefingRowProps) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      <span className="text-ink-muted">{label}</span>
      {children}
    </div>
  )
}
