import type { PagesContext } from '../../server/cloudflare.ts'
import { json } from '../../server/http.ts'
import { parseSubmission } from '../../server/runs.ts'

/** Taille maximale d'un envoi, très au-dessus d'une vraie partie (quelques kilo-octets) : rien de plus n'est lu */
const MAX_BYTES = 512_000

/**
 * POST /api/runs : enregistre une partie classée en attente de vérification (chap. 1). Rien n'est calculé ici : le score
 * viendra du rejeu (scripts/verify.ts)
 */
export async function onRequestPost({ request, env }: PagesContext): Promise<Response> {
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
  // Une seule partie par joueur, par jour et par mode : la seconde est ignorée et signalée
  const { meta } = await env.DB.prepare(
    `INSERT INTO runs (player_id, pseudo, day, difficulty, rules_version, actions, submitted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT (player_id, day, difficulty) DO NOTHING`,
  )
    .bind(playerId, pseudo, day, difficulty, rulesVersion, JSON.stringify(actions), new Date().toISOString())
    .run()
  return meta.changes === 0 ? json({ error: 'duplicate' }, 409) : json({ status: 'pending' }, 202)
}
