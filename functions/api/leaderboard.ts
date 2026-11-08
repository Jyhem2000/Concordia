import { DIFFICULTIES, RANKED } from '../../src/data/balance.ts'
import { keysOf } from '../../src/engine/records.ts'
import { DEFEATS } from '../../src/engine/routine.ts'
import type { DifficultyId, EndingId } from '../../src/engine/types.ts'
import type { D1Value, PagesContext } from '../../server/cloudflare.ts'
import { json } from '../../server/http.ts'
import { isDay, isDifficulty, type Board, type OwnRun, type RunStatus } from '../../server/runs.ts'

type Row = { pseudo: string; difficulty: DifficultyId; ending: EndingId; score: number }
type OwnRow = { id: number; difficulty: DifficultyId; status: RunStatus; score: number | null; ending: EndingId | null; lost: number }

/** Mode demandé pour voir tous les modes réunis */
const ALL = 'all'

/** 1 pour une défaite, 0 pour une victoire : les défaites passent après toutes les victoires (chap. 1) */
const LOST = `CASE WHEN ending IN (${DEFEATS.map(() => '?').join(', ')}) THEN 1 ELSE 0 END`

/**
 * GET /api/leaderboard?day=&difficulty=&player= : les meilleurs scores vérifiés d'un jour, tous modes réunis (`all` ou
 * sans mode) ou pour un seul mode, et les parties du joueur dans cette vue (chap. 1 et 7). Les victoires d'abord, au
 * score, puis les défaites ; à égalité, la première partie reçue
 */
export async function onRequestGet({ request, env }: PagesContext): Promise<Response> {
  const params = new URL(request.url).searchParams
  const day = params.get('day')
  const mode = params.get('difficulty') ?? ALL
  const player = params.get('player')
  if (!isDay(day) || (mode !== ALL && !isDifficulty(mode))) return json({ error: 'malformed' }, 400)
  const difficulty = isDifficulty(mode) ? mode : null
  // Vue demandée : le jour, et le mode s'il y en a un
  const scope = difficulty ? `day = ? AND difficulty = ?` : `day = ?`
  const scoped: D1Value[] = difficulty ? [day, difficulty] : [day]

  const { results } = await env.DB.prepare(
    `SELECT pseudo, difficulty, ending, score FROM runs WHERE ${scope} AND status = 'valid'
     ORDER BY ${LOST} ASC, score DESC, id ASC LIMIT ?`,
  )
    .bind(...scoped, ...DEFEATS, RANKED.top)
    .all<Row>()

  const mine: OwnRun[] = []
  if (player) {
    const { results: own } = await env.DB.prepare(
      `SELECT id, difficulty, status, score, ending, ${LOST} AS lost FROM runs WHERE player_id = ? AND ${scope}`,
    )
      .bind(...DEFEATS, player, ...scoped)
      .all<OwnRow>()
    for (const row of own) {
      // Devant le joueur : les parties de meilleure sorte (victoire avant défaite), puis de meilleur score, puis reçues avant
      const ahead =
        row.status === 'valid' && row.score !== null
          ? await env.DB.prepare(
              `SELECT COUNT(*) AS count FROM runs WHERE ${scope} AND status = 'valid'
               AND (${LOST} < ? OR (${LOST} = ? AND (score > ? OR (score = ? AND id < ?))))`,
            )
              .bind(...scoped, ...DEFEATS, row.lost, ...DEFEATS, row.lost, row.score, row.score, row.id)
              .first<{ count: number }>()
          : null
      mine.push({ difficulty: row.difficulty, status: row.status, rank: ahead ? ahead.count + 1 : null, score: row.score, ending: row.ending })
    }
    // Dans l'ordre des modes, du plus facile au plus dur
    const order = keysOf(DIFFICULTIES)
    mine.sort((a, b) => order.indexOf(a.difficulty) - order.indexOf(b.difficulty))
  }

  const board: Board = { day, difficulty, entries: results.map((entry, index) => ({ rank: index + 1, ...entry })), mine }
  return json(board)
}
