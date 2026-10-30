import { describe, expect, it } from 'vitest'
import { OFFSHORE_WITHDRAW_FACTOR, VENTURE } from '../data/balance.ts'
import { offshoreBalance, scoreOf } from './finance.ts'
import { seedRng } from './rng.ts'
import { errorOf, gameAt, run } from './test-helpers.ts'
import type { GameState } from './types.ts'

const DEPOSIT = 10_000
/** À la Laverie, de jour, avec de quoi placer */
const atLaundry = (patch: Partial<GameState> = {}) => gameAt(4, { districtId: 'D5', cash: 50_000, ...patch })

/** Nuit au bivouac depuis un placement plein, avec la graine donnée */
const morningAfter = (seed: number) =>
  run(atLaundry({ venture: { deposited: DEPOSIT, interest: 0 }, rng: seedRng(seed) }), { type: 'waitEvening' }, { type: 'sleep' })

describe('placement du Cartel (chap. 1)', () => {
  it('se remplit depuis le Cash-Puce et se vide avec la commission de la Laverie', () => {
    const invested = run(atLaundry(), { type: 'invest', amount: DEPOSIT })
    expect(invested.cash).toBe(50_000 - DEPOSIT)
    expect(invested.venture).toEqual({ deposited: DEPOSIT, interest: 0 })
    const divested = run(invested, { type: 'divest', amount: DEPOSIT })
    expect(divested.cash).toBe(50_000 - DEPOSIT + Math.round(DEPOSIT * OFFSHORE_WITHDRAW_FACTOR))
    expect(errorOf(invested, { type: 'divest', amount: DEPOSIT + 1 })).toBe('not-enough-venture')
    expect(errorOf(gameAt(4, { districtId: 'D1', cash: 50_000 }), { type: 'invest', amount: 1 })).not.toBeNull()
  })

  it('verse ses intérêts chaque matin, ou perd une part de son solde dans un coup de filet', () => {
    const mornings = Array.from({ length: 200 }, (_, seed) => morningAfter(seed + 1))
    const calm = mornings.find((state) => state.briefing?.ventureRaid === 0)
    const raid = mornings.find((state) => (state.briefing?.ventureRaid ?? 0) > 0)
    expect(calm && offshoreBalance(calm.venture)).toBe(DEPOSIT + Math.round(DEPOSIT * VENTURE.dailyRate))
    // Coup de filet : la part perdue, puis les intérêts sur ce qui reste
    const kept = Math.round(DEPOSIT * (1 - VENTURE.raidLoss))
    expect(raid?.briefing?.ventureRaid).toBe(DEPOSIT - kept)
    expect(raid && offshoreBalance(raid.venture)).toBe(kept + Math.round(kept * VENTURE.dailyRate))
  })

  it('compte dans le score avec l’offshore', () => {
    expect(scoreOf(gameAt(4, { offshore: { deposited: 1_000, interest: 10 }, venture: { deposited: 500, interest: 5 } }))).toBe(1_515)
  })
})
