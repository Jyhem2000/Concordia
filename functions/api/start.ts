import type { PagesContext } from '../../server/cloudflare.ts'
import { json } from '../../server/http.ts'
import { connectionOf, parseStart, type StartError, type StartGrant } from '../../server/runs.ts'
import { utcDay } from '../../src/engine/ranked.ts'
import { randomSeed } from '../../src/engine/rng.ts'

type Day = { seed: number; salt: string }

/**
 * POST /api/start : ouvre la partie classée du jour d'un joueur dans un mode (chap. 1). La graine du jour, tirée au
 * hasard à la première ouverture, n'est donnée qu'ici et ce jour-là ; la tentative est notée pour le joueur et pour sa
 * connexion, avant de la donner
 */
export async function onRequestPost({ request, env }: PagesContext): Promise<Response> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return refuse('malformed', 400)
  }
  const parsed = parseStart(body)
  if (!parsed.ok) return refuse('malformed', 400)
  const { playerId, difficulty } = parsed.start

  // Le jour du serveur : un navigateur à l'heure fausse ne choisit pas sa graine
  const day = utcDay(new Date())
  await env.DB.prepare(`INSERT INTO days (day, seed, salt) VALUES (?, ?, ?) ON CONFLICT (day) DO NOTHING`)
    .bind(day, randomSeed(), crypto.randomUUID())
    .run()
  const today = await env.DB.prepare(`SELECT seed, salt FROM days WHERE day = ?`).bind(day).first<Day>()
  if (!today) return json({ error: 'server' }, 500)

  // Une ouverture par joueur et une par connexion, par jour et par mode : la contrainte d'unicité tranche, sans course
  const connection = await connectionOf(request.headers.get('cf-connecting-ip') ?? '', today.salt)
  const { meta } = await env.DB.prepare(
    `INSERT INTO starts (player_id, day, difficulty, connection, started_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
  )
    .bind(playerId, day, difficulty, connection, new Date().toISOString())
    .run()
  if (meta.changes === 0) {
    const own = await env.DB.prepare(`SELECT id FROM starts WHERE player_id = ? AND day = ? AND difficulty = ?`)
      .bind(playerId, day, difficulty)
      .first<{ id: number }>()
    return refuse(own ? 'taken' : 'connection', 409)
  }
  const grant: StartGrant = { day, seed: today.seed }
  return json(grant)
}

function refuse(error: StartError, status: number): Response {
  return json({ error }, status)
}
