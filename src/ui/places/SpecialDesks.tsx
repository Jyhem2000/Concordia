import { useState } from 'react'
import { WANTED } from '../../data/balance.ts'
import { LOTTERY } from '../../data/events.ts'
import { CASSANDRE, FORGERY, KARMA, MORGUE, SERVICE_REQUIREMENTS, VELVET } from '../../data/locations.ts'
import { PRODUCT_IDS, PRODUCTS } from '../../data/products.ts'
import { ownedQty } from '../../engine/cargo.ts'
import { viceChoices } from '../../engine/events.ts'
import {
  auctionPrice,
  availableFrom,
  blackmailCost,
  blackmailCrates,
  checkAuction,
  checkBlackmail,
  checkForgery,
  checkInfluence,
  checkMorgue,
  checkProphecy,
  checkVipDelivery,
  checkVipRequest,
  forgeryChance,
  forgeryCost,
  karmaCost,
  morgueCost,
  passActive,
  prophecyCost,
  velvetLocked,
  vipValue,
  type MorgueService,
} from '../../engine/services.ts'
import type { ActionError } from '../../engine/actions.ts'
import type { DistrictId, ForgeryCard, ProductId, Requirement } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import { FOCUS_RING } from '../shared/focus.ts'
import Locked from '../shared/Locked.tsx'

type DeskRowProps = {
  label: string
  detail: string
  error: ActionError | null
  onClick: () => void
  /** Conditions du service réservé (chap. 4), affichées tant qu'elles manquent */
  requires?: readonly Requirement[]
}

type CardKind = ForgeryCard['kind']

const MORGUE_SERVICES: readonly MorgueService[] = ['pass', 'surgery', 'certificate']
const CARD_KINDS: readonly CardKind[] = ['captain', 'competitor', 'informant', 'cadre']
const SELECT = `rounded border border-zinc-700 bg-zinc-950 px-1 py-0.5 ${FOCUS_RING}`

/** Une ligne de guichet : bouton, détail du coût et de l'effet, raison d'un refus */
function DeskRow({ label, detail, error, onClick, requires }: DeskRowProps) {
  const { t } = useI18n()
  return (
    <li className="text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" disabled={error !== null} onClick={onClick}>
          {label}
        </Button>
        <span className="text-zinc-300">{detail}</span>
      </div>
      {error && error !== 'locked' && <p className="mt-0.5 text-red-300">{t.error[error]}</p>}
      <Locked requires={requires} />
    </li>
  )
}

/** Karma-Cham : panique algorithmique sur un tag, effet le lendemain (chap. 4) */
export function KarmaDesk() {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits, multiplier } = useI18n()
  const d = t.desks.karma
  const from = availableFrom(game, 'influence', KARMA.cooldownDays)

  return (
    <div className="border-t border-zinc-800 pt-2">
      <p className="font-bold">{d.title}</p>
      <p className="text-xs text-zinc-400">{d.rule(credits(karmaCost(game)), multiplier(KARMA.factor), KARMA.cooldownDays)}</p>
      <Locked requires={SERVICE_REQUIREMENTS.influence} />
      {game.influence && game.influence.day >= game.day && (
        <p className="text-xs text-amber-200">{d.pending(t.tag[game.influence.tag].name, game.influence.day)}</p>
      )}
      {from !== null && <p className="text-xs text-zinc-400">{t.desks.availableFrom(from)}</p>}
      <ul className="mt-1 space-y-1">
        {KARMA.tags.map((tag) => (
          <DeskRow
            key={tag}
            label={d.options[tag] ?? t.tag[tag].name}
            detail={t.tag[tag].name}
            error={checkInfluence(game, tag)}
            onClick={() => dispatch({ type: 'influence', tag })}
          />
        ))}
      </ul>
    </div>
  )
}

/** Morgue du Dr. K. : laissez-passer, chirurgie, certificat (chap. 4) */
export function MorgueDesk() {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits } = useI18n()
  const d = t.desks.morgue
  const effect: Record<MorgueService, string> = {
    pass: d.passEffect(MORGUE.pass.days, t.district[MORGUE.pass.district].name, t.tag[MORGUE.pass.tag].name, t.event[MORGUE.pass.cancels].name),
    surgery: d.surgeryEffect(MORGUE.surgery.health, MORGUE.surgery.healthCap),
    certificate: d.certificateEffect(MORGUE.certificate.icc),
  }

  return (
    <div className="border-t border-zinc-800 pt-2">
      <p className="font-bold">{d.title}</p>
      {passActive(game) && game.morguePass !== null && <p className="text-xs text-green-400">{d.passValid(game.morguePass)}</p>}
      <ul className="mt-1 space-y-1">
        {MORGUE_SERVICES.map((service) => (
          <DeskRow
            key={service}
            label={d.services[service]}
            detail={`${credits(morgueCost(game, service))} · ${effect[service]}`}
            error={checkMorgue(game, service)}
            onClick={() => dispatch({ type: 'morgue', service })}
            requires={SERVICE_REQUIREMENTS[service]}
          />
        ))}
      </ul>
    </div>
  )
}

/** Cassandre-88 : prédiction garantie de l'événement global de J+2 (chap. 4 et 8) */
export function CassandreDesk() {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits } = useI18n()
  const d = t.desks.cassandre
  const prophecy = game.events.prophecy

  return (
    <div className="border-t border-zinc-800 pt-2">
      <p className="font-bold">{d.title}</p>
      {prophecy && prophecy.day >= game.day && <p className="text-xs text-amber-200">{d.foretold(prophecy.day, t.event[prophecy.event].name)}</p>}
      <ul className="mt-1">
        <DeskRow
          label={d.consult}
          detail={d.cost(credits(prophecyCost(game)), t.product[CASSANDRE.crate].name, CASSANDRE.aheadDays)}
          error={checkProphecy(game)}
          onClick={() => dispatch({ type: 'prophecy' })}
          requires={SERVICE_REQUIREMENTS.prophecy}
        />
      </ul>
    </div>
  )
}

/** Laverie : faux dossier pour le tirage de la Loterie du lendemain (chap. 4 et 8) */
export function ForgeryDesk() {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits, percent } = useI18n()
  const d = t.desks.forgery
  // Carte composée par le joueur : état d'interface éphémère
  const [kind, setKind] = useState<CardKind>('captain')
  const [district, setDistrict] = useState<DistrictId>(LOTTERY.promotedFrom[0])
  const [vice, setVice] = useState<ProductId | ''>('')

  const drawDay = game.day + 1
  const nextDraw = LOTTERY.days.find((day) => day > game.day)
  const accepted = game.events.forgery?.day === drawDay
  const rejected = !accepted && game.services.lastDay.forgery === game.day
  const districts = kind === 'cadre' ? LOTTERY.demotedFrom : LOTTERY.promotedFrom
  const chosenDistrict = districts.includes(district) ? district : districts[0]
  const vices = viceChoices(chosenDistrict)
  const chosenVice = vice && vices.includes(vice) ? vice : vices[0]
  const card: ForgeryCard | null =
    kind === 'informant'
      ? { kind }
      : kind === 'cadre'
        ? chosenVice
          ? { kind, district: chosenDistrict, vice: chosenVice }
          : null
        : { kind, district: chosenDistrict }

  return (
    <div className="border-t border-zinc-800 pt-2">
      <p className="font-bold">{d.title}</p>
      <Locked requires={SERVICE_REQUIREMENTS.forgery} />
      <p className="text-xs text-zinc-400">{nextDraw ? d.nextDraw(nextDraw) : d.noDraw}</p>
      {accepted && <p className="text-xs text-green-400">{d.accepted}</p>}
      {rejected && <p className="text-xs text-red-300">{d.rejected(FORGERY.failIccLoss, t.hud.wantedGain(WANTED.perOffense))}</p>}
      {LOTTERY.days.includes(drawDay) && !accepted && !rejected && (
        <div className="mt-1 flex flex-col gap-1 text-xs">
          <p className="text-zinc-300">{d.rule(credits(forgeryCost(game)), percent(forgeryChance(game), 0))}</p>
          <label className="flex flex-wrap items-center gap-1.5">
            {d.card}
            <select value={kind} onChange={(event) => setKind(CARD_KINDS.find((id) => id === event.target.value) ?? 'captain')} className={SELECT}>
              {CARD_KINDS.map((id) => (
                <option key={id} value={id}>
                  {d.cards[id]}
                </option>
              ))}
            </select>
          </label>
          <p className="text-zinc-400">{typeof d.effects[kind] === 'function' ? d.effects[kind](LOTTERY.viceDays) : d.effects[kind]}</p>
          {kind !== 'informant' && (
            <label className="flex flex-wrap items-center gap-1.5">
              {d.district}
              <select
                value={chosenDistrict}
                onChange={(event) => setDistrict(districts.find((id) => id === event.target.value) ?? districts[0])}
                className={SELECT}
              >
                {districts.map((id) => (
                  <option key={id} value={id}>
                    {t.district[id].name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {kind === 'cadre' && (
            <label className="flex flex-wrap items-center gap-1.5">
              {d.vice}
              <select value={chosenVice ?? ''} onChange={(event) => setVice(vices.find((id) => id === event.target.value) ?? '')} className={SELECT}>
                {vices.map((id) => (
                  <option key={id} value={id}>
                    {t.product[id].name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <ul>
            <DeskRow
              label={d.submit}
              detail={d.failure(FORGERY.failIccLoss, t.hud.wantedGain(WANTED.perOffense))}
              error={card ? checkForgery(game, card) : 'not-eligible'}
              onClick={() => card && dispatch({ type: 'forge', card })}
            />
          </ul>
        </div>
      )}
    </div>
  )
}

/** Velvet-Silo : enchères, chantage, commande VIP (chap. 4) */
export function VelvetDesk() {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits, multiplier } = useI18n()
  const d = t.desks.velvet
  if (velvetLocked(game) && game.velvetLock !== null)
    return <p className="border-t border-zinc-800 pt-2 text-xs text-red-300">{d.locked(game.velvetLock)}</p>

  const lots = PRODUCT_IDS.filter((id) => PRODUCTS[id].tier >= VELVET.auction.minTier && ownedQty(game.cargo, id) > 0)
  const crates = blackmailCrates(game)
  const vip = game.vip
  const value = vipValue(game)

  return (
    <>
      <div className="border-t border-zinc-800 pt-2">
        <Locked requires={SERVICE_REQUIREMENTS.auction} />
        <p className="font-bold">{d.auctionTitle}</p>
        <p className="text-xs text-zinc-400">
          {d.auctionRule(VELVET.auction.minTier, multiplier(VELVET.auction.factor), VELVET.auction.cooldownDays)}
        </p>
        {lots.length === 0 && <p className="text-xs text-zinc-500">{d.nothingToAuction(VELVET.auction.minTier)}</p>}
        <ul className="mt-1 space-y-1">
          {lots.map((id) => (
            <DeskRow
              key={id}
              label={d.auction(t.product[id].name)}
              detail={credits(auctionPrice(game, id) ?? 0)}
              error={checkAuction(game, id)}
              onClick={() => dispatch({ type: 'auction', productId: id })}
            />
          ))}
        </ul>
      </div>

      <div className="border-t border-zinc-800 pt-2">
        <p className="font-bold">{d.blackmailTitle}</p>
        <p className="text-xs text-zinc-400">{d.blackmailRule(VELVET.blackmail.icc, VELVET.blackmail.cooldownDays)}</p>
        <ul className="mt-1 space-y-1">
          <DeskRow
            label={d.payCash}
            detail={credits(blackmailCost(game))}
            error={checkBlackmail(game, false)}
            onClick={() => dispatch({ type: 'blackmail', inKind: false })}
          />
          <DeskRow
            label={d.payCrates}
            detail={crates ? crates.map((crate) => `${crate.qty} × ${t.product[crate.productId].name}`).join(', ') : d.notEnoughCrates}
            error={checkBlackmail(game, true)}
            onClick={() => dispatch({ type: 'blackmail', inKind: true })}
          />
        </ul>
      </div>

      <div className="border-t border-zinc-800 pt-2">
        <p className="font-bold">{d.vipTitle}</p>
        <p className="text-xs text-zinc-400">
          {d.vipRule(VELVET.vip.crates, multiplier(VELVET.vip.factor), VELVET.vip.failIccLoss, VELVET.vip.lockDays)}
        </p>
        <ul className="mt-1 space-y-1">
          {vip ? (
            <DeskRow
              label={d.deliver}
              detail={d.contract(VELVET.vip.crates, t.product[vip.productId].name, vip.day + 1, value === null ? '—' : credits(value))}
              error={checkVipDelivery(game)}
              onClick={() => dispatch({ type: 'vipDeliver' })}
            />
          ) : (
            <DeskRow
              label={d.request}
              detail={d.requestDetail(VELVET.vip.tiers.join(' ou '))}
              error={checkVipRequest(game)}
              onClick={() => dispatch({ type: 'vipRequest' })}
            />
          )}
        </ul>
      </div>
    </>
  )
}
