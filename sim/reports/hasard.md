# Campagne 3 — Poids du hasard

* Les plans de référence des campagnes 1 et 2 sur un grand nombre de graines : le score dépend-il plus du joueur que des tirages ?
* 1000 parties par bot, graines 1 à 1000.

| Bot | Parties | Survie | dont ruinés à 0 ₡ | Défaites | Fins | Score moyen | Score p10 / médiane / p90 | Score médian des survivants | Dette soldée (jour médian) | Interceptions | Jours de garde à vue | Équipement acheté |
| :--- | ---: | ---: | ---: | :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| Sans build · Prudent · score | 1000 | 89 % | 2 % | bio-bricks 11 % | standard 89 % | 24 445 ₡ | 0 ₡ / 22 488 ₡ / 52 119 ₡ | 25 343 ₡ | 93 % (J6) | 6.0 (20 % des trajets) | 1.5 | — |
| Couverture légale · Équilibré · score | 1000 | 85 % | 5 % | bio-bricks 15 % | standard 62 %, mafia 23 % | 87 660 ₡ | 0 ₡ / 49 694 ₡ / 243 066 ₡ | 73 372 ₡ | 92 % (J3) | 10.0 (32 % des trajets) | 3.0 | MOD-02 76 %, VEH-02 42 % |
| Rentier · Équilibré · score | 1000 | 83 % | 9 % | bio-bricks 17 % | standard 68 %, mafia 15 % | 64 271 ₡ | 0 ₡ / 33 211 ₡ / 175 299 ₡ | 57 697 ₡ | 89 % (J3) | 8.9 (34 % des trajets) | 2.8 | CREW-02 73 % |
| Haut tier · Casse-cou · score | 1000 | 71 % | 16 % | bio-bricks 26 %, execution 3 % | standard 45 %, mafia 27 % | 158 663 ₡ | 0 ₡ / 51 ₡ / 613 594 ₡ | 29 193 ₡ | 84 % (J2) | 10.7 (43 % des trajets) | 3.8 | MOD-07 58 %, VEH-04 43 % |
| Couverture légale · Équilibré · Baron | 1000 | 86 % | 5 % | bio-bricks 14 % | standard 60 %, mafia 26 % | 79 884 ₡ | 0 ₡ / 55 699 ₡ / 197 937 ₡ | 75 421 ₡ | 92 % (J3) | 9.6 (32 % des trajets) | 2.6 | MOD-02 76 %, VEH-02 41 % |

## Parcours type

Lu dans le carnet de route de chaque partie : patrimoine net médian (cash + offshore + placement − dette) au matin des jours repères, parmi les parties encore en cours ; jour médian du premier équipement ; moyennes par partie.

| Bot | Patrimoine J5 | Patrimoine J10 | Patrimoine J20 | Patrimoine J30 | 1er équipement | Contrôles avec pertes | Contrats livrés / manqués | Coups de filet |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Sans build · Prudent · score | 1 711 ₡ | 6 713 ₡ | 15 685 ₡ | 22 561 ₡ | — | 2.4 | 0.8 / 0.2 | 0.0 |
| Couverture légale · Équilibré · score | 7 815 ₡ | 16 453 ₡ | 38 383 ₡ | 57 560 ₡ | J6 | 4.0 | 0.6 / 0.3 | 0.2 |
| Rentier · Équilibré · score | 3 896 ₡ | 10 888 ₡ | 25 357 ₡ | 37 194 ₡ | J4 | 3.5 | 0.4 / 0.1 | 0.3 |
| Haut tier · Casse-cou · score | 1 474 ₡ | 277 ₡ | 168 ₡ | 289 ₡ | J6 | 4.8 | 0.2 / 0.1 | 0.1 |
| Couverture légale · Équilibré · Baron | 7 815 ₡ | 16 453 ₡ | 41 224 ₡ | 57 979 ₡ | J6 | 3.5 | 0.5 / 0.2 | 0.2 |

## Défauts relevés
Aucun : pas d’action refusée, pas de sommeil forcé, aucun invariant violé.

## Poids du hasard

| Bot | Score moyen | Écart-type entre graines | p10 / p90 |
| :--- | ---: | ---: | ---: |
| Sans build · Prudent · score | 24 445 ₡ | 20 457 ₡ | 0 ₡ / 52 119 ₡ |
| Couverture légale · Équilibré · score | 87 660 ₡ | 106 368 ₡ | 0 ₡ / 243 066 ₡ |
| Rentier · Équilibré · score | 64 271 ₡ | 79 545 ₡ | 0 ₡ / 175 299 ₡ |
| Haut tier · Casse-cou · score | 158 663 ₡ | 298 204 ₡ | 0 ₡ / 613 594 ₡ |
| Couverture légale · Équilibré · Baron | 79 884 ₡ | 82 771 ₡ | 0 ₡ / 197 937 ₡ |

Écart entre bots (écart-type des scores moyens) : **43 671 ₡** ; écart moyen entre graines : **117 469 ₡**.
Le hasard des graines pèse plus que le choix du plan et du tempérament.

### À graine égale

Part des graines où le bot de la ligne fait un meilleur score que celui de la colonne : mêmes tirages, seul le jeu change.

| Bot | 1 | 2 | 3 | 4 | 5 |
| :--- | ---: | ---: | ---: | ---: | ---: |
| 1. Sans build · Prudent · score | — | 37 % | 43 % | 54 % | 36 % |
| 2. Couverture légale · Équilibré · score | 60 % | — | 53 % | 53 % | 17 % |
| 3. Rentier · Équilibré · score | 54 % | 41 % | — | 47 % | 41 % |
| 4. Haut tier · Casse-cou · score | 40 % | 38 % | 39 % | — | 38 % |
| 5. Couverture légale · Équilibré · Baron | 61 % | 9 % | 53 % | 53 % | — |
