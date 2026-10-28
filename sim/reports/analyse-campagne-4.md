# Analyse — campagne 4 (tests par retrait)

Rapport brut : [retraits.md](retraits.md) — 24 éléments, 400 parties par variante, mêmes graines avec et sans l'élément (19 200 parties). Équilibrage en vigueur : dette à 5 %/j, risque de base ×0,6 (voir [analyse-etape-1.md](analyse-etape-1.md)).

## Lecture
Chaque écart mesure **le plan tel que le marchand le joue**. Un écart négatif peut venir de l'élément (trop cher, effet trop faible) ou du bot (il paie l'élément sans en tirer parti). Les deux se distinguent en regardant ce que l'élément fait, et par l'essai de prix plus bas ci-dessous.

## Ce qui paie
| Élément | Effet mesuré | Lecture |
| :--- | :--- | :--- |
| **Avance de survie** | survie +12 pts, score +3 400 ₡ | Indispensable : c'est elle qui rattrape une saisie dans les premiers jours. Confirme la décision prise après ton test. |
| **Glitch (`[CREW-02]`)** | survie +3 pts, score +7 200 ₡ | Le seul équipier rentable : cours en temps réel (meilleures destinations) et rendement offshore. |
| **Dilution en Tier 0** | score +10 300 ₡ (survie +6 pts, à la limite du significatif) | La couverture légale fonctionne comme voulu, sans rien acheter. |

## Ce qui ne paie pas
| Élément | Effet mesuré | Lecture |
| :--- | :--- | :--- |
| Modules `[MOD-01]`, `[MOD-04]`, `[MOD-06]`, `[MOD-08]`, `[MOD-09]` | score −3 300 à −11 000 ₡ | Leur prix dépasse ce qu'ils rapportent en 30 jours. Exemple : `[MOD-04]` évite l'usure de nuit, soit environ 200 ₡ de réparation par tournée, pour 6 000 ₡. |
| Vance (`[CREW-01]`), Mama Rosa (`[CREW-03]`) | score −4 500 et −6 600 ₡ | Salaires quotidiens (800 et 1 000 ₡, indexés) plus lourds que leur bonus. |
| `[VEH-04]` | score −12 300 ₡ (11 % d'achat) | 150 000 ₡ pour une grande soute qui expose aussi plus aux saisies. |
| Karma-Cham | score −3 200 ₡ | Un jour de ×1,5 sur un tag ne rapporte qu'avec une grosse cargaison de ce tag ; 10 000 ₡ est un prix de fin de partie. |
| Laissez-passer de la Morgue | survie −3 pts, score −3 700 ₡ | Le bot l'achète à chaque passage à Panacea, même sans chimique : défaut du bot autant que du prix. |
| `[VEH-02]`, `[VEH-03]`, `[MOD-02]`, `[MOD-03]`, `[MOD-05]`, `[MOD-07]`, enchères | neutres | Ni gain ni perte mesurable. |

## Non mesurables à cette étape
Le Hachoir (0 % d'usage : le bot revend lui-même les périssables qui vont pourrir), le chantage (0 %), la chirurgie (2 %) et le certificat (4 %) : les seuils du bot ne sont presque jamais atteints. Cassandre-88, le faux dossier et la commande VIP : étape 2.

## Essai : prix des modules ×0,5, salaires de Vance et Mama Rosa ×0,5, Karma-Cham à 4 000 ₡
300 parties par variante, données remises à l'identique ensuite.

| Élément | Avant | Avec l'essai |
| :--- | :--- | :--- |
| `[MOD-04]` | −4 100 ₡ | −4 000 ₡ |
| `[MOD-06]` | −4 400 ₡ | −3 300 ₡ |
| `[MOD-08]` | −5 500 ₡ | −2 700 ₡ (neutre) |
| `[MOD-01]` | −3 300 ₡ | −1 000 ₡ (neutre) |
| Vance | −4 500 ₡ | +200 ₡ (neutre) |
| Mama Rosa | −6 600 ₡ | −2 400 ₡ (neutre) |
| Karma-Cham | −3 200 ₡ | −2 100 ₡ |

Baisser les prix ramène la plupart des éléments à neutre, **sans les rendre rentables**. Le prix n'est donc qu'une partie du problème : les effets sont modestes à l'échelle d'une partie de 30 jours, ou le marchand ne joue pas les synergies (tournées de nuit avec les suspensions, fuite avec le pare-buffles, corruption en caisses appréciées avec Vance, périssables achetés Extra-Frais avec Mama Rosa).

## Recommandations
1. **Ne pas toucher aux prix à l'aveugle.** D'abord, faire jouer à chaque plan les synergies de son équipement (étape 2 du marchand), puis remesurer : si un élément reste négatif quand il est bien joué, alors son prix ou son effet est à revoir.
2. **Déjà clairs, quel que soit le bot :**
   * les salaires de Vance et Mama Rosa sont trop lourds face à Glitch (même le Glitch peu exploité par le bot est rentable) ;
   * Karma-Cham est un outil de grosse cargaison : son prix doit suivre (baisser la base, ou faire dépendre l'effet de la taille de la cargaison) ;
   * l'économie d'une partie (score moyen de 15 000 à 25 000 ₡) est petite devant le prix des véhicules et des modules haut de gamme : soit l'équipement descend, soit les marges montent avec la taille de la soute.
3. **Mesures à ajouter :** le Hachoir, la chirurgie, le certificat et le chantage demandent des comportements que le bot n'a pas encore (garder des périssables, laisser descendre l'ICC) ; à reprendre avec l'optimiseur.

## Remesure après les synergies du marchand
Le marchand joue désormais les synergies de son équipement (chap. 9, Mise en œuvre). Pour cela, il estime la revente comme le moteur la calcule (fraîcheur, Mama Rosa, profil de nuit), offre des caisses appréciées à la corruption, estime la fuite avec ses conséquences réelles et l'éjection avec la trappe. Il fait aussi des tournées de nuit pour Nuit festive, préfère la fuite pour les plans « coureurs », n'achète le laissez-passer qu'avec du chimique, et n'achète plus d'équipement après le Jour 18. 400 parties par variante.

| Élément | Avant | Après les synergies | Lecture |
| :--- | :--- | :--- | :--- |
| `[MOD-01]` | −3 300 ₡, survie −2 pts | −800 ₡ (neutre) | La fraîcheur comptée à sa valeur : il ne perd plus d'argent, il n'en gagne pas. |
| Laissez-passer | −3 700 ₡, survie −3 pts | −1 750 ₡, survie neutre (usage 53 % → 26 %) | Le défaut du bot est corrigé ; reste un coût net. |
| Certificat | −660 ₡ | neutre | — |
| `[MOD-04]` | −4 100 ₡ | −5 300 ₡, **survie −3 pts** | Plus de tournées de nuit = plus de risque : **la nuit elle-même ne paie pas** à ce stade (malus de risque + Fiche S), les suspensions n'y changent rien. |
| `[MOD-06]`, `[MOD-09]` | −4 400 ₡, −11 000 ₡ | −5 500 ₡, −7 800 ₡ (survie −2 pts) | Préférer la fuite ne la rend pas rentable. |
| `[MOD-03]` | neutre | −6 200 ₡, survie −2 pts | Le brouillage Tech pousse à charger plus de Tech, donc à perdre plus à chaque saisie. |
| `[MOD-08]`, Vance | −5 500 ₡, −4 500 ₡ | −3 000 ₡, −4 100 ₡ | Les caisses appréciées aident un peu, sans compenser le prix et le salaire. |
| Mama Rosa | −6 600 ₡ | −6 500 ₡ | Inchangé : 1 000 ₡/j, soit 30 000 ₡ sur une partie, pour un bonus sur quelques caisses par jour. |
| Glitch | +7 200 ₡ | +4 100 ₡ (neutre, ± 4 400) | Toujours le meilleur équipier, mais plus significatif. |
| Avance de survie, dilution | +12 pts ; +10 300 ₡ | +12 pts ; **+13 pts et +13 700 ₡** | Confirmés : les deux seules décisions qui pèsent vraiment. |

**Conclusion :** même bien joué, presque aucun équipement ne paie. Ce n'est plus le bot : c'est l'échelle. Une partie rapporte 15 000 à 30 000 ₡ en moyenne, et le **survivant médian finit avec quelques centaines de ₡** (campagne 1). Chaque saisie confisque toute la soute illégale, et le volume d'achat est plafonné par les stocks. Un module à 15 000 ₡ ou un salaire de 30 000 ₡ sur la partie ne peut pas se rentabiliser dans cette économie.

## Essai : stocks et quotas de demande ×5
Campagne 1 (24 bots, 200 parties chacun), données remises à l'identique ensuite.

| Mesure | Stocks actuels | Stocks ×5 |
| :--- | :--- | :--- |
| Survie | 42 à 78 % | 48 à 74 % (+0 à +8 pts pour les Casse-cou, ±3 pts sinon) |
| Score moyen | 3 000 à 69 000 ₡ (ex. Couverture légale · Équilibré 31 300 ₡, Corruption · Casse-cou 51 000 ₡) | +20 à +70 % (38 000 ₡ et 88 000 ₡) |
| Score médian | ≈ 0 à 6 000 ₡ | inchangé |
| Score p90 | référence | jusqu'à ×2 |

Les limites de stock **ne décident pas de la survie** : elles brident seulement les parties qui gagnent déjà, et les retirer étire la queue haute de la distribution sans aider la partie médiane. Ce qui ruine la partie médiane, c'est la saisie totale (une interception sur quatre trajets, toute la soute illégale perdue).
