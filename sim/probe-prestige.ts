import { ENDINGS, ICC_TIERS } from '../src/data/balance.ts'
import { traderBot, type Objective } from './bots/trader.ts'
import { PLANS, TEMPERAMENTS } from './plans.ts'
import { playGame, type GameRecord } from './runner.ts'

/*
 * Sonde des fins de prestige : quelle condition manque aux parties qui visent l'Élite ou le Fantôme.
 * Usage : node sim/probe-prestige.ts [parties]
 */
const n = Number(process.argv[2] ?? 200)
const [, balanced, bold] = TEMPERAMENTS
const plan = (name: string) => PLANS.find((p) => p.name === name) ?? PLANS[0]
const share = (r: GameRecord[], f: (g: GameRecord) => boolean) => `${Math.round((100 * r.filter(f).length) / r.length)} %`.padStart(5)
const gold = ICC_TIERS.find((tier) => tier.tier === ENDINGS.elite.iccTier)?.min ?? 0

const bots: { planName: string; objective: Objective; conditions: [string, (g: GameRecord) => boolean][] }[] = [
  {
    planName: 'Citoyen modèle',
    objective: 'elite',
    conditions: [
      ['score', (g) => g.score >= ENDINGS.elite.minScore],
      ['parrain', (g) => g.progress.vipOrders >= ENDINGS.elite.sponsorOrders],
      ['ICC Or', (g) => g.progress.icc >= gold],
    ],
  },
  {
    planName: 'Fuite au sommet',
    objective: 'resident',
    conditions: [
      ['score', (g) => g.score >= ENDINGS.resident.minScore],
      ['injection', (g) => g.progress.injections >= ENDINGS.resident.injections],
    ],
  },
]
for (const b of bots) {
  for (const t of [balanced, bold]) {
    const r = Array.from({ length: n }, (_, s) => playGame(traderBot(plan(b.planName), t, b.objective), s + 1))
    const alive = r.filter((g) => !g.defeat)
    const parts = b.conditions.map(([name, f]) => `${name} ${share(alive, f)}`).join(' · ')
    console.log(
      `${`${b.planName} · ${t.name}`.padEnd(28)} visée ${share(r, (g) => g.ending === b.objective)} · survivants (${alive.length}) : ${parts}`,
    )
  }
}
