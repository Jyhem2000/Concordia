import { INFLATION_PERIOD_DAYS } from '../data/balance.ts'
import { breakdown, type Breakdown, type BreakdownSource } from './breakdown.ts'

/** Indice d'inflation algorithmique du jour (chap. 7) : ×1 au Jour 1, puis croissance linéaire */
export function inflationIndex(day: number): number {
  return 1 + (day - 1) / INFLATION_PERIOD_DAYS
}

/** Montant de base (valeur au Jour 1) indexé sur l'inflation du jour, arrondi au ₡ */
export function indexed(source: BreakdownSource, baseAmount: number, day: number): Breakdown {
  return breakdown(source, baseAmount).mul('rule.inflation', inflationIndex(day)).round().build()
}
