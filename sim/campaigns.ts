import { randomBot } from './bots/random.ts'
import { traderBot } from './bots/trader.ts'
import { NOVICE, NOVICE_TEMPERAMENT, PLANS, TEMPERAMENTS } from './plans.ts'
import { renderReport, renderSpread, summarize } from './report.ts'
import { playGame, type Bot } from './runner.ts'

/*
 * Campagnes de simulation (chap. 9). Chaque bot joue les mêmes graines, pour comparer à hasard égal.
 */

export type Campaign = {
  title: string
  notes: readonly string[]
  /** Fabrique des bots ; `seed` sert aux bots qui tirent leur propre hasard */
  bots: readonly ((seed: number) => Bot)[]
  /** Ajoute la comparaison hasard / choix du joueur (campagne 3) */
  spread?: boolean
}

const plan = (name: string) => PLANS.find((entry) => entry.name === name) ?? PLANS[0]
const balanced = TEMPERAMENTS[1]

export const CAMPAIGNS: Readonly<Record<string, Campaign>> = {
  controle: {
    title: 'Campagne de contrôle — Novice et Aléatoire',
    notes: [
      'Le Novice doit atteindre l’audit sans dette dans la majorité des parties ; l’Aléatoire ne doit jamais bloquer le moteur ni violer un invariant.',
    ],
    bots: [() => traderBot(NOVICE, NOVICE_TEMPERAMENT, 'survive'), (seed) => randomBot(seed)],
  },
  plans: {
    title: 'Campagne 1 — Viabilité des plans',
    notes: ['Chaque plan × les 3 tempéraments, objectif « score maximal » (chap. 9, Mise en œuvre).'],
    bots: PLANS.flatMap((plan) => TEMPERAMENTS.map((temperament) => () => traderBot(plan, temperament, 'score'))),
  },
  fins: {
    title: 'Campagne 2 — Atteignabilité des grandes fins',
    notes: [
      'Pour chaque grande fin, les plans qui la visent naturellement, tempérament équilibré, objectif de la fin : sécuriser une fois le seuil atteint (Baron, Élite), défendre l’ICC au palier Or et servir les commandes VIP du parrain (Élite), engager Glitch, se procurer [T4-06] et l’injecter en tournées de nuit (Résident), se procurer [T4-06] et rejoindre Rust Valley (Saboteur).',
    ],
    bots: [
      ...['Couverture légale', 'Haut tier', 'Rentier'].map((name) => () => traderBot(plan(name), balanced, 'mafia')),
      ...['Citoyen modèle', 'Couverture légale', 'Rentier'].map((name) => () => traderBot(plan(name), balanced, 'elite')),
      ...['Fuite au sommet', 'Rentier'].map((name) => () => traderBot(plan(name), balanced, 'resident')),
      ...['Saboteur', 'Haut tier'].map((name) => () => traderBot(plan(name), balanced, 'saboteur')),
    ],
  },
  hasard: {
    title: 'Campagne 3 — Poids du hasard',
    notes: ['Les plans de référence des campagnes 1 et 2 sur un grand nombre de graines : le score dépend-il plus du joueur que des tirages ?'],
    bots: [
      () => traderBot(plan('Sans build'), TEMPERAMENTS[0], 'score'),
      () => traderBot(plan('Couverture légale'), balanced, 'score'),
      () => traderBot(plan('Rentier'), balanced, 'score'),
      () => traderBot(plan('Haut tier'), TEMPERAMENTS[2], 'score'),
      () => traderBot(plan('Couverture légale'), balanced, 'mafia'),
    ],
    spread: true,
  },
}

/** Joue une campagne sur les graines 1 à `games` et rend son rapport Markdown */
export function runCampaign(campaign: Campaign, games: number, onProgress?: (done: number, total: number) => void): string {
  const total = campaign.bots.length * games
  let done = 0
  const played = campaign.bots.map((makeBot) =>
    Array.from({ length: games }, (_, i) => {
      const record = playGame(makeBot(i + 1), i + 1)
      onProgress?.(++done, total)
      return record
    }),
  )
  const summaries = played.map(summarize)
  const report = renderReport(campaign.title, [...campaign.notes, `${games} parties par bot, graines 1 à ${games}.`], summaries)
  const scores = played.map((records) => records.map((record) => record.score))
  return campaign.spread ? `${report}\n${renderSpread(summaries, scores)}` : report
}
