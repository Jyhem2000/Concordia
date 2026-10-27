import type { GameRecord } from './runner.ts'

/*
 * Rapport de campagne (chap. 9) : agrégats par bot, en Markdown.
 */

export type BotSummary = {
  bot: string
  games: number
  /** Part des parties finies sans défaite (audit passé) */
  survival: number
  defeats: Record<string, number>
  endings: Record<string, number>
  meanScore: number
  medianScore: number
  p10: number
  p90: number
  meanInterceptions: number
  /** Part des trajets arrêtés par un barrage ou un racket */
  interceptionRate: number
  /** Score médian des parties gagnées (audit passé) */
  survivorMedian: number
  meanCustodyDays: number
  medianDebtPaidDay: number | null
  debtPaidShare: number
  purchases: Record<string, number>
  refused: number
  forcedSleeps: number
  violations: string[]
}

const quantile = (sorted: readonly number[], q: number) =>
  sorted.length === 0 ? 0 : sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))]
const mean = (values: readonly number[]) => (values.length === 0 ? 0 : values.reduce((total, value) => total + value, 0) / values.length)
const count = (values: readonly string[]) =>
  values.reduce<Record<string, number>>((tally, value) => ({ ...tally, [value]: (tally[value] ?? 0) + 1 }), {})

export function summarize(records: readonly GameRecord[]): BotSummary {
  const scores = records.map((record) => record.score).sort((a, b) => a - b)
  const paidDays = records.flatMap((record) => (record.debtPaidDay === null ? [] : [record.debtPaidDay])).sort((a, b) => a - b)
  return {
    bot: records[0]?.bot ?? '—',
    games: records.length,
    survival: records.filter((record) => !record.defeat).length / Math.max(1, records.length),
    defeats: count(records.filter((record) => record.defeat).map((record) => record.ending)),
    endings: count(records.filter((record) => !record.defeat).map((record) => record.ending)),
    meanScore: mean(scores),
    medianScore: quantile(scores, 0.5),
    p10: quantile(scores, 0.1),
    p90: quantile(scores, 0.9),
    meanInterceptions: mean(records.map((record) => record.interceptions)),
    interceptionRate:
      records.reduce((total, record) => total + record.interceptions, 0) /
      Math.max(
        1,
        records.reduce((total, record) => total + record.trips, 0),
      ),
    survivorMedian: quantile(
      records
        .filter((record) => !record.defeat)
        .map((record) => record.score)
        .sort((a, b) => a - b),
      0.5,
    ),
    meanCustodyDays: mean(records.map((record) => record.custodyDays)),
    medianDebtPaidDay: paidDays.length > 0 ? quantile(paidDays, 0.5) : null,
    debtPaidShare: paidDays.length / Math.max(1, records.length),
    purchases: count(records.flatMap((record) => [...new Set(record.purchases.map((purchase) => purchase.item))])),
    refused: records.reduce((total, record) => total + record.refused, 0),
    forcedSleeps: records.reduce((total, record) => total + record.forcedSleeps, 0),
    violations: [...new Set(records.flatMap((record) => record.violations.map((violation) => `graine ${record.seed} — ${violation}`)))].slice(0, 20),
  }
}

const pct = (share: number) => `${Math.round(share * 100)} %`
const credits = (amount: number) => `${Math.round(amount).toLocaleString('fr-FR')} ₡`
const tally = (counts: Record<string, number>, games: number) =>
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => `${key} ${pct(value / Math.max(1, games))}`)
    .join(', ') || '—'

/** Tableau Markdown d'une campagne */
export function renderReport(title: string, notes: readonly string[], summaries: readonly BotSummary[]): string {
  const rows = summaries.map(
    (s) =>
      `| ${s.bot} | ${s.games} | ${pct(s.survival)} | ${tally(s.defeats, s.games)} | ${credits(s.meanScore)} | ${credits(s.p10)} / ${credits(s.medianScore)} / ${credits(s.p90)} | ${credits(s.survivorMedian)} | ${pct(s.debtPaidShare)} (J${s.medianDebtPaidDay ?? '—'}) | ${s.meanInterceptions.toFixed(1)} (${pct(s.interceptionRate)} des trajets) | ${s.meanCustodyDays.toFixed(1)} | ${tally(s.purchases, s.games)} |`,
  )
  const defects = summaries.flatMap((s) =>
    s.refused + s.forcedSleeps + s.violations.length === 0
      ? []
      : [
          `* **${s.bot}** : ${s.refused} action(s) refusée(s), ${s.forcedSleeps} sommeil(s) forcé(s), ${s.violations.length} invariant(s) violé(s)${s.violations.length > 0 ? ` : ${s.violations.join(' ; ')}` : ''}`,
        ],
  )
  return [
    `# ${title}`,
    '',
    ...notes.map((note) => `* ${note}`),
    '',
    '| Bot | Parties | Survie | Défaites | Score moyen | Score p10 / médiane / p90 | Score médian des survivants | Dette soldée (jour médian) | Interceptions | Jours de garde à vue | Équipement acheté |',
    '| :--- | ---: | ---: | :--- | ---: | ---: | ---: | ---: | ---: | ---: | :--- |',
    ...rows,
    '',
    '## Défauts relevés',
    defects.length > 0 ? defects.join('\n') : 'Aucun : pas d’action refusée, pas de sommeil forcé, aucun invariant violé.',
    '',
  ].join('\n')
}
