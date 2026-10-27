import {
  CROSSED_DISTRICT_RISK,
  DEBT_LATE,
  GOLD_FAST_LANE_FACTOR,
  ICC_MAX,
  NIGHT_TRIP_RISK,
  PATROL_RISK,
  RISK_BOUNDS,
  SUSPICION_PER_ICC_POINT,
  SUSPICIOUS_PEAK_RISK,
  WANTED,
} from '../data/balance.ts'
import { DISTRICT_IDS, DISTRICTS } from '../data/districts.ts'
import { LOTTERY } from '../data/events.ts'
import { PRODUCT_IDS, PRODUCTS } from '../data/products.ts'
import { TAGS } from '../data/tags.ts'
import { VEHICLES } from '../data/vehicles.ts'
import { breakdown, type Breakdown, type BreakdownBuilder } from './breakdown.ts'
import { cargoUsed, ownedQty, tagShare } from './cargo.ts'
import { moduleTagFactor } from './equipment.ts'
import { activeEffects, isPurged, tagFactor } from './events.ts'
import { iccTier } from './gauges.ts'
import { crossedDistricts, shortestRoute } from './map.ts'
import { keysOf } from './records.ts'
import type { Rng } from './rng.ts'
import type { DistrictId, GameState } from './types.ts'

/*
 * Risque d'interception à l'arrivée d'un trajet (chap. 6) :
 *   ( Base + Suspicion + Malus_Tags + Malus_Contexte − Couverture ) × Équipement × Multiplicateurs_finaux
 * borné après tous les multiplicateurs. En zone hors-réseau ([D4], chap. 4), seul le physique compte :
 * la suspicion, les tags, la couverture, la ronde, la Fiche S, le pic suspect et le coupe-file valent 0.
 */

export type RiskOptions = {
  /** La ronde renforcée est cachée au joueur : la prévision l'ignore, le tirage la compte */
  includePatrol: boolean
}

/** Risque d'un trajet vers `to` depuis la position actuelle, dans la phase actuelle */
export function riskBreakdown(state: GameState, to: DistrictId, { includePatrol }: RiskOptions): Breakdown {
  const destination = DISTRICTS[to]
  const offGrid = destination.offGrid

  // Un Déviant notoire qui entre dans un district à détecteurs biométriques est intercepté à coup sûr (chap. 2)
  if (destination.iccScanners && iccTier(state.icc) === 'deviant') return breakdown('rule.icc-scanners', 1).build()

  const risk = breakdown(to, destination.baseRisk)
  const effects = activeEffects(state, to)
  // Risque de base imposé par un événement (ex. audit du Comité de Pureté)
  for (const { source, effect } of effects) if (effect.kind === 'baseRisk') risk.set(source, effect.value)
  if (!offGrid) addGridRisks(risk, state, to, includePatrol)
  for (const { source, effect } of effects) if (effect.kind === 'risk') risk.add(source, effect.add)
  if (isPurged(state, to)) risk.add('EVT-L01', LOTTERY.promotedRisk)

  // Contexte physique : il s'applique partout, zone hors-réseau comprise
  if (state.phase === 'night') risk.add('rule.night-trip', NIGHT_TRIP_RISK)
  const crossed = crossedDistricts(shortestRoute(state.districtId, to)).length
  risk.add('rule.crossed-districts', crossed * CROSSED_DISTRICT_RISK, { count: crossed })
  risk.add('rule.exit-gate', DISTRICTS[state.districtId].exitGateRisk)
  for (const id of PRODUCT_IDS) {
    const beacon = PRODUCTS[id].beaconRisk
    if (beacon && ownedQty(state.cargo, id) > 0) risk.add(id, beacon)
  }
  if (state.debtLate) risk.add('rule.ambush', DEBT_LATE.ambushRisk)
  // Tonnage hors-norme : physique, il compte aussi en zone hors-réseau
  const vehicle = VEHICLES[state.vehicleId]
  if (vehicle.heavy) risk.add(state.vehicleId, vehicle.heavy.riskAdd)

  if (vehicle.riskFactor !== undefined) risk.mul(state.vehicleId, vehicle.riskFactor)
  // Camouflage corporatif : assez de Légal en soute (une soute vide n'a rien à cacher)
  const camouflage = vehicle.legalCamouflage
  if (!offGrid && camouflage && (cargoUsed(state.cargo) === 0 || tagShare(state.cargo, 'TAG-LEGAL') >= camouflage.minShare)) {
    risk.mul(state.vehicleId, camouflage.factor)
  }
  if (!offGrid && destination.goldFastLane && iccTier(state.icc) === 'gold') risk.mul('rule.gold-fast-lane', GOLD_FAST_LANE_FACTOR)
  // Risque final d'un événement : après tous les autres termes, avant les bornes
  for (const { source, effect } of effects) if (effect.kind === 'finalRisk') risk.mul(source, effect.factor)

  return risk.clamp(RISK_BOUNDS.min, RISK_BOUNDS.max).build()
}

/** Ronde renforcée du jour : un district sous contrôle d'Aeterna, tiré au hasard, caché au joueur (chap. 6) */
export function drawPatrol(rng: Rng): DistrictId {
  return rng.pick(DISTRICT_IDS.filter((id) => !DISTRICTS[id].offGrid))
}

export function risk(state: GameState, to: DistrictId, options: RiskOptions): number {
  return riskBreakdown(state, to, options).total
}

/** Termes qui dépendent d'Aeterna : ils n'existent que hors zone hors-réseau */
function addGridRisks(risk: BreakdownBuilder, state: GameState, to: DistrictId, includePatrol: boolean) {
  const destination = DISTRICTS[to]
  if (state.suspiciousPeaks.includes(to)) risk.add('rule.suspicious-peak', SUSPICIOUS_PEAK_RISK)
  risk.add('rule.suspicion', (ICC_MAX - state.icc) * SUSPICION_PER_ICC_POINT)

  for (const tag of keysOf(TAGS)) {
    const share = tagShare(state.cargo, tag)
    if (share === 0) continue
    const { tripRisk, detectedRisk, cover, smell } = TAGS[tag]
    // Les événements annulent ou doublent les effets d'un tag ; l'odeur ne cumule pas avec le doublement du district
    const factor = tagFactor(state, to, tag, smell ? destination.odorFactor : 1) * moduleTagFactor(state, tag)
    if (tripRisk) risk.add(tag, tripRisk * share * factor)
    if (detectedRisk && destination.detection === tag) risk.add(tag, detectedRisk * share * factor)
    if (cover) risk.add(tag, -cover * share)
  }

  if (includePatrol && state.patrolDistrict === to) risk.add('rule.patrol', PATROL_RISK)
  risk.add('rule.wanted', state.wanted * WANTED.riskPerLevel, { level: state.wanted })
}
