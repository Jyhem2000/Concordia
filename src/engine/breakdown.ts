import type { GameDataId } from './types.ts'

/*
 * Principe de transparence (chap. 9) : tout calcul affiché au joueur renvoie un Breakdown,
 * c'est-à-dire son total et les lignes sourcées qui y mènent, dans l'ordre d'application.
 *
 * Ex. (risque) :
 *   breakdown('D5', 0.4)
 *     .add('rule.suspicion', 0.1)
 *     .add('TAG-TECH', 0.167, { count: 4, cargo: 12 })
 *     .add('TAG-LEGAL', -0.1)
 *     .mul('VEH-02', 0.85)
 *     .clamp(0, 1)
 *     .build()
 *
 * Les lignes sans effet (ajout de 0, facteur 1, borne non atteinte…) ne sont pas enregistrées :
 * le détail ne montre que ce qui a réellement pesé.
 */

/** ID de donnée de jeu (D5, MOD-03, TAG-TECH…) ou clé de règle sans ID (`rule.suspicion`) */
export type BreakdownSource = GameDataId | `rule.${string}`

export type BreakdownOp = 'base' | 'add' | 'mul' | 'set' | 'clamp' | 'round'

/** Paramètres d'affichage d'une ligne, ex. { count: 4, cargo: 12 } pour « Tech (4/12) » */
export type BreakdownParams = Readonly<Record<string, number | string>>

export type BreakdownLine = {
  readonly op: BreakdownOp
  readonly source: BreakdownSource
  /** Opérande : valeur de départ, terme ajouté, facteur ou valeur imposée */
  readonly value: number
  /** Total cumulé après cette ligne */
  readonly total: number
  readonly params?: BreakdownParams
  /** Sous-calcul dont l'opérande est issu (ex. le cours dans le prix de vente) */
  readonly detail?: Breakdown
}

export type Breakdown = {
  readonly total: number
  readonly lines: readonly BreakdownLine[]
}

/** Opérande simple, ou sous-calcul dont le total sert d'opérande et reste consultable */
type Operand = number | Breakdown

export type BreakdownBuilder = {
  readonly total: number
  add(source: BreakdownSource, term: Operand, params?: BreakdownParams): BreakdownBuilder
  mul(source: BreakdownSource, factor: Operand, params?: BreakdownParams): BreakdownBuilder
  /** Impose une valeur (dérogation, rendements décroissants…) */
  set(source: BreakdownSource, value: number, params?: BreakdownParams): BreakdownBuilder
  clamp(min: number, max: number, source?: BreakdownSource): BreakdownBuilder
  round(source?: BreakdownSource): BreakdownBuilder
  build(): Breakdown
}

export function breakdown(
  source: BreakdownSource,
  base: Operand,
  params?: BreakdownParams,
): BreakdownBuilder {
  const lines: BreakdownLine[] = []
  let total = 0

  const push = (
    op: BreakdownOp,
    source: BreakdownSource,
    operand: Operand,
    next: (value: number) => number,
    params?: BreakdownParams,
  ) => {
    const value = typeof operand === 'number' ? operand : operand.total
    total = next(value)
    lines.push({
      op,
      source,
      value,
      total,
      ...(params && { params }),
      ...(typeof operand !== 'number' && { detail: operand }),
    })
  }

  push('base', source, base, (value) => value, params)

  const builder: BreakdownBuilder = {
    get total() {
      return total
    },
    add(source, term, params) {
      if (typeof term !== 'number' || term !== 0)
        push('add', source, term, (v) => total + v, params)
      return builder
    },
    mul(source, factor, params) {
      if (typeof factor !== 'number' || factor !== 1)
        push('mul', source, factor, (v) => total * v, params)
      return builder
    },
    set(source, value, params) {
      if (value !== total) push('set', source, value, (v) => v, params)
      return builder
    },
    clamp(min, max, source = 'rule.clamp') {
      const clamped = Math.min(max, Math.max(min, total))
      if (clamped !== total) push('clamp', source, clamped, (v) => v)
      return builder
    },
    round(source = 'rule.round') {
      const rounded = Math.round(total)
      if (rounded !== total) push('round', source, rounded, (v) => v)
      return builder
    },
    build: () => Object.freeze({ total, lines: Object.freeze([...lines]) }),
  }

  return builder
}
