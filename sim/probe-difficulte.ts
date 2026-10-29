import { BLUFF, BRIBE, ENDINGS, FLEE, PROTECTION, SEARCH } from '../src/data/balance.ts'
import { DISTRICTS } from '../src/data/districts.ts'
import { traderBot, type Objective } from './bots/trader.ts'
import { PLANS, TEMPERAMENTS } from './plans.ts'
import { playGame, type GameRecord } from './runner.ts'

/*
 * Sondes de difficulté : seuils des grandes fins (mutés à l'exécution) et pression de la dette.
 * Usage : node sim/probe-difficulte.ts fins | node sim/probe-difficulte.ts pression <étiquette> [protection=0.2] [risque=0.03] [amende=1.5]
 * Les constantes primitives (START_DEBT, DEBT_DAILY_RATE…) se sondent en modifiant balance.ts le temps d'un passage.
 */
const n = 200
const plan = (name: string) => PLANS.find((p) => p.name === name) ?? PLANS[0]
const [prudent, balanced, bold] = TEMPERAMENTS
const run = (planName: string, temperament = balanced, objective: Objective = 'score') =>
  Array.from({ length: n }, (_, s) => playGame(traderBot(plan(planName), temperament, objective), s + 1))
const pct = (r: GameRecord[], f: (g: GameRecord) => boolean) => `${Math.round((100 * r.filter(f).length) / r.length)} %`
const median = (xs: number[]) => (xs.length ? [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] : NaN)
const k = (x: number) => `${Math.round(x / 1000)}k`

const mode = process.argv[2]

if (mode === 'fins') {
  type Variant = { label: string; mafia: number; elite: number; saboteur: number }
  const variants: Variant[] = [
    { label: 'actuel 200k / 500k / 1M', mafia: 200_000, elite: 500_000, saboteur: 1_000_000 },
    { label: '150k / 300k / 500k', mafia: 150_000, elite: 300_000, saboteur: 500_000 },
    { label: '150k / 250k / 400k', mafia: 150_000, elite: 250_000, saboteur: 400_000 },
    { label: '100k / 200k / 300k', mafia: 100_000, elite: 200_000, saboteur: 300_000 },
  ]
  const bots: { planName: string; objective: Objective }[] = [
    { planName: 'Couverture légale', objective: 'mafia' },
    { planName: 'Citoyen modèle', objective: 'elite' },
    { planName: 'Saboteur', objective: 'saboteur' },
  ]
  for (const v of variants) {
    Object.assign(ENDINGS.mafia, { minScore: v.mafia })
    Object.assign(ENDINGS.elite, { minScore: v.elite })
    Object.assign(ENDINGS.saboteur, { minScore: v.saboteur })
    console.log(`— ${v.label}`)
    for (const b of bots) {
      for (const t of [balanced, bold]) {
        const r = run(b.planName, t, b.objective)
        console.log(
          `  ${`${b.planName} · ${t.name} · ${b.objective}`.padEnd(38)} visée ${pct(r, (g) => g.ending === b.objective).padStart(5)} · survie ${pct(r, (g) => !g.defeat)} · score moyen ${k(r.reduce((a, g) => a + g.score, 0) / n)}`,
        )
      }
    }
  }
}

if (mode === 'pression') {
  const label = process.argv[3] ?? 'actuel'
  const option = (name: string) =>
    process.argv
      .slice(4)
      .find((a) => a.startsWith(`${name}=`))
      ?.split('=')[1]
  if (option('protection')) Object.assign(PROTECTION, { rate: Number(option('protection')) })
  // Risque de base relevé dans tous les districts
  const added = Number(option('risque') ?? 0)
  for (const d of Object.values(DISTRICTS)) Object.assign(d, { baseRisk: d.baseRisk + added })
  // Amendes multipliées (fouille, bluff, corruption, fuite ratés)
  const fine = Number(option('amende') ?? 1)
  for (const rule of [SEARCH.low, SEARCH.high, BRIBE.fail, FLEE.fail]) Object.assign(rule, { fineRate: rule.fineRate * fine })
  Object.assign(BLUFF.failedFine, { low: BLUFF.failedFine.low * fine, high: BLUFF.failedFine.high * fine })
  console.log(`— ${label}`)
  for (const [planName, t] of [
    ['Sans build', prudent],
    ['Sans build', balanced],
    ['Sans build', bold],
    ['Couverture légale', balanced],
    ['Nuit festive', balanced],
  ] as const) {
    const r = run(planName, t)
    const paid = r.filter((g) => g.debtPaidDay !== null).map((g) => g.debtPaidDay as number)
    console.log(
      `  ${`${planName} · ${t.name}`.padEnd(30)} survie ${pct(r, (g) => !g.defeat).padStart(5)} · dette soldée J${median(paid)} (après J7 : ${pct(r, (g) => (g.debtPaidDay ?? 99) > 7)}) · dette max médiane ${k(median(r.map((g) => g.maxDebt)))} · score moyen ${k(r.reduce((a, g) => a + g.score, 0) / n)}`,
    )
  }
}
