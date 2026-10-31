# Campagne 3 — Poids du hasard

* Les plans de référence des campagnes 1 et 2 sur un grand nombre de graines : le score dépend-il plus du joueur que des tirages ?
* 1000 parties par bot, graines 1 à 1000.

| Bot | Parties | Survie | dont ruinés à 0 ₡ | Défaites | Fins | Score moyen | Score p10 / médiane / p90 | Score médian des survivants | Dette soldée (jour médian) | Interceptions | Jours de garde à vue | Équipement acheté |
| :--- | ---: | ---: | ---: | :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| Sans build · Prudent · score | 1000 | 88 % | 3 % | bio-bricks 12 % | standard 88 % | 22 633 ₡ | 0 ₡ / 20 353 ₡ / 49 438 ₡ | 23 910 ₡ | 92 % (J6) | 5.9 (20 % des trajets) | 1.6 | — |
| Couverture légale · Équilibré · score | 1000 | 84 % | 5 % | bio-bricks 16 % | standard 59 %, mafia 25 % | 94 176 ₡ | 0 ₡ / 60 961 ₡ / 249 749 ₡ | 88 449 ₡ | 93 % (J3) | 10.1 (32 % des trajets) | 2.8 | MOD-02 77 %, VEH-02 40 % |
| Rentier · Équilibré · score | 1000 | 84 % | 9 % | bio-bricks 16 % | standard 70 %, mafia 13 % | 62 436 ₡ | 0 ₡ / 33 966 ₡ / 169 393 ₡ | 56 295 ₡ | 89 % (J3) | 8.9 (34 % des trajets) | 2.7 | CREW-02 74 % |
| Haut tier · Casse-cou · score | 1000 | 73 % | 15 % | bio-bricks 25 %, execution 2 % | standard 42 %, mafia 31 % | 197 372 ₡ | 0 ₡ / 122 ₡ / 720 748 ₡ | 46 218 ₡ | 83 % (J2) | 11.1 (43 % des trajets) | 3.7 | MOD-07 59 %, VEH-04 43 %, MOD-10 43 % |
| Couverture légale · Équilibré · Baron | 1000 | 85 % | 5 % | bio-bricks 15 % | standard 58 %, mafia 27 % | 83 526 ₡ | 0 ₡ / 65 418 ₡ / 201 324 ₡ | 89 180 ₡ | 93 % (J3) | 9.6 (31 % des trajets) | 2.5 | MOD-02 77 %, VEH-02 39 % |

## Parcours type

Lu dans le carnet de route de chaque partie : patrimoine net médian (cash + offshore + placement − dette) au matin des jours repères, parmi les parties encore en cours ; jour médian du premier équipement ; moyennes par partie.

| Bot | Patrimoine J5 | Patrimoine J10 | Patrimoine J20 | Patrimoine J30 | 1er équipement | Contrôles avec pertes | Contrats livrés / manqués | Coups de filet |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Sans build · Prudent · score | 1 700 ₡ | 6 124 ₡ | 14 446 ₡ | 20 532 ₡ | — | 2.4 | 0.9 / 0.2 | 0.0 |
| Couverture légale · Équilibré · score | 7 195 ₡ | 17 286 ₡ | 44 328 ₡ | 67 811 ₡ | J6 | 3.9 | 0.6 / 0.2 | 0.2 |
| Rentier · Équilibré · score | 3 842 ₡ | 9 598 ₡ | 27 357 ₡ | 39 329 ₡ | J4 | 3.5 | 0.5 / 0.2 | 0.3 |
| Haut tier · Casse-cou · score | 1 884 ₡ | 375 ₡ | 245 ₡ | 495 ₡ | J6 | 4.8 | 0.3 / 0.1 | 0.1 |
| Couverture légale · Équilibré · Baron | 7 195 ₡ | 17 286 ₡ | 44 751 ₡ | 67 883 ₡ | J6 | 3.5 | 0.6 / 0.2 | 0.2 |

## Défauts relevés
Aucun : pas d’action refusée, pas de sommeil forcé, aucun invariant violé.

## Poids du hasard

| Bot | Score moyen | Écart-type entre graines | p10 / p90 |
| :--- | ---: | ---: | ---: |
| Sans build · Prudent · score | 22 633 ₡ | 19 534 ₡ | 0 ₡ / 49 438 ₡ |
| Couverture légale · Équilibré · score | 94 176 ₡ | 109 588 ₡ | 0 ₡ / 249 749 ₡ |
| Rentier · Équilibré · score | 62 436 ₡ | 76 583 ₡ | 0 ₡ / 169 393 ₡ |
| Haut tier · Casse-cou · score | 197 372 ₡ | 353 591 ₡ | 0 ₡ / 720 748 ₡ |
| Couverture légale · Équilibré · Baron | 83 526 ₡ | 83 102 ₡ | 0 ₡ / 201 324 ₡ |

Écart entre bots (écart-type des scores moyens) : **58 079 ₡** ; écart moyen entre graines : **128 480 ₡**.
Le hasard des graines pèse plus que le choix du plan et du tempérament.

### À graine égale

Part des graines où le bot de la ligne fait un meilleur score que celui de la colonne : mêmes tirages, seul le jeu change.

| Bot | 1 | 2 | 3 | 4 | 5 |
| :--- | ---: | ---: | ---: | ---: | ---: |
| 1. Sans build · Prudent · score | — | 33 % | 40 % | 51 % | 32 % |
| 2. Couverture légale · Équilibré · score | 64 % | — | 55 % | 51 % | 19 % |
| 3. Rentier · Équilibré · score | 55 % | 40 % | — | 45 % | 40 % |
| 4. Haut tier · Casse-cou · score | 43 % | 39 % | 42 % | — | 39 % |
| 5. Couverture légale · Équilibré · Baron | 65 % | 8 % | 55 % | 51 % | — |
