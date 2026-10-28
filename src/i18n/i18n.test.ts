import { describe, expect, it } from 'vitest'
import { GAME_LENGTH_DAYS } from '../data/balance.ts'
import { tickerSlot, TICKER_STRIDE } from '../ui/hud/tickerSlot.ts'
import { getI18n } from './index.ts'
import { fr } from './fr.ts'

// Intl insère des espaces insécables (U+00A0, U+202F) : on les normalise pour comparer
const plain = (text: string) => text.replace(/\s/g, ' ')

describe('i18n (fr)', () => {
  const i18n = getI18n('fr')

  it('formate les montants en ₡', () => {
    expect(plain(i18n.credits(2500))).toBe('2 500 ₡')
    expect(plain(i18n.credits(1_000_000))).toBe('1 000 000 ₡')
    expect(plain(i18n.credits(41.6))).toBe('42 ₡')
  })

  it('formate les fractions en pourcentages', () => {
    expect(plain(i18n.percent(0.567))).toBe('56,7 %')
    expect(plain(i18n.percent(0.25))).toBe('25 %')
    expect(plain(i18n.percent(0.48195, 0))).toBe('48 %')
  })

  it('formate les multiplicateurs', () => {
    expect(i18n.multiplier(0.85)).toBe('×0,85')
    expect(i18n.multiplier(2.5)).toBe('×2,5')
  })

  it('résout les sources de Breakdown en libellés', () => {
    expect(i18n.label('D5')).toBe('The Glass Spire')
    expect(i18n.label('T4-06')).toBe('Vieux Serveur Aeterna')
    expect(i18n.label('TAG-TECH')).toBe('Tech')
    expect(i18n.label('LOC-D1-1')).toBe("L'Arrière-Salle de Viktor Varga")
    expect(i18n.label('EVT-D1-01')).toBe('Grève des Éboueurs Automatisés')
    expect(i18n.label('rule.clamp')).toBe('Plafond')
  })

  it('fait passer tout le téléscripteur en une partie, sans doublon', () => {
    const count = fr.ticker.messages.length
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
    expect(gcd(TICKER_STRIDE, count)).toBe(1)
    expect(count).toBeLessThanOrEqual(GAME_LENGTH_DAYS * 2)
    const shown = new Set(Array.from({ length: count }, (_, slot) => tickerSlot(Math.floor(slot / 2) + 1, slot % 2 ? 'night' : 'day', count)))
    expect(shown.size).toBe(count)
  })

  it('réutilise la même instance par langue', () => {
    expect(getI18n('fr')).toBe(i18n)
  })
})
