import { beforeEach, describe, expect, it } from 'vitest'
import { useRecordsStore } from './recordsStore.ts'

describe('recordsStore', () => {
  beforeEach(() => {
    useRecordsStore.setState({ games: 0, endings: {}, bestScores: {}, feats: {} })
  })

  it('compte les parties et les fins atteintes, et garde le meilleur score de chaque mode', () => {
    const { record } = useRecordsStore.getState()
    record({ id: 'standard', score: 40_000 }, 'smuggler')
    record({ id: 'mafia', score: 160_000 }, 'smuggler')
    record({ id: 'standard', score: 20_000 }, 'smuggler')
    record({ id: 'standard', score: 90_000 }, 'outlaw')
    expect(useRecordsStore.getState()).toMatchObject({
      games: 4,
      endings: { standard: 3, mafia: 1 },
      bestScores: { smuggler: 160_000, outlaw: 90_000 },
    })
  })

  it('compte les hauts faits d’une partie à l’autre', () => {
    const { record } = useRecordsStore.getState()
    record({ id: 'standard', score: 1 }, 'citizen', ['escapes', 'clean'])
    record({ id: 'standard', score: 1 }, 'smuggler', ['escapes'])
    expect(useRecordsStore.getState().feats).toEqual({ escapes: 2, clean: 1 })
  })

  it('ne retient pas le score d’une défaite', () => {
    useRecordsStore.getState().record({ id: 'death', score: 0 }, 'smuggler')
    expect(useRecordsStore.getState()).toMatchObject({ games: 1, endings: { death: 1 }, bestScores: {} })
  })
})
