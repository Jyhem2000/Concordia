import { useState } from 'react'
import { PRODUCTS } from '../../data/products.ts'
import { CREW, MODULES, VEHICLES } from '../../data/vehicles.ts'
import { keysOf } from '../../engine/records.ts'
import type { Tier } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import Chip from '../shared/Chip.tsx'
import { FALLBACK_ICONS, IMAGE_FILE_NAMES, imageUrl, type ImageId } from '../shared/images.ts'
import Panel from '../shared/Panel.tsx'
import { TIER_STYLES } from '../shared/styles.ts'
import Thumb from '../shared/Thumb.tsx'

type ImageCardProps = {
  id: ImageId
  name: string
  tier?: Tier
  /** Taille du fichier une fois chargé (`512 × 512`), absente avant le chargement ou sans fichier */
  size?: string
  /** Taille différente de la plus fréquente */
  odd: boolean
  onSize: (size: string) => void
}

/** Une donnée et son image : le fichier à nu dans un cadre en pointillés, puis ses rendus en liste et en fiche */
function ImageCard({ id, name, tier, size, odd, onSize }: ImageCardProps) {
  const { t } = useI18n()
  const url = imageUrl(id)
  const Icon = FALLBACK_ICONS[id]
  return (
    <li className={`flex flex-col gap-2 rounded-md border bg-raised/60 p-2 ${url ? 'border-line' : 'border-danger/60'}`}>
      <div className="flex aspect-square w-full items-center justify-center border border-dashed border-line-strong bg-base">
        {url ? (
          <img
            src={url}
            alt=""
            className="max-h-full max-w-full"
            onLoad={(event) => onSize(t.debug.size(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight))}
          />
        ) : (
          <Icon size={48} aria-hidden="true" className="text-ink-faint" />
        )}
      </div>
      <div className="flex items-end gap-2">
        <Thumb id={id} tier={tier} />
        <Thumb id={id} tier={tier} size="lg" />
      </div>
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        {tier !== undefined && <span className={`font-bold ${TIER_STYLES[tier].text}`}>T{tier}</span>}
        <span className="font-mono text-ink-muted">{id}</span>
      </div>
      <p className="text-sm font-bold text-ink">{name}</p>
      <div className="flex flex-wrap gap-1">
        {!url && <Chip tone="danger">{t.debug.missing}</Chip>}
        {size && <Chip tone={odd ? 'warning' : 'muted'}>{size}</Chip>}
        {odd && <Chip tone="warning">{t.debug.odd}</Chip>}
      </div>
    </li>
  )
}

/**
 * Page de contrôle des images (`?debug=true`, chap. 7) : chaque donnée qui peut recevoir une image, en grille par
 * famille, pour vérifier présence, cohérence et taille des fichiers déposés. Hors jeu, sans sauvegarde
 */
export default function ImageGallery() {
  const { t } = useI18n()
  // Tailles lues au chargement de chaque fichier : état d'affichage éphémère
  const [sizes, setSizes] = useState<Partial<Record<ImageId, string>>>({})

  const sections: { title: string; items: { id: ImageId; name: string; tier?: Tier }[] }[] = [
    {
      title: t.debug.sections.products,
      items: keysOf(PRODUCTS).map((id) => ({ id, name: t.product[id].name, tier: PRODUCTS[id].tier })),
    },
    { title: t.debug.sections.vehicles, items: keysOf(VEHICLES).map((id) => ({ id, name: t.vehicle[id].name })) },
    { title: t.debug.sections.modules, items: keysOf(MODULES).map((id) => ({ id, name: t.module[id].name })) },
    { title: t.debug.sections.crew, items: keysOf(CREW).map((id) => ({ id, name: t.crew[id].name })) },
  ]
  const ids = sections.flatMap((section) => section.items.map((item) => item.id))
  const present = ids.filter((id) => imageUrl(id)).length
  const orphans = IMAGE_FILE_NAMES.filter((name) => !ids.some((id) => id === name))

  // Taille de référence : la plus fréquente parmi les fichiers chargés
  const counts = new Map<string, number>()
  for (const size of Object.values(sizes)) counts.set(size, (counts.get(size) ?? 0) + 1)
  const reference = [...counts].sort((a, b) => b[1] - a[1])[0]?.[0]

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-widest text-accent uppercase">{t.debug.title}</h1>
        <p className="text-sm text-ink-soft">{t.debug.intro}</p>
        <p className="text-sm font-bold text-ink">{t.debug.summary(present, ids.length)}</p>
      </header>
      {orphans.length > 0 && (
        <Panel title={t.debug.orphans}>
          <div className="flex flex-wrap gap-1">
            {orphans.map((name) => (
              <Chip key={name} tone="warning">
                {name}
              </Chip>
            ))}
          </div>
        </Panel>
      )}
      {sections.map((section) => (
        <Panel
          key={section.title}
          title={section.title}
          aside={`${section.items.filter((item) => imageUrl(item.id)).length} / ${section.items.length}`}
        >
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {section.items.map((item) => (
              <ImageCard
                key={item.id}
                {...item}
                size={sizes[item.id]}
                odd={sizes[item.id] !== undefined && reference !== undefined && sizes[item.id] !== reference}
                onSize={(size) => setSizes((seen) => ({ ...seen, [item.id]: size }))}
              />
            ))}
          </ul>
        </Panel>
      ))}
    </main>
  )
}
