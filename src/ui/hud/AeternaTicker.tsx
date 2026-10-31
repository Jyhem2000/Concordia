import { Tv } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
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

/**
 * Téléscripteur d'Aeterna (chap. 7) : bandeau sous les onglets, dans la couleur de la diffusion d'Aeterna. Trois messages
 * par jour défilent à la suite ; si le système réduit les animations, ils se relaient en fondu, sans défiler.
 */
export default function AeternaTicker({ className = '' }: AeternaTickerProps) {
  const day = useGameStore((s) => s.game.day)
  const { t } = useI18n()
  const still = useReducedMotion()
  const messages = tickerSlots(day, t.ticker.messages.length).map((index) => t.ticker.messages[index])
  // Message affiché sans défilement : état d'interface éphémère
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (!still) return
    const timer = window.setInterval(() => setShown((index) => index + 1), STILL_ROTATION_MS)
    return () => window.clearInterval(timer)
  }, [still])
  const line = messages.join('   ◆   ')

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
      <div className="min-w-0 flex-1 overflow-hidden">
        {still ? (
          <AnimatePresence mode="wait" initial={false}>
            <motion.p key={shown % messages.length} {...APPEAR} className="truncate text-ink-soft italic">
              {messages[shown % messages.length]}
            </motion.p>
          </AnimatePresence>
        ) : (
          <p className="flex w-max animate-marquee gap-12 text-ink-soft italic">
            <span>{line}</span>
            {/* Seconde copie pour boucler sans saut ; ignorée des lecteurs d'écran */}
            <span aria-hidden="true">{line}</span>
          </p>
        )}
      </div>
    </div>
  )
}
