import { DAMAGED_FACTOR, FRESHNESS, HIGH_TIER, SEARCH } from '../../data/balance.ts'
import { DISTRICT_IDS, DISTRICTS } from '../../data/districts.ts'
import { PRODUCTS } from '../../data/products.ts'
import { TAGS } from '../../data/tags.ts'
import type { District, DistrictId, ProductId, TagId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import { FOCUS_RING } from '../shared/focus.ts'

type ProductSheetProps = {
  productId: ProductId
}

/** Fiche produit dépliable : effets des tags, actions, sanction et où vendre, sans rien cacher (chap. 10) */
export default function ProductSheet({ productId }: ProductSheetProps) {
  const memory = useGameStore((s) => s.game.memory)
  const here = useGameStore((s) => s.game.districtId)
  const day = useGameStore((s) => s.game.day)
  const { t, percent, signedPercent, credits } = useI18n()
  const product = PRODUCTS[productId]

  const where = (test: (district: District) => boolean) => DISTRICT_IDS.filter((id) => test(DISTRICTS[id]))
  const names = (ids: readonly DistrictId[]) => ids.map((id) => t.district[id].name).join(', ')
  const offGrid = names(where((district) => district.offGrid))

  // Effets de chaque tag, tels que les applique le moteur (chap. 3)
  const tagLines = (tag: TagId): string[] => {
    const { cover, tripRisk, detectedRisk, bluffMalus, smell, perishable, breakage, explosion, fleeDropBonus } = TAGS[tag]
    const smelly = smell ? names(where((district) => district.odorFactor > 1)) : ''
    return [
      ...(cover ? [t.sheet.cover(percent(cover, 0), offGrid)] : []),
      ...(tripRisk ? [t.sheet.tripRisk(percent(tripRisk, 0), offGrid, smelly)] : []),
      ...(detectedRisk ? [t.sheet.detectedRisk(percent(detectedRisk, 0), names(where((district) => district.detection === tag)))] : []),
      ...(bluffMalus ? [t.sheet.bluffMalus(percent(bluffMalus, 0), smelly)] : []),
      ...(perishable ? [t.sheet.perishable(FRESHNESS.rottenFromAge)] : []),
      ...(breakage
        ? [t.sheet.breakage(percent(breakage.fleeChance, 0), percent(breakage.shockChance, 0), breakage.shockThreshold, percent(DAMAGED_FACTOR, 0))]
        : []),
      ...(explosion ? [t.sheet.explosion(percent(explosion.chance, 0), explosion.chassisLoss)] : []),
      ...(fleeDropBonus ? [t.sheet.drop(signedPercent(fleeDropBonus, 0))] : []),
    ].map((line) => `${t.tag[tag].name} : ${line}`)
  }

  // Actions propres au produit (chap. 3)
  const { masks, bluffAid, doping, sleeplessNight, cooling, iccRestore, beaconRisk, lethalOnSearch, nightProfile } = product
  const actions = [
    ...(masks ? [t.sheet.masks(t.tag[masks].name)] : []),
    ...(bluffAid ? [t.sheet.bluffAid(bluffAid.crates, bluffAid.cancelsSmell ? t.interception.cancelsSmell : signedPercent(bluffAid.bonus, 0))] : []),
    ...(doping ? [t.sheet.doping(signedPercent(doping.fleeBonus, 0), doping.chassisLoss, doping.iccLoss)] : []),
    ...(sleeplessNight ? [t.sheet.sleepless(sleeplessNight.healthLoss)] : []),
    ...(cooling ? [t.sheet.cooling(cooling.crates)] : []),
    ...(iccRestore ? [t.market.iccRestore(iccRestore)] : []),
    ...(beaconRisk ? [t.sheet.beacon(signedPercent(beaconRisk, 0))] : []),
    ...(lethalOnSearch ? [t.sheet.lethal] : []),
    ...(nightProfile ? [t.sheet.night[nightProfile]] : []),
  ]

  // Sanction de base d'une saisie (chap. 6)
  const legal = product.tags.includes('TAG-LEGAL')
  const sanction = product.tier >= HIGH_TIER ? SEARCH.high : SEARCH.low
  const seizure = legal
    ? t.sheet.legal
    : t.sheet.seizure(percent(sanction.fine, 0), sanction.iccLoss, sanction.custodyDays, product.tier >= HIGH_TIER)

  // Qui l'apprécie : connivence des agents, priorité des milices (chap. 6 et 7)
  const bribes = where((district) => district.bribeFavorites.includes(productId))
  const tolls = where((district) => district.tollFavorites.includes(productId))

  // Où le vendre : profil public, puis meilleur cours mémorisé ailleurs (chap. 7)
  const strong = where((district) => district.strongDemand.includes(productId))
  const produced = where((district) => district.production.includes(productId))
  const best = DISTRICT_IDS.flatMap((id) => {
    const seen = memory[id]
    const quote = seen?.quotes[productId]
    return id !== here && seen && quote !== undefined ? [{ id, quote, age: day - seen.day }] : []
  }).reduce<{ id: DistrictId; quote: number; age: number } | null>((top, entry) => (top === null || entry.quote > top.quote ? entry : top), null)

  const lines = [
    ...product.tags.flatMap(tagLines),
    ...actions,
    seizure,
    ...(bribes.length > 0 ? [t.sheet.bribeFavorite(names(bribes))] : []),
    ...(tolls.length > 0 ? [t.sheet.tollFavorite(names(tolls))] : []),
    t.sheet.strong(strong.length > 0 ? names(strong) : t.sheet.nowhere),
    ...(produced.length > 0 ? [t.sheet.produced(names(produced))] : []),
    best ? t.sheet.best(credits(best.quote), t.district[best.id].name, best.age) : t.sheet.noMemory,
  ]

  return (
    <details className="mt-1 text-xs">
      <summary className={`w-fit cursor-pointer rounded text-zinc-400 ${FOCUS_RING}`}>{t.sheet.title}</summary>
      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-zinc-300">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </details>
  )
}
