import { DIFFICULTIES, RANKED } from '../src/data/balance.ts'
import type { Action } from '../src/engine/actions.ts'
import { utcDay } from '../src/engine/ranked.ts'
import { keysOf } from '../src/engine/records.ts'
import type { DifficultyId, EndingId } from '../src/engine/types.ts'

/*
 * Parties classées (chap. 1) : la forme d'une ouverture et d'un envoi, et leurs contrôles, partagés par le jeu, les
 * fonctions Cloudflare (à la réception) et la vérification par rejeu. Rien ici ne calcule de score : seul le rejeu le fait.
 */

/** Partie classée envoyée à la fin : qui, quel jour, quel mode, quelles règles, quelles actions */
export type RunSubmission = {
  playerId: string
  pseudo: string
  day: string
  difficulty: DifficultyId
  /** SHA du commit déployé : le rejeu se fait avec les règles de ce commit */
  rulesVersion: string
  actions: readonly Action[]
}

/** Refus d'un envoi ; `unstarted` : la partie n'a pas été ouverte auprès du serveur */
export type SubmissionError = 'malformed' | 'pseudo' | 'closed' | 'rules' | 'too-long' | 'unstarted'

/** Vérification d'une partie : en attente du prochain passage, retenue avec son score, ou rejetée */
export type RunStatus = 'pending' | 'valid' | 'rejected'

export type BoardEntry = { rank: number; pseudo: string; ending: EndingId; score: number }

/** Réponse du classement d'un jour et d'un mode, avec la ligne du joueur s'il a envoyé une partie */
export type Board = {
  day: string
  difficulty: DifficultyId
  entries: readonly BoardEntry[]
  own: { status: RunStatus; rank: number | null; score: number | null; ending: EndingId | null } | null
}

const PLAYER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
const COMMIT = /^[0-9a-f]{40}$/
const DAY = /^\d{4}-\d{2}-\d{2}$/
// Lettres, chiffres, espace, tiret, point et souligné : de quoi écrire un nom, rien pour du code ni des liens
const PSEUDO_CHARACTERS = /^[\p{L}\p{N} ._-]+$/u

/** Pseudo d'un joueur, une fois débarrassé de ses espaces superflus */
export function cleanPseudo(pseudo: string): string {
  return pseudo.trim().replace(/\s+/g, ' ')
}

/** Ce qui ne va pas dans un pseudo, ou null s'il convient */
export function pseudoError(pseudo: string): 'length' | 'characters' | null {
  const clean = cleanPseudo(pseudo)
  if (clean.length < RANKED.pseudoMin || clean.length > RANKED.pseudoMax) return 'length'
  return PSEUDO_CHARACTERS.test(clean) ? null : 'characters'
}

/** Jours dont le classement accepte encore une partie à cet instant : aujourd'hui et la veille (UTC) */
export function openDays(now: Date): string[] {
  return Array.from({ length: RANKED.openDays }, (_, back) => utcDay(new Date(now.getTime() - back * 86_400_000)))
}

/** Jour au format AAAA-MM-JJ */
export function isDay(value: unknown): value is string {
  return typeof value === 'string' && DAY.test(value)
}

export function isDifficulty(value: unknown): value is DifficultyId {
  return typeof value === 'string' && keysOf(DIFFICULTIES).some((id) => id === value)
}

/**
 * Liste d'actions de forme plausible : des objets avec un type. Le détail n'est pas vérifié ici, le rejeu refuse toute
 * action que les règles n'acceptent pas
 */
export function isActionList(value: unknown): value is Action[] {
  return (
    Array.isArray(value) && value.every((entry) => typeof entry === 'object' && entry !== null && 'type' in entry && typeof entry.type === 'string')
  )
}

/** Ouverture d'une partie classée : qui, dans quel mode. Le jour est celui du serveur, jamais celui du navigateur */
export type RunStart = { playerId: string; difficulty: DifficultyId }

/** Réponse à l'ouverture : le jour de la partie et sa graine secrète, donnée ce jour-là seulement */
export type StartGrant = { day: string; seed: number }

/** Refus d'une ouverture : demande illisible, tentative du joueur déjà prise, ou connexion déjà servie dans ce mode */
export type StartError = 'malformed' | 'taken' | 'connection'

/** Lit une demande d'ouverture de partie classée */
export function parseStart(body: unknown): { ok: true; start: RunStart } | { ok: false; error: 'malformed' } {
  if (typeof body !== 'object' || body === null) return { ok: false, error: 'malformed' }
  const playerId = 'playerId' in body ? body.playerId : undefined
  const difficulty = 'difficulty' in body ? body.difficulty : undefined
  if (typeof playerId !== 'string' || !PLAYER_ID.test(playerId) || !isDifficulty(difficulty)) return { ok: false, error: 'malformed' }
  return { ok: true, start: { playerId, difficulty } }
}

/** Réponse d'ouverture de la forme attendue */
export function isStartGrant(value: unknown): value is StartGrant {
  return (
    typeof value === 'object' &&
    value !== null &&
    'day' in value &&
    isDay(value.day) &&
    'seed' in value &&
    typeof value.seed === 'number' &&
    Number.isInteger(value.seed)
  )
}

/**
 * Empreinte d'une connexion (chap. 1) : SHA-256 de l'adresse salée du secret du jour. L'adresse n'est jamais gardée, et
 * l'empreinte d'un jour ne se compare pas à celle d'un autre
 */
export async function connectionOf(address: string, salt: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${address}`))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/** Lit un envoi reçu par le serveur, à l'instant `now` */
export function parseSubmission(body: unknown, now: Date): { ok: true; run: RunSubmission } | { ok: false; error: SubmissionError } {
  if (typeof body !== 'object' || body === null) return { ok: false, error: 'malformed' }
  const field = (key: string): unknown => (key in body ? Reflect.get(body, key) : undefined)
  const [playerId, pseudo, day, difficulty, rulesVersion, actions] = ['playerId', 'pseudo', 'day', 'difficulty', 'rulesVersion', 'actions'].map(field)
  if (typeof playerId !== 'string' || !PLAYER_ID.test(playerId)) return { ok: false, error: 'malformed' }
  if (!isDay(day) || !isDifficulty(difficulty) || !isActionList(actions)) return { ok: false, error: 'malformed' }
  if (typeof pseudo !== 'string' || pseudoError(pseudo) !== null) return { ok: false, error: 'pseudo' }
  if (typeof rulesVersion !== 'string' || !COMMIT.test(rulesVersion)) return { ok: false, error: 'rules' }
  if (!openDays(now).includes(day)) return { ok: false, error: 'closed' }
  if (actions.length > RANKED.maxActions) return { ok: false, error: 'too-long' }
  return { ok: true, run: { playerId, pseudo: cleanPseudo(pseudo), day, difficulty, rulesVersion, actions } }
}
