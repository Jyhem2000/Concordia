import { beforeEach, describe, expect, it } from 'vitest'
import { dailySeed, utcDay } from '../engine/ranked.ts'
import { createInitialState } from '../engine/state.ts'
import { migrateSave, PUBLIC_SAVE_VERSION, rankedBlock, SAVE_VERSION, savedPart, useGameStore } from './gameStore.ts'
import { useRecordsStore } from './recordsStore.ts'

/*
 * Le store relie l'interface au moteur : on vérifie qu'il applique les actions acceptées,
 * garde l'état intact en cas de refus et ne sauvegarde que la partie.
 */

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.getState().newGame('smuggler')
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
    useGameStore.getState().newGame('smuggler')
    expect(useGameStore.getState()).toMatchObject({ game: { day: 1, status: 'playing' }, lastError: null })
  })

  it('sauvegarde la partie et son statut classé, pas l’erreur affichée', () => {
    expect(Object.keys(savedPart(useGameStore.getState()))).toEqual(['game', 'ranked', 'actions', 'submission'])
  })

  it('ne note pas les actions d’une partie libre', () => {
    useGameStore.getState().dispatch({ type: 'waitEvening' })
    expect(useGameStore.getState()).toMatchObject({ ranked: null, actions: [] })
  })

  it('lance la partie classée sur la graine du jour, note la tentative et les actions acceptées', () => {
    useRecordsStore.setState({ rankedTries: {} })
    useGameStore.getState().newRankedGame('outlaw')
    const day = utcDay(new Date())
    expect(useGameStore.getState().game).toEqual(createInitialState(dailySeed(day), 'outlaw'))
    expect(useRecordsStore.getState().rankedTries[day]).toEqual(['outlaw'])
    useGameStore.getState().dispatch({ type: 'waitEvening' })
    useGameStore.getState().dispatch({ type: 'refuel', qty: 1 })
    expect(useGameStore.getState().actions).toEqual([{ type: 'waitEvening' }])
  })

  it('met hors classement une partie commencée avec d’autres règles', () => {
    expect(rankedBlock({ day: '2026-11-06', seed: 1, rulesVersion: 'b'.repeat(40) })).toBe('stale')
    // Les tests tournent sans commit déployé : leurs parties classées ne s'envoient jamais
    expect(rankedBlock({ day: '2026-11-06', seed: 1, rulesVersion: 'dev' })).toBe('local')
  })

  it('repart de zéro depuis une sauvegarde antérieure à la version publique', () => {
    expect(PUBLIC_SAVE_VERSION).toBeLessThanOrEqual(SAVE_VERSION)
    expect(migrateSave()).toMatchObject({ game: { day: 1, status: 'playing' }, ranked: null, actions: [] })
  })
})
