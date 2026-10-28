# 9. Simulation & équilibrage

> Ce chapitre décrit **comment on vérifie que le jeu tient** : des parties jouées automatiquement par des bots, sur le moteur seul (sans interface), en grand nombre. Il fixe la façon de composer les bots, les campagnes à mener, les mesures relevées et les critères d'équilibrage.
> **Quand :** une fois toutes les mécaniques implémentées (chap. 2 à 8). Simuler un jeu incomplet mesurerait un autre jeu.

## Principes
* **Le moteur est la seule référence.** Les bots appellent les mêmes actions que l'interface (`applyAction`), avec les mêmes refus : aucune règle n'est réécrite pour la simulation.
* **Reproductible :** chaque partie part d'une graine. Une partie suspecte se rejoue à l'identique, action par action.
* **Information honnête :** un bot ne voit que ce que voit le joueur (cours du district actuel, mémoire de marché, risque affiché sans la ronde renforcée sauf avec `[CREW-01]`, événements publics). Il ne lit jamais l'état caché ni les tirages à venir. **Contrôle automatique :** chaque bot décide sur une *vue publique* de la partie, où l'état caché est neutralisé (générateur aléatoire, ronde renforcée, événement global de demain, marchés des autres districts) ; un test vérifie qu'il prend exactement les mêmes décisions sur la vue publique et sur l'état complet. Toute différence trahit une fuite d'information.
* **Volume :** assez de parties par configuration pour que les écarts mesurés dépassent le bruit des tirages (plusieurs milliers pour une configuration qu'on compare finement).
* **Une mécanique jamais utilisée avec profit est suspecte** : inutile, mal équilibrée, ou oubliée par les bots.

---

## Composer un bot : trois axes
Un bot est la combinaison d'un **plan**, d'un **tempérament** et d'un **objectif**. Les trois axes sont indépendants : un même plan se joue prudemment ou en casse-cou, pour survivre ou pour viser une grande fin.

### Axe 1 — Le plan (comment on joue)
Le cœur de la stratégie : l'équipement visé, la famille de produits, les mécaniques privilégiées. Chaque plan correspond à un **build** que le design veut rendre viable (chap. 7, *des builds, pas une recette*) ; la simulation vérifie qu'il l'est.

| Plan | Équipement visé | Produits et mécaniques | Question posée |
| :--- | :--- | :--- | :--- |
| **Sans build** | véhicule de départ, rien d'autre | Tier 1–2 en Production, revente là où le cours mémorisé est le meilleur | Le jeu de base suffit-il à survivre ? |
| **Chaîne du froid** | `[VEH-03]`, `[MOD-01]`, `[CREW-03]` | `[TAG-PERISHABLE]`, fraîcheur, savoir-faire | Le build périssable rapporte-t-il assez pour son coût ? |
| **Couverture légale** | `[VEH-02]`, `[MOD-02]` | soute diluée de Tier 0, masquage, produits odorants | La dilution vaut-elle la place perdue en soute ? |
| **Électronique** | `[MOD-03]` | `[TAG-TECH]` vers `[D5]` et `[D6]` | Le blindage rend-il la Tech rentable ? |
| **Nuit festive** | `[MOD-04]`, `[MOD-06]` | tournées de nuit sur mission (et hors mission quand la marge le justifie), profil festif, fuite | La nuit paie-t-elle son risque, son usure et la place des caisses scellées ? |
| **Fuite au sommet** | `[MOD-06]`, `[MOD-09]`, `[CREW-02]` | haut tier vers `[D5]` et `[D6]`, fuite, brouilleur contre les contrôles volants | Le brouilleur rend-il la fuite viable au sommet sans devenir incontournable ? |
| **Corruption** | `[CREW-01]`, `[MOD-08]` | paiement en nature, connivence, `[TAG-ADDICTIVE]` | Payer les agents est-il une stratégie, pas un dernier recours ? |
| **Citoyen modèle** | `[VEH-02]`, `[MOD-08]` | ICC au palier Or, bluff, coupe-file, services qui rendent de l'ICC | Garder l'ICC haut est-il tenable et rentable ? |
| **Rentier** | `[CREW-02]` | cours en temps réel, dépôts offshore précoces | Les intérêts suffisent-ils à porter une partie ? |
| **Haut tier** | `[VEH-04]`, `[MOD-07]`, emprunt tactique | Tier 3–4, racket de `[D4]`, éjection | Le haut tier est-il jouable avant la fin de partie ? |
| **Opportuniste** | aucun imposé | événements du téléscripteur, `[LOC-D4-2]`, `[LOC-D2-1]`, Loterie | Les événements créent-ils des coups à jouer ? |
| **Saboteur** | `[VEH-04]`, `[MOD-03]` | pactole puis `[T4-06]`, fin à Rust Valley | La fin ultime est-elle atteignable sans chance extrême ? |

Un plan est une politique : quand acheter l'équipement (et s'il faut emprunter), quels produits acheter, où les vendre, quel lieu spécial utiliser. Il ne fixe ni le risque accepté (tempérament) ni la fin visée (objectif).

### Axe 2 — Le tempérament (combien de risque)
Quelques réglages qui s'appliquent à n'importe quel plan :

| Tempérament | Risque d'interception max. par trajet | Réserve de Cash-Puce | Tournée de nuit | Réponse au barrage |
| :--- | :--- | :--- | :--- | :--- |
| **Prudent** | bas | gardée (plein + amende possible) | sur mission seulement | fouille ou corruption sûre |
| **Équilibré** | moyen | minimale | sur mission, hors mission si la marge nocturne le justifie | l'option de meilleure espérance |
| **Casse-cou** | élevé | aucune | dès que possible, mission ou non | fuite ou bluff dès qu'ils ont une chance |

Les seuils exacts sont des paramètres de bot, fixés et notés à chaque campagne.

### Axe 3 — L'objectif (pour quoi on joue)
L'objectif change surtout les décisions de fin de partie et quelques contraintes :

| Objectif | Ce qu'il change |
| :--- | :--- |
| **Survivre** | Solder la dette au plus tôt, ne jamais risquer la Santé ni la garde à vue près du Jour 30. |
| **Score maximal** | Tout pour le solde offshore à l'audit, sans condition de fin. |
| **Baron** | Atteindre le seuil, puis sécuriser plutôt que maximiser. |
| **Élite** | Score, plus le palier Or à l'audit : arbitre en permanence ICC contre marge. |
| **Saboteur** | Score, plus `[T4-06]` en soute et la nuit du Jour 30 à Rust Valley. |

### Bots de référence (hors matrice)
* **Novice :** achète ce qui est en Production, revend au meilleur cours mémorisé, accepte toujours la fouille. Sert d'étalon : le jeu doit lui laisser une chance de survivre.
* **Aléatoire :** actions légales tirées au hasard. Ne mesure rien d'équilibre ; vérifie la robustesse (aucun blocage, aucun état incohérent, aucune erreur).
* **Optimiseur :** ne suit aucun plan ; il cherche lui-même la meilleure suite d'actions (recherche gloutonne, puis plus profonde), sous les mêmes règles d'information. C'est lui qui trouve les **stratégies dominantes que personne n'avait prévues** : s'il fait nettement mieux que tous les plans, on a un exploit à comprendre.

---

## Routes commerciales de référence
*Point de départ des plans (axe 1). Intention d'équilibrage, non normatif : en cas d'écart, les listes de [`districts.ts`](../src/data/districts.ts) font foi.*
* **Démarrage (Jours 1–6) :** `[T1-04]` et `[T1-06]` de `[D1]` → vente en `[D4]` → `[T1-01]`, `[T1-03]` ou `[T2-02]` de `[D4]` → revente en `[D2]` ou `[D1]` (plein à `[LOC-D1-2]`). Variante : `[T2-03]`, `[T2-04]` de `[D1]` → `[D2]`, `[D3]` ou `[D5]`.
* **Pharmaceutique (Jours 7–18) :** `[T3-04]` de `[D3]` (plus quelques `[T2-05]` gardés pour les fuites, revendables en `[D1]`) → vente en `[D4]` → `[T3-02]`, `[T3-03]`, `[T3-06]` de `[D4]` → revente en `[D3]` ou `[D5]`, gains mis à l'abri via `[LOC-D5-1]`.
* **Haute trahison (Jours 19–30) :** `[T4-01]`, `[T4-02]` de `[D4]` ou `[T4-05]` de `[D3]` → forcer les barrages de `[D6]` (enchères à `[LOC-D6-1]`) → sécuriser le pactole à `[LOC-D5-1]` avant l'audit.

---

## Mise en œuvre
* **Où :** tout ce qui concerne la simulation est regroupé dans le dossier `sim/`, à part du jeu (`src/`), qu'il utilise sans jamais le modifier : moteur de parties, bots, campagnes, rapports (`sim/reports/`, versionnés) et commande `npm run simulate -- <campagne> [parties]` (`sim/cli.ts` ; campagnes `controle`, `plans` (1), `fins` (2), `hasard` (3), `retraits` (4)). Le jeu ne dépend jamais de `sim/`. Les données brutes par partie restent hors du dépôt.
* **Une partie :** une graine, un bot, puis une boucle « le bot choisit une action, le moteur l'applique » jusqu'à la fin. Un bot est sans mémoire de la partie : il décide à partir de la vue publique seule (l'Aléatoire tire en plus avec son propre générateur, jamais avec celui de la partie). Une action refusée par le moteur est comptée (c'est un défaut du bot) ; au-delà d'un plafond d'actions dans une même journée, la partie force le sommeil et le note.
* **Robustesse :** après chaque action de l'Aléatoire, des **invariants** sont vérifiés (Cash-Puce et dette jamais négatifs, soute dans sa capacité, jauges dans leurs bornes, réservoir plein au plus, une seule interception à la fois…). Une violation est un bug du moteur, rejoué depuis sa graine.
* **Paramètres des bots :** plans, tempéraments et seuils dans `sim/plans.ts` et `sim/bots/trader.ts` ; chaque rapport les cite.
* **Le bot de plan :** un seul « marchand » paramétré par le plan, le tempérament et l'objectif. Chaque jour, dans l'ordre : réponse au barrage ou à l'aléa en cours ; fin de partie (rembourser, rejoindre la Laverie, tout déposer avant l'audit) ; dette et échéances ; ventes rentables ; équipement du plan quand il est abordable sans entamer la réserve ; achats aux meilleures marges espérées (cours mémorisés, sinon profil public du district) pondérées par le risque que le tempérament accepte ; plein ; trajet vers la destination de meilleure espérance sous le risque maximal du tempérament ; enfin le soir (relais, ou tournée de nuit selon le tempérament et la mission). Le barrage se joue à l'espérance : pertes probables de chaque option (caisses, amende, garde à vue, ICC, châssis) pour sa chance affichée.
* **Cours espéré ailleurs :** le cours vu aujourd'hui dans ce district, sinon le dernier cours vu (ou le cours normal) corrigé des événements publics du jour (téléscripteur, contrecoups) : un événement qui fait flamber un district se voit sans y être allé.
* **Synergies jouées par le marchand :** la revente espérée est celle que le moteur calcule (fraîcheur, savoir-faire de `[CREW-03]`, profil de nuit, casse), pas le seul cours ; la corruption offre une caisse appréciée des agents quand la soute en contient ; la fuite est estimée avec ses conséquences réelles (pare-buffles, transpondeur) et l'éjection avec la récupération moyenne de la trappe ; un plan « noctambule » (Nuit festive) tourne la nuit dès que la soute le justifie, un plan « coureur » (pare-buffles, brouilleur) préfère la fuite à espérance proche ; le laissez-passer de la Morgue n'est acheté qu'avec du chimique illégal en soute ; aucun équipement n'est acheté après le Jour 18 (pas rentabilisé avant l'audit) ; la livraison officielle du jour est acceptée quand sa prime, avec moins de place pour acheter, vaut mieux que le meilleur trajet libre.
* **Ne jamais rester garé sans raison :** rien de rentable sous le risque accepté, le marchand fait le trajet sans rien acheter, ou va relever les cours du district vu le moins récemment ; à sec, il garde le carburant et pas sa réserve ; un passage chez Viktor vaut les intérêts évités sur ce qu'il peut rembourser, plus le taux majoré évité s'il solde la dette initiale avant l'échéance du retard (il y engage alors tout sauf le carburant, jamais l'avance qu'il vient d'emprunter).
* **Par étapes :**
  1. moteur, invariants, Novice et Aléatoire (contrôle), marchand avec les plans qui ne demandent qu'un réglage (Sans build, Chaîne du froid, Couverture légale, Électronique, Nuit festive, Corruption, Rentier, Haut tier), objectifs « score maximal » et « survivre » : campagnes Contrôle et 1 ;
  2. plans à logique propre (Fuite au sommet, Citoyen modèle, Opportuniste, Saboteur), objectifs de grande fin : campagnes 2 et 3 ;

### Étape 2 : plans à logique propre et objectifs de grande fin
* **Fuite au sommet :** pare-buffles, brouilleur et Glitch ; préfère la fuite à espérance proche ; favorise la Culture (haut de gamme des districts du sommet).
* **Citoyen modèle :** `[VEH-02]` et faux terminal, soute diluée de Tier 0 ; défend un ICC de 90 : certificat de la Morgue et chantage du Velvet-Silo sous ce seuil, pertes d'ICC pesées quatre fois plus lourd au barrage.
* **Opportuniste :** aucun équipement ; joue les événements du jour (visibles dans tous les districts, voir ci-dessous), prend les commandes VIP du Velvet-Silo (achète les caisses demandées, revient livrer) et commande des paniques à Karma-Cham. **Non joué :** la spéculation sur l'événement de demain (rumeur, prédiction de Cassandre-88). Essayée, elle perdait la moitié du score : parier sur demain sans lier ce pari à l'itinéraire revient à garder des caisses qui ne se vendent pas. Elle est laissée à l'optimiseur (étape 4), comme le faux dossier de Loterie.
* **Saboteur :** `[VEH-04]` et brouillage Tech, Tech favorisée.
* **Objectifs de grande fin :** comme « score maximal », jusqu'au seuil de score de la fin visée (offshore et Cash-Puce).
  * **Baron, Élite :** une fois le seuil atteint, on sécurise : plus aucun illégal (risque accepté nul : livraisons et légal seulement), tout à l'abri offshore sauf le carburant.
  * **Élite :** défend en plus un ICC de 5 points au-dessus du palier Or, comme le Citoyen modèle.
  * **Saboteur :** seuil atteint à partir du Jour 25, il se procure `[T4-06]` dans son district producteur, ne le vend jamais, reste à la Laverie, dépose tout le Jour 30, puis rejoint Rust Valley la dernière nuit (racket des milices, pas de fouille de la BRC).
* **Campagne 3 :** chaque bot sur un grand nombre de graines ; le rapport compare l'écart-type du score entre graines à l'écart entre bots (écart-type des scores moyens).
  3. tests par retrait (campagne 4), avant l'étape 2 si l'équilibrage des équipements l'exige ;
  4. optimiseur et recherche d'exploits (campagne 5).
  Chaque étape corrige d'abord les données qu'elle désigne avant de passer à la suivante.

### Méthode des tests par retrait (campagne 4)
* **Paires :** chaque élément est mesuré dans le plan qui le vise, joué deux fois **sur les mêmes graines** : avec l'élément, puis sans (retiré du plan). La différence se lit partie par partie : un retrait ne change pas le hasard, seulement le jeu.
* **Écart et incertitude :** pour la survie et le score, écart moyen avec son intervalle de confiance à 95 % (sur les différences appariées). Un élément est jugé **positif** ou **négatif** si l'intervalle exclut zéro, **neutre** sinon.
* **Usage :** chaque ligne indique la part des parties où l'élément a été acheté ou utilisé. L'écart mesuré est celui du plan tel qu'il est joué : un élément trop cher, rarement acheté, pèse peu, et c'est déjà une information.
* **Lieux spéciaux :** le marchand utilise un lieu quand il s'y trouve et que le plan le prévoit (chirurgie sous un seuil de Santé, certificat et chantage sous un seuil d'ICC, laissez-passer de la Morgue, panique de Karma-Cham sur le tag le plus présent en soute, enchères des caisses de Tier 3–4). Le Hachoir et l'avance de survie sont mesurés en les retirant du plan de référence.
* **Hors de portée à cette étape :** la prédiction de Cassandre-88, le faux dossier de Loterie et la commande VIP demandent d'anticiper (acheter pour l'événement prédit, viser un tirage, revenir livrer) ; la commande VIP est jouée par le plan Opportuniste (étape 2) ; la prédiction et le faux dossier restent pour l'optimiseur.

## Campagnes
Croiser tous les plans, tempéraments et objectifs donnerait plus d'une centaine de configurations dont beaucoup n'ont pas de sens (un plan Saboteur qui vise seulement de survivre ne teste rien). On mène plutôt des campagnes ciblées, chacune avec sa question.

| Campagne | Configurations jouées | Question |
| :--- | :--- | :--- |
| **1. Viabilité des plans** | chaque plan × les 3 tempéraments, objectif « score maximal » | Chaque build marche-t-il, et pour quel tempérament ? |
| **2. Atteignabilité des fins** | pour chaque grande fin, les 2 ou 3 plans qui la visent naturellement, tempérament équilibré | Chaque fin est-elle atteignable, à quel prix (Game Over, jours de garde à vue) ? |
| **3. Poids du hasard** | les meilleurs plans des campagnes 1 et 2, sur un grand nombre de graines | Le résultat dépend-il plus du joueur que des tirages ? |
| **4. Tests par retrait** | un plan joué avec puis sans l'un de ses éléments (un module, un équipier, une mécanique) | Que rapporte vraiment cet élément ? |
| **5. Recherche d'exploits** | l'optimiseur, puis l'étude de ses meilleures parties | Existe-t-il une stratégie dominante imprévue ? |
| **Contrôle** | Novice et Aléatoire, à chaque version d'équilibrage | Le jeu reste-t-il jouable et robuste ? |

## Mesures relevées par partie
* Fin obtenue et score offshore ; jour de la mort ou du Game Over le cas échéant.
* Jour où la dette initiale est soldée ; dette maximale atteinte ; emprunts tactiques.
* Nombre d'interceptions, option choisie, issue, pertes (₡, caisses, ICC, Santé, châssis), jours de garde à vue.
* Marge nette par trajet, ventes saturées, pics suspects déclenchés, caisses perdues (fraîcheur, casse, explosions).
* Équipements achetés et jour d'achat ; services des lieux spéciaux utilisés.
* Courbes journalières : Cash-Puce, offshore, dette, ICC, Santé, châssis.

## Critères d'équilibrage
Cibles de départ, à recaler avec les premières mesures.

| Campagne | Critère |
| :--- | :--- |
| Contrôle | Le Novice atteint l'audit sans dette dans la majorité des parties. L'Aléatoire ne bloque jamais le moteur. |
| 1 | Chaque plan bat le plan « Sans build » en score moyen pour au moins un tempérament. Aucun plan ne domine tous les autres à la fois en score moyen et en taux de survie. |
| 1 | Le tempérament compte : pour un même plan, le casse-cou a un score plus dispersé et un taux de Game Over plus élevé que le prudent. |
| 2 | Chaque grande fin est obtenue dans une part significative des parties qui la visent. Taux de réussite décroissant de Baron à Élite à Saboteur, taux de Game Over croissant dans le même ordre. |
| 2 | La fin de partie reste tendue : la dette et l'audit pèsent encore dans les derniers jours. |
| 3 | Pour un même bot, l'écart de score entre graines reste inférieur à l'écart entre plans. |
| 4 | Chaque équipement, équipier et lieu spécial améliore le plan qui le vise ; un élément sans effet mesurable est à revoir. |
| 5 | L'optimiseur ne dépasse pas de loin le meilleur plan conçu ; sinon, la stratégie trouvée est documentée puis corrigée ou assumée comme build. |

## Lecture des résultats
* Rapports et analyses : dossier `sim/reports/` (un rapport généré par campagne, plus une analyse rédigée par étape).
* Un écart à une cible se corrige d'abord dans les données (`src/data/`), puis, si besoin, dans une règle : toute règle modifiée l'est d'abord dans le chapitre concerné (règle 7 de [README.md](README.md)).
* Chaque campagne note la version d'équilibrage, les bots joués (plan, tempérament, objectif, paramètres), le nombre de parties et les écarts constatés.
