import { useState } from 'react'
import ErrorBoundary from './ui/ErrorBoundary.tsx'
import GameScreen from './ui/GameScreen.tsx'
import TitleScreen from './ui/screens/TitleScreen.tsx'

/** L'accueil à chaque ouverture, puis l'écran de jeu (chap. 7) */
export default function App() {
  // Entré dans la partie depuis l'accueil : état d'interface éphémère, l'accueil revient à la prochaine ouverture
  const [playing, setPlaying] = useState(false)
  return <ErrorBoundary>{playing ? <GameScreen /> : <TitleScreen onPlay={() => setPlaying(true)} />}</ErrorBoundary>
}
