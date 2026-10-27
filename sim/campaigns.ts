import { randomBot } from './bots/random.ts'
import { traderBot } from './bots/trader.ts'
import { NOVICE, NOVICE_TEMPERAMENT, PLANS, TEMPERAMENTS } from './plans.ts'
import { renderReport, summarize } from './report.ts'
import { playGame, type Bot } from './runner.ts'

/*
 * Campagnes de simulation (chap. 9). Chaque bot joue les mêmes graines, pour comparer à hasard égal.
 */

export type Campaign = {
  title: string
  notes: readonly string[]
  /** Fabrique des bots ; `seed` sert aux bots qui tirent leur propre hasard */
  bots: readonly ((seed: number) => Bot)[]
}

export const CAMPAIGNS: Readonly<Record<string, Campaign>> = {
  controle: {
    title: 'Campagne de contrôle — Novice et Aléatoire',
    notes: [
      'Le Novice doit atteindre l’audit sans dette dans la majorité des parties ; l’Aléatoire ne doit jamais bloquer le moteur ni violer un invariant.',
    ],
    bots: [() => traderBot(NOVICE, NOVICE_TEMPERAMENT, 'survive'), (seed) => randomBot(seed)],
  },
  plans: {
    title: 'Campagne 1 — Viabilité des plans (étape 1)',
    notes: ['Chaque plan × les 3 tempéraments, objectif « score maximal ». Plans de l’étape 1 seulement (chap. 9, Mise en œuvre).'],
    bots: PLANS.flatMap((plan) => TEMPERAMENTS.map((temperament) => () => traderBot(plan, temperament, 'score'))),
  },
}

/** Joue une campagne sur les graines 1 à `games` et rend son rapport Markdown */
export function runCampaign(campaign: Campaign, games: number, onProgress?: (done: number, total: number) => void): string {
  const total = campaign.bots.length * games
  let done = 0
  const summaries = campaign.bots.map((makeBot) => {
    const records = Array.from({ length: games }, (_, i) => {
      const record = playGame(makeBot(i + 1), i + 1)
      onProgress?.(++done, total)
      return record
    })
    return summarize(records)
  })
  return renderReport(campaign.title, [...campaign.notes, `${games} parties par bot, graines 1 à ${games}.`], summaries)
}
