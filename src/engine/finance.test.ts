import { describe, expect, it } from 'vitest'
import {
  DEBT_BEATING,
  DEBT_DAILY_RATE,
  DEBT_LATE,
  GAME_LENGTH_DAYS,
  LOAN_CEILING,
  OFFSHORE_DEPOSIT_FACTOR,
  OFFSHORE_TRANCHES,
  PROTECTION,
} from '../data/balance.ts'
import {
  debtInterestBreakdown,
  depositBreakdown,
  effectiveOffshoreRate,
  loanRoom,
  nextDebtDeadline,
  nextProtectionDay,
  offshoreBalance,
  offshoreInterestBreakdown,
  protectionBreakdown,
  withdrawFrom,
} from './finance.ts'
import { defined, gameAt } from './test-helpers.ts'

describe('dette', () => {
  it('compose les intérêts au taux normal, puis au taux majoré en retard', () => {
    expect(defined(debtInterestBreakdown(gameAt(2, { debt: 1_000 }))).total).toBe(Math.round(1_000 * (1 + DEBT_DAILY_RATE)))
    expect(defined(debtInterestBreakdown(gameAt(2, { debt: 1_000, debtLate: true }))).total).toBe(Math.round(1_000 * (1 + DEBT_LATE.dailyRate)))
    expect(debtInterestBreakdown(gameAt(2, { debt: 0 }))).toBeNull()
  })

  it('annonce la prochaine échéance : tabassage, retard, puis audit', () => {
    expect(nextDebtDeadline(gameAt(1))).toBe(DEBT_BEATING.day)
    expect(nextDebtDeadline(gameAt(DEBT_BEATING.day))).toBe(DEBT_LATE.day)
    expect(nextDebtDeadline(gameAt(DEBT_BEATING.day, { initialDebtPaid: true }))).toBe(GAME_LENGTH_DAYS)
    expect(nextDebtDeadline(gameAt(2, { debt: 0 }))).toBeNull()
  })

  it("n'ouvre l'emprunt tactique qu'une fois la dette initiale soldée, jusqu'au plafond", () => {
    expect(loanRoom(gameAt(2))).toBe(0)
    expect(loanRoom(gameAt(2, { initialDebtPaid: true, debt: 1_000 }))).toBe(LOAN_CEILING - 1_000)
  })
})

describe('collecte de protection', () => {
  it('ne concerne que les joueurs ayant soldé la dette initiale', () => {
    expect(nextProtectionDay(gameAt(1))).toBeNull()
    expect(nextProtectionDay(gameAt(PROTECTION.days[0], { initialDebtPaid: true }))).toBe(PROTECTION.days[1])
    expect(nextProtectionDay(gameAt(GAME_LENGTH_DAYS, { initialDebtPaid: true }))).toBeNull()
  })

  it('porte sur le Cash-Puce et la soute au prix de base', () => {
    const withCargo = protectionBreakdown(gameAt(2, { cash: 1_000, cargo: [{ productId: 'T3-01', qty: 2, unitCost: 1, travelled: true }] }))
    const cashOnly = protectionBreakdown(gameAt(2, { cash: 1_000 }))
    expect(cashOnly.total).toBe(Math.round(1_000 * PROTECTION.rate))
    expect(withCargo.total).toBeGreaterThan(cashOnly.total)
  })
})

describe('compte offshore', () => {
  it('déduit la commission de la Laverie à chaque dépôt', () => {
    expect(depositBreakdown(1_000).total).toBe(Math.round(1_000 * OFFSHORE_DEPOSIT_FACTOR))
  })

  it('verse des intérêts simples, tranche par tranche, sur les seuls dépôts', () => {
    const [first, second] = OFFSHORE_TRANCHES
    const firstLimit = defined(first.upTo, 'plafond de la 1re tranche')
    const deposited = firstLimit + 100_000
    const interest = defined(offshoreInterestBreakdown({ deposited, interest: 999 }))
    expect(interest.total).toBe(Math.round(firstLimit * first.dailyRate + 100_000 * second.dailyRate))
    expect(interest.lines.map((line) => line.source)).toEqual(['rule.offshore-tranche-1', 'rule.offshore-tranche-2'])
    expect(effectiveOffshoreRate({ deposited, interest: 0 })).toBeLessThan(first.dailyRate)
    expect(offshoreInterestBreakdown({ deposited: 0, interest: 50 })).toBeNull()
  })

  it('retire les intérêts avant les dépôts', () => {
    expect(withdrawFrom({ deposited: 1_000, interest: 50 }, 80)).toEqual({ deposited: 970, interest: 0 })
    expect(offshoreBalance({ deposited: 10, interest: 5 })).toBe(15)
  })
})
