import { describe, expect, it } from 'vitest'
import { applyAction, type Action } from './actions.ts'
import { localSeed, replay, utcDay } from './ranked.ts'
import { createInitialState } from './state.ts'
import type { GameState } from './types.ts'

/** Une partie jouée jusqu'au bout, en ne gardant que les actions acceptées, comme le jeu le fait */
function playThrough(seed: number): { state: GameState; actions: Action[] } {
  const tries: Action[] = [
    { type: 'buy', productId: 'T0-01', qty: 2 },
    { type: 'travel', to: 'D4' },
    { type: 'sell', productId: 'T0-01', qty: 2 },
    { type: 'waitEvening' },
    { type: 'sleep' },
  ]
  let state = createInitialState(seed, 'citizen')
  const actions: Action[] = []
  for (let step = 0; state.status === 'playing' && step < 2_000; step++) {
    const action = tries[step % tries.length]
    const result = applyAction(state, action)
    if (!result.ok) continue
    actions.push(action)
    state = result.state
  }
  return { state, actions }
}

describe('graine du jour', () => {
  it('change avec le jour UTC, pas avec l’heure', () => {
    expect(utcDay(new Date('2026-11-06T23:59:00Z'))).toBe('2026-11-06')
    expect(utcDay(new Date('2026-11-07T00:00:00Z'))).toBe('2026-11-07')
    expect(localSeed('2026-11-06')).toBe(localSeed('2026-11-06'))
    expect(localSeed('2026-11-06')).not.toBe(localSeed('2026-11-07'))
  })
})

describe('rejeu d’une partie classée', () => {
  it('retrouve exactement la même partie à partir de sa graine, de son mode et de ses actions', () => {
    const { state, actions } = playThrough(localSeed('2026-11-06'))
    expect(state.status).toBe('finished')
    const replayed = replay(localSeed('2026-11-06'), 'citizen', actions)
    expect(replayed).toEqual({ ok: true, state })
  })

  it('refuse une suite qui ne se joue pas avec ces règles', () => {
    const { actions } = playThrough(7)
    const forged: Action[] = [...actions.slice(0, 3), { type: 'buy', productId: 'T4-06', qty: 50 }, ...actions.slice(3)]
    expect(replay(7, 'citizen', forged)).toEqual({ ok: false, refusedAt: 3 })
  })

  it('ne donne pas la même partie dans un autre mode', () => {
    const { state, actions } = playThrough(11)
    const other = replay(11, 'outlaw', actions)
    expect(other.ok && other.state).not.toEqual(state)
  })
})
