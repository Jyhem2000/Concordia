import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createInitialState } from '../engine/state.ts'
import { useGameStore } from './gameStore.ts'
import { useRecordsStore } from './recordsStore.ts'

/*
 * Ouverture d'une partie classée sur un build déployé (chap. 1) : la graine et le jour viennent du serveur, qui peut
 * refuser. Le serveur est simulé par un `fetch` de test.
 */

vi.mock('./rulesVersion.ts', () => ({ RULES_VERSION: 'a'.repeat(40), LOCAL_BUILD: false }))

/** Le serveur répond ce corps avec ce statut à toute requête */
function server(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status })),
  )
}

describe('ouverture d’une partie classée', () => {
  beforeEach(() => {
    useGameStore.getState().newGame('smuggler')
    useRecordsStore.setState({ rankedTries: {} })
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('joue la graine et le jour donnés par le serveur', async () => {
    server(200, { day: '2026-11-07', seed: 123_456 })
    expect(await useGameStore.getState().newRankedGame('citizen')).toBeNull()
    expect(useGameStore.getState().game).toEqual(createInitialState(123_456, 'citizen'))
    expect(useGameStore.getState().ranked).toMatchObject({ day: '2026-11-07', seed: 123_456 })
  })

  it('marque la tentative prise quand le serveur l’a déjà, pas quand seule la connexion est servie', async () => {
    server(409, { error: 'connection' })
    expect(await useGameStore.getState().newRankedGame('citizen')).toBe('connection')
    expect(useGameStore.getState().ranked).toBeNull()
    expect(Object.values(useRecordsStore.getState().rankedTries).flat()).toEqual([])
    server(409, { error: 'taken' })
    expect(await useGameStore.getState().newRankedGame('citizen')).toBe('taken')
    expect(Object.values(useRecordsStore.getState().rankedTries).flat()).toEqual(['citizen'])
  })

  it('ne lance rien sans serveur ni réponse lisible', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new TypeError('hors ligne'))),
    )
    expect(await useGameStore.getState().newRankedGame('outlaw')).toBe('failed')
    server(200, { day: 'demain', seed: 'secret' })
    expect(await useGameStore.getState().newRankedGame('outlaw')).toBe('failed')
    expect(useGameStore.getState().ranked).toBeNull()
  })
})
