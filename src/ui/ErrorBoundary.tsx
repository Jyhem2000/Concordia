import { Component, type ErrorInfo, type ReactNode } from 'react'
import { getI18n } from '../i18n/index.ts'
import { useGameStore } from '../stores/gameStore.ts'
import { useSettingsStore } from '../stores/settingsStore.ts'
import Button from './shared/Button.tsx'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  failed: boolean
}

/**
 * Filet de sécurité de l'affichage : une erreur de rendu (sauvegarde corrompue, bug) affiche un écran
 * de secours au lieu d'une page blanche, avec de quoi réessayer ou repartir d'une partie neuve.
 * React n'offre ce mécanisme qu'aux composants classe, d'où l'exception au style fonctionnel.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Trace pour le débogage : la console reste le seul témoin d'une erreur de rendu
    console.error(error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children

    // Hors hook (composant classe) : on lit la langue directement dans le store des réglages
    const { t } = getI18n(useSettingsStore.getState().locale)
    const retry = () => this.setState({ failed: false })
    const restart = () => {
      useGameStore.getState().newGame(useSettingsStore.getState().difficulty)
      retry()
    }

    return (
      <main role="alert" className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 p-4 text-center">
        <h1 className="text-xl font-bold text-danger">{t.crash.title}</h1>
        <p className="text-ink-soft">{t.crash.body}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={retry}>{t.crash.retry}</Button>
          <Button variant="primary" onClick={restart}>
            {t.hud.newGame}
          </Button>
        </div>
      </main>
    )
  }
}
