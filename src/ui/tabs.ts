/** Onglets du téléphone (chap. 7) */
export type Tab = 'fil' | 'market' | 'places' | 'vehicle' | 'map'

/** Onglets du grand écran : chacun regroupe des onglets du téléphone, côte à côte */
export type TabGroup = 'brief' | 'trade' | 'road'

/** Groupe de chaque onglet du téléphone sur grand écran */
export const TAB_GROUP: Record<Tab, TabGroup> = { fil: 'brief', market: 'trade', vehicle: 'trade', map: 'road', places: 'road' }
