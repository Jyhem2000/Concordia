import type { Location, LocationId } from '../engine/types.ts'

/*
 * Lieux spéciaux (chap. 4) : district d'accueil et services implémentés. Le détail des services
 * et le lore sont au chap. 4, les noms dans src/i18n/fr.ts.
 */

export const LOCATIONS: Readonly<Record<LocationId, Location>> = {
  'LOC-D1-1': { district: 'D1', services: ['debt'] },
  'LOC-D1-2': { district: 'D1', services: [] },
  'LOC-D2-1': { district: 'D2', services: [] },
  'LOC-D3-1': { district: 'D3', services: [] },
  'LOC-D4-1': { district: 'D4', services: [] },
  'LOC-D4-2': { district: 'D4', services: [] },
  'LOC-D5-1': { district: 'D5', services: ['offshore'] },
  'LOC-D6-1': { district: 'D6', services: [] },
}
