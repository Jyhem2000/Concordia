import type { Tag, TagId } from '../engine/types.ts'

/*
 * Tags système : effets chiffrés sur le risque d'interception et le contrôle. Les règles
 * (masquage, fraîcheur, casse…) sont au chap. 2, les libellés dans src/i18n/fr.ts.
 */

export const TAGS: Readonly<Record<TagId, Tag>> = {
  'TAG-LEGAL': { cover: 0.2 },
  'TAG-PERISHABLE': { perishable: true },
  'TAG-FRAGILE': { breakage: { fleeChance: 0.3, shockChance: 0.1, shockThreshold: 10 } },
  // Clientèle captive (chap. 2) : les accros reviennent chaque matin, le rachat se reconstitue plus vite
  'TAG-ADDICTIVE': { demandRefill: 2 },
  'TAG-ODOROUS': { tripRisk: 0.25, bluffMalus: 0.2, smell: true },
  'TAG-CULTURE': { detectedRisk: 0.25 },
  'TAG-TECH': { detectedRisk: 0.5 },
  'TAG-BIO': { detectedRisk: 0.25 },
  // Vente pendant le couvre-feu (chap. 2) : la vie nocturne réclame ses vices
  'TAG-FESTIVE': { nightSale: 2 },
  // Luxe : ce qu'un agent corrompu accepte en nature, et qui lui fait fermer les yeux (chap. 5)
  'TAG-LUXURY': { bribeGift: true },
  // Gourmet : la vraie nourriture d'avant, ce que sublime Mama Rosa (chap. 4)
  'TAG-GOURMET': { gourmet: true },
}
