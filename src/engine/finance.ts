import {
  DEBT_DAILY_RATE,
  DEBT_LATE,
  GAME_LENGTH_DAYS,
  OFFSHORE_WITHDRAW_FACTOR,
  OFFSHORE_DAILY_RATE,
  VENTURE,
  PROTECTION,
  SURVIVAL_ADVANCE,
} from '../data/balance.ts'
import { baseValue } from './cargo.ts'
import { breakdown, type Breakdown } from './breakdown.ts'
import type { GameState, OffshoreAccount } from './types.ts'

/*
 * Les trois portefeuilles (chap. 1) : dette mafieuse, collecte de protection et compte offshore.
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

/** Prochaine échéance qui menace le joueur : retard, puis audit ; null sans dette */
export function nextDebtDeadline(state: GameState): number | null {
  if (state.debt <= 0) return null
  if (!state.initialDebtPaid && !state.debtLate && state.day < DEBT_LATE.day) return DEBT_LATE.day
  return GAME_LENGTH_DAYS
}

/** Avance de survie qu'on peut encore emprunter à `[LOC-D1-1]` : un total sur toute la partie */
export function loanRoom(state: GameState): number {
  return Math.max(0, SURVIVAL_ADVANCE - state.advanced)
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

/** Intérêts simples du jour sur les seuls dépôts, flux pirate de Glitch compris ; null sans dépôt */
export function offshoreInterestBreakdown(account: OffshoreAccount, crewBonus = 0): Breakdown | null {
  if (account.deposited <= 0) return null
  return breakdown('rule.offshore-rate', account.deposited * OFFSHORE_DAILY_RATE)
    .add('CREW-02', account.deposited * crewBonus)
    .round()
    .build()
}

/** Taux du jour servi sur les dépôts */
export function effectiveOffshoreRate(crewBonus = 0): number {
  return OFFSHORE_DAILY_RATE + crewBonus
}

/** Intérêts simples du jour du placement du Cartel, sur les seuls dépôts ; null sans dépôt */
export function ventureInterestBreakdown(account: OffshoreAccount): Breakdown | null {
  if (account.deposited <= 0) return null
  return breakdown('rule.venture-rate', account.deposited * VENTURE.dailyRate)
    .round()
    .build()
}

/** Placement après un coup de filet : dépôts et intérêts perdent la même part */
export function raided(account: OffshoreAccount): OffshoreAccount {
  const kept = 1 - VENTURE.raidLoss
  return { deposited: Math.round(account.deposited * kept), interest: Math.round(account.interest * kept) }
}

/** Score : compte offshore et placement du Cartel (chap. 1) */
export function scoreOf(state: GameState): number {
  return offshoreBalance(state.offshore) + offshoreBalance(state.venture)
}

/** Cash-Puce reçu pour un retrait de `amount` ₡ débités du compte, commission déduite */
export function withdrawalBreakdown(amount: number): Breakdown {
  return breakdown('rule.withdrawal', amount).mul('rule.laundry-fee', OFFSHORE_WITHDRAW_FACTOR).round().build()
}

/** Jours de dépôt (au taux du jour) pour que les intérêts couvrent la commission d'un retrait */
export function breakEvenDays(crewBonus = 0): number {
  return Math.ceil((1 - OFFSHORE_WITHDRAW_FACTOR) / effectiveOffshoreRate(crewBonus))
}

/** Retrait : les intérêts versés partent en premier, les dépôts (qui rapportent) en dernier */
export function withdrawFrom(account: OffshoreAccount, amount: number): OffshoreAccount {
  const fromInterest = Math.min(account.interest, amount)
  return { interest: account.interest - fromInterest, deposited: account.deposited - (amount - fromInterest) }
}
