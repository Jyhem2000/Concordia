import { GAME_LENGTH_DAYS, PROTECTION } from '../data/balance.ts'
import { LOTTERY } from '../data/events.ts'
import { trapdoorReadyDay } from './equipment.ts'
import { nextDebtDeadline } from './finance.ts'
import { pendingServices } from './services.ts'
import type { DistrictId, GameState, GlobalEventId, ProductId, ServiceKey } from './types.ts'

/** Échéance connue à coup sûr (chap. 7) : rien de ce qui est caché ou incertain (rumeur, ronde renforcée) */
export type AgendaItem =
  | { kind: 'debt'; day: number }
  | { kind: 'debtLate'; day: number }
  | { kind: 'protection'; day: number }
  | { kind: 'lottery'; day: number }
  | { kind: 'vice'; day: number; productId: ProductId; districtId: DistrictId }
  | { kind: 'prophecy'; day: number; event: GlobalEventId }
  | { kind: 'service'; day: number; key: ServiceKey }
  | { kind: 'trapdoor'; day: number }
  | { kind: 'contract'; day: number; districtId: DistrictId }
  | { kind: 'audit'; day: number }

/**
 * Échéances d'aujourd'hui à l'audit, triées par jour : dette, collectes de Viktor (dette initiale soldée), fin de
 * la Lucidité (si l'on ne repasse pas à la Cantine), tirages de la Loterie, fin d'un vice, prophétie de Cassandre-88,
 * services et trappe de nouveau disponibles, dernier jour d'un contrat, audit.
 */
export function agenda(state: GameState): AgendaItem[] {
  const { day } = state
  const debt = nextDebtDeadline(state)
  const vice = state.events.lottery
  const prophecy = state.events.prophecy
  const trapdoor = trapdoorReadyDay(state)
  const items: AgendaItem[] = []
  if (debt !== null) items.push({ kind: 'debt', day: debt })
  if (state.debtLate) items.push({ kind: 'debtLate', day })
  if (state.initialDebtPaid) for (const d of PROTECTION.days) if (d > day) items.push({ kind: 'protection', day: d })
  for (const d of LOTTERY.days) if (d > day) items.push({ kind: 'lottery', day: d })
  if (vice?.vice && vice.viceDistrict && day <= vice.viceUntil)
    items.push({ kind: 'vice', day: vice.viceUntil, productId: vice.vice, districtId: vice.viceDistrict })
  if (prophecy && prophecy.day >= day) items.push({ kind: 'prophecy', day: prophecy.day, event: prophecy.event })
  for (const { key, day: ready } of pendingServices(state)) items.push({ kind: 'service', day: ready, key })
  if (trapdoor !== null) items.push({ kind: 'trapdoor', day: trapdoor })
  if (state.contract) items.push({ kind: 'contract', day: state.contract.deadline, districtId: state.contract.to })
  items.push({ kind: 'audit', day: GAME_LENGTH_DAYS })
  return items.filter((item) => item.day <= GAME_LENGTH_DAYS).sort((a, b) => a.day - b.day)
}
