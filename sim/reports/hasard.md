# Campagne 3 — Poids du hasard

* Les plans de référence des campagnes 1 et 2 sur un grand nombre de graines : le score dépend-il plus du joueur que des tirages ?
* 1000 parties par bot, graines 1 à 1000.

| Bot | Parties | Survie | Défaites | Fins | Score moyen | Score p10 / médiane / p90 | Score médian des survivants | Dette soldée (jour médian) | Interceptions | Jours de garde à vue | Équipement acheté |
| :--- | ---: | ---: | :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| Sans build · Prudent · score | 1000 | 88 % | bio-bricks 12 % | standard 88 % | 19 975 ₡ | 0 ₡ / 19 579 ₡ / 41 458 ₡ | 22 030 ₡ | 89 % (J6) | 5.9 (20 % des trajets) | 1.2 | — |
| Couverture légale · Équilibré · score | 1000 | 81 % | bio-bricks 20 % | standard 68 %, mafia 12 % | 76 098 ₡ | 0 ₡ / 33 977 ₡ / 224 150 ₡ | 63 231 ₡ | 92 % (J3) | 9.9 (35 % des trajets) | 3.0 | MOD-02 72 %, VEH-02 60 % |
| Rentier · Équilibré · score | 1000 | 81 % | bio-bricks 19 % | standard 78 %, mafia 3 % | 50 827 ₡ | 0 ₡ / 26 787 ₡ / 148 352 ₡ | 48 030 ₡ | 86 % (J3) | 9.0 (35 % des trajets) | 2.6 | CREW-02 68 % |
| Haut tier · Casse-cou · score | 1000 | 70 % | bio-bricks 28 %, execution 2 % | standard 47 %, mafia 23 %, elite 0 % | 141 689 ₡ | 0 ₡ / 63 ₡ / 542 646 ₡ | 26 285 ₡ | 79 % (J4) | 11.2 (44 % des trajets) | 3.7 | MOD-07 55 %, VEH-04 34 % |
| Couverture légale · Équilibré · Baron | 1000 | 81 % | bio-bricks 19 % | standard 68 %, mafia 13 % | 73 531 ₡ | 0 ₡ / 37 079 ₡ / 217 808 ₡ | 63 633 ₡ | 92 % (J3) | 9.6 (34 % des trajets) | 2.9 | MOD-02 72 %, VEH-02 60 % |

## Défauts relevés
Aucun : pas d’action refusée, pas de sommeil forcé, aucun invariant violé.

## Poids du hasard

| Bot | Score moyen | Écart-type entre graines | p10 / p90 |
| :--- | ---: | ---: | ---: |
| Sans build · Prudent · score | 19 975 ₡ | 16 272 ₡ | 0 ₡ / 41 458 ₡ |
| Couverture légale · Équilibré · score | 76 098 ₡ | 98 721 ₡ | 0 ₡ / 224 150 ₡ |
| Rentier · Équilibré · score | 50 827 ₡ | 63 229 ₡ | 0 ₡ / 148 352 ₡ |
| Haut tier · Casse-cou · score | 141 689 ₡ | 272 433 ₡ | 0 ₡ / 542 646 ₡ |
| Couverture légale · Équilibré · Baron | 73 531 ₡ | 86 960 ₡ | 0 ₡ / 217 808 ₡ |

Écart entre bots (écart-type des scores moyens) : **40 074 ₡** ; écart moyen entre graines : **107 523 ₡**.
Le hasard des graines pèse plus que le choix du plan et du tempérament.

### À graine égale

Part des graines où le bot de la ligne fait un meilleur score que celui de la colonne : mêmes tirages, seul le jeu change.

| Bot | 1 | 2 | 3 | 4 | 5 |
| :--- | ---: | ---: | ---: | ---: | ---: |
| 1. Sans build · Prudent · score | — | 39 % | 40 % | 55 % | 38 % |
| 2. Couverture légale · Équilibré · score | 58 % | — | 52 % | 51 % | 10 % |
| 3. Rentier · Équilibré · score | 54 % | 40 % | — | 46 % | 39 % |
| 4. Haut tier · Casse-cou · score | 38 % | 37 % | 40 % | — | 37 % |
| 5. Couverture légale · Équilibré · Baron | 59 % | 4 % | 53 % | 51 % | — |
