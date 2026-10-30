import { LOCATIONS } from '../../data/locations.ts'
import { keysOf } from '../../engine/records.ts'
import type { DistrictId, LocationId } from '../../engine/types.ts'

/** Lieux spéciaux du district qui rendent un service implémenté */
export function placesHere(districtId: DistrictId): LocationId[] {
  return keysOf(LOCATIONS).filter((id) => LOCATIONS[id].district === districtId && LOCATIONS[id].services.length > 0)
}
