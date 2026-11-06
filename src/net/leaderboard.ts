import type { Board, RunSubmission } from '../../server/runs.ts'
import type { DifficultyId } from '../engine/types.ts'

/*
 * Appels au serveur du classement (README, Mise en ligne) : les fonctions Cloudflare de `functions/api/`, sur le même
 * domaine que le jeu. Le seul code réseau du jeu.
 */

/** Issue d'un envoi : reçu (en attente de vérification), déjà reçu pour ce jour et ce mode, refusé, ou injoignable */
export type SendOutcome = 'sent' | 'duplicate' | 'refused' | 'failed'

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

/** Classement d'un jour et d'un mode, avec la ligne du joueur ; null hors ligne ou sans serveur */
export async function fetchBoard(day: string, difficulty: DifficultyId, playerId: string): Promise<Board | null> {
  try {
    const query = new URLSearchParams({ day, difficulty, player: playerId })
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
  return typeof value === 'object' && value !== null && 'entries' in value && Array.isArray(value.entries) && 'own' in value
}
