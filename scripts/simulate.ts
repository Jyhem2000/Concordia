import { mkdirSync, writeFileSync } from 'node:fs'
import { CAMPAIGNS, runCampaign } from '../src/sim/campaigns.ts'

/*
 * Lance une campagne de simulation (chap. 9) et écrit son rapport dans reports/<campagne>.md.
 * Usage : npm run simulate -- <campagne> [parties par bot]
 */

const [name = 'controle', gamesArg = '200'] = process.argv.slice(2)
const campaign = CAMPAIGNS[name]
if (!campaign) {
  console.error(`Campagne inconnue : ${name}. Disponibles : ${Object.keys(CAMPAIGNS).join(', ')}`)
  process.exit(1)
}

const games = Number(gamesArg)
const started = Date.now()
const report = runCampaign(campaign, games, (done, total) => {
  if (done % 50 === 0 || done === total) process.stdout.write(`\r${done}/${total} parties`)
})
mkdirSync('reports', { recursive: true })
writeFileSync(`reports/${name}.md`, report)
console.log(`\nRapport écrit dans reports/${name}.md (${((Date.now() - started) / 1000).toFixed(0)} s)`)
