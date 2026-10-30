import { ClipboardList } from 'lucide-react'
import { useState } from 'react'
import { FINE, ICC_MAX } from '../../data/balance.ts'
import type { InterceptionReport } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Deltas from '../shared/Deltas.tsx'
import Detailed from '../shared/Detailed.tsx'
import Panel from '../shared/Panel.tsx'

type ReportLinesProps = {
  report: InterceptionReport
}

/** Compte rendu chiffré de la dernière option tentée au barrage (transparence, chap. 7) */
export default function InterceptionReportPanel() {
  const report = useGameStore((s) => s.game.interceptionReport)
  const { t } = useI18n()
  // Compte rendu refermé : état d'interface éphémère, le suivant s'affichera de nouveau
  const [dismissed, setDismissed] = useState<InterceptionReport | null>(null)
  if (!report || report === dismissed) return null

  return (
    <Panel tone="report" icon={ClipboardList} title={t.report.title}>
      <ReportLines report={report} />
      {report.over && (
        <Button className="mt-2" onClick={() => setDismissed(report)}>
          {t.report.dismiss}
        </Button>
      )}
    </Panel>
  )
}

function ReportLines({ report }: ReportLinesProps) {
  const { t, credits, signedCredits, signedPercent, percent, number } = useI18n()
  const signed = (value: number) => (value > 0 ? `+${number(value)}` : number(value))
  const deltas = [
    { key: 'cash', label: t.report.cash, value: report.cash, text: signedCredits(report.cash) },
    { key: 'crates', label: t.report.crates, value: report.crates, text: signed(report.crates) },
    { key: 'sacrificed', label: t.report.sacrificed, value: -report.sacrificed, text: number(report.sacrificed) },
    { key: 'icc', label: t.report.icc, value: report.icc, text: signedPercent(report.icc / ICC_MAX, 0) },
    { key: 'health', label: t.report.health, value: report.health, text: signed(report.health) },
    { key: 'chassis', label: t.report.chassis, value: report.chassis, text: signed(report.chassis) },
    { key: 'wanted', label: t.report.wanted, value: report.wanted, text: signed(report.wanted) },
    { key: 'damaged', label: t.report.damaged, value: -report.damaged, text: number(report.damaged) },
    { key: 'exploded', label: t.report.exploded, value: -report.exploded, text: number(report.exploded) },
  ]

  return (
    <ul className="space-y-0.5">
      <li className="flex flex-wrap gap-1.5">
        <span className="font-bold">{t.interception.moves[report.move]}</span>
        {report.success !== null && (
          <span className={report.success ? 'text-success' : 'text-danger'}>{report.success ? t.report.success : t.report.failure}</span>
        )}
        {report.chance && <Detailed breakdown={report.chance} format={(chance) => percent(chance, 0)} />}
      </li>
      <Deltas deltas={deltas} />
      {report.custodyDays > 0 && <li className="text-danger">{t.report.custody(report.custodyDays)}</li>}
      {report.towBill > 0 && <li className="text-danger">{t.report.tow(credits(report.towBill))}</li>}
      {report.unpaidFine > 0 && <li className="text-danger">{t.report.unpaidFine(credits(report.unpaidFine), FINE.unpaidCustodyDays)}</li>}
      {report.jammerSeized && <li className="text-danger">{t.report.jammerSeized}</li>}
      {report.compartment === 'kept' && <li className="text-success">{t.report.compartmentKept(report.hiddenCrates)}</li>}
      {report.compartment === 'found' && <li className="text-danger">{t.report.compartmentFound}</li>}
      <li className="text-ink-soft">{report.over ? t.report.passed : t.report.ongoing}</li>
    </ul>
  )
}
