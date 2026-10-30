import { ChevronDown, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { useSettingsStore } from '../../stores/settingsStore.ts'
import { FOCUS_RING } from './focus.ts'
import { useCollapsed } from './useCollapsed.ts'

type CollapseToggleProps = {
  /** Identifiant du panneau, mémorisé dans les réglages */
  id: string
  children: ReactNode
}

/** Titre de panneau cliquable : replie ou déplie le panneau pour faire de la place (chap. 7) */
export default function CollapseToggle({ id, children }: CollapseToggleProps) {
  const collapsed = useCollapsed(id)
  const toggle = useSettingsStore((s) => s.toggleCollapsed)
  const Chevron = collapsed ? ChevronRight : ChevronDown
  return (
    <button
      type="button"
      aria-expanded={!collapsed}
      onClick={() => toggle(id)}
      className={`flex w-full cursor-pointer items-center gap-1.5 rounded text-left font-bold uppercase ${FOCUS_RING}`}
    >
      <Chevron size={14} aria-hidden="true" className="shrink-0 text-ink-faint" />
      {children}
    </button>
  )
}
