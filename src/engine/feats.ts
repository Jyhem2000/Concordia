import { FEATS, WANTED } from '../data/balance.ts'
import { DISTRICTS } from '../data/districts.ts'
import { isDefeat } from './routine.ts'
import type { DistrictId, GameState, Highlight } from './types.ts'

/*
 * Hauts faits de carrière (chap. 7) : des exploits d'une partie, lus dans son carnet de route une fois la partie finie,
 * et comptés d'une partie à l'autre à la carrière.
 */

export const FEAT_IDS = ['escapes', 'summitBluff', 'clean', 'wantedMax', 'contracts', 'nightOwl', 'earlyDebt', 'gold'] as const
export type FeatId = (typeof FEAT_IDS)[number]

/** Faits marquants de la partie, avec leur jour et le district où se trouvait le camion */
function facts(state: GameState): { day: number; at: DistrictId | null; highlight: Highlight }[] {
  let at: DistrictId | null = null
  return state.journal.flatMap((log) =>
    log.highlights.map((highlight) => {
      if (highlight.kind === 'trip') at = highlight.to
      return { day: log.day, at, highlight }
    }),
  )
}

/** Hauts faits accomplis dans une partie finie ; aucun avant la fin */
export function featsOf(state: GameState): FeatId[] {
  if (!state.ending) return []
  const won = !isDefeat(state.ending.id)
  const all = facts(state)
  const count = (keep: (highlight: Highlight) => boolean) => all.filter(({ highlight }) => keep(highlight)).length
  const reached: Record<FeatId, boolean> = {
    escapes: count((h) => h.kind === 'control' && h.move === 'flee' && h.success === true) >= FEATS.escapes,
    summitBluff: all.some(
      ({ at, highlight: h }) =>
        h.kind === 'control' && h.move === 'bluff' && h.success === true && at !== null && DISTRICTS[at].security >= FEATS.summitSecurity,
    ),
    clean: won && count((h) => h.kind === 'control' && h.custodyDays > 0) === 0,
    wantedMax: won && all.some(({ highlight: h }) => h.kind === 'wanted' && h.level >= WANTED.maxLevel),
    contracts: count((h) => h.kind === 'contractDone') >= FEATS.contracts,
    nightOwl: count((h) => h.kind === 'trip' && h.phase === 'night') >= FEATS.nightTrips,
    earlyDebt: all.some(({ day, highlight: h }) => h.kind === 'debtPaid' && day <= FEATS.debtByDay),
    gold: all.some(({ highlight: h }) => h.kind === 'iccTier' && h.tier === 'gold'),
  }
  return FEAT_IDS.filter((id) => reached[id])
}
