import { describe, expect, it } from 'vitest'
import { applyAction, type Action } from '../src/engine/actions.ts'
import { dailySeed } from '../src/engine/ranked.ts'
import { createInitialState } from '../src/engine/state.ts'
import { verdictOf } from './verdict.ts'

const DAY = '2026-11-06'

/** Partie classée jouée jusqu'au bout en dormant chaque soir, actions acceptées seulement */
function sleeper(): Action[] {
  let state = createInitialState(dailySeed(DAY), 'citizen')
  const actions: Action[] = []
  const tries: Action[] = [{ type: 'waitEvening' }, { type: 'sleep' }]
  for (let step = 0; state.status === 'playing' && step < 500; step++) {
    const action = tries[step % tries.length]
    const result = applyAction(state, action)
    if (!result.ok) continue
    actions.push(action)
    state = result.state
  }
  return actions
}

describe('verdict d’une partie classée', () => {
  it('retient la fin et le score que donne le rejeu', () => {
    const verdict = verdictOf({ id: 1, day: DAY, difficulty: 'citizen', actions: JSON.stringify(sleeper()) })
    expect(verdict).toMatchObject({ id: 1, status: 'valid' })
  })

  it('rejette une partie inachevée, refusée ou illisible', () => {
    const actions = sleeper()
    expect(verdictOf({ id: 2, day: DAY, difficulty: 'citizen', actions: JSON.stringify(actions.slice(0, 4)) })).toEqual({
      id: 2,
      status: 'rejected',
      reason: 'unfinished',
    })
    const forged = [{ type: 'buy', productId: 'T4-06', qty: 99 }, ...actions]
    expect(verdictOf({ id: 3, day: DAY, difficulty: 'citizen', actions: JSON.stringify(forged) })).toMatchObject({ reason: 'refused' })
    expect(verdictOf({ id: 4, day: DAY, difficulty: 'citizen', actions: '{' })).toMatchObject({ reason: 'malformed' })
    expect(verdictOf({ id: 5, day: DAY, difficulty: 'god', actions: '[]' })).toMatchObject({ reason: 'malformed' })
  })
})
