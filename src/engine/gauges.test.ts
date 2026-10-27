import { describe, expect, it } from 'vitest'
import { ICC_DAILY_ROUTE_GAIN_CAP, ICC_TIERS } from '../data/balance.ts'
import { changeHealth, gainRouteIcc, iccRouteGainLeft, iccTier } from './gauges.ts'
import { gameAt } from './test-helpers.ts'

describe('ICC', () => {
  it('range chaque seuil dans son palier, seuil inclus', () => {
    for (const { tier, min } of ICC_TIERS) expect(iccTier(min)).toBe(tier)
    expect(iccTier(100)).toBe('gold')
    expect(iccTier(0)).toBe('deviant')
  })

  it('plafonne les gains de route du jour et ne dépasse jamais 100 %', () => {
    const almostCapped = gainRouteIcc(gameAt(2, { icc: 50, iccRouteGains: ICC_DAILY_ROUTE_GAIN_CAP - 1 }), 5)
    expect(almostCapped.gained).toBe(1)
    expect(iccRouteGainLeft(almostCapped.state)).toBe(0)
    expect(gainRouteIcc(gameAt(2, { icc: 99 }), 5).gained).toBe(1)
  })
})

describe('Santé', () => {
  it('reste entre le plancher et 100 PV', () => {
    expect(changeHealth(gameAt(2, { health: 95 }), 10)).toMatchObject({ delta: 5, state: { health: 100 } })
    expect(changeHealth(gameAt(2, { health: 20 }), -30, 5)).toMatchObject({ delta: -15, state: { health: 5 } })
  })

  it("n'est pas remontée par un plancher supérieur à la Santé actuelle", () => {
    expect(changeHealth(gameAt(2, { health: 3 }), -10, 5)).toMatchObject({ delta: 0, state: { health: 3 } })
  })
})
