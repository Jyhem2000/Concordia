# Analyse — étape 2 (amende, prix, plans à logique propre, campagnes 1 à 4)

Rapports bruts : [plans.md](plans.md) (campagne 1, 36 bots × 200 parties), [fins.md](fins.md) (campagne 2), [hasard.md](hasard.md) (campagne 3, 1 000 parties par bot), [retraits.md](retraits.md) (campagne 4, 400 parties par variante), [controle.md](controle.md).

## Changements mesurés
- **Amende proportionnelle à la marchandise saisie** (chap. 6) au lieu d'une part du Cash-Puce ; impayée, elle allonge la garde à vue.
- **Prix et effets** revus d'après la campagne 4 :
  - modules environ moitié prix ;
  - Vance et Mama Rosa à environ moitié salaire ;
  - Karma-Cham et laissez-passer moitié prix ;
  - `[VEH-03]` 45 000 ₡, `[VEH-04]` 100 000 ₡ ;
  - `[MOD-01]` retarde la fraîcheur de 2 jours, `[MOD-02]` réduit l'odeur à ×0,1, `[MOD-06]` +40 % à la fuite.
- **Marchand :**
  - cours espéré ailleurs corrigé des événements publics du jour ;
  - plans Fuite au sommet, Citoyen modèle, Opportuniste et Saboteur ;
  - objectifs Baron, Élite et Saboteur.

## Difficulté par tempérament (campagne 1, tous plans)
| Tempérament | Survie | Score moyen | Lecture |
| :--- | :--- | :--- | :--- |
| Prudent | 82 à 88 % | 4 000 à 19 500 ₡ | Survit presque toujours, gagne peu. |
| Équilibré | 75 à 85 % | 31 000 à 90 000 ₡ | Le cœur du jeu. |
| Casse-cou | 59 à 67 % | 102 000 à 235 000 ₡ | Médiane presque nulle, p90 de 360 000 à 880 000 ₡ : une loterie assumée. |

Novice : 84 %. L'ordre voulu tient : plus de risque, plus de gain, moins de survie. L'amende sur la marchandise a fait l'écart entre Équilibré et Casse-cou (elle frappe la soute chargée).

## Plans (campagne 1)
- **Les meilleurs :**
  - Citoyen modèle (Équilibré 90 600 ₡, Casse-cou 235 200 ₡, seul plan qui atteint l'Élite) ;
  - Couverture légale (75 900 ₡) ;
  - Corruption (56 600 ₡, 83 % de survie).
- **Fuite au sommet** survit le mieux en Équilibré (85 %).
- **Opportuniste** rejoint la moyenne (41 600 ₡, 78 %) une fois la spéculation retirée (voir chap. 9 : elle perdait la moitié du score).
- **Chaîne du froid** reste le plus faible (30 900 ₡ en Équilibré, contre 49 900 ₡ sans build).

## Grandes fins (campagne 2)
| Fin (seuil) | Atteinte, tempérament Équilibré | Atteinte, Casse-cou (score maximal) |
| :--- | :--- | :--- |
| Baron (200 000 ₡) | 1 à 15 % (Citoyen modèle, Couverture légale) | 20 à 30 % |
| Élite (500 000 ₡ + Or) | 0 à 1 % | 0 à 6 % (Citoyen modèle) |
| Saboteur (1 000 000 ₡ + `[T4-06]` à Rust Valley) | **0 %** | 0 % |

Le critère « taux décroissant de Baron à Élite à Saboteur » tient, mais le Saboteur est hors d'atteinte : son seuil vaut deux fois le p90 du meilleur Casse-cou. Sécuriser une fois le seuil atteint ne change presque rien, car le seuil est rarement atteint avant la fin.

## Poids du hasard (campagne 3)
Écart-type du score entre graines : environ 100 000 ₡ en moyenne (de 16 000 ₡ pour le Prudent à 248 000 ₡ pour le Casse-cou). Écart entre plans et tempéraments : 38 000 ₡. **Le critère de la campagne 3 échoue : les tirages pèsent plus que le jeu.** Même l'Équilibré a un écart-type plus grand que sa moyenne.

## Équipement (campagne 4)
- **Positifs :** avance de survie (+7 pts de survie), dilution (+24 400 ₡).
- **Neutres :**
  - presque tous les véhicules ;
  - `[MOD-02]`, `[MOD-03]`, `[MOD-07]`, `[MOD-08]` ;
  - Vance, Glitch ;
  - enchères, laissez-passer, certificat.
- **Négatifs :**
  - **la chaîne du froid** : `[VEH-03]` −6 700 ₡, `[MOD-01]` −5 700 ₡, Mama Rosa −12 700 ₡ ;
  - **la nuit** : `[MOD-04]` −9 300 ₡, `[MOD-06]` −8 100 ₡ dans Nuit festive ;
  - `[MOD-05]` et `[MOD-09]` (−15 000 à −17 000 ₡, très bruités en Casse-cou) ;
  - Karma-Cham (−4 600 ₡).

Les prix divisés par deux n'ont pas suffi : pour ces éléments, **c'est la mécanique qu'ils servent qui ne paie pas** (périssables, tournées de nuit), pas leur prix.

## À trancher
1. **Seuils des grandes fins :** les ramener à l'économie mesurée (par exemple Baron ≈ p90 de l'Équilibré, Élite ≈ p90 du Casse-cou, Saboteur au-dessus) ou relever l'économie.
2. **Hasard :** les saisies et les marchés tirés font l'essentiel du résultat. Pistes : plus d'information avant le trajet, pertes plafonnées par contrôle, marchés moins volatils, ou l'assumer.
3. **Périssables et nuit :** revoir ce qu'ils rapportent (marges des périssables Extra-Frais, profil festif, missions de nuit), pas seulement le prix de leur équipement.

## Poids du hasard : d'où vient l'écart entre parties
Mesures complémentaires (200 à 400 parties par bot, sondes temporaires, données remises à l'identique).

1. **Une part du « hasard » était le marché du bot.** Deux défauts y comptaient pour un tiers des défaites de l'Équilibré :
   - une dette tardive (collecte de Viktor sur un Cash-Puce vide) jamais soldée, alors que la Laverie était pleine ;
   - un bot à sec, bloqué loin de Hives.

   Corrigés : 43 → 29 défaites sur 200 (Sans build · Équilibré).
2. **Ni les cours, ni les événements, ni les stocks ne font l'écart.** Le coefficient de variation (écart-type / moyenne) ne bouge pas :

   | Sonde | Sans build · Équilibré | Couverture légale · Équilibré | Sans build · Casse-cou |
   | :--- | :--- | :--- | :--- |
   | Référence | CV 1,04 | 1,13 | 1,51 |
   | Bruit des cours ÷2 | 1,12 | 1,22 | 1,66 |
   | Sans événements | 0,97 | 1,32 | 1,79 |
   | Stocks fixes | 1,00 | 1,12 | 1,48 |

3. **Le nombre de contrôles n'explique presque rien** (R² de 0,01 à 0,12), le Cash-Puce du Jour 5 un peu plus (≈ 0,2). L'écart vient de l'effet boule de neige du capital : même parmi les survivants, le CV reste de 0,8 (Prudent) à 1,2 (Casse-cou). C'est la nature d'un jeu de négoce à la Drug Wars.
4. **À graine égale** (mêmes tirages, seul le jeu change ; campagne 3) :
   - l'Équilibré bat le Prudent sur environ 60 % des parties ;
   - un plan équipé ne bat le Sans build que sur **50 à 55 %** des parties, alors que sa moyenne est 30 à 100 % plus haute : il gagne gros parfois, pas souvent.
5. **Leviers mesurés :**

   | Levier | Sans build · Équilibré | L'Équilibré bat le Prudent (même graine) |
   | :--- | :--- | :--- |
   | Référence | 52 000 ₡ ± 54 000, CV 1,04 | 63 % |
   | Double fond ×2 | 69 000 ₡ ± 59 000, CV 0,86 | 74 % |
   | Amendes ÷2 | 64 000 ₡ ± 61 000, CV 0,95 | 69 % |

   Réduire la perte par contrôle resserre l'écart, mais rend aussi le jeu plus facile.

**Tempérament Équilibré** resserré (risque maximal 55 %, audace 0,85) : survie 77 à 84 %, entre le Prudent (80 à 88 %) et le Casse-cou (66 à 71 %).

## Critère 3 revu : à graine égale
Le critère devient : *à graine égale, un choix meilleur en moyenne gagne au moins 60 % des parties départagées* (chap. 9). Mesure, tempérament Équilibré, 300 graines, part des parties départagées où le plan bat le Sans build :

| Plan | Prix actuels | Prix ×0,5 | Prix ×0,25 | Équipement gratuit |
| :--- | :--- | :--- | :--- | :--- |
| Couverture légale | 55 % | 60 % | 66 % | 69 % |
| Citoyen modèle | 52 % | 61 % | 66 % | 78 % |
| Rentier | 46 % | 56 % | 60 % | 62 % |
| Fuite au sommet | 45 % | 53 % | 61 % | 73 % |
| Corruption | 46 % | 54 % | 56 % | 69 % |
| Haut tier | 42 % | 45 % | 51 % | 66 % |
| Électronique | 42 % | 45 % | 52 % | 50 % |
| Saboteur | 40 % | 37 % | 49 % | 61 % |
| Nuit festive | 36 % | 41 % | 42 % | 55 % |
| Chaîne du froid | 32 % | 43 % | 46 % | 62 % |
| Opportuniste (sans équipement) | 44 % | — | — | — |

- **Les effets existent :** gratuits, presque tous les builds passent 60 %. Payés, aucun.
- **Le moment d'achat n'y est pour rien :** n'acheter qu'avec deux ou quatre fois le prix en caisse donne les mêmes taux.
- **Le prix seul ne suffit pas :** même divisé par quatre, la moitié des builds reste sous 60 %.
- **Effets renforcés appliqués** (gain modeste, sans effet de bord) :
  - Mama Rosa (savoir-faire ×1,5, quotas des périssables ×2,5) ;
  - profil festif ×1,5 la nuit ;
  - risque ajouté par `[VEH-04]` ramené à +5 points ;
  - trappe de `[MOD-07]` jusqu'à 100 % de récupération.
  - Effet : Chaîne du froid 32 → 38 %, Nuit festive 36 → 44 %.
- **Essayé, non retenu :** relever le malus Tech pour valoriser `[MOD-03]` pénalisait tout le monde sans aider l'Électronique.

**Critère non atteint.** Un build joué comme une politique fixe (produits favorisés, achats imposés) ne bat pas le jeu libre partie par partie : son coût pèse tôt, son effet arrive trop tard ou trop peu. Le remède est structurel, et c'est l'objet de l'analyse de progression (proposition de progression, adoptée en partie puis retirée des docs) : un équipement qui arrive à son heure, à un prix et un effet calibrés pour cette étape de la partie.

## Progression, étape 1 (équipiers liés à des actes, nuit après deux livraisons, confiance du DSC)
Campagnes Contrôle et 1 à 4 remesurées.

| Tempérament | Survie avant → après | Score moyen |
| :--- | :--- | :--- |
| Prudent | 82 à 89 % → **84 à 93 %** | en hausse (+1 000 à +5 000 ₡) : les livraisons paient mieux avec la confiance |
| Équilibré | 76 à 84 % → 76 à 82 % | stable, de −10 000 à +14 000 ₡ selon le plan |
| Casse-cou | 64 à 71 % → 64 à 76 % | en baisse de 10 à 20 % : moins de tournées de nuit au début |

- **Les équipiers arrivent** entre le Jour 4 et le Jour 12 selon le jeu :
  - Glitch au J4–J7 (première Fiche S) ;
  - Vance au J7–J10 (premier contrôle franchi) ;
  - Mama Rosa au J9–J12, et dans 31 à 41 % des parties seulement (dix périssables à vendre d'abord).
- **Plans :**
  - gagnent : Couverture légale (+14 000 ₡), Haut tier (+13 000 ₡), Citoyen modèle (+7 500 ₡ en Équilibré) ;
  - perdent : Chaîne du froid (−10 000 ₡, Mama Rosa arrive tard) et Fuite au sommet (−10 000 ₡, Glitch demande une tournée clandestine).
- **Campagne 4 :** même tableau qu'avant. L'avance de survie (+12 pts) et la dilution (+18 900 ₡) paient ; Mama Rosa, `[MOD-01]`, `[MOD-04]` et `[MOD-09]` restent négatifs.
- **À graine égale :** pas de changement de fond (Couverture légale bat le Prudent sur 58 % des parties, le Casse-cou 37 à 55 %).

## Progression, étape 2 (services réservés par voie, garage en rayons)
Campagnes Contrôle et 1 à 4 remesurées. Le marchand compte la confiance du DSC tant que l'équipement de son plan l'attend, et va chercher une Fiche S pour les modules de la voie pègre.

- **Difficulté inchangée :** Prudent 84 à 92 %, Équilibré 77 à 83 %, Casse-cou 65 à 76 %.
- **Les rayons déplacent les achats :**
  - `[VEH-02]` passe de 46 à 31 % des parties en Équilibré, et `[MOD-08]` de 53 à 34 % : il faut trois commandes du DSC ;
  - `[MOD-09]` reste à 54 % (la Fiche S vient vite) ;
  - les enchères du Velvet-Silo tombent de 43 à 19 % (patrimoine exigé).
- **Plans :**
  - Opportuniste +7 000 ₡ en Équilibré ;
  - Corruption +3 500 ₡ en Équilibré ;
  - les Casse-cou de la voie officielle perdent : Citoyen modèle −91 000 ₡, Corruption −64 000 ₡. Ils ne font pas de livraisons et n'obtiennent plus leur faux terminal : la voie officielle demande de jouer officiel.
- **Campagne 4 :**
  - Karma-Cham devient neutre (−3 200 ₡ ± 3 500, contre −5 900 ₡) : il arrive quand la soute vaut une panique ;
  - `[MOD-07]` gagne 2 points de survie ;
  - restent négatifs `[MOD-01]`, `[MOD-03]` (rayon solvable), `[MOD-04]` et `[MOD-09]`, et Mama Rosa.
- **À graine égale :** la Couverture légale bat désormais le Prudent sur 61 % des parties, au-dessus du critère pour la première fois.
- **Prix des rayons :** non recalés à cette étape. Les éléments du rayon solvable restent négatifs à leur prix actuel, et les monter (ils arrivent quand le joueur est plus riche) les rendrait pires. C'est leur effet qui reste à revoir (périssables, nuit, Tech).

## Effets revus : périssables, nuit, Tech
**Paquet appliqué** (sondes à graine égale, puis campagnes Contrôle et 1 à 4 remesurées) :
- prime Extra-Frais ×1,3 → ×1,6 ;
- salaire de Mama Rosa 500 → 250 ₡ ;
- `[MOD-01]` 8 000 → 3 000 ₡ ;
- `[MOD-04]` : les silentblocs divisent par deux le malus de risque d'un trajet de nuit hors mission ;
- `[MOD-03]` : la cage de Faraday divise par deux la part de contrôles volants, prix 12 000 → 8 000 ₡ ;
- profil festif ×1,5 → ×2 la nuit.

| Plan (Équilibré) | Avant | Après | Le Sans build |
| :--- | :--- | :--- | :--- |
| Chaîne du froid | 35 800 ₡ | **60 100 ₡** | 55 200 ₡ |
| Électronique | 45 900 ₡ | **59 200 ₡** | 55 200 ₡ |
| Nuit festive | 42 300 ₡ | 47 100 ₡ | 55 200 ₡ |

- **Campagne 4 :**
  - Mama Rosa passe de −9 600 à **+4 600 ₡** ;
  - `[VEH-03]` passe à **+10 600 ₡** (positif) ;
  - `[MOD-01]` (−3 300 ₡), `[MOD-03]` (−3 100 ₡) et `[MOD-09]` (−8 000 ₡ ± 9 300) deviennent neutres ;
  - Nuit festive gagne +31 000 ₡ en Casse-cou.
- **Piège de mesure, `[MOD-04]` :** il reste à −13 900 ₡ dans la campagne 4. Sur la fourgonnette de départ, à un seul emplacement, le retirer du plan Nuit festive y laisse monter `[MOD-06]` : la ligne mesure surtout l'écart avec le pare-buffles. Seul face à rien, il passe de −6 000 à −3 000 ₡ avec les silentblocs.
- **La nuit reste le maillon faible :** même sans module, le plan Nuit festive fait moins que le Sans build.
  - Essai d'un malus de nuit hors mission à +15 points au lieu de +25 : tout le monde gagne un peu (Sans build Équilibré 58 000 → 62 000 ₡), mais la Nuit festive ne bat toujours le Sans build que sur 37 à 40 % des parties. Non retenu.
  - Le frein est la mécanique elle-même (Fiche S, missions rares au début), pas un chiffre.
- **Difficulté :** la survie monte un peu, l'Équilibré passant de 77–83 % à 80–86 %. À surveiller au prochain recalage de difficulté.
- **À graine égale :** la Couverture légale bat le Prudent sur 64 % des parties (61 % avant).

## Nuit repensée : une mission chaque soir, profil festif élargi
**Changements :**
- une mission de nuit est proposée chaque soir, une fois la nuit débloquée (au lieu d'une chance sur 0,6) ;
- profil festif étendu aux produits addictifs et culturels : `[T1-01]`, `[T2-05]`, `[T2-06]`, `[T3-05]`, `[T3-07]`, `[T4-02]`.

Campagnes Contrôle et 1 à 4 remesurées.

| Plan (Équilibré) | Avant | Après | Le Sans build |
| :--- | :--- | :--- | :--- |
| Sans build | 55 200 ₡ | **75 000 ₡** | — |
| Nuit festive | 47 100 ₡ | **71 500 ₡** | 75 000 ₡ |
| Couverture légale | 85 000 ₡ | 106 400 ₡ | 75 000 ₡ |
| Citoyen modèle | 82 500 ₡ | 122 400 ₡ | 75 000 ₡ |

- **Tout le monde gagne :** la nuit paie pour tous les plans, pas seulement pour le plan de nuit.
  - L'écart entre Nuit festive et Sans build passe de −8 000 à −3 500 ₡ en Équilibré.
  - En Casse-cou, la Nuit festive passe de 129 700 à 158 100 ₡ (le Sans build fait 140 100 ₡).
- **La dette se solde plus tôt :** jour médian J2 à J3 en Casse-cou (J4 avant), grâce aux primes de mission.
- **Difficulté, le jeu devient plus facile :**

  | Tempérament | Survie avant | Survie après |
  | :--- | :--- | :--- |
  | Prudent | 85 à 93 % | 87 à 96 % |
  | Équilibré | 80 à 86 % | **85 à 89 %** |
  | Casse-cou | 67 à 75 % | 73 à 83 % |

  L'ordre des tempéraments est enfin net (Prudent > Équilibré > Casse-cou), mais l'écart Prudent–Équilibré se resserre à 3 ou 4 points.
- **Campagne 4 :**
  - l'avance de survie monte à +16 pts ;
  - Karma-Cham devient négatif (−9 300 ₡ ± 3 600) : le marchand paie la purge plus souvent (53 % des parties) alors que la nuit rapporte ;
  - `[MOD-06]` devient négatif (−10 100 ₡) dans le plan Nuit festive ; `[MOD-04]` reste à −11 900 ₡ (même piège de mesure qu'avant) ;
  - `[VEH-03]` et Mama Rosa redeviennent neutres (+3 300 et +2 800 ₡, marges larges).
- **À graine égale :** la Couverture légale bat le Prudent sur 66 % des parties (64 % avant).
- **Grandes fins :** la fin mafia monte (Couverture légale Baron 13 → 20 %), l'élite reste sous 5 %.
- **Suite :** recalage de la difficulté (seuils de fin, intérêts de la dette, risque), à mesurer avant de coder.

## Recalage de difficulté (appliqué, campagnes à remesurer)
Sondes de `sim/probe-difficulte.ts`, 200 parties par ligne, survie du Sans build :

| Variante | Prudent | Équilibré | Casse-cou |
| :--- | ---: | ---: | ---: |
| Référence | 91 % | 88 % | 80 % |
| Collecte de protection 20 % | 91 % | 88 % | 79 % |
| Dette de départ 7 500 ₡ | 83 % | 85 % | 74 % |
| Dette de départ 10 000 ₡ | 76 % | 80 % | 72 % |
| Risque de base +6 pts | 83 % | 86 % | 76 % |
| **Amendes ×2** | **88 %** | **85 %** | **74 %** |

- Toutes les défaites sont des Bio-Briques : la dette se solde entre J2 et J6, ensuite la survie n'est plus en jeu.
- Dette, risque et protection frappent d'abord le Prudent (il gagne lentement) et recassent l'ordre des tempéraments. Les amendes, proportionnelles à la valeur saisie, frappent ceux qui transportent cher : seul levier qui garde Prudent > Équilibré > Casse-cou. **Retenu : amendes ×2.**
- **Grandes fins**, seuils abaissés à 150 000 / 300 000 / 500 000 ₡ (Baron / Élite / Saboteur). Mesure avec ces seuils :
  - Baron 36 % (Équilibré) et 53 % (Casse-cou), contre 20 et 44 % ;
  - Élite 7 et 4 % : en Casse-cou, une soixantaine de parties sur 200 dépassent 300 000 ₡ mais finissent avec un ICC de 4 à 84 ; le bot ne défend plus l'ICC après le J18 ni en fin de partie ;
  - Saboteur 0 % : le bot ne cherche le serveur qu'au J25, banque l'argent qui servirait à l'acheter, et reste à la Laverie au lieu de rejoindre `[D4]`.
- **Reste à faire :** corriger les bots Élite et Saboteur, puis remesurer les campagnes 1 à 4.

## Simplifications (appliquées, campagnes à remesurer)
Premier lot de `docs/propositions/simplification.md`, sans campagne :
- inflation retirée, chaque coût fixé à 1,5 fois son ancienne valeur de base (l'indice moyen d'une partie était ×2, mais les défaites se jouent au début, où il valait ×1 à ×1,4) ;
- commission de la Laverie au retrait : les dépôts, donc le score, ne sont plus taxés ;
- Hachoir de Viktor (effet nul mesuré), tabassage du Jour 10 (presque jamais déclenché) et emprunt tactique (jamais utilisé) retirés.

À vérifier à la prochaine campagne : survie des trois tempéraments (les coûts du début montent de ×1 à ×1,5), et score moyen (la fin de partie coûte moins cher qu'avec l'indice à ×2,9).

## Remesure après simplifications et nouvelles fins
Campagnes Contrôle et 1 à 4 sur le jeu simplifié : amendes ×2, coûts fixes (×1,5, plus d'inflation), commission de la Laverie au retrait, sans hachoir, tabassage ni emprunt tactique, avance de survie toute la partie, fins Résident Réécrit et Élite par cooptation, bots Élite, Résident et Saboteur réécrits.

**Difficulté** (campagne 1, survie par tempérament, tous plans) :

| Tempérament | Nuit repensée | Maintenant |
| :--- | :--- | :--- |
| Prudent | 87 à 96 % | 86 à 91 % |
| Équilibré | 85 à 89 % | 76 à 90 % |
| Casse-cou | 73 à 83 % | 72 à 82 % |

- Le jeu est un peu plus dur, surtout en score : le Sans build Équilibré passe de 75 000 à 69 000 ₡, le Casse-cou de 140 000 à 132 000 ₡ (et de 80 à 76 % de survie).
- L'ordre des tempéraments tient pour presque tous les plans. Deux exceptions, la Nuit festive et la Fuite au sommet, où l'Équilibré survit un peu mieux que le Prudent (écarts de 2 et 3 points).
- **Les plans à couverture légale perdent le plus** : la Couverture légale Équilibré passe de 85 à 78 % de survie et de 106 000 à 85 000 ₡, le Citoyen modèle de 87 à 76 %. Hypothèse d'abord retenue : les places de soute réservées au Tier 0 dès le Jour 1 ralentiraient le remboursement de la dette. **Démentie** (section suivante) : la campagne 4 montre au contraire que la dilution *rapporte* 8 points de survie (84 → 76 % sans elle), et ne couvrir qu'après la dette fait baisser la Couverture légale.
- Le Novice survit à 90 % (critère du contrôle tenu).

**À graine égale :** la Couverture légale ne bat plus le Prudent que sur 59 % des parties (66 % avant), juste sous le critère de 60 %, pour la même raison.

**Campagne 4 :**
- l'avance de survie reste le premier filet (+14 points de survie) ;
- `[MOD-07]` devient positif (+3 points, +7 900 ₡) ;
- restent négatifs en score `[MOD-01]`, `[MOD-04]` et `[MOD-06]` (plan Nuit festive, piège de mesure déjà décrit) et `[MOD-09]` ;
- Karma-Cham redevient neutre (−3 000 ₡ ± 4 500) avec le coût fixe ;
- le laissez-passer de la Morgue est neutre.

**Grandes fins** (campagne 2, Équilibré) :
- Baron 13 à 29 %, Élite 0 %, Résident 0 % (9 à 11 % d'exécutions), Saboteur 0 à 1 %.
- Les bots Résident complètent souvent leurs injections, mais finissent sous le seuil de score : l'Équilibré fait en moyenne 50 000 à 90 000 ₡, et son p90 dépasse à peine 250 000 ₡.
- L'Élite ne gagne presque jamais son parrain : trois commandes VIP livrées, avec un produit tiré au hasard et un jour pour le livrer, c'est rare même en allant le chercher la nuit.

**Sonde des seuils** (`sim/probe-difficulte.ts fins`, 200 parties par ligne, fin visée atteinte, Équilibré / Casse-cou) :

| Seuils (Baron / Élite / Résident / Saboteur) | Baron | Élite | Résident | Saboteur |
| :--- | :--- | :--- | :--- | :--- |
| 150k / 300k / 300k / 500k (actuels) | 29 / 50 % | 0 / 0 % | 0 / 7 % | 1 / 4 % |
| 150k / 200k / 200k / 300k | 29 / 50 % | 0 / 1 % | 3 / 8 % | 1 / 5 % |
| 150k / 150k / 150k / 250k | 29 / 50 % | 0 / 1 % | 5 / 5 % | 1 / 4 % |

- **Baisser les seuils ne suffit pas :** chaque fin de prestige bute sur sa condition propre, pas sur le score.
  - **Élite :** le parrain (trois commandes VIP livrées, un jour de délai, produit tiré au hasard).
  - **Résident :** le temps passé à chercher le serveur et à l'injecter coûte du score (40 000 ₡ en moyenne en Équilibré, contre 60 000 pour le même plan en score), et 9 à 12 % des parties finissent exécutées.
  - **Saboteur :** le serveur apparaît rarement en stock (une chance sur 0,15 par jour, dans un seul district).
- **Critère 2 non tenu** pour les trois fins de prestige. Leviers à trancher : les conditions propres (nombre de commandes, délai VIP, nombre d'injections, apparition du serveur) avant les seuils.

## Fins de prestige assouplies
Changements :
- **Élite :** 2 commandes VIP pour le parrain (3 avant), livrables le jour même ou l'un des deux jours suivants (le lendemain avant).
- **Résident Réécrit :** seuil au niveau du Baron (150 000 ₡, 300 000 avant).
- **Serveur `[T4-06]` :** deux fois plus souvent en stock.
- **Bot Élite :**
  - la livraison VIP de jour au Velvet-Silo est acceptée au-delà du risque du tempérament ;
  - elle vaut sa recette plus la valeur du parrain ;
  - les caisses achetées au départ comptent.
- **Bot à couverture légale :** essai d'une couverture de Tier 0 seulement après la dette. **Annulé** : la Couverture légale tombe de 80 à 75 % de survie, et le Baron de 29 à 24 %. La dilution sert dès le début (campagne 4 : +8 points de survie).

**Campagne Plans :** inchangée à ±3 points près (aucune règle touchée hors fins).

**Sonde des seuils** (200 parties par ligne, fin visée atteinte, Équilibré / Casse-cou) :

| Seuils (Baron / Élite / Résident / Saboteur) | Baron | Élite | Résident | Saboteur |
| :--- | :--- | :--- | :--- | :--- |
| 150k / 300k / 150k / 500k (actuels) | 31 / 50 % | 4 / 2 % | 6 / 9 % | 0 / 5 % |
| 150k / 200k / 150k / 300k | 31 / 50 % | 5 / 2 % | 6 / 9 % | 1 / 6 % |

**Sonde des conditions** (`sim/probe-prestige.ts`, part des survivants qui remplissent chaque condition) :

| Bot | Score | Condition propre | ICC Or |
| :--- | ---: | ---: | ---: |
| Citoyen modèle · Élite · Équilibré | 12 % | parrain 9 % | 25 % |
| Citoyen modèle · Élite · Casse-cou | 39 % | parrain 4 % | 7 % |
| Fuite au sommet · Résident · Équilibré | 11 % | injection 36 % | — |
| Fuite au sommet · Résident · Casse-cou | 39 % | injection 18 % | — |

- **Élite : le parrain reste le verrou, et ce n'est plus le bot.**
  - Les produits VIP sont du Tier 2–3 illégal. Le trajet de livraison entre donc dans `[D6]`, le district le plus surveillé, avec environ 28 % d'interception.
  - Au barrage, le bluff échoue souvent devant les douaniers d'élite, et la fouille saisit les caisses.
  - Le bot ne livre qu'un tiers des commandes qu'il prend. En Casse-cou, l'ICC tombe sous le palier Ordinaire et le Silo se ferme (46 % des parties sans aucune commande).
  - Levier : une règle (le trajet de livraison VIP), pas un chiffre.
- **Résident : la greffe se fait, le score manque.**
  - L'injection est complète dans 18 à 36 % des parties survivantes, mais le score atteint 150 000 ₡ dans 11 % seulement en Équilibré (moyenne 38 000 ₡).
  - Les exécutions montent à 13–14 %, car le serveur, plus fréquent, est chassé plus souvent.
- **Saboteur : le serveur plus fréquent ne change rien.** Le verrou est le seuil de 500 000 ₡ (moyenne 60 000 ₡ en Équilibré). C'est voulu pour la fin ultime, mais même à 300 000 ₡ le taux reste à 1–6 %.
- **Critère 2 toujours non tenu.** L'ordre voulu (Baron > Élite > Résident > Saboteur) n'est pas encore lisible : Élite et Résident sont au même niveau.

## Protection du parrain et afters du couvre-feu
Changements :
- **Protection du parrain :**
  - dans le district du Silo, les caisses d'une commande VIP en cours sont hors de vue des agents (ni risque, ni fouille) ;
  - elles reviennent à bord à la fin du contrôle.
- **Afters du couvre-feu :**
  - chaque soir, une fête clandestine est tirée dans `[D1]`, `[D2]`, `[D4]` ou `[D6]` ;
  - le profil festif y vaut ×3,5, et ×1,5 ailleurs la nuit (×2 avant) ;
  - la foule retire 50 % du malus de nuit hors mission.
- **Bot noctambule :**
  - il estime la revente au district d'arrivée, after comprise ;
  - de jour, il garde ou achète le festif pour l'after du soir (revente escomptée de 25 %).

**Lecture des campagnes :** le tirage de l'after décale le générateur. Toutes les parties changent donc, et comme chaque bot joue les mêmes 200 graines, la campagne entière bouge d'un bloc. Par exemple, la survie du Sans build Équilibré passe de 88 à 81 %, sans aucune règle qui le touche. On compare donc les variantes **à graines égales**, dans la même sonde, et non avec les campagnes précédentes.

**Sonde de la nuit** (`sim/probe-difficulte.ts pression … festif= after= foule=`, 200 parties, mêmes graines) :

| Variante | Sans build · Équilibré | Nuit festive · Prudent / Équilibré / Casse-cou | Couverture légale · Équilibré |
| :--- | :--- | :--- | :--- |
| Sans after (≈ avant) | 80 %, 63k | 90 / 88 / 74 %, 24k / 75k / 117k | 76 %, 82k |
| After, festif ×1,25 ailleurs | 80 %, 65k | 92 / 86 / 77 %, 33k / 66k / 139k | 70 %, 82k |
| **After, festif ×1,5 ailleurs (retenu)** | 81 %, 67k | 94 / 90 / 73 %, 40k / 87k / 122k | 69 %, 76k |
| After, festif ×2 ailleurs | 79 %, 66k | 96 / 91 / 83 %, 50k / 107k / 132k | 76 %, 78k |
| After sans foule, festif ×2 | 81 %, 67k | 95 / 93 / 81 %, 45k / 101k / 118k | 76 %, 86k |

- **Retenu : ×1,5 hors after.**
  - À ×1,25, la nuit redevient plate : la Nuit festive Équilibré fait autant que le Sans build.
  - À ×2, l'after devient un pur bonus et la Nuit festive écrase le reste (+60 % sur le Sans build).
  - À ×1,5, la nuit paie en Prudent et en Équilibré (+30 % sur le Sans build, survie 90 %), mais pas en Casse-cou, qui roule déjà toutes les nuits.
- **La foule** compte peu sur le score (un peu plus de sécurité). Elle est gardée pour le lore et pour le choix mission ou after.
- **Point ouvert : Couverture légale Équilibré.** Sa survie tombe à 69–70 % dès que le festif baisse hors after (76 % à ×2). Le Prudent reste à 88 % et le Casse-cou à 75 % : l'ordre des tempéraments s'inverse pour ce plan. À regarder avec le réglage de son bot (la dilution occupe la soute que la nuit festive remplissait).

**Campagne Plans** (jeu de graines décalé, voir plus haut) :
- Nuit festive : 94 / 90 / 73 % de survie, 40 / 87 / 122k.
- Sans build : 84 / 81 / 77 %, 23 / 67 / 154k.
- La Nuit festive bat le Sans build en Prudent et en Équilibré.

**Fins de prestige** (fin visée atteinte, Équilibré / Casse-cou) :

| Fin | Taux | Ce qui bloque (part des survivants) |
| :--- | :--- | :--- |
| Élite | 5 / 3 % | parrain 9 → 20 % en Équilibré grâce à la protection, mais il faut aussi score ≥ 300k (17 %) et ICC Or (27 %) ; en Casse-cou, l'ICC tombe et le Silo se ferme (parrain 5 %) |
| Résident | 5 / 12 % | injection 37 / 21 %, score ≥ 150k 11 / 52 % |
| Saboteur | 0 / 6 % | score (500k) |

- **Le parrain ne bloque plus l'Élite :** ce sont les trois conditions réunies. Prochain levier : le seuil de score (300k, le double du Baron) ou l'ICC Or.

## Seuil Élite à 200k, tags Festif et Diurne, after à Panacea
Changements :
- **Seuil de l'Élite :** 200 000 ₡ (300 000 avant).
- **Profil nuit devenu tags :**
  - `[TAG-FESTIVE]` (Festif, ×1,5 la nuit, ×3,5 à l'after) et `[TAG-DIURNAL]` (Diurne, ×0,8 la nuit) ;
  - mêmes coefficients qu'avant, mais visibles en badge au marché et expliqués dans la fiche du produit.
- **After à Panacea `[D3]` :** la salle de réveil du bloc opératoire. Il y a maintenant cinq lieux, et la Flèche de Verre n'en accueille toujours pas. Aucun produit ajouté : Panacea produit déjà du Festif (Tcherno-Bull) et en achète (whisky, cigares).

Le tirage parmi cinq districts décale à nouveau le générateur : on ne compare pas aux campagnes précédentes ligne à ligne.

**Campagne Plans :**
- Nuit festive : 95 / 90 / 75 % de survie, 45 / 89 / 132k.
- Sans build : 85 / 84 / 75 %, 23 / 68 / 174k.
- La nuit paie toujours en Prudent et en Équilibré.
- La Couverture légale Équilibré reste basse (72 %), sous son Prudent (89 %), à égalité avec son Casse-cou (70 %). Expliqué et corrigé à la section suivante.

**Fins de prestige** (fin visée atteinte, Équilibré / Casse-cou) :

| Fin | Taux | Ce qui bloque (part des survivants, Équilibré) |
| :--- | :--- | :--- |
| Baron | 31 / 48 % | — |
| Élite | 7 / 3 % | score ≥ 200k 29 %, parrain 19 %, ICC Or 31 % : il les faut tous les trois |
| Résident | 8 / 7 % | score ≥ 150k 18 %, injection 35 % ; exécutions 10–12 % |
| Saboteur | 1 / 7 % | score ≥ 500k |

- **Élite :** l'abaissement du seuil la fait passer de 5 à 7 % en Équilibré. En Casse-cou, l'ICC reste le verrou : le Silo se ferme sous le palier Ordinaire.
- **L'ordre voulu** (Baron, puis Élite et Résident, puis Saboteur) se lit maintenant en Équilibré, mais les fins de prestige restent sous les 10 %.

## Couverture légale Équilibré : un défaut du bot ruiné
**Diagnostic** (Couverture légale Équilibré, 200 graines) :
- 37 des 57 Bio-Briques sont des rechutes : la dette initiale est soldée, puis une petite dette revient un jour de collecte de Viktor (J7, 14, 21, 28) et n'est jamais remboursée.
- Ce sont des bots ruinés après une saisie ou un pot-de-vin raté : Cash-Puce à 0, pas d'offshore, carburant à 0. Il leur reste seulement leurs caisses de couverture en Tier 0.
- La protection (10 % du Cash-Puce et de la soute) sur ces quelques caisses crée une dette de 3 à 9 ₡, qui les tue à l'audit.
- **Défaut du bot :** avec ces caisses en soute, il ne se croyait pas fauché. Il ne prenait donc pas l'avance de survie, et ne revendait pas la couverture, faute de marge. Il restait garé jusqu'au J30.
- Un Sans build ruiné a une soute vide : il ne doit rien à Viktor et « survit » à 0 ₡. L'écart de survie venait surtout de là, pas de la règle.

**Correctif (bot) :** est ruiné le bot dont le Cash-Puce et la soute réunis valent moins de la moitié de son fonds de roulement. Il revend alors tout, même à perte, et demande l'avance de survie.

**Campagne Plans** (survie Prudent / Équilibré / Casse-cou) :

| Plan | Avant | Après |
| :--- | :--- | :--- |
| Couverture légale | 89 / 72 / 70 % | 93 / 89 / 81 % |
| Sans build | 85 / 84 / 75 % | 87 / 85 / 75 % |
| Nuit festive | 95 / 90 / 75 % | 94 / 91 / 79 % |

- L'ordre des tempéraments est rétabli pour tous les plans.
- **À surveiller :** la Couverture légale redevient le meilleur plan Équilibré (89 %, 103 000 ₡ de score moyen, contre 85 % et 68 000 ₡ en Sans build). Seul le Citoyen modèle, qui repose aussi sur la couverture en Tier 0, fait mieux (127 000 ₡).
- **Fins visées** (Équilibré) : Baron 32 % en Couverture légale, Élite 7 % (Citoyen modèle), Résident 8 %, Saboteur 1 %, presque inchangées.
- **Limite de la mesure :** la survie compte comme survivant un joueur ruiné à 0 ₡ (en Équilibré, 7 % des parties en Couverture légale, 12 % en Sans build).

## Dernier lot d'équilibrage et gel
Principe retenu : le but d'une partie est le score ; les grandes fins sont des accomplissements, et la prise de risque doit payer (critères 1 et 2 du chap. 9 récrits).

**Changements :**
- **Festif réduit aux produits de fête :** 7 produits au lieu de 12 (sodas, boissons énergisantes, vinyles, charcuterie, cigares, whisky, viande de buffet). Le coefficient hors after passe de ×1,5 à ×2 pour garder la nuit rentable.
- **`[T4-02]` :** Malles d'Œuvres d'Art du Monde d'Avant (les montres sont retirées).
- **Couverture du Légal divisée par deux.** Mesure à graine égale (Couverture légale, Équilibré, avant réglage) :

  | Variante | Score moyen | Survie |
  | :--- | ---: | ---: |
  | Plan complet | 87 000 ₡ | 89 % |
  | Sans la baisse de risque du Légal | 61 000 ₡ | 85 % |
  | Sans le masquage de l'odeur | 70 000 ₡ | 85 % |
  | Ni l'une ni l'autre | 49 000 ₡ | 79 % |
  | Baisse de risque divisée par deux (retenue) | 77 000 ₡ | 86 % |

  La dilution fait presque tout l'écart : VEH-02 et MOD-02 n'ajoutent que 7 000 à 12 000 ₡. Une couverture plus faible, ou nulle, pénalise aussi les livraisons du DSC de tous les plans sans changer le classement en Casse-cou.
- **Propositions de nuit B et C écartées.**
- **Essai sans suite :** un bot qui garde la moitié de son disponible en achetant son équipement ne change rien de mesurable ; annulé.

**Campagne Plans** (score moyen Prudent / Équilibré / Casse-cou) :
- Le Festif réduit a baissé tous les scores d'environ 10 000 ₡ en Équilibré (Sans build 68 000 → 59 000 ₡).
- Tête : Citoyen modèle (25 / 90 / 234k), Couverture légale (23 / 85 / 186k). Aucun plan ne domine à la fois la survie et le score : la Nuit festive survit mieux (95 / 91 / 81 %).
- **Le risque paie par le tempérament :** le Casse-cou gagne 2 à 3 fois plus que l'Équilibré, pour 5 à 10 points de survie en moins.
- **Critère 1 non tenu pour quatre plans** (sous le Sans build pour tous les tempéraments) : Électronique, Saboteur, Rentier, Opportuniste. Les deux premiers ont `[MOD-03]` en commun, qui coûte 37 000 ₡ en Casse-cou à graine égale : c'est le seul défaut net qui reste. Rentier et Opportuniste sont à quelques milliers de crédits, dans le bruit.

**Fins visées** (Équilibré) : Baron 26 %, Élite 5 %, Résident 8 %, Saboteur 0 % (accessible surtout en Casse-cou, conforme au critère 2).

**Gel :** l'équilibrage s'arrête ici. Écarts assumés :
- les builds qui réduisent le risque (couverture en Tier 0, ICC haut) restent les plus rentables, la témérité paie par le tempérament ;
- `[MOD-03]` ne se rentabilise pas ;
- le hasard des graines pèse plus que le choix du plan (écart entre graines 106 000 ₡, entre bots 38 000 ₡) : l'effet boule de neige d'un jeu de négoce.

## Prix de l'équipement divisés par deux environ
Constat : sur 30 jours, la plupart des équipements ne se remboursaient pas (campagne 4).

**Changements** (`vehicles.ts`) : véhicules (`[VEH-02]` 22 000 → 15 000 ₡, `[VEH-03]` 45 000 → 25 000 ₡, `[VEH-04]` 100 000 → 55 000 ₡), modules à peu près de moitié, salaires des équipiers d'un tiers, frais de recrutement 2 250 → 1 500 ₡.

**Campagne Plans** (score moyen Équilibré / Casse-cou, avant → après) :
- Chaîne du froid 53 → 61k / 139 → 151k, Haut tier 47 → 60k / 137 → 170k, plan Saboteur 48 → 58k / 125 → 188k, Fuite au sommet 58 → 68k / 145 → 163k : ils repassent devant le Sans build (59 / 130k).
- Électronique (`[MOD-03]`) reste derrière en Casse-cou (91k) ; Rentier et Opportuniste restent juste sous le Sans build.
- Citoyen modèle 90 → 112k en Équilibré.

**Campagne 4 (retraits) :** aucun véhicule ni équipier n'est plus négatif ; la plupart sont neutres, `[VEH-02]` et `[CREW-01]` positifs. Restent négatifs :
- `[MOD-04]` (−11 000 ₡) et `[MOD-05]` (−14 000 ₡) dans les plans de nuit ;
- les lieux spéciaux payants : Karma-Cham (−7 700 ₡), chirurgie (−4 900 ₡), laissez-passer (−2 600 ₡), certificat (−500 ₡).

## Événements : un plafond unique
Les multiplicateurs d'événement se multiplient (chaque événement par sa ligne la plus forte, plus les contrecoups et l'influence de Karma-Cham), sous un plafond unique ; la règle « le plus fort écart l'emporte » et ses départages sont retirés.

**Campagne Plans :** pas de changement de fond (les écarts suivent surtout le décalage du générateur). Seul l'Opportuniste reste sous le Sans build, à quelques milliers de crédits (51 / 125k contre 55 / 125k).

## Prix des lieux spéciaux divisés par deux environ
**Changements** (`locations.ts`) : Karma-Cham, Morgue (laissez-passer, chirurgie et sa part du Cash-Puce, certificat), Cassandre-88, faux dossier de la Laverie et chantage du Velvet-Silo, à peu près à moitié prix.

**Campagne 4 (retraits)** :
- Karma-Cham (−7 700 → −2 400 ₡), laissez-passer (−2 600 → −700 ₡) et certificat deviennent neutres ; la chirurgie reste légèrement négative (−3 200 ₡ ± 2 400), dans le seul plan Casse-cou qui l'utilise.
- `[MOD-05]` est neutre (−4 800 ₡ ± 13 000).
- `[MOD-04]` reste négatif (−13 900 ₡), mais ce n'est pas son prix : la fourgonnette de départ n'a qu'un emplacement, le bot y monte `[MOD-04]` (rayon libre, acheté vers le J4) et ne peut plus monter `[MOD-06]` (acheté vers le J6). Son retrait mesure en fait le pare-buffles à sa place : plus de fuites réussies, moins de garde à vue. C'est un arbitrage d'emplacement laissé au joueur.
- `[MOD-08]` et `[CREW-01]` sont positifs ; aucun autre élément n'est négatif.

**Campagne Plans :** peu de changement, les bots utilisent peu les lieux ; l'Opportuniste (qui s'en sert) rejoint le Sans build (53 / 126k contre 55 / 125k).

## Placement du Cartel, contrats de la Pègre, taux offshore unique
**Changements :** taux offshore unique ; placement du Cartel à la Laverie (`VENTURE`) ; contrats de la Pègre chez Viktor (`CONTRACT`). Les bots placent une part de leur épargne selon le tempérament (rien en Prudent, un quart en Équilibré, la moitié en Casse-cou) et prennent un contrat une fois la dette initiale soldée, s'il est achetable sur place, non périssable et sous leur risque. Le tirage quotidien d'un contrat décale le générateur : toutes les parties changent, le bruit est plus fort que d'habitude.

**Sondes à graines égales (Sans build, 200 parties) :**
- Contrats pris sans précaution (dès le Jour 1, tout risque accepté) : −10 points de survie et −15 à −20 % de score. Le bot achète tôt, la saisie des caisses le ruine. C'est une mauvaise façon de jouer, pas un défaut de la règle : un bot prudent les joue à l'équilibre (Prudent +2 %, Équilibré −5 %, Casse-cou −1 % de score ; −1 à −5 points de survie). Un joueur qui choisit ses contrats (destination sur sa route) y gagne. Les chiffres d'origine (prime ×1,6, pénalité de moitié) sont gardés.
- Placement : neutre à légèrement positif pour Équilibré et Casse-cou.

**Campagne Plans :** Prudent et Équilibré restent dans le bruit. Casse-cou bouge davantage dans les deux sens : Corruption +17 000 ₡, Haut tier +12 000 ₡ ; Nuit festive −32 000 ₡, Citoyen modèle −34 000 ₡, Saboteur −64 000 ₡ (écart-type de ces scores autour de 200 000 ₡, soit ±15 000 ₡ sur la moyenne). Hypothèse, non vérifiée : tous les Casse-cou placent la moitié de leur épargne, et un coup de filet tardif coûte cher au score ; le décalage du générateur pèse aussi. Une sonde à graines égales avec et sans placement trancherait.

**Parcours type :** nouveau tableau du rapport, lu dans le carnet de route (patrimoine médian à J5, J10, J20, J30, premier équipement, contrôles avec pertes, contrats, coups de filet).

## Remesure novice / expert, tournées de nuit après le trajet du jour
**Changement de règle :** la tournée de nuit (mission ou clandestine) ne part plus qu'après le trajet du jour.

**Sonde `sim/probe-expert.ts`** (200 parties par bot, mêmes graines ; score moyen Prudent / Équilibré / Casse-cou, survie Équilibré) :

| Variante | Sans build | Couverture légale | Citoyen modèle | Nuit festive |
| :--- | ---: | ---: | ---: | ---: |
| Actuel | 22 / 52 / 128k, 83 % | 24 / 80 / 181k, 84 % | 25 / 102 / 187k, 82 % | 22 / 62 / 113k, 84 % |
| Couverture du Légal 0,2 (au lieu de 0,1) | 26 / 54 / 144k, 83 % | 30 / 84 / 192k, 86 % | 27 / 91 / 226k, 84 % | 24 / 59 / 116k, 84 % |
| Sans plafond des événements | 23 / 54 / 122k, 86 % | 25 / 81 / 185k, 86 % | 25 / 99 / 176k, 83 % | 22 / 65 / 114k, 84 % |
| Sans placement du Cartel | 22 / 52 / 130k, 84 % | 24 / 81 / 176k, 83 % | 25 / 101 / 182k, 82 % | 22 / 60 / 110k, 85 % |

- **Couverture du Légal 0,2 :** tous les plans montent un peu (+2 à +6k en Prudent, +3 points de survie), parce que tous transportent du légal. L'avance de Couverture légale sur Sans build ne grandit pas (+28k → +30k en Équilibré, +53k → +48k en Casse-cou) et Citoyen modèle reste devant en Équilibré et Casse-cou : la dilution ne domine pas.
- **Plafond des événements :** sans effet mesurable. Les bots ne cherchent pas à cumuler les événements (rumeur, prophétie, Karma-Cham) : la sonde ne peut pas dire ce que le plafond retire à un expert qui le ferait.
- **Placement du Cartel :** neutre (±5k en Casse-cou). L'hypothèse d'un placement responsable des baisses du Casse-cou est écartée : elles venaient du décalage du générateur.
- **Tournées après le trajet du jour :** Sans build ne bouge pas par rapport à la campagne Plans précédente (22 / 51 / 126k), mais la Nuit festive perd son avance : 30 / 69 / 105k → 22 / 62 / 113k, survie Équilibré 88 → 84 %. Son bot partait en tournée sans rouler de jour ; sa politique n'a pas encore été revue pour la nouvelle règle.
