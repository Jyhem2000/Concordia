import { describe, expect, it } from 'vitest'
import { FEATS, WANTED } from '../data/balance.ts'
import { featsOf } from './feats.ts'
import { createInitialState } from './state.ts'
import type { DayLog, GameState, Highlight } from './types.ts'

/** Partie finie dont le carnet tient ces faits marquants, jour par jour */
function finished(days: Highlight[][], ending: GameState['ending'] = { id: 'standard', score: 1 }): GameState {
  const start = createInitialState(1)
  const base = start.journal[0]
  const journal: DayLog[] = days.map((highlights, index) => ({ ...base, day: index + 1, highlights }))
  return { ...start, journal, ending }
}

const flee: Highlight = { kind: 'control', control: 'brc', move: 'flee', success: true, crates: 0, custodyDays: 0 }

describe('hauts faits de carrière', () => {
  it("n'en compte aucun avant la fin de la partie", () => {
    expect(featsOf({ ...finished([[flee, flee, flee]]), ending: null })).toEqual([])
  })

  it('compte les fuites réussies et une partie gagnée sans garde à vue', () => {
    const feats = featsOf(finished([Array<Highlight>(FEATS.escapes).fill(flee)]))
    expect(feats).toContain('escapes')
    expect(feats).toContain('clean')
  })

  it('situe un bluff réussi dans le district du dernier trajet', () => {
    const bluff: Highlight = { kind: 'control', control: 'brc', move: 'bluff', success: true, crates: 0, custodyDays: 0 }
    expect(featsOf(finished([[{ kind: 'trip', from: 'D2', to: 'D6', phase: 'day' }, bluff]]))).toContain('summitBluff')
    expect(featsOf(finished([[{ kind: 'trip', from: 'D2', to: 'D1', phase: 'day' }, bluff]]))).not.toContain('summitBluff')
  })

  it('ne retient ni la partie propre ni la Fiche S maximale sur une défaite', () => {
    const feats = featsOf(finished([[{ kind: 'wanted', level: WANTED.maxLevel }]], { id: 'death', score: 0 }))
    expect(feats).not.toContain('clean')
    expect(feats).not.toContain('wantedMax')
  })

  it('date la dette soldée', () => {
    const days: Highlight[][] = Array.from({ length: FEATS.debtByDay + 1 }, () => [])
    days[FEATS.debtByDay].push({ kind: 'debtPaid' })
    expect(featsOf(finished(days))).not.toContain('earlyDebt')
    days[FEATS.debtByDay - 1].push({ kind: 'debtPaid' })
    expect(featsOf(finished(days))).toContain('earlyDebt')
  })
})
