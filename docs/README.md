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
| 9 | [09-interface.md](09-interface.md) | Écrans et feedback |

## Règles de rédaction
1. **Un chiffre, un seul endroit.** Une valeur (prix, %, durée…) n'est écrite que là où la donnée est définie. Un bonus est écrit chez ce qui le produit (le module, le véhicule, l'événement…) ; les formules ne font que citer la source.
2. **IDs réservés aux données de jeu** — les entités qui auront des stats et des effets en base :

| ID | Donnée | Défini dans |
| :--- | :--- | :--- |
| `T0-01` … `T4-06` | Produits | chap. 3 |
| `TAG-*` | Tags | chap. 3 |
| `D1` … `D6` | Districts | chap. 4 |
| `LOC-Dx-y` | Lieux spéciaux | chap. 4 |
| `VEH-*`, `MOD-*`, `CREW-*` | Véhicules, modules, équipiers | chap. 5 |
| `EVT-G*`, `EVT-Dx-*`, `EVT-R*`, `EVT-L*` | Événements | chap. 8 |

3. Hors de son chapitre, une donnée à ID est citée **par son ID seul** (pas de libellé ni de stat recopiés).
4. Les montants en ₡ des services et frais sont des **valeurs de base au Jour 1**, indexées sur l'inflation (chap. 7).
5. Toute mécanique chiffrée doit être **affichée et détaillable** dans l'app (chap. 9) : le joueur ne calcule jamais, mais peut toujours comprendre.
6. Le lore, les factions (Aeterna, DSC, BRC…), les monnaies et les règles (garde à vue, couvre-feu…) s'écrivent en clair, sans ID.
