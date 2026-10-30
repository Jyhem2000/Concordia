import { BLUFF } from '../src/data/balance.ts'
import { DISTRICTS } from '../src/data/districts.ts'
import { bluffChance, bribeChance, ejectChance, fleeChance, flyingCheckShare, minimumOffer } from '../src/engine/interception.ts'
import { ejectMode } from '../src/engine/equipment.ts'
import { risk } from '../src/engine/risk.ts'
import { createInitialState } from '../src/engine/state.ts'
import type { CargoLot, DistrictId, GameState, Interception } from '../src/engine/types.ts'

/*
 * Sonde du Fantôme : chance de mourir (fouille effective avec le serveur) sur une tournée de nuit d'injection.
 * Calcul exact sur les règles du moteur, au meilleur choix au barrage pour survivre (bluff puis relance comprise).
 * Usage : node sim/probe-resident.ts
 */
const lot = (productId: CargoLot['productId'], qty: number): CargoLot => ({
  productId,
  qty,
  unitCost: 0,
  travelled: true,
  boughtDay: 10,
  damaged: false,
})
const base = createInitialState(1)
const night = (from: DistrictId, wanted: number, cover: boolean): GameState => ({
  ...base,
  day: 15,
  phase: 'night',
  districtId: from,
  cash: 30_000,
  debt: 0,
  initialDebtPaid: true,
  wanted,
  crew: { ...base.crew, active: 'CREW-02', paidDay: 15 },
  cargo: [lot('T4-06', 1), ...(cover ? [lot('T0-01', 9)] : [])],
  patrolDistrict: null,
})

/** Chance de survivre à un barrage d'un type donné : meilleure option, ou bluff puis meilleure relance */
function survival(state: GameState, kind: Interception['kind']): { chance: number; best: string } {
  const at: GameState = { ...state, interception: { kind, acted: false, bluffFailed: false } }
  const offer = { cash: Math.min(state.cash, minimumOffer(at) * 3), crates: [] }
  const relaunch = (bluffFailed: boolean) => {
    const s: GameState = { ...at, interception: { kind, acted: false, bluffFailed } }
    const moves: [string, number][] = [['corruption', bribeChance(s, offer).total]]
    if (kind === 'brc') moves.push(['fuite', fleeChance(s).total])
    // Éjection réussie : le serveur part avec les caisses illégales, mais on survit
    if (kind === 'brc' && !bluffFailed && ejectMode(s)) moves.push(['éjection (serveur perdu)', ejectChance(s).total])
    return moves.sort((a, b) => b[1] - a[1])[0]
  }
  const [alone, aloneChance] = relaunch(false)
  const bluff = bluffChance(at).total
  const [after, afterChance] = relaunch(true)
  const chained = bluff + (1 - bluff) * afterChance
  return chained > aloneChance ? { chance: chained, best: `bluff puis ${after}` } : { chance: aloneChance, best: alone }
}

const routes: [DistrictId, DistrictId][] = [
  ['D1', 'D2'],
  ['D2', 'D1'],
  ['D1', 'D3'],
  ['D2', 'D5'],
  ['D5', 'D6'],
  ['D1', 'D4'],
]
console.log(`Bluff : relance après échec à −${BLUFF.followUpPenalty * 100} points.`)
for (const cover of [false, true]) {
  console.log(`\n— Soute : serveur seul${cover ? ' + 9 caisses de Tier 0 (couverture)' : ''}`)
  for (const wanted of [0, 1, 2]) {
    const lines = routes.map(([from, to]) => {
      const s = night(from, wanted, cover)
      const p = risk(s, to, { includePatrol: false })
      if (DISTRICTS[to].offGrid) return `${from}→${to} : racket (pas de fouille), interception ${Math.round(p * 100)} %`
      const arrived = { ...s, districtId: to }
      const flying = flyingCheckShare(s, to, false)
      const brc = survival(arrived, 'brc')
      const fly = survival(arrived, 'flying')
      const death = p * ((1 - flying) * (1 - brc.chance) + flying * (1 - fly.chance))
      return `${from}→${to} : interception ${Math.round(p * 100)} %, mort ${Math.round(death * 100)} % (barrage : ${brc.best} ${Math.round(brc.chance * 100)} %${flying > 0 ? ` ; volant ${Math.round(flying * 100)} % : ${fly.best} ${Math.round(fly.chance * 100)} %` : ''})`
    })
    console.log(`  Fiche S ${wanted}\n    ${lines.join('\n    ')}`)
  }
}
