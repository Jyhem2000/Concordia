import { create } from 'zustand'
import type { DistrictId } from '../../engine/types.ts'

type MapFocus = {
  /** District touché sur la carte : sa fiche et son itinéraire restent affichés */
  selected: DistrictId | null
  /** District survolé à la souris, le temps du survol */
  hovered: DistrictId | null
  select: (districtId: DistrictId | null) => void
  hover: (districtId: DistrictId | null) => void
}

/** Choix sur la carte (état d'interface éphémère, non sauvegardé), partagé par la carte et la liste des destinations */
export const useMapFocus = create<MapFocus>()((set) => ({
  selected: null,
  hovered: null,
  select: (selected) => set({ selected }),
  hover: (hovered) => set({ hovered }),
}))
