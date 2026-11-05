import { Award, Lock, Trophy } from 'lucide-react'
import { DIFFICULTIES, FEATS, WANTED } from '../../data/balance.ts'
import { FEAT_IDS, type FeatId } from '../../engine/feats.ts'
import { keysOf } from '../../engine/records.ts'
import type { EndingId } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useRecordsStore } from '../../stores/recordsStore.ts'
import Chip from '../shared/Chip.tsx'
import Hint from '../shared/Hint.tsx'
import Tip from '../shared/Tip.tsx'

type FeatChipsProps = {
  /** Hauts faits à montrer ; avec leur compte d'une partie à l'autre, ou ceux d'une seule partie */
  feats: readonly FeatId[]
  counts?: Partial<Record<FeatId, number>>
}

/** Fins qui sont des accomplissements, de la plus prestigieuse à la plus modeste (chap. 1) */
const ACCOMPLISHMENTS: readonly EndingId[] = ['saboteur', 'resident', 'elite', 'mafia', 'notable', 'exemplary', 'standard']
const DEFEATS: readonly EndingId[] = ['bio-bricks', 'death', 'execution']

/** Section de la carrière : intitulé, puis son contenu */
const SECTION = 'mt-3 mb-1.5 text-xs font-bold text-ink-soft uppercase'

/** Carrière, d'une partie à l'autre : parties jouées, meilleur score, fins atteintes et hauts faits (chap. 7) */
export default function CareerView() {
  const games = useRecordsStore((s) => s.games)
  const endings = useRecordsStore((s) => s.endings)
  const bestScores = useRecordsStore((s) => s.bestScores)
  const feats = useRecordsStore((s) => s.feats)
  const { t, credits } = useI18n()
  const defeats = DEFEATS.reduce((total, id) => total + (endings[id] ?? 0), 0)

  return (
    <div className="text-sm">
      {games === 0 ? (
        <Hint>{t.records.none}</Hint>
      ) : (
        <p className="text-xs text-ink-soft">
          {t.records.summary(games, defeats)}
          {/* Un meilleur score par mode joué (chap. 1) */}
          {keysOf(DIFFICULTIES).map((mode) => {
            const best = bestScores[mode]
            return best === undefined ? null : (
              <span key={mode} className="ml-2 font-bold text-offshore">
                {t.records.best(credits(best), t.difficulty.modes[mode].name)}
              </span>
            )
          })}
        </p>
      )}
      <h3 className={SECTION}>{t.records.endings}</h3>
      <ul className="flex flex-wrap gap-1.5">
        {ACCOMPLISHMENTS.map((id) => {
          const count = endings[id] ?? 0
          return (
            <li key={id}>
              {count > 0 ? (
                <Chip tone="success" icon={Trophy}>
                  {t.records.reached(t.end.endings[id].title, count)}
                </Chip>
              ) : (
                <Chip tone="muted" icon={Lock}>
                  {t.end.endings[id].title}
                </Chip>
              )}
            </li>
          )
        })}
      </ul>
      <h3 className={SECTION}>{t.records.feats}</h3>
      <FeatChips feats={FEAT_IDS} counts={feats} />
    </div>
  )
}

/** Hauts faits en pastilles : accomplis (avec leur compte) ou verrouillés ; la condition de chacun en infobulle */
export function FeatChips({ feats, counts }: FeatChipsProps) {
  const { t } = useI18n()
  const f = t.records.feat
  // Condition de chaque haut fait, chiffres lus dans les règles
  const how: Record<FeatId, string> = {
    escapes: f.escapes.how(FEATS.escapes),
    summitBluff: f.summitBluff.how(FEATS.summitSecurity),
    clean: f.clean.how(),
    wantedMax: f.wantedMax.how(WANTED.maxLevel),
    contracts: f.contracts.how(FEATS.contracts),
    nightOwl: f.nightOwl.how(FEATS.nightTrips),
    earlyDebt: f.earlyDebt.how(FEATS.debtByDay),
    gold: f.gold.how(),
  }
  return (
    <ul className="flex flex-wrap gap-1.5">
      {feats.map((id) => {
        // Sans compte : hauts faits d'une seule partie, tous accomplis
        const count = counts ? (counts[id] ?? 0) : 1
        return (
          <li key={id}>
            <Tip content={how[id]}>
              {count > 0 ? (
                <Chip tone="success" icon={Award}>
                  {counts ? t.records.reached(f[id].name, count) : f[id].name}
                </Chip>
              ) : (
                <Chip tone="muted" icon={Lock}>
                  {f[id].name}
                </Chip>
              )}
            </Tip>
          </li>
        )
      })}
    </ul>
  )
}
