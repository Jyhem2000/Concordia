import type { Action } from './actions.ts'
import { offshoreBalance } from './finance.ts'
import { iccTier } from './gauges.ts'
import type { DayLog, GameState, Highlight, WealthSnapshot } from './types.ts'

/** Patrimoine de la partie à cet instant */
export function wealthOf(state: GameState): WealthSnapshot {
  return { cash: state.cash, offshore: offshoreBalance(state.offshore), venture: offshoreBalance(state.venture), debt: state.debt }
}

/** Événements du jour, pour le carnet */
function eventsOf(state: GameState): DayLog['events'] {
  return { global: state.events.global, local: state.events.local }
}

/** Patrimoine net : Cash-Puce et offshore, moins la dette */
export function netWealth({ cash, offshore, venture, debt }: WealthSnapshot): number {
  return cash + offshore + venture - debt
}

/** Première entrée du carnet : le Jour 1 au départ */
export function firstDayLog(state: GameState): DayLog {
  return { day: state.day, start: wealthOf(state), events: eventsOf(state), bought: 0, sold: 0, highlights: [] }
}

/**
 * Carnet de route (chap. 7) : note ce que l'action a changé, en comparant l'état avant et après.
 * Achats et ventes en Cash-Puce, trajets, barrages réglés, aléas, commandes, équipement, statut ; une nouvelle
 * entrée s'ouvre à chaque matin.
 */
export function recordJournal(before: GameState, after: GameState, action: Action): GameState {
  const highlights: Highlight[] = []
  const note = (highlight: Highlight | false) => {
    if (highlight) highlights.push(highlight)
  }

  if (action.type === 'travel' && after.districtId !== before.districtId)
    note({ kind: 'trip', from: before.districtId, to: after.districtId, phase: before.phase })
  const report = after.interceptionReport
  if (before.interception && report && report !== before.interceptionReport && report.over)
    note({
      kind: 'control',
      control: before.interception.kind,
      move: report.move,
      success: report.success,
      crates: report.crates,
      custodyDays: report.custodyDays,
    })
  const road = after.roadReport
  if (road && road !== before.roadReport) note({ kind: 'road', eventId: road.eventId, won: road.won })
  const trip = after.tripReport
  if (trip && trip !== before.tripReport) {
    note(trip.mission === 'delivered' && { kind: 'delivered', fee: trip.missionFee })
    note(trip.mission === 'deviated' && { kind: 'deviated' })
  }
  note(after.progress.injections > before.progress.injections && { kind: 'injection', total: after.progress.injections })
  note(after.vehicleId !== before.vehicleId && { kind: 'vehicle', vehicleId: after.vehicleId })
  for (const moduleId of after.modules.owned) note(!before.modules.owned.includes(moduleId) && { kind: 'module', moduleId })
  note(after.crew.active !== null && after.crew.active !== before.crew.active && { kind: 'crew', crewId: after.crew.active })
  note(after.initialDebtPaid && !before.initialDebtPaid && { kind: 'debtPaid' })
  note(after.wanted > before.wanted && { kind: 'wanted', level: after.wanted })
  note(iccTier(after.icc) !== iccTier(before.icc) && { kind: 'iccTier', tier: iccTier(after.icc) })
  note(after.ending !== null && before.ending === null && { kind: 'ending', id: after.ending.id, score: after.ending.score })
  note(action.type === 'deliverContract' && before.contract !== null && { kind: 'contractDone', reward: before.contract.reward })

  // Flux de marchandise : seules les actions d'achat et de vente au marché comptent
  const spent = action.type === 'buy' ? before.cash - after.cash : 0
  const earned = action.type === 'sell' ? after.cash - before.cash : 0

  if (highlights.length === 0 && spent === 0 && earned === 0 && after.day === before.day) return after
  const past = after.journal.slice(0, -1)
  // Un trajet ou un barrage de la nuit reste dans la journée où il a commencé
  const today = after.journal.at(-1) ?? firstDayLog(before)
  const updated: DayLog = { ...today, bought: today.bought + spent, sold: today.sold + earned, highlights: [...today.highlights, ...highlights] }
  // Nouveau matin : la journée suivante s'ouvre sur le patrimoine après la routine
  // Ce que la routine du matin a changé appartient à la nouvelle journée
  const fresh = after.briefing && after.briefing !== before.briefing ? after.briefing : null
  const morning: Highlight[] = []
  if (fresh && fresh.ventureRaid > 0) morning.push({ kind: 'raid', loss: fresh.ventureRaid })
  if (fresh && fresh.contractFailed > 0) morning.push({ kind: 'contractFailed', penalty: fresh.contractFailed })
  const opened: DayLog[] =
    after.day > today.day ? [{ day: after.day, start: wealthOf(after), events: eventsOf(after), bought: 0, sold: 0, highlights: morning }] : []
  return { ...after, journal: [...past, updated, ...opened] }
}
