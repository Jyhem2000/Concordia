import { useEffect } from 'react'
import { useGameStore } from '../stores/gameStore.ts'
import BriefingPanel from './briefing/BriefingPanel.tsx'
import EndScreen from './modals/EndScreen.tsx'
import EveningPanel from './evening/EveningPanel.tsx'
import InterceptionReportPanel from './interception/InterceptionReportPanel.tsx'
import InterceptionScreen from './interception/InterceptionScreen.tsx'
import StatusBar from './hud/StatusBar.tsx'
import TravelPanel from './map/TravelPanel.tsx'
import MarketPanel from './market/MarketPanel.tsx'
import ObjectivesPanel from './objectives/ObjectivesPanel.tsx'
import PlacesPanel from './places/PlacesPanel.tsx'
import RoadEventScreen from './road/RoadEventScreen.tsx'
import RoadReportPanel from './road/RoadReportPanel.tsx'

/** Écran unique : bandeau en haut, marché à gauche ; briefing, guichets, fin de journée et carte à droite (chap. 10). Un barrage ou un aléa routier prend tout l'écran. */
export default function GameScreen() {
  const finished = useGameStore((s) => s.game.status === 'finished')
  const intercepted = useGameStore((s) => s.game.interception !== null)
  const roadEvent = useGameStore((s) => s.game.roadEvent !== null)

  // Retour en haut de page à chaque changement de scène : trajet, matin, soirée, barrage et chaque option jouée, aléa, comptes rendus
  const day = useGameStore((s) => s.game.day)
  const phase = useGameStore((s) => s.game.phase)
  const districtId = useGameStore((s) => s.game.districtId)
  const interception = useGameStore((s) => s.game.interception)
  const interceptionReport = useGameStore((s) => s.game.interceptionReport)
  const roadReport = useGameStore((s) => s.game.roadReport)
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [day, phase, districtId, interception, interceptionReport, roadReport, finished])

  return (
    <div className="flex min-h-full flex-col">
      <StatusBar />
      {finished ? (
        <EndScreen />
      ) : intercepted ? (
        <InterceptionScreen />
      ) : roadEvent ? (
        <RoadEventScreen />
      ) : (
        <main className="mx-auto grid w-full max-w-7xl flex-1 gap-4 p-4 md:grid-cols-5">
          <div className="min-w-0 md:col-span-3">
            <MarketPanel />
          </div>
          <div className="flex min-w-0 flex-col gap-4 md:col-span-2">
            <InterceptionReportPanel />
            <RoadReportPanel />
            <BriefingPanel />
            <PlacesPanel />
            <EveningPanel />
            <ObjectivesPanel />
            <TravelPanel />
          </div>
        </main>
      )}
    </div>
  )
}
