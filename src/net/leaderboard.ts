import { isStartGrant, type Board, type RunStart, type RunSubmission, type StartGrant } from '../../server/runs.ts'
import type { DifficultyId } from '../engine/types.ts'

/*
 * Appels au serveur du classement (chap. 9, « Mise en ligne ») : les fonctions Cloudflare de `functions/api/`, sur le même
 * domaine que le jeu : ouverture d'une partie classée, envoi, lecture du classement. Le seul code réseau du jeu.
 */

/** Issue d'un envoi : reçu (en attente de vérification), déjà reçu pour ce jour et ce mode, refusé, ou injoignable */
export type SendOutcome = 'sent' | 'duplicate' | 'refused' | 'failed'

/**
 * Issue d'une ouverture de partie classée : le jour et la graine du serveur, ou le refus (tentative du joueur déjà
 * prise, connexion déjà servie dans ce mode, serveur injoignable)
 */
export type StartOutcome = { ok: true; grant: StartGrant } | { ok: false; error: StartRefusal }

export type StartRefusal = 'taken' | 'connection' | 'failed'

export async function startRun(start: RunStart): Promise<StartOutcome> {
  try {
    const response = await fetch('/api/start', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(start) })
    const body: unknown = await response.json()
    if (response.ok && isStartGrant(body)) return { ok: true, grant: body }
    const error = typeof body === 'object' && body !== null && 'error' in body ? body.error : null
    return { ok: false, error: error === 'taken' || error === 'connection' ? error : 'failed' }
  } catch {
    return { ok: false, error: 'failed' }
  }
}

export async function sendRun(run: RunSubmission): Promise<SendOutcome> {
  try {
    const response = await fetch('/api/runs', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(run) })
    if (response.ok) return 'sent'
    if (response.status === 409) return 'duplicate'
    return response.status >= 500 ? 'failed' : 'refused'
  } catch {
    return 'failed'
  }
}

/** Classement d'un jour, tous modes réunis (null) ou d'un seul mode, avec les parties du joueur ; null hors ligne ou sans serveur */
export async function fetchBoard(day: string, difficulty: DifficultyId | null, playerId: string): Promise<Board | null> {
  try {
    const query = new URLSearchParams({ day, difficulty: difficulty ?? 'all', player: playerId })
    const response = await fetch(`/api/leaderboard?${query}`)
    if (!response.ok) return null
    const board: unknown = await response.json()
    return isBoard(board) ? board : null
  } catch {
    return null
  }
}

/** Réponse du serveur de la forme attendue : un serveur d'une autre version ne casse pas l'accueil */
function isBoard(value: unknown): value is Board {
  return (
    typeof value === 'object' && value !== null && 'entries' in value && Array.isArray(value.entries) && 'mine' in value && Array.isArray(value.mine)
  )
}
