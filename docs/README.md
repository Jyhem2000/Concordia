# CONCORDIA · Game Design

## Fiche d'identité
- **Genre :** Simulation économique satirique / Gestion de risques (Drug Wars-like).
- **Plateformes :** Navigateur Web & Mobile (responsive portrait/paysage), portée internationale (i18n).
- **Ton :** Satire mordante, humour noir, paranoïa bureaucratique, dystopie algorithmique (Brazil, Papers Please, South Park, Black Mirror, Demolition Man).

## Chapitres
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
| 9 | [09-simulation.md](09-simulation.md) | Bots de test (plan × tempérament × objectif), campagnes, critères d'équilibrage |
| 10 | [10-interface.md](10-interface.md) | Écrans et feedback |

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
| `EVT-G*`, `EVT-Dx-*`, `EVT-R*`, `EVT-L*` | Événements | chap. 8 | — |

Constantes globales (valeurs de départ…) : [`balance.ts`](../src/data/balance.ts).

3. Hors de son chapitre, une donnée à ID est citée **par son ID seul** (pas de libellé ni de stat recopiés).
4. Les montants en ₡ des services et frais sont des **valeurs de base au Jour 1**, indexées sur l'inflation (chap. 7).
5. Toute mécanique chiffrée doit être **affichée et détaillable** dans l'app (chap. 10) : le joueur ne calcule jamais, mais peut toujours comprendre.
6. Le lore, les factions (Aeterna, DSC, BRC…), les monnaies et les règles (garde à vue, couvre-feu…) s'écrivent en clair, sans ID.
7. **Les docs décrivent toutes les règles.** Développeur ou joueur, on doit comprendre le jeu sans lire le code. Toute décision prise en codant (ordre de résolution, arrondi, cas limite, interprétation d'une règle ambiguë) est écrite dans le chapitre concerné, dans le même changement. Seuls les chiffres vivent dans le code (règle 1).
8. **Relecture critique avant chaque étape.** Avant d'implémenter un chapitre, on le relit et on le remet en cause : mécanique impossible ou bugguée, gameplay sans intérêt, lore incohérent, règle déjà contredite par le code. Les corrections sont tranchées et écrites avant de coder.
