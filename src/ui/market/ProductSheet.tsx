import { useState, type ReactNode } from 'react'
import { averageCost, ownedQty } from '../../engine/cargo.ts'
import Margin from '../shared/Margin.tsx'
import { useConditions } from '../shared/useConditions.ts'
import { AFTER, DAMAGED_FACTOR, FRESHNESS } from '../../data/balance.ts'
import { DISTRICT_IDS, DISTRICTS } from '../../data/districts.ts'
import { PRODUCTS } from '../../data/products.ts'
import { TAGS } from '../../data/tags.ts'
import { searchSanction } from '../../engine/interception.ts'
import { bestRemembered, productStatus, saleQuote } from '../../engine/market.ts'
import type { District, DistrictId, ProductId, TagId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Chip from '../shared/Chip.tsx'
import Modal from '../shared/Modal.tsx'
import { FIELD, TIER_STYLES } from '../shared/styles.ts'
import Thumb from '../shared/Thumb.tsx'
import QuoteChart from './QuoteChart.tsx'

type ProductSheetProps = {
  productId: ProductId
  open: boolean
  onClose: () => void
}

type SheetBodyProps = {
  productId: ProductId
}

type SectionProps = {
  title: string
  children: ReactNode
}

type LinesProps = {
  lines: readonly string[]
}

/** Fiche produit en fenêtre (chap. 7), ouverte depuis sa ligne du marché */
export default function ProductSheet({ productId, open, onClose }: ProductSheetProps) {
  const { t } = useI18n()
  const product = PRODUCTS[productId]
  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={
          <div className="flex items-center gap-3">
            <Thumb id={productId} tier={product.tier} size="lg" />
            <div className="min-w-0">
              <p className={`text-xs font-bold ${TIER_STYLES[product.tier].text}`}>T{product.tier}</p>
              <h2 className="font-bold">{t.product[productId].name}</h2>
              <p className="text-xs text-ink-muted italic">{t.product[productId].lore}</p>
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

/** Contenu de la fiche : ici aujourd'hui, tendance, effets des tags, actions, saisie et où vendre (chap. 7) */
function SheetBody({ productId }: SheetBodyProps) {
  // Profil public (vices de la Loterie compris) et mémoire de marché se lisent sur la partie entière
  const game = useGameStore((s) => s.game)
  const here = game.districtId
  const { t, percent, signedPercent, credits, change } = useI18n()
  const product = PRODUCTS[productId]

  const where = (test: (district: District) => boolean) => DISTRICT_IDS.filter((id) => test(DISTRICTS[id]))
  const names = (ids: readonly DistrictId[]) => ids.map((id) => t.district[id].name).join(', ')
  const offGrid = names(where((district) => district.offGrid))

  // Effets de chaque tag, tels que les applique le moteur (chap. 2)
  const tagLines = (tag: TagId): string[] => {
    const { cover, tripRisk, detectedRisk, bluffMalus, smell, perishable, breakage, nightSale, bribeGift } = TAGS[tag]
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
      ...(bribeGift ? [t.sheet.bribeGift] : []),
      ...(nightSale ? [t.sheet.nightSale(change(nightSale), tag === AFTER.tag ? change(AFTER.festiveFactor) : null)] : []),
    ]
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

  // Qui le prend en premier : les milices (chap. 3)
  const tolls = where((district) => district.tollFavorites.includes(productId))

  // Où le vendre : profil public, puis meilleur cours mémorisé ailleurs (chap. 2)
  const strong = DISTRICT_IDS.filter((id) => productStatus(game, id, productId) === 'strong')
  const produced = DISTRICT_IDS.filter((id) => productStatus(game, id, productId) === 'production')
  const best = bestRemembered(game, productId)

  // Districts de la courbe : tous (le Fil publie la tendance partout), le district actuel d'abord
  const observed = [here, ...DISTRICT_IDS.filter((id) => id !== here)]
  const [picked, setPicked] = useState<DistrictId>(here)
  const chartDistrict = observed.includes(picked) ? picked : (observed[0] ?? here)

  const sale = [
    t.sheet.strong(strong.length > 0 ? names(strong) : t.sheet.nowhere),
    ...(produced.length > 0 ? [t.sheet.produced(names(produced))] : []),
    best ? t.sheet.best(credits(best.quote), t.district[best.districtId].name, best.age) : t.sheet.noMemory,
  ]
  const seizureLines = [seizure, ...(tolls.length > 0 ? [t.sheet.tollFavorite(names(tolls))] : [])]

  return (
    <div className="flex flex-col gap-4">
      <HereToday productId={productId} />
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
        <p className="mt-2 text-xs text-ink-muted">{t.sheet.trendRule}</p>
      </Section>
      {product.tags.length > 0 && (
        <Section title={t.sheet.tagsTitle}>
          <ul className="list-disc space-y-0.5 pl-4 text-xs text-ink-soft">
            {/* Un tag par puce ; plusieurs effets d'un même tag en sous-liste */}
            {product.tags.map((tag) => {
              const effects = tagLines(tag)
              if (effects.length === 0) return null
              return (
                <li key={tag}>
                  <span className="font-bold text-ink">{t.tag[tag].name}</span>
                  {effects.length === 1 ? (
                    <> : {effects[0]}</>
                  ) : (
                    <ul className="mt-0.5 list-disc space-y-0.5 pl-4">
                      {effects.map((effect) => (
                        <li key={effect}>{effect}</li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
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

/** Ici aujourd'hui : ce qui ne tient pas sur la ligne du marché (origine, rachat, prix d'achat, état, vente de tout) */
function HereToday({ productId }: SheetBodyProps) {
  // Boutique, demande, soute et ventes se lisent sur l'état entier
  const game = useGameStore((s) => s.game)
  const { t, credits } = useI18n()
  const conditions = useConditions(productId)
  const district = game.districtId
  const stock = game.markets[district].stock[productId]
  const status = productStatus(game, district, productId)
  const origin =
    stock === undefined
      ? null
      : status === 'production'
        ? 'production'
        : PRODUCTS[productId].tier === 0
          ? 'official'
          : status === 'strong'
            ? 'exceptional'
            : 'arrival'
  const owned = ownedQty(game.cargo, productId)
  const cost = averageCost(game.cargo, productId)
  const saleAll = owned > 0 ? saleQuote(game, productId, owned) : null
  const lines = [
    ...(origin ? [t.market.origin[origin]] : []),
    t.market.demandHint,
    ...(cost !== null ? [t.sheet.boughtAt(owned, credits(cost))] : []),
    ...conditions.map((condition) => t.sheet.condition(condition)),
  ]
  return (
    <Section title={t.sheet.hereTitle(t.district[district].name)}>
      <Lines lines={lines} />
      {saleAll && owned > 1 && (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-soft">
          {t.market.marginAll(owned)}
          <Margin revenue={saleAll.total} cost={saleAll.cost} />
        </p>
      )}
    </Section>
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
