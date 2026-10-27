import ErrorBoundary from './ui/ErrorBoundary.tsx'
import GameScreen from './ui/GameScreen.tsx'

export default function App() {
  return (
    <ErrorBoundary>
      <GameScreen />
    </ErrorBoundary>
  )
}
