import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { openDays } from '../server/runs.ts'
import { isVerdict, type PendingRun, type Verdict } from './verdict.ts'

/*
 * Vérification des parties classées (chap. 1, chap. 9 « Mise en ligne »), lancée toutes les heures par GitHub Actions :
 * lit les parties en attente dans D1 avec la graine secrète de leur jour, rejoue chacune avec les règles du commit qui l'a
 * vue naître, inscrit le verdict, puis efface les ouvertures des jours clos.
 * Usage : CLOUDFLARE_ACCOUNT_ID=… CLOUDFLARE_API_TOKEN=… D1_DATABASE_ID=… node scripts/verify.ts
 */

/** Parties traitées par passage : de quoi tenir largement dans le temps d'une tâche, le reste attend le suivant */
const BATCH = 2_000

const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, D1_DATABASE_ID } = process.env
if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN || !D1_DATABASE_ID) {
  console.error('Variables manquantes : CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, D1_DATABASE_ID')
  process.exit(1)
}
const endpoint = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${D1_DATABASE_ID}/query`

type QueryResponse = { success: boolean; result: { results: unknown[] }[] }

function isQueryResponse(value: unknown): value is QueryResponse {
  return typeof value === 'object' && value !== null && 'success' in value && 'result' in value && Array.isArray(value.result)
}

/** Une requête SQL sur D1 par son API HTTP ; les lignes restent à vérifier par l'appelant */
async function query(sql: string, params: (string | number | null)[] = []): Promise<unknown[]> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify({ sql, params }),
  })
  const body: unknown = await response.json()
  if (!response.ok || !isQueryResponse(body) || !body.success)
    throw new Error(`D1 a refusé la requête (${response.status}) : ${JSON.stringify(body)}`)
  return body.result[0]?.results ?? []
}

const git = (...args: string[]) => execFileSync('git', args, { encoding: 'utf8' }).trim()

/**
 * Extrait le commit d'une version des règles à part, ou null s'il est inconnu, hors de la branche principale ou antérieur
 * au rejeu. Seul un commit de la branche principale est exécuté : la version vient de l'envoi, donc d'un inconnu.
 */
function checkout(version: string, head: string, worktrees: string[]): string | null {
  if (version === head) return process.cwd()
  try {
    git('merge-base', '--is-ancestor', version, head)
  } catch {
    return null
  }
  const dir = mkdtempSync(join(tmpdir(), 'concordia-'))
  git('worktree', 'add', '--detach', dir, version)
  worktrees.push(dir)
  return existsSync(join(dir, 'scripts', 'replay.ts')) ? dir : null
}

/** Verdicts des parties d'une version, rejouées par le scripts/replay.ts de son commit, sans les secrets de la tâche */
function judge(dir: string, runs: PendingRun[]): Verdict[] {
  const output = execFileSync(process.execPath, [join(dir, 'scripts', 'replay.ts')], {
    env: { PATH: process.env.PATH ?? '' },
    input: JSON.stringify(runs),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
  const verdicts: unknown = JSON.parse(output)
  return Array.isArray(verdicts) ? verdicts.filter(isVerdict) : []
}

const rows = await query(
  `SELECT runs.id, runs.day, runs.difficulty, runs.rules_version AS version, runs.actions, days.seed
   FROM runs LEFT JOIN days ON days.day = runs.day WHERE runs.status = 'pending' ORDER BY runs.id LIMIT ?`,
  [BATCH],
)
const byVersion = new Map<string, PendingRun[]>()
for (const row of rows) {
  if (typeof row !== 'object' || row === null || !('version' in row) || typeof row.version !== 'string') continue
  if (!('id' in row) || typeof row.id !== 'number' || !('day' in row) || typeof row.day !== 'string') continue
  if (!('difficulty' in row) || typeof row.difficulty !== 'string' || !('actions' in row) || typeof row.actions !== 'string') continue
  // Les règles d'avant la graine secrète tiraient la graine de la date et ignorent ce champ
  const seed = 'seed' in row && typeof row.seed === 'number' ? { seed: row.seed } : {}
  const run: PendingRun = { id: row.id, day: row.day, difficulty: row.difficulty, actions: row.actions, ...seed }
  byVersion.set(row.version, [...(byVersion.get(row.version) ?? []), run])
}

const head = git('rev-parse', 'HEAD')
const worktrees: string[] = []
let valid = 0
let rejected = 0
try {
  for (const [version, runs] of byVersion) {
    const dir = checkout(version, head, worktrees)
    const verdicts: Verdict[] = dir ? judge(dir, runs) : runs.map(({ id }) => ({ id, status: 'rejected', reason: 'rules' }))
    const now = new Date().toISOString()
    for (const verdict of verdicts) {
      if (verdict.status === 'valid') {
        valid++
        await query(`UPDATE runs SET status = 'valid', ending = ?, score = ?, verified_at = ? WHERE id = ? AND status = 'pending'`, [
          verdict.ending,
          verdict.score,
          now,
          verdict.id,
        ])
      } else {
        rejected++
        await query(`UPDATE runs SET status = 'rejected', reason = ?, verified_at = ? WHERE id = ? AND status = 'pending'`, [
          verdict.reason,
          now,
          verdict.id,
        ])
      }
    }
  }
} finally {
  for (const dir of worktrees) git('worktree', 'remove', '--force', dir)
}
// Ouvertures des jours clos : leur empreinte de connexion ne sert plus à rien, elle disparaît (chap. 1)
await query(`DELETE FROM starts WHERE day < ?`, [openDays(new Date()).at(-1) ?? ''])
console.log(`${rows.length} parties en attente : ${valid} retenues, ${rejected} rejetées`)
