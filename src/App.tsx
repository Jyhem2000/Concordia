import { useEffect, useState } from 'react'
import { useSettingsStore } from './stores/settingsStore.ts'
import ErrorBoundary from './ui/ErrorBoundary.tsx'
import GameScreen from './ui/GameScreen.tsx'
import LeaderboardScreen from './ui/screens/LeaderboardScreen.tsx'
import TitleScreen from './ui/screens/TitleScreen.tsx'

/** Écran affiché : l'accueil, la partie ou le classement */
type Screen = 'title' | 'game' | 'board'

/** L'accueil à chaque ouverture, puis l'écran de jeu ou le classement (chap. 7) */
export default function App() {
  // Écran ouvert : état d'interface éphémère, l'accueil revient à la prochaine ouverture
  const [screen, setScreen] = useState<Screen>('title')
  const locale = useSettingsStore((s) => s.locale)
  // Synchronisation externe : la langue de la page, pour les lecteurs d'écran et la césure
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])
  const show = (next: Screen) => {
    setScreen(next)
    window.scrollTo({ top: 0 })
  }
  return (
    <ErrorBoundary>
      {screen === 'game' ? (
        <GameScreen onHome={() => show('title')} />
      ) : screen === 'board' ? (
        <LeaderboardScreen onBack={() => show('title')} />
      ) : (
        <TitleScreen onPlay={() => show('game')} onBoard={() => show('board')} />
      )}
    </ErrorBoundary>
  )
}
