# Campagne 3 — Poids du hasard

* Les plans de référence des campagnes 1 et 2 sur un grand nombre de graines : le score dépend-il plus du joueur que des tirages ?
* 1000 parties par bot, graines 1 à 1000.

| Bot | Parties | Survie | dont ruinés à 0 ₡ | Défaites | Fins | Score moyen | Score p10 / médiane / p90 | Score médian des survivants | Dette soldée (jour médian) | Interceptions | Jours de garde à vue | Équipement acheté |
| :--- | ---: | ---: | ---: | :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| Sans build · Prudent · score | 1000 | 89 % | 2 % | bio-bricks 11 % | standard 89 % | 24 445 ₡ | 0 ₡ / 22 488 ₡ / 52 119 ₡ | 25 343 ₡ | 93 % (J6) | 6.0 (20 % des trajets) | 1.5 | — |
| Couverture légale · Équilibré · score | 1000 | 85 % | 6 % | bio-bricks 15 % | standard 62 %, mafia 23 % | 87 538 ₡ | 0 ₡ / 49 236 ₡ / 243 157 ₡ | 71 602 ₡ | 92 % (J3) | 10.0 (32 % des trajets) | 3.0 | MOD-02 76 %, VEH-02 42 % |
| Rentier · Équilibré · score | 1000 | 83 % | 9 % | bio-bricks 17 % | standard 68 %, mafia 15 % | 64 271 ₡ | 0 ₡ / 33 211 ₡ / 175 299 ₡ | 57 697 ₡ | 89 % (J3) | 8.9 (34 % des trajets) | 2.8 | CREW-02 73 % |
| Haut tier · Casse-cou · score | 1000 | 73 % | 15 % | bio-bricks 25 %, execution 3 % | standard 45 %, mafia 28 % | 178 396 ₡ | 0 ₡ / 130 ₡ / 634 413 ₡ | 35 377 ₡ | 84 % (J2) | 10.9 (43 % des trajets) | 3.8 | MOD-07 55 %, VEH-04 41 %, MOD-10 40 % |
| Couverture légale · Équilibré · Baron | 1000 | 87 % | 6 % | bio-bricks 13 % | standard 61 %, mafia 26 % | 79 820 ₡ | 0 ₡ / 55 332 ₡ / 199 122 ₡ | 74 100 ₡ | 92 % (J3) | 9.6 (32 % des trajets) | 2.6 | MOD-02 76 %, VEH-02 41 % |

## Parcours type

Lu dans le carnet de route de chaque partie : patrimoine net médian (cash + offshore + placement − dette) au matin des jours repères, parmi les parties encore en cours ; jour médian du premier équipement ; moyennes par partie.

| Bot | Patrimoine J5 | Patrimoine J10 | Patrimoine J20 | Patrimoine J30 | 1er équipement | Contrôles avec pertes | Contrats livrés / manqués | Coups de filet |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Sans build · Prudent · score | 1 711 ₡ | 6 713 ₡ | 15 685 ₡ | 22 561 ₡ | — | 2.4 | 0.8 / 0.2 | 0.0 |
| Couverture légale · Équilibré · score | 7 815 ₡ | 16 734 ₡ | 37 771 ₡ | 55 699 ₡ | J6 | 4.0 | 0.6 / 0.2 | 0.2 |
| Rentier · Équilibré · score | 3 896 ₡ | 10 888 ₡ | 25 357 ₡ | 37 194 ₡ | J4 | 3.5 | 0.4 / 0.1 | 0.3 |
| Haut tier · Casse-cou · score | 1 387 ₡ | 203 ₡ | 158 ₡ | 350 ₡ | J7 | 4.8 | 0.2 / 0.1 | 0.1 |
| Couverture légale · Équilibré · Baron | 7 815 ₡ | 16 734 ₡ | 40 513 ₡ | 57 131 ₡ | J6 | 3.5 | 0.5 / 0.2 | 0.2 |

## Défauts relevés
Aucun : pas d’action refusée, pas de sommeil forcé, aucun invariant violé.

## Poids du hasard

| Bot | Score moyen | Écart-type entre graines | p10 / p90 |
| :--- | ---: | ---: | ---: |
| Sans build · Prudent · score | 24 445 ₡ | 20 457 ₡ | 0 ₡ / 52 119 ₡ |
| Couverture légale · Équilibré · score | 87 538 ₡ | 106 398 ₡ | 0 ₡ / 243 157 ₡ |
| Rentier · Équilibré · score | 64 271 ₡ | 79 545 ₡ | 0 ₡ / 175 299 ₡ |
| Haut tier · Casse-cou · score | 178 396 ₡ | 340 445 ₡ | 0 ₡ / 634 413 ₡ |
| Couverture légale · Équilibré · Baron | 79 820 ₡ | 83 063 ₡ | 0 ₡ / 199 122 ₡ |

Écart entre bots (écart-type des scores moyens) : **50 665 ₡** ; écart moyen entre graines : **125 982 ₡**.
Le hasard des graines pèse plus que le choix du plan et du tempérament.

### À graine égale

Part des graines où le bot de la ligne fait un meilleur score que celui de la colonne : mêmes tirages, seul le jeu change.

| Bot | 1 | 2 | 3 | 4 | 5 |
| :--- | ---: | ---: | ---: | ---: | ---: |
| 1. Sans build · Prudent · score | — | 37 % | 43 % | 53 % | 36 % |
| 2. Couverture légale · Équilibré · score | 59 % | — | 53 % | 52 % | 17 % |
| 3. Rentier · Équilibré · score | 54 % | 41 % | — | 46 % | 41 % |
| 4. Haut tier · Casse-cou · score | 41 % | 38 % | 41 % | — | 38 % |
| 5. Couverture légale · Équilibré · Baron | 61 % | 8 % | 53 % | 52 % | — |
