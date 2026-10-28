# Campagne 3 — Poids du hasard

* Les plans de référence des campagnes 1 et 2 sur un grand nombre de graines : le score dépend-il plus du joueur que des tirages ?
* 1000 parties par bot, graines 1 à 1000.

| Bot | Parties | Survie | Défaites | Fins | Score moyen | Score p10 / médiane / p90 | Score médian des survivants | Dette soldée (jour médian) | Interceptions | Jours de garde à vue | Équipement acheté |
| :--- | ---: | ---: | :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| Sans build · Prudent · score | 1000 | 88 % | bio-bricks 12 % | standard 88 % | 19 975 ₡ | 0 ₡ / 19 579 ₡ / 41 458 ₡ | 22 030 ₡ | 89 % (J6) | 5.9 (20 % des trajets) | 1.2 | — |
| Couverture légale · Équilibré · score | 1000 | 81 % | bio-bricks 19 % | standard 72 %, mafia 9 % | 68 513 ₡ | 0 ₡ / 38 931 ₡ / 182 301 ₡ | 61 860 ₡ | 90 % (J3) | 9.8 (34 % des trajets) | 2.8 | MOD-02 71 %, VEH-02 34 % |
| Rentier · Équilibré · score | 1000 | 81 % | bio-bricks 19 % | standard 78 %, mafia 3 % | 50 827 ₡ | 0 ₡ / 26 787 ₡ / 148 352 ₡ | 48 030 ₡ | 86 % (J3) | 9.0 (35 % des trajets) | 2.6 | CREW-02 68 % |
| Haut tier · Casse-cou · score | 1000 | 71 % | bio-bricks 27 %, execution 2 % | standard 48 %, mafia 23 %, elite 0 % | 141 512 ₡ | 0 ₡ / 104 ₡ / 543 617 ₡ | 23 552 ₡ | 80 % (J4) | 11.2 (44 % des trajets) | 3.7 | MOD-07 49 %, VEH-04 32 % |
| Couverture légale · Équilibré · Baron | 1000 | 81 % | bio-bricks 19 % | standard 72 %, mafia 10 % | 67 053 ₡ | 0 ₡ / 40 298 ₡ / 196 498 ₡ | 62 870 ₡ | 90 % (J3) | 9.7 (34 % des trajets) | 2.8 | MOD-02 71 %, VEH-02 34 % |

## Défauts relevés
Aucun : pas d’action refusée, pas de sommeil forcé, aucun invariant violé.

## Poids du hasard

| Bot | Score moyen | Écart-type entre graines | p10 / p90 |
| :--- | ---: | ---: | ---: |
| Sans build · Prudent · score | 19 975 ₡ | 16 272 ₡ | 0 ₡ / 41 458 ₡ |
| Couverture légale · Équilibré · score | 68 513 ₡ | 83 922 ₡ | 0 ₡ / 182 301 ₡ |
| Rentier · Équilibré · score | 50 827 ₡ | 63 229 ₡ | 0 ₡ / 148 352 ₡ |
| Haut tier · Casse-cou · score | 141 512 ₡ | 266 083 ₡ | 0 ₡ / 543 617 ₡ |
| Couverture légale · Équilibré · Baron | 67 053 ₡ | 76 269 ₡ | 0 ₡ / 196 498 ₡ |

Écart entre bots (écart-type des scores moyens) : **39 985 ₡** ; écart moyen entre graines : **101 155 ₡**.
Le hasard des graines pèse plus que le choix du plan et du tempérament.

### À graine égale

Part des graines où le bot de la ligne fait un meilleur score que celui de la colonne : mêmes tirages, seul le jeu change.

| Bot | 1 | 2 | 3 | 4 | 5 |
| :--- | ---: | ---: | ---: | ---: | ---: |
| 1. Sans build · Prudent · score | — | 35 % | 40 % | 55 % | 35 % |
| 2. Couverture légale · Équilibré · score | 61 % | — | 52 % | 52 % | 6 % |
| 3. Rentier · Équilibré · score | 54 % | 40 % | — | 46 % | 40 % |
| 4. Haut tier · Casse-cou · score | 39 % | 38 % | 41 % | — | 38 % |
| 5. Couverture légale · Équilibré · Baron | 61 % | 3 % | 53 % | 52 % | — |
