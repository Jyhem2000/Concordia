import type { MotionProps } from 'motion/react'

/*
 * Animations de l'interface (Motion) : transform et opacity seulement, 200 à 300 ms.
 * `MotionConfig` (main.tsx) les coupe quand le système demande de réduire les animations.
 */

/** Apparition d'un contenu : fondu et léger glissement vers le bas */
export const APPEAR = {
  initial: { opacity: 0, y: -4 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, ease: 'easeOut' },
} satisfies MotionProps

/** Arrivée d'un compte rendu ou du briefing : glissement plus marqué */
export const ARRIVE = {
  initial: { opacity: 0, y: -12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: 'easeOut' },
} satisfies MotionProps

/** Ouverture d'une bulle ou d'une fenêtre : fondu et léger zoom */
export const POP = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.2, ease: 'easeOut' },
} satisfies MotionProps
