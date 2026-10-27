import { MapPin } from 'lucide-react'
import { DISTRICTS } from '../../data/districts.ts'
import { planTravel } from '../../engine/actions.ts'
import { averageCost } from '../../engine/cargo.ts'
import { estimatedUnitSale } from '../../engine/market.ts'
import type { DistrictId, ProductId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Margin from '../shared/Margin.tsx'

/** Ordre d'affichage : de la périphérie au sommet de la pyramide (carte du chap. 4) */
const order = (Object.keys(DISTRICTS) as DistrictId[]).sort((a, b) => DISTRICTS[a].echelon - DISTRICTS[b].echelon)

/** Carte tactique : destinations, coût du trajet et mémoire de marché (chap. 9) */
export default function TravelPanel() {
  const { t } = useI18n()
  return (
    <section className="rounded border border-zinc-800 bg-zinc-900/40">
      <h2 className="border-b border-zinc-800 px-3 py-2 font-bold tracking-wide text-amber-300 uppercase">{t.travel.title}</h2>
      <ul className="divide-y divide-zinc-800">
        {order.map((id) => (
          <DistrictRow key={id} districtId={id} />
        ))}
      </ul>
    </section>
  )
}

function DistrictRow({ districtId }: { districtId: DistrictId }) {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits } = useI18n()
  const here = districtId === game.districtId
  const memory = game.memory[districtId]

  const memoryLabel = !memory ? t.travel.memoryNever : memory.day === game.day ? t.travel.memoryToday : t.travel.memoryDaysAgo(game.day - memory.day)

  // Cours mémorisés des produits en soute : ce qui compte pour décider où vendre
  const owned = [...new Set(game.cargo.map((lot) => lot.productId))] as ProductId[]

  return (
    <li className={`px-3 py-2 text-sm ${here ? 'bg-amber-500/5' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-bold">
            {t.district[districtId].name}
            <span className="ml-2 font-normal text-amber-400">{'★'.repeat(DISTRICTS[districtId].security)}</span>
          </div>
          <div className="text-xs text-zinc-400">{t.district[districtId].subtitle}</div>
        </div>
        {here ? (
          <span className="flex items-center gap-1 text-xs text-amber-300">
            <MapPin size={12} />
            {t.travel.here}
          </span>
        ) : (
          <TravelButton to={districtId} onGo={() => dispatch({ type: 'travel', to: districtId })} />
        )}
      </div>

      {!here && (
        <div className="mt-1 text-xs text-zinc-400">
          {memoryLabel}
          {memory && owned.length > 0 && (
            <ul className="mt-0.5 text-zinc-300" title={t.travel.estimateHint}>
              {owned.map((id) => (
                <li key={id} className="flex justify-between gap-2">
                  <span className="truncate">{t.product[id].name}</span>
                  <span className="flex items-center gap-1.5">
                    <Margin revenue={estimatedUnitSale(memory.quotes[id])} cost={averageCost(game.cargo, id) ?? 0} showAmount={false} />
                    {credits(memory.quotes[id])}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  )
}

function TravelButton({ to, onGo }: { to: DistrictId; onGo: () => void }) {
  const game = useGameStore((s) => s.game)
  const { t } = useI18n()
  const plan = planTravel(game, to)
  const route = plan.crossed.length === 0 ? t.travel.direct : t.travel.via(plan.crossed.map((id) => t.district[id].name).join(', '))

  return (
    <div className="text-right">
      <Button variant="primary" disabled={plan.error !== null} title={plan.error ? t.error[plan.error] : undefined} onClick={onGo}>
        {t.travel.go[game.phase]}
      </Button>
      <div className="mt-0.5 text-xs text-zinc-400">
        {route} · {t.travel.fuel(plan.fuelCost)}
      </div>
    </div>
  )
}
