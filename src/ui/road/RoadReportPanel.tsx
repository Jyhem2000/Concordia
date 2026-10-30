import { Signpost } from 'lucide-react'
import { useState } from 'react'
import { ICC_MAX } from '../../data/balance.ts'
import type { RoadReport } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Deltas from '../shared/Deltas.tsx'
import Panel from '../shared/Panel.tsx'

/** Compte rendu chiffré du dernier aléa routier (transparence, chap. 7) */
export default function RoadReportPanel() {
  const report = useGameStore((s) => s.game.roadReport)
  const { t, credits, signedCredits, signedPercent, number } = useI18n()
  // Compte rendu refermé : état d'interface éphémère, le suivant s'affichera de nouveau
  const [dismissed, setDismissed] = useState<RoadReport | null>(null)
  if (!report || report === dismissed) return null

  const signed = (value: number) => (value > 0 ? `+${number(value)}` : number(value))
  const deltas = [
    { key: 'cash', label: t.report.cash, value: report.cash, text: signedCredits(report.cash) },
    { key: 'icc', label: t.report.icc, value: report.icc, text: signedPercent(report.icc / ICC_MAX, 0) },
    { key: 'health', label: t.report.health, value: report.health, text: signed(report.health) },
    { key: 'chassis', label: t.report.chassis, value: report.chassis, text: signed(report.chassis) },
    { key: 'fuel', label: t.road.fuelGain, value: report.fuel, text: signed(report.fuel) },
    { key: 'crates', label: t.report.crates, value: report.crates, text: signed(report.crates) },
    { key: 'damaged', label: t.report.damaged, value: -report.damaged, text: number(report.damaged) },
  ]

  return (
    <Panel tone="report" icon={Signpost} title={`${t.road.title} — ${t.event[report.eventId].name}`}>
      <ul className="space-y-0.5">
        <li className="flex flex-wrap gap-1.5">
          <span className="font-bold">{t.road.events[report.eventId][report.choice]}</span>
          {report.won !== null && <span className={report.won ? 'text-success' : 'text-danger'}>{report.won ? t.road.won : t.road.lost}</span>}
        </li>
        <Deltas deltas={deltas} />
        {report.towBill > 0 && <li className="text-danger">{t.report.tow(credits(report.towBill))}</li>}
      </ul>
      <Button className="mt-2" onClick={() => setDismissed(report)}>
        {t.report.dismiss}
      </Button>
    </Panel>
  )
}
