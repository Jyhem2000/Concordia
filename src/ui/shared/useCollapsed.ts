import { useSettingsStore } from '../../stores/settingsStore.ts'

/** Le panneau `id` est-il replié ? (réglage du joueur, mémorisé entre les parties) */
export function useCollapsed(id: string): boolean {
  return useSettingsStore((s) => s.collapsed.includes(id))
}
