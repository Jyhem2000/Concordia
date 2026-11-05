import { Clock, Globe, Lock, Play, RotateCcw, Target, Trophy, Truck } from 'lucide-react'
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
import DifficultyPicker from './DifficultyPicker.tsx'

type TitleScreenProps = {
  /** Entrer dans la partie (nouvelle, reprise, ou son bilan si elle est finie) */
  onPlay: () => void
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
 * Écran d'accueil (chap. 7) : le monde, le rôle du joueur, le but et la journée type, les fins à atteindre ; puis lancer,
 * reprendre ou recommencer la partie, et le manuel
 */
export default function TitleScreen({ onPlay }: TitleScreenProps) {
  const game = useGameStore((s) => s.game)
  const newGame = useGameStore((s) => s.newGame)
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
    <main className="mx-auto flex min-h-full w-full max-w-4xl flex-col gap-6 px-4 py-8 motion-safe:animate-fade-in">
      <header className="text-center">
        <p className="text-xs font-bold tracking-widest text-broadcast uppercase">{title.broadcast}</p>
        <h1 className="mt-3 text-5xl font-bold tracking-widest text-accent uppercase sm:text-6xl">{title.name}</h1>
        <p className="mt-3 text-ink-soft italic">{title.tagline}</p>
      </header>

      <DifficultyPicker />
      {ongoing && <Hint>{title.currentMode(t.difficulty.modes[game.difficulty].name)}</Hint>}

      <div className="flex flex-wrap justify-center gap-2">
        {finished ? (
          <>
            <Button variant="primary" onClick={restart}>
              <Play size={14} aria-hidden="true" />
              {title.newGame}
            </Button>
            <Button onClick={onPlay}>{title.review}</Button>
          </>
        ) : ongoing ? (
          <>
            <Button variant="primary" onClick={onPlay}>
              <Play size={14} aria-hidden="true" />
              {title.resume(game.day)}
            </Button>
            <ConfirmButton onClick={restart} confirm={{ title: title.newGame, message: title.newGameConfirm(mode), action: title.newGame }}>
              <RotateCcw size={14} aria-hidden="true" />
              {title.newGame}
            </ConfirmButton>
          </>
        ) : (
          // Rien n'est encore joué : la partie se lance dans le mode choisi
          <Button variant="primary" onClick={restart}>
            <Play size={14} aria-hidden="true" />
            {title.start}
          </Button>
        )}
        <ManualButton />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Block icon={Globe} title={title.worldTitle}>
          {title.world.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </Block>
        <Block icon={Truck} title={title.roleTitle}>
          {title.role.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </Block>
        <Block icon={Target} title={title.goalTitle}>
          {title.goal(GAME_LENGTH_DAYS, credits(DIFFICULTIES[difficulty].startDebt), credits(START_CASH)).map((line) => (
            <p key={line}>{line}</p>
          ))}
        </Block>
        <Block icon={Clock} title={title.dayTitle}>
          <ul className="flex list-disc flex-col gap-1.5 pl-4">
            {title.day.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Block>
      </div>

      <Block icon={Trophy} title={title.endingsTitle}>
        <ul className="flex flex-col gap-2">
          {ENDINGS.map((id) => (
            <li key={id} className="flex flex-wrap items-center gap-2">
              <Chip tone={(reached[id] ?? 0) > 0 ? 'success' : 'muted'} icon={(reached[id] ?? 0) > 0 ? Trophy : Lock}>
                {t.end.endings[id].title}
              </Chip>
              <span className="text-ink-soft">{title.teaser[id]}</span>
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
