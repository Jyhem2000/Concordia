import { beforeEach, describe, expect, it } from 'vitest'
import { useRecordsStore } from './recordsStore.ts'

describe('recordsStore', () => {
  beforeEach(() => {
    useRecordsStore.setState({ games: 0, endings: {}, bestScore: null })
  })

  it('compte les parties et les fins atteintes, et garde le meilleur score', () => {
    const { record } = useRecordsStore.getState()
    record({ id: 'standard', score: 40_000 })
    record({ id: 'mafia', score: 160_000 })
    record({ id: 'standard', score: 20_000 })
    expect(useRecordsStore.getState()).toMatchObject({ games: 3, endings: { standard: 2, mafia: 1 }, bestScore: 160_000 })
  })

  it('ne retient pas le score d’une défaite', () => {
    useRecordsStore.getState().record({ id: 'death', score: 0 })
    expect(useRecordsStore.getState()).toMatchObject({ games: 1, endings: { death: 1 }, bestScore: null })
  })
})
