import { useGameStore } from '../stores/gameStore.ts'
import EndScreen from './modals/EndScreen.tsx'
import EveningPanel from './evening/EveningPanel.tsx'
import StatusBar from './hud/StatusBar.tsx'
import TravelPanel from './map/TravelPanel.tsx'
import MarketPanel from './market/MarketPanel.tsx'

/** Écran unique : bandeau en haut, marché à gauche, carte et fin de journée à droite (chap. 9) */
export default function GameScreen() {
  const finished = useGameStore((s) => s.game.status === 'finished')

  return (
    <div className="flex min-h-full flex-col">
      <StatusBar />
      {finished ? (
        <EndScreen />
      ) : (
        <main className="mx-auto grid w-full max-w-7xl flex-1 gap-4 p-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <MarketPanel />
          <div className="flex flex-col gap-4">
            <EveningPanel />
            <TravelPanel />
          </div>
        </main>
      )}
    </div>
  )
}
