import { RANKED } from '../../src/data/balance.ts'
import { DEFEATS } from '../../src/engine/routine.ts'
import type { EndingId } from '../../src/engine/types.ts'
import type { PagesContext } from '../../server/cloudflare.ts'
import { json } from '../../server/http.ts'
import { isDay, isDifficulty, type Board, type RunStatus } from '../../server/runs.ts'

type Row = { pseudo: string; ending: EndingId; score: number }
type OwnRow = { id: number; status: RunStatus; score: number | null; ending: EndingId | null; lost: number }

/** 1 pour une défaite, 0 pour une victoire : les défaites passent après toutes les victoires (chap. 1) */
const LOST = `CASE WHEN ending IN (${DEFEATS.map(() => '?').join(', ')}) THEN 1 ELSE 0 END`

/**
 * GET /api/leaderboard?day=&difficulty=&player= : les meilleurs scores vérifiés d'un jour et d'un mode, et la ligne du
 * joueur (chap. 1 et 7). Les victoires d'abord, au score, puis les défaites ; à égalité, la première partie reçue
 */
export async function onRequestGet({ request, env }: PagesContext): Promise<Response> {
  const params = new URL(request.url).searchParams
  const day = params.get('day')
  const difficulty = params.get('difficulty')
  const player = params.get('player')
  if (!isDay(day) || !isDifficulty(difficulty)) return json({ error: 'malformed' }, 400)

  const { results } = await env.DB.prepare(
    `SELECT pseudo, ending, score FROM runs WHERE day = ? AND difficulty = ? AND status = 'valid'
     ORDER BY ${LOST} ASC, score DESC, id ASC LIMIT ?`,
  )
    .bind(day, difficulty, ...DEFEATS, RANKED.top)
    .all<Row>()

  let own: Board['own'] = null
  if (player) {
    const row = await env.DB.prepare(`SELECT id, status, score, ending, ${LOST} AS lost FROM runs WHERE player_id = ? AND day = ? AND difficulty = ?`)
      .bind(...DEFEATS, player, day, difficulty)
      .first<OwnRow>()
    if (row) {
      // Devant le joueur : les parties de meilleure sorte (victoire avant défaite), puis de meilleur score, puis reçues avant
      const ahead =
        row.status === 'valid' && row.score !== null
          ? await env.DB.prepare(
              `SELECT COUNT(*) AS count FROM runs WHERE day = ? AND difficulty = ? AND status = 'valid'
               AND (${LOST} < ? OR (${LOST} = ? AND (score > ? OR (score = ? AND id < ?))))`,
            )
              .bind(day, difficulty, ...DEFEATS, row.lost, ...DEFEATS, row.lost, row.score, row.score, row.id)
              .first<{ count: number }>()
          : null
      own = { status: row.status, rank: ahead ? ahead.count + 1 : null, score: row.score, ending: row.ending }
    }
  }

  const board: Board = { day, difficulty, entries: results.map((entry, index) => ({ rank: index + 1, ...entry })), own }
  return json(board)
}
