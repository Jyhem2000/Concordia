import { Eye, PartyPopper, Siren, Sparkles, Truck, type LucideIcon } from 'lucide-react'
import { crewEffect } from '../../engine/crew.ts'
import type { DistrictId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import { TONE_TEXT, type Tone } from '../shared/styles.ts'
import Tip from '../shared/Tip.tsx'

type DistrictSignsProps = {
  districtId: DistrictId
  /** Ajoute l'icône de l'événement local du jour (sur la carte, où son nom ne tient pas) */
  withEvent?: boolean
}

type Sign = {
  key: string
  icon: LucideIcon
  label: string
  tone: Tone
}

/** Bulles d'indices d'un district (chap. 7) : mission de nuit, ronde renforcée, after du couvre-feu, pic suspect, événement */
export default function DistrictSigns({ districtId, withEvent = false }: DistrictSignsProps) {
  // Destination de la mission de nuit acceptée
  const missionHere = useGameStore((s) => s.game.phase === 'night' && s.game.mission?.to === districtId)
  // Vance révèle chaque matin le district de la ronde renforcée
  const patrolled = useGameStore((s) => Boolean(crewEffect(s.game, 'revealsPatrol')) && s.game.patrolDistrict === districtId)
  // After du couvre-feu de ce soir, annoncée dès 06h00
  const after = useGameStore((s) => s.game.after === districtId)
  const peak = useGameStore((s) => s.game.suspiciousPeaks.includes(districtId))
  const event = useGameStore((s) => s.game.events.local[districtId])
  const { t } = useI18n()

  const candidates: (Sign | false)[] = [
    missionHere && { key: 'mission', icon: Truck, label: t.travel.mission, tone: 'info' },
    patrolled && { key: 'patrol', icon: Siren, label: t.travel.patrol, tone: 'info' },
    after && { key: 'after', icon: PartyPopper, label: t.travel.after, tone: 'event' },
    peak && { key: 'peak', icon: Eye, label: t.travel.peak, tone: 'danger' },
    withEvent && event !== undefined && event !== null && { key: 'event', icon: Sparkles, label: t.event[event].name, tone: 'accent' },
  ]
  const signs = candidates.filter((sign): sign is Sign => sign !== false)
  if (signs.length === 0) return null

  return (
    <span className="inline-flex gap-1">
      {signs.map(({ key, icon: Icon, label, tone }) => (
        <Tip key={key} content={label} className={TONE_TEXT[tone]}>
          <Icon size={14} aria-hidden="true" />
          <span className="sr-only">{label}</span>
        </Tip>
      ))}
    </span>
  )
}
