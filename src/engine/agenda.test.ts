import { describe, expect, it } from 'vitest'
import { GAME_LENGTH_DAYS, PROTECTION } from '../data/balance.ts'
import { LOTTERY } from '../data/events.ts'
import { agenda } from './agenda.ts'
import { gameAt } from './test-helpers.ts'

describe('agenda (chap. 7)', () => {
  it('liste les échéances sûres, triées, jusqu’à l’audit', () => {
    const items = agenda(gameAt(3, { initialDebtPaid: true, debt: 0 }))
    const days = items.map((item) => item.day)
    expect(days).toEqual([...days].sort((a, b) => a - b))
    expect(items.filter((item) => item.kind === 'protection').map((item) => item.day)).toEqual(PROTECTION.days.filter((day) => day > 3))
    expect(items.filter((item) => item.kind === 'lottery').map((item) => item.day)).toEqual(LOTTERY.days.filter((day) => day > 3))
    expect(items.at(-1)).toEqual({ kind: 'audit', day: GAME_LENGTH_DAYS })
  })

  it('ne promet pas de collecte tant que la dette initiale n’est pas soldée', () => {
    expect(agenda(gameAt(3)).some((item) => item.kind === 'protection')).toBe(false)
    expect(agenda(gameAt(3)).some((item) => item.kind === 'debt')).toBe(true)
  })
})
