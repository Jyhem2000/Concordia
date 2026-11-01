import { describe, expect, it } from 'vitest'
import { FRESHNESS, PUMP_NIGHT_MIN_ICC, WORN } from '../data/balance.ts'
import { CANTINE } from '../data/locations.ts'
import { CREW, CREW_HIRE_FEE } from '../data/vehicles.ts'
import { fuelPrice } from './actions.ts'
import { hireFee, salary } from './crew.ts'
import { NO_EVENTS } from './events.ts'
import { offshoreInterestBreakdown } from './finance.ts'
import { bluffChance, bribeChance, fleeChance, NO_OFFER } from './interception.ts'
import { demandQuota, saleQuote } from './market.ts'
import { riskBreakdown } from './risk.ts'
import { sleep } from './routine.ts'
import { defined, EARNED, errorOf, gameAt, run } from './test-helpers.ts'
import type { CargoLot, CrewId, GameState, Interception, ProductId } from './types.ts'

const lot = (productId: ProductId, qty: number, boughtDay = 3): CargoLot => ({
  productId,
  qty,
  unitCost: 10,
  travelled: true,
  boughtDay,
  damaged: false,
})
const withCrew = (active: CrewId, patch: Partial<GameState> = {}): GameState => {
  const base = gameAt(3, patch)
  return { ...base, crew: { ...base.crew, active, paidDay: 3, hires: 1 } }
}
const brc: Interception = { kind: 'brc', acted: false, bluffFailed: false }

describe('recrutement au Quai 9', () => {
  it('recrute gratuitement la première fois, salaire du jour payé d’avance, puis avec des frais', () => {
    const first = run(gameAt(3, { cash: 10_000, progress: EARNED }), { type: 'hireCrew', crewId: 'CREW-02' })
    expect(first.cash).toBe(10_000 - salary('CREW-02'))
    expect(first.crew).toMatchObject({ active: 'CREW-02', paidDay: 3, hires: 1 })
    expect(hireFee(first)).toBe(CREW_HIRE_FEE)
    const second = run(first, { type: 'hireCrew', crewId: 'CREW-03' })
    expect(second.cash).toBe(first.cash - hireFee(first) - salary('CREW-03'))
    expect(errorOf(gameAt(3, { districtId: 'D2' }), { type: 'hireCrew', crewId: 'CREW-01' })).toBe('not-at-location')
  })

  it('refuse un équipier disparu à la Loterie', () => {
    const base = gameAt(3)
    expect(errorOf({ ...base, crew: { ...base.crew, lost: ['CREW-01'] } }, { type: 'hireCrew', crewId: 'CREW-01' })).toBe('crew-lost')
  })
})

describe('salaire du matin', () => {
  it('paie d’avance, ou laisse l’équipier sans travail faute de cash', () => {
    const paid = sleep(withCrew('CREW-02', { cash: 5_000 }))
    expect(paid.crew.paidDay).toBe(4)
    expect(paid.briefing?.crew?.paid).toBe(salary('CREW-02'))
    const broke = sleep(withCrew('CREW-02', { cash: 0 }))
    expect(broke.crew.paidDay).toBe(3)
    expect(broke.briefing?.crew?.paid).toBeNull()
  })

  it('paie Vance en partie avec la caisse addictive éligible la moins chère', () => {
    const state = sleep(withCrew('CREW-01', { cash: 5_000, cargo: [lot('T1-05', 2), lot('T2-05', 1), lot('T3-02', 1)] }))
    const inKind = defined(CREW['CREW-01'].inKindSalary)
    expect(state.briefing?.crew).toMatchObject({ crate: 'T2-05', paid: salary('CREW-01', inKind.amount) })
    expect(state.cargo.some((entry) => entry.productId === 'T2-05')).toBe(false)
  })
})

describe('bonus des équipiers', () => {
  it('Vance réduit le risque partout et aide la corruption', () => {
    const vance = withCrew('CREW-01')
    expect(riskBreakdown(vance, 'D4', { includePatrol: false }).lines.some((line) => line.source === 'CREW-01')).toBe(true)
    const stopped = { ...vance, districtId: 'D2' as const, interception: brc, cargo: [lot('T2-03', 2)] }
    const alone = { ...stopped, crew: { ...stopped.crew, active: null } }
    expect(bribeChance(stopped, NO_OFFER).total).toBeGreaterThan(bribeChance(alone, NO_OFFER).total)
  })

  it('Glitch relève tous les districts et majore le rendement offshore', () => {
    const glitch = run(gameAt(3, { cash: 10_000, progress: EARNED }), { type: 'hireCrew', crewId: 'CREW-02' })
    expect(Object.keys(glitch.memory)).toHaveLength(6)
    const account = { deposited: 10_000, interest: 0 }
    const bonus = defined(CREW['CREW-02'].offshoreBonus)
    expect(defined(offshoreInterestBreakdown(account, bonus)).total).toBe(defined(offshoreInterestBreakdown(account)).total + 10_000 * bonus)
  })

  it('Mama Rosa affine le Standard au prix Extra-Frais et majore les quotas des périssables', () => {
    const butter = [lot('T1-03', 1, 2)]
    const rosa = withCrew('CREW-03', { districtId: 'D2', cargo: butter })
    const alone = gameAt(3, { districtId: 'D2', cargo: butter })
    const line = defined(defined(saleQuote(rosa, 'T1-03', 1).first).lines.find((entry) => entry.source === 'rule.know-how')?.detail)
    expect(line.lines.find((entry) => entry.source === 'rule.refining')?.value).toBe(FRESHNESS.extra)
    expect(saleQuote(rosa, 'T1-03', 1).total).toBeGreaterThan(saleQuote(alone, 'T1-03', 1).total)
    expect(demandQuota(rosa, 'D2', 'T1-03')).toBeGreaterThan(defined(demandQuota({ day: 3, phase: 'day', events: NO_EVENTS }, 'D2', 'T1-03')))
  })

  it('Mama Rosa sublime le Gourmet, même non périssable, et jamais les Cellules Souches', () => {
    const curry = [lot('T2-01', 1, 2)]
    expect(saleQuote(withCrew('CREW-03', { districtId: 'D2', cargo: curry }), 'T2-01', 1).total).toBeGreaterThan(
      saleQuote(gameAt(3, { districtId: 'D2', cargo: curry }), 'T2-01', 1).total,
    )
    const cells = [lot('T4-05', 1, 2)]
    expect(saleQuote(withCrew('CREW-03', { districtId: 'D6', cargo: cells }), 'T4-05', 1).total).toBe(
      saleQuote(gameAt(3, { districtId: 'D6', cargo: cells }), 'T4-05', 1).total,
    )
  })
})

describe('chauffeur à bout (chap. 1)', () => {
  it('réduit le bluff et la fuite sous le seuil de Santé', () => {
    const fit = gameAt(3, { districtId: 'D2', interception: brc, cargo: [lot('T2-03', 2)] })
    const worn = { ...fit, health: WORN.healthBelow - 1 }
    expect(bluffChance(worn).total).toBeCloseTo(bluffChance(fit).total - WORN.penalty)
    expect(fleeChance(worn).total).toBeCloseTo(fleeChance(fit).total - WORN.penalty)
    expect(bluffChance({ ...fit, health: WORN.healthBelow }).total).toBeCloseTo(bluffChance(fit).total)
  })
})

describe('carburant', () => {
  it('vend au tarif syndical de la Cantine en D1 de jour, et ferme les pompes officielles la nuit sous le seuil d’ICC', () => {
    expect(fuelPrice(gameAt(9))).toBe(CANTINE.fuelPrice)
    const night = gameAt(3, { districtId: 'D2', phase: 'night', fuel: 0, icc: PUMP_NIGHT_MIN_ICC - 1 })
    expect(errorOf(night, { type: 'refuel', qty: 1 })).toBe('pump-closed')
    expect(errorOf({ ...night, icc: PUMP_NIGHT_MIN_ICC }, { type: 'refuel', qty: 1 })).toBeNull()
    expect(errorOf({ ...night, districtId: 'D4' }, { type: 'refuel', qty: 1 })).toBeNull()
  })
})
