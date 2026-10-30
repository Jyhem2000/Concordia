import { TAGS } from '../src/data/tags.ts'
import { traderBot } from './bots/trader.ts'
import { PLANS, TEMPERAMENTS } from './plans.ts'
import { playGame, type GameRecord } from './runner.ts'

/*
 * Sonde novice / expert (chap. 8) : un réglage face à l'actuel, sur les mêmes graines, pour savoir si une stratégie
 * redevenue forte gagne dans tous les cas (à corriger) ou seulement bien jouée (à garder).
 * Usage : node sim/probe-expert.ts <étiquette> [legal=0.2] [placement=0] [parties=200]
 *   legal : couverture du Légal ; placement : part de l'épargne placée au Cartel, pour tous les tempéraments.
 * Le plafond des événements (EVENT_MULT_CAP, une primitive) se sonde en modifiant events.ts le temps d'un passage.
 */
const label = process.argv[2] ?? 'actuel'
const option = (name: string) =>
  process.argv
    .slice(3)
    .find((a) => a.startsWith(`${name}=`))
    ?.split('=')[1]
const n = Number(option('parties') ?? 200)
if (option('legal')) Object.assign(TAGS['TAG-LEGAL'], { cover: Number(option('legal')) })
if (option('placement')) for (const t of TEMPERAMENTS) Object.assign(t, { venture: Number(option('placement')) })

const PROBED = ['Sans build', 'Couverture légale', 'Citoyen modèle', 'Nuit festive', 'Corruption', 'Haut tier', 'Opportuniste', 'Saboteur']
const pct = (r: GameRecord[], f: (g: GameRecord) => boolean) => `${Math.round((100 * r.filter(f).length) / r.length)} %`
const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] ?? NaN
const k = (x: number) => `${Math.round(x / 1000)}k`

console.log(`— ${label}`)
for (const t of TEMPERAMENTS) {
  for (const plan of PLANS.filter((p) => PROBED.includes(p.name))) {
    const r = Array.from({ length: n }, (_, s) => playGame(traderBot(plan, t, 'score'), s + 1))
    const scores = r.map((g) => g.score)
    console.log(
      `  ${`${plan.name} · ${t.name}`.padEnd(32)} survie ${pct(r, (g) => !g.defeat).padStart(5)} · score moyen ${k(scores.reduce((a, x) => a + x, 0) / n).padStart(5)} · médian ${k(median(scores)).padStart(5)}`,
    )
  }
}
