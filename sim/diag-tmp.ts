import { traderBot } from './bots/trader.ts'
import { PLANS, TEMPERAMENTS } from './plans.ts'
import { playGame, type GameRecord } from './runner.ts'

const n = Number(process.argv[2] ?? 300)
const t = TEMPERAMENTS[Number(process.argv[3] ?? 1)]
const play = (i: number) => Array.from({ length: n }, (_, s) => playGame(traderBot(PLANS[i], t, 'score'), s + 1))
const base = play(0)
const mean = (r: GameRecord[]) => Math.round(r.reduce((a, b) => a + b.score, 0) / n / 1000)
console.log(`${t.name} — Sans build : ${mean(base)}k, survie ${Math.round((100 * base.filter((r) => !r.defeat).length) / n)} %`)
for (let i = 1; i < PLANS.length; i++) {
  const r = play(i)
  const win = r.filter((g, s) => g.score > base[s].score).length
  const tie = r.filter((g, s) => g.score === base[s].score).length
  const purchases: Record<string, number[]> = {}
  for (const g of r) for (const p of g.purchases) (purchases[p.item] ??= []).push(p.day)
  const days = Object.entries(purchases)
    .map(([item, d]) => `${item} ${Math.round((100 * d.length) / n)} % J${d.sort((a, b) => a - b)[Math.floor(d.length / 2)]}`)
    .join(', ')
  console.log(
    `${PLANS[i].name.padEnd(18)} ${mean(r)}k survie ${Math.round((100 * r.filter((g) => !g.defeat).length) / n)} % | bat Sans build ${Math.round((100 * win) / n)} % (égalités ${Math.round((100 * tie) / n)} %) | achats ${days}`,
  )
}
