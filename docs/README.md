# CONCORDIA · Game Design

## Fiche d'identité
- **Genre :** Simulation économique satirique / Gestion de risques (Drug Wars-like).
- **Plateformes :** Navigateur Web & Mobile (responsive portrait/paysage), portée internationale (i18n).
- **Ton :** Satire mordante, humour noir, paranoïa bureaucratique, dystopie algorithmique (Brazil, Papers Please, South Park, Black Mirror, Demolition Man).

## Chapitres
Les chapitres 1 à 8 décrivent le jeu : univers, règles, données. Les chapitres 9 et 10 décrivent sa production : l'équilibrage par simulation et l'interface.

| # | Fichier | Contenu |
| :---: | :--- | :--- |
| 1 | [01-univers.md](01-univers.md) | Monde, factions, piliers du quotidien, rôle du joueur |
| 2 | [02-joueur.md](02-joueur.md) | Objectif, jauges, déroulé d'une journée, fins de partie |
| 3 | [03-produits.md](03-produits.md) | Tags, tiers, catalogue des produits |
| 4 | [04-districts.md](04-districts.md) | Règles géographiques, districts, lieux spéciaux |
| 5 | [05-vehicule.md](05-vehicule.md) | Véhicules, modules, équipage |
| 6 | [06-interception.md](06-interception.md) | Risque, choix tactiques, garde à vue |
| 7 | [07-economie.md](07-economie.md) | Boutique, cours, vente, portefeuilles, routes |
| 8 | [08-evenements.md](08-evenements.md) | Événements globaux, locaux, aléas routiers |
| 9 | [09-simulation.md](09-simulation.md) | Bots de test (plan × tempérament × objectif), routes de référence, campagnes, critères d'équilibrage |
| 10 | [10-interface.md](10-interface.md) | Écrans et feedback |

## Où trouver une règle
Une mécanique touche souvent plusieurs chapitres : chacun écrit la part qui le concerne et renvoie aux autres. Ce tableau donne le chemin, dans l'ordre de lecture.

| Question | Où lire |
| :--- | :--- |
| Comment gagner, comment perdre ? | chap. 2 (audit, défaites, grandes fins) → chap. 7 (dette, compte offshore) |
| Comment se déroule une journée ? | chap. 2 (moments, routine de 06h00, dilemme de 20h00, demi-journée perdue) |
| Que se passe-t-il pendant un trajet ? | chap. 2 (ordre de résolution) → chap. 4 (carte, districts traversés, zone hors-réseau) → chap. 6 (risque, barrage fixe ou contrôle volant) → chap. 8 (aléas routiers, effets d'arrivée) |
| Comment se résout un contrôle ? | chap. 6 (options, sanctions, garde à vue) → chap. 3 (tags, masquage, actions des produits) → chap. 4 (racket des milices) |
| D'où vient un cours, un prix de vente ? | chap. 7 (cours, tendance, quota, prix de vente, savoir-faire) → chap. 8 (événements, contrecoups, vices de la Loterie) → chap. 3 (fraîcheur, casse) |
| Que vaut une caisse donnée en paiement ? | chap. 7 (paiement en nature) → chap. 3 (état des caisses) |
| Que coûte et que rapporte un produit ? | chap. 3 (tags, actions) ; fiche produit en jeu (chap. 10) |
| Où emprunter, déposer, revendre ? | chap. 4 (lieux spéciaux) → chap. 7 (portefeuilles) |
| Comment évoluent ICC, Santé, châssis, carburant ? | chap. 2 (jauges) → chap. 5 (véhicule) |
| Qu'est-ce qui est prévisible ? | chap. 7 (mémoire de marché, tendance) → chap. 8 (rumeurs, contrecoups, Loterie) → chap. 6 (ronde renforcée, cachée) |

## État d'implémentation
Les docs décrivent le jeu complet ; tout n'est pas encore en jeu. Ce tableau dit ce qui l'est, chapitre par chapitre, et se met à jour à chaque étape.

| Chap. | En jeu | À venir |
| :---: | :--- | :--- |
| 2 | Jauges (ICC, Santé, châssis, carburant), journée, couvre-feu, épuisement, demi-journée perdue, dépannage, audit et fins | Exemption Métabolique et Sédation, pompes officielles fermées la nuit |
| 3 | Tags, masquage, fraîcheur, casse, explosions, actions des produits | — |
| 4 | Carte, districts, racket et portique de `[D4]`, `[LOC-D1-1]` (dette, Hachoir), `[LOC-D5-1]` (compte offshore) | `[LOC-D1-2]`, `[LOC-D2-1]`, `[LOC-D3-1]`, `[LOC-D4-1]`, `[LOC-D4-2]`, `[LOC-D6-1]`, falsification de la Loterie |
| 5 | `[VEH-01]` | Autres véhicules, modules, équipage et salaires |
| 6 | Risque, Fiche S, barrage fixe et contrôle volant, toutes les options, garde à vue | Bonus de modules et d'équipiers |
| 7 | Boutique, cours et tendance, quotas, prix de vente, paiement en nature, inflation, dette, avance de survie, collecte, compte offshore | Bonus d'influence (`[LOC-D2-1]`), flux de `[CREW-02]` |
| 8 | Événements globaux et locaux, rumeurs, contrecoups, Loterie, aléas routiers | Effets liés aux modules, à l'équipage et aux lieux à venir (chap. 8, règles communes) |
| 9 | — | Simulations, une fois le jeu complet |
| 10 | Bandeau, téléscripteur, marché et fiche produit, carte, lieux, soir, briefing, barrage, aléa routier, objectifs | Vue véhicule et soute, filtres du marché, dégradation de l'interface selon l'ICC, manuel en jeu |

## Règles de rédaction
1. **Un chiffre, un seul endroit.** Une valeur (prix, %, durée…) n'est écrite que là où la donnée est définie. Un bonus est écrit chez ce qui le produit (le module, le véhicule, l'événement…) ; les formules ne font que citer la source.
   * **Le code fait foi pour les stats.** Les caractéristiques des données de jeu (prix, tags, coefficients, listes de production, capacités, valeurs de départ…) vivent dans `src/data/` et n'apparaissent plus dans ces docs, qui gardent les règles, les effets et le lore.
   * Un effet chiffré encore décrit ici (passif, service, formule, événement) migre dans le code quand le moteur l'implémente, et disparaît alors des docs.
   * Les exemples chiffrés sont des illustrations : en cas d'écart, le code fait foi.
   * Les textes affichés en jeu (noms, messages) sont dans `src/i18n/fr.ts`. Les noms restent cités ici pour la lisibilité.
2. **IDs réservés aux données de jeu** — les entités qui ont des stats et des effets :

| ID | Donnée | Règles | Stats (font foi) |
| :--- | :--- | :--- | :--- |
| `T0-01` … `T4-06` | Produits et tiers | chap. 3 | [`products.ts`](../src/data/products.ts) |
| `TAG-*` | Tags | chap. 3 | [`tags.ts`](../src/data/tags.ts) |
| `D1` … `D6` | Districts et carte | chap. 4 | [`districts.ts`](../src/data/districts.ts) |
| `LOC-Dx-y` | Lieux spéciaux | chap. 4 | [`locations.ts`](../src/data/locations.ts) |
| `VEH-*`, `MOD-*`, `CREW-*` | Véhicules, modules, équipiers | chap. 5 | [`vehicles.ts`](../src/data/vehicles.ts) |
| `EVT-G*`, `EVT-Dx-*`, `EVT-R*`, `EVT-L*` | Événements | chap. 8 | [`events.ts`](../src/data/events.ts) |

Constantes globales (valeurs de départ…) : [`balance.ts`](../src/data/balance.ts).

3. Hors de son chapitre, une donnée à ID est citée **par son ID seul** (pas de libellé ni de stat recopiés).
4. Les montants en ₡ des services et frais sont des **valeurs de base au Jour 1**, indexées sur l'inflation (chap. 7).
5. Toute mécanique chiffrée doit être **affichée et détaillable** dans l'app (chap. 10) : le joueur ne calcule jamais, mais peut toujours comprendre.
6. Le lore, les factions (Aeterna, DSC, BRC…), les monnaies et les règles (garde à vue, couvre-feu…) s'écrivent en clair, sans ID.
7. **Les docs décrivent toutes les règles.** Développeur ou joueur, on doit comprendre le jeu sans lire le code. Toute décision prise en codant (ordre de résolution, arrondi, cas limite, interprétation d'une règle ambiguë) est écrite dans le chapitre concerné, dans le même changement. Seuls les chiffres vivent dans le code (règle 1).
8. **Relecture critique avant chaque étape.** Avant d'implémenter un chapitre, on le relit et on le remet en cause : mécanique impossible ou bugguée, gameplay sans intérêt, lore incohérent, règle déjà contredite par le code. Les corrections sont tranchées et écrites avant de coder.
9. **L'état d'implémentation** (plus haut) se met à jour dans le même changement que le code qui fait entrer une mécanique en jeu.
