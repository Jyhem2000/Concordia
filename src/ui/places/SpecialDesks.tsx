import { useState } from 'react'
import { ENDINGS, WANTED } from '../../data/balance.ts'
import { LOTTERY } from '../../data/events.ts'
import { CASSANDRE, FORGERY, KARMA, MORGUE, SERVICE_REQUIREMENTS, VELVET } from '../../data/locations.ts'
import { PRODUCT_IDS, PRODUCTS } from '../../data/products.ts'
import { ownedQty } from '../../engine/cargo.ts'
import { viceChoices } from '../../engine/events.ts'
import {
  auctionPrice,
  availableFrom,
  checkAuction,
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
import type { DistrictId, ForgeryCard, ProductId, Requirement, TagId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Locked from '../shared/Locked.tsx'
import { FIELD } from '../shared/styles.ts'
import Hint from '../shared/Hint.tsx'
import Tip from '../shared/Tip.tsx'
import { FOCUS_RING } from '../shared/focus.ts'

type DeskRowProps = {
  label: string
  detail: string
  error: ActionError | null
  onClick: () => void
  /** Conditions du service réservé (chap. 3), affichées tant qu'elles manquent */
  requires?: readonly Requirement[]
}

type CardKind = ForgeryCard['kind']

const MORGUE_SERVICES: readonly MorgueService[] = ['pass', 'surgery', 'certificate']
const CARD_KINDS: readonly CardKind[] = ['captain', 'competitor', 'informant', 'cadre']

/** Une ligne de guichet : bouton, détail du coût et de l'effet, raison d'un refus */
export function DeskRow({ label, detail, error, onClick, requires }: DeskRowProps) {
  const { t } = useI18n()
  return (
    <li className="text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" disabled={error !== null} onClick={onClick}>
          {label}
        </Button>
        <span className="text-ink-soft">{detail}</span>
      </div>
      {error && error !== 'locked' && <p className="mt-0.5 text-danger">{t.error[error]}</p>}
      <Locked requires={requires} />
    </li>
  )
}

/**
 * Karma-Cham : panique algorithmique sur un tag, effet le lendemain (chap. 3). On choisit le tag parmi des pastilles
 * (avec les caisses du tag déjà en soute), puis un seul bouton commande la panique, prix affiché.
 */
export function KarmaDesk() {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits, change } = useI18n()
  const d = t.desks.karma
  const from = availableFrom(game, 'influence', KARMA.cooldownDays)
  // Tag choisi : état d'interface éphémère
  const [picked, setPicked] = useState<TagId>(KARMA.tags[0])
  const error = checkInfluence(game, picked)
  // Caisses du tag en soute : ce que la panique ferait monter demain
  const held = (tag: TagId) => game.cargo.reduce((total, lot) => (PRODUCTS[lot.productId].tags.includes(tag) ? total + lot.qty : total), 0)

  return (
    <div className="border-t border-line pt-2">
      <p className="flex items-center gap-1 font-bold">
        {d.title}
        <Tip label={d.title} content={d.rule(change(KARMA.factor), KARMA.cooldownDays)} />
      </p>
      <Locked requires={SERVICE_REQUIREMENTS.influence} />
      {game.influence && game.influence.day >= game.day && <Hint tone="accent">{d.pending(t.tag[game.influence.tag].name, game.influence.day)}</Hint>}
      {from !== null && <Hint>{t.desks.availableFrom(from)}</Hint>}
      <div role="radiogroup" aria-label={d.pick} className="mt-1.5 flex flex-wrap gap-1.5">
        {KARMA.tags.map((tag) => (
          <button
            key={tag}
            type="button"
            role="radio"
            aria-checked={tag === picked}
            onClick={() => setPicked(tag)}
            className={`flex flex-col rounded-md border px-2 py-1 text-left text-xs ${FOCUS_RING} ${
              tag === picked ? 'border-accent bg-accent/10 text-ink' : 'border-line-strong bg-raised text-ink-soft hover:bg-line-strong'
            }`}
          >
            <span className="font-bold">{t.tag[tag].name}</span>
            <span className="text-ink-muted">{d.held(held(tag))}</span>
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
        <Button
          variant="primary"
          disabled={error !== null}
          reason={error && error !== 'locked' ? t.error[error] : null}
          onClick={() => dispatch({ type: 'influence', tag: picked })}
        >
          {d.order(credits(karmaCost(game)))}
        </Button>
        <span className="text-ink-muted italic">{d.options[picked] ?? t.tag[picked].name}</span>
      </div>
    </div>
  )
}

/** Morgue du Dr. K. : laissez-passer, chirurgie, certificat (chap. 3) */
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
    <div className="border-t border-line pt-2">
      <p className="font-bold">{d.title}</p>
      {passActive(game) && game.morguePass !== null && <Hint tone="success">{d.passValid(game.morguePass)}</Hint>}
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

/** Cassandre-88 : prédiction garantie de l'événement global de J+2 (chap. 3 et 6) */
export function CassandreDesk() {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits } = useI18n()
  const d = t.desks.cassandre
  const prophecy = game.events.prophecy

  return (
    <div className="border-t border-line pt-2">
      <p className="font-bold">{d.title}</p>
      {prophecy && prophecy.day >= game.day && <Hint tone="accent">{d.foretold(prophecy.day, t.event[prophecy.event].name)}</Hint>}
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

/** Laverie : faux dossier pour le tirage de la Loterie du lendemain (chap. 3 et 6) */
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
    <div className="border-t border-line pt-2">
      <p className="font-bold">{d.title}</p>
      <Locked requires={SERVICE_REQUIREMENTS.forgery} />
      <Hint>{nextDraw ? d.nextDraw(nextDraw) : d.noDraw}</Hint>
      {accepted && <Hint tone="success">{d.accepted}</Hint>}
      {rejected && <Hint tone="danger">{d.rejected(FORGERY.failIccLoss, t.hud.wantedGain(WANTED.perOffense))}</Hint>}
      {LOTTERY.days.includes(drawDay) && !accepted && !rejected && (
        <div className="mt-1 flex flex-col gap-1 text-xs">
          <p className="text-ink-soft">{d.rule(credits(forgeryCost(game)), percent(forgeryChance(game), 0))}</p>
          <label className="flex flex-wrap items-center gap-1.5">
            {d.card}
            <select value={kind} onChange={(event) => setKind(CARD_KINDS.find((id) => id === event.target.value) ?? 'captain')} className={FIELD}>
              {CARD_KINDS.map((id) => (
                <option key={id} value={id}>
                  {d.cards[id]}
                </option>
              ))}
            </select>
          </label>
          <p className="text-ink-muted">{typeof d.effects[kind] === 'function' ? d.effects[kind](LOTTERY.viceDays) : d.effects[kind]}</p>
          {kind !== 'informant' && (
            <label className="flex flex-wrap items-center gap-1.5">
              {d.district}
              <select
                value={chosenDistrict}
                onChange={(event) => setDistrict(districts.find((id) => id === event.target.value) ?? districts[0])}
                className={FIELD}
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
              <select value={chosenVice ?? ''} onChange={(event) => setVice(vices.find((id) => id === event.target.value) ?? '')} className={FIELD}>
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

/** Velvet-Silo : enchères, chantage, commande VIP (chap. 3) */
export function VelvetDesk() {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const { t, credits, change } = useI18n()
  const d = t.desks.velvet
  if (velvetLocked(game) && game.velvetLock !== null)
    return <p className="border-t border-line pt-2 text-xs text-danger">{d.locked(game.velvetLock)}</p>

  const lots = PRODUCT_IDS.filter((id) => PRODUCTS[id].tier >= VELVET.auction.minTier && ownedQty(game.cargo, id) > 0)
  const vip = game.vip
  const value = vipValue(game)

  return (
    <>
      <div className="border-t border-line pt-2">
        <Locked requires={SERVICE_REQUIREMENTS.auction} />
        <p className="font-bold">{d.auctionTitle}</p>
        <Hint>{d.auctionRule(VELVET.auction.minTier, change(VELVET.auction.factor), VELVET.auction.cooldownDays)}</Hint>
        {lots.length === 0 && <Hint>{d.nothingToAuction(VELVET.auction.minTier)}</Hint>}
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

      <div className="border-t border-line pt-2">
        <p className="font-bold">{d.vipTitle}</p>
        <Hint>{d.vipRule(VELVET.vip.crates, change(VELVET.vip.factor), VELVET.vip.failIccLoss, VELVET.vip.lockDays)}</Hint>
        <Hint tone="accent">{d.sponsor(Math.min(game.progress.vipOrders, ENDINGS.elite.sponsorOrders), ENDINGS.elite.sponsorOrders)}</Hint>
        <ul className="mt-1 space-y-1">
          {vip ? (
            <DeskRow
              label={d.deliver}
              detail={d.contract(
                VELVET.vip.crates,
                t.product[vip.productId].name,
                vip.day + VELVET.vip.deadlineDays,
                value === null ? '—' : credits(value),
              )}
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
