import { describe, expect, it } from 'vitest'
import { offshoreBalance } from './finance.ts'
import { netWealth } from './journal.ts'
import { createInitialState } from './state.ts'
import { defined, gameAt, HIGH_ROLL_RNG, LOW_ROLL_RNG, run } from './test-helpers.ts'

describe('carnet de route (chap. 7)', () => {
  it('s’ouvre au Jour 1 sur le patrimoine de départ', () => {
    const state = createInitialState(7)
    expect(state.journal).toEqual([
      {
        day: 1,
        start: { cash: state.cash, offshore: 0, venture: 0, debt: state.debt },
        events: { global: state.events.global, local: state.events.local },
        bought: 0,
        sold: 0,
        highlights: [],
      },
    ])
  })

  it('compte les achats et les ventes de la journée en Cash-Puce', () => {
    const start = createInitialState(7)
    const bought = run(start, { type: 'buy', productId: 'T0-01', qty: 3 })
    const sold = run(bought, { type: 'sell', productId: 'T0-01', qty: 3 })
    const today = defined(sold.journal.at(-1))
    expect(today.bought).toBe(start.cash - bought.cash)
    expect(today.sold).toBe(sold.cash - bought.cash)
  })

  it('note le trajet, puis ouvre le lendemain sur le patrimoine après la routine', () => {
    const traveled = run(gameAt(1, { rng: HIGH_ROLL_RNG }), { type: 'travel', to: 'D2' })
    expect(defined(traveled.journal.at(-1)).highlights).toContainEqual({ kind: 'trip', from: 'D1', to: 'D2', phase: 'day' })
    const morning = run(traveled, { type: 'sleep' })
    const opened = defined(morning.journal.at(-1))
    expect(opened.day).toBe(morning.day)
    expect(opened.start).toEqual({ cash: morning.cash, offshore: offshoreBalance(morning.offshore), venture: 0, debt: morning.debt })
    expect(morning.journal).toHaveLength(traveled.journal.length + 1)
  })

  it('note le barrage réglé, avec son issue', () => {
    const stopped = run(gameAt(1, { rng: LOW_ROLL_RNG }), { type: 'travel', to: 'D2' })
    const passed = run(stopped, { type: 'intercept', move: 'search' })
    const control = defined(passed.journal.at(-1)).highlights.find((highlight) => highlight.kind === 'control')
    expect(control).toMatchObject({ kind: 'control', move: 'search' })
  })
})

describe('patrimoine net (chap. 7)', () => {
  it('ajoute le cash, l’offshore et le placement, retire la dette', () => {
    expect(netWealth({ cash: 2_000, offshore: 500, venture: 300, debt: 5_000 })).toBe(-2_200)
  })
})
