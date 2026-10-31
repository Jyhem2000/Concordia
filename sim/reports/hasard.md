# Campagne 3 — Poids du hasard

* Les plans de référence des campagnes 1 et 2 sur un grand nombre de graines : le score dépend-il plus du joueur que des tirages ?
* 1000 parties par bot, graines 1 à 1000.

| Bot | Parties | Survie | dont ruinés à 0 ₡ | Défaites | Fins | Score moyen | Score p10 / médiane / p90 | Score médian des survivants | Dette soldée (jour médian) | Interceptions | Jours de garde à vue | Équipement acheté |
| :--- | ---: | ---: | ---: | :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| Sans build · Prudent · score | 1000 | 88 % | 3 % | bio-bricks 12 % | standard 88 % | 24 420 ₡ | 0 ₡ / 22 735 ₡ / 52 181 ₡ | 26 499 ₡ | 92 % (J6) | 5.9 (20 % des trajets) | 1.5 | — |
| Couverture légale · Équilibré · score | 1000 | 86 % | 5 % | bio-bricks 14 % | standard 60 %, mafia 26 % | 90 974 ₡ | 0 ₡ / 61 218 ₡ / 238 178 ₡ | 79 958 ₡ | 93 % (J3) | 10.0 (32 % des trajets) | 2.9 | MOD-02 77 %, VEH-02 41 % |
| Rentier · Équilibré · score | 1000 | 83 % | 9 % | bio-bricks 17 % | standard 68 %, mafia 15 % | 63 180 ₡ | 0 ₡ / 29 060 ₡ / 178 050 ₡ | 57 955 ₡ | 89 % (J2) | 8.9 (34 % des trajets) | 2.8 | CREW-02 72 % |
| Haut tier · Casse-cou · score | 1000 | 71 % | 14 % | bio-bricks 26 %, execution 3 % | standard 43 %, mafia 28 % | 194 192 ₡ | 0 ₡ / 56 ₡ / 744 042 ₡ | 34 477 ₡ | 83 % (J2) | 10.6 (42 % des trajets) | 3.7 | MOD-07 56 %, VEH-04 42 %, MOD-10 40 % |
| Couverture légale · Équilibré · Baron | 1000 | 87 % | 5 % | bio-bricks 13 % | standard 59 %, mafia 27 % | 82 521 ₡ | 0 ₡ / 64 225 ₡ / 196 728 ₡ | 81 204 ₡ | 93 % (J3) | 9.6 (31 % des trajets) | 2.6 | MOD-02 77 %, VEH-02 41 % |

## Parcours type

Lu dans le carnet de route de chaque partie : patrimoine net médian (cash + offshore + placement − dette) au matin des jours repères, parmi les parties encore en cours ; jour médian du premier équipement ; moyennes par partie.

| Bot | Patrimoine J5 | Patrimoine J10 | Patrimoine J20 | Patrimoine J30 | 1er équipement | Contrôles avec pertes | Contrats livrés / manqués | Coups de filet |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Sans build · Prudent · score | 1 710 ₡ | 6 523 ₡ | 14 999 ₡ | 22 991 ₡ | — | 2.4 | 0.8 / 0.2 | 0.0 |
| Couverture légale · Équilibré · score | 8 062 ₡ | 18 386 ₡ | 45 594 ₡ | 67 879 ₡ | J6 | 4.0 | 0.6 / 0.3 | 0.2 |
| Rentier · Équilibré · score | 3 918 ₡ | 10 346 ₡ | 24 655 ₡ | 36 092 ₡ | J4 | 3.6 | 0.4 / 0.1 | 0.3 |
| Haut tier · Casse-cou · score | 1 547 ₡ | 181 ₡ | 172 ₡ | 337 ₡ | J7 | 4.7 | 0.2 / 0.1 | 0.1 |
| Couverture légale · Équilibré · Baron | 8 062 ₡ | 18 386 ₡ | 46 014 ₡ | 67 242 ₡ | J6 | 3.6 | 0.5 / 0.2 | 0.2 |

## Défauts relevés
Aucun : pas d’action refusée, pas de sommeil forcé, aucun invariant violé.

## Poids du hasard

| Bot | Score moyen | Écart-type entre graines | p10 / p90 |
| :--- | ---: | ---: | ---: |
| Sans build · Prudent · score | 24 420 ₡ | 20 921 ₡ | 0 ₡ / 52 181 ₡ |
| Couverture légale · Équilibré · score | 90 974 ₡ | 102 225 ₡ | 0 ₡ / 238 178 ₡ |
| Rentier · Équilibré · score | 63 180 ₡ | 78 225 ₡ | 0 ₡ / 178 050 ₡ |
| Haut tier · Casse-cou · score | 194 192 ₡ | 355 735 ₡ | 0 ₡ / 744 042 ₡ |
| Couverture légale · Équilibré · Baron | 82 521 ₡ | 81 204 ₡ | 0 ₡ / 196 728 ₡ |

Écart entre bots (écart-type des scores moyens) : **56 440 ₡** ; écart moyen entre graines : **127 662 ₡**.
Le hasard des graines pèse plus que le choix du plan et du tempérament.

### À graine égale

Part des graines où le bot de la ligne fait un meilleur score que celui de la colonne : mêmes tirages, seul le jeu change.

| Bot | 1 | 2 | 3 | 4 | 5 |
| :--- | ---: | ---: | ---: | ---: | ---: |
| 1. Sans build · Prudent · score | — | 34 % | 42 % | 52 % | 33 % |
| 2. Couverture légale · Équilibré · score | 63 % | — | 55 % | 53 % | 19 % |
| 3. Rentier · Équilibré · score | 54 % | 39 % | — | 46 % | 39 % |
| 4. Haut tier · Casse-cou · score | 40 % | 38 % | 41 % | — | 38 % |
| 5. Couverture légale · Équilibré · Baron | 64 % | 7 % | 56 % | 54 % | — |
