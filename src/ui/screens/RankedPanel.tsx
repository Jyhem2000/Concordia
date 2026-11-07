import { CircleAlert, Medal, Play } from 'lucide-react'
import { useState } from 'react'
import { RANKED } from '../../data/balance.ts'
import { pseudoError } from '../../../server/runs.ts'
import { utcDay } from '../../engine/ranked.ts'
import type { StartRefusal } from '../../net/leaderboard.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import { useRecordsStore } from '../../stores/recordsStore.ts'
import { useSettingsStore } from '../../stores/settingsStore.ts'
import Button from '../shared/Button.tsx'
import Chip from '../shared/Chip.tsx'
import ConfirmButton from '../shared/ConfirmButton.tsx'
import Hint from '../shared/Hint.tsx'
import Panel from '../shared/Panel.tsx'
import { FIELD } from '../shared/styles.ts'

type RankedPanelProps = {
  /** Une partie entamée et pas finie : lancer la classée l'abandonne, après confirmation */
  ongoing: boolean
  /** Entrer dans la partie lancée, ou reprendre la classée en cours */
  onPlay: () => void
}

/**
 * Bloc de la partie classée du jour, sur l'accueil (chap. 7) : sa date, le mode de la tentative, la classée en cours à
 * reprendre, puis le pseudo et le lancement, qui attend la graine du serveur et dit pourquoi il la refuse
 */
export default function RankedPanel({ ongoing, onPlay }: RankedPanelProps) {
  const newRankedGame = useGameStore((s) => s.newRankedGame)
  const ranked = useGameStore((s) => s.ranked)
  const game = useGameStore((s) => s.game)
  const difficulty = useSettingsStore((s) => s.difficulty)
  const pseudo = useSettingsStore((s) => s.pseudo)
  const setPseudo = useSettingsStore((s) => s.setPseudo)
  const tries = useRecordsStore((s) => s.rankedTries)
  // Ouverture en cours auprès du serveur, et refus de la dernière : états d'interface éphémères
  const [opening, setOpening] = useState(false)
  const [refusal, setRefusal] = useState<StartRefusal | null>(null)
  const { t, calendarDay } = useI18n()
  const r = t.ranked
  const mode = t.difficulty.modes[difficulty].name
  // Le jour de la graine se lit au rendu : un accueil resté ouvert passé minuit propose la nouvelle graine au prochain rendu
  const today = utcDay(new Date())
  const taken = (tries[today] ?? []).includes(difficulty)
  const reason = opening ? r.opening : pseudoError(pseudo) !== null ? r.noPseudo : taken ? r.taken(mode) : null
  // Le serveur donne la graine et note la tentative : la partie ne s'ouvre qu'avec sa réponse (chap. 1)
  const play = async () => {
    setOpening(true)
    setRefusal(null)
    const refused = await newRankedGame(difficulty)
    setOpening(false)
    if (refused) setRefusal(refused)
    else onPlay()
  }

  return (
    <Panel icon={Medal} title={r.title} info={r.info} aside={<Chip tone="ranked">{calendarDay(today)}</Chip>}>
      <div className="flex flex-col gap-3">
        <p className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-ink-muted">{r.mode}</span>
          <Chip tone="ranked">{mode}</Chip>
        </p>
        <p className="text-ink-soft">{r.blurb}</p>
        {ranked && ongoing && (
          <div className="flex flex-col gap-2">
            <Hint>{t.title.currentRanked(t.difficulty.modes[game.difficulty].name, calendarDay(ranked.day))}</Hint>
            <div>
              <Button variant="ranked" onClick={onPlay}>
                <Play size={14} aria-hidden="true" />
                {r.resume(game.day)}
              </Button>
            </div>
          </div>
        )}
        {ranked && game.status === 'finished' && (
          <div>
            <Button onClick={onPlay}>{t.title.review}</Button>
          </div>
        )}
        {/* Le pseudo et le bouton sur une ligne, à la même hauteur */}
        {/* Le pseudo en texte indicatif du champ, sans libellé au-dessus : le bloc reste court */}
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <input
              aria-label={r.pseudo}
              placeholder={r.pseudo}
              className={`${FIELD} min-w-0 flex-1 basis-40 placeholder:text-ink-faint`}
              value={pseudo}
              maxLength={RANKED.pseudoMax}
              autoComplete="nickname"
              onChange={(event) => setPseudo(event.target.value)}
            />
            <ConfirmButton
              variant="ranked"
              disabled={reason !== null}
              reason={reason}
              onClick={() => void play()}
              confirm={ongoing ? { title: r.confirmTitle, message: r.confirm(mode), action: r.confirmAction } : undefined}
            >
              <Medal size={14} aria-hidden="true" />
              {r.play}
            </ConfirmButton>
          </div>
          <Hint>{r.pseudoHint(RANKED.pseudoMin, RANKED.pseudoMax)}</Hint>
          {refusal && (
            <Hint tone="danger" icon={CircleAlert}>
              {r.startError[refusal](mode)}
            </Hint>
          )}
        </div>
      </div>
    </Panel>
  )
}
