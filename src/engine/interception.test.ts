import { describe, expect, it } from 'vitest'
import { fillCompartment } from './compartment.ts'
import {
  BLUFF,
  BRIBE,
  COMPARTMENT,
  CUSTODY,
  FINE,
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
import { VELVET } from '../data/locations.ts'
import { PRODUCTS } from '../data/products.ts'
import { MODULES, VEHICLES } from '../data/vehicles.ts'
import { cargoUsed, ownedQty } from './cargo.ts'
import { paymentValue } from './condition.ts'
import {
  bluffChance,
  bribeChance,
  bribeRate,
  compartmentDetection,
  drawInterception,
  fleeChance,
  flyingCheckShare,
  minimumOffer,
  offerValue,
  toll,
  tollInKind,
} from './interception.ts'
import { risk } from './risk.ts'
import { createRng } from './rng.ts'
import { sleep } from './routine.ts'
import { velvetDistrict } from './services.ts'
import { defined, errorOf, gameAt, HIGH_ROLL_RNG, LOW_ROLL_RNG, run } from './test-helpers.ts'
import type { CargoLot, DistrictId, GameState, Interception, Offer, ProductId } from './types.ts'

const lot = (productId: ProductId, qty: number): CargoLot => ({ productId, qty, unitCost: 1, travelled: true, boughtDay: 1, damaged: false })
const brc: Interception = { kind: 'brc', acted: false, bluffFailed: false }
const racket: Interception = { kind: 'racket', acted: false, bluffFailed: false }

/** Joueur arrêté à un barrage de Pastel-Heights, avec 10 000 ₡ et la soute donnée */
// Le double fond est rempli comme à l'arrivée des caisses : les illégales les plus chères
const stopped = (cargo: CargoLot[], patch: Partial<GameState> = {}): GameState =>
  fillCompartment(gameAt(5, { districtId: 'D2', cash: 10_000, cargo, interception: brc, dayTripDone: true, ...patch }))

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

  // Tirage bas : les agents trouvent le double fond, toute la soute est jugée
  it('confisque l’illégal de bas tier et met une amende', () => {
    const state = run(stopped([lot('T0-01', 2), lot('T2-01', 3)], { rng: LOW_ROLL_RNG }), { type: 'intercept', move: 'search' })
    expect(state.cargo).toEqual([lot('T0-01', 2)])
    // Amende : une part de la valeur des caisses saisies, au prix de base
    expect(state.cash).toBe(10_000 - Math.round(SEARCH.low.fineRate * 3 * PRODUCTS['T2-01'].basePrice))
    expect(state.icc).toBe(100 - SEARCH.low.iccLoss - COMPARTMENT.foundIccLoss)
    expect(state.day).toBe(5)
    expect(defined(state.interceptionReport)).toMatchObject({ compartment: 'found', hiddenCrates: 0 })
  })

  it('envoie en garde à vue pour du haut tier : routine en cellule, sortie à 20h00 le lendemain', () => {
    const state = run(stopped([lot('T3-01', 1)], { rng: LOW_ROLL_RNG }), { type: 'intercept', move: 'search' })
    expect(state).toMatchObject({ day: 6, phase: 'day', dayTripDone: true, dayOver: true, districtId: 'D2', interception: null })
    expect(state.health).toBe(100 - CUSTODY.healthLossPerMorning)
    expect(state.briefing?.custodyHealth).toBe(CUSTODY.healthLossPerMorning)
  })

  it('déclenche l’audit si la garde à vue franchit le Jour 30 à minuit', () => {
    const state = run(stopped([lot('T3-01', 1)], { day: GAME_LENGTH_DAYS, rng: LOW_ROLL_RNG }), { type: 'intercept', move: 'search' })
    expect(state.status).toBe('finished')
    expect(state.ending?.id).toBe('bio-bricks')
  })

  it('prolonge la garde à vue quand le Cash-Puce ne couvre pas l’amende', () => {
    const state = run(stopped([lot('T2-01', 5)], { cash: 100, rng: LOW_ROLL_RNG }), { type: 'intercept', move: 'search' })
    expect(state.cash).toBe(0)
    expect(defined(state.interceptionReport)).toMatchObject({ unpaidFine: Math.round(SEARCH.low.fineRate * 5 * PRODUCTS['T2-01'].basePrice) - 100 })
    expect(state.interceptionReport?.custodyDays).toBe(SEARCH.low.custodyDays + FINE.unpaidCustodyDays)
  })

  it('exécute le joueur si la fouille trouve le produit fatal', () => {
    const state = run(stopped([lot('T4-06', 1)]), { type: 'intercept', move: 'search' })
    expect(state.status).toBe('finished')
    expect(state.ending?.id).toBe('execution')
  })
})

describe('double fond (chap. 4)', () => {
  const hidden = VEHICLES['VEH-01'].hiddenCompartment

  it('cache les caisses illégales les plus chères, jamais le serveur Aeterna ni le légal', () => {
    const state = run(stopped([lot('T0-01', 4), lot('T4-06', 1), lot('T1-01', 3), lot('T2-03', 1)], { rng: HIGH_ROLL_RNG }), {
      type: 'intercept',
      move: 'search',
    })
    // Le serveur reste visible : la fouille est fatale, double fond ou non
    expect(state.ending?.id).toBe('execution')
    const kept = run(stopped([lot('T0-01', 4), lot('T1-01', 3), lot('T2-03', 1)], { rng: HIGH_ROLL_RNG }), { type: 'intercept', move: 'search' })
    expect(kept.cargo).toEqual([lot('T0-01', 4), lot('T1-01', hidden - 1), lot('T2-03', 1)])
    expect(defined(kept.interceptionReport)).toMatchObject({ compartment: 'kept', hiddenCrates: hidden, crates: -(4 - hidden) })
    // Le double fond a tenu : la cloison fantôme de Mitch se débloque
    expect(kept.progress.compartmentHeld).toBe(1)
  })

  it('non trouvé, juge la sanction sur la soute visible', () => {
    // Le haut tier est caché : sanction de bas tier, pas de garde à vue
    const mixed = run(stopped([lot('T1-01', 3), lot('T3-01', 1)], { rng: HIGH_ROLL_RNG }), { type: 'intercept', move: 'search' })
    const visible = (3 - (hidden - 1)) * PRODUCTS['T1-01'].basePrice
    expect(mixed).toMatchObject({ day: 5, icc: 100 - SEARCH.low.iccLoss, cash: 10_000 - Math.round(SEARCH.low.fineRate * visible) })
    // Tout l'illégal est caché : simple formalité
    const clean = run(stopped([lot('T0-01', 2), lot('T2-01', hidden)], { icc: 80, rng: HIGH_ROLL_RNG }), { type: 'intercept', move: 'search' })
    expect(clean).toMatchObject({ cash: 10_000, icc: 80 + SEARCH.legalIccGain })
    expect(ownedQty(clean.cargo, 'T2-01')).toBe(hidden)
  })

  it('est plus souvent trouvé dans les districts les mieux gardés', () => {
    expect(compartmentDetection(stopped([], { districtId: 'D1' })).total).toBeCloseTo(COMPARTMENT.detectionPerStar)
    expect(compartmentDetection(stopped([], { districtId: 'D6' })).total).toBeCloseTo(COMPARTMENT.detectionPerStar * DISTRICTS.D6.security)
  })

  it('se trouve moins souvent derrière la cloison fantôme', () => {
    const ghost = stopped([], { districtId: 'D6', modules: { owned: ['MOD-10'], mounted: ['MOD-10'] } })
    expect(compartmentDetection(ghost).total).toBeCloseTo(
      COMPARTMENT.detectionPerStar * DISTRICTS.D6.security * (MODULES['MOD-10'].compartmentFactor ?? 1),
    )
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
    // Tirage haut : le double fond n'est pas trouvé, l'amende porte sur les caisses visibles
    const visible = 3 - VEHICLES['VEH-01'].hiddenCompartment
    expect(searched.cash).toBe(10_000 - Math.round(BLUFF.failedFine.low * visible * PRODUCTS['T2-01'].basePrice))
  })
})

describe('corruption', () => {
  const cash = (amount: number): Offer => ({ cash: amount, crates: [] })

  it('refuse une offre sous le minimum, et l’offre est perdue même en cas d’échec', () => {
    const state = stopped([lot('T2-01', 3)], { rng: HIGH_ROLL_RNG })
    expect(errorOf(state, { type: 'intercept', move: 'bribe', offer: cash(minimumOffer(state) - 1) })).toBe('offer-too-low')
    const offer = bribeRate(state).total
    const failed = run(state, { type: 'intercept', move: 'bribe', offer: cash(offer) })
    const visible = 3 - VEHICLES['VEH-01'].hiddenCompartment
    expect(failed.cash).toBe(10_000 - offer - Math.round(BRIBE.fail.fineRate * visible * PRODUCTS['T2-01'].basePrice))
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

  it('accepte le Luxe à son prix de base, avec la connivence, et refuse les autres caisses', () => {
    const favorite = 'T3-03'
    expect(
      errorOf(stopped([lot('T2-01', 3)]), { type: 'intercept', move: 'bribe', offer: { cash: 0, crates: [{ productId: 'T2-01', qty: 3 }] } }),
    ).toBe('not-eligible')
    const state = stopped([lot('T2-01', 3), lot(favorite, 2)])
    const inKind: Offer = { cash: 0, crates: [{ productId: favorite, qty: 2 }] }
    expect(offerValue(state, inKind)).toBe(2 * PRODUCTS[favorite].basePrice)
    const plain: Offer = { cash: offerValue(state, inKind), crates: [] }
    expect(bribeChance(state, inKind).total).toBeCloseTo(bribeChance(state, plain).total + BRIBE.connivance)
  })

  it('retire les caisses offertes de la soute, même en cas d’échec', () => {
    const favorite = 'T3-03'
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
    // Le double fond n'est pas trouvé (tirage haut) : ses caisses restent
    expect(state.cargo).toEqual([lot('T2-01', VEHICLES['VEH-01'].hiddenCompartment)])
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

describe('tactiques de barrage (chap. 2)', () => {
  it('compte d’elles-mêmes les aides au bluff en soute, sans rien donner', () => {
    const manuals = defined(PRODUCTS['T0-04'].bluffAid)
    const state = stopped([lot('T0-04', manuals.crates), lot('T1-02', 2)])
    expect(bluffChance(state).lines.find((line) => line.source === 'T0-04')?.value).toBe(manuals.bonus)
    // Pas assez de caisses : pas d'aide
    expect(bluffChance(stopped([lot('T0-04', manuals.crates - 1)])).lines.some((line) => line.source === 'T0-04')).toBe(false)
    // Le curry couvre l'odeur de toute la soute
    const smelly = bluffChance(stopped([lot('T1-02', 3)])).total
    expect(bluffChance(stopped([lot('T1-02', 3), lot('T2-01', 1)])).total).toBeGreaterThan(smelly)
    const bluffed = run({ ...state, rng: HIGH_ROLL_RNG }, { type: 'intercept', move: 'bluff' })
    expect(ownedQty(bluffed.cargo, 'T0-04')).toBe(manuals.crates)
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
    expect(report.crates).toBe(-4 + VEHICLES['VEH-01'].hiddenCompartment)
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

describe('protection du parrain (chap. 3)', () => {
  // Commande VIP d'un produit Tech (détecté au Silo), plus des caisses illégales hors commande
  const hidden = VEHICLES['VEH-01'].hiddenCompartment
  const ordered = (patch: Partial<GameState> = {}): GameState =>
    gameAt(5, {
      districtId: 'D5',
      cash: 10_000,
      cargo: [lot('T2-04', VELVET.vip.crates), lot('T2-03', hidden + 3)],
      vip: { productId: 'T2-04', day: 5 },
      ...patch,
    })
  const without = (state: GameState): GameState => ({ ...state, cargo: state.cargo.filter((l) => l.productId !== 'T2-04') })
  const tripRisk = (state: GameState, to: DistrictId) => risk(state, to, { includePatrol: false })

  it('rend invisibles au risque les caisses de la commande VIP en cours, dans le district du Silo seulement', () => {
    const state = ordered()
    expect(tripRisk(state, velvetDistrict())).toBe(tripRisk(without(state), velvetDistrict()))
    expect(tripRisk(state, 'D2')).not.toBe(tripRisk(without(state), 'D2'))
    // Échéance passée : plus de protection
    const late = ordered({ day: 5 + VELVET.vip.deadlineDays + 1 })
    expect(tripRisk(late, velvetDistrict())).toBeGreaterThan(tripRisk(without(late), velvetDistrict()))
  })

  it('met ces caisses de côté au barrage du Silo et les rend après la fouille', () => {
    const stoppedAtSilo = run(ordered({ rng: LOW_ROLL_RNG }), { type: 'travel', to: velvetDistrict() })
    expect(stoppedAtSilo.interception?.covered).toEqual([lot('T2-04', VELVET.vip.crates)])
    expect(ownedQty(stoppedAtSilo.cargo, 'T2-04')).toBe(0)
    const searched = run(stoppedAtSilo, { type: 'intercept', move: 'search' })
    expect(ownedQty(searched.cargo, 'T2-04')).toBe(VELVET.vip.crates)
    // Le reste de l'illégal est saisi (hors double fond)
    expect(ownedQty(searched.cargo, 'T2-03')).toBeLessThanOrEqual(hidden)
  })
})
