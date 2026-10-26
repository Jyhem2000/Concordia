import { describe, expect, it } from 'vitest'
import { createInitialState } from './state.ts'

describe('createInitialState', () => {
  it('démarre au Jour 1, de jour, dans la zone de départ', () => {
    expect(createInitialState(1)).toMatchObject({ day: 1, phase: 'day', districtId: 'D1' })
  })

  it('est déterministe pour une même graine', () => {
    expect(createInitialState(123)).toEqual(createInitialState(123))
  })

  it('est sérialisable tel quel (sauvegarde JSON)', () => {
    const state = createInitialState(456)
    expect(JSON.parse(JSON.stringify(state))).toEqual(state)
  })
})
