import { describe, expect, it } from 'vitest'
import { GAME_LENGTH_DAYS } from '../data/balance.ts'
import { tickerSlot, TICKER_STRIDE } from '../ui/hud/tickerSlot.ts'
import { getI18n } from './index.ts'
import { fr } from './fr.ts'
import frSource from './fr.ts?raw'

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

  it('ne contient aucun chiffre de règle en dur : les valeurs viennent de src/data en paramètres', () => {
    // Chiffres permis : structure du jeu (horaires, une unité, zéro, échelle des étoiles) et lore sans effet de jeu
    const allowed = [
      /\d{2}h\d{2}/g, // horaires fixes : 06h00, 20h00
      /\b1 (×|caisse|trajet|ration)/g, // une unité
      /Tier 0/g, // nom de la règle de bluff
      /Jour 1\b/g, // début de partie
      /1 \+ \(jour − 1\)/g, // formule de l'indice, affichée telle quelle
      /\b0 (à|et) |à 0\b/g, // zéro
      /sur 5\b/g, // échelle des étoiles de sécurité
      /Cassandre-88|300 m|90 décibels|3 balles|400 ml|8 secondes|70 km\/h|15 km\/h/g, // lore
    ]
    const ids = /'?\b(T\d-\d\d|EVT-[A-Z0-9-]+|MOD-\d\d|VEH-\d\d|CREW-\d\d|LOC-D\d-\d|D\d|rule\.[a-z0-9-]+)\b'?/g
    // Textes d'interface seulement : les noms des données de jeu, plus bas, sont du lore
    const body = frSource.slice(frSource.indexOf('export const fr = {'), frSource.indexOf('// ─── Données de jeu'))
    // Le catalogue du téléscripteur est du lore pur
    const lines = body.replace(/ {4}messages: \[[\s\S]*?\n {4}\],/, '').split('\n')
    const offending = lines.flatMap((line) => {
      if (/^\s*(\/\/|\/\*|\*)/.test(line)) return []
      // Clés numériques et comparaisons du code (accords) ne sont pas du texte
      let text = line
        .replace(/^\s*\d+:/, '')
        .replace(ids, '')
        .replace(/[<>]=? \d+/g, '')
      // Expressions des gabarits (accords, paramètres), de l'intérieur vers l'extérieur
      while (/\$\{[^{}]*\}/.test(text)) text = text.replace(/\$\{[^{}]*\}/g, '')
      for (const pattern of allowed) text = text.replace(pattern, '')
      return /\d/.test(text) ? [line.trim()] : []
    })
    expect(offending).toEqual([])
  })

  it('réutilise la même instance par langue', () => {
    expect(getI18n('fr')).toBe(i18n)
  })
})
