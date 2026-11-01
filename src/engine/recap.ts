import { netWealth, wealthOf } from './journal.ts'
import type { GameState, Highlight, InterceptionMove, VehicleId } from './types.ts'

/*
 * Bilan d'une partie (chap. 7) : ce que l'écran de fin ou de mort raconte, lu dans le carnet de route.
 */

export type RunRecap = {
  /** Jour atteint (celui de la fin) */
  days: number
  /** Patrimoine net le plus haut, au matin d'un jour ou à la fin, et ce jour-là */
  peak: { wealth: number; day: number }
  /** Patrimoine net à la fin */
  finalWealth: number
  /** Cash-Puce dépensé en marchandise, et encaissé en ventes, sur toute la partie */
  bought: number
  sold: number
  /** Barrages de la BRC et rackets des milices, et parmi eux ceux franchis sans rien perdre */
  controls: number
  controlsClean: number
  escapes: number
  bluffs: number
  bribes: number
  custodyDays: number
  cratesLost: number
  trips: { day: number; night: number }
  /** Commandes du DSC livrées, contrats de la Pègre livrés et manqués */
  deliveries: number
  contracts: { done: number; failed: number }
  /** Jour où la dette initiale a été soldée, null si jamais */
  debtPaidDay: number | null
  /** Plus haut niveau de Fiche S atteint */
  wantedMax: number
  vehicle: VehicleId
  modules: number
}

/** Bilan chiffré de la partie, depuis son carnet de route */
export function recapOf(state: GameState): RunRecap {
  const all = state.journal.flatMap((log) => log.highlights.map((highlight) => ({ day: log.day, highlight })))
  const pick = <K extends Highlight['kind']>(kind: K) => {
    const is = (highlight: Highlight): highlight is Extract<Highlight, { kind: K }> => highlight.kind === kind
    return all.flatMap(({ day, highlight }) => (is(highlight) ? [{ day, highlight }] : []))
  }
  const controls = pick('control').map(({ highlight }) => highlight)
  const won = (move: InterceptionMove) => controls.filter((h) => h.move === move && h.success === true).length
  const trips = pick('trip').map(({ highlight }) => highlight)

  const finalWealth = netWealth(wealthOf(state))
  const peak = state.journal.reduce((best, log) => (netWealth(log.start) > best.wealth ? { wealth: netWealth(log.start), day: log.day } : best), {
    wealth: finalWealth,
    day: state.day,
  })

  return {
    days: state.day,
    peak,
    finalWealth,
    bought: state.journal.reduce((total, log) => total + log.bought, 0),
    sold: state.journal.reduce((total, log) => total + log.sold, 0),
    controls: controls.length,
    controlsClean: controls.filter((h) => h.crates === 0 && h.custodyDays === 0).length,
    escapes: won('flee'),
    bluffs: won('bluff'),
    bribes: won('bribe'),
    custodyDays: controls.reduce((total, h) => total + h.custodyDays, 0),
    // Le carnet note les caisses perdues en négatif (variation de la soute)
    cratesLost: controls.reduce((total, h) => total - Math.min(0, h.crates), 0),
    trips: { day: trips.filter((h) => h.phase === 'day').length, night: trips.filter((h) => h.phase === 'night').length },
    deliveries: pick('delivered').length,
    contracts: { done: pick('contractDone').length, failed: pick('contractFailed').length },
    debtPaidDay: pick('debtPaid')[0]?.day ?? null,
    wantedMax: Math.max(0, ...pick('wanted').map(({ highlight }) => highlight.level)),
    vehicle: state.vehicleId,
    modules: state.modules.owned.length,
  }
}
