import type { ModuleId } from '../src/engine/types.ts'
import { traderBot, type Objective, type PlaceUse, type Plan, type Temperament } from './bots/trader.ts'
import { PLANS, TEMPERAMENTS } from './plans.ts'
import { playGame, type Bot, type GameRecord } from './runner.ts'

/*
 * Tests par retrait (chap. 9, campagne 4) : chaque élément est mesuré dans le plan qui le vise,
 * joué avec puis sans lui sur les mêmes graines ; les écarts se lisent partie par partie.
 */

export type Ablation = {
  /** Élément mesuré (ID de donnée ou nom du lieu) */
  element: string
  /** Plan de référence */
  base: string
  with: () => Bot
  without: () => Bot
  /** L'élément a servi dans la partie jouée avec lui (achat ou usage) */
  used: (record: GameRecord) => boolean
}

const plan = (name: string): Plan => {
  const found = PLANS.find((candidate) => candidate.name === name)
  if (!found) throw new Error(`Plan inconnu : ${name}`)
  return found
}
const temperament = (name: string): Temperament => {
  const found = TEMPERAMENTS.find((candidate) => candidate.name === name)
  if (!found) throw new Error(`Tempérament inconnu : ${name}`)
  return found
}

const bought = (item: string) => (record: GameRecord) => record.purchases.some((purchase) => purchase.item === item)
const usedService = (key: string) => (record: GameRecord) => (record.services[key] ?? 0) > 0

/** Une paire : le plan tel quel, puis le plan sans l'élément */
function pair(
  element: string,
  base: Plan,
  mood: string,
  without: Plan,
  used: (record: GameRecord) => boolean,
  objective: Objective = 'score',
): Ablation {
  return {
    element,
    base: `${base.name} · ${mood}`,
    with: () => traderBot(base, temperament(mood), objective),
    without: () => traderBot(without, temperament(mood), objective),
    used,
  }
}

const withoutModule = (base: Plan, id: ModuleId): Plan => ({ ...base, modules: base.modules.filter((module) => module !== id) })
const withPlaces = (base: Plan, extra: readonly PlaceUse[]): Plan => ({ ...base, places: ['grinder', 'advance', ...extra] })

/** Plan dédié au brouilleur de drones : fuite au sommet (chap. 9, étape 2 pour ses autres réglages) */
const FLIGHT: Plan = { name: 'Fuite au sommet', modules: ['MOD-06', 'MOD-09'], crew: 'CREW-02', runner: true }
/** Plan de nuit avec la plaque rotative */
const NIGHT_PLATE: Plan = { name: 'Nuit festive + plaque', modules: ['MOD-04', 'MOD-06', 'MOD-05'], nightOwl: true, runner: true }

export const ABLATIONS: readonly Ablation[] = [
  // Véhicules
  pair('VEH-02', plan('Couverture légale'), 'Équilibré', { ...plan('Couverture légale'), vehicle: undefined }, bought('VEH-02')),
  pair('VEH-03', plan('Chaîne du froid'), 'Équilibré', { ...plan('Chaîne du froid'), vehicle: undefined }, bought('VEH-03')),
  pair('VEH-04', plan('Haut tier'), 'Casse-cou', { ...plan('Haut tier'), vehicle: undefined }, bought('VEH-04')),
  // Modules
  pair('MOD-01', plan('Chaîne du froid'), 'Équilibré', withoutModule(plan('Chaîne du froid'), 'MOD-01'), bought('MOD-01')),
  pair('MOD-02', plan('Couverture légale'), 'Équilibré', withoutModule(plan('Couverture légale'), 'MOD-02'), bought('MOD-02')),
  pair('MOD-03', plan('Électronique'), 'Équilibré', withoutModule(plan('Électronique'), 'MOD-03'), bought('MOD-03')),
  pair('MOD-04', plan('Nuit festive'), 'Équilibré', withoutModule(plan('Nuit festive'), 'MOD-04'), bought('MOD-04')),
  pair('MOD-05', NIGHT_PLATE, 'Casse-cou', withoutModule(NIGHT_PLATE, 'MOD-05'), bought('MOD-05')),
  pair('MOD-06', plan('Nuit festive'), 'Équilibré', withoutModule(plan('Nuit festive'), 'MOD-06'), bought('MOD-06')),
  pair('MOD-07', plan('Haut tier'), 'Équilibré', withoutModule(plan('Haut tier'), 'MOD-07'), bought('MOD-07')),
  pair('MOD-08', plan('Corruption'), 'Équilibré', withoutModule(plan('Corruption'), 'MOD-08'), bought('MOD-08')),
  pair('MOD-09', FLIGHT, 'Casse-cou', withoutModule(FLIGHT, 'MOD-09'), bought('MOD-09')),
  // Équipiers
  pair('CREW-01', plan('Corruption'), 'Équilibré', { ...plan('Corruption'), crew: undefined }, bought('CREW-01')),
  pair('CREW-02', plan('Rentier'), 'Équilibré', { ...plan('Rentier'), crew: undefined }, bought('CREW-02')),
  pair('CREW-03', plan('Chaîne du froid'), 'Équilibré', { ...plan('Chaîne du froid'), crew: undefined }, bought('CREW-03')),
  // Lieux spéciaux et services
  pair('Hachoir de Viktor', plan('Chaîne du froid'), 'Équilibré', { ...plan('Chaîne du froid'), places: ['advance'] }, usedService('grind')),
  pair('Avance de survie', plan('Sans build'), 'Équilibré', { ...plan('Sans build'), places: ['grinder'] }, usedService('borrow')),
  pair('Morgue : chirurgie', withPlaces(plan('Sans build'), ['surgery']), 'Casse-cou', plan('Sans build'), usedService('morgue:surgery')),
  pair('Morgue : certificat', withPlaces(plan('Sans build'), ['certificate']), 'Équilibré', plan('Sans build'), usedService('morgue:certificate')),
  pair('Morgue : laissez-passer', withPlaces(plan('Sans build'), ['pass']), 'Équilibré', plan('Sans build'), usedService('morgue:pass')),
  pair('Karma-Cham', withPlaces(plan('Sans build'), ['influence']), 'Équilibré', plan('Sans build'), usedService('influence')),
  pair('Velvet-Silo : enchères', withPlaces(plan('Haut tier'), ['auction']), 'Casse-cou', plan('Haut tier'), usedService('auction')),
  pair('Velvet-Silo : chantage', withPlaces(plan('Sans build'), ['blackmail']), 'Équilibré', plan('Sans build'), usedService('blackmail')),
  // Mécanique
  pair('Dilution en Tier 0', plan('Couverture légale'), 'Équilibré', { ...plan('Couverture légale'), legalShare: undefined }, () => true),
]

export type AblationResult = {
  ablation: Ablation
  usage: number
  survival: { with: number; without: number; delta: number; margin: number }
  score: { with: number; without: number; delta: number; margin: number }
}

/** Écart moyen apparié et demi-largeur de son intervalle de confiance à 95 % */
function paired(withValues: readonly number[], withoutValues: readonly number[]) {
  const diffs = withValues.map((value, i) => value - withoutValues[i])
  const n = Math.max(1, diffs.length)
  const delta = diffs.reduce((total, diff) => total + diff, 0) / n
  const variance = diffs.reduce((total, diff) => total + (diff - delta) ** 2, 0) / Math.max(1, n - 1)
  const mean = (values: readonly number[]) => values.reduce((total, value) => total + value, 0) / Math.max(1, values.length)
  return { with: mean(withValues), without: mean(withoutValues), delta, margin: 1.96 * Math.sqrt(variance / n) }
}

export function runAblation(ablation: Ablation, games: number): AblationResult {
  const seeds = Array.from({ length: games }, (_, i) => i + 1)
  const withRecords = seeds.map((seed) => playGame(ablation.with(), seed))
  const withoutRecords = seeds.map((seed) => playGame(ablation.without(), seed))
  const survived = (records: readonly GameRecord[]) => records.map((record) => (record.defeat ? 0 : 1))
  const scores = (records: readonly GameRecord[]) => records.map((record) => record.score)
  return {
    ablation,
    usage: withRecords.filter(ablation.used).length / Math.max(1, games),
    survival: paired(survived(withRecords), survived(withoutRecords)),
    score: paired(scores(withRecords), scores(withoutRecords)),
  }
}

const pct = (share: number) => `${Math.round(share * 100)} %`
const points = (share: number) => `${share >= 0 ? '+' : '−'}${Math.round(Math.abs(share) * 100)} pts`
const credits = (amount: number) => `${amount >= 0 ? '+' : '−'}${Math.round(Math.abs(amount)).toLocaleString('fr-FR')} ₡`
const plain = (amount: number) => `${Math.round(amount).toLocaleString('fr-FR')} ₡`

/** Verdict : positif ou négatif si l'intervalle de confiance exclut zéro, neutre sinon */
function verdict(delta: number, margin: number): string {
  if (delta - margin > 0) return 'positif'
  if (delta + margin < 0) return 'négatif'
  return 'neutre'
}

export function renderAblations(results: readonly AblationResult[], games: number): string {
  const rows = results.map(({ ablation, usage, survival, score }) => {
    const survivalCell = `${pct(survival.without)} → ${pct(survival.with)} (${points(survival.delta)} ± ${Math.round(survival.margin * 100)})`
    const scoreCell = `${plain(score.without)} → ${plain(score.with)} (${credits(score.delta)} ± ${plain(score.margin)})`
    return `| ${ablation.element} | ${ablation.base} | ${pct(usage)} | ${survivalCell} | ${verdict(survival.delta, survival.margin)} | ${scoreCell} | ${verdict(score.delta, score.margin)} |`
  })
  return [
    '# Campagne 4 — Tests par retrait',
    '',
    `* ${games} parties par variante, graines 1 à ${games}, mêmes graines avec et sans l'élément (chap. 9, méthode des tests par retrait).`,
    '* Écarts appariés avec intervalle de confiance à 95 % ; verdict positif ou négatif si l’intervalle exclut zéro.',
    '* Usage : part des parties jouées avec l’élément où il a été acheté ou utilisé.',
    '',
    '| Élément | Plan de référence | Usage | Survie sans → avec (écart) | Effet sur la survie | Score moyen sans → avec (écart) | Effet sur le score |',
    '| :--- | :--- | ---: | ---: | :--- | ---: | :--- |',
    ...rows,
    '',
  ].join('\n')
}
