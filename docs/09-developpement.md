# 9. Développement

> Ce chapitre décrit **comment le code est fait** : outils, organisation des dossiers, règles de code, commandes et mise en ligne. Il s'adresse à qui modifie le jeu ; les règles du jeu elles-mêmes sont dans les chap. 1 à 6.

## Stack

- React 19 + TypeScript + Vite, avec le React Compiler (pas de `useMemo` / `useCallback` manuels)
- Tailwind CSS v4 (config CSS-first dans `src/index.css`, un seul thème, pas de variantes `dark:`)
- Zustand + middleware `persist` pour l'état et la sauvegarde (`src/stores/`)
- Motion (ex-Framer Motion) pour les animations : `import { motion } from 'motion/react'`
- lucide-react pour les icônes
- Vitest pour les tests du moteur

## Arborescence

| Dossier       | Rôle                                                                                      |
| :------------ | :---------------------------------------------------------------------------------------- |
| `src/data/`   | Contenu fixe du jeu, indexé par les IDs des docs (produits, districts, constantes…)       |
| `src/engine/` | Règles pures, sans React et testées : types, RNG à graine, `Breakdown`, calculs, actions  |
| `src/stores/` | Stores Zustand : état de la partie sauvegardé, réglages                                   |
| `src/i18n/`   | Textes traduits, clés dérivées des IDs                                                    |
| `src/net/`    | Seul code réseau du jeu : envoi d'une partie classée, lecture du classement               |
| `src/ui/`     | Composants React, découpés comme le chap. 7 (bandeau, marché, soute, carte…)             |
| `sim/`        | Simulations (chap. 8) : bots, campagnes, rapports ; utilise `src/`, jamais l'inverse      |
| `functions/`  | Fonctions Cloudflare Pages (`/api/…`) : envoi des parties classées, lecture du classement |
| `server/`     | Code du serveur partagé par les fonctions et la vérification : schéma D1, contrôles       |
| `scripts/`    | Vérification des parties classées par rejeu (GitHub Actions)                              |

Données de jeu :

- **Le code fait foi pour les stats.** Prix, tags, coefficients, listes de production, capacités et valeurs de départ vivent dans `src/data/` et ont été retirés des docs, qui gardent les règles, les effets et le lore.
- Un effet chiffré encore décrit dans les docs (passif, service, formule, événement) migre dans `src/data/` ou `src/engine/` quand le moteur l'implémente, et disparaît alors des docs.
- `src/data/data.test.ts` vérifie la cohérence des données avec les règles du design (Tier 0 seul Légal, Production et Forte demande disjointes, carte connexe…).

Conventions du moteur :

- **Pureté :** une action produit un nouvel état, sans effet de bord. L'aléatoire passe par `createRng(state.rng)` et son état est réécrit dans `GameState`.
- **Transparence :** tout calcul affiché au joueur renvoie un `Breakdown` (total + lignes sourcées), pour le détail « zéro boîte noire » (chap. 7).
- **Unités :** probabilités et multiplicateurs en fractions (`0.25`), jauges sur l'échelle des docs (ICC 0–100), montants en ₡ entiers.

Traductions :

- **Un seul fichier par langue :** `src/i18n/fr.ts` est le catalogue de référence (tous les textes, indexés par les IDs des docs) ; `src/i18n/en.ts` en est la traduction, de même forme (`satisfies Messages` : toute clé manquante casse la compilation). Une nouvelle langue : copier `fr.ts`, traduire, l'ajouter à `locales` et à `LOCALE_NAMES` dans `src/i18n/index.ts`, et ses chiffres permis dans `i18n.test.ts`. Tout texte ajouté l'est dans chaque catalogue, dans le même changement ; le test vérifie que les listes (manuel, accueil, téléscripteur) ont la même longueur partout.
- **Langue au premier lancement :** `detectLocale(navigator.languages)`, la première langue du navigateur que le jeu parle, sinon l'anglais (`FALLBACK_LOCALE`). Le choix du joueur est retenu dans les réglages ; l'attribut `lang` de la page le suit.
- **Ponctuation par langue :** un intitulé suivi de deux-points passe par `t.format.label(texte)` (espace insécable avant en français, aucune en anglais), jamais un « : » écrit dans un composant.
- **Noms propres invariables :** un district, un lieu, un véhicule, un module, un produit ou un personnage garde partout son nom officiel, celui de son catalogue (« Hives », jamais « les Ruches » ; « The Glass Spire », jamais « la Flèche de Verre »). Un nom propre ne se traduit pas, même s'il a une traduction possible. Seule abréviation permise : le nom sans son complément entre guillemets (« la laverie », « le garage », « le Fourgon « Panacea-V8 » » plutôt que « la Panacea », qui est un district). Un sous-titre décrit, il ne traduit pas le nom.
- **D'une langue à l'autre :** restent tels quels les districts, les personnages, les marques entre guillemets (« Faraday », « Crypto-Clean », « Velvet-Silo », Synthanol, Tcherno-Bull) et les sigles (ICC, DSC, BRC). Se traduisent la partie descriptive d'un lieu ou d'un produit (« The “Faraday” garage », « Viktor Varga's Back Room », Quai 9 → Dock 9), les notions du jeu (Cash-Puce → Cash-Chip, fiche S → Watchlist), les fins, les modes et les paliers.
- **Aucun texte en dur dans les composants :** `const { t, credits, percent, label } = useI18n()`. Les nombres passent par les formateurs (`credits(2500)` → « 2 500 ₡ »), les lignes de `Breakdown` par `label(source)`.
- Le moteur ne manipule jamais de texte, seulement des IDs.

## Règles de code

Elles s'appliquent à tout le code, sans exception non justifiée. **Toute nouvelle règle adoptée s'ajoute ici** ; une exception assumée est expliquée en commentaire à l'endroit concerné.

**Général**

- Identifiants (types, fonctions, variables, fichiers) en anglais ; commentaires en français ; textes du jeu uniquement dans `src/i18n/`.
- Code complet : ni placeholder ni `TODO` dans le code commité.
- Docs à jour : toute règle décidée en codant (ordre de résolution, arrondi, cas limite) est écrite dans le chapitre concerné de `docs/`, dans le même commit (règle 6 de [README.md](README.md)).

**Où vivent les types et les constantes**

- `src/engine/types.ts` : le modèle du jeu partagé par tous les modules, c'est-à-dire les IDs, les entités décrites dans `src/data/` (`Product`, `District`, `Location`…) et l'état sauvegardé (`GameState` et ses sous-types de jeu).
- Ailleurs, un type vit avec la fonction qui le produit ou le consomme, et il est exporté si d'autres modules en ont besoin : `Action` dans `actions.ts`, `SaleQuote` dans `market.ts`, les props dans leur composant. C'est aussi le cas des briques techniques que l'état embarque, comme `Breakdown` (`breakdown.ts`) ou `RngState` (`rng.ts`) : elles restent avec leur implémentation.
- `src/data/balance.ts` : les nombres d'équilibrage (taux, seuils, durées, bornes des jauges), chacun citant son chapitre.
- `src/data/*.ts` (hors `balance.ts`) : les tables de contenu, une par famille d'entités (produits, tags, districts, lieux, véhicules).
- Aucun ID de donnée ni chiffre de règle en dur dans `src/engine/` ou `src/ui/` : une propriété de district, de lieu ou de produit se lit dans sa table. Seules exceptions : les constantes de présentation sans effet de jeu (couleurs, seuil visuel de marge), déclarées en tête du composant.

**Formules, docs et textes : un seul endroit, liés**

- Une formule n'existe qu'une fois, dans `src/engine/`. L'interface appelle la fonction du moteur (sanction d'une saisie, tendance publique, exposition de la soute…) et ne la recopie jamais, même simplifiée.
- Un texte de `src/i18n/` qui explique une règle reçoit ses valeurs en paramètres, lues dans `src/data/` : aucun chiffre de règle en dur. Un test (`i18n.test.ts`) refuse tout chiffre des textes d'interface hors liste blanche (horaires fixes, une unité, zéro, lore).
- Les textes longs (accueil, manuel) portent un balisage léger, `**gras**` et `*italique*`, que seul le composant `Rich` (`src/ui/shared/Rich.tsx`) interprète ; un test refuse tout balisage mal fermé. Les autres textes restent sans balisage : un libellé, un bouton ou un texte partagé hors du jeu s'afficherait avec ses astérisques.
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
- **Sauvegardes migrées :** depuis la première version publique (`PUBLIC_SAVE_VERSION` dans `gameStore.ts`), tout changement de forme d'un état sauvegardé incrémente la `version` de son store et ajoute une migration testée, qui convertit l'ancienne sauvegarde au lieu de l'effacer. Une sauvegarde plus ancienne que la version publique repart de zéro.

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
- États d'affichage : données, liste vide, erreur (bandeau d'erreur d'action, `ErrorBoundary` autour de l'application). Seul le classement est asynchrone : il a un état de chargement et un état hors ligne.

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

## Mise en ligne (Cloudflare, offre gratuite)

Le site et le classement tiennent dans l'offre gratuite de Cloudflare : le serveur ne fait que stocker et lire, la vérification des scores tourne sur GitHub Actions.

- **Site :** Cloudflare Pages, relié au dépôt GitHub. Build `npm run build`, dossier `dist`. Chaque déploiement est construit depuis un commit : son SHA (`CF_PAGES_COMMIT_SHA`) devient la **version des règles** que porte chaque partie classée (`RULES_VERSION`).
- **Classement :** les fonctions de `functions/api/` (Pages Functions) et une base **D1** liée sous le nom `DB` (réglages du projet Pages → Functions → liaisons D1). Trois tables, créées en collant `server/schema.sql` dans la console D1 (recoller le fichier ajoute les tables qui manquent, sans rien effacer) : `days` (la graine secrète et le sel de chaque jour), `starts` (les parties ouvertes, une par joueur et une par connexion, par jour et par mode) et `runs` (une ligne par joueur, jour et mode).
  - `POST /api/start` ouvre une partie classée : le serveur tire la graine du jour à la première ouverture (`randomSeed`), note l'ouverture du joueur et l'empreinte de sa connexion (SHA-256 de l'adresse `CF-Connecting-IP` salée du sel du jour), puis renvoie le jour et la graine. Une deuxième ouverture du même joueur, ou de la même connexion, dans le même mode le même jour, est refusée (`taken`, `connection`). Le jour est celui du serveur.
  - `POST /api/runs` enregistre une partie classée en attente (forme, date, une tentative par joueur, par jour et par mode), seulement si elle a été ouverte (`unstarted` sinon).
  - `GET /api/leaderboard` lit les scores vérifiés.
  - Un build local (`RULES_VERSION` à `dev`) n'appelle pas `/api/start` : sa partie classée tourne sur une graine publique tirée de la date (`localSeed`), et ne s'envoie jamais.
- **Vérification :** `.github/workflows/verify.yml` lance `scripts/verify.ts` toutes les heures. Il lit les parties en attente par l'API D1, avec la graine de leur jour (table `days`), rejoue chacune avec le moteur de **sa** version des règles (le commit de son SHA, extrait à part avec `git worktree`), puis inscrit le score obtenu ou rejette la partie. Il efface ensuite les ouvertures des jours clos, et avec elles les empreintes de connexion. La graine arrive au rejeu dans l'entrée de `scripts/replay.ts` : les règles plus anciennes, qui tiraient la graine de la date, ignorent ce champ. La version venant de l'envoi, seul un commit de la branche principale est rejoué, et sans les secrets de la tâche. Secrets du dépôt : `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` (droit D1 : modifier), `D1_DATABASE_ID`.
- **Aperçu de partage :** `index.html` porte les balises Open Graph et Twitter (titre, description, image `public/og.png` en 1200 × 630, adresse du site) qui composent la vignette d'un lien partagé. `docs/images/` garde les captures du README, prises sur une partie jouée par un bot, et l'aperçu en anglais (`og-en.png`) pour les annonces en anglais. Après un changement visible de l'interface, on les reprend.
- **Sans serveur** (`npm run dev`) : le jeu tourne, le classement affiche son état hors ligne, et une partie classée se joue mais ne s'envoie pas (version des règles `dev`).
