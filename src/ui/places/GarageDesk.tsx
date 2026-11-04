import { DISTRICT_IDS, DISTRICTS } from '../../data/districts.ts'
import { MODULES, VEHICLES } from '../../data/vehicles.ts'
import {
  checkBuyModule,
  checkBuyVehicle,
  checkMount,
  MODULE_IDS,
  missingChassis,
  refitPrice,
  repairPrice,
  VEHICLE_IDS,
  vehicleSwap,
  vehicleTotal,
} from '../../engine/equipment.ts'
import type { ModuleId, VehicleId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import AmountForm from '../shared/AmountForm.tsx'
import Button from '../shared/Button.tsx'
import CollapseToggle from '../shared/CollapseToggle.tsx'
import Detailed from '../shared/Detailed.tsx'
import Locked from '../shared/Locked.tsx'
import { useCollapsed } from '../shared/useCollapsed.ts'
import Hint from '../shared/Hint.tsx'
import Thumb from '../shared/Thumb.tsx'
import Tip from '../shared/Tip.tsx'

type VehicleOfferProps = {
  vehicleId: VehicleId
}

type ModuleRowProps = {
  moduleId: ModuleId
}

/** Garage de Mécano-Mitch : réparations, châssis et modules (chap. 3 et 4) */
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
      <div className="border-t border-line pt-2">
        <p className="font-bold">{t.garage.repairTitle}</p>
        <p className="flex flex-wrap gap-1.5 text-xs text-ink-muted">
          {t.garage.repairRule(missing)}
          <Detailed breakdown={price} format={credits} />
        </p>
        {missing > 0 && <AmountForm label={t.garage.repair} max={affordable} onSubmit={(pv) => dispatch({ type: 'repair', pv })} />}
      </div>

      <div className="border-t border-line pt-2">
        <CollapseToggle id="garage:modules">{t.garage.modulesTitle(game.modules.mounted.length, vehicle.moduleSlots)}</CollapseToggle>
        {!modulesCollapsed && (
          <ul className="mt-1.5 flex flex-col gap-2">
            {MODULE_IDS.map((id) => (
              <ModuleRow key={id} moduleId={id} />
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-line pt-2">
        <CollapseToggle id="garage:vehicles">{t.garage.vehiclesTitle}</CollapseToggle>
        {!vehiclesCollapsed && (
          <>
            <Hint>{t.garage.vehicleRule}</Hint>
            <ul className="mt-1.5 flex flex-col gap-2">
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
  // Modules repris, adaptés ou perdus : selon ceux que possède le joueur
  const game = useGameStore((s) => s.game)
  const error = checkBuyVehicle(game, vehicleId)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits } = useI18n()
  const vehicle = VEHICLES[vehicleId]
  const describe = useEquipmentTexts()
  const { lost, refit } = vehicleSwap(game)

  return (
    <li className="flex items-start gap-2 rounded-md border border-line bg-raised/60 p-2 text-xs">
      <Thumb id={vehicleId} />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-ink">
          {t.vehicle[vehicleId].name} — {credits(vehicleTotal(game, vehicleId))}
          {refit > 0 && <span className="ml-1 font-normal text-ink-muted">{t.garage.withRefit(credits(refit))}</span>}
        </p>
        <p className="text-ink-muted">
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
        <p className="text-ink-soft">{describe.vehicle(vehicleId)}</p>
        {lost.length > 0 && <p className="text-warning">{t.garage.weldedLost(lost.map((id) => t.module[id].name).join(', '))}</p>}
        <Locked requires={vehicle.requires} />
        <div className="mt-1">
          <Button
            variant="primary"
            size="sm"
            disabled={error !== null}
            reason={error && error !== 'locked' ? t.error[error] : null}
            onClick={() => dispatch({ type: 'buyVehicle', vehicleId })}
          >
            {t.garage.buy}
          </Button>
        </div>
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

  const fitting = MODULES[moduleId].fitting

  return (
    <li className={`flex items-start gap-2 rounded-md border p-2 text-xs ${mounted ? 'border-accent/40 bg-accent/5' : 'border-line bg-raised/60'}`}>
      <Thumb id={moduleId} />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-1.5 font-bold text-ink">
          {t.module[moduleId].name}
          <span className="font-normal text-ink-muted">
            {owned ? (mounted ? t.garage.mounted : t.garage.stored) : credits(MODULES[moduleId].price)}
          </span>
          <Tip
            content={t.garage.fittingInfo[fitting](credits(refitPrice(moduleId)))}
            className="font-normal text-ink-muted underline decoration-ink-faint decoration-dotted underline-offset-4"
          >
            {t.garage.fitting[fitting]}
          </Tip>
        </p>
        <p className="text-ink-soft">{describe.module(moduleId)}</p>
        {!owned && <Locked requires={MODULES[moduleId].requires} />}
        <div className="mt-1">
          {owned ? (
            <Button
              size="sm"
              disabled={mountError !== null}
              reason={mountError && !mounted ? t.error[mountError] : null}
              onClick={() => dispatch({ type: 'mountModule', moduleId, mount: !mounted })}
            >
              {mounted ? t.garage.unmount : t.garage.mount}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              disabled={buyError !== null}
              reason={buyError && buyError !== 'locked' ? t.error[buyError] : null}
              onClick={() => dispatch({ type: 'buyModule', moduleId })}
            >
              {t.garage.buy}
            </Button>
          )}
        </div>
      </div>
    </li>
  )
}

/** Passifs des véhicules et effets des modules, chiffres lus dans les données (chap. 4) */
function useEquipmentTexts() {
  const { t, change, signedPercent, percent } = useI18n()
  const g = t.garage

  const vehicle = (id: VehicleId): string => {
    const { riskFactor, legalCamouflage, coldChain, heatProof, transponder, heavy, fuelPerTrip } = VEHICLES[id]
    return [
      ...(riskFactor !== undefined ? [g.lowProfile(change(riskFactor))] : []),
      ...(fuelPerTrip.day === fuelPerTrip.night ? [g.ecoEngine] : []),
      ...(legalCamouflage ? [g.camouflage(change(legalCamouflage.factor), percent(legalCamouflage.minShare, 0))] : []),
      ...(coldChain ? [g.coldChain] : []),
      ...(heatProof ? [g.heatProof] : []),
      ...(transponder
        ? [
            g.transponder(
              transponder.districts.map((d) => t.district[d].name).join(', '),
              signedPercent(transponder.fleeBonus, 0),
              change(transponder.iccLossFactor),
            ),
          ]
        : []),
      ...(heavy ? [g.heavy(change(heavy.tollFactor), percent(heavy.crusherChance, 0), signedPercent(heavy.riskAdd, 0))] : []),
    ].join(' ')
  }

  const module = (id: ModuleId): string => {
    const {
      drivingAssist,
      tagFactor,
      smoothRide,
      nightRiskFactor,
      flyingCheckFactor,
      rotatingPlate,
      ram,
      trapdoor,
      fakeTerminal,
      compartmentFactor,
    } = MODULES[id]
    return [
      ...(drivingAssist ? [g.drivingAssist(signedPercent(drivingAssist.fleeBonus, 0))] : []),
      ...(tagFactor
        ? [tagFactor.factor === 0 ? g.tagOff(t.tag[tagFactor.tag].name) : g.tagFactor(t.tag[tagFactor.tag].name, change(tagFactor.factor))]
        : []),
      ...(flyingCheckFactor !== undefined ? [flyingCheckFactor === 0 ? g.noFlyingChecks : g.flyingChecks(change(flyingCheckFactor))] : []),
      ...(smoothRide ? [g.smoothRide] : []),
      ...(nightRiskFactor !== undefined ? [g.nightRisk(change(nightRiskFactor))] : []),
      ...(rotatingPlate ? [g.rotatingPlate] : []),
      ...(ram ? [g.ram(signedPercent(ram.fleeBonus, 0), change(ram.damageFactor))] : []),
      ...(trapdoor
        ? [
            g.trapdoor(
              percent(trapdoor.chance, 0),
              percent(trapdoor.minRecovery, 0),
              percent(trapdoor.maxRecovery, 0),
              DISTRICT_IDS.filter((id) => !DISTRICTS[id].ejection.trapdoor)
                .map((id) => t.district[id].name)
                .join(', '),
            ),
          ]
        : []),
      ...(fakeTerminal ? [g.fakeTerminal(signedPercent(fakeTerminal.bluffBonus, 0), change(fakeTerminal.bribeRateFactor))] : []),
      ...(compartmentFactor !== undefined ? [g.ghostWall(change(compartmentFactor))] : []),
    ].join(' ')
  }

  return { vehicle, module }
}
