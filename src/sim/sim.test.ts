import { describe, expect, it } from 'vitest'
import { applyAction } from '../engine/actions.ts'
import { createInitialState } from '../engine/state.ts'
import type { GameState } from '../engine/types.ts'
import { randomBot } from './bots/random.ts'
import { traderBot } from './bots/trader.ts'
import { violations } from './invariants.ts'
import { NOVICE, NOVICE_TEMPERAMENT, PLANS, TEMPERAMENTS } from './plans.ts'
import { playGame, type Bot } from './runner.ts'
import { publicView } from './view.ts'

/** États rencontrés au fil d'une partie jouée par un bot (sur la vue publique, comme en campagne) */
function statesOf(bot: Bot, seed: number, limit = 400): GameState[] {
  const states: GameState[] = []
  let state = createInitialState(seed)
  for (let i = 0; i < limit && state.status === 'playing'; i++) {
    states.push(state)
    const result = applyAction(state, bot.decide(publicView(state)))
    if (!result.ok) break
    state = result.state
  }
  return states
}

describe('information honnête', () => {
  const bots = [traderBot(NOVICE, NOVICE_TEMPERAMENT, 'survive'), ...TEMPERAMENTS.map((temperament) => traderBot(PLANS[1], temperament, 'score'))]

  it('décide pareil sur la vue publique et sur l’état complet', () => {
    for (const bot of bots) {
      for (const state of statesOf(bot, 7)) expect(bot.decide(publicView(state)), bot.name).toEqual(bot.decide(state))
    }
  })

  it('neutralise l’état caché', () => {
    const view = publicView(createInitialState(3))
    expect(view.patrolDistrict).toBeNull()
    expect(view.events.tomorrow).toBeNull()
    expect(view.rng).toBe(0)
  })
})

describe('parties simulées', () => {
  it('sont reproductibles à graine égale', () => {
    const bot = () => traderBot(PLANS[0], TEMPERAMENTS[1], 'score')
    expect(playGame(bot(), 5)).toEqual(playGame(bot(), 5))
  })

  it('vont jusqu’à la fin sans action refusée ni invariant violé', () => {
    for (const seed of [1, 2, 3]) {
      const record = playGame(traderBot(PLANS[2], TEMPERAMENTS[1], 'score'), seed)
      expect(record).toMatchObject({ refused: 0, forcedSleeps: 0, violations: [] })
      expect(record.daily.length).toBeGreaterThan(0)
    }
  })

  it('résistent au bot Aléatoire', () => {
    for (const seed of [1, 2]) {
      const record = playGame(randomBot(seed), seed)
      expect(record.violations).toEqual([])
      expect(record.lastDay).toBeGreaterThan(1)
    }
  })

  it('vérifient les invariants d’un état sain', () => {
    expect(violations(createInitialState(1))).toEqual([])
    expect(violations({ ...createInitialState(1), cash: -1 })).toHaveLength(1)
  })
})
