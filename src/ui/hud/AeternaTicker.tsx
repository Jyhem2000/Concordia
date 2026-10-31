import { Tv } from 'lucide-react'
import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import { APPEAR } from '../shared/motion.ts'
import { tickerSlots } from './tickerSlot.ts'

type AeternaTickerProps = {
  className?: string
}

/** Sans défilement (animations réduites) : un message à la fois, relayé par un fondu à cet intervalle */
const STILL_ROTATION_MS = 8000

/** Vitesse de défilement, en pixels par seconde : la même pour un message court ou long */
const SCROLL_SPEED = 60

/**
 * Téléscripteur d'Aeterna (chap. 7) : bandeau sous les onglets, dans la couleur de la diffusion d'Aeterna. Les trois
 * messages du jour passent l'un après l'autre : chacun traverse le bandeau en entier, puis le suivant entre, et l'on
 * revient au premier. Si le système réduit les animations, ils se relaient sans défiler.
 */
export default function AeternaTicker({ className = '' }: AeternaTickerProps) {
  const day = useGameStore((s) => s.game.day)
  const { t } = useI18n()
  const still = useReducedMotion()
  const messages = tickerSlots(day, t.ticker.messages.length).map((index) => t.ticker.messages[index])
  // Message en cours : état d'interface éphémère
  const [shown, setShown] = useState(0)
  const message = messages[shown % messages.length]
  // Bandeau et message en cours : la traversée se règle sur leurs largeurs réelles
  const [box, setBox] = useState<HTMLDivElement | null>(null)
  const [scope, animate] = useAnimate<HTMLSpanElement>()

  useEffect(() => {
    if (!still) return
    const timer = window.setInterval(() => setShown((index) => index + 1), STILL_ROTATION_MS)
    return () => window.clearInterval(timer)
  }, [still])

  // Traversée du message en cours, du bord droit du bandeau jusqu'à sa sortie à gauche, puis le message suivant
  useEffect(() => {
    const node = scope.current
    if (still || !box || !node) return
    const from = box.clientWidth
    const to = -node.scrollWidth
    let stopped = false
    const controls = animate(node, { x: [from, to] }, { duration: (from - to) / SCROLL_SPEED, ease: 'linear' })
    controls.then(() => {
      if (!stopped) setShown((index) => index + 1)
    })
    return () => {
      stopped = true
      controls.stop()
    }
  }, [still, box, shown, day, animate, scope])

  return (
    <div
      role="marquee"
      aria-label={t.ticker.label}
      className={`flex items-center gap-2 rounded-md border border-broadcast/40 bg-broadcast/10 px-3 py-1.5 text-xs ${className}`}
    >
      <span className="flex shrink-0 items-center gap-1.5 font-bold text-broadcast uppercase">
        <Tv size={12} aria-hidden="true" />
        {t.ticker.label}
      </span>
      <div ref={setBox} className="relative min-w-0 flex-1 overflow-hidden whitespace-nowrap">
        {still ? (
          <AnimatePresence mode="wait" initial={false}>
            <motion.p key={shown % messages.length} {...APPEAR} className="truncate text-ink-soft italic">
              {message}
            </motion.p>
          </AnimatePresence>
        ) : (
          <span ref={scope} className="inline-block text-ink-soft italic">
            {message}
          </span>
        )}
      </div>
    </div>
  )
}
