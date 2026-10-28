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
