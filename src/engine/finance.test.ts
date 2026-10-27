import { describe, expect, it } from 'vitest'
import {
  DEBT_BEATING,
  DEBT_DAILY_RATE,
  DEBT_LATE,
  ENDINGS,
  GAME_LENGTH_DAYS,
  ICC_DAILY_ROUTE_GAIN_CAP,
  LOAN_CEILING,
  OFFSHORE_DEPOSIT_FACTOR,
  OFFSHORE_TRANCHES,
  PROTECTION,
  RELAY_SLEEP,
} from '../data/balance.ts'
import { applyAction, type Action, type ActionError } from './actions.ts'
import { effectiveOffshoreRate, nextProtectionDay, offshoreBalance, offshoreInterestBreakdown, withdrawFrom } from './finance.ts'
import { gainRouteIcc } from './gauges.ts'
import { endingFor } from './routine.ts'
import { createInitialState } from './state.ts'
import type { GameState } from './types.ts'

const run = (state: GameState, ...actions: Action[]): GameState =>
  actions.reduce((current, action) => {
    const result = applyAction(current, action)
    if (!result.ok) throw new Error(`${action.type} : ${result.error}`)
    return result.state
  }, state)

const errorOf = (state: GameState, action: Action): ActionError | null => {
  const result = applyAction(state, action)
  return result.ok ? null : result.error
}

const start = createInitialState(99)
const at = (day: number, patch: Partial<GameState> = {}): GameState => ({ ...start, day, ...patch })

describe('dette mafieuse', () => {
  it('compose les intérêts à chaque routine matinale', () => {
    const state = run(start, { type: 'sleep' })
    expect(state.debt).toBe(Math.round(start.debt * (1 + DEBT_DAILY_RATE)))
    expect(state.briefing?.debtInterest?.total).toBe(state.debt)
  })

  it("tabasse le joueur à l'échéance si le solde dépasse le seuil, sans descendre sous le plancher", () => {
    const state = run(at(DEBT_BEATING.day - 1, { debt: DEBT_BEATING.threshold, health: 20 }), { type: 'sleep' })
    expect(state.health).toBe(DEBT_BEATING.healthFloor)
    expect(state.briefing?.beating).toBe(20 + RELAY_SLEEP.health - DEBT_BEATING.healthFloor)
  })

  it('épargne le joueur sous le seuil', () => {
    const state = run(at(DEBT_BEATING.day - 1, { debt: 100 }), { type: 'sleep' })
    expect(state.briefing?.beating).toBe(0)
  })

  it('majore le taux pour de bon si la dette initiale n’a jamais été soldée', () => {
    const late = run(at(DEBT_LATE.day - 1), { type: 'sleep' })
    expect(late.debtLate).toBe(true)
    expect(late.briefing?.debtLate).toBe(true)
    const next = run(late, { type: 'sleep' })
    expect(next.debt).toBe(Math.round(late.debt * (1 + DEBT_LATE.dailyRate)))

    const paid = run(at(DEBT_LATE.day - 1, { initialDebtPaid: true }), { type: 'sleep' })
    expect(paid.debtLate).toBe(false)
  })

  it('se rembourse de jour, à Hives seulement, et débloque l’emprunt une fois soldée', () => {
    expect(errorOf(at(2, { districtId: 'D2' }), { type: 'repay', amount: 100 })).toBe('not-at-location')
    expect(errorOf(at(2, { phase: 'night' }), { type: 'repay', amount: 100 })).toBe('location-closed')
    expect(errorOf(start, { type: 'borrow', amount: 100 })).toBe('loan-locked')

    const rich = at(2, { cash: start.debt + 500 })
    expect(errorOf(rich, { type: 'repay', amount: start.debt + 1 })).toBe('invalid-amount')
    const paid = run(rich, { type: 'repay', amount: start.debt })
    expect(paid.debt).toBe(0)
    expect(paid.cash).toBe(500)
    expect(paid.initialDebtPaid).toBe(true)

    // Statut définitif : réemprunter ne le retire pas
    const loan = run(paid, { type: 'borrow', amount: 1_000 })
    expect(loan).toMatchObject({ debt: 1_000, cash: 1_500, initialDebtPaid: true })
    expect(errorOf(loan, { type: 'borrow', amount: LOAN_CEILING })).toBe('loan-ceiling')
  })
})

describe('collecte de protection', () => {
  it('ne concerne que les joueurs ayant soldé la dette initiale', () => {
    expect(nextProtectionDay(start)).toBeNull()
    expect(nextProtectionDay(at(PROTECTION.days[0], { initialDebtPaid: true }))).toBe(PROTECTION.days[1])
  })

  it('prélève une part du Cash-Puce et de la soute ; le reliquat va à la dette', () => {
    const before = at(PROTECTION.days[0] - 1, {
      initialDebtPaid: true,
      debt: 0,
      cash: 10,
      cargo: [{ productId: 'T3-01', qty: 5, unitCost: 1, travelled: true }],
    })
    const state = run(before, { type: 'sleep' })
    const protection = state.briefing!.protection!
    expect(protection.paid).toBe(10)
    expect(protection.toDebt).toBe(protection.due.total - 10)
    expect(state.cash).toBe(0)
    expect(state.debt).toBe(protection.toDebt)
  })
})

describe('compte offshore', () => {
  it('se crédite commission déduite, à la Laverie de Glass Spire', () => {
    expect(errorOf(start, { type: 'deposit', amount: 100 })).toBe('not-at-location')
    const state = run(at(2, { districtId: 'D5' }), { type: 'deposit', amount: 1_000 })
    expect(state.offshore.deposited).toBe(Math.round(1_000 * OFFSHORE_DEPOSIT_FACTOR))
    expect(state.cash).toBe(start.cash - 1_000)
  })

  it('verse des intérêts simples, tranche par tranche', () => {
    const [first, second] = OFFSHORE_TRANCHES
    const deposited = first.upTo! + 100_000
    const interest = offshoreInterestBreakdown({ deposited, interest: 0 })!
    expect(interest.total).toBe(Math.round(first.upTo! * first.dailyRate + 100_000 * second.dailyRate))
    expect(effectiveOffshoreRate({ deposited, interest: 0 })).toBeLessThan(first.dailyRate)

    const state = run(at(2, { offshore: { deposited, interest: 0 } }), { type: 'sleep' }, { type: 'sleep' })
    // Les intérêts versés ne produisent pas d'intérêts
    expect(state.offshore).toEqual({ deposited, interest: interest.total * 2 })
  })

  it('retire les intérêts avant les dépôts', () => {
    expect(withdrawFrom({ deposited: 1_000, interest: 50 }, 80)).toEqual({ deposited: 970, interest: 0 })
    expect(errorOf(at(2, { districtId: 'D5' }), { type: 'withdraw', amount: 1 })).toBe('not-enough-offshore')
  })
})

describe('sommeil', () => {
  it('rend ICC et Santé au relais, dans la limite du plafond du jour', () => {
    const state = run(at(2, { icc: 50, health: 50 }), { type: 'sleep' })
    expect(state.icc).toBe(50 + RELAY_SLEEP.icc)
    expect(state.health).toBe(50 + RELAY_SLEEP.health)
    expect(state.iccRouteGains).toBe(0)

    const capped = gainRouteIcc(at(2, { icc: 50, iccRouteGains: ICC_DAILY_ROUTE_GAIN_CAP - 1 }), RELAY_SLEEP.icc)
    expect(capped.gained).toBe(1)
  })

  it('ne rend rien au bivouac de Rust Valley', () => {
    const state = run(at(2, { districtId: 'D4', icc: 50, health: 50 }), { type: 'sleep' })
    expect(state).toMatchObject({ icc: 50, health: 50 })
    expect(state.briefing?.sleep).toBeNull()
  })
})

describe('audit du Jour 30', () => {
  const lastNight = (patch: Partial<GameState>) => run(at(GAME_LENGTH_DAYS, { debt: 0, initialDebtPaid: true, ...patch }), { type: 'sleep' })
  const offshore = (score: number) => ({ deposited: score, interest: 0 })

  it('envoie au hachoir avec une dette non soldée', () => {
    const state = run(at(GAME_LENGTH_DAYS), { type: 'sleep' })
    expect(state.status).toBe('finished')
    expect(state.ending).toEqual({ id: 'bio-bricks', score: 0 })
  })

  it('formate le Cash-Puce et note le compte offshore', () => {
    const state = lastNight({ cash: 50_000, offshore: offshore(1_234) })
    expect(state.cash).toBe(0)
    expect(state.ending).toEqual({ id: 'standard', score: 1_234 })
  })

  it('évalue les fins de la plus prestigieuse à la plus modeste', () => {
    const { saboteur, elite, mafia } = ENDINGS
    const beacon = [{ productId: saboteur.requiredProduct, qty: 1, unitCost: 1, travelled: true }]
    expect(endingFor(at(30, { debt: 0, offshore: offshore(saboteur.minScore), cargo: beacon, districtId: saboteur.district })).id).toBe('saboteur')
    // Sans la balise ou hors de Rust Valley : fin suivante (Citoyen Or au départ)
    expect(endingFor(at(30, { debt: 0, offshore: offshore(saboteur.minScore), districtId: saboteur.district })).id).toBe('elite')
    expect(endingFor(at(30, { debt: 0, offshore: offshore(elite.minScore), icc: 50 })).id).toBe('mafia')
    expect(endingFor(at(30, { debt: 0, offshore: offshore(mafia.minScore - 1) })).id).toBe('standard')
    expect(offshoreBalance({ deposited: 10, interest: 5 })).toBe(15)
  })
})
