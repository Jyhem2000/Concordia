import { LOCATIONS } from '../../data/locations.ts'
import { keysOf } from '../../engine/records.ts'
import type { DistrictId, LocationId } from '../../engine/types.ts'

/** Lieux spéciaux du district qui rendent un service ; le garage, qui touche au véhicule, s'affiche dans l'onglet Véhicule */
export function placesHere(districtId: DistrictId, garage = false): LocationId[] {
  return keysOf(LOCATIONS).filter(
    (id) => LOCATIONS[id].district === districtId && LOCATIONS[id].services.length > 0 && LOCATIONS[id].services.includes('garage') === garage,
  )
}

/** Tous les lieux spéciaux du district, garage compris */
export function allPlacesHere(districtId: DistrictId): LocationId[] {
  return [...placesHere(districtId), ...placesHere(districtId, true)]
}

/** District du garage de Mécano-Mitch */
export function garageDistrict(): DistrictId | null {
  return (
    keysOf(LOCATIONS)
      .map((id) => LOCATIONS[id])
      .find((location) => location.services.includes('garage'))?.district ?? null
  )
}
