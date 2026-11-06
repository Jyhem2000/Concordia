import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { isVerdict, type PendingRun, type Verdict } from './verdict.ts'

/*
 * Vérification des parties classées (chap. 1, README « Mise en ligne »), lancée toutes les heures par GitHub Actions :
 * lit les parties en attente dans D1, rejoue chacune avec les règles du commit qui l'a vue naître, inscrit le verdict.
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

const rows = await query(`SELECT id, day, difficulty, rules_version AS version, actions FROM runs WHERE status = 'pending' ORDER BY id LIMIT ?`, [
  BATCH,
])
const byVersion = new Map<string, PendingRun[]>()
for (const row of rows) {
  if (typeof row !== 'object' || row === null || !('version' in row) || typeof row.version !== 'string') continue
  if (!('id' in row) || typeof row.id !== 'number' || !('day' in row) || typeof row.day !== 'string') continue
  if (!('difficulty' in row) || typeof row.difficulty !== 'string' || !('actions' in row) || typeof row.actions !== 'string') continue
  const run = { id: row.id, day: row.day, difficulty: row.difficulty, actions: row.actions }
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
console.log(`${rows.length} parties en attente : ${valid} retenues, ${rejected} rejetées`)
