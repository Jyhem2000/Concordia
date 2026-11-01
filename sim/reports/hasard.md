# Campagne 3 — Poids du hasard

* Les plans de référence des campagnes 1 et 2 sur un grand nombre de graines : le score dépend-il plus du joueur que des tirages ?
* 1000 parties par bot, graines 1 à 1000.

| Bot | Parties | Survie | dont ruinés à 0 ₡ | Défaites | Fins | Score moyen | Score p10 / médiane / p90 | Score médian des survivants | Dette soldée (jour médian) | Interceptions | Jours de garde à vue | Équipement acheté |
| :--- | ---: | ---: | ---: | :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| Sans build · Prudent · score | 1000 | 88 % | 3 % | bio-bricks 12 % | standard 88 % | 22 994 ₡ | 0 ₡ / 21 879 ₡ / 49 319 ₡ | 25 116 ₡ | 92 % (J5) | 6.1 (20 % des trajets) | 1.6 | — |
| Couverture légale · Équilibré · score | 1000 | 86 % | 5 % | bio-bricks 14 % | standard 61 %, mafia 25 % | 94 820 ₡ | 0 ₡ / 60 747 ₡ / 256 289 ₡ | 84 516 ₡ | 94 % (J3) | 10.0 (32 % des trajets) | 2.8 | MOD-02 78 %, VEH-02 42 % |
| Rentier · Équilibré · score | 1000 | 84 % | 8 % | bio-bricks 16 % | standard 70 %, mafia 14 % | 65 817 ₡ | 0 ₡ / 40 572 ₡ / 175 038 ₡ | 62 179 ₡ | 90 % (J3) | 9.0 (34 % des trajets) | 2.7 | CREW-02 75 % |
| Haut tier · Casse-cou · score | 1000 | 73 % | 17 % | bio-bricks 25 %, execution 2 % | standard 45 %, mafia 28 % | 174 569 ₡ | 0 ₡ / 62 ₡ / 665 989 ₡ | 18 486 ₡ | 85 % (J2) | 11.1 (43 % des trajets) | 3.8 | MOD-07 57 %, MOD-10 42 %, VEH-04 40 % |
| Couverture légale · Équilibré · Baron | 1000 | 88 % | 5 % | bio-bricks 12 % | standard 60 %, mafia 27 % | 84 592 ₡ | 0 ₡ / 66 185 ₡ / 200 712 ₡ | 85 637 ₡ | 94 % (J3) | 9.6 (31 % des trajets) | 2.5 | MOD-02 78 %, VEH-02 42 % |

## Parcours type

Lu dans le carnet de route de chaque partie : patrimoine net médian (cash + offshore + placement − dette) au matin des jours repères, parmi les parties encore en cours ; jour médian du premier équipement ; moyennes par partie.

| Bot | Patrimoine J5 | Patrimoine J10 | Patrimoine J20 | Patrimoine J30 | 1er équipement | Contrôles avec pertes | Contrats livrés / manqués | Coups de filet |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Sans build · Prudent · score | 1 644 ₡ | 6 304 ₡ | 14 742 ₡ | 22 143 ₡ | — | 2.5 | 0.9 / 0.2 | 0.0 |
| Couverture légale · Équilibré · score | 7 643 ₡ | 15 904 ₡ | 42 264 ₡ | 68 642 ₡ | J6 | 3.9 | 0.7 / 0.2 | 0.2 |
| Rentier · Équilibré · score | 3 488 ₡ | 12 184 ₡ | 32 249 ₡ | 43 493 ₡ | J5 | 3.5 | 0.5 / 0.1 | 0.3 |
| Haut tier · Casse-cou · score | 1 618 ₡ | 435 ₡ | 238 ₡ | 300 ₡ | J7 | 4.7 | 0.3 / 0.1 | 0.1 |
| Couverture légale · Équilibré · Baron | 7 643 ₡ | 15 904 ₡ | 42 378 ₡ | 68 327 ₡ | J6 | 3.5 | 0.6 / 0.2 | 0.2 |

## Défauts relevés
Aucun : pas d’action refusée, pas de sommeil forcé, aucun invariant violé.

## Poids du hasard

| Bot | Score moyen | Écart-type entre graines | p10 / p90 |
| :--- | ---: | ---: | ---: |
| Sans build · Prudent · score | 22 994 ₡ | 19 224 ₡ | 0 ₡ / 49 319 ₡ |
| Couverture légale · Équilibré · score | 94 820 ₡ | 110 401 ₡ | 0 ₡ / 256 289 ₡ |
| Rentier · Équilibré · score | 65 817 ₡ | 77 949 ₡ | 0 ₡ / 175 038 ₡ |
| Haut tier · Casse-cou · score | 174 569 ₡ | 319 621 ₡ | 0 ₡ / 665 989 ₡ |
| Couverture légale · Équilibré · Baron | 84 592 ₡ | 84 267 ₡ | 0 ₡ / 200 712 ₡ |

Écart entre bots (écart-type des scores moyens) : **49 535 ₡** ; écart moyen entre graines : **122 292 ₡**.
Le hasard des graines pèse plus que le choix du plan et du tempérament.

### À graine égale

Part des graines où le bot de la ligne fait un meilleur score que celui de la colonne : mêmes tirages, seul le jeu change.

| Bot | 1 | 2 | 3 | 4 | 5 |
| :--- | ---: | ---: | ---: | ---: | ---: |
| 1. Sans build · Prudent · score | — | 34 % | 37 % | 55 % | 33 % |
| 2. Couverture légale · Équilibré · score | 63 % | — | 54 % | 55 % | 20 % |
| 3. Rentier · Équilibré · score | 58 % | 41 % | — | 48 % | 41 % |
| 4. Haut tier · Casse-cou · score | 39 % | 36 % | 39 % | — | 37 % |
| 5. Couverture légale · Équilibré · Baron | 64 % | 7 % | 54 % | 56 % | — |
