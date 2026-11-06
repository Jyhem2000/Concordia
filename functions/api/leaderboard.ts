import { RANKED } from '../../src/data/balance.ts'
import type { EndingId } from '../../src/engine/types.ts'
import type { PagesContext } from '../../server/cloudflare.ts'
import { json } from '../../server/http.ts'
import { isDay, isDifficulty, type Board, type RunStatus } from '../../server/runs.ts'

type Row = { pseudo: string; ending: EndingId; score: number }
type OwnRow = { id: number; status: RunStatus; score: number | null }

/**
 * GET /api/leaderboard?day=&difficulty=&player= : les meilleurs scores vérifiés d'un jour et d'un mode, et la ligne du
 * joueur (chap. 1 et 7). Rang au score, à égalité la première partie reçue
 */
export async function onRequestGet({ request, env }: PagesContext): Promise<Response> {
  const params = new URL(request.url).searchParams
  const day = params.get('day')
  const difficulty = params.get('difficulty')
  const player = params.get('player')
  if (!isDay(day) || !isDifficulty(difficulty)) return json({ error: 'malformed' }, 400)

  const { results } = await env.DB.prepare(
    `SELECT pseudo, ending, score FROM runs WHERE day = ? AND difficulty = ? AND status = 'valid'
     ORDER BY score DESC, id ASC LIMIT ?`,
  )
    .bind(day, difficulty, RANKED.top)
    .all<Row>()

  let own: Board['own'] = null
  if (player) {
    const row = await env.DB.prepare('SELECT id, status, score FROM runs WHERE player_id = ? AND day = ? AND difficulty = ?')
      .bind(player, day, difficulty)
      .first<OwnRow>()
    if (row) {
      const ahead =
        row.status === 'valid' && row.score !== null
          ? await env.DB.prepare(
              `SELECT COUNT(*) AS count FROM runs WHERE day = ? AND difficulty = ? AND status = 'valid'
               AND (score > ? OR (score = ? AND id < ?))`,
            )
              .bind(day, difficulty, row.score, row.score, row.id)
              .first<{ count: number }>()
          : null
      own = { status: row.status, rank: ahead ? ahead.count + 1 : null, score: row.score }
    }
  }

  const board: Board = { day, difficulty, entries: results.map((entry, index) => ({ rank: index + 1, ...entry })), own }
  return json(board)
}
