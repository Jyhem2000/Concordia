import type { BreakdownSource } from '../engine/breakdown.ts'
import { fr } from './fr.ts'

export type Messages = typeof fr

/** Langues disponibles. Pour l'anglais : créer en.ts (`satisfies Messages`) et l'ajouter ici. */
export const locales = { fr } satisfies Record<string, Messages>

export type Locale = keyof typeof locales

export const DEFAULT_LOCALE: Locale = 'fr'

export type I18n = {
  locale: Locale
  t: Messages
  /** 2500 → « 2 500 ₡ » */
  credits(amount: number): string
  /** Fraction → pourcentage : 0.567 → « 56,7 % » */
  percent(fraction: number, maxDigits?: number): string
  /** 0.85 → « ×0,85 » */
  multiplier(factor: number): string
  number(value: number, maxDigits?: number): string
  /** Libellé d'une source de Breakdown : nom de la donnée de jeu ou de la règle */
  label(source: BreakdownSource): string
}

const cache = new Map<Locale, I18n>()

/** Instance stable par langue (les formateurs Intl sont coûteux à créer) */
export function getI18n(locale: Locale): I18n {
  let i18n = cache.get(locale)
  if (!i18n) {
    i18n = createI18n(locale)
    cache.set(locale, i18n)
  }
  return i18n
}

function createI18n(locale: Locale): I18n {
  const t: Messages = locales[locale]
  const formatters = new Map<string, Intl.NumberFormat>()

  const format = (value: number, options: Intl.NumberFormatOptions) => {
    const key = JSON.stringify(options)
    let formatter = formatters.get(key)
    if (!formatter) {
      formatter = new Intl.NumberFormat(t.intlLocale, options)
      formatters.set(key, formatter)
    }
    return formatter.format(value)
  }

  const number = (value: number, maxDigits = 2) => format(value, { maximumFractionDigits: maxDigits })

  return {
    locale,
    t,
    credits: (amount) => t.format.credits(number(amount, 0)),
    percent: (fraction, maxDigits = 1) => format(fraction, { style: 'percent', maximumFractionDigits: maxDigits }),
    multiplier: (factor) => t.format.multiplier(number(factor)),
    number,
    label: (source) => labelOf(t, source),
  }
}

function labelOf(t: Messages, source: BreakdownSource): string {
  if (source.startsWith('rule.')) return t.rule[source.slice('rule.'.length)] ?? source

  const sections: Record<string, { name: string }>[] = [t.tag, t.product, t.district, t.location, t.vehicle, t.module, t.crew, t.event]
  for (const section of sections) {
    if (Object.hasOwn(section, source)) return section[source].name
  }
  // Libellé manquant : l'ID brut reste visible pour être repéré et ajouté au catalogue
  return source
}
