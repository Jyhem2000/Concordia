import { AFTER, DAMAGED_FACTOR, FRESHNESS } from '../../data/balance.ts'
import { DISTRICT_IDS, DISTRICTS } from '../../data/districts.ts'
import { PRODUCTS } from '../../data/products.ts'
import { TAGS } from '../../data/tags.ts'
import { isMemoryBlurred } from '../../engine/crew.ts'
import { searchSanction } from '../../engine/interception.ts'
import { blurredQuote, lastSeen, productStatus } from '../../engine/market.ts'
import type { District, DistrictId, ProductId, TagId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import { FOCUS_RING } from '../shared/focus.ts'
import QuoteChart from './QuoteChart.tsx'

type ProductSheetProps = {
  productId: ProductId
}

/** Fiche produit dépliable : effets des tags, actions, sanction et où vendre, sans rien cacher (chap. 10) */
export default function ProductSheet({ productId }: ProductSheetProps) {
  // Profil public (vices de la Loterie compris) et mémoire de marché se lisent sur la partie entière
  const game = useGameStore((s) => s.game)
  const { day, districtId: here } = game
  const { t, percent, signedPercent, credits, multiplier } = useI18n()
  const product = PRODUCTS[productId]

  const where = (test: (district: District) => boolean) => DISTRICT_IDS.filter((id) => test(DISTRICTS[id]))
  const names = (ids: readonly DistrictId[]) => ids.map((id) => t.district[id].name).join(', ')
  const offGrid = names(where((district) => district.offGrid))

  // Effets de chaque tag, tels que les applique le moteur (chap. 3)
  const tagLines = (tag: TagId): string[] => {
    const { cover, tripRisk, detectedRisk, bluffMalus, smell, perishable, breakage, explosion, fleeDropBonus, nightSale } = TAGS[tag]
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
      ...(nightSale ? [t.sheet.nightSale(multiplier(nightSale), tag === AFTER.tag ? multiplier(AFTER.festiveFactor) : null)] : []),
    ].map((line) => `${t.tag[tag].name} : ${line}`)
  }

  // Actions propres au produit (chap. 3)
  const { masks, bluffAid, doping, sleeplessNight, cooling, iccRestore, beaconRisk, lethalOnSearch } = product
  const actions = [
    ...(masks ? [t.sheet.masks(t.tag[masks].name)] : []),
    ...(bluffAid ? [t.sheet.bluffAid(bluffAid.crates, bluffAid.cancelsSmell ? t.interception.cancelsSmell : signedPercent(bluffAid.bonus, 0))] : []),
    ...(doping ? [t.sheet.doping(signedPercent(doping.fleeBonus, 0), doping.chassisLoss, doping.iccLoss)] : []),
    ...(sleeplessNight ? [t.sheet.sleepless(sleeplessNight.healthLoss)] : []),
    ...(cooling ? [t.sheet.cooling(cooling.crates)] : []),
    ...(iccRestore ? [t.market.iccRestore(iccRestore)] : []),
    ...(beaconRisk ? [t.sheet.beacon(signedPercent(beaconRisk, 0))] : []),
    ...(lethalOnSearch ? [t.sheet.lethal] : []),
  ]

  // Sanction de base d'une saisie (chap. 6)
  // Celle du moteur, pour une soute qui ne contiendrait que ce produit
  const sanction = searchSanction({
    ...game,
    interception: null,
    cargo: [{ productId, qty: 1, unitCost: 0, travelled: true, boughtDay: game.day, damaged: false }],
  })
  const seizure = sanction
    ? t.sheet.seizure(percent(sanction.fineRate, 0), sanction.iccLoss, sanction.custodyDays, sanction.custodyDays > 0)
    : t.sheet.legal

  // Qui l'apprécie : connivence des agents, priorité des milices (chap. 6 et 7)
  const bribes = where((district) => district.bribeFavorites.includes(productId))
  const tolls = where((district) => district.tollFavorites.includes(productId))

  // Où le vendre : profil public, puis meilleur cours mémorisé ailleurs (chap. 7)
  const strong = DISTRICT_IDS.filter((id) => productStatus(game, id, productId) === 'strong')
  const produced = DISTRICT_IDS.filter((id) => productStatus(game, id, productId) === 'production')
  const best = DISTRICT_IDS.flatMap((id) => {
    const seen = lastSeen(game, id)
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
    best
      ? t.sheet.best(
          isMemoryBlurred(game, best.id)
            ? t.travel.blurred(credits(blurredQuote(best.quote).low), credits(blurredQuote(best.quote).high))
            : credits(best.quote),
          t.district[best.id].name,
          best.age,
        )
      : t.sheet.noMemory,
  ]

  return (
    <details className="mt-1 text-xs">
      <summary className={`w-fit cursor-pointer rounded text-zinc-400 ${FOCUS_RING}`}>{t.sheet.title}</summary>
      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-zinc-300">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <QuoteChart productId={productId} />
    </details>
  )
}
