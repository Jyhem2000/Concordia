import { describe, expect, it } from 'vitest'

// Sources de l'interface, lues brutes pour vérifier la charte (chap. 7)
const sources = import.meta.glob<string>(['../**/*.tsx', '../**/*.ts', '!../**/*.test.ts'], { query: '?raw', import: 'default', eager: true })

/** Couleur brute de la palette Tailwind (`text-red-300`, `bg-zinc-900/40`…) au lieu d'un rôle du thème */
const RAW_COLOR =
  /\b(?:text|bg|border(?:-[lrtbxy])?|divide|ring|ring-offset|fill|stroke|decoration|outline|from|via|to)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g

describe('charte graphique', () => {
  it('colore l’interface par rôles du thème, jamais par couleurs brutes de la palette', () => {
    // Garde-fou : le motif de fichiers trouve bien les composants
    expect(Object.keys(sources).length).toBeGreaterThan(30)
    const offenders = Object.entries(sources).flatMap(([file, source]) => (source.match(RAW_COLOR) ?? []).map((match) => `${file}: ${match}`))
    expect(offenders).toEqual([])
  })
})
