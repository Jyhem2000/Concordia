import { mkdirSync, writeFileSync } from 'node:fs'
import { ABLATIONS, renderAblations, runAblation } from './ablation.ts'
import { CAMPAIGNS, runCampaign } from './campaigns.ts'

/*
 * Lance une campagne de simulation (chap. 9) et écrit son rapport dans sim/reports/<campagne>.md.
 * Usage : npm run simulate -- <campagne> [parties par bot]
 * Campagnes : celles de campaigns.ts, plus « retraits » (tests par retrait, campagne 4).
 */

const [name = 'controle', gamesArg = '200'] = process.argv.slice(2)
const games = Number(gamesArg)
const started = Date.now()
const progress = (done: number, total: number) => process.stdout.write(`\r${done}/${total}`)

let report: string
if (name === 'retraits') {
  report = renderAblations(
    ABLATIONS.map((ablation, i) => {
      progress(i + 1, ABLATIONS.length)
      return runAblation(ablation, games)
    }),
    games,
  )
} else {
  const campaign = CAMPAIGNS[name]
  if (!campaign) {
    console.error(`Campagne inconnue : ${name}. Disponibles : ${[...Object.keys(CAMPAIGNS), 'retraits'].join(', ')}`)
    process.exit(1)
  }
  report = runCampaign(campaign, games, (done, total) => {
    if (done % 50 === 0 || done === total) progress(done, total)
  })
}

// Rapports à côté du code de simulation, quel que soit le dossier d'où l'on lance la commande
const reports = new URL('./reports/', import.meta.url)
mkdirSync(reports, { recursive: true })
writeFileSync(new URL(`${name}.md`, reports), report)
console.log(`\nRapport écrit dans sim/reports/${name}.md (${((Date.now() - started) / 1000).toFixed(0)} s)`)
