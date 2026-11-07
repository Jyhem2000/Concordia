import { useEffect, useState } from 'react'
import type { DistrictId } from '../engine/types.ts'
import { useGameStore } from '../stores/gameStore.ts'
import CargoView from './cargo/CargoView.tsx'
import EndScreen from './screens/EndScreen.tsx'
import EveningPanel from './evening/EveningPanel.tsx'
import FilView from './fil/FilView.tsx'
import AeternaTicker from './hud/AeternaTicker.tsx'
import InterceptionReportPanel from './interception/InterceptionReportPanel.tsx'
import InterceptionScreen from './interception/InterceptionScreen.tsx'
import StatusBar from './hud/StatusBar.tsx'
import MapPanel, { DestinationsPanel, FeaturedDistrict } from './map/TravelPanel.tsx'
import MarketPanel from './market/MarketPanel.tsx'
import PlacesPanel from './places/PlacesPanel.tsx'
import RoadEventScreen from './road/RoadEventScreen.tsx'
import RoadReportPanel from './road/RoadReportPanel.tsx'
import TabBar, { DesktopTabs, type Tab } from './TabBar.tsx'
import { TAB_GROUP } from './tabs.ts'

type GameScreenProps = {
  /** Revenir à l'accueil */
  onHome: () => void
}

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
 * Grand écran : trois onglets (En bref ; Marché & véhicule ; Carte & lieux), chacun en colonnes côte à côte. Un barrage ou un aléa routier prend tout l'écran.
 */
export default function GameScreen({ onHome }: GameScreenProps) {
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
  // Téléphone : seul l'onglet ouvert s'affiche ; grand écran : tout son groupe, côte à côte
  const shown = (of: Tab) =>
    `${tab === of ? 'flex' : 'hidden'} ${TAB_GROUP[tab] === TAB_GROUP[of] ? 'md:flex' : 'md:hidden'} motion-safe:animate-fade-in`
  // Bloc d'une colonne déjà montrée ou cachée par son groupe sur grand écran : seul l'onglet du téléphone compte
  const phoneOnly = (of: Tab) => `${tab === of ? 'flex' : 'hidden'} md:flex motion-safe:animate-fade-in`

  return (
    <div className="flex min-h-full flex-col">
      <StatusBar />
      {finished ? (
        <EndScreen onHome={onHome} />
      ) : intercepted ? (
        <InterceptionScreen />
      ) : roadEvent ? (
        <RoadEventScreen />
      ) : (
        <>
          <main className="mx-auto flex w-full max-w-8xl flex-1 flex-col gap-4 p-4 pb-28 md:grid md:grid-cols-5 md:content-start md:items-start md:pb-4">
            <DesktopTabs current={tab} onPick={pick} />
            {/* Message Aeterna : téléscripteur sous les onglets, sur toute la largeur */}
            <AeternaTicker className="md:col-span-5" />
            {/* Comptes rendus : au-dessus de tout, sur toute la largeur */}
            {reportsShown && (
              <div className="flex flex-col gap-4 empty:hidden md:col-span-5">
                <InterceptionReportPanel />
                <RoadReportPanel />
              </div>
            )}
            {/*
              En bref : sur grand écran, autant de colonnes que la place en tient (largeur minimale fixe), élargies à parts
              égales ; les encarts s'y répartissent dans l'ordre de lecture, équilibrés par leur hauteur
            */}
            <div
              className={`min-w-0 flex-col gap-4 motion-safe:animate-fade-in md:col-span-5 md:columns-xs md:*:mb-4 md:*:break-inside-avoid ${tab === 'fil' ? 'flex' : 'hidden'} ${TAB_GROUP[tab] === 'brief' ? 'md:block' : 'md:hidden'}`}
            >
              <FilView onHome={onHome} />
            </div>
            {/* Marché & véhicule, puis Carte & lieux : le bloc principal à gauche, l'autre à droite */}
            <div className={`min-w-0 flex-col md:col-span-3 ${shown('market')}`}>
              <MarketPanel />
            </div>
            <div className={`min-w-0 flex-col gap-4 md:col-span-2 ${shown('vehicle')}`}>
              <CargoView />
              <PlacesPanel garage />
            </div>
            {/*
              Carte & lieux. Grand écran : à gauche la carte puis la liste des destinations ; à droite la fiche du district
              désigné, le panneau du soir, la pompe et les lieux. Téléphone : les colonnes s'effacent (contents), l'onglet
              Carte montre le soir, la carte, la fiche puis les destinations ; les lieux ont leur onglet.
            */}
            <div className={`contents md:col-span-3 md:flex-col md:gap-4 ${TAB_GROUP[tab] === 'road' ? 'md:flex' : 'md:hidden'}`}>
              <div className={`order-2 min-w-0 flex-col gap-4 md:order-none ${phoneOnly('map')}`}>
                <MapPanel />
              </div>
              <div className={`order-4 min-w-0 flex-col gap-4 md:order-none ${phoneOnly('map')}`}>
                <DestinationsPanel />
              </div>
            </div>
            <div className={`contents md:col-span-2 md:flex-col md:gap-4 ${TAB_GROUP[tab] === 'road' ? 'md:flex' : 'md:hidden'}`}>
              <div className={`order-3 min-w-0 flex-col gap-4 md:order-none ${phoneOnly('map')}`}>
                <FeaturedDistrict />
              </div>
              <div className={`order-1 min-w-0 flex-col gap-4 md:order-none ${phoneOnly('map')}`}>
                <EveningPanel />
              </div>
              <div className={`min-w-0 flex-col gap-4 ${phoneOnly('places')}`}>
                <PlacesPanel />
              </div>
            </div>
          </main>
          <TabBar current={tab} tabs={tabs} onPick={pick} />
        </>
      )}
    </div>
  )
}
