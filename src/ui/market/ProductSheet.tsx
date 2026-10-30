import { BookOpen } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { AFTER, DAMAGED_FACTOR, FRESHNESS, QUOTE_NOISE } from '../../data/balance.ts'
import { DISTRICT_IDS, DISTRICTS } from '../../data/districts.ts'
import { PRODUCTS } from '../../data/products.ts'
import { TAGS } from '../../data/tags.ts'
import { isMemoryBlurred } from '../../engine/crew.ts'
import { searchSanction } from '../../engine/interception.ts'
import { bestRemembered, blurredQuote, productStatus } from '../../engine/market.ts'
import type { District, DistrictId, ProductId, TagId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Chip from '../shared/Chip.tsx'
import Modal from '../shared/Modal.tsx'
import { FIELD, TIER_STYLES } from '../shared/styles.ts'
import Thumb from '../shared/Thumb.tsx'
import QuoteChart from './QuoteChart.tsx'

type ProductSheetProps = {
  productId: ProductId
}

type SectionProps = {
  title: string
  children: ReactNode
}

type LinesProps = {
  lines: readonly string[]
}

/** Bouton « Fiche » d'une ligne du marché : ouvre la fiche produit en fenêtre (chap. 7) */
export default function ProductSheet({ productId }: ProductSheetProps) {
  const { t } = useI18n()
  // Fenêtre ouverte : état d'interface éphémère
  const [open, setOpen] = useState(false)
  const product = PRODUCTS[productId]
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <BookOpen size={12} aria-hidden="true" />
        {t.sheet.title}
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={
          <div className="flex items-center gap-3">
            <Thumb id={productId} tier={product.tier} size="lg" />
            <div className="min-w-0">
              <p className={`text-xs font-bold ${TIER_STYLES[product.tier].text}`}>T{product.tier}</p>
              <h2 className="font-bold">{t.product[productId].name}</h2>
              <div className="mt-1 flex flex-wrap gap-1">
                {product.tags.map((tag) => (
                  <Chip key={tag}>{t.tag[tag].name}</Chip>
                ))}
              </div>
            </div>
          </div>
        }
      >
        <SheetBody productId={productId} />
      </Modal>
    </>
  )
}

/** Contenu de la fiche : cours, effets des tags, actions, saisie et où vendre, sans rien cacher (chap. 7) */
function SheetBody({ productId }: ProductSheetProps) {
  // Profil public (vices de la Loterie compris) et mémoire de marché se lisent sur la partie entière
  const game = useGameStore((s) => s.game)
  const here = game.districtId
  const { t, percent, signedPercent, credits, multiplier } = useI18n()
  const product = PRODUCTS[productId]

  const where = (test: (district: District) => boolean) => DISTRICT_IDS.filter((id) => test(DISTRICTS[id]))
  const names = (ids: readonly DistrictId[]) => ids.map((id) => t.district[id].name).join(', ')
  const offGrid = names(where((district) => district.offGrid))

  // Effets de chaque tag, tels que les applique le moteur (chap. 2)
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

  // Actions propres au produit (chap. 2)
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

  // Sanction de base d'une saisie (chap. 5)
  // Celle du moteur, pour une soute qui ne contiendrait que ce produit
  const sanction = searchSanction({
    ...game,
    interception: null,
    cargo: [{ productId, qty: 1, unitCost: 0, travelled: true, boughtDay: game.day, damaged: false }],
  })
  const seizure = sanction
    ? t.sheet.seizure(percent(sanction.fineRate, 0), sanction.iccLoss, sanction.custodyDays, sanction.custodyDays > 0)
    : t.sheet.legal

  // Qui l'apprécie : connivence des agents, priorité des milices (chap. 2 et 5)
  const bribes = where((district) => district.bribeFavorites.includes(productId))
  const tolls = where((district) => district.tollFavorites.includes(productId))

  // Où le vendre : profil public, puis meilleur cours mémorisé ailleurs (chap. 2)
  const strong = DISTRICT_IDS.filter((id) => productStatus(game, id, productId) === 'strong')
  const produced = DISTRICT_IDS.filter((id) => productStatus(game, id, productId) === 'production')
  const best = bestRemembered(game, productId)

  // Districts dont le joueur a vu le marché, pour la courbe ; le district actuel d'abord
  const observed = [here, ...DISTRICT_IDS.filter((id) => id !== here)].filter((id) =>
    (game.memory[id] ?? []).some((seen) => seen.quotes[productId] !== undefined),
  )
  const [picked, setPicked] = useState<DistrictId>(here)
  const chartDistrict = observed.includes(picked) ? picked : (observed[0] ?? here)

  const sale = [
    t.sheet.strong(strong.length > 0 ? names(strong) : t.sheet.nowhere),
    ...(produced.length > 0 ? [t.sheet.produced(names(produced))] : []),
    best
      ? t.sheet.best(
          isMemoryBlurred(game, best.districtId)
            ? t.travel.blurred(credits(blurredQuote(best.quote).low), credits(blurredQuote(best.quote).high))
            : credits(best.quote),
          t.district[best.districtId].name,
          best.age,
        )
      : t.sheet.noMemory,
  ]
  const seizureLines = [
    seizure,
    ...(bribes.length > 0 ? [t.sheet.bribeFavorite(names(bribes))] : []),
    ...(tolls.length > 0 ? [t.sheet.tollFavorite(names(tolls))] : []),
  ]

  return (
    <div className="flex flex-col gap-4">
      <Section title={t.sheet.quotesTitle}>
        {observed.length > 1 && (
          <select
            aria-label={t.sheet.historyDistrict}
            value={chartDistrict}
            onChange={(event) => setPicked(observed.find((id) => id === event.target.value) ?? here)}
            className={`mb-2 ${FIELD}`}
          >
            {observed.map((id) => (
              <option key={id} value={id}>
                {t.district[id].name}
              </option>
            ))}
          </select>
        )}
        <QuoteChart productId={productId} districtId={chartDistrict} />
        <p className="mt-2 text-xs text-ink-muted">
          {t.sheet.trendRule(percent(QUOTE_NOISE.persistence, 0), percent(QUOTE_NOISE.shock, 0), percent(QUOTE_NOISE.max, 0))}
        </p>
      </Section>
      {product.tags.length > 0 && (
        <Section title={t.sheet.tagsTitle}>
          <Lines lines={product.tags.flatMap(tagLines)} />
        </Section>
      )}
      {actions.length > 0 && (
        <Section title={t.sheet.actionsTitle}>
          <Lines lines={actions} />
        </Section>
      )}
      <Section title={t.sheet.seizureTitle}>
        <Lines lines={seizureLines} />
      </Section>
      <Section title={t.sheet.saleTitle}>
        <Lines lines={sale} />
      </Section>
    </div>
  )
}

function Section({ title, children }: SectionProps) {
  return (
    <section>
      <h3 className="mb-1 text-xs font-bold tracking-wide text-accent uppercase">{title}</h3>
      {children}
    </section>
  )
}

function Lines({ lines }: LinesProps) {
  return (
    <ul className="list-disc space-y-0.5 pl-4 text-xs text-ink-soft">
      {lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  )
}
