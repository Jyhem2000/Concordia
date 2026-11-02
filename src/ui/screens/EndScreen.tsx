import { Award, BookMarked, ChartLine, Lightbulb, Printer, RotateCcw, Share2, Trophy } from 'lucide-react'
import { useState } from 'react'
import { WANTED } from '../../data/balance.ts'
import { featsOf } from '../../engine/feats.ts'
import { recapOf, type RunRecap } from '../../engine/recap.ts'
import { isDefeat } from '../../engine/routine.ts'
import type { EndingId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import { useSettingsStore } from '../../stores/settingsStore.ts'
import CareerView, { FeatChips } from '../fil/CareerView.tsx'
import { useHighlightText } from '../fil/useHighlightText.ts'
import WealthChart from '../fil/WealthChart.tsx'
import ManualButton from '../manual/ManualModal.tsx'
import Button from '../shared/Button.tsx'
import Hint from '../shared/Hint.tsx'
import Panel from '../shared/Panel.tsx'

type Defeat = Extract<EndingId, 'bio-bricks' | 'death' | 'execution'>

type RecapStatsProps = {
  recap: RunRecap
  /** Score final, à la victoire seulement */
  score: number | null
}

/**
 * Écran de fin (chap. 7) : la fin débloquée à l'Audit du Jour 30, ou l'écran de mort. Titre et épilogue, conseil après
 * une défaite, bilan chiffré et courbe du patrimoine, faits marquants, hauts faits, carrière ; imprimer, partager,
 * nouvelle partie
 */
export default function EndScreen() {
  const game = useGameStore((s) => s.game)
  const newGame = useGameStore((s) => s.newGame)
  // La nouvelle partie reprend le dernier mode choisi (chap. 1)
  const difficulty = useSettingsStore((s) => s.difficulty)
  const { t, credits } = useI18n()
  const text = useHighlightText()
  // Bilan copié faute de partage natif : état d'interface éphémère
  const [copied, setCopied] = useState(false)
  const id = game.ending?.id ?? 'standard'
  const defeat = isDefeat(id)
  const score = defeat || !game.ending ? null : game.ending.score
  const recap = recapOf(game)
  const mode = t.difficulty.modes[game.difficulty].name
  const feats = featsOf(game)
  // Cartouche de la partie : les faits marquants de chaque journée, sans les simples trajets
  const highlights = game.journal.flatMap((log) =>
    log.highlights.filter((highlight) => highlight.kind !== 'trip').map((highlight) => ({ day: log.day, line: text(highlight) })),
  )

  // Bilan en quelques lignes, pour un message ou un réseau
  const share = async () => {
    const r = t.recap
    const lines = [
      score === null
        ? r.shareDefeat(t.end.endings[id].title, recap.days, mode)
        : r.shareVictory(t.end.endings[id].title, credits(score), recap.days, mode),
      r.shareStats(recap.controls, recap.escapes, recap.trips.night),
      ...(feats.length > 0 ? [r.shareFeats(feats.map((feat) => t.records.feat[feat].name).join(', '))] : []),
    ]
    const message = lines.join('\n')
    if (typeof navigator.share === 'function') {
      // Partage annulé par le joueur : rien à faire
      await navigator.share({ title: r.shareTitle, text: message }).catch(() => undefined)
      return
    }
    await navigator.clipboard.writeText(message)
    setCopied(true)
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 p-4 motion-safe:animate-fade-in">
      <header className={`rounded-lg border p-4 text-center ${defeat ? 'border-danger/40 bg-danger/10' : 'border-accent/40 bg-accent/10'}`}>
        {defeat && <p className="text-sm font-bold tracking-widest text-danger uppercase">{t.end.gameOver}</p>}
        <h1 className={`mt-1 text-3xl font-bold ${defeat ? 'text-danger' : 'text-accent'}`}>{t.end.endings[id].title}</h1>
        <p className="mt-1 text-xs text-ink-muted uppercase">
          {t.recap.reached(recap.days, t.district[game.districtId].name)} · {t.hud.dayMode(mode)}
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-ink-soft">{t.end.endings[id].epilogue}</p>
        {score !== null && (
          <p className="mt-3">
            <span className="text-ink-muted">{t.end.score} </span>
            <span className="text-2xl font-bold text-offshore">{credits(score)}</span>
          </p>
        )}
      </header>

      {defeat && isDefeatId(id) && (
        <Panel icon={Lightbulb} title={t.recap.adviceTitle} tone="highlight">
          <p className="text-ink-soft">{t.recap.advice[id]}</p>
        </Panel>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Panel icon={BookMarked} title={t.recap.title}>
          <RecapStats recap={recap} score={score} />
        </Panel>
        <Panel icon={ChartLine} title={t.recap.wealth}>
          <WealthChart />
        </Panel>
      </div>

      <Panel icon={BookMarked} title={t.journal.highlights} collapseId="end-highlights">
        {highlights.length === 0 ? (
          <Hint>{t.journal.noHighlight}</Hint>
        ) : (
          <ul className="flex flex-col gap-0.5 text-xs text-ink-soft">
            {/* Liste figée du carnet, jamais réordonnée : la position sert de clé */}
            {highlights.map(({ day, line }, position) => (
              <li key={position} className="flex gap-2">
                <span className="w-8 shrink-0 text-ink-muted">{t.chart.dayTick(day)}</span>
                {line}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {feats.length > 0 && (
        <Panel icon={Award} title={t.records.featsThisGame}>
          <FeatChips feats={feats} />
        </Panel>
      )}

      <Panel icon={Trophy} title={defeat ? t.recap.toDo : t.records.title}>
        <CareerView />
      </Panel>

      <div className="flex flex-wrap justify-center gap-2 print:hidden">
        <Button variant="primary" onClick={() => newGame(difficulty)}>
          <RotateCcw size={14} aria-hidden="true" />
          {t.hud.newGame}
        </Button>
        <Button onClick={() => window.print()}>
          <Printer size={14} aria-hidden="true" />
          {t.recap.print}
        </Button>
        <Button onClick={() => void share()}>
          <Share2 size={14} aria-hidden="true" />
          {t.recap.share}
        </Button>
        <ManualButton />
      </div>
      {copied && (
        <Hint tone="success" className="text-center print:hidden">
          {t.recap.copied}
        </Hint>
      )}
    </main>
  )
}

function isDefeatId(id: EndingId): id is Defeat {
  return isDefeat(id)
}

/** Bilan chiffré : argent, route, commandes, parcours */
function RecapStats({ recap, score }: RecapStatsProps) {
  const { t, credits } = useI18n()
  const r = t.recap
  const groups: { title: string; rows: [string, string][] }[] = [
    {
      title: r.groups.money,
      rows: [
        ...(score === null ? [] : [[r.score, credits(score)] satisfies [string, string]]),
        [r.peak, r.atDay(credits(recap.peak.wealth), recap.peak.day)],
        [r.final, credits(recap.finalWealth)],
        [r.bought, credits(recap.bought)],
        [r.sold, credits(recap.sold)],
      ],
    },
    {
      title: r.groups.road,
      rows: [
        [r.trips, r.tripsValue(recap.trips.day, recap.trips.night)],
        [r.controls, r.controlsValue(recap.controls, recap.controlsClean)],
        [r.tactics, `${recap.escapes} · ${recap.bluffs} · ${recap.bribes}`],
        [r.custody, r.days(recap.custodyDays)],
        [r.cratesLost, String(recap.cratesLost)],
      ],
    },
    {
      title: r.groups.jobs,
      rows: [
        [r.deliveries, String(recap.deliveries)],
        [r.contracts, r.contractsValue(recap.contracts.done, recap.contracts.failed)],
        [r.debtPaid, r.debtPaidValue(recap.debtPaidDay)],
      ],
    },
    {
      title: r.groups.gear,
      rows: [
        [r.wantedMax, `${recap.wantedMax}/${WANTED.maxLevel}`],
        [r.vehicle, r.vehicleValue(t.vehicle[recap.vehicle].name, recap.modules)],
      ],
    },
  ]

  return (
    <div className="flex flex-col gap-3 text-xs">
      {groups.map((group) => (
        <section key={group.title}>
          <h3 className="mb-1 font-bold text-ink-soft uppercase">{group.title}</h3>
          <dl className="flex flex-col gap-0.5">
            {group.rows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3 border-b border-line/60 py-0.5">
                <dt className="text-ink-muted">{label}</dt>
                <dd className="text-right font-bold text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}
