import { useEffect, useState } from 'react'
import type { DistrictId } from '../engine/types.ts'
import { useGameStore } from '../stores/gameStore.ts'
import CargoView from './cargo/CargoView.tsx'
import EndScreen from './modals/EndScreen.tsx'
import EveningPanel from './evening/EveningPanel.tsx'
import FilView from './fil/FilView.tsx'
import InterceptionReportPanel from './interception/InterceptionReportPanel.tsx'
import InterceptionScreen from './interception/InterceptionScreen.tsx'
import StatusBar from './hud/StatusBar.tsx'
import TravelPanel from './map/TravelPanel.tsx'
import MarketPanel from './market/MarketPanel.tsx'
import PlacesPanel from './places/PlacesPanel.tsx'
import RoadEventScreen from './road/RoadEventScreen.tsx'
import RoadReportPanel from './road/RoadReportPanel.tsx'
import TabBar, { type Tab } from './TabBar.tsx'

type Picked = {
  tab: Tab
  /** Scène (jour, moment, district) où l'onglet a été ouvert */
  scene: string
  day: number
  districtId: DistrictId
  /** Onglet choisi par le joueur, et non ouvert par la scène */
  byPlayer: boolean
}

/**
 * Écran unique (chap. 7). Téléphone : bandeau, comptes rendus, puis l'onglet ouvert (En bref, Marché, Lieux, Véhicule, Carte).
 * Desktop : En bref en bande pleine largeur, puis le marché à gauche et le reste à droite, sans onglets. Un barrage ou un aléa routier prend tout l'écran.
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

  // Onglet choisi pour la scène en cours (par le joueur, ou ouvert par la scène elle-même)
  const scene = `${day}-${phase}-${districtId}`
  const [picked, setPicked] = useState<Picked>({ tab: 'fil', scene, day, districtId, byPlayer: false })
  const tabs: Tab[] = ['fil', 'market', 'places', 'vehicle', 'map']
  // Nouvelle scène : un nouveau matin ouvre En bref, le couvre-feu sur place la carte (la tournée de nuit), un trajet le marché
  const tab = picked.scene === scene ? picked.tab : picked.day !== day ? 'fil' : picked.districtId === districtId ? 'map' : 'market'
  const choose = (next: Tab) => setPicked({ tab: next, scene, day, districtId, byPlayer: true })
  // Raccourci d'En bref : ouvre l'onglet sur téléphone, amène à son bloc sur desktop
  const go = (next: Tab) => {
    choose(next)
    requestAnimationFrame(() => document.getElementById(`tab-${next}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
  const pick = (next: Tab) => {
    choose(next)
    window.scrollTo({ top: 0 })
  }
  // Comptes rendus : affichés dans la scène où ils arrivent, jusqu'à ce que le joueur change d'onglet
  const [reportsAt, setReportsAt] = useState({ interceptionReport, roadReport, scene })
  if (reportsAt.interceptionReport !== interceptionReport || reportsAt.roadReport !== roadReport) {
    setReportsAt({ interceptionReport, roadReport, scene })
  }
  const reportsShown = reportsAt.scene === scene && !(picked.scene === scene && picked.byPlayer)
  // Téléphone : seul l'onglet ouvert s'affiche ; desktop : tout
  const shown = (of: Tab) => (tab === of ? 'flex motion-safe:animate-fade-in md:animate-none' : 'hidden md:flex')

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
            {/* Comptes rendus : au-dessus de tout, sur toute la largeur */}
            {reportsShown && (
              <div className="flex flex-col gap-4 empty:hidden md:col-span-5">
                <InterceptionReportPanel />
                <RoadReportPanel />
              </div>
            )}
            {/* En bref : sur desktop, une bande pleine largeur en colonnes */}
            <div
              className={`${tab === 'fil' ? 'flex' : 'hidden'} min-w-0 flex-col gap-4 md:col-span-5 md:block md:columns-2 md:gap-4 md:*:mb-4 md:*:break-inside-avoid xl:columns-3`}
            >
              <FilView onGo={go} />
            </div>
            <div id="tab-market" className={`min-w-0 scroll-mt-4 flex-col md:col-span-3 md:scroll-mt-48 ${shown('market')}`}>
              <MarketPanel />
            </div>
            {/* Colonne de droite sur desktop ; sur téléphone, ses blocs se rangent directement dans la page */}
            <div className="contents md:col-span-2 md:flex md:min-w-0 md:flex-col md:gap-4">
              <div id="tab-vehicle" className={`scroll-mt-4 flex-col gap-4 md:scroll-mt-48 ${shown('vehicle')}`}>
                <CargoView />
                <PlacesPanel garage />
              </div>
              <div id="tab-places" className={`scroll-mt-4 flex-col gap-4 md:scroll-mt-48 ${shown('places')}`}>
                <PlacesPanel />
              </div>
              <div id="tab-map" className={`scroll-mt-4 flex-col gap-4 md:scroll-mt-48 ${shown('map')}`}>
                <EveningPanel />
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
