import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { DIFFICULTIES, GAME_LENGTH_DAYS } from '../../data/balance.ts'
import { LOCATIONS } from '../../data/locations.ts'
import { TAGS } from '../../data/tags.ts'
import { keysOf } from '../../engine/records.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { useGameStore } from '../../stores/gameStore.ts'
import Button from '../shared/Button.tsx'
import { FOCUS_RING } from '../shared/focus.ts'
import Modal from '../shared/Modal.tsx'

type ManualButtonProps = {
  variant?: 'default' | 'primary'
}

/** Bouton qui ouvre le manuel du passeur, depuis l'accueil, En bref et les écrans de fin (chap. 7) */
export default function ManualButton({ variant = 'default' }: ManualButtonProps) {
  const { t } = useI18n()
  // Manuel ouvert : état d'interface éphémère
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        <BookOpen size={14} aria-hidden="true" />
        {t.manual.open}
      </Button>
      <ManualModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}

type ManualModalProps = {
  open: boolean
  onClose: () => void
}

/** Manuel du passeur : un chapitre à la fois, sommaire en tête, précédent et suivant en pied */
function ManualModal({ open, onClose }: ManualModalProps) {
  const { t, credits } = useI18n()
  // La dette de départ dépend du mode de la partie (chap. 1)
  const difficulty = useGameStore((s) => s.game.difficulty)
  const m = t.manual
  const chapters = m.chapters(GAME_LENGTH_DAYS, credits(DIFFICULTIES[difficulty].startDebt))
  const [index, setIndex] = useState(0)
  const chapter = chapters[index]
  // Listes tirées des données : chaque tag et chaque lieu, avec son nom du jeu
  const terms =
    chapter.list === 'tags'
      ? keysOf(TAGS).map((id) => ({ id, term: t.tag[id].name, text: m.tags[id] }))
      : chapter.list === 'places'
        ? keysOf(LOCATIONS).map((id) => ({ id, term: t.location[id].name, text: m.places[id] }))
        : []

  return (
    <Modal open={open} onClose={onClose} wide title={<h2 className="font-bold text-accent uppercase">{m.title}</h2>}>
      <nav aria-label={m.title}>
        <ol className="flex flex-wrap gap-1.5">
          {chapters.map((entry, position) => (
            <li key={entry.title}>
              <button
                type="button"
                aria-current={position === index ? 'page' : undefined}
                onClick={() => setIndex(position)}
                className={`rounded-full border px-2 py-0.5 text-xs ${FOCUS_RING} ${
                  position === index ? 'border-accent bg-accent/15 text-accent' : 'border-line text-ink-muted hover:text-ink'
                }`}
              >
                {entry.title}
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <article className="mt-4">
        <h3 className="font-bold text-base text-ink">{chapter.title}</h3>
        <div className="mt-2 flex flex-col gap-2 text-ink-soft">
          {chapter.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        {terms.length > 0 && (
          <dl className="mt-3 flex flex-col gap-1.5 text-ink-soft">
            {terms.map(({ id, term, text }) => (
              <div key={id} className="sm:flex sm:gap-3">
                <dt className="font-bold text-ink sm:w-48 sm:shrink-0">{term}</dt>
                <dd>{text}</dd>
              </div>
            ))}
          </dl>
        )}
      </article>
      <div className="mt-4 flex justify-between gap-2 border-t border-line pt-3">
        <Button disabled={index === 0} onClick={() => setIndex(index - 1)}>
          <ChevronLeft size={14} aria-hidden="true" />
          {m.previous}
        </Button>
        <Button disabled={index === chapters.length - 1} onClick={() => setIndex(index + 1)}>
          {m.next}
          <ChevronRight size={14} aria-hidden="true" />
        </Button>
      </div>
    </Modal>
  )
}
