import { describe, expect, it } from 'vitest'
import { DEBT_DAILY_RATE, DEBT_LATE, ENDINGS, GAME_LENGTH_DAYS, PROTECTION, RELAY_SLEEP } from '../data/balance.ts'
import { endingFor, sleep } from './routine.ts'
import { defined, gameAt } from './test-helpers.ts'
import type { GameState } from './types.ts'

describe('routine matinale : dette', () => {
  it('compose les intérêts et les note au briefing', () => {
    const state = sleep(gameAt(1))
    expect(state.debt).toBe(Math.round(gameAt(1).debt * (1 + DEBT_DAILY_RATE)))
    expect(state.briefing?.debtInterest?.total).toBe(state.debt)
  })

  it('majore le taux pour de bon si la dette initiale n’a jamais été soldée', () => {
    const late = sleep(gameAt(DEBT_LATE.day - 1))
    expect(late.debtLate).toBe(true)
    expect(late.briefing?.debtLate).toBe(true)
    expect(sleep(late).debt).toBe(Math.round(late.debt * (1 + DEBT_LATE.dailyRate)))

    expect(sleep(gameAt(DEBT_LATE.day - 1, { initialDebtPaid: true })).debtLate).toBe(false)
  })
})

describe('routine matinale : collecte et offshore', () => {
  it('prélève la collecte sur le Cash-Puce ; le reliquat va à la dette', () => {
    const before = gameAt(PROTECTION.days[0] - 1, {
      initialDebtPaid: true,
      debt: 0,
      cash: 10,
      cargo: [{ productId: 'T3-01', qty: 5, unitCost: 1, travelled: true, boughtDay: 1, damaged: false }],
    })
    const state = sleep(before)
    const protection = defined(state.briefing?.protection, 'collecte')
    expect(protection.paid).toBe(10)
    expect(protection.toDebt).toBe(protection.due.total - 10)
    expect(state.cash).toBe(0)
    expect(state.debt).toBe(protection.toDebt)
  })

  it("verse les intérêts offshore sans qu'ils produisent d'intérêts", () => {
    const twoNights = sleep(sleep(gameAt(2, { offshore: { deposited: 10_000, interest: 0 } })))
    const daily = defined(twoNights.briefing?.offshoreInterest).total
    expect(twoNights.offshore).toEqual({ deposited: 10_000, interest: daily * 2 })
  })
})

describe('sommeil', () => {
  it('rend ICC et Santé au relais, et remet à zéro le plafond de gains à 06h00', () => {
    const state = sleep(gameAt(2, { icc: 50, health: 50 }))
    expect(state).toMatchObject({ icc: 50 + RELAY_SLEEP.icc, health: 50 + RELAY_SLEEP.health, iccRouteGains: 0 })
    expect(state.briefing?.sleep).toEqual({ icc: RELAY_SLEEP.icc, health: RELAY_SLEEP.health })
  })

  it('ne rend rien au bivouac de Rust Valley', () => {
    const state = sleep(gameAt(2, { districtId: 'D4', icc: 50, health: 50 }))
    expect(state).toMatchObject({ icc: 50, health: 50 })
    expect(state.briefing?.sleep).toBeNull()
  })
})

describe('audit du Jour 30', () => {
  const offshore = (score: number) => ({ deposited: score, interest: 0 })
  const solvent = (patch: Partial<GameState>) => gameAt(GAME_LENGTH_DAYS, { debt: 0, initialDebtPaid: true, ...patch })

  it('recycle en Bio-Briques avec une dette non soldée', () => {
    const state = sleep(gameAt(GAME_LENGTH_DAYS))
    expect(state.status).toBe('finished')
    expect(state.ending).toEqual({ id: 'bio-bricks', score: 0 })
  })

  it('formate le Cash-Puce et note le compte offshore', () => {
    const state = sleep(solvent({ cash: 50_000, offshore: offshore(1_234) }))
    expect(state.cash).toBe(0)
    expect(state.ending).toEqual({ id: 'standard', score: 1_234 })
  })

  it('évalue les fins de la plus prestigieuse à la plus modeste', () => {
    const { saboteur, elite, mafia } = ENDINGS
    const beacon = [{ productId: saboteur.requiredProduct, qty: 1, unitCost: 1, travelled: true, boughtDay: 1, damaged: false }]
    expect(endingFor(solvent({ offshore: offshore(saboteur.minScore), cargo: beacon, districtId: saboteur.district })).id).toBe('saboteur')
    // Sans la balise : fin suivante (Citoyen Or au départ)
    expect(endingFor(solvent({ offshore: offshore(saboteur.minScore), districtId: saboteur.district })).id).toBe('elite')
    expect(endingFor(solvent({ offshore: offshore(elite.minScore), icc: 50 })).id).toBe('mafia')
    expect(endingFor(solvent({ offshore: offshore(mafia.minScore - 1) })).id).toBe('standard')
  })
})
