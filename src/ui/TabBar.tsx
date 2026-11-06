import { Landmark, Map as MapIcon, Newspaper, Store, Truck, type LucideIcon } from 'lucide-react'
import { useI18n } from '../i18n/useI18n.ts'
import { FOCUS_RING } from './shared/focus.ts'
import { TAB_GROUP, type Tab, type TabGroup } from './tabs.ts'

export type { Tab, TabGroup } from './tabs.ts'

/** Onglet ouvert en choisissant un groupe : le premier de ses blocs */
const GROUP_TAB: Record<TabGroup, Tab> = { brief: 'fil', trade: 'market', road: 'map' }

const GROUPS: readonly TabGroup[] = ['brief', 'trade', 'road']

const groupIcons: Record<TabGroup, LucideIcon> = { brief: Newspaper, trade: Store, road: MapIcon }

type TabBarProps = {
  current: Tab
  /** Onglets proposés, dans l'ordre d'affichage */
  tabs: readonly Tab[]
  onPick: (tab: Tab) => void
}

const icons: Record<Tab, LucideIcon> = {
  fil: Newspaper,
  market: Store,
  places: Landmark,
  vehicle: Truck,
  map: MapIcon,
}

/**
 * Barre d'onglets fixée en bas de l'écran du téléphone, masquée sur grand écran. Marges en bas et sur les côtés : les
 * libellés restent hors des coins arrondis de l'écran et de la barre de gestes
 */
export default function TabBar({ current, tabs, onPick }: TabBarProps) {
  const { t } = useI18n()
  return (
    <nav aria-label={t.tabs.label} className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-panel/95 backdrop-blur md:hidden">
      <ul className="flex px-3 pb-safe">
        {tabs.map((tab) => {
          const Icon = icons[tab]
          const active = tab === current
          return (
            <li key={tab} className="flex-1">
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onPick(tab)}
                className={`flex w-full flex-col items-center gap-0.5 border-t-2 py-2 text-xs uppercase ${FOCUS_RING} ${
                  active ? 'border-accent text-accent' : 'border-transparent text-ink-muted'
                }`}
              >
                <Icon size={20} aria-hidden="true" />
                {t.tabs[tab]}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** Onglets du grand écran, sous le bandeau : toute la largeur de l'écran de jeu, un tiers chacun ; masqués sur téléphone */
export function DesktopTabs({ current, onPick }: Omit<TabBarProps, 'tabs'>) {
  const { t } = useI18n()
  const group = TAB_GROUP[current]
  return (
    <nav aria-label={t.tabs.label} className="hidden md:col-span-5 md:block">
      <ul className="grid grid-cols-3 border-b border-line">
        {GROUPS.map((id) => {
          const Icon = groupIcons[id]
          const active = id === group
          return (
            <li key={id}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onPick(GROUP_TAB[id])}
                className={`-mb-px flex w-full items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm uppercase transition-colors ${FOCUS_RING} ${
                  active
                    ? 'border-accent bg-accent/10 font-bold text-accent'
                    : 'border-transparent text-ink-muted hover:bg-raised hover:text-ink-soft'
                }`}
              >
                <Icon size={18} aria-hidden="true" />
                {t.tabs.groups[id]}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
