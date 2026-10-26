# Concordia

Simulation économique satirique (Drug Wars-like). Game design : [docs/](docs/README.md).

## Stack

- React 19 + TypeScript + Vite, avec le React Compiler (pas de `useMemo` / `useCallback` manuels)
- Tailwind CSS v4 (config CSS-first dans `src/index.css`, un seul thème, pas de variantes `dark:`)
- Zustand + middleware `persist` pour l'état et la sauvegarde (`src/stores/`)
- Motion (ex-Framer Motion) pour les animations : `import { motion } from 'motion/react'`
- lucide-react pour les icônes

## Scripts

| Commande               | Rôle                                 |
| :--------------------- | :----------------------------------- |
| `npm run dev`          | Serveur de dev                       |
| `npm run build`        | Vérification TypeScript + build      |
| `npm run lint`         | ESLint                               |
| `npm run format`       | Formate tout le projet avec Prettier |
| `npm run format:check` | Vérifie le formatage sans modifier   |
