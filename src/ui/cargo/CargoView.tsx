import { EyeOff, Fuel, Package, RadioTower, Tag, UserRound, Wrench } from 'lucide-react'
import { motion } from 'motion/react'
import { PRODUCTS } from '../../data/products.ts'
import { TAGS } from '../../data/tags.ts'
import { VEHICLES } from '../../data/vehicles.ts'
import { cargoUsed, maskedQty, ownedQty, tagShare } from '../../engine/cargo.ts'
import { checkCompartment } from '../../engine/compartment.ts'
import { hiddenCargo } from '../../engine/interception.ts'
import { keysOf } from '../../engine/records.ts'
import type { ProductId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Chip from '../shared/Chip.tsx'
import Gauge from '../shared/Gauge.tsx'
import Hint from '../shared/Hint.tsx'
import Panel from '../shared/Panel.tsx'
import { SEALED_STYLE, TIER_STYLES } from '../shared/styles.ts'
import { garageDistrict } from '../places/placesHere.ts'
import CompartmentNotice from './CompartmentNotice.tsx'
import Thumb from '../shared/Thumb.tsx'
import Tip from '../shared/Tip.tsx'
import { useConditions } from '../shared/useConditions.ts'

type HoldRowProps = {
  productId: ProductId
}

/** Emplacement de soute : caisse d'un produit, cachée ou non ; `null` pour une place libre */
type Slot = { productId: ProductId; hidden: boolean } | null

type SlotRowProps = {
  label: string
  slots: readonly Slot[]
  /** Rangée du double fond : encadrée en pointillés */
  compartment?: boolean
}

/** Taille d'un emplacement : assez gros pour le pouce sur téléphone, discret sur grand écran */
const SLOT_SIZE = 'h-7 w-7 md:h-4 md:w-4'

/** Couleurs d'une caisse : celles de son tier, ou le gris des caisses scellées du DSC */
const crateStyle = (productId: ProductId) => (PRODUCTS[productId].sealed ? SEALED_STYLE : TIER_STYLES[PRODUCTS[productId].tier])

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
  const districtId = useGameStore((s) => s.game.districtId)
  const { t } = useI18n()
  const vehicle = VEHICLES[vehicleId]
  const garage = garageDistrict()

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
      {garage !== null && garage !== districtId && <Hint className="mt-2">{t.hold.garageAt(t.district[garage].name)}</Hint>}
      <p className="mt-3 flex items-center gap-1.5">
        <UserRound size={14} aria-hidden="true" className="text-ink-muted" />
        {crew ? t.crew[crew].name : <span className="text-xs text-ink-muted">{t.hold.noCrew}</span>}
      </p>
    </Panel>
  )
}

/** Emplacements de la soute, double fond et produits en soute */
function HoldPanel() {
  // Le double fond dépend du véhicule et de la soute : état entier
  const game = useGameStore((s) => s.game)
  const { t } = useI18n()
  const vehicle = VEHICLES[game.vehicleId]
  const used = cargoUsed(game.cargo)
  const { hidden, visible } = hiddenCargo(game)
  const products = [...new Set(game.cargo.map((lot) => lot.productId))].sort((a, b) => PRODUCTS[b].tier - PRODUCTS[a].tier || a.localeCompare(b))
  // Places hors double fond, remplies par les caisses visibles ; le surplus visible occupe les places du double fond
  const open = vehicle.cargo - vehicle.hiddenCompartment
  const visibleCrates = visible.flatMap((lot) => Array.from({ length: lot.qty }, () => lot.productId))
  const hiddenCrates = hidden.flatMap((lot) => Array.from({ length: lot.qty }, () => lot.productId))
  const cargoSlots = Array.from({ length: open }, (_, i): Slot => (i < visibleCrates.length ? { productId: visibleCrates[i], hidden: false } : null))
  const compartmentSlots: Slot[] = [
    ...hiddenCrates.map((productId): Slot => ({ productId, hidden: true })),
    ...visibleCrates.slice(open).map((productId): Slot => ({ productId, hidden: false })),
  ]
  const compartmentFree = Math.max(0, vehicle.hiddenCompartment - compartmentSlots.length)

  return (
    <Panel icon={Package} title={t.hold.title(used, vehicle.cargo)} collapseId="hold">
      <SlotRow label={t.hold.cargoSlots(Math.min(visibleCrates.length, open), open)} slots={cargoSlots} />
      <SlotRow
        label={t.hold.compartment(hiddenCrates.length, vehicle.hiddenCompartment)}
        slots={[...compartmentSlots, ...Array.from({ length: compartmentFree }, (): Slot => null)]}
        compartment
      />
      <Hint className="mt-2">{t.hold.compartmentRule}</Hint>
      <CompartmentNotice />
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

/**
 * Une rangée d'emplacements : caisse visible (pleine), cachée (pointillés) ou place libre. Chaque caisse dit son produit
 * en infobulle ; un clic sur une caisse cachée la sort du double fond, une à la fois (chap. 4).
 */
function SlotRow({ label, slots, compartment = false }: SlotRowProps) {
  const dispatch = useGameStore((s) => s.dispatch)
  const { t } = useI18n()
  return (
    <div className="mt-2 first:mt-0">
      <p className={`flex items-center gap-1 text-xs ${compartment ? 'text-night' : 'text-ink-muted'}`}>
        {compartment && <EyeOff size={12} aria-hidden="true" />}
        {label}
      </p>
      <ul className={`mt-1 flex w-fit flex-wrap gap-1 ${compartment ? 'rounded-md border border-dashed border-night/40 p-1' : ''}`}>
        {/* Cases sans identité propre : la position et le contenu font la clé, une case qui change de contenu rejoue son apparition */}
        {slots.map((slot, position) => (
          <motion.li
            key={`${position}-${slot === null ? 'free' : `${slot.productId}-${slot.hidden}`}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex"
          >
            {slot === null ? (
              <span className={`${SLOT_SIZE} rounded-sm border border-line-strong`} />
            ) : (
              <Tip
                content={slot.hidden ? t.hold.hiddenSlot(t.product[slot.productId].name) : t.product[slot.productId].name}
                label={slot.hidden ? t.hold.hiddenSlot(t.product[slot.productId].name) : t.product[slot.productId].name}
                onClick={slot.hidden ? () => dispatch({ type: 'compartment', productId: slot.productId, hide: false }) : undefined}
                className={`${SLOT_SIZE} rounded-sm ${
                  slot.hidden ? `cursor-pointer border border-dashed ${crateStyle(slot.productId).hiddenSlot}` : crateStyle(slot.productId).slot
                }`}
              >
                {/* Le déclencheur est la case elle-même : pas d'icône « i » */}
                <span aria-hidden="true" />
              </Tip>
            )}
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

/** Un produit en soute : quantité, état, et sa place au double fond avec le bouton qui la change (chap. 4) */
function HoldRow({ productId }: HoldRowProps) {
  // Le double fond se calcule sur l'état entier
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t } = useI18n()
  const conditions = useConditions(productId)
  const product = PRODUCTS[productId]
  const qty = ownedQty(game.cargo, productId)
  const hiddenQty = game.compartment[productId] ?? 0
  const hideError = checkCompartment(game, productId, true)

  return (
    <li className={`flex items-start gap-2 rounded-md border border-l-4 border-line bg-raised/60 px-3 py-2 ${crateStyle(productId).stripe}`}>
      <Thumb id={productId} tier={product.sealed ? undefined : product.tier} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`text-xs font-bold ${crateStyle(productId).text}`}>T{product.tier}</span>
          <span className="font-bold">{t.product[productId].name}</span>
          <span className="ml-auto font-bold">×{qty}</span>
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {product.beaconRisk !== undefined && (
            <Chip tone="danger" icon={RadioTower}>
              {t.hold.beacon}
            </Chip>
          )}
          {product.tags.map((tag) => (
            <Chip key={tag}>{t.tag[tag].name}</Chip>
          ))}
        </div>
        {conditions.length > 0 && <Hint className="mt-1">{conditions.join(' · ')}</Hint>}
        {/* Double fond : ce qui y est caché, et « Cacher » seulement quand une place libre peut recevoir une caisse visible */}
        {(hiddenQty > 0 || hideError === null) && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {hiddenQty > 0 && (
              <Chip tone="night" icon={EyeOff}>
                {t.hold.hidden(hiddenQty)}
              </Chip>
            )}
            {hideError === null && (
              <Button size="sm" onClick={() => dispatch({ type: 'compartment', productId, hide: true })}>
                <EyeOff size={12} aria-hidden="true" />
                {t.hold.hide}
              </Button>
            )}
          </div>
        )}
      </div>
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
