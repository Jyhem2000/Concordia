/*
 * Aides typées pour les tables indexées par ID (produits, districts, marchés…).
 *
 * TypeScript type volontairement `Object.keys` / `Object.entries` / `Object.fromEntries` avec des
 * clés `string`, car un objet peut porter plus de clés que son type. Nos tables sont des littéraux
 * fermés, vérifiés à la compilation par `satisfies Record<…Id, …>` : le cast est donc sûr, et il est
 * confiné ici plutôt que répété dans le code.
 */

export function keysOf<K extends string>(record: Readonly<Record<K, unknown>>): K[] {
  return Object.keys(record) as K[]
}

export function entriesOf<K extends string, V>(record: Readonly<Record<K, V>>): [K, V][] {
  return Object.entries(record) as [K, V][]
}

/** Construit une table complète à partir de ses clés, dans leur ordre (important pour les tirages aléatoires) */
export function recordOf<K extends string, V>(keys: readonly K[], value: (key: K) => V): Record<K, V> {
  return Object.fromEntries(keys.map((key) => [key, value(key)])) as Record<K, V>
}
