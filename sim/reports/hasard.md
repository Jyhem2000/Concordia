# Campagne 3 — Poids du hasard

* Les plans de référence des campagnes 1 et 2 sur un grand nombre de graines : le score dépend-il plus du joueur que des tirages ?
* 1000 parties par bot, graines 1 à 1000.

| Bot | Parties | Survie | dont ruinés à 0 ₡ | Défaites | Fins | Score moyen | Score p10 / médiane / p90 | Score médian des survivants | Dette soldée (jour médian) | Interceptions | Jours de garde à vue | Équipement acheté |
| :--- | ---: | ---: | ---: | :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| Sans build · Prudent · score | 1000 | 89 % | 3 % | bio-bricks 11 % | standard 89 % | 22 540 ₡ | 0 ₡ / 21 725 ₡ / 47 555 ₡ | 24 276 ₡ | 92 % (J5) | 6.2 (21 % des trajets) | 1.5 | — |
| Couverture légale · Équilibré · score | 1000 | 90 % | 6 % | bio-bricks 10 % | standard 63 %, mafia 27 % | 98 891 ₡ | 0 ₡ / 68 582 ₡ / 245 967 ₡ | 86 552 ₡ | 95 % (J3) | 10.4 (33 % des trajets) | 2.7 | MOD-02 79 %, VEH-02 44 % |
| Rentier · Équilibré · score | 1000 | 85 % | 9 % | bio-bricks 15 % | standard 73 %, mafia 12 % | 61 096 ₡ | 0 ₡ / 39 923 ₡ / 159 875 ₡ | 60 214 ₡ | 89 % (J3) | 9.1 (34 % des trajets) | 2.6 | CREW-02 76 % |
| Haut tier · Casse-cou · score | 1000 | 74 % | 17 % | bio-bricks 25 %, execution 2 % | standard 46 %, mafia 28 % | 163 401 ₡ | 0 ₡ / 53 ₡ / 634 362 ₡ | 11 832 ₡ | 83 % (J2) | 11.3 (44 % des trajets) | 3.5 | MOD-07 55 %, VEH-04 40 %, MOD-10 39 % |
| Couverture légale · Équilibré · Baron | 1000 | 90 % | 6 % | bio-bricks 10 % | standard 61 %, mafia 30 % | 87 901 ₡ | 0 ₡ / 72 612 ₡ / 200 457 ₡ | 87 451 ₡ | 95 % (J3) | 9.9 (32 % des trajets) | 2.4 | MOD-02 79 %, VEH-02 44 % |

## Parcours type

Lu dans le carnet de route de chaque partie : patrimoine net médian (cash + offshore + placement − dette) au matin des jours repères, parmi les parties encore en cours ; jour médian du premier équipement ; moyennes par partie.

| Bot | Patrimoine J5 | Patrimoine J10 | Patrimoine J20 | Patrimoine J30 | 1er équipement | Contrôles avec pertes | Contrats livrés / manqués | Coups de filet |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Sans build · Prudent · score | 1 807 ₡ | 6 163 ₡ | 15 334 ₡ | 21 879 ₡ | — | 2.6 | 0.9 / 0.2 | 0.0 |
| Couverture légale · Équilibré · score | 7 483 ₡ | 16 964 ₡ | 47 096 ₡ | 73 274 ₡ | J6 | 3.9 | 0.7 / 0.2 | 0.2 |
| Rentier · Équilibré · score | 3 731 ₡ | 12 960 ₡ | 31 959 ₡ | 41 310 ₡ | J5 | 3.6 | 0.5 / 0.1 | 0.3 |
| Haut tier · Casse-cou · score | 1 393 ₡ | 148 ₡ | 178 ₡ | 192 ₡ | J6 | 4.6 | 0.3 / 0.1 | 0.1 |
| Couverture légale · Équilibré · Baron | 7 483 ₡ | 16 964 ₡ | 48 216 ₡ | 73 527 ₡ | J6 | 3.4 | 0.6 / 0.2 | 0.2 |

## Défauts relevés
Aucun : pas d’action refusée, pas de sommeil forcé, aucun invariant violé.

## Poids du hasard

| Bot | Score moyen | Écart-type entre graines | p10 / p90 |
| :--- | ---: | ---: | ---: |
| Sans build · Prudent · score | 22 540 ₡ | 18 629 ₡ | 0 ₡ / 47 555 ₡ |
| Couverture légale · Équilibré · score | 98 891 ₡ | 112 208 ₡ | 0 ₡ / 245 967 ₡ |
| Rentier · Équilibré · score | 61 096 ₡ | 68 813 ₡ | 0 ₡ / 159 875 ₡ |
| Haut tier · Casse-cou · score | 163 401 ₡ | 295 428 ₡ | 0 ₡ / 634 362 ₡ |
| Couverture légale · Équilibré · Baron | 87 901 ₡ | 85 552 ₡ | 0 ₡ / 200 457 ₡ |

Écart entre bots (écart-type des scores moyens) : **46 487 ₡** ; écart moyen entre graines : **116 126 ₡**.
Le hasard des graines pèse plus que le choix du plan et du tempérament.

### À graine égale

Part des graines où le bot de la ligne fait un meilleur score que celui de la colonne : mêmes tirages, seul le jeu change.

| Bot | 1 | 2 | 3 | 4 | 5 |
| :--- | ---: | ---: | ---: | ---: | ---: |
| 1. Sans build · Prudent · score | — | 31 % | 38 % | 54 % | 31 % |
| 2. Couverture légale · Équilibré · score | 66 % | — | 58 % | 57 % | 20 % |
| 3. Rentier · Équilibré · score | 59 % | 37 % | — | 48 % | 38 % |
| 4. Haut tier · Casse-cou · score | 39 % | 36 % | 40 % | — | 36 % |
| 5. Couverture légale · Équilibré · Baron | 66 % | 10 % | 58 % | 57 % | — |
