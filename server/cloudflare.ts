/*
 * Le peu de l'API Cloudflare dont se servent les fonctions de `functions/api/` : une base D1 et le contexte d'une requête
 * Pages Functions. Écrit à la main pour ne pas dépendre des types de Workers.
 */

export type D1Value = string | number | null

export type D1Statement = {
  bind(...values: D1Value[]): D1Statement
  run(): Promise<{ meta: { changes: number } }>
  all<Row>(): Promise<{ results: Row[] }>
  first<Row>(): Promise<Row | null>
}

export type D1Database = {
  prepare(sql: string): D1Statement
}

export type Env = {
  /** Base D1 liée au projet Pages sous ce nom (chap. 9, « Mise en ligne ») */
  DB: D1Database
  /**
   * Jeton GitHub (accès fin, ce dépôt seul, droit Actions : écriture) qui lance la vérification à chaque partie soumise.
   * Absent : les parties attendent le passage horaire
   */
  GITHUB_TOKEN?: string
}

export type PagesContext = {
  request: Request
  env: Env
  /** Prolonge la fonction après sa réponse, le temps d'une tâche annexe */
  waitUntil(promise: Promise<unknown>): void
}
