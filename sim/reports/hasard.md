# Campagne 3 — Poids du hasard

* Les plans de référence des campagnes 1 et 2 sur un grand nombre de graines : le score dépend-il plus du joueur que des tirages ?
* 1000 parties par bot, graines 1 à 1000.

| Bot | Parties | Survie | dont ruinés à 0 ₡ | Défaites | Fins | Score moyen | Score p10 / médiane / p90 | Score médian des survivants | Dette soldée (jour médian) | Interceptions | Jours de garde à vue | Équipement acheté |
| :--- | ---: | ---: | ---: | :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| Sans build · Prudent · score | 1000 | 89 % | 3 % | bio-bricks 11 % | standard 89 % | 24 467 ₡ | 0 ₡ / 22 488 ₡ / 52 119 ₡ | 25 343 ₡ | 93 % (J6) | 6.0 (20 % des trajets) | 1.5 | — |
| Couverture légale · Équilibré · score | 1000 | 85 % | 6 % | bio-bricks 15 % | standard 62 %, mafia 23 % | 87 153 ₡ | 0 ₡ / 49 236 ₡ / 242 153 ₡ | 72 712 ₡ | 92 % (J3) | 10.0 (32 % des trajets) | 3.0 | MOD-02 76 %, VEH-02 42 % |
| Rentier · Équilibré · score | 1000 | 83 % | 9 % | bio-bricks 17 % | standard 68 %, mafia 15 % | 63 627 ₡ | 0 ₡ / 32 759 ₡ / 175 183 ₡ | 56 229 ₡ | 89 % (J3) | 8.9 (33 % des trajets) | 2.8 | CREW-02 73 % |
| Haut tier · Casse-cou · score | 1000 | 72 % | 16 % | bio-bricks 26 %, execution 3 % | standard 45 %, mafia 27 % | 158 661 ₡ | 0 ₡ / 46 ₡ / 619 065 ₡ | 33 647 ₡ | 84 % (J2) | 10.7 (43 % des trajets) | 3.8 | MOD-07 58 %, VEH-04 43 % |
| Couverture légale · Équilibré · Baron | 1000 | 87 % | 6 % | bio-bricks 14 % | standard 61 %, mafia 26 % | 79 929 ₡ | 0 ₡ / 55 668 ₡ / 198 261 ₡ | 75 145 ₡ | 92 % (J3) | 9.6 (32 % des trajets) | 2.6 | MOD-02 76 %, VEH-02 41 % |

## Parcours type

Lu dans le carnet de route de chaque partie : patrimoine net médian (cash + offshore + placement − dette) au matin des jours repères, parmi les parties encore en cours ; jour médian du premier équipement ; moyennes par partie.

| Bot | Patrimoine J5 | Patrimoine J10 | Patrimoine J20 | Patrimoine J30 | 1er équipement | Contrôles avec pertes | Contrats livrés / manqués | Coups de filet |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Sans build · Prudent · score | 1 711 ₡ | 6 713 ₡ | 15 685 ₡ | 22 561 ₡ | — | 2.4 | 0.8 / 0.2 | 0.0 |
| Couverture légale · Équilibré · score | 7 815 ₡ | 16 453 ₡ | 38 058 ₡ | 57 162 ₡ | J6 | 4.0 | 0.6 / 0.3 | 0.2 |
| Rentier · Équilibré · score | 3 896 ₡ | 11 047 ₡ | 25 357 ₡ | 35 389 ₡ | J4 | 3.5 | 0.4 / 0.1 | 0.3 |
| Haut tier · Casse-cou · score | 1 474 ₡ | 283 ₡ | 183 ₡ | 268 ₡ | J6 | 4.7 | 0.2 / 0.1 | 0.1 |
| Couverture légale · Équilibré · Baron | 7 815 ₡ | 16 453 ₡ | 40 988 ₡ | 57 681 ₡ | J6 | 3.5 | 0.5 / 0.2 | 0.2 |

## Défauts relevés
Aucun : pas d’action refusée, pas de sommeil forcé, aucun invariant violé.

## Poids du hasard

| Bot | Score moyen | Écart-type entre graines | p10 / p90 |
| :--- | ---: | ---: | ---: |
| Sans build · Prudent · score | 24 467 ₡ | 20 437 ₡ | 0 ₡ / 52 119 ₡ |
| Couverture légale · Équilibré · score | 87 153 ₡ | 106 047 ₡ | 0 ₡ / 242 153 ₡ |
| Rentier · Équilibré · score | 63 627 ₡ | 79 523 ₡ | 0 ₡ / 175 183 ₡ |
| Haut tier · Casse-cou · score | 158 661 ₡ | 298 117 ₡ | 0 ₡ / 619 065 ₡ |
| Couverture légale · Équilibré · Baron | 79 929 ₡ | 82 768 ₡ | 0 ₡ / 198 261 ₡ |

Écart entre bots (écart-type des scores moyens) : **43 709 ₡** ; écart moyen entre graines : **117 378 ₡**.
Le hasard des graines pèse plus que le choix du plan et du tempérament.

### À graine égale

Part des graines où le bot de la ligne fait un meilleur score que celui de la colonne : mêmes tirages, seul le jeu change.

| Bot | 1 | 2 | 3 | 4 | 5 |
| :--- | ---: | ---: | ---: | ---: | ---: |
| 1. Sans build · Prudent · score | — | 37 % | 43 % | 54 % | 36 % |
| 2. Couverture légale · Équilibré · score | 60 % | — | 54 % | 53 % | 16 % |
| 3. Rentier · Équilibré · score | 54 % | 41 % | — | 47 % | 40 % |
| 4. Haut tier · Casse-cou · score | 40 % | 37 % | 40 % | — | 37 % |
| 5. Couverture légale · Équilibré · Baron | 61 % | 9 % | 54 % | 53 % | — |
