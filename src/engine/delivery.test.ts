import { describe, expect, it } from 'vitest'
import { DAY_DELIVERY } from '../data/balance.ts'
import { SEALED_PRODUCT } from '../data/products.ts'
import { VEHICLES } from '../data/vehicles.ts'
import { deliveryCrates, deliveryFee } from './delivery.ts'
import { sleep } from './routine.ts'
import { errorOf, gameAt, HIGH_ROLL_RNG, run } from './test-helpers.ts'
import type { CargoLot, GameState, ProductId } from './types.ts'

const lot = (productId: ProductId, qty: number): CargoLot => ({ productId, qty, unitCost: 10, travelled: true, boughtDay: 3, damaged: false })
// Tirage haut : ni barrage ni aléa sur le trajet
const morning = (patch: Partial<GameState> = {}) => gameAt(3, { districtId: 'D1', dayOffer: 'D2', rng: HIGH_ROLL_RNG, ...patch })

describe('livraison officielle du jour', () => {
  it('charge des caisses scellées en proportion de la soute, avant le trajet de jour et avec la place', () => {
    const loaded = run(morning(), { type: 'acceptDelivery' })
    expect(loaded).toMatchObject({ delivery: { to: 'D2' }, dayOffer: null })
    expect(loaded.cargo).toEqual([
      expect.objectContaining({ productId: SEALED_PRODUCT, qty: Math.ceil(VEHICLES['VEH-01'].cargo * DAY_DELIVERY.sealedShare) }),
    ])
    expect(deliveryCrates({ ...loaded, vehicleId: 'VEH-04' })).toBe(Math.ceil(VEHICLES['VEH-04'].cargo * DAY_DELIVERY.sealedShare))
    expect(errorOf(morning({ cargo: [lot('T1-04', 10)] }), { type: 'acceptDelivery' })).toBe('cargo-full')
    expect(errorOf(morning({ dayOffer: 'D1' }), { type: 'acceptDelivery' })).toBe('no-delivery')
    expect(errorOf(morning({ dayTripDone: true }), { type: 'acceptDelivery' })).toBe('trip-done')
    expect(errorOf(morning({ phase: 'night' }), { type: 'acceptDelivery' })).toBe('not-daytime')
  })

  it('livre et paie à l’arrivée de jour dans le district demandé', () => {
    const loaded = run(morning(), { type: 'acceptDelivery' })
    const delivered = run(loaded, { type: 'travel', to: 'D2' })
    expect(delivered.cargo).toHaveLength(0)
    expect(delivered.cash).toBe(loaded.cash + deliveryFee(loaded))
    expect(delivered).toMatchObject({ delivery: null })
    expect(delivered.tripReport?.mission).toBe('delivered')
  })

  it('bloque la mission de nuit tant qu’elle est à bord, puis est reprise au matin avec une perte d’ICC', () => {
    const astray = run(run(morning({ nightOffer: 'D3' }), { type: 'acceptDelivery' }), { type: 'travel', to: 'D4' })
    expect(errorOf(astray, { type: 'forceCurfew', mission: true })).toBe('delivery-pending')
    const next = sleep(astray)
    expect(next.cargo.some((entry) => entry.productId === SEALED_PRODUCT)).toBe(false)
    expect(next.briefing?.missionReclaimed).toBe(deliveryCrates(astray))
    expect(next.delivery).toBeNull()
    // Bivouac en Rust Valley : aucun gain de sommeil, seule la perte du retard joue
    expect(next.icc).toBe(astray.icc - DAY_DELIVERY.undeliveredIccLoss)
  })
})
