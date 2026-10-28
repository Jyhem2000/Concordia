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

**Critère non atteint.** Un build joué comme une politique fixe (produits favorisés, achats imposés) ne bat pas le jeu libre partie par partie : son coût pèse tôt, son effet arrive trop tard ou trop peu. Le remède est structurel, et c'est l'objet de l'analyse de progression ([docs/propositions/progression.md](../../docs/propositions/progression.md)) : un équipement qui arrive à son heure, à un prix et un effet calibrés pour cette étape de la partie.

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
