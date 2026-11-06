import { Clock, Globe, ListOrdered, Lock, Play, RotateCcw, Target, Trophy, Truck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { DIFFICULTIES, GAME_LENGTH_DAYS, START_CASH } from '../../data/balance.ts'
import type { EndingId, GameState } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import { useRecordsStore } from '../../stores/recordsStore.ts'
import { useSettingsStore } from '../../stores/settingsStore.ts'
import CareerView from '../fil/CareerView.tsx'
import ManualButton from '../manual/ManualModal.tsx'
import Button from '../shared/Button.tsx'
import Chip from '../shared/Chip.tsx'
import ConfirmButton from '../shared/ConfirmButton.tsx'
import Hint from '../shared/Hint.tsx'
import Panel from '../shared/Panel.tsx'
import Rich from '../shared/Rich.tsx'
import DifficultyPicker from './DifficultyPicker.tsx'
import LanguagePicker from './LanguagePicker.tsx'
import RankedPanel from './RankedPanel.tsx'

type TitleScreenProps = {
  /** Entrer dans la partie (nouvelle, reprise, ou son bilan si elle est finie) */
  onPlay: () => void
  /** Ouvrir l'écran du classement */
  onBoard: () => void
}

type BlockProps = {
  icon: LucideIcon
  title: string
  children: ReactNode
}

/** Fins qui sont des accomplissements, de la plus prestigieuse à la plus modeste (chap. 1) */
const ENDINGS = ['saboteur', 'resident', 'elite', 'mafia', 'notable', 'exemplary', 'standard'] as const satisfies readonly EndingId[]

/** Une partie entamée : un jour passé, un trajet fait ou une caisse achetée */
function started(game: GameState): boolean {
  return game.day > 1 || game.dayTripDone || game.journal.some((log) => log.bought > 0 || log.highlights.length > 0)
}

/**
 * Écran d'accueil (chap. 7) : la langue, le mode, puis lancer, reprendre ou recommencer une partie libre, le classement et le
 * manuel ; la partie classée du jour ; le monde, le rôle du joueur, le but et la journée type, les fins à atteindre
 */
export default function TitleScreen({ onPlay, onBoard }: TitleScreenProps) {
  const game = useGameStore((s) => s.game)
  const newGame = useGameStore((s) => s.newGame)
  const ranked = useGameStore((s) => s.ranked)
  const games = useRecordsStore((s) => s.games)
  const reached = useRecordsStore((s) => s.endings)
  // Mode de la prochaine partie, retenu dans les réglages (chap. 1)
  const difficulty = useSettingsStore((s) => s.difficulty)
  const { t, credits } = useI18n()
  const title = t.title
  const finished = game.status === 'finished'
  const ongoing = !finished && started(game)
  const restart = () => {
    newGame(difficulty)
    onPlay()
  }
  const mode = t.difficulty.modes[difficulty].name

  return (
    <main className="mx-auto flex min-h-full w-full max-w-4xl flex-col gap-6 px-4 pt-3 pb-8 motion-safe:animate-fade-in">
      <LanguagePicker />
      {/* Le choix de la langue tout en haut, le titre à bonne distance dessous */}
      <header className="mt-2 text-center">
        <p className="text-xs font-bold tracking-widest text-broadcast uppercase">{title.broadcast}</p>
        <h1 className="mt-3 text-5xl font-bold tracking-widest text-accent uppercase sm:text-6xl">{title.name}</h1>
        <p className="mt-3 text-ink-soft italic">{title.tagline}</p>
      </header>

      {/* Le classement et le manuel, indépendants du mode : sous le titre, visibles sans défiler sur téléphone */}
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="ranked" onClick={onBoard}>
          <ListOrdered size={14} aria-hidden="true" />
          {t.ranked.board.open}
        </Button>
        <ManualButton />
      </div>

      <DifficultyPicker />

      {/* Deux blocs : la partie libre et la partie classée du jour, chacun avec le mode de la partie qu'il lance */}
      <div className="grid gap-6 md:grid-cols-2">
        <Panel icon={Play} title={title.freeTitle} fill>
          <div className="flex flex-1 flex-col gap-3">
            <p className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-ink-muted">{t.ranked.mode}</span>
              <Chip tone="accent">{mode}</Chip>
            </p>
            <p className="text-ink-soft">{title.freeBlurb}</p>
            {ongoing && !ranked && <Hint>{title.currentMode(t.difficulty.modes[game.difficulty].name)}</Hint>}
            {/* Les boutons au centre de la place qui reste, quand le bloc s'aligne sur la hauteur de la partie classée */}
            <div className="flex flex-1 flex-wrap items-center justify-center gap-2">
              {!ranked && finished ? (
                <>
                  <Button variant="primary" onClick={restart}>
                    <Play size={14} aria-hidden="true" />
                    {title.newGame}
                  </Button>
                  <Button onClick={onPlay}>{title.review}</Button>
                </>
              ) : ongoing ? (
                <>
                  {!ranked && (
                    <Button variant="primary" onClick={onPlay}>
                      <Play size={14} aria-hidden="true" />
                      {title.resume(game.day)}
                    </Button>
                  )}
                  <ConfirmButton
                    variant={ranked ? 'primary' : 'default'}
                    onClick={restart}
                    confirm={{ title: title.newGame, message: title.newGameConfirm(mode), action: title.newGame }}
                  >
                    <RotateCcw size={14} aria-hidden="true" />
                    {title.newGame}
                  </ConfirmButton>
                </>
              ) : (
                // Rien n'est en cours : la partie se lance dans le mode choisi
                <Button variant="primary" onClick={restart}>
                  <Play size={14} aria-hidden="true" />
                  {title.start}
                </Button>
              )}
            </div>
          </div>
        </Panel>
        <RankedPanel ongoing={ongoing} onPlay={onPlay} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Block icon={Globe} title={title.worldTitle}>
          {title.world.map((line) => (
            <p key={line}>
              <Rich text={line} />
            </p>
          ))}
        </Block>
        <Block icon={Truck} title={title.roleTitle}>
          {title.role.map((line) => (
            <p key={line}>
              <Rich text={line} />
            </p>
          ))}
        </Block>
        <Block icon={Target} title={title.goalTitle}>
          {title.goal(GAME_LENGTH_DAYS, credits(DIFFICULTIES[difficulty].startDebt), credits(START_CASH)).map((line) => (
            <p key={line}>
              <Rich text={line} />
            </p>
          ))}
        </Block>
        <Block icon={Clock} title={title.dayTitle}>
          <ul className="flex list-disc flex-col gap-1.5 pl-4">
            {title.day.map((line) => (
              <li key={line}>
                <Rich text={line} />
              </li>
            ))}
          </ul>
        </Block>
      </div>

      <Block icon={Trophy} title={title.endingsTitle}>
        {/* Téléphone : un filet entre les fins, dont l'accroche passe à la ligne ; grand écran : une fin par ligne */}
        <ul className="flex flex-col divide-y divide-line sm:gap-2 sm:divide-y-0">
          {ENDINGS.map((id) => (
            <li key={id} className="flex flex-wrap items-center gap-2 py-2 first:pt-0 last:pb-0 sm:py-0">
              <Chip tone={(reached[id] ?? 0) > 0 ? 'success' : 'muted'} icon={(reached[id] ?? 0) > 0 ? Trophy : Lock}>
                {t.end.endings[id].title}
              </Chip>
              <span className="text-ink-soft">
                <Rich text={title.teaser[id]} />
              </span>
            </li>
          ))}
        </ul>
      </Block>

      {games > 0 && (
        <Panel icon={Trophy} title={t.records.title}>
          <CareerView />
        </Panel>
      )}
    </main>
  )
}

/** Encart de l'accueil : titre et texte, sans repli */
function Block({ icon, title, children }: BlockProps) {
  return (
    <Panel icon={icon} title={title}>
      <div className="flex flex-col gap-2 text-ink-soft">{children}</div>
    </Panel>
  )
}
