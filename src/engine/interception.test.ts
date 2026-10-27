import { describe, expect, it } from 'vitest'
import {
  BLUFF,
  BRIBE,
  CUSTODY,
  EJECT,
  EMERGENCY_TOW,
  FLEE,
  FLYING_CHECK,
  GAME_LENGTH_DAYS,
  NIGHT_TRIP_CHASSIS_WEAR,
  RACKET,
  SEARCH,
  WANTED,
} from '../data/balance.ts'
import { DISTRICTS } from '../data/districts.ts'
import { PRODUCTS } from '../data/products.ts'
import { VEHICLES } from '../data/vehicles.ts'
import { cargoUsed, ownedQty } from './cargo.ts'
import { paymentValue } from './condition.ts'
import {
  bluffChance,
  bribeChance,
  bribeRate,
  drawInterception,
  fleeChance,
  flyingCheckShare,
  minimumOffer,
  offerValue,
  toll,
  tollInKind,
} from './interception.ts'
import { createRng } from './rng.ts'
import { sleep } from './routine.ts'
import { defined, errorOf, gameAt, HIGH_ROLL_RNG, LOW_ROLL_RNG, run } from './test-helpers.ts'
import type { CargoLot, GameState, Interception, Offer, ProductId } from './types.ts'

const lot = (productId: ProductId, qty: number): CargoLot => ({ productId, qty, unitCost: 1, travelled: true, boughtDay: 1, damaged: false })
const brc: Interception = { kind: 'brc', acted: false, bluffFailed: false }
const racket: Interception = { kind: 'racket', acted: false, bluffFailed: false }

/** Joueur arrêté à un barrage de Pastel-Heights, avec 10 000 ₡ et la soute donnée */
const stopped = (cargo: CargoLot[], patch: Partial<GameState> = {}): GameState =>
  gameAt(5, { districtId: 'D2', cash: 10_000, cargo, interception: brc, dayTripDone: true, ...patch })

describe('arrivée au barrage', () => {
  it('arrête le joueur à destination sur un tirage bas, et bloque toute autre action', () => {
    const state = run(gameAt(2, { rng: LOW_ROLL_RNG }), { type: 'travel', to: 'D2' })
    expect(state.districtId).toBe('D2')
    expect(['brc', 'flying']).toContain(state.interception?.kind)
    expect(errorOf(state, { type: 'sleep' })).toBe('intercepted')
  })

  it('remplace la BRC par le racket des milices en zone hors-réseau', () => {
    const state = run(gameAt(2, { rng: LOW_ROLL_RNG }), { type: 'travel', to: 'D4' })
    expect(state.interception?.kind).toBe('racket')
    expect(errorOf(state, { type: 'intercept', move: 'bluff' })).toBe('move-unavailable')
  })

  it('use le châssis de nuit', () => {
    const state = run(gameAt(2, { phase: 'night', rng: HIGH_ROLL_RNG }), { type: 'travel', to: 'D2' })
    expect(state.chassis).toBe(VEHICLES['VEH-01'].maxChassis - NIGHT_TRIP_CHASSIS_WEAR)
  })
})

describe('fouille', () => {
  it("n'est qu'une formalité avec une soute légale", () => {
    const state = run(stopped([lot('T0-01', 3)], { icc: 90 }), { type: 'intercept', move: 'search' })
    expect(state.interception).toBeNull()
    expect(state.icc).toBe(90 + SEARCH.legalIccGain)
    expect(ownedQty(state.cargo, 'T0-01')).toBe(3)
  })

  it('confisque l’illégal de bas tier et met une amende', () => {
    const state = run(stopped([lot('T0-01', 2), lot('T2-01', 3)]), { type: 'intercept', move: 'search' })
    expect(state.cargo).toEqual([lot('T0-01', 2)])
    expect(state.cash).toBe(10_000 * (1 - SEARCH.low.fine))
    expect(state.icc).toBe(100 - SEARCH.low.iccLoss)
    expect(state.day).toBe(5)
  })

  it('envoie en garde à vue pour du haut tier : routine en cellule, sortie à 20h00 le lendemain', () => {
    const state = run(stopped([lot('T3-01', 1)]), { type: 'intercept', move: 'search' })
    expect(state).toMatchObject({ day: 6, phase: 'day', dayTripDone: true, dayOver: true, districtId: 'D2', interception: null })
    expect(state.health).toBe(100 - CUSTODY.healthLossPerMorning)
    expect(state.briefing?.custodyHealth).toBe(CUSTODY.healthLossPerMorning)
  })

  it('déclenche l’audit si la garde à vue franchit le Jour 30 à minuit', () => {
    const state = run(stopped([lot('T3-01', 1)], { day: GAME_LENGTH_DAYS }), { type: 'intercept', move: 'search' })
    expect(state.status).toBe('finished')
    expect(state.ending?.id).toBe('bio-bricks')
  })

  it('exécute le joueur si la fouille trouve le produit fatal', () => {
    const state = run(stopped([lot('T4-06', 1)]), { type: 'intercept', move: 'search' })
    expect(state.status).toBe('finished')
    expect(state.ending?.id).toBe('execution')
  })
})

describe('bluff', () => {
  it('fait passer toute la cargaison en cas de succès', () => {
    // Une soute diluée dans le Tier 0 rend le bluff crédible
    const state = run(stopped([lot('T0-01', 3), lot('T2-01', 1)], { icc: 80, rng: LOW_ROLL_RNG }), { type: 'intercept', move: 'bluff' })
    expect(state.interception).toBeNull()
    expect(ownedQty(state.cargo, 'T2-01')).toBe(1)
    expect(state.icc).toBe(80 + BLUFF.successIccGain)
  })

  it('aggrave la suite en cas d’échec : bluff et éjection fermés, malus à la corruption et à la fuite', () => {
    const before = stopped([lot('T2-01', 3)], { rng: HIGH_ROLL_RNG })
    const state = run(before, { type: 'intercept', move: 'bluff' })
    expect(state.interception).toEqual({ kind: 'brc', acted: true, bluffFailed: true })
    expect(state.icc).toBe(100 - BLUFF.failIccLoss)
    expect(errorOf(state, { type: 'intercept', move: 'eject' })).toBe('move-unavailable')
    expect(fleeChance(state).total).toBeCloseTo(fleeChance(before).total - BLUFF.followUpPenalty)

    const searched = run(state, { type: 'intercept', move: 'search' })
    expect(searched.cash).toBe(10_000 * (1 - BLUFF.failedFine.low))
  })
})

describe('corruption', () => {
  const cash = (amount: number): Offer => ({ cash: amount, crates: [] })

  it('refuse une offre sous le minimum, et l’offre est perdue même en cas d’échec', () => {
    const state = stopped([lot('T2-01', 3)], { rng: HIGH_ROLL_RNG })
    expect(errorOf(state, { type: 'intercept', move: 'bribe', offer: cash(minimumOffer(state) - 1) })).toBe('offer-too-low')
    const offer = bribeRate(state).total
    const failed = run(state, { type: 'intercept', move: 'bribe', offer: cash(offer) })
    expect(failed.cash).toBe(Math.round((10_000 - offer) * (1 - BRIBE.fail.fine)))
    expect(failed.icc).toBe(100 - BRIBE.fail.iccLoss)
  })

  it('monte avec la valeur de l’offre, par paliers, et compte les Drones-Juges', () => {
    const state = stopped([lot('T2-01', 3)])
    const rate = bribeRate(state).total
    expect(bribeChance(state, cash(rate * 2)).total).toBeGreaterThan(bribeChance(state, cash(rate)).total)
    const guarded = { ...state, districtId: 'D5' as const }
    expect(bribeChance(guarded, cash(rate)).lines.at(-1)?.source).toBe('rule.drone-judges')
  })

  it('laisse passer en cas de succès', () => {
    const state = stopped([lot('T2-01', 3)], { rng: LOW_ROLL_RNG })
    const passed = run(state, { type: 'intercept', move: 'bribe', offer: cash(minimumOffer(state)) })
    expect(passed.interception).toBeNull()
    expect(ownedQty(passed.cargo, 'T2-01')).toBe(3)
  })

  it('accepte des caisses à leur prix de base, et récompense un produit apprécié par la connivence', () => {
    const favorite = DISTRICTS.D2.bribeFavorites[0]
    const state = stopped([lot('T2-01', 3), lot(favorite, 2)])
    const inKind: Offer = { cash: 0, crates: [{ productId: favorite, qty: 2 }] }
    expect(offerValue(state, inKind)).toBe(2 * PRODUCTS[favorite].basePrice)
    const plain: Offer = { cash: offerValue(state, inKind), crates: [] }
    expect(bribeChance(state, inKind).total).toBeCloseTo(bribeChance(state, plain).total + BRIBE.connivance)
  })

  it('retire les caisses offertes de la soute, même en cas d’échec', () => {
    const favorite = DISTRICTS.D2.bribeFavorites[0]
    const state = stopped([lot(favorite, 30)], { rng: HIGH_ROLL_RNG })
    const offer: Offer = { cash: 0, crates: [{ productId: favorite, qty: 25 }] }
    expect(errorOf(state, { type: 'intercept', move: 'bribe', offer: { cash: 0, crates: [{ productId: favorite, qty: 31 }] } })).toBe(
      'not-enough-cargo',
    )
    const failed = run(state, { type: 'intercept', move: 'bribe', offer })
    expect(defined(failed.interceptionReport).crates).toBeLessThanOrEqual(-25)
  })
})

describe('fuite', () => {
  it('sauve la cargaison au prix du châssis, de l’ICC et d’un niveau de Fiche S', () => {
    const state = run(stopped([lot('T2-01', 3)], { rng: LOW_ROLL_RNG }), { type: 'intercept', move: 'flee' })
    expect(ownedQty(state.cargo, 'T2-01')).toBe(3)
    expect(state.wanted).toBe(1)
    expect(state.icc).toBe(100 - FLEE.success.iccLoss)
    const lost = VEHICLES['VEH-01'].maxChassis - state.chassis
    expect(lost).toBeGreaterThanOrEqual(FLEE.success.chassisLoss.min)
    expect(lost).toBeLessThanOrEqual(FLEE.success.chassisLoss.max)
  })

  it('perd la Fiche S en chance de fuite', () => {
    expect(fleeChance(stopped([], { wanted: 2 })).total).toBeCloseTo(FLEE.base - 2 * WANTED.fleePenaltyPerLevel)
  })

  it('coûte cher en cas d’échec, jusqu’à la mort si la Santé tombe à 0', () => {
    const state = run(stopped([lot('T2-01', 3)], { rng: HIGH_ROLL_RNG }), { type: 'intercept', move: 'flee' })
    expect(state.cargo).toEqual([])
    expect(state.day).toBe(6)
    const dead = run(stopped([lot('T2-01', 3)], { rng: HIGH_ROLL_RNG, health: FLEE.fail.healthLoss }), { type: 'intercept', move: 'flee' })
    expect(dead.ending?.id).toBe('death')
  })

  it('déclenche le dépannage si le châssis tombe à 0', () => {
    const state = run(stopped([lot('T2-01', 1)], { rng: HIGH_ROLL_RNG, chassis: 10 }), { type: 'intercept', move: 'flee' })
    expect(state.chassis).toBe(VEHICLES['VEH-01'].maxChassis * EMERGENCY_TOW.chassisRestore)
    expect(defined(state.interceptionReport).towBill).toBeGreaterThan(0)
  })
})

describe('éjection', () => {
  it('vide la soute illégale avant le barrage en cas de succès', () => {
    const state = run(stopped([lot('T0-01', 2), lot('T4-06', 1)], { rng: LOW_ROLL_RNG }), { type: 'intercept', move: 'eject' })
    expect(state.status).toBe('playing')
    expect(state.cargo).toEqual([lot('T0-01', 2)])
    expect(state.chassis).toBe(VEHICLES['VEH-01'].maxChassis - EJECT.chassisLoss)
  })

  it('n’est possible qu’en tout premier et hors dalle bio-scellée', () => {
    expect(errorOf(stopped([], { interception: { ...brc, acted: true } }), { type: 'intercept', move: 'eject' })).toBe('move-unavailable')
    expect(errorOf(stopped([], { districtId: 'D6' }), { type: 'intercept', move: 'eject' })).toBe('move-unavailable')
  })
})

describe('racket des milices', () => {
  const cargo = [lot('T3-01', 2), lot('T1-01', 4)]

  it('fait payer le péage sur la valeur de la soute', () => {
    const state = stopped(cargo, { districtId: 'D4', interception: racket })
    const paid = run(state, { type: 'intercept', move: 'payToll' })
    expect(paid.cash).toBe(10_000 - toll(state))
    expect(cargoUsed(paid.cargo)).toBe(6)
  })

  it('prend en nature les favoris des milices d’abord, sans rendre la monnaie', () => {
    const state = stopped([lot('T3-01', 2), lot('T1-06', 1), lot('T1-01', 4)], { districtId: 'D4', interception: racket })
    const taken = tollInKind(state)
    expect(taken[0].productId).toBe('T1-06')
    expect(paymentValue(state, taken)).toBeGreaterThanOrEqual(toll(state))
    const paid = run(state, { type: 'intercept', move: 'payTollInKind' })
    expect(paid.cash).toBe(10_000)
    expect(paid.interception).toBeNull()
  })

  it('pille les caisses les plus chères en cas de refus', () => {
    const refused = run(stopped(cargo, { districtId: 'D4', interception: racket }), { type: 'intercept', move: 'refuseToll' })
    const looted = Math.ceil(6 * RACKET.refuse.lootShare)
    expect(cargoUsed(refused.cargo)).toBe(6 - looted)
    expect(ownedQty(refused.cargo, 'T3-01')).toBe(0)
    expect(refused.health).toBe(100 - RACKET.refuse.healthLoss)
  })
})

describe('suites du barrage', () => {
  it('transforme une vente saturée en pic suspect le lendemain', () => {
    const market = gameAt(2).markets.D1
    const demand = defined(market.demand['T2-01'])
    const sold = run(gameAt(2, { cargo: [lot('T2-01', demand + 1)] }), { type: 'sell', productId: 'T2-01', qty: demand + 1 })
    expect(sold.oversold).toEqual(['D1'])
    expect(sleep(sold).suspiciousPeaks).toEqual(['D1'])
  })

  it('baisse la Fiche S après une nuit au relais, pas après une nuit blanche', () => {
    expect(sleep(gameAt(2, { wanted: 2 })).wanted).toBe(1)
    expect(sleep(gameAt(2, { wanted: 2, phase: 'night' })).wanted).toBe(2)
  })
})

describe('tactiques de barrage (chap. 3)', () => {
  it('donne les manuels à l’agent pour un bonus de bluff, et sacrifie une épice contre le malus d’odeur', () => {
    const manuals = defined(PRODUCTS['T0-04'].bluffAid)
    const state = stopped([lot('T0-04', 6), lot('T1-02', 2)])
    const aided = bluffChance(state, { bluffAids: ['T0-04'] })
    expect(aided.lines.find((line) => line.source === 'T0-04')?.value).toBe(manuals.bonus)
    expect(errorOf(stopped([lot('T0-04', 2)]), { type: 'intercept', move: 'bluff', tactics: { bluffAids: ['T0-04'] } })).toBe('not-enough-cargo')

    const smelly = stopped([lot('T2-01', 3)])
    expect(bluffChance(smelly, { bluffAids: ['T2-01'] }).total).toBeGreaterThan(bluffChance(smelly).total)
    const bluffed = run({ ...state, rng: HIGH_ROLL_RNG }, { type: 'intercept', move: 'bluff', tactics: { bluffAids: ['T0-04'] } })
    expect(ownedQty(bluffed.cargo, 'T0-04')).toBe(6 - manuals.crates)
  })

  it('largue une caisse et dope le pilote pour fuir, une fois par jour', () => {
    const doping = defined(PRODUCTS['T2-05'].doping)
    const state = stopped([lot('T1-06', 2), lot('T2-05', 2)])
    const boosted = fleeChance(state, { drop: 'T1-06', dope: 'T2-05' })
    expect(boosted.total).toBeGreaterThan(fleeChance(state).total)
    expect(errorOf(state, { type: 'intercept', move: 'flee', tactics: { drop: 'T2-03' } })).toBe('move-unavailable')

    const fled = run({ ...state, rng: LOW_ROLL_RNG }, { type: 'intercept', move: 'flee', tactics: { drop: 'T1-06', dope: 'T2-05' } })
    expect(ownedQty(fled.cargo, 'T1-06')).toBe(1)
    expect(ownedQty(fled.cargo, 'T2-05')).toBe(1)
    expect(fled.lastDopingDay).toBe(5)
    expect(defined(fled.interceptionReport).sacrificed).toBe(2)
    expect(fled.icc).toBe(100 - doping.iccLoss - FLEE.success.iccLoss)
    expect(errorOf({ ...fled, interception: brc }, { type: 'intercept', move: 'flee', tactics: { dope: 'T2-05' } })).toBe('doping-used')
  })

  it('note la casse et les explosions au compte rendu', () => {
    const failed = run(stopped([lot('T1-06', 4)], { rng: HIGH_ROLL_RNG }), { type: 'intercept', move: 'flee' })
    const report = defined(failed.interceptionReport)
    expect(report.exploded).toBeGreaterThanOrEqual(0)
    expect(report.crates).toBe(-4)
  })
})

describe('contrôle volant', () => {
  const flying: Interception = { kind: 'flying', acted: false, bluffFailed: false }

  it('ferme la fuite et l’éjection, pas le bluff ni la corruption', () => {
    const state = stopped([lot('T2-03', 2)], { interception: flying })
    expect(errorOf(state, { type: 'intercept', move: 'flee' })).toBe('move-unavailable')
    expect(errorOf(state, { type: 'intercept', move: 'eject' })).toBe('move-unavailable')
    expect(errorOf(state, { type: 'intercept', move: 'bluff' })).toBeNull()
  })

  it('reste un contrôle volant après un bluff raté', () => {
    const failed = run(stopped([lot('T2-03', 2)], { interception: flying, rng: HIGH_ROLL_RNG }), { type: 'intercept', move: 'bluff' })
    expect(failed.interception?.kind).toBe('flying')
  })

  it('dépend du district, majoré par la ronde renforcée, jamais chez les milices', () => {
    const state = gameAt(3, { patrolDistrict: 'D5' })
    expect(flyingCheckShare(state, 'D5', false)).toBe(DISTRICTS.D5.flyingCheckShare)
    expect(flyingCheckShare(state, 'D5', true)).toBeCloseTo(DISTRICTS.D5.flyingCheckShare + FLYING_CHECK.patrolBonus)
    expect(flyingCheckShare(state, 'D4', true)).toBe(0)
    expect(drawInterception(createRng(LOW_ROLL_RNG), 1, state, 'D4')?.kind).toBe('racket')
  })
})
