import { afterEach, describe, expect, it, vi } from 'vitest'
import { dispatchVerification } from './dispatch.ts'

describe('lancement de la vérification à la soumission', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('demande à GitHub de lancer la tâche de vérification sur la branche principale', async () => {
    const fetch = vi.fn(async () => new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetch)
    expect(await dispatchVerification('jeton')).toBe(true)
    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/Jyhem2000/Concordia/actions/workflows/verify.yml/dispatches',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ ref: 'master' }),
        headers: expect.objectContaining({ authorization: 'Bearer jeton', 'user-agent': expect.any(String) }),
      }),
    )
  })

  it('ne demande rien sans jeton, et ne fait jamais échouer l’envoi', async () => {
    const fetch = vi.fn(async () => new Response(null, { status: 401 }))
    vi.stubGlobal('fetch', fetch)
    expect(await dispatchVerification(undefined)).toBe(false)
    expect(fetch).not.toHaveBeenCalled()
    expect(await dispatchVerification('jeton')).toBe(false)
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new TypeError('hors ligne'))),
    )
    expect(await dispatchVerification('jeton')).toBe(false)
  })
})
