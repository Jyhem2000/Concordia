/** Morceau d'un texte balisé : son style et sa position dans le texte (clé stable du rendu) */
export type RichSegment = {
  text: string
  style: 'plain' | 'strong' | 'em'
  start: number
}

// `**gras**` d'abord, pour qu'il ne soit pas lu comme deux italiques vides ; ni imbrication ni passage à la ligne
const MARKUP = /\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g

/**
 * Découpe un texte long de `src/i18n/` (accueil, manuel) en morceaux simples, gras et italiques (chap. 7).
 * Un astérisque sans pendant reste tel quel : `isWellFormed` le signale aux tests.
 */
export function parseRich(text: string): RichSegment[] {
  const segments: RichSegment[] = []
  let cursor = 0
  for (const match of text.matchAll(MARKUP)) {
    if (match.index > cursor) segments.push({ text: text.slice(cursor, match.index), style: 'plain', start: cursor })
    const [, strong, em] = match
    segments.push(strong === undefined ? { text: em, style: 'em', start: match.index } : { text: strong, style: 'strong', start: match.index })
    cursor = match.index + match[0].length
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), style: 'plain', start: cursor })
  return segments
}

/** Balisage bien fermé : plus aucun astérisque une fois le texte découpé */
export function isWellFormed(text: string): boolean {
  return parseRich(text).every((segment) => !segment.text.includes('*'))
}
