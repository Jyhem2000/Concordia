import type { GameRecord } from './runner.ts'

/*
 * Rapport de campagne (chap. 9) : agrégats par bot, en Markdown.
 */

export type BotSummary = {
  bot: string
  games: number
  /** Part des parties finies sans défaite (audit passé) */
  survival: number
  /** Part des parties finies sans défaite mais à 0 ₡ d'offshore : survivant ruiné */
  ruined: number
  defeats: Record<string, number>
  endings: Record<string, number>
  meanScore: number
  /** Écart-type du score entre graines */
  scoreSpread: number
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
    ruined: records.filter((record) => !record.defeat && record.score === 0).length / Math.max(1, records.length),
    defeats: count(records.filter((record) => record.defeat).map((record) => record.ending)),
    endings: count(records.filter((record) => !record.defeat).map((record) => record.ending)),
    meanScore: mean(scores),
    scoreSpread: Math.sqrt(mean(scores.map((score) => (score - mean(scores)) ** 2))),
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

/**
 * Poids du hasard (campagne 3) : écart-type du score entre graines pour chaque bot, comparé à l'écart entre bots
 * (écart-type des scores moyens). Si le premier domine, le résultat dépend plus des tirages que du jeu.
 */
export function renderSpread(summaries: readonly BotSummary[], scores: readonly (readonly number[])[]): string {
  const means = summaries.map((s) => s.meanScore)
  const average = mean(means)
  const between = Math.sqrt(mean(means.map((value) => (value - average) ** 2)))
  const within = mean(summaries.map((s) => s.scoreSpread))
  return [
    '## Poids du hasard',
    '',
    '| Bot | Score moyen | Écart-type entre graines | p10 / p90 |',
    '| :--- | ---: | ---: | ---: |',
    ...summaries.map((s) => `| ${s.bot} | ${credits(s.meanScore)} | ${credits(s.scoreSpread)} | ${credits(s.p10)} / ${credits(s.p90)} |`),
    '',
    `Écart entre bots (écart-type des scores moyens) : **${credits(between)}** ; écart moyen entre graines : **${credits(within)}**.`,
    within > between
      ? 'Le hasard des graines pèse plus que le choix du plan et du tempérament.'
      : 'Le choix du plan et du tempérament pèse plus que le hasard des graines.',
    '',
    '### À graine égale',
    '',
    'Part des graines où le bot de la ligne fait un meilleur score que celui de la colonne : mêmes tirages, seul le jeu change.',
    '',
    `| Bot | ${summaries.map((_, i) => `${i + 1}`).join(' | ')} |`,
    `| :--- | ${summaries.map(() => '---:').join(' | ')} |`,
    ...summaries.map(
      (s, row) => `| ${row + 1}. ${s.bot} | ${scores.map((other, column) => (column === row ? '—' : pct(beats(scores[row], other)))).join(' | ')} |`,
    ),
    '',
  ].join('\n')
}

/** Part des graines où `a` fait strictement mieux que `b` */
function beats(a: readonly number[], b: readonly number[]): number {
  return a.filter((score, i) => score > (b[i] ?? 0)).length / Math.max(1, a.length)
}

/** Tableau Markdown d'une campagne */
export function renderReport(title: string, notes: readonly string[], summaries: readonly BotSummary[]): string {
  const rows = summaries.map(
    (s) =>
      `| ${s.bot} | ${s.games} | ${pct(s.survival)} | ${pct(s.ruined)} | ${tally(s.defeats, s.games)} | ${tally(s.endings, s.games)} | ${credits(s.meanScore)} | ${credits(s.p10)} / ${credits(s.medianScore)} / ${credits(s.p90)} | ${credits(s.survivorMedian)} | ${pct(s.debtPaidShare)} (J${s.medianDebtPaidDay ?? '—'}) | ${s.meanInterceptions.toFixed(1)} (${pct(s.interceptionRate)} des trajets) | ${s.meanCustodyDays.toFixed(1)} | ${tally(s.purchases, s.games)} |`,
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
    '| Bot | Parties | Survie | dont ruinés à 0 ₡ | Défaites | Fins | Score moyen | Score p10 / médiane / p90 | Score médian des survivants | Dette soldée (jour médian) | Interceptions | Jours de garde à vue | Équipement acheté |',
    '| :--- | ---: | ---: | ---: | :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | :--- |',
    ...rows,
    '',
    '## Défauts relevés',
    defects.length > 0 ? defects.join('\n') : 'Aucun : pas d’action refusée, pas de sommeil forcé, aucun invariant violé.',
    '',
  ].join('\n')
}
