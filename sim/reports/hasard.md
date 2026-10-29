# Campagne 3 — Poids du hasard

* Les plans de référence des campagnes 1 et 2 sur un grand nombre de graines : le score dépend-il plus du joueur que des tirages ?
* 1000 parties par bot, graines 1 à 1000.

| Bot | Parties | Survie | Défaites | Fins | Score moyen | Score p10 / médiane / p90 | Score médian des survivants | Dette soldée (jour médian) | Interceptions | Jours de garde à vue | Équipement acheté |
| :--- | ---: | ---: | :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| Sans build · Prudent · score | 1000 | 89 % | bio-bricks 11 % | standard 89 % | 23 898 ₡ | 0 ₡ / 21 690 ₡ / 51 793 ₡ | 25 557 ₡ | 90 % (J6) | 6.0 (20 % des trajets) | 1.5 | — |
| Couverture légale · Équilibré · score | 1000 | 78 % | bio-bricks 22 % | standard 54 %, mafia 24 % | 90 187 ₡ | 0 ₡ / 45 259 ₡ / 251 650 ₡ | 89 154 ₡ | 92 % (J3) | 9.5 (33 % des trajets) | 3.0 | MOD-02 75 %, VEH-02 42 % |
| Rentier · Équilibré · score | 1000 | 84 % | bio-bricks 16 % | standard 71 %, mafia 13 % | 63 351 ₡ | 0 ₡ / 36 303 ₡ / 166 659 ₡ | 53 618 ₡ | 89 % (J2) | 8.9 (34 % des trajets) | 2.9 | CREW-02 72 % |
| Haut tier · Casse-cou · score | 1000 | 75 % | bio-bricks 24 %, execution 1 % | standard 48 %, mafia 27 % | 154 343 ₡ | 0 ₡ / 100 ₡ / 569 917 ₡ | 17 994 ₡ | 85 % (J2) | 10.9 (44 % des trajets) | 3.8 | MOD-07 55 %, VEH-04 37 % |
| Couverture légale · Équilibré · Baron | 1000 | 81 % | bio-bricks 19 % | standard 51 %, mafia 30 % | 85 612 ₡ | 0 ₡ / 56 662 ₡ / 205 882 ₡ | 96 443 ₡ | 92 % (J3) | 9.0 (32 % des trajets) | 2.6 | MOD-02 75 %, VEH-02 42 % |

## Défauts relevés
Aucun : pas d’action refusée, pas de sommeil forcé, aucun invariant violé.

## Poids du hasard

| Bot | Score moyen | Écart-type entre graines | p10 / p90 |
| :--- | ---: | ---: | ---: |
| Sans build · Prudent · score | 23 898 ₡ | 20 540 ₡ | 0 ₡ / 51 793 ₡ |
| Couverture légale · Équilibré · score | 90 187 ₡ | 114 486 ₡ | 0 ₡ / 251 650 ₡ |
| Rentier · Équilibré · score | 63 351 ₡ | 77 438 ₡ | 0 ₡ / 166 659 ₡ |
| Haut tier · Casse-cou · score | 154 343 ₡ | 291 011 ₡ | 0 ₡ / 569 917 ₡ |
| Couverture légale · Équilibré · Baron | 85 612 ₡ | 89 240 ₡ | 0 ₡ / 205 882 ₡ |

Écart entre bots (écart-type des scores moyens) : **42 488 ₡** ; écart moyen entre graines : **118 543 ₡**.
Le hasard des graines pèse plus que le choix du plan et du tempérament.

### À graine égale

Part des graines où le bot de la ligne fait un meilleur score que celui de la colonne : mêmes tirages, seul le jeu change.

| Bot | 1 | 2 | 3 | 4 | 5 |
| :--- | ---: | ---: | ---: | ---: | ---: |
| 1. Sans build · Prudent · score | — | 37 % | 41 % | 53 % | 34 % |
| 2. Couverture légale · Équilibré · score | 59 % | — | 52 % | 49 % | 16 % |
| 3. Rentier · Équilibré · score | 56 % | 42 % | — | 48 % | 41 % |
| 4. Haut tier · Casse-cou · score | 40 % | 39 % | 41 % | — | 37 % |
| 5. Couverture légale · Équilibré · Baron | 62 % | 13 % | 54 % | 52 % | — |
