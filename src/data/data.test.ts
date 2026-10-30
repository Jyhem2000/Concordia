import { describe, expect, it } from 'vitest'
import { entriesOf } from '../engine/records.ts'
import type { DistrictId } from '../engine/types.ts'
import {
  AUDIT_COUNTDOWN_DAY,
  DEBT_LATE,
  ENDINGS,
  GAME_LENGTH_DAYS,
  ICC_TIERS,
  OFFSHORE_WITHDRAW_FACTOR,
  OFFSHORE_DAILY_RATE,
  PROTECTION,
} from './balance.ts'
import { DISTRICTS, MAP_LINKS } from './districts.ts'
import { PRODUCTS, TIERS } from './products.ts'
import { TAGS } from './tags.ts'
import { VEHICLES } from './vehicles.ts'

/*
 * Cohérence des données avec les règles du design : une faute de saisie dans src/data/
 * doit casser un test plutôt qu'une partie.
 */

const products = entriesOf(PRODUCTS)
const districts = entriesOf(DISTRICTS)

describe('produits (chap. 2)', () => {
  it('ont le tier de leur ID', () => {
    for (const [id, product] of products) expect(`T${product.tier}`, id).toBe(id.slice(0, 2))
  })

  it('sont Légaux si et seulement si Tier 0, sans autre tag', () => {
    for (const [id, product] of products) {
      const tags: readonly string[] = product.tags
      if (product.tier === 0) expect(tags, id).toEqual(['TAG-LEGAL'])
      else expect(tags, id).not.toContain('TAG-LEGAL')
    }
  })

  it('masquent un tag si et seulement si Tier 0 (hors caisses scellées)', () => {
    for (const [id, product] of products) {
      expect('masks' in product, id).toBe(product.tier === 0 && !product.sealed)
    }
  })

  it("n'ont pas de tag en double", () => {
    for (const [id, product] of products) expect(new Set(product.tags).size, id).toBe(product.tags.length)
  })
})

describe('tiers (chap. 2)', () => {
  it('ont des fourchettes de stock valides', () => {
    for (const tier of Object.values(TIERS)) {
      expect(tier.dailyStock.min).toBeGreaterThan(0)
      expect(tier.dailyStock.min).toBeLessThanOrEqual(tier.dailyStock.max)
    }
  })

  it('ont un quota de Forte demande supérieur au quota neutre', () => {
    for (const tier of Object.values(TIERS)) {
      if (tier.demandQuota) expect(tier.demandQuota.strong).toBeGreaterThan(tier.demandQuota.neutral)
    }
  })
})

describe('districts (chap. 3)', () => {
  it('ne mettent jamais en Forte demande un produit de leur Production', () => {
    for (const [id, district] of districts) {
      const production: readonly string[] = district.production
      for (const product of district.strongDemand) expect(production, `${id} ${product}`).not.toContain(product)
    }
  })

  it('ne mettent jamais de Tier 0 en Forte demande', () => {
    for (const [id, district] of districts) {
      for (const product of district.strongDemand) expect(PRODUCTS[product].tier, `${id} ${product}`).not.toBe(0)
    }
  })

  it('paient mieux en Forte demande que sur leur Production', () => {
    for (const [id, district] of districts) {
      expect(district.coefStrongDemand, id).toBeGreaterThan(1)
      expect(district.coefProduction, id).toBeLessThan(1)
    }
  })

  it('ont des listes sans doublon', () => {
    for (const [id, district] of districts) {
      expect(new Set(district.production).size, id).toBe(district.production.length)
      expect(new Set(district.strongDemand).size, id).toBe(district.strongDemand.length)
    }
  })

  it('ont une sécurité de 1 à 5 étoiles et un échelon de 0 à 5 distinct', () => {
    for (const [id, district] of districts) {
      expect(district.security, id).toBeGreaterThanOrEqual(1)
      expect(district.security, id).toBeLessThanOrEqual(5)
    }
    const echelons = districts.map(([, district]) => district.echelon).sort()
    expect(echelons).toEqual([0, 1, 2, 3, 4, 5])
  })
})

describe('carte (chap. 3)', () => {
  it('ne contient ni boucle ni liaison en double', () => {
    const keys = MAP_LINKS.map(([a, b]) => [a, b].sort().join('-'))
    for (const [a, b] of MAP_LINKS) expect(a).not.toBe(b)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('relie tous les districts entre eux', () => {
    const reached = new Set<DistrictId>(['D1'])
    let grew = true
    while (grew) {
      grew = false
      for (const [a, b] of MAP_LINKS) {
        if (reached.has(a) !== reached.has(b)) {
          reached.add(a).add(b)
          grew = true
        }
      }
    }
    expect([...reached].sort()).toEqual(Object.keys(DISTRICTS).sort())
  })
})

describe('véhicules (chap. 4)', () => {
  it('ne consomment jamais moins de nuit que de jour', () => {
    for (const [id, vehicle] of Object.entries(VEHICLES)) {
      expect(vehicle.fuelPerTrip.night, id).toBeGreaterThanOrEqual(vehicle.fuelPerTrip.day)
    }
  })
})

describe('équilibrage (balance.ts)', () => {
  const ascending = (values: readonly number[]) => values.every((value, i) => i === 0 || value > values[i - 1])

  it('classe les paliers d’ICC du plus haut au plus bas, jusqu’à 0', () => {
    const mins = ICC_TIERS.map(({ min }) => min)
    expect(ascending([...mins].reverse())).toBe(true)
    expect(mins.at(-1)).toBe(0)
  })

  it('exige un score plus élevé pour chaque fin plus prestigieuse', () => {
    expect(ascending([ENDINGS.mafia.minScore, ENDINGS.elite.minScore, ENDINGS.saboteur.minScore])).toBe(true)
  })

  it('sert un taux offshore positif et une commission de retrait entre 0 et 1', () => {
    expect(OFFSHORE_DAILY_RATE).toBeGreaterThan(0)
    expect(OFFSHORE_WITHDRAW_FACTOR).toBeGreaterThan(0)
    expect(OFFSHORE_WITHDRAW_FACTOR).toBeLessThanOrEqual(1)
  })

  it('place les échéances dans la partie, dans l’ordre', () => {
    const days = [...PROTECTION.days, DEBT_LATE.day, AUDIT_COUNTDOWN_DAY]
    for (const day of days) {
      expect(day).toBeGreaterThan(1)
      expect(day).toBeLessThanOrEqual(GAME_LENGTH_DAYS)
    }
    expect(ascending(PROTECTION.days)).toBe(true)
  })
})

describe('risque (chap. 2, 3 et 5)', () => {
  it('donne aux tags des effets positifs, la couverture au seul tag Légal', () => {
    for (const [id, tag] of entriesOf(TAGS)) {
      for (const value of [tag.cover, tag.tripRisk, tag.detectedRisk, tag.bluffMalus]) if (value !== undefined) expect(value, id).toBeGreaterThan(0)
      expect(tag.cover !== undefined, id).toBe(id === 'TAG-LEGAL')
    }
  })

  it('ne fait détecter par les districts que des tags qui ont un effet de détection', () => {
    for (const [id, district] of districts) if (district.detection) expect(TAGS[district.detection].detectedRisk, id).toBeGreaterThan(0)
  })

  it('laisse la zone hors-réseau sans détection ni relais du DSC', () => {
    for (const [id, district] of districts) {
      if (!district.offGrid) continue
      expect(district.detection, id).toBeNull()
      expect(district.relay, id).toBe(false)
    }
  })
})

describe('produits utilisables (chap. 2)', () => {
  it('ne refroidit le moteur qu’avec du légal, et donne des aides au bluff en quantité positive', () => {
    for (const [id, product] of products) {
      if (product.cooling) expect(product.tags, id).toContain('TAG-LEGAL')
      if (product.bluffAid) expect(product.bluffAid.crates, id).toBeGreaterThan(0)
    }
  })
})
