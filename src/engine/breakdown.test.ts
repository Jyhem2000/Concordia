import { describe, expect, it } from 'vitest'
import { breakdown } from './breakdown.ts'

describe('breakdown', () => {
  it("reproduit l'exemple de risque du chap. 10", () => {
    const risk = breakdown('D5', 0.4)
      .add('EVT-G02', 0.1)
      .add('TAG-TECH', 0.167, { count: 4, cargo: 12 })
      .add('TAG-LEGAL', -0.1)
      .mul('VEH-02', 0.85)
      .clamp(0, 1)
      .build()

    expect(risk.total).toBeCloseTo(0.48195)
    expect(risk.lines.map((line) => line.source)).toEqual(['D5', 'EVT-G02', 'TAG-TECH', 'TAG-LEGAL', 'VEH-02'])
    expect(risk.lines[3].total).toBeCloseTo(0.567)
    expect(risk.lines[2].params).toEqual({ count: 4, cargo: 12 })
  })

  it("n'enregistre pas les lignes sans effet", () => {
    const result = breakdown('D1', 0.1).add('EVT-G02', 0).mul('VEH-01', 1).set('EVT-D5-02', 0.1).clamp(0, 1).build()

    expect(result.lines).toHaveLength(1)
  })

  it("enregistre le plafonnement quand il s'applique", () => {
    const result = breakdown('D6', 0.55).add('rule.after', 0.25).add('T4-06', 0.3).clamp(0, 1).build()

    expect(result.total).toBe(1)
    expect(result.lines.at(-1)).toMatchObject({ op: 'clamp', source: 'rule.clamp', total: 1 })
  })

  it('applique les rendements décroissants via set (Savoir_Faire, chap. 7)', () => {
    const builder = breakdown('TAG-PERISHABLE', 1.3).mul('rule.after', 1.2).mul('CREW-03', 1.25)
    const excess = builder.total - 1.5
    const result = builder.set('rule.diminishing-returns', 1.5 + excess / 2).build()

    expect(result.lines[2].total).toBeCloseTo(1.95)
    expect(result.total).toBeCloseTo(1.725)
  })

  it('garde le détail des sous-calculs', () => {
    const quote = breakdown('T2-03', 500).mul('D2', 1.6).mul('rule.noise', 1.1).round().build()
    const salePrice = breakdown('rule.quote', quote).mul('rule.commission', 0.9).round().build()

    expect(quote.total).toBe(880)
    expect(salePrice.lines[0].detail).toBe(quote)
    expect(salePrice.total).toBe(792)
  })

  it('fige le résultat construit', () => {
    const builder = breakdown('D1', 0.1)
    const built = builder.build()
    builder.add('rule.after', 0.25)

    expect(built.total).toBe(0.1)
    expect(built.lines).toHaveLength(1)
    expect(Object.isFrozen(built.lines)).toBe(true)
  })
})
