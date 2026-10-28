import { PRODUCTS } from '../src/data/products.ts'
import type { GameState } from '../src/engine/types.ts'
import { traderBot, type Plan, type Temperament } from './bots/trader.ts'
import { PLANS, TEMPERAMENTS } from './plans.ts'
import { playGame, type Bot, type GameRecord } from './runner.ts'

/*
 * Sondes de progression (docs/propositions/progression.md) : un enrobage du marchand cache ce qui n'est pas encore débloqué.
 * Usage : node sim/probe-progression.ts
 */
const n = 300
type Gate = (view: GameState) => boolean
/** Boutique sans les produits verrouillés : le marchand ne peut pas les acheter */
const lockTiers =
  (minTier: number, open: Gate) =>
  (view: GameState): GameState => {
    if (open(view)) return view
    const market = view.markets[view.districtId]
    const stock = Object.fromEntries(
      Object.entries(market.stock).map(([id, qty]) => [id, PRODUCTS[id as keyof typeof PRODUCTS].tier >= minTier ? 0 : qty]),
    )
    return { ...view, markets: { ...view.markets, [view.districtId]: { ...market, stock } } }
  }
const gatedBot = (plan: Plan, temperament: Temperament, mask: (view: GameState) => GameState, planBefore?: Plan, open?: Gate): Bot => {
  const full = traderBot(plan, temperament, 'score')
  const early = planBefore ? traderBot(planBefore, temperament, 'score') : full
  return { name: full.name, decide: (view) => (open && !open(view) ? early : full).decide(mask(view)) }
}
const run = (make: () => Bot) => Array.from({ length: n }, (_, s) => playGame(make(), s + 1))
const stats = (r: GameRecord[], ref?: GameRecord[]) => {
  const s = r.map((g) => g.score)
  const mean = s.reduce((a, b) => a + b, 0) / n
  const sd = Math.sqrt(s.reduce((a, b) => a + (b - mean) ** 2, 0) / n)
  const paired = ref
    ? (() => {
        const w = r.filter((g, i) => g.score > ref[i].score).length,
          l = r.filter((g, i) => g.score < ref[i].score).length
        return ` · bat la référence ${Math.round((100 * w) / Math.max(1, w + l))} %`
      })()
    : ''
  return `${Math.round(mean / 1000)}k ±${Math.round(sd / 1000)}k CV ${(sd / mean).toFixed(2)} survie ${Math.round((100 * r.filter((g) => !g.defeat).length) / n)} %${paired}`
}
const none = (view: GameState) => view
const plan = (name: string) => PLANS.find((p) => p.name === name) ?? PLANS[0]
const [, balanced, bold] = TEMPERAMENTS

console.log('— Haut tier verrouillé (Sans build)')
for (const t of [balanced, bold]) {
  const ref = run(() => gatedBot(PLANS[0], t, none))
  const byDay = run(() => gatedBot(PLANS[0], t, (v) => lockTiers(4, (w) => w.day >= 12)(lockTiers(3, (w) => w.day >= 6)(v))))
  const byDebt = run(() =>
    gatedBot(
      PLANS[0],
      t,
      lockTiers(3, (w) => w.initialDebtPaid),
    ),
  )
  console.log(`${t.name.padEnd(10)} référence ${stats(ref)}`)
  console.log(`${''.padEnd(10)} Tier 3 au J6, Tier 4 au J12 : ${stats(byDay, ref)}`)
  console.log(`${''.padEnd(10)} Tier 3–4 après la dette initiale : ${stats(byDebt, ref)}`)
}

console.log('— Équipiers échelonnés (Vance et Mama Rosa au J3, Glitch au J5)')
for (const name of ['Corruption', 'Chaîne du froid', 'Rentier']) {
  const p = plan(name)
  const day = p.crew === 'CREW-02' ? 5 : 3
  const ref = run(() => gatedBot(p, balanced, none))
  const gated = run(() => gatedBot(p, balanced, none, { ...p, crew: undefined }, (v) => v.day >= day))
  console.log(`${name.padEnd(16)} référence ${stats(ref)} | équipier au J${day} : ${stats(gated, ref)}`)
}

console.log('— Garage ouvert après la dette initiale')
for (const name of ['Couverture légale', 'Citoyen modèle', 'Fuite au sommet']) {
  const p = plan(name)
  const ref = run(() => gatedBot(p, balanced, none))
  const gated = run(() => gatedBot(p, balanced, none, { ...p, vehicle: undefined, modules: [] }, (v) => v.initialDebtPaid))
  console.log(`${name.padEnd(18)} référence ${stats(ref)} | garage après la dette : ${stats(gated, ref)}`)
}
