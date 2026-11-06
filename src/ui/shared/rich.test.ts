import { describe, expect, it } from 'vitest'
import { isWellFormed, parseRich } from './rich.ts'

describe('parseRich', () => {
  it('laisse un texte sans balisage en un seul morceau', () => {
    expect(parseRich('Une journée')).toEqual([{ text: 'Une journée', style: 'plain', start: 0 }])
  })

  it('découpe le gras et l’italique, positions comprises', () => {
    expect(parseRich('**ICC** : ta *conformité*.')).toEqual([
      { text: 'ICC', style: 'strong', start: 0 },
      { text: ' : ta ', style: 'plain', start: 7 },
      { text: 'conformité', style: 'em', start: 13 },
      { text: '.', style: 'plain', start: 25 },
    ])
  })

  it('signale un balisage mal fermé', () => {
    expect(isWellFormed('**Fouille** : *formalité*')).toBe(true)
    expect(isWellFormed('**Fouille : formalité')).toBe(false)
    expect(isWellFormed('Fouille* : formalité')).toBe(false)
  })
})
