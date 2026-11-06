import { describe, expect, it } from 'vitest'
import { PRODUCTS } from '../../data/products.ts'
import { CREW, MODULES, VEHICLES } from '../../data/vehicles.ts'
import { keysOf } from '../../engine/records.ts'
import { IMAGE_FILE_NAMES } from './images.ts'

describe('images', () => {
  it("ne contient aucun fichier qui ne porte l'ID d'une donnée", () => {
    const ids: string[] = [...keysOf(PRODUCTS), ...keysOf(VEHICLES), ...keysOf(MODULES), ...keysOf(CREW)]
    expect(IMAGE_FILE_NAMES.filter((name) => !ids.includes(name))).toEqual([])
  })
})
