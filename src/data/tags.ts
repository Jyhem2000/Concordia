import type { Tag, TagId } from '../engine/types.ts'

/*
 * Tags système : effets chiffrés sur le risque d'interception et le contrôle. Les règles
 * (masquage, fraîcheur, casse…) sont au chap. 3, les libellés dans src/i18n/fr.ts.
 */

export const TAGS: Readonly<Record<TagId, Tag>> = {
  'TAG-LEGAL': { cover: 0.2 },
  'TAG-PERISHABLE': {},
  'TAG-FRAGILE': {},
  'TAG-ADDICTIVE': {},
  'TAG-ODOROUS': { tripRisk: 0.25, bluffMalus: 0.2, smell: true },
  'TAG-CULTURE': { detectedRisk: 0.25 },
  'TAG-TECH': { detectedRisk: 0.5 },
  'TAG-CHEMICAL': { detectedRisk: 0.25 },
  'TAG-FLAMMABLE': {},
}
