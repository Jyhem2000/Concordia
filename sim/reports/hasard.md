# Campagne 3 — Poids du hasard

* Les plans de référence des campagnes 1 et 2 sur un grand nombre de graines : le score dépend-il plus du joueur que des tirages ?
* 1000 parties par bot, graines 1 à 1000.

| Bot | Parties | Survie | dont ruinés à 0 ₡ | Défaites | Fins | Score moyen | Score p10 / médiane / p90 | Score médian des survivants | Dette soldée (jour médian) | Interceptions | Jours de garde à vue | Équipement acheté |
| :--- | ---: | ---: | ---: | :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| Sans build · Prudent · score | 1000 | 89 % | 3 % | bio-bricks 11 % | standard 89 % | 22 540 ₡ | 0 ₡ / 21 725 ₡ / 47 555 ₡ | 24 276 ₡ | 92 % (J5) | 6.2 (21 % des trajets) | 1.5 | — |
| Couverture légale · Équilibré · score | 1000 | 87 % | 7 % | bio-bricks 13 % | standard 63 %, mafia 24 % | 91 134 ₡ | 0 ₡ / 55 377 ₡ / 242 738 ₡ | 76 708 ₡ | 95 % (J3) | 10.2 (33 % des trajets) | 2.8 | MOD-02 77 %, VEH-02 42 % |
| Rentier · Équilibré · score | 1000 | 85 % | 9 % | bio-bricks 15 % | standard 73 %, mafia 12 % | 61 183 ₡ | 0 ₡ / 40 363 ₡ / 158 696 ₡ | 59 495 ₡ | 90 % (J3) | 9.0 (34 % des trajets) | 2.6 | CREW-02 75 % |
| Haut tier · Casse-cou · score | 1000 | 75 % | 17 % | bio-bricks 23 %, execution 1 % | standard 48 %, mafia 28 % | 164 742 ₡ | 0 ₡ / 84 ₡ / 657 552 ₡ | 8 978 ₡ | 84 % (J2) | 11.2 (44 % des trajets) | 3.5 | MOD-07 55 %, VEH-04 40 %, MOD-10 39 % |
| Couverture légale · Équilibré · Baron | 1000 | 88 % | 7 % | bio-bricks 12 % | standard 62 %, mafia 26 % | 82 514 ₡ | 0 ₡ / 58 539 ₡ / 200 145 ₡ | 78 870 ₡ | 95 % (J3) | 9.9 (32 % des trajets) | 2.5 | MOD-02 77 %, VEH-02 41 % |

## Parcours type

Lu dans le carnet de route de chaque partie : patrimoine net médian (cash + offshore + placement − dette) au matin des jours repères, parmi les parties encore en cours ; jour médian du premier équipement ; moyennes par partie.

| Bot | Patrimoine J5 | Patrimoine J10 | Patrimoine J20 | Patrimoine J30 | 1er équipement | Contrôles avec pertes | Contrats livrés / manqués | Coups de filet |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Sans build · Prudent · score | 1 807 ₡ | 6 163 ₡ | 15 334 ₡ | 21 879 ₡ | — | 2.6 | 0.9 / 0.2 | 0.0 |
| Couverture légale · Équilibré · score | 7 489 ₡ | 16 679 ₡ | 34 335 ₡ | 59 827 ₡ | J6 | 3.9 | 0.7 / 0.2 | 0.2 |
| Rentier · Équilibré · score | 3 692 ₡ | 12 868 ₡ | 31 828 ₡ | 41 615 ₡ | J5 | 3.6 | 0.5 / 0.1 | 0.3 |
| Haut tier · Casse-cou · score | 1 591 ₡ | 150 ₡ | 186 ₡ | 197 ₡ | J6 | 4.6 | 0.3 / 0.1 | 0.1 |
| Couverture légale · Équilibré · Baron | 7 489 ₡ | 16 679 ₡ | 36 306 ₡ | 60 506 ₡ | J6 | 3.5 | 0.6 / 0.2 | 0.2 |

## Défauts relevés
Aucun : pas d’action refusée, pas de sommeil forcé, aucun invariant violé.

## Poids du hasard

| Bot | Score moyen | Écart-type entre graines | p10 / p90 |
| :--- | ---: | ---: | ---: |
| Sans build · Prudent · score | 22 540 ₡ | 18 629 ₡ | 0 ₡ / 47 555 ₡ |
| Couverture légale · Équilibré · score | 91 134 ₡ | 109 268 ₡ | 0 ₡ / 242 738 ₡ |
| Rentier · Équilibré · score | 61 183 ₡ | 68 985 ₡ | 0 ₡ / 158 696 ₡ |
| Haut tier · Casse-cou · score | 164 742 ₡ | 295 912 ₡ | 0 ₡ / 657 552 ₡ |
| Couverture légale · Équilibré · Baron | 82 514 ₡ | 86 134 ₡ | 0 ₡ / 200 145 ₡ |

Écart entre bots (écart-type des scores moyens) : **46 625 ₡** ; écart moyen entre graines : **115 786 ₡**.
Le hasard des graines pèse plus que le choix du plan et du tempérament.

### À graine égale

Part des graines où le bot de la ligne fait un meilleur score que celui de la colonne : mêmes tirages, seul le jeu change.

| Bot | 1 | 2 | 3 | 4 | 5 |
| :--- | ---: | ---: | ---: | ---: | ---: |
| 1. Sans build · Prudent · score | — | 34 % | 38 % | 54 % | 33 % |
| 2. Couverture légale · Équilibré · score | 62 % | — | 54 % | 55 % | 18 % |
| 3. Rentier · Équilibré · score | 59 % | 41 % | — | 48 % | 41 % |
| 4. Haut tier · Casse-cou · score | 39 % | 37 % | 40 % | — | 37 % |
| 5. Couverture légale · Équilibré · Baron | 63 % | 8 % | 54 % | 55 % | — |
