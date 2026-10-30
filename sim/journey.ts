import { netWealth } from '../src/engine/journal.ts'
import type { Highlight } from '../src/engine/types.ts'
import type { GameRecord } from './runner.ts'

/*
 * Parcours d'une partie simulée (chap. 8), lu dans le carnet de route que tient le moteur :
 * aucun relevé en double dans le simulateur.
 */

/** Jours de référence du patrimoine dans le rapport */
export const WEALTH_DAYS = [5, 10, 20, 30] satisfies readonly number[]

/** Faits marquants de toute la partie, avec leur jour */
function highlightsOf(record: GameRecord): { day: number; highlight: Highlight }[] {
  return record.journal.flatMap((log) => log.highlights.map((highlight) => ({ day: log.day, highlight })))
}

/** Équipement acquis (châssis, modules, équipiers), avec son jour */
export function purchasesOf(record: GameRecord): { item: string; day: number }[] {
  return highlightsOf(record).flatMap(({ day, highlight }): { item: string; day: number }[] => {
    switch (highlight.kind) {
      case 'vehicle':
        return [{ item: highlight.vehicleId, day }]
      case 'module':
        return [{ item: highlight.moduleId, day }]
      case 'crew':
        return [{ item: highlight.crewId, day }]
      default:
        return []
    }
  })
}

/** Patrimoine net au matin du jour donné, ou null si la partie s'est arrêtée avant */
export function wealthOn(record: GameRecord, day: number): number | null {
  const log = record.journal.find((entry) => entry.day === day)
  return log ? netWealth(log.start) : null
}

/** Nombre de faits marquants d'un genre, avec un filtre éventuel */
export function countOf(record: GameRecord, kind: Highlight['kind'], keep: (highlight: Highlight) => boolean = () => true): number {
  return highlightsOf(record).filter(({ highlight }) => highlight.kind === kind && keep(highlight)).length
}

/** Contrôle réglé avec des caisses perdues (saisie, éjection, racket…) */
export const lostCrates = (highlight: Highlight) => highlight.kind === 'control' && highlight.crates < 0
