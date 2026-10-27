import { ICC_DAILY_ROUTE_GAIN_CAP, ICC_TIERS } from '../data/balance.ts'
import type { GameState, IccTier } from './types.ts'

/** Palier de crédit social d'un ICC (chap. 2) */
export function iccTier(icc: number): IccTier {
  return (ICC_TIERS.find(({ min }) => icc >= min) ?? ICC_TIERS[ICC_TIERS.length - 1]).tier
}

/** Reste du plafond de gains de route d'ICC pour la journée en cours */
export function iccRouteGainLeft(state: GameState): number {
  return Math.max(0, ICC_DAILY_ROUTE_GAIN_CAP - state.iccRouteGains)
}

/** Applique un gain de route d'ICC dans la limite du plafond du jour et de 100 % ; renvoie aussi le gain réel */
export function gainRouteIcc(state: GameState, amount: number): { state: GameState; gained: number } {
  const gained = Math.max(0, Math.min(amount, iccRouteGainLeft(state), 100 - state.icc))
  return { state: { ...state, icc: state.icc + gained, iccRouteGains: state.iccRouteGains + gained }, gained }
}

/** Gain ou perte de Santé, bornée entre `floor` et 100 PV ; renvoie aussi la variation réelle */
export function changeHealth(state: GameState, delta: number, floor = 0): { state: GameState; delta: number } {
  const health = Math.min(100, Math.max(Math.min(floor, state.health), state.health + delta))
  return { state: { ...state, health }, delta: health - state.health }
}
