import {
  DEBT_BEATING,
  DEBT_DAILY_RATE,
  DEBT_LATE,
  GAME_LENGTH_DAYS,
  LOAN_CEILING,
  OFFSHORE_DEPOSIT_FACTOR,
  OFFSHORE_TRANCHES,
  PROTECTION,
} from '../data/balance.ts'
import { baseValue } from './cargo.ts'
import { breakdown, type Breakdown, type RuleSource } from './breakdown.ts'
import type { GameState, OffshoreAccount } from './types.ts'

/*
 * Les trois portefeuilles (chap. 7) : dette mafieuse, collecte de protection et compte offshore.
 * Les montants ne sont pas indexés sur l'inflation.
 */

// ─── Dette ───

export function debtRate(state: GameState): number {
  return state.debtLate ? DEBT_LATE.dailyRate : DEBT_DAILY_RATE
}

/** Nouveau solde de la dette après les intérêts composés du matin, ou null sans dette */
export function debtInterestBreakdown(state: GameState): Breakdown | null {
  if (state.debt <= 0) return null
  return breakdown('rule.debt-balance', state.debt)
    .mul(state.debtLate ? 'rule.debt-late-rate' : 'rule.debt-rate', 1 + debtRate(state))
    .round()
    .build()
}

/** Prochaine échéance qui menace le joueur : tabassage, retard, puis audit ; null sans dette */
export function nextDebtDeadline(state: GameState): number | null {
  if (state.debt <= 0) return null
  if (state.day < DEBT_BEATING.day) return DEBT_BEATING.day
  if (!state.initialDebtPaid && !state.debtLate && state.day < DEBT_LATE.day) return DEBT_LATE.day
  return GAME_LENGTH_DAYS
}

/** Somme qu'on peut encore emprunter à `[LOC-D1-1]` (emprunt tactique, dette initiale soldée) */
export function loanRoom(state: GameState): number {
  return state.initialDebtPaid ? Math.max(0, LOAN_CEILING - state.debt) : 0
}

// ─── Collecte de protection ───

/** Prochain jour de collecte (à 06h00), ou null tant que la dette initiale n'est pas soldée ou après la dernière */
export function nextProtectionDay(state: GameState): number | null {
  if (!state.initialDebtPaid) return null
  return PROTECTION.days.find((day) => day > state.day) ?? null
}

/** Montant de la collecte : une part de la richesse visible, Cash-Puce et soute au prix de base */
export function protectionBreakdown(state: GameState): Breakdown {
  return breakdown('rule.cash', state.cash).add('rule.cargo-value', baseValue(state.cargo)).mul('rule.protection', PROTECTION.rate).round().build()
}

// ─── Compte offshore ───

export function offshoreBalance(account: OffshoreAccount): number {
  return account.deposited + account.interest
}

/** Libellé de chaque tranche dans le détail des intérêts, dans l'ordre de OFFSHORE_TRANCHES */
export const OFFSHORE_TRANCHE_SOURCES: readonly RuleSource[] = ['rule.offshore-tranche-1', 'rule.offshore-tranche-2', 'rule.offshore-tranche-3']

/** Intérêts simples du jour, tranche par tranche, sur les seuls dépôts ; null sans dépôt */
export function offshoreInterestBreakdown(account: OffshoreAccount): Breakdown | null {
  const terms = OFFSHORE_TRANCHES.map(({ upTo, dailyRate }, i) => {
    const from = i === 0 ? 0 : (OFFSHORE_TRANCHES[i - 1].upTo ?? Infinity)
    const portion = Math.max(0, Math.min(account.deposited, upTo ?? Infinity) - from)
    return { source: OFFSHORE_TRANCHE_SOURCES[i], interest: portion * dailyRate }
  }).filter(({ interest }) => interest > 0)

  const [first, ...others] = terms
  if (!first) return null
  return others
    .reduce((builder, { source, interest }) => builder.add(source, interest), breakdown(first.source, first.interest))
    .round()
    .build()
}

/** Taux du jour effectivement servi sur les dépôts (taux de la 1re tranche sans dépôt) */
export function effectiveOffshoreRate(account: OffshoreAccount): number {
  const interest = offshoreInterestBreakdown(account)
  return interest ? interest.total / account.deposited : OFFSHORE_TRANCHES[0].dailyRate
}

/** Somme créditée sur le compte pour un dépôt de `amount` ₡, commission déduite */
export function depositBreakdown(amount: number): Breakdown {
  return breakdown('rule.deposit', amount).mul('rule.laundry-fee', OFFSHORE_DEPOSIT_FACTOR).round().build()
}

/** Retrait : les intérêts versés partent en premier, les dépôts (qui rapportent) en dernier */
export function withdrawFrom(account: OffshoreAccount, amount: number): OffshoreAccount {
  const fromInterest = Math.min(account.interest, amount)
  return { interest: account.interest - fromInterest, deposited: account.deposited - (amount - fromInterest) }
}
