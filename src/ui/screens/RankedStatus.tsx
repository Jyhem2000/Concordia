import { Medal, RotateCcw } from 'lucide-react'
import { useI18n } from '../../i18n/useI18n.ts'
import { rankedBlock, useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import Panel from '../shared/Panel.tsx'

/** Encart de fin d'une partie classée (chap. 7) : où en est son envoi au classement, et réessayer s'il a échoué */
export default function RankedStatus() {
  const ranked = useGameStore((s) => s.ranked)
  const submission = useGameStore((s) => s.submission)
  const submit = useGameStore((s) => s.submit)
  const { t } = useI18n()
  if (!ranked) return null
  const s = t.ranked.status
  const block = rankedBlock(ranked)
  const text = block ? s[block] : s[submission]
  const retry = block === null && (submission === 'failed' || submission === 'idle')

  return (
    <Panel icon={Medal} title={s.title} tone="highlight">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-ink-soft">{text}</p>
        {retry && (
          <Button onClick={() => void submit()}>
            <RotateCcw size={14} aria-hidden="true" />
            {s.retry}
          </Button>
        )}
      </div>
    </Panel>
  )
}
