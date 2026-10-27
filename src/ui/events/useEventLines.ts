import { eventEffects, isProductList } from '../../engine/events.ts'
import type { EventEffect, GlobalEventId, LocalEventId, ProductId, ProductSelector } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'

/** Une ligne lisible par effet d'événement, avec sa portée quand l'effet ne vise que certains districts */
export function useEventLines(): (event: GlobalEventId | LocalEventId) => string[] {
  const { t, multiplier, signedPercent, percent } = useI18n()
  const fx = t.events.effects
  const products = (ids: readonly ProductId[]) => ids.map((id) => t.product[id].name).join(', ')
  const selected = (selector: ProductSelector) => {
    if (isProductList(selector)) return products(selector)
    if ('tag' in selector) return fx.tagged(t.tag[selector.tag].name)
    return fx.tiers(selector.tiers.join(', '))
  }

  const line = (effect: EventEffect): string => {
    switch (effect.kind) {
      case 'price':
        return fx.price(selected(effect.products), multiplier(effect.factor), effect.dayOnly === true)
      case 'appear':
        return effect.count
          ? fx.appearSome(effect.count.min, effect.count.max, products(effect.products), multiplier(effect.factor))
          : fx.appear(products(effect.products), multiplier(effect.factor))
      case 'stock':
        return effect.products ? fx.stock(products(effect.products), multiplier(effect.factor)) : fx.stockAll(multiplier(effect.factor))
      case 'risk':
        return fx.risk(signedPercent(effect.add, 0))
      case 'finalRisk':
        return fx.finalRisk(multiplier(effect.factor))
      case 'baseRisk':
        return fx.baseRisk(percent(effect.value, 0))
      case 'tag':
        return effect.factor === 0 ? fx.tagOff(t.tag[effect.tag].name) : fx.tag(t.tag[effect.tag].name, multiplier(effect.factor))
      case 'halfDay':
        return fx.halfDay
      case 'heat':
        return fx.heat(t.product[effect.melts].name, effect.ageDays, effect.dayTripChassis, effect.dayTripHealth)
    }
  }

  return (event) =>
    eventEffects(event).map(
      (effect) => line(effect) + (effect.districts ? fx.scope(effect.districts.map((id) => t.district[id].name).join(', ')) : ''),
    )
}
