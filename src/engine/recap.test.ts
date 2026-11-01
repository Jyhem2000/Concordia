import { describe, expect, it } from 'vitest'
import { recapOf } from './recap.ts'
import { gameAt } from './test-helpers.ts'
import type { DayLog, Highlight } from './types.ts'

const day = (n: number, cash: number, highlights: Highlight[], bought = 0, sold = 0): DayLog => ({
  day: n,
  start: { cash, offshore: 0, venture: 0, debt: 0 },
  events: { global: null, local: {} },
  bought,
  sold,
  highlights,
})

describe('bilan de partie (chap. 7)', () => {
  it('compte les contrôles, les trajets, les commandes et le patrimoine au plus haut, depuis le carnet', () => {
    const state = gameAt(3, {
      cash: 1_000,
      debt: 0,
      journal: [
        day(
          1,
          2_000,
          [
            { kind: 'trip', from: 'D1', to: 'D4', phase: 'day' },
            { kind: 'control', control: 'brc', move: 'flee', success: true, crates: 0, custodyDays: 0 },
            { kind: 'delivered', fee: 500 },
          ],
          800,
          1_500,
        ),
        day(
          2,
          9_000,
          [
            { kind: 'trip', from: 'D4', to: 'D1', phase: 'night' },
            { kind: 'control', control: 'flying', move: 'search', success: null, crates: -3, custodyDays: 1 },
            { kind: 'debtPaid' },
            { kind: 'wanted', level: 2 },
            { kind: 'contractFailed', penalty: 200 },
          ],
          400,
          0,
        ),
        day(3, 1_000, []),
      ],
    })
    expect(recapOf(state)).toMatchObject({
      days: 3,
      peak: { wealth: 9_000, day: 2 },
      bought: 1_200,
      sold: 1_500,
      controls: 2,
      controlsClean: 1,
      escapes: 1,
      custodyDays: 1,
      cratesLost: 3,
      trips: { day: 1, night: 1 },
      deliveries: 1,
      contracts: { done: 0, failed: 1 },
      debtPaidDay: 2,
      wantedMax: 2,
    })
  })
})
