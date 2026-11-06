/** Réponse JSON des fonctions du classement, jamais mise en cache : la ligne du joueur lui est propre */
export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })
}
