import type { LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import CollapseToggle from './CollapseToggle.tsx'
import Tip from './Tip.tsx'
import { APPEAR, ARRIVE } from './motion.ts'
import { useCollapsed } from './useCollapsed.ts'

type PanelProps = {
  title: ReactNode
  icon?: LucideIcon
  /** Panneau repliable : identifiant du choix, mémorisé dans les réglages (chap. 7) */
  collapseId?: string
  /** À droite du titre, toujours visible (montant, état) */
  aside?: ReactNode
  /** Sous le titre, toujours visible */
  subtitle?: ReactNode
  /** Explication de l'encart en infobulle, derrière un « i » à côté du titre : utile la première fois, discrète ensuite */
  info?: ReactNode
  /** `highlight` : briefing du matin ; `report` : compte rendu d'un trajet ou d'un barrage */
  tone?: 'default' | 'highlight' | 'report'
  /** Corps sans marge intérieure, pour les listes pleine largeur */
  flush?: boolean
  /** Corps étiré sur toute la hauteur du panneau (panneaux côte à côte de même hauteur) */
  fill?: boolean
  children: ReactNode
}

const tones = {
  default: 'border-line bg-panel',
  highlight: 'border-accent/40 bg-accent/10',
  report: 'border-line-strong bg-raised',
}

/** Panneau de l'écran : titre en capitales (repliable au besoin), puis son contenu. Pas de `overflow-hidden` : les bulles de détail débordent du panneau */
export default function Panel({
  title,
  icon: Icon,
  collapseId,
  aside,
  subtitle,
  info,
  tone = 'default',
  flush = false,
  fill = false,
  children,
}: PanelProps) {
  // Sans identifiant, le panneau ne se replie jamais : aucun réglage ne porte le nom vide
  const collapsed = useCollapsed(collapseId ?? '')
  const heading = (
    <>
      {Icon && <Icon size={14} aria-hidden="true" className="shrink-0" />}
      {title}
    </>
  )

  return (
    <motion.section {...(tone === 'default' ? {} : ARRIVE)} className={`rounded-lg border text-sm ${fill ? 'flex flex-col' : ''} ${tones[tone]}`}>
      <div className={`px-3 py-2 ${collapsed ? '' : 'border-b border-line'}`}>
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <h2 className="min-w-0 font-bold tracking-wide text-accent uppercase">
              {collapseId ? <CollapseToggle id={collapseId}>{heading}</CollapseToggle> : <span className="flex items-center gap-1.5">{heading}</span>}
            </h2>
            {info && <Tip label={typeof title === 'string' ? title : ''} content={info} wide />}
          </div>
          {aside}
        </div>
        {subtitle && <div className="mt-0.5 text-xs text-ink-muted">{subtitle}</div>}
      </div>
      {!collapsed && (
        <motion.div {...APPEAR} className={`${flush ? '' : 'p-3'} ${fill ? 'flex flex-1 flex-col' : ''}`}>
          {children}
        </motion.div>
      )}
    </motion.section>
  )
}
