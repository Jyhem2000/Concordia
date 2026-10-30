import { EyeOff, Fuel, Package, Tag, UserRound, Wrench } from 'lucide-react'
import { PRODUCTS } from '../../data/products.ts'
import { TAGS } from '../../data/tags.ts'
import { VEHICLES } from '../../data/vehicles.ts'
import { cargoUsed, maskedQty, ownedQty, tagShare } from '../../engine/cargo.ts'
import { checkCompartment, displacedBy } from '../../engine/compartment.ts'
import { hiddenCargo } from '../../engine/interception.ts'
import { keysOf } from '../../engine/records.ts'
import type { ProductId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Chip from '../shared/Chip.tsx'
import { FOCUS_RING } from '../shared/focus.ts'
import Gauge from '../shared/Gauge.tsx'
import Hint from '../shared/Hint.tsx'
import Panel from '../shared/Panel.tsx'
import { POPOVER, TIER_STYLES } from '../shared/styles.ts'
import Thumb from '../shared/Thumb.tsx'
import { useConditions } from '../shared/useConditions.ts'

type HoldRowProps = {
  productId: ProductId
}

/** Tags qui pèsent sur le risque de contrôle : ceux du profil de la cargaison (chap. 5) */
const RISK_TAGS = keysOf(TAGS).filter(
  (tag) => TAGS[tag].tripRisk !== undefined || TAGS[tag].detectedRisk !== undefined || TAGS[tag].cover !== undefined,
)

/** Vue « Véhicule, soute & équipage » (chap. 7) */
export default function CargoView() {
  return (
    <>
      <VehiclePanel />
      <HoldPanel />
      <ProfilePanel />
    </>
  )
}

/** Châssis, jauges, modules montés et équipier actif */
function VehiclePanel() {
  const vehicleId = useGameStore((s) => s.game.vehicleId)
  const chassis = useGameStore((s) => s.game.chassis)
  const fuel = useGameStore((s) => s.game.fuel)
  const mounted = useGameStore((s) => s.game.modules.mounted)
  const crew = useGameStore((s) => s.game.crew.active)
  const { t } = useI18n()
  const vehicle = VEHICLES[vehicleId]

  return (
    <Panel title={t.hold.vehicleTitle} collapseId="vehicle">
      <div className="flex items-center gap-3">
        <Thumb id={vehicleId} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="font-bold">{t.vehicle[vehicleId].name}</p>
          <div className="mt-2 flex gap-4">
            <Gauge icon={Wrench} label={t.gauge.chassis} value={chassis} max={vehicle.maxChassis} />
            <Gauge icon={Fuel} label={t.gauge.fuel} value={fuel} max={vehicle.tank} />
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-muted uppercase">{t.hold.modules(mounted.length, vehicle.moduleSlots)}</p>
      {mounted.length === 0 ? (
        <Hint>{t.hold.noModule}</Hint>
      ) : (
        <ul className="mt-1 flex flex-col gap-1.5">
          {mounted.map((moduleId) => (
            <li key={moduleId} className="flex items-center gap-2">
              <Thumb id={moduleId} />
              {t.module[moduleId].name}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 flex items-center gap-1.5">
        <UserRound size={14} aria-hidden="true" className="text-ink-muted" />
        {crew ? t.crew[crew].name : <span className="text-xs text-ink-muted">{t.hold.noCrew}</span>}
      </p>
    </Panel>
  )
}

/** Emplacements de la soute, produits en soute et double fond */
function HoldPanel() {
  // Le double fond dépend du véhicule, de la soute et du choix du joueur : état entier
  const game = useGameStore((s) => s.game)
  const { t } = useI18n()
  const vehicle = VEHICLES[game.vehicleId]
  const used = cargoUsed(game.cargo)
  const { hidden, visible } = hiddenCargo(game)
  const products = [...new Set(game.cargo.map((lot) => lot.productId))].sort((a, b) => PRODUCTS[b].tier - PRODUCTS[a].tier || a.localeCompare(b))
  // Une case par emplacement : les caisses cachées d'abord, puis les visibles
  const slots = [...hidden.map((lot) => ({ lot, hidden: true })), ...visible.map((lot) => ({ lot, hidden: false }))].flatMap(({ lot, hidden }) =>
    Array.from({ length: lot.qty }, () => ({ tier: PRODUCTS[lot.productId].tier, hidden })),
  )
  const free = Math.max(0, vehicle.cargo - used)

  return (
    <Panel icon={Package} title={t.hold.title(used, vehicle.cargo)} collapseId="hold">
      <ul aria-hidden="true" className="flex flex-wrap gap-1">
        {/* Cases figées, recalculées à chaque rendu et sans identité propre : la position sert de clé */}
        {slots.map(({ tier, hidden }, position) => (
          <li
            key={position}
            className={`h-4 w-4 rounded-sm ${hidden ? `border border-dashed ${TIER_STYLES[tier].hiddenSlot}` : TIER_STYLES[tier].slot}`}
          />
        ))}
        {Array.from({ length: free }, (_, slot) => (
          <li key={`free-${slot}`} className="h-4 w-4 rounded-sm border border-line-strong" />
        ))}
      </ul>
      <p className="mt-2 flex flex-wrap gap-x-3 text-xs text-ink-muted">
        <span className="flex items-center gap-1 text-night">
          <EyeOff size={12} aria-hidden="true" />
          {t.hold.compartment(cargoUsed(hidden), vehicle.hiddenCompartment)}
        </span>
        <span>{t.hold.free(free)}</span>
      </p>
      <Hint className="mt-1">{t.hold.compartmentRule}</Hint>
      {products.length === 0 ? (
        <Hint className="mt-3">{t.hold.empty}</Hint>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {products.map((id) => (
            <HoldRow key={id} productId={id} />
          ))}
        </ul>
      )}
    </Panel>
  )
}

/** Un produit en soute ; le toucher ouvre le menu du double fond (chap. 4) */
function HoldRow({ productId }: HoldRowProps) {
  // Le double fond et les caisses délogées se calculent sur l'état entier
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t } = useI18n()
  const conditions = useConditions(productId)
  const product = PRODUCTS[productId]
  const qty = ownedQty(game.cargo, productId)
  const hiddenQty = ownedQty(hiddenCargo(game).hidden, productId)
  const pinned = game.compartment.pinned.includes(productId)
  const excluded = game.compartment.excluded.includes(productId)
  const displaced = displacedBy(game, productId)
  const error = checkCompartment(game, productId)

  return (
    <li className={`rounded-md border border-l-4 border-line bg-raised/60 ${TIER_STYLES[product.tier].stripe}`}>
      <details className="group relative">
        <summary className={`flex cursor-pointer list-none items-start gap-2 rounded-md px-3 py-2 ${FOCUS_RING}`}>
          <Thumb id={productId} tier={product.tier} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`text-xs font-bold ${TIER_STYLES[product.tier].text}`}>T{product.tier}</span>
              <span className="font-bold">{t.product[productId].name}</span>
              <span className="ml-auto font-bold">×{qty}</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {hiddenQty > 0 && (
                <Chip tone="night" icon={EyeOff}>
                  {t.hold.hidden(hiddenQty)}
                </Chip>
              )}
              {pinned && <Chip tone="night">{t.hold.pinned}</Chip>}
              {excluded && <Chip tone="muted">{t.hold.excluded}</Chip>}
              {product.tags.map((tag) => (
                <Chip key={tag}>{t.tag[tag].name}</Chip>
              ))}
            </div>
            {conditions.length > 0 && <Hint className="mt-1">{conditions.join(' · ')}</Hint>}
          </div>
        </summary>
        <div className={`right-2 left-2 flex flex-col items-start gap-1.5 ${POPOVER}`}>
          {error ? (
            <Hint>{t.error[error]}</Hint>
          ) : (
            <>
              {game.compartment.pinned[0] !== productId && hiddenQty < qty && (
                <Button size="sm" variant="primary" onClick={() => dispatch({ type: 'compartment', productId, hide: true })}>
                  <EyeOff size={12} aria-hidden="true" />
                  {t.hold.hide}
                </Button>
              )}
              {hiddenQty < qty && displaced.length > 0 && (
                <Hint tone="warning">{t.hold.displaces(displaced.map((crate) => `${crate.qty} ${t.product[crate.productId].name}`).join(', '))}</Hint>
              )}
              {hiddenQty > 0 && (
                <Button size="sm" onClick={() => dispatch({ type: 'compartment', productId, hide: false })}>
                  {t.hold.unhide}
                </Button>
              )}
            </>
          )}
        </div>
      </details>
    </li>
  )
}

/** Parts de la cargaison qui pilotent le risque, avec les masquages actifs (chap. 2 et 5) */
function ProfilePanel() {
  const cargo = useGameStore((s) => s.game.cargo)
  const { t, percent } = useI18n()
  if (cargoUsed(cargo) === 0) return null

  return (
    <Panel icon={Tag} title={t.hold.profile} collapseId="profile">
      <ul className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
        {RISK_TAGS.map((tag) => {
          const share = tagShare(cargo, tag)
          const masked = maskedQty(cargo, tag)
          return (
            <li key={tag}>
              <Gauge
                icon={Tag}
                label={t.tag[tag].name}
                value={share}
                max={1}
                display={masked > 0 ? `${percent(share, 0)} (${t.hold.masked(masked)})` : percent(share, 0)}
                tone={TAGS[tag].cover !== undefined ? 'success' : 'warning'}
              />
            </li>
          )
        })}
      </ul>
      <Hint className="mt-2">{t.hold.profileRule}</Hint>
    </Panel>
  )
}
