# Concordia

Simulation économique satirique (Drug Wars-like). Game design : [docs/](docs/README.md).

## Stack

- React 19 + TypeScript + Vite, avec le React Compiler (pas de `useMemo` / `useCallback` manuels)
- Tailwind CSS v4 (config CSS-first dans `src/index.css`, un seul thème, pas de variantes `dark:`)
- Zustand + middleware `persist` pour l'état et la sauvegarde (`src/stores/`)
- Motion (ex-Framer Motion) pour les animations : `import { motion } from 'motion/react'`
- lucide-react pour les icônes
- Vitest pour les tests du moteur

## Arborescence

| Dossier       | Rôle                                                                                     |
| :------------ | :--------------------------------------------------------------------------------------- |
| `src/data/`   | Contenu fixe du jeu, indexé par les IDs des docs (produits, districts, constantes…)      |
| `src/engine/` | Règles pures, sans React et testées : types, RNG à graine, `Breakdown`, calculs, actions |
| `src/stores/` | Stores Zustand : état de la partie sauvegardé, réglages                                  |
| `src/i18n/`   | Textes traduits, clés dérivées des IDs                                                   |
| `src/ui/`     | Composants React, découpés comme le chap. 10 (bandeau, marché, soute, carte…)            |
| `sim/`        | Simulations (chap. 9) : bots, campagnes, rapports ; utilise `src/`, jamais l'inverse     |

Données de jeu :

- **Le code fait foi pour les stats.** Prix, tags, coefficients, listes de production, capacités et valeurs de départ vivent dans `src/data/` et ont été retirés des docs, qui gardent les règles, les effets et le lore.
- Un effet chiffré encore décrit dans les docs (passif, service, formule, événement) migre dans `src/data/` ou `src/engine/` quand le moteur l'implémente, et disparaît alors des docs.
- `src/data/data.test.ts` vérifie la cohérence des données avec les règles du design (Tier 0 seul Légal, Production et Forte demande disjointes, carte connexe…).

Conventions du moteur :

- **Pureté :** une action produit un nouvel état, sans effet de bord. L'aléatoire passe par `createRng(state.rng)` et son état est réécrit dans `GameState`.
- **Transparence :** tout calcul affiché au joueur renvoie un `Breakdown` (total + lignes sourcées), pour le détail « zéro boîte noire » (chap. 10).
- **Unités :** probabilités et multiplicateurs en fractions (`0.25`), jauges sur l'échelle des docs (ICC 0–100), montants en ₡ entiers.

Traductions :

- **Un seul fichier par langue :** `src/i18n/fr.ts` est le catalogue de référence (tous les textes, indexés par les IDs des docs). L'anglais se fera en copiant ce fichier en `en.ts` (`satisfies Messages` : toute clé manquante casse la compilation), puis en l'ajoutant à `locales` dans `src/i18n/index.ts`.
- **Aucun texte en dur dans les composants :** `const { t, credits, percent, label } = useI18n()`. Les nombres passent par les formateurs (`credits(2500)` → « 2 500 ₡ »), les lignes de `Breakdown` par `label(source)`.
- Le moteur ne manipule jamais de texte, seulement des IDs.

## Règles de code

Elles s'appliquent à tout le code, sans exception non justifiée. **Toute nouvelle règle adoptée s'ajoute ici** ; une exception assumée est expliquée en commentaire à l'endroit concerné.

**Général**

- Identifiants (types, fonctions, variables, fichiers) en anglais ; commentaires en français ; textes du jeu uniquement dans `src/i18n/`.
- Code complet : ni placeholder ni `TODO` dans le code commité.
- Docs à jour : toute règle décidée en codant (ordre de résolution, arrondi, cas limite) est écrite dans le chapitre concerné de `docs/`, dans le même commit (règle 6 de [docs/README.md](docs/README.md)).

**Où vivent les types et les constantes**

- `src/engine/types.ts` : le modèle du jeu partagé par tous les modules, c'est-à-dire les IDs, les entités décrites dans `src/data/` (`Product`, `District`, `Location`…) et l'état sauvegardé (`GameState` et ses sous-types de jeu).
- Ailleurs, un type vit avec la fonction qui le produit ou le consomme, et il est exporté si d'autres modules en ont besoin : `Action` dans `actions.ts`, `SaleQuote` dans `market.ts`, les props dans leur composant. C'est aussi le cas des briques techniques que l'état embarque, comme `Breakdown` (`breakdown.ts`) ou `RngState` (`rng.ts`) : elles restent avec leur implémentation.
- `src/data/balance.ts` : les nombres d'équilibrage (taux, seuils, durées, bornes des jauges), chacun citant son chapitre.
- `src/data/*.ts` (hors `balance.ts`) : les tables de contenu, une par famille d'entités (produits, tags, districts, lieux, véhicules).
- Aucun ID de donnée ni chiffre de règle en dur dans `src/engine/` ou `src/ui/` : une propriété de district, de lieu ou de produit se lit dans sa table. Seules exceptions : les constantes de présentation sans effet de jeu (couleurs, seuil visuel de marge), déclarées en tête du composant.

**Formules, docs et textes : un seul endroit, liés**

- Une formule n'existe qu'une fois, dans `src/engine/`. L'interface appelle la fonction du moteur (sanction d'une saisie, tendance publique, exposition de la soute…) et ne la recopie jamais, même simplifiée.
- Un texte de `src/i18n/` qui explique une règle reçoit ses valeurs en paramètres, lues dans `src/data/` : aucun chiffre de règle en dur. Un test (`i18n.test.ts`) refuse tout chiffre des textes d'interface hors liste blanche (horaires fixes, une unité, zéro, lore).
- Changer une formule ou une règle, c'est mettre à jour dans le même commit le code, le chapitre de `docs/` qui la décrit et les textes de `src/i18n/` qui l'expliquent, manuel en jeu compris (`manual` dans `fr.ts`, relu à chaque changement de règle et corrigé s'il en parle) ; rechercher ses constantes et ses fonctions dans `src/ui/` donne les autres textes concernés.

**TypeScript**

- Mode strict, ni `any` ni `unknown` non vérifié, ni assertion `!`.
- Pas de cast `as` : inférence, annotations, `satisfies` ou type guards. Seules les conversions `Object.keys` / `entries` / `fromEntries` sont confinées dans `src/engine/records.ts`.
- Unions exhaustives : un libellé de règle (`RuleId`), d'erreur ou de fin manquant casse la compilation (`satisfies Record<…, …>`).
- Props typées en tête de fichier, nommées d'après le composant : `MarketRowProps`.

**React (avec le React Compiler)**

- Jamais de `useMemo`, `useCallback` ni `React.memo`.
- Rendu pur : aucune mutation de donnée externe ; l'état dérivé se calcule dans des constantes au rendu.
- `useEffect` réservé aux synchronisations externes réelles (listeners natifs, timers), jamais pour synchroniser deux états.
- Clés de liste stables et uniques, jamais l'index ; seule exception, une liste figée sans identité propre (lignes d'un `Breakdown`), justifiée en commentaire.
- `useState` réservé à l'éphémère d'interface (saisie, panneau refermé).

**Zustand**

- Sélecteurs fins : `useGameStore((s) => s.game.day)`. L'état entier seulement quand une fonction du moteur en a besoin, et le commentaire le dit.
- Les changements d'état passent par les actions du store (`dispatch`, `newGame`), qui délèguent au moteur.
- Le stockage navigateur passe uniquement par le middleware `persist`.

**Tailwind CSS v4**

- Config CSS-first dans `src/index.css`, pas de `tailwind.config.js`.
- Un seul thème (sombre), aucune variante `dark:`.
- Couleurs par rôle, définies une fois dans `@theme` (`text-danger`, `bg-panel`, `border-tier-2`…) : aucune couleur brute de la palette (`text-red-300`) dans `src/ui/`, ce que vérifie `src/ui/shared/styles.test.ts`. Les correspondances rôle → classes (pastilles, tiers, paliers d'ICC) vivent dans `src/ui/shared/styles.ts`.
- Un style qui sert à deux endroits devient un composant partagé de `src/ui/shared/` (`Panel`, `Card`, `Scene`, `Button`, `Chip`, `Hint`, `Deltas`…) ou une constante de `styles.ts` (`POPOVER`, `FIELD`), jamais une copie de classes.
- Classes standard, pas de valeurs arbitraires (`p-4`, pas `p-[17px]`).
- Mobile d'abord : styles de base pour le téléphone, variantes `sm:` / `md:` pour les écrans larges.

**Accessibilité**

- HTML sémantique : `<button>` pour tout clic, `<header>`, `<main>`, `<section>`, listes.
- Icônes lucide : `size` explicite et `aria-hidden="true"` ; une information portée par une icône ou une couleur est doublée d'un texte `sr-only`.
- Pas d'attribut `title` (invisible au toucher) : une explication passe par l'infobulle `Tip` (`src/ui/shared/Tip.tsx`, Floating UI).
- Un bouton grisé dit pourquoi au survol, au toucher ou au focus (`reason` du `Button`), plutôt que dans un texte sous lui ; l'explication d'un encart, utile la première fois, va derrière le « i » de son titre (`info` du `Panel`).
- Un facteur s'affiche en variation, lisible par tous : `change(0.85)` donne « −15 % », jamais « ×0,85 ».
- Un bouton sans texte explicite porte un `aria-label` traduit (la page est en `lang="fr"`, un libellé anglais serait mal prononcé).
- Focus clavier visible sur tout élément interactif (`FOCUS_RING`).
- États d'affichage : données, liste vide, erreur (bandeau d'erreur d'action, `ErrorBoundary` autour de l'application). Pas d'état de chargement tant que rien n'est asynchrone.

**Animations (Motion)**

- `import { motion } from 'motion/react'`, uniquement `transform` et `opacity`, transitions courtes (200 à 300 ms). `MotionConfig` respecte le réglage « réduire les animations » de l'OS.

**Tests (Vitest)**

- Toute logique pure et tout store sont testés, sur leurs comportements et non leurs détails internes.
- Un fichier de test à côté de sa source (`finance.ts` → `finance.test.ts`), aides partagées dans `src/engine/test-helpers.ts`.
- `src/data/data.test.ts` vérifie la cohérence des données et des constantes d'équilibrage.

**Fichiers**

- LF partout (`.gitattributes`, `.editorconfig`, Prettier).

### Simulations

- Tout le code de simulation vit dans `sim/` (bots, campagnes, rapports, commande). Le jeu (`src/`) ne l'importe jamais ; `sim/` n'appelle le moteur que par ses fonctions publiques et `applyAction`, sans réécrire de règle.
- Un bot décide sur la vue publique (`sim/view.ts`), jamais sur l'état complet ; le test d'information honnête doit rester vert.

## Scripts

| Commande                                   | Rôle                                                         |
| :----------------------------------------- | :----------------------------------------------------------- |
| `npm run dev`                              | Serveur de dev                                               |
| `npm run build`                            | Vérification TypeScript + build                              |
| `npm run lint`                             | ESLint                                                       |
| `npm test`                                 | Tests Vitest (une passe)                                     |
| `npm run test:watch`                       | Tests Vitest en continu                                      |
| `npm run format`                           | Formate tout le projet avec Prettier                         |
| `npm run format:check`                     | Vérifie le formatage sans modifier                           |
| `npm run simulate -- <campagne> [parties]` | Joue une campagne de simulation, rapport dans `sim/reports/` |
