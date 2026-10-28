import { DISTRICT_IDS, DISTRICTS } from '../../data/districts.ts'
import { MODULES, VEHICLES } from '../../data/vehicles.ts'
import { checkBuyModule, checkBuyVehicle, checkMount, MODULE_IDS, missingChassis, repairPrice, VEHICLE_IDS } from '../../engine/equipment.ts'
import type { ModuleId, VehicleId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import AmountForm from '../shared/AmountForm.tsx'
import Button from '../shared/Button.tsx'
import CollapseToggle from '../shared/CollapseToggle.tsx'
import Detailed from '../shared/Detailed.tsx'
import { useCollapsed } from '../shared/useCollapsed.ts'

type VehicleOfferProps = {
  vehicleId: VehicleId
}

type ModuleRowProps = {
  moduleId: ModuleId
}

/** Garage de Mécano-Mitch : réparations, châssis et modules (chap. 4 et 5) */
export default function GarageDesk() {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits } = useI18n()
  const price = repairPrice(game)
  const missing = missingChassis(game)
  const affordable = Math.min(missing, Math.floor(game.cash / price.total))
  const vehicle = VEHICLES[game.vehicleId]
  const modulesCollapsed = useCollapsed('garage:modules')
  const vehiclesCollapsed = useCollapsed('garage:vehicles')

  return (
    <>
      <div className="border-t border-zinc-800 pt-2">
        <p className="font-bold">{t.garage.repairTitle}</p>
        <p className="flex flex-wrap gap-1.5 text-xs text-zinc-400">
          {t.garage.repairRule(missing)}
          <Detailed breakdown={price} format={credits} />
        </p>
        {missing > 0 && <AmountForm label={t.garage.repair} max={affordable} onSubmit={(pv) => dispatch({ type: 'repair', pv })} />}
      </div>

      <div className="border-t border-zinc-800 pt-2">
        <CollapseToggle id="garage:modules">{t.garage.modulesTitle(game.modules.mounted.length, vehicle.moduleSlots)}</CollapseToggle>
        {!modulesCollapsed && (
          <ul className="mt-1 space-y-2">
            {MODULE_IDS.map((id) => (
              <ModuleRow key={id} moduleId={id} />
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-zinc-800 pt-2">
        <CollapseToggle id="garage:vehicles">{t.garage.vehiclesTitle}</CollapseToggle>
        {!vehiclesCollapsed && (
          <>
            <p className="text-xs text-zinc-400">{t.garage.vehicleRule}</p>
            <ul className="mt-1 space-y-2">
              {VEHICLE_IDS.filter((id) => id !== game.vehicleId).map((id) => (
                <VehicleOffer key={id} vehicleId={id} />
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  )
}

function VehicleOffer({ vehicleId }: VehicleOfferProps) {
  const error = useGameStore((s) => checkBuyVehicle(s.game, vehicleId))
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits } = useI18n()
  const vehicle = VEHICLES[vehicleId]
  const describe = useEquipmentTexts()

  return (
    <li className="text-xs">
      <p className="font-bold text-zinc-200">
        {t.vehicle[vehicleId].name} — {credits(vehicle.price)}
      </p>
      <p className="text-zinc-400">
        {t.garage.vehicleStats(
          vehicle.cargo,
          vehicle.hiddenCompartment,
          vehicle.moduleSlots,
          vehicle.maxChassis,
          vehicle.tank,
          vehicle.fuelPerTrip.day,
          vehicle.fuelPerTrip.night,
        )}
      </p>
      <p className="text-zinc-300">{describe.vehicle(vehicleId)}</p>
      <div className="mt-1 flex items-center gap-2">
        <Button variant="primary" disabled={error !== null} onClick={() => dispatch({ type: 'buyVehicle', vehicleId })}>
          {t.garage.buy}
        </Button>
        {error && <span className="text-red-300">{t.error[error]}</span>}
      </div>
    </li>
  )
}

function ModuleRow({ moduleId }: ModuleRowProps) {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits } = useI18n()
  const describe = useEquipmentTexts()
  const owned = game.modules.owned.includes(moduleId)
  const mounted = game.modules.mounted.includes(moduleId)
  const buyError = checkBuyModule(game, moduleId)
  const mountError = checkMount(game, moduleId, !mounted)

  return (
    <li className="text-xs">
      <p className="font-bold text-zinc-200">
        {t.module[moduleId].name}
        <span className="ml-1.5 font-normal text-zinc-400">
          {owned ? (mounted ? t.garage.mounted : t.garage.stored) : credits(MODULES[moduleId].price)}
        </span>
      </p>
      <p className="text-zinc-300">{describe.module(moduleId)}</p>
      <div className="mt-1 flex items-center gap-2">
        {owned ? (
          <Button disabled={mountError !== null} onClick={() => dispatch({ type: 'mountModule', moduleId, mount: !mounted })}>
            {mounted ? t.garage.unmount : t.garage.mount}
          </Button>
        ) : (
          <Button variant="primary" disabled={buyError !== null} onClick={() => dispatch({ type: 'buyModule', moduleId })}>
            {t.garage.buy}
          </Button>
        )}
        {owned && mountError && !mounted && <span className="text-zinc-400">{t.error[mountError]}</span>}
        {!owned && buyError && <span className="text-red-300">{t.error[buyError]}</span>}
      </div>
    </li>
  )
}

/** Passifs des véhicules et effets des modules, chiffres lus dans les données (chap. 5) */
function useEquipmentTexts() {
  const { t, multiplier, signedPercent, percent } = useI18n()
  const g = t.garage

  const vehicle = (id: VehicleId): string => {
    const { riskFactor, legalCamouflage, coldChain, transponder, heavy, fuelPerTrip } = VEHICLES[id]
    return [
      ...(riskFactor !== undefined ? [g.lowProfile(multiplier(riskFactor))] : []),
      ...(fuelPerTrip.day === fuelPerTrip.night ? [g.ecoEngine] : []),
      ...(legalCamouflage ? [g.camouflage(multiplier(legalCamouflage.factor), percent(legalCamouflage.minShare, 0))] : []),
      ...(coldChain ? [g.coldChain] : []),
      ...(transponder
        ? [
            g.transponder(
              transponder.districts.map((d) => t.district[d].name).join(', '),
              signedPercent(transponder.fleeBonus, 0),
              multiplier(transponder.iccLossFactor),
            ),
          ]
        : []),
      ...(heavy ? [g.heavy(multiplier(heavy.tollFactor), percent(heavy.crusherChance, 0), signedPercent(heavy.riskAdd, 0))] : []),
    ].join(' ')
  }

  const module = (id: ModuleId): string => {
    const { freshnessDelay, heatProof, tagFactor, smoothRide, rotatingPlate, ram, trapdoor, fakeTerminal, droneJammer } = MODULES[id]
    return [
      ...(freshnessDelay ? [g.freshnessDelay(freshnessDelay)] : []),
      ...(heatProof ? [g.heatProof] : []),
      ...(tagFactor
        ? [tagFactor.factor === 0 ? g.tagOff(t.tag[tagFactor.tag].name) : g.tagFactor(t.tag[tagFactor.tag].name, multiplier(tagFactor.factor))]
        : []),
      ...(smoothRide ? [g.smoothRide] : []),
      ...(rotatingPlate ? [g.rotatingPlate] : []),
      ...(ram ? [g.ram(signedPercent(ram.fleeBonus, 0), multiplier(ram.damageFactor))] : []),
      ...(trapdoor
        ? [
            g.trapdoor(
              percent(trapdoor.chance, 0),
              trapdoor.cooldownDays,
              percent(trapdoor.maxRecovery, 0),
              DISTRICT_IDS.filter((id) => !DISTRICTS[id].ejection.trapdoor)
                .map((id) => t.district[id].name)
                .join(', '),
            ),
          ]
        : []),
      ...(fakeTerminal ? [g.fakeTerminal(signedPercent(fakeTerminal.bluffBonus, 0), multiplier(fakeTerminal.bribeRateFactor))] : []),
      ...(droneJammer ? [g.droneJammer] : []),
    ].join(' ')
  }

  return { vehicle, module }
}
