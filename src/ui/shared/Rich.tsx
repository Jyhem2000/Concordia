import { parseRich } from './rich.ts'

type RichProps = {
  text: string
}

/** Texte long balisé (accueil, manuel, chap. 7) : `**gras**` pour l'essentiel, `*italique*` pour une nuance */
export default function Rich({ text }: RichProps) {
  return parseRich(text).map(({ text: part, style, start }) =>
    style === 'strong' ? (
      <strong key={start} className="font-bold text-ink">
        {part}
      </strong>
    ) : style === 'em' ? (
      <em key={start} className="italic">
        {part}
      </em>
    ) : (
      <span key={start}>{part}</span>
    ),
  )
}
