import { Medal } from 'lucide-react'
import { RANKED } from '../../data/balance.ts'
import { pseudoError } from '../../../server/runs.ts'
import { utcDay } from '../../engine/ranked.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import { useRecordsStore } from '../../stores/recordsStore.ts'
import { useSettingsStore } from '../../stores/settingsStore.ts'
import ConfirmButton from '../shared/ConfirmButton.tsx'
import Hint from '../shared/Hint.tsx'
import Panel from '../shared/Panel.tsx'
import { FIELD } from '../shared/styles.ts'

type RankedPanelProps = {
  /** Une partie entamée et pas finie : lancer la classée l'abandonne, après confirmation */
  ongoing: boolean
  /** Entrer dans la partie lancée */
  onPlay: () => void
}

/** Partie classée de l'accueil (chap. 7) : le pseudo, puis la tentative du jour dans le mode choisi */
export default function RankedPanel({ ongoing, onPlay }: RankedPanelProps) {
  const newRankedGame = useGameStore((s) => s.newRankedGame)
  const difficulty = useSettingsStore((s) => s.difficulty)
  const pseudo = useSettingsStore((s) => s.pseudo)
  const setPseudo = useSettingsStore((s) => s.setPseudo)
  const tries = useRecordsStore((s) => s.rankedTries)
  const { t } = useI18n()
  const r = t.ranked
  const mode = t.difficulty.modes[difficulty].name
  // Le jour de la graine se lit au rendu : un accueil resté ouvert passé minuit propose la nouvelle graine au prochain rendu
  const taken = (tries[utcDay(new Date())] ?? []).includes(difficulty)
  const reason = pseudoError(pseudo) !== null ? r.noPseudo : taken ? r.taken(mode) : null
  const play = () => {
    newRankedGame(difficulty)
    onPlay()
  }

  return (
    <Panel icon={Medal} title={r.title} info={r.info}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-col gap-1 text-xs text-ink-muted">
          {r.pseudo}
          <input
            className={FIELD}
            value={pseudo}
            maxLength={RANKED.pseudoMax}
            autoComplete="nickname"
            onChange={(event) => setPseudo(event.target.value)}
          />
        </label>
        <ConfirmButton
          variant="primary"
          disabled={reason !== null}
          reason={reason}
          onClick={play}
          confirm={ongoing ? { title: r.confirmTitle, message: r.confirm(mode), action: r.confirmAction } : undefined}
        >
          {r.play(mode)}
        </ConfirmButton>
      </div>
      <Hint className="mt-2">{r.pseudoHint(RANKED.pseudoMin, RANKED.pseudoMax)}</Hint>
    </Panel>
  )
}
