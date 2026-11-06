import { describe, expect, it } from 'vitest'
import { RANKED } from '../src/data/balance.ts'
import { openDays, parseSubmission, pseudoError } from './runs.ts'

const NOW = new Date('2026-11-06T10:00:00Z')
const VALID = {
  playerId: '0b7c6f1e-2f4a-4c39-9a51-8d2e7f3b6a10',
  pseudo: '  Mama   Rosa ',
  day: '2026-11-06',
  difficulty: 'smuggler',
  rulesVersion: 'a'.repeat(40),
  actions: [{ type: 'waitEvening' }, { type: 'sleep' }],
}

describe('envoi d’une partie classée', () => {
  it('accepte une partie du jour ou de la veille, pseudo nettoyé', () => {
    expect(parseSubmission(VALID, NOW)).toMatchObject({ ok: true, run: { pseudo: 'Mama Rosa', difficulty: 'smuggler' } })
    expect(parseSubmission({ ...VALID, day: '2026-11-05' }, NOW).ok).toBe(true)
  })

  it('refuse un classement clos, un pseudo invalide, des règles inconnues, une partie trop longue', () => {
    expect(parseSubmission({ ...VALID, day: '2026-11-04' }, NOW)).toEqual({ ok: false, error: 'closed' })
    expect(parseSubmission({ ...VALID, pseudo: 'ab' }, NOW)).toEqual({ ok: false, error: 'pseudo' })
    expect(parseSubmission({ ...VALID, rulesVersion: 'dev' }, NOW)).toEqual({ ok: false, error: 'rules' })
    const long = Array.from({ length: RANKED.maxActions + 1 }, () => ({ type: 'sleep' }))
    expect(parseSubmission({ ...VALID, actions: long }, NOW)).toEqual({ ok: false, error: 'too-long' })
  })

  it('refuse un envoi mal formé', () => {
    expect(parseSubmission(null, NOW)).toEqual({ ok: false, error: 'malformed' })
    expect(parseSubmission({ ...VALID, difficulty: 'god' }, NOW)).toEqual({ ok: false, error: 'malformed' })
    expect(parseSubmission({ ...VALID, actions: [{ kind: 'sleep' }] }, NOW)).toEqual({ ok: false, error: 'malformed' })
    expect(parseSubmission({ ...VALID, playerId: 'moi' }, NOW)).toEqual({ ok: false, error: 'malformed' })
  })
})

describe('pseudo', () => {
  it('veut une longueur raisonnable et des caractères de nom', () => {
    expect(pseudoError('Glitch')).toBeNull()
    expect(pseudoError('Ça-va_42')).toBeNull()
    expect(pseudoError('x'.repeat(RANKED.pseudoMax + 1))).toBe('length')
    expect(pseudoError('<script>')).toBe('characters')
  })
})

describe('jours ouverts', () => {
  it('sont le jour et la veille, en UTC', () => {
    expect(openDays(new Date('2026-11-06T00:30:00Z'))).toEqual(['2026-11-06', '2026-11-05'])
  })
})
