import { Landmark, Map as MapIcon, Store, type LucideIcon } from 'lucide-react'
import { useI18n } from '../i18n/useI18n.ts'
import { FOCUS_RING } from './shared/focus.ts'

/** Onglets du téléphone (chap. 7) ; sur desktop, tous les panneaux sont visibles */
export type Tab = 'market' | 'places' | 'map'

type TabBarProps = {
  current: Tab
  /** Onglets proposés, dans l'ordre d'affichage */
  tabs: readonly Tab[]
  onPick: (tab: Tab) => void
}

const icons: Record<Tab, LucideIcon> = {
  market: Store,
  places: Landmark,
  map: MapIcon,
}

/** Barre d'onglets fixée en bas de l'écran du téléphone, masquée sur desktop */
export default function TabBar({ current, tabs, onPick }: TabBarProps) {
  const { t } = useI18n()
  return (
    <nav aria-label={t.tabs.label} className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-panel/95 backdrop-blur md:hidden">
      <ul className="flex">
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
