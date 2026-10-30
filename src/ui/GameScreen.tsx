import { useEffect, useState } from 'react'
import { useGameStore } from '../stores/gameStore.ts'
import BriefingPanel from './briefing/BriefingPanel.tsx'
import CargoView from './cargo/CargoView.tsx'
import EndScreen from './modals/EndScreen.tsx'
import EveningPanel from './evening/EveningPanel.tsx'
import InterceptionReportPanel from './interception/InterceptionReportPanel.tsx'
import InterceptionScreen from './interception/InterceptionScreen.tsx'
import StatusBar from './hud/StatusBar.tsx'
import TravelPanel from './map/TravelPanel.tsx'
import MarketPanel from './market/MarketPanel.tsx'
import ObjectivesPanel from './objectives/ObjectivesPanel.tsx'
import PlacesPanel from './places/PlacesPanel.tsx'
import { placesHere } from './places/placesHere.ts'
import RoadEventScreen from './road/RoadEventScreen.tsx'
import RoadReportPanel from './road/RoadReportPanel.tsx'
import TabBar, { type Tab } from './TabBar.tsx'

/**
 * Écran unique (chap. 7). Téléphone : bandeau, briefing et comptes rendus, puis l'onglet ouvert.
 * Desktop : marché à gauche, le reste à droite, sans onglets. Un barrage ou un aléa routier prend tout l'écran.
 */
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

  // Onglet choisi pour la scène en cours : un trajet ou une nouvelle demi-journée ramène au marché
  const scene = `${day}-${phase}-${districtId}`
  const [picked, setPicked] = useState<{ tab: Tab; scene: string }>({ tab: 'market', scene })
  const tabs: Tab[] = placesHere(districtId).length > 0 ? ['market', 'places', 'cargo', 'map'] : ['market', 'cargo', 'map']
  const tab = picked.scene === scene && tabs.includes(picked.tab) ? picked.tab : 'market'
  const pick = (next: Tab) => {
    setPicked({ tab: next, scene })
    window.scrollTo({ top: 0 })
  }
  // Téléphone : seul l'onglet ouvert s'affiche ; desktop : tout
  const shown = (of: Tab) => (tab === of ? 'flex' : 'hidden md:flex')

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
        <>
          <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-4 pb-24 md:grid md:grid-cols-5 md:items-start md:pb-4">
            <div className={`min-w-0 flex-col md:col-span-3 ${shown('market')}`}>
              <MarketPanel />
            </div>
            {/* Colonne de droite sur desktop ; sur téléphone, ses blocs se rangent directement dans la page */}
            <div className="contents md:col-span-2 md:flex md:min-w-0 md:flex-col md:gap-4">
              {/* Briefing et comptes rendus : au-dessus de l'onglet ouvert sur téléphone */}
              <div className="order-first flex flex-col gap-4 empty:hidden md:order-none">
                <InterceptionReportPanel />
                <RoadReportPanel />
                <BriefingPanel />
              </div>
              <div className={`flex-col gap-4 ${shown('cargo')}`}>
                <CargoView />
              </div>
              <div className={`flex-col gap-4 ${shown('places')}`}>
                <PlacesPanel />
              </div>
              <div className={`flex-col gap-4 ${shown('map')}`}>
                <EveningPanel />
                <ObjectivesPanel />
                <TravelPanel />
              </div>
            </div>
          </main>
          <TabBar current={tab} tabs={tabs} onPick={pick} />
        </>
      )}
    </div>
  )
}
