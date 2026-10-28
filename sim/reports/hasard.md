# Campagne 3 — Poids du hasard

* Les plans de référence des campagnes 1 et 2 sur un grand nombre de graines : le score dépend-il plus du joueur que des tirages ?
* 1000 parties par bot, graines 1 à 1000.

| Bot | Parties | Survie | Défaites | Fins | Score moyen | Score p10 / médiane / p90 | Score médian des survivants | Dette soldée (jour médian) | Interceptions | Jours de garde à vue | Équipement acheté |
| :--- | ---: | ---: | :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| Sans build · Prudent · score | 1000 | 84 % | bio-bricks 16 % | standard 84 % | 16 483 ₡ | 0 ₡ / 13 838 ₡ / 38 270 ₡ | 17 738 ₡ | 86 % (J5) | 7.0 (21 % des trajets) | 1.2 | — |
| Couverture légale · Équilibré · score | 1000 | 78 % | bio-bricks 22 % | standard 68 %, mafia 10 % | 67 427 ₡ | 0 ₡ / 23 138 ₡ / 201 563 ₡ | 49 568 ₡ | 90 % (J3) | 9.7 (33 % des trajets) | 2.9 | MOD-02 70 %, VEH-02 57 % |
| Rentier · Équilibré · score | 1000 | 84 % | bio-bricks 16 % | standard 80 %, mafia 4 % | 52 380 ₡ | 0 ₡ / 29 236 ₡ / 148 503 ₡ | 43 063 ₡ | 88 % (J4) | 9.6 (34 % des trajets) | 2.4 | CREW-02 72 % |
| Haut tier · Casse-cou · score | 1000 | 70 % | bio-bricks 28 %, execution 2 % | standard 47 %, mafia 24 %, elite 0 % | 138 995 ₡ | 0 ₡ / 269 ₡ / 520 117 ₡ | 60 484 ₡ | 78 % (J4) | 11.3 (43 % des trajets) | 3.6 | MOD-07 59 %, VEH-04 36 % |
| Couverture légale · Équilibré · Baron | 1000 | 79 % | bio-bricks 21 % | standard 67 %, mafia 12 % | 67 071 ₡ | 0 ₡ / 24 319 ₡ / 214 192 ₡ | 51 622 ₡ | 90 % (J3) | 9.5 (33 % des trajets) | 2.7 | MOD-02 70 %, VEH-02 57 % |

## Défauts relevés
Aucun : pas d’action refusée, pas de sommeil forcé, aucun invariant violé.

## Poids du hasard

| Bot | Score moyen | Écart-type entre graines | p10 / p90 |
| :--- | ---: | ---: | ---: |
| Sans build · Prudent · score | 16 483 ₡ | 15 827 ₡ | 0 ₡ / 38 270 ₡ |
| Couverture légale · Équilibré · score | 67 427 ₡ | 91 223 ₡ | 0 ₡ / 201 563 ₡ |
| Rentier · Équilibré · score | 52 380 ₡ | 64 893 ₡ | 0 ₡ / 148 503 ₡ |
| Haut tier · Casse-cou · score | 138 995 ₡ | 247 521 ₡ | 0 ₡ / 520 117 ₡ |
| Couverture légale · Équilibré · Baron | 67 071 ₡ | 85 537 ₡ | 0 ₡ / 214 192 ₡ |

Écart entre bots (écart-type des scores moyens) : **39 845 ₡** ; écart moyen entre graines : **101 000 ₡**.
Le hasard des graines pèse plus que le choix du plan et du tempérament.

### À graine égale

Part des graines où le bot de la ligne fait un meilleur score que celui de la colonne : mêmes tirages, seul le jeu change.

| Bot | 1 | 2 | 3 | 4 | 5 |
| :--- | ---: | ---: | ---: | ---: | ---: |
| 1. Sans build · Prudent · score | — | 40 % | 36 % | 49 % | 39 % |
| 2. Couverture légale · Équilibré · score | 55 % | — | 47 % | 47 % | 7 % |
| 3. Rentier · Équilibré · score | 59 % | 46 % | — | 48 % | 46 % |
| 4. Haut tier · Casse-cou · score | 43 % | 41 % | 42 % | — | 41 % |
| 5. Couverture légale · Équilibré · Baron | 56 % | 4 % | 48 % | 47 % | — |
