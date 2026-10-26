import { describe, expect, it } from 'vitest'
import { getI18n } from './index.ts'

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

  it("laisse l'ID visible quand une règle n'a pas de libellé", () => {
    expect(i18n.label('rule.inconnue')).toBe('rule.inconnue')
  })

  it('réutilise la même instance par langue', () => {
    expect(getI18n('fr')).toBe(i18n)
  })
})
