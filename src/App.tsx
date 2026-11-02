import { useState } from 'react'
import ErrorBoundary from './ui/ErrorBoundary.tsx'
import GameScreen from './ui/GameScreen.tsx'
import ImageGallery from './ui/debug/ImageGallery.tsx'
import TitleScreen from './ui/screens/TitleScreen.tsx'

/** Page de contrôle des images à la place du jeu (chap. 7) : lue une fois, à l'ouverture */
const DEBUG = new URLSearchParams(window.location.search).get('debug') === 'true'

/** L'accueil à chaque ouverture, puis l'écran de jeu (chap. 7) ; la page de contrôle des images avec `?debug=true` */
export default function App() {
  // Entré dans la partie depuis l'accueil : état d'interface éphémère, l'accueil revient à la prochaine ouverture
  const [playing, setPlaying] = useState(false)
  if (DEBUG) return <ImageGallery />
  return <ErrorBoundary>{playing ? <GameScreen /> : <TitleScreen onPlay={() => setPlaying(true)} />}</ErrorBoundary>
}
