import { beforeEach, describe, expect, it } from 'vitest'
import { savedPart, useGameStore } from './gameStore.ts'

/*
 * Le store relie l'interface au moteur : on vérifie qu'il applique les actions acceptées,
 * garde l'état intact en cas de refus et ne sauvegarde que la partie.
 */

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.getState().newGame()
  })

  it('remplace la partie quand le moteur accepte une action', () => {
    const before = useGameStore.getState().game
    useGameStore.getState().dispatch({ type: 'waitEvening' })
    useGameStore.getState().dispatch({ type: 'sleep' })
    const { game, lastError } = useGameStore.getState()
    expect(game.day).toBe(before.day + 1)
    expect(lastError).toBeNull()
  })

  it("garde la partie et retient l'erreur quand le moteur refuse", () => {
    const before = useGameStore.getState().game
    useGameStore.getState().dispatch({ type: 'refuel', qty: 1 })
    expect(useGameStore.getState().game).toBe(before)
    expect(useGameStore.getState().lastError).toBe('tank-full')

    // L'erreur affichée s'efface à l'action suivante qui réussit
    useGameStore.getState().dispatch({ type: 'waitEvening' })
    expect(useGameStore.getState().lastError).toBeNull()
  })

  it('repart au Jour 1 avec une nouvelle partie', () => {
    useGameStore.getState().dispatch({ type: 'waitEvening' })
    useGameStore.getState().dispatch({ type: 'sleep' })
    useGameStore.getState().newGame()
    expect(useGameStore.getState()).toMatchObject({ game: { day: 1, status: 'playing' }, lastError: null })
  })

  it('ne sauvegarde que la partie', () => {
    expect(Object.keys(savedPart(useGameStore.getState()))).toEqual(['game'])
  })
})
