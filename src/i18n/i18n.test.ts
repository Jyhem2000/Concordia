import { describe, expect, it } from 'vitest'
import { GAME_LENGTH_DAYS } from '../data/balance.ts'
import { keysOf } from '../engine/records.ts'
import { TICKER_PER_DAY, TICKER_STRIDE, tickerSlots } from '../ui/hud/tickerSlot.ts'
import { isWellFormed } from '../ui/shared/rich.ts'
import enSource from './en.ts?raw'
import frSource from './fr.ts?raw'
import { detectLocale, getI18n, locales, type Locale } from './index.ts'

// Intl insère des espaces insécables (U+00A0, U+202F) : on les normalise pour comparer
const plain = (text: string) => text.replace(/\s/g, ' ')

/** Longueur maximale d'un nom de produit (chap. 2) : il tient sur une ligne du marché */
const PRODUCT_NAME_MAX = 35

/** Source de chaque catalogue, pour les vérifications sur le texte écrit */
const sources: Record<Locale, string> = { fr: frSource, en: enSource }

/**
 * Chiffres permis dans les textes d'interface de chaque langue : structure du jeu (horaires, une unité, zéro, échelle
 * des étoiles) et lore sans effet de jeu
 */
const allowedDigits: Record<Locale, RegExp[]> = {
  fr: [
    /\d{2}h\d{2}/g, // horaires fixes : 06h00, 20h00
    /\b1 (×|caisse|trajet|ration)/g, // une unité
    /[Tt]ier 0/g, // nom de la règle de bluff
    /[Jj]our 1\b/g, // début de partie
    /\b0 (à|et) |à 0\b/g, // zéro
    /sur 5\b/g, // échelle des étoiles de sécurité
    /Cassandre-88|Quai 9|300 m|90 décibels|3 balles|400 ml|8 secondes|70 km\/h|15 km\/h/g, // lore
  ],
  en: [
    /\d{2}:\d{2}/g, // horaires fixes : 06:00, 20:00
    /\b1 (×|crate|trip|ration)/g, // une unité
    /[Tt]ier 0/g, // nom de la règle de bluff
    /[Dd]ay 1\b/g, // début de partie
    /\b0 (to|and) |at 0\b/g, // zéro
    /out of 5\b/g, // échelle des étoiles de sécurité
    /Cassandre-88|Quai 9|300 m|90 decibels|3 bullets|400 ml|8 seconds|70 km\/h|15 km\/h/g, // lore
  ],
}

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

  it('formate les facteurs en variations', () => {
    expect(plain(i18n.change(0.85))).toBe('-15 %')
    expect(plain(i18n.change(2.5))).toBe('+150 %')
    expect(plain(i18n.change(1))).toBe('0 %')
  })

  it('résout les sources de Breakdown en libellés', () => {
    expect(i18n.label('D5')).toBe('The Glass Spire')
    expect(i18n.label('T4-06')).toBe('Vieux serveur Aeterna')
    expect(i18n.label('TAG-TECH')).toBe('Tech')
    expect(i18n.label('LOC-D1-1')).toBe("L'Arrière-salle de Viktor Varga")
    expect(i18n.label('EVT-D1-01')).toBe('Grève des éboueurs automatisés')
    expect(i18n.label('rule.clamp')).toBe('Plafond')
  })

  it('réutilise la même instance par langue', () => {
    expect(getI18n('fr')).toBe(i18n)
  })
})

describe('i18n (en)', () => {
  const i18n = getI18n('en')

  it('formate les montants, pourcentages et variations à l’anglaise', () => {
    expect(plain(i18n.credits(2500))).toBe('2,500 ₡')
    expect(i18n.percent(0.567)).toBe('56.7%')
    expect(i18n.change(0.85)).toBe('-15%')
  })

  it('écrit les rangs en ordinaux anglais', () => {
    const { rank } = i18n.t.ranked.board
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 101].map(rank)).toEqual([
      '1st',
      '2nd',
      '3rd',
      '4th',
      '11th',
      '12th',
      '13th',
      '21st',
      '22nd',
      '23rd',
      '101st',
    ])
  })

  it('garde les noms propres et traduit les noms communs', () => {
    expect(i18n.label('D5')).toBe('The Glass Spire')
    expect(i18n.label('LOC-D1-1')).toBe("Viktor Varga's Back Room")
    expect(i18n.label('rule.clamp')).toBe('Cap')
  })
})

describe('langue du premier lancement', () => {
  it('prend la première langue du navigateur que le jeu parle', () => {
    expect(detectLocale(['fr-CA', 'en-US'])).toBe('fr')
    expect(detectLocale(['de-DE', 'en-GB'])).toBe('en')
    expect(detectLocale(['FR'])).toBe('fr')
  })

  it("se rabat sur l'anglais", () => {
    expect(detectLocale(['de-DE', 'ja'])).toBe('en')
    expect(detectLocale([])).toBe('en')
  })
})

describe.each(keysOf(locales))('catalogue %s', (locale) => {
  const t = locales[locale]

  it('garde des noms de produits courts : le lore va dans la fiche', () => {
    for (const { name } of Object.values(t.product)) expect(name.length).toBeLessThanOrEqual(PRODUCT_NAME_MAX)
  })

  it('fait passer tout le téléscripteur avant de répéter un message', () => {
    const count = t.ticker.messages.length
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
    expect(gcd(TICKER_STRIDE, count)).toBe(1)
    const days = Math.ceil(count / TICKER_PER_DAY)
    expect(days).toBeLessThanOrEqual(GAME_LENGTH_DAYS)
    const shown = Array.from({ length: days }, (_, index) => tickerSlots(index + 1, count)).flat()
    expect(new Set(shown.slice(0, count)).size).toBe(count)
  })

  it('ne contient aucun chiffre de règle en dur : les valeurs viennent de src/data en paramètres', () => {
    const ids = /'?\b(T\d-\d\d|EVT-[A-Z0-9-]+|MOD-\d\d|VEH-\d\d|CREW-\d\d|LOC-D\d-\d|D\d|rule\.[a-z0-9-]+)\b'?/g
    // Textes d'interface seulement : les noms des données de jeu, plus bas, sont du lore
    const source = sources[locale]
    const body = source.slice(source.indexOf(`export const ${locale} = {`), source.indexOf('// ─── Données de jeu'))
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
      for (const pattern of allowedDigits[locale]) text = text.replace(pattern, '')
      return /\d/.test(text) ? [line.trim()] : []
    })
    expect(offending).toEqual([])
  })

  it('ne balise que les textes longs, et les ferme tous', () => {
    // Accueil et manuel, rendus par `Rich` : un balisage mal fermé laisserait des astérisques à l'écran
    const chapters = t.manual.chapters(GAME_LENGTH_DAYS, [{ mode: t.difficulty.modes.citizen.name, debt: 'debt' }])
    const rich = [
      ...t.title.world,
      ...t.title.role,
      ...t.title.goal(GAME_LENGTH_DAYS, 'debt', 'cash'),
      ...t.title.day,
      ...Object.values(t.title.teaser),
      ...chapters.flatMap((chapter) => chapter.paragraphs),
      ...Object.values(t.manual.tags),
      ...Object.values(t.manual.places),
    ]
    expect(rich.filter((text) => !isWellFormed(text))).toEqual([])
    // Ailleurs, aucun astérisque : ces textes s'affichent tels quels
    const leaves = (value: unknown): string[] =>
      typeof value === 'string' ? [value] : typeof value === 'object' && value !== null ? Object.values(value).flatMap(leaves) : []
    const others = Object.entries(t).flatMap(([key, section]) => (key === 'title' || key === 'manual' ? [] : leaves(section)))
    expect(others.filter((text) => text.includes('*'))).toEqual([])
  })

  it('a autant de chapitres de manuel et de lignes d’accueil que le français', () => {
    const { fr } = locales
    const chapters = (messages: typeof fr) => messages.manual.chapters(GAME_LENGTH_DAYS, []).map((chapter) => chapter.paragraphs.length)
    expect(chapters(t)).toEqual(chapters(fr))
    expect([t.title.world.length, t.title.role.length, t.title.day.length]).toEqual([
      fr.title.world.length,
      fr.title.role.length,
      fr.title.day.length,
    ])
    expect(t.ticker.messages.length).toBe(fr.ticker.messages.length)
    expect(t.events.names.length).toBe(fr.events.names.length)
  })
})
