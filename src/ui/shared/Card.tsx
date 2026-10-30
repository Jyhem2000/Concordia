import type { ReactNode } from 'react'

type CardProps = {
  /** `li` dans une liste d'options, `div` sinon */
  as?: 'li' | 'div'
  className?: string
  children: ReactNode
}

/** Carte posée dans un écran ou un panneau : une option du barrage ou d'un aléa, un guichet */
export default function Card({ as: Tag = 'div', className = '', children }: CardProps) {
  return <Tag className={`rounded-lg border border-line bg-panel p-3 text-sm ${className}`}>{children}</Tag>
}
