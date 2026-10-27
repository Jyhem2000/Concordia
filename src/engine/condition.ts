import { DAMAGED_FACTOR, FRESHNESS } from '../data/balance.ts'
import { PRODUCTS } from '../data/products.ts'
import { TAGS } from '../data/tags.ts'
import { maskedQty, takeLots } from './cargo.ts'
import { mountedEffect, vehicleOf } from './equipment.ts'
import { keysOf } from './records.ts'
import type { Rng } from './rng.ts'
import type { CargoLot, CrateCount, FreshnessStage, GameState, TagId } from './types.ts'

/*
 * État des caisses (chap. 3) : fraîcheur des périssables, casse des fragiles, explosion des
 * inflammables, et valeur d'une caisse donnée en paiement selon son état.
 */

// ─── Fraîcheur ───

export const isPerishable = (lot: CargoLot) => PRODUCTS[lot.productId].tags.some((tag) => TAGS[tag].perishable)

/**
 * Âge effectif d'un lot : matins passés depuis l'achat, retardés par le caisson cryo puis comptés
 * un matin sur deux par la chaîne du froid (chap. 3 et 5)
 */
function ageOf(state: GameState, lot: CargoLot, day = state.day): number {
  const delayed = Math.max(0, day - lot.boughtDay - (mountedEffect(state, 'freshnessDelay') ?? 0))
  return vehicleOf(state).coldChain ? Math.ceil(delayed / 2) : delayed
}

/** Matins avant qu'un lot périssable pourrisse (détruit à 06h00), ou null */
export function daysBeforeRot(state: GameState, lot: CargoLot): number | null {
  if (!isPerishable(lot)) return null
  let days = 1
  while (ageOf(state, lot, state.day + days) < FRESHNESS.rottenFromAge) days++
  return days
}

/** État de fraîcheur d'un lot périssable, ou null pour un produit qui ne se périme pas */
export function freshnessOf(state: GameState, lot: CargoLot): FreshnessStage | null {
  if (!isPerishable(lot)) return null
  const age = ageOf(state, lot)
  // L'Extra-Frais est une prime de livraison express : il ne survit pas à 20h00
  if (age <= 0 && state.phase === 'day' && !state.dayOver) return 'extra'
  if (age >= FRESHNESS.spoiled.fromAge) return 'spoiled'
  if (age >= FRESHNESS.gamey.fromAge) return 'gamey'
  return 'standard'
}

const FRESHNESS_FACTORS: Readonly<Record<FreshnessStage, number>> = {
  extra: FRESHNESS.extra,
  standard: FRESHNESS.standard,
  gamey: FRESHNESS.gamey.factor,
  spoiled: FRESHNESS.spoiled.factor,
}

export function freshnessFactor(stage: FreshnessStage | null): number {
  return stage ? FRESHNESS_FACTORS[stage] : 1
}

/** Retire les lots périssables pourris (routine de 06h00) ; renvoie aussi le nombre de caisses détruites */
export function removeRotten(state: GameState): { cargo: CargoLot[]; rotten: number } {
  const cargo = state.cargo.filter((lot) => !isPerishable(lot) || ageOf(state, lot) < FRESHNESS.rottenFromAge)
  const rotten = state.cargo.reduce((total, lot) => total + lot.qty, 0) - cargo.reduce((total, lot) => total + lot.qty, 0)
  return { cargo, rotten }
}

// ─── Valeur en paiement ───

/** Une caisse donnée vaut son prix de base, réduit par la casse et la fraîcheur (jamais augmenté) (chap. 7) */
export function crateValue(state: GameState, lot: CargoLot): number {
  const condition = lot.damaged ? DAMAGED_FACTOR : 1
  return PRODUCTS[lot.productId].basePrice * condition * Math.min(1, freshnessFactor(freshnessOf(state, lot)))
}

/** Valeur en paiement de caisses données : celles des lots qui partiraient (les plus anciens d'abord) */
export function paymentValue(state: GameState, crates: readonly CrateCount[]): number {
  let cargo: readonly CargoLot[] = state.cargo
  let total = 0
  for (const { productId, qty } of crates) {
    const { remaining, taken } = takeLots(cargo, productId, qty)
    total += taken.reduce((sum, lot) => sum + crateValue(state, lot) * lot.qty, 0)
    cargo = remaining
  }
  return Math.round(total)
}

// ─── Casse et explosions ───

const tagsWith = (has: (tag: TagId) => boolean) => keysOf(TAGS).filter(has)

/**
 * Casse des fragiles : chaque caisse intacte est endommagée avec la probabilité donnée.
 * Les caisses endommagées forment un lot à part, qui garde l'historique du lot d'origine.
 */
export function breakFragile(cargo: readonly CargoLot[], rng: Rng, chanceOf: (tag: TagId) => number): { cargo: CargoLot[]; damaged: number } {
  const fragileTags = tagsWith((tag) => TAGS[tag].breakage !== undefined)
  let damaged = 0
  const result = cargo.flatMap((lot) => {
    const tag = PRODUCTS[lot.productId].tags.find((id) => fragileTags.includes(id))
    if (!tag || lot.damaged) return [lot]
    let broken = 0
    for (let crate = 0; crate < lot.qty; crate++) if (rng.chance(chanceOf(tag))) broken++
    damaged += broken
    if (broken === 0) return [lot]
    const intact = lot.qty - broken
    return [...(intact > 0 ? [{ ...lot, qty: intact }] : []), { ...lot, qty: broken, damaged: true }]
  })
  return { cargo: result, damaged }
}

/** Casse en fuite réussie */
export function breakOnFlee(cargo: readonly CargoLot[], rng: Rng) {
  return breakFragile(cargo, rng, (tag) => TAGS[tag].breakage?.fleeChance ?? 0)
}

/** Choc hors fuite : une perte de châssis d'au moins le seuil, en une fois, peut casser les fragiles */
export function breakOnShock(cargo: readonly CargoLot[], rng: Rng, chassisLoss: number) {
  return breakFragile(cargo, rng, (tag) => {
    const breakage = TAGS[tag].breakage
    return breakage && chassisLoss >= breakage.shockThreshold ? breakage.shockChance : 0
  })
}

/**
 * Explosions en cas d'échec de fuite : chaque caisse inflammable non masquée peut exploser
 * (caisse détruite, châssis endommagé). Les caisses masquées sont protégées (chap. 3).
 */
export function explodeFlammable(cargo: readonly CargoLot[], rng: Rng): { cargo: CargoLot[]; exploded: number; chassisLoss: number } {
  let result: CargoLot[] = [...cargo]
  let exploded = 0
  let chassisLoss = 0
  for (const tag of tagsWith((id) => TAGS[id].explosion !== undefined)) {
    const explosion = TAGS[tag].explosion
    if (!explosion) continue
    // Les premières caisses du tag sont celles que le Tier 0 protège
    let protectedLeft = maskedQty(result, tag)
    const blown: CrateCount[] = []
    for (const lot of result) {
      if (!PRODUCTS[lot.productId].tags.includes(tag)) continue
      for (let crate = 0; crate < lot.qty; crate++) {
        if (protectedLeft > 0) {
          protectedLeft--
          continue
        }
        if (rng.chance(explosion.chance)) {
          blown.push({ productId: lot.productId, qty: 1 })
          exploded++
          chassisLoss += explosion.chassisLoss
        }
      }
    }
    for (const { productId, qty } of blown) result = takeLots(result, productId, qty).remaining
  }
  return { cargo: result, exploded, chassisLoss }
}
