import type { PagesContext } from '../../server/cloudflare.ts'
import { dispatchVerification } from '../../server/dispatch.ts'
import { json } from '../../server/http.ts'
import { parseSubmission } from '../../server/runs.ts'

/** Taille maximale d'un envoi, très au-dessus d'une vraie partie (quelques kilo-octets) : rien de plus n'est lu */
const MAX_BYTES = 512_000

/**
 * POST /api/runs : enregistre une partie classée en attente de vérification (chap. 1). Rien n'est calculé ici : le score
 * viendra du rejeu (scripts/verify.ts), lancé aussitôt la partie enregistrée
 */
export async function onRequestPost(context: PagesContext): Promise<Response> {
  const { request, env } = context
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BYTES) return json({ error: 'too-long' }, 413)
  const text = await request.text()
  if (text.length > MAX_BYTES) return json({ error: 'too-long' }, 413)
  let body: unknown
  try {
    body = JSON.parse(text)
  } catch {
    return json({ error: 'malformed' }, 400)
  }
  const parsed = parseSubmission(body, new Date())
  if (!parsed.ok) return json({ error: parsed.error }, 400)
  const { playerId, pseudo, day, difficulty, rulesVersion, actions } = parsed.run
  // Seule une partie ouverte par POST /api/start, avec la graine secrète du jour, concourt (chap. 1)
  const started = await env.DB.prepare(`SELECT id FROM starts WHERE player_id = ? AND day = ? AND difficulty = ?`)
    .bind(playerId, day, difficulty)
    .first<{ id: number }>()
  if (!started) return json({ error: 'unstarted' }, 403)
  // Une seule partie par joueur, par jour et par mode : la seconde est ignorée et signalée
  const { meta } = await env.DB.prepare(
    `INSERT INTO runs (player_id, pseudo, day, difficulty, rules_version, actions, submitted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT (player_id, day, difficulty) DO NOTHING`,
  )
    .bind(playerId, pseudo, day, difficulty, rulesVersion, JSON.stringify(actions), new Date().toISOString())
    .run()
  if (meta.changes === 0) return json({ error: 'duplicate' }, 409)
  // La vérification part sans faire attendre le joueur
  context.waitUntil(dispatchVerification(env.GITHUB_TOKEN))
  return json({ status: 'pending' }, 202)
}
