# Campagne 3 — Poids du hasard

* Les plans de référence des campagnes 1 et 2 sur un grand nombre de graines : le score dépend-il plus du joueur que des tirages ?
* 1000 parties par bot, graines 1 à 1000.

| Bot | Parties | Survie | dont ruinés à 0 ₡ | Défaites | Fins | Score moyen | Score p10 / médiane / p90 | Score médian des survivants | Dette soldée (jour médian) | Interceptions | Jours de garde à vue | Équipement acheté |
| :--- | ---: | ---: | ---: | :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| Sans build · Prudent · score | 1000 | 87 % | 3 % | bio-bricks 13 % | standard 87 % | 24 108 ₡ | 0 ₡ / 22 316 ₡ / 51 267 ₡ | 26 177 ₡ | 92 % (J6) | 5.9 (20 % des trajets) | 1.5 | — |
| Couverture légale · Équilibré · score | 1000 | 86 % | 4 % | bio-bricks 14 % | standard 60 %, mafia 26 % | 95 366 ₡ | 0 ₡ / 64 225 ₡ / 247 732 ₡ | 81 980 ₡ | 93 % (J3) | 10.0 (32 % des trajets) | 2.9 | MOD-02 77 %, VEH-02 41 % |
| Rentier · Équilibré · score | 1000 | 83 % | 9 % | bio-bricks 17 % | standard 68 %, mafia 16 % | 65 336 ₡ | 0 ₡ / 34 332 ₡ / 182 461 ₡ | 58 153 ₡ | 89 % (J2) | 8.9 (33 % des trajets) | 2.7 | CREW-02 73 % |
| Haut tier · Casse-cou · score | 1000 | 71 % | 14 % | bio-bricks 27 %, execution 3 % | standard 43 %, mafia 28 % | 192 564 ₡ | 0 ₡ / 50 ₡ / 752 432 ₡ | 35 625 ₡ | 83 % (J2) | 10.8 (42 % des trajets) | 3.7 | MOD-07 57 %, VEH-04 42 %, MOD-10 41 % |
| Couverture légale · Équilibré · Baron | 1000 | 87 % | 4 % | bio-bricks 13 % | standard 59 %, mafia 28 % | 85 117 ₡ | 0 ₡ / 69 283 ₡ / 196 323 ₡ | 83 628 ₡ | 93 % (J3) | 9.5 (31 % des trajets) | 2.5 | MOD-02 77 %, VEH-02 41 % |

## Parcours type

Lu dans le carnet de route de chaque partie : patrimoine net médian (cash + offshore + placement − dette) au matin des jours repères, parmi les parties encore en cours ; jour médian du premier équipement ; moyennes par partie.

| Bot | Patrimoine J5 | Patrimoine J10 | Patrimoine J20 | Patrimoine J30 | 1er équipement | Contrôles avec pertes | Contrats livrés / manqués | Coups de filet |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Sans build · Prudent · score | 1 710 ₡ | 6 465 ₡ | 14 996 ₡ | 22 782 ₡ | — | 2.4 | 0.8 / 0.2 | 0.0 |
| Couverture légale · Équilibré · score | 7 905 ₡ | 18 479 ₡ | 47 511 ₡ | 71 471 ₡ | J6 | 4.0 | 0.6 / 0.3 | 0.2 |
| Rentier · Équilibré · score | 4 019 ₡ | 10 692 ₡ | 25 357 ₡ | 37 969 ₡ | J4 | 3.5 | 0.4 / 0.2 | 0.3 |
| Haut tier · Casse-cou · score | 1 547 ₡ | 311 ₡ | 233 ₡ | 438 ₡ | J7 | 4.7 | 0.2 / 0.1 | 0.1 |
| Couverture légale · Équilibré · Baron | 7 905 ₡ | 18 479 ₡ | 49 009 ₡ | 71 471 ₡ | J6 | 3.5 | 0.5 / 0.2 | 0.2 |

## Défauts relevés
Aucun : pas d’action refusée, pas de sommeil forcé, aucun invariant violé.

## Poids du hasard

| Bot | Score moyen | Écart-type entre graines | p10 / p90 |
| :--- | ---: | ---: | ---: |
| Sans build · Prudent · score | 24 108 ₡ | 20 772 ₡ | 0 ₡ / 51 267 ₡ |
| Couverture légale · Équilibré · score | 95 366 ₡ | 108 067 ₡ | 0 ₡ / 247 732 ₡ |
| Rentier · Équilibré · score | 65 336 ₡ | 80 247 ₡ | 0 ₡ / 182 461 ₡ |
| Haut tier · Casse-cou · score | 192 564 ₡ | 351 577 ₡ | 0 ₡ / 752 432 ₡ |
| Couverture légale · Équilibré · Baron | 85 117 ₡ | 83 050 ₡ | 0 ₡ / 196 323 ₡ |

Écart entre bots (écart-type des scores moyens) : **55 661 ₡** ; écart moyen entre graines : **128 743 ₡**.
Le hasard des graines pèse plus que le choix du plan et du tempérament.

### À graine égale

Part des graines où le bot de la ligne fait un meilleur score que celui de la colonne : mêmes tirages, seul le jeu change.

| Bot | 1 | 2 | 3 | 4 | 5 |
| :--- | ---: | ---: | ---: | ---: | ---: |
| 1. Sans build · Prudent · score | — | 33 % | 41 % | 53 % | 32 % |
| 2. Couverture légale · Équilibré · score | 64 % | — | 55 % | 54 % | 21 % |
| 3. Rentier · Équilibré · score | 55 % | 39 % | — | 46 % | 39 % |
| 4. Haut tier · Casse-cou · score | 40 % | 38 % | 41 % | — | 38 % |
| 5. Couverture légale · Équilibré · Baron | 66 % | 7 % | 56 % | 54 % | — |
