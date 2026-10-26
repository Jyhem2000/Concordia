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
| `src/ui/`     | Composants React, découpés comme le chap. 9 (bandeau, marché, soute, carte…)             |

Données de jeu :

- **Le code fait foi pour les stats.** Prix, tags, coefficients, listes de production, capacités et valeurs de départ vivent dans `src/data/` et ont été retirés des docs, qui gardent les règles, les effets et le lore.
- Un effet chiffré encore décrit dans les docs (passif, service, formule, événement) migre dans `src/data/` ou `src/engine/` quand le moteur l'implémente, et disparaît alors des docs.
- `src/data/data.test.ts` vérifie la cohérence des données avec les règles du design (Tier 0 seul Légal, Production et Forte demande disjointes, carte connexe…).

Conventions du moteur :

- **Pureté :** une action produit un nouvel état, sans effet de bord. L'aléatoire passe par `createRng(state.rng)` et son état est réécrit dans `GameState`.
- **Transparence :** tout calcul affiché au joueur renvoie un `Breakdown` (total + lignes sourcées), pour le détail « zéro boîte noire » (chap. 9).
- **Unités :** probabilités et multiplicateurs en fractions (`0.25`), jauges sur l'échelle des docs (ICC 0–100), montants en ₡ entiers.

Traductions :

- **Un seul fichier par langue :** `src/i18n/fr.ts` est le catalogue de référence (tous les textes, indexés par les IDs des docs). L'anglais se fera en copiant ce fichier en `en.ts` (`satisfies Messages` : toute clé manquante casse la compilation), puis en l'ajoutant à `locales` dans `src/i18n/index.ts`.
- **Aucun texte en dur dans les composants :** `const { t, credits, percent, label } = useI18n()`. Les nombres passent par les formateurs (`credits(2500)` → « 2 500 ₡ »), les lignes de `Breakdown` par `label(source)`.
- Le moteur ne manipule jamais de texte, seulement des IDs.

## Scripts

| Commande               | Rôle                                 |
| :--------------------- | :----------------------------------- |
| `npm run dev`          | Serveur de dev                       |
| `npm run build`        | Vérification TypeScript + build      |
| `npm run lint`         | ESLint                               |
| `npm test`             | Tests Vitest (une passe)             |
| `npm run test:watch`   | Tests Vitest en continu              |
| `npm run format`       | Formate tout le projet avec Prettier |
| `npm run format:check` | Vérifie le formatage sans modifier   |
