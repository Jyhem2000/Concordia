# 3. Districts & lieux spéciaux

## Règles géographiques
* **Circulation des citoyens :** vers le bas, libre ; vers le haut, sur laissez-passer **professionnel** seulement (livreurs, personnel de service, techniciens), jamais pour une visite privée, quel que soit l'ICC (chap. 1). La Résidence d'Acclimatation des promus est fermée à tous. C'est le verrou qui rend crédibles les promotions de la Loterie (chap. 6).
* **Accès libre dès le Jour 1 pour le joueur.** En tant que livreur de Catégorie C, il passe partout, par le **réseau logistique**, en trois couches (`access` dans [`districts.ts`](../src/data/districts.ts)) :
  * **voies logistiques de surface**, de jour, entre districts et dans les districts inférieurs : rues et voies rapides réservées aux utilitaires (aléas routiers, contrôles volants en pleine rue) ;
  * **galeries de service**, de nuit : tunnels de maintenance filmés, au-dessus des fermes de serveurs (usure, chap. 1) ; personne à croiser ;
  * **quais de service des élites**, seule entrée des livreurs à `[D5]` et `[D6]`, de jour comme de nuit : jamais d'avenue privée, mais des portiques impitoyables au sas. Même les ministères et les milliardaires ont besoin que les livreurs approvisionnent leurs cuisines, livrent l'eau des domestiques et évacuent leurs déchets.
* **Carte :** les districts ne sont pas tous voisins. Un trajet vers un district non voisin passe par les districts intermédiaires : **un surcoût en rations (`FUEL_PER_CROSSED_DISTRICT` dans [`balance.ts`](../src/data/balance.ts)) et un malus de risque par district traversé (`CROSSED_DISTRICT_RISK`)** (le test d'interception n'a lieu qu'à destination). L'app propose l'itinéraire le plus court.

```
[D4] — [D1] — [D2] — [D5] — [D6]
          \     |     /
           \— [D3] —/
```
  Liaisons : `MAP_LINKS` dans [`districts.ts`](../src/data/districts.ts) (le schéma n'est qu'une illustration). *Ex. :* `[D4]` → `[D6]` traverse `[D1]`, `[D2]` et `[D5]` : trois districts traversés.
* **Pompes :** chaque district a la sienne, où se fait le plein (onglet Lieux, chap. 7). *Officielle* = connectée à Aeterna, **fermée la nuit** sous un seuil d'ICC (`PUMP_NIGHT_MIN_ICC` dans [`balance.ts`](../src/data/balance.ts)) ; *fixe* (pirate) = toujours ouverte.
* **Lieux spéciaux :** ouverts de jour seulement (06h00 – 20h00, chap. 1). **Cooldown :** un service utilisé le jour J redevient disponible le jour J + cooldown. Chiffres : [`locations.ts`](../src/data/locations.ts).
* **Services réservés (deux voies) :** certains services ne s'ouvrent qu'à qui s'est fait une place (`SERVICE_REQUIREMENTS` dans [`locations.ts`](../src/data/locations.ts)). Le lieu les affiche quand même, avec leur condition et la progression vers elle.
  * **Voie officielle**, pour les citoyens présentables et solvables : panique de Karma-Cham (palier d'ICC et patrimoine), faux dossier de la Laverie (patrimoine), Velvet-Silo sur invitation (palier d'ICC et patrimoine).
  * **Voie pègre**, pour les fichés : Cassandre-88 ne parle qu'à qui a déjà une Fiche S.
  * **Clientèle établie :** à la Morgue, le certificat après la dette initiale soldée, le laissez-passer après des ventes de chimique ; la chirurgie reste ouverte à tous.
  * Les conditions d'ICC et de patrimoine valent **au moment de la demande** : qui retombe sous le seuil perd l'accès jusqu'à y remonter. Les autres sont acquises pour la partie.
  * *Patrimoine :* Cash-Puce plus compte offshore.
* **Coefficients de marché** (chap. 2) : chaque district applique un coefficient à ses produits de **Production**, aux produits **Neutres** (1.00) et à ceux en **Forte demande** (plus le bonus de tier).

## Stats des districts
Les stats de chaque district sont dans [`districts.ts`](../src/data/districts.ts), qui fait foi :
* *Échelon :* place dans la pyramide sociale, du pire (0) au meilleur (5).
* *Sécurité :* le nombre d'étoiles entre dans le bluff, la corruption et le plafond de fuite (chap. 5).
* *Risque de base* (chap. 5), *prix du Synthanol*, type de *pompe*, *détection spéciale* (tag ciblé, chap. 2) et présence de *Drones-Juges* (chap. 5), *part de contrôles volants* (chap. 5).
* *Coefficients de marché :* la Forte demande est échelonnée sur le danger — plus le district est risqué, mieux il paie.
* *Production* et *Forte demande :* produits fabriqués sur place et produits les plus recherchés (chap. 2).

---

## `[D1]` « Hives » — Les Ruches Grises (zone de départ)
* **Échelon 1 — Catégorie C, prolétariat sous camisole.** 60 % de la population. Chaleur étouffante (38 °C), eau tiède rationnée, sédation maximale (`[T0-01]` + `[T0-03]`). Rêve anesthésié de monter en `[D2]`.
* **Ambiance :** tours de béton brutales autour de la Cantine Centrale. Les ouvriers passent leurs soirées hypnotisés par les loteries virtuelles. Le marché noir est toléré comme « soupape de décompression » : un peu de vrai soda ou de saucisson le week-end suffit à empêcher les émeutes de la faim.
* **Sécurité :** caméras bas de gamme souvent en panne, patrouilles humaines de la BRC fatiguées et corruptibles.

### `[LOC-D1-1]` L'Arrière-Salle de Viktor Varga (usurier mafieux)
Boucherie clandestine de Viktor Varga et de ses « Bouchers ».
* **Dette :** remboursement, et avance de survie (dans la limite d'un total fixe sur toute la partie, chap. 1, *Dette mafieuse*).
* **Contrats de la Pègre** — les Bouchers ont des clients dans toute la ville, et pas de camion. Chiffres : `CONTRACT` dans [`locations.ts`](../src/data/locations.ts).
  * **Offre :** chaque matin, tant qu'aucun contrat n'est en cours, Viktor en propose un, dès le Jour 1 : un produit de Tier 1 à 3 tiré au hasard, un nombre de caisses selon le tier, un district de destination (jamais `[D1]`) et un délai de quelques jours. La **prime** est fixée d'avance : la valeur de base des caisses, multipliée par un facteur. L'offre du jour disparaît le lendemain matin.
  * **Acceptation :** au guichet, de jour. Un seul contrat à la fois. Les caisses s'achètent où l'on veut, au prix du marché.
  * **Livraison :** dans le district de destination, de jour comme de nuit, jusqu'au dernier jour du délai inclus, avec assez de caisses du produit en soute. Les caisses partent (les plus anciennes d'abord), la prime arrive en Cash-Puce, sans commission ni saturation.
  * **Échec :** le délai passé, à la routine matinale, Viktor ajoute une pénalité à la dette, une part de la prime. Pas de pardon.
  * *Intention :* un objectif à quelques jours, accessible à tous dès le début, qui fait planifier un achat et un trajet ; la prime ne bouge pas avec le marché, mais il faut traverser la ville avec la marchandise.

### `[LOC-D1-2]` La Cantine des Chauffeurs (« Chez Borg »)
Bar enfumé réservé aux routiers, où l'on sert l'eau qui garde la Lucidité.
* **Lucidité :** se trouver en `[D1]` de jour (au réveil ou à l'arrivée) suffit : les routiers passent tous à la Cantine. La Lucidité revient au maximum (chap. 1).
* **Synthanol au tarif syndical :** en `[D1]`, de jour, le plein se fait à la Cantine, au tarif syndical, moins cher que les pompes (`CANTINE` dans [`locations.ts`](../src/data/locations.ts)) ; la pompe officielle du district ne sert que la nuit, une fois la Cantine fermée.

### `[LOC-D1-3]` Le Quai 9 (bar clandestin)
Bar sans licence sous les quais de service. La plupart des chauffeurs de catégorie C restent honnêtes, malgré un régime corrompu, et ne mettent jamais les pieds au Quai 9 : on y croise ceux qui ont choisi le marché noir, et ceux qui cherchent à travailler pour eux.
* **Équipage :** recrutement, remplacement et renvoi de l'équipier actif (chap. 4).

---

## `[D2]` « Pastel-Heights » — L'Éco-Ghetto Bobo & Campus Idéologique
* **Échelon 2 — Catégorie B−, petits soldats idéologiques.** Climatisation modérée (26 °C), gazon synthétique, eau filtrée.
* **Ambiance :** façades pastel, citoyens récemment promus (influenceurs d'État, étudiants zélés, comités de voisinage). Moins drogués que `[D1]`, ils savent d'où ils viennent : leur terreur d'être rétrogradés les pousse à un zèle hystérique : ils dénoncent sans relâche le jour, et s'empiffrent de charcuterie en cachette la nuit.
* **Sécurité :** peu de patrouilles lourdes (agents humains), mais les **Voisins-Vigiles** dénoncent les camions suspects via l'application d'Aeterna pour gagner des points d'ICC.
* **Menace — Délation idéologique :** tout ce qui sent la culture interdite est signalé, la détection de `[TAG-CULTURE]` s'applique ici (chap. 2).

### `[LOC-D2-1]` Le Studio de « Karma-Cham » (influenceuse d'État corrompue)
Icône officielle le jour, mercenaire vénale en coulisses. **Panique Algorithmique sur Commande :**
* **Coût :** une base, plus une hausse par utilisation précédente. **Cooldown** en jours. Chiffres : `KARMA` dans [`locations.ts`](../src/data/locations.ts).
* **Effet :** le joueur choisit **un** tag ; le soir même, une fausse polémique virale force Aeterna à réagir : **le lendemain seulement**, tous les produits de ce tag valent plus cher dans tous les districts (*bonus d'influence*, multiplié avec les événements, sous le même plafond, chap. 2). Le téléscripteur l'annonce.
* **Options :** A « Cancel Wave Culturelle » `[TAG-CULTURE]` · B « Rumeur de Pénurie Alimentaire » `[TAG-PERISHABLE]` · C « Scandale Chimique & Pharmaceutique » `[TAG-CHEMICAL]`.

---

## `[D3]` « Panacea » — Le Complexe Pharmaceutique & Médical
* **Échelon 3 — Catégorie B+, caste scientifique & médicale.** Air stérile (22 °C), vraies douches, cafés de synthèse.
* **Ambiance :** immense secteur blanc saturé de javel : laboratoires du DSC, usines de synthèse, centres de quarantaine. C'est ici qu'Aeterna modélise les « variants saisonniers ». Les chercheurs savent ce qu'il y a dans `[T0-01]` et enchaînent des gardes de 60h, terrifiés qu'une baisse d'ICC les renvoie de l'autre côté de la seringue.
* **Sécurité :** portiques de désinfection obligatoires, bio-scanners IA, agents humains.

### `[LOC-D3-1]` La Morgue Arrière (Dr. K.)
Coûts, durées et effets chiffrés : `MORGUE` dans [`locations.ts`](../src/data/locations.ts).

| Service | Coût | Cooldown | Effet |
| :--- | :--- | :--- | :--- |
| Laissez-passer sanitaire falsifié | fixe | sa durée de validité (jour d'achat compris) | Pendant sa validité : détection `[TAG-CHEMICAL]` annulée en `[D3]` (bio-scanners), et le risque de `[EVT-G02]` ne s'applique pas en `[D3]`. |
| Chirurgie d'urgence | fixe + une part du Cash-Puce | oui | Gain de Santé, sans dépasser un plafond (refusée si la Santé y est déjà). |
| Certificat de décontamination | hausse à chaque utilisation | oui | Gain d'ICC **hors plafond** de gains de route (ce n'est pas un gain de route, chap. 1). |

---

## `[D4]` « Rust Valley » — La Zone Tampon (friche industrielle & anciens abattoirs)
* **Échelon 0 — l'Angle Mort Toléré.** Bannis, survivalistes et contrebandiers sans puce d'ICC, retranchés dans un ancien bassin industriel fluvial contre le mur-frontière.
* **Pourquoi ne fuient-ils pas ?** L'unique accès à l'extérieur est un canal-écluse hérissé de mines magnétiques et de tourelles autonomes : seuls les chalutiers blindés des cartels, munis des codes vendus par les oligarques de `[D6]`, le franchissent de nuit. Et les barons locaux règnent ici en maîtres grâce au ravitaillement occulte de `[D6]`.
* **Pourquoi le régime les tolère :** c'est l'unique sas d'entrée de la contrebande extérieure. Classée « Décharge à Rendement Négatif » pour qu'Aeterna n'y envoie pas la BRC, la zone n'est accessible qu'aux livreurs de Catégorie C, autorisés à y déverser les déchets de la ville.
* **Portique du sas :** le régime tolère la décharge, mais surveille ce qui en sort. Tout trajet **au départ de `[D4]`** passe un portique de décontamination : malus au risque d'interception à destination (`exitGateRisk` dans [`districts.ts`](../src/data/districts.ts)).
* **Ambiance :** mécanos renégats et Bouchers de la Vieille École vivent en seigneurs libres, de petits élevages clandestins, de `[T1-04]` et de prélèvements sur la charcuterie de passage, mais dépendent des livreurs pour les antibiotiques, les nouilles et l'huile de leurs générateurs.
* **Crédits sans puce :** les bannis n'ont pas de puce ; les milices encaissent les ₡ sur des puces mortes qu'elles écoulent ensuite via les livreurs, contre une commission.
* **Zone hors-réseau :** ni caméras, ni BRC. Au calcul du risque, *ce qui dépend d'Aeterna disparaît, ce qui est physique reste* :
  * s'appliquent : risque de base, trajet de nuit, districts traversés, `[EVT-D4-01]`, `[VEH-01]`, `[VEH-04]`, `[CREW-01]`, balise de `[T4-06]`, embuscades de la dette (chap. 1) ;
  * valent 0 : suspicion d'ICC, malus de tags, couverture légale et camouflage de `[VEH-02]`, ronde renforcée, Fiche S, pic suspect, malus d'événements visant la BRC.
* **Menace — Racket des milices** (remplace l'interception de la BRC : ni bluff, ni corruption, ni éjection, ni garde à vue). Le joueur choisit :
  * **Payer le péage :** **une part de la valeur de la soute** (au prix de base ; `RACKET` dans [`balance.ts`](../src/data/balance.ts)), en ₡ **ou** en caisses choisies par les miliciens : d'abord leurs produits favoris, dans l'ordre (`tollFavorites` dans [`districts.ts`](../src/data/districts.ts)), puis les caisses les plus chères, jusqu'à couvrir le péage à la valeur en paiement (chap. 2). La dernière caisse prise peut dépasser le péage : les milices ne rendent pas la monnaie. L'app montre à l'avance les caisses qui seraient prises.
  * **Forcer :** jet de fuite (chap. 5, mêmes bonus, sacrifices et Sédation). La Fiche S est ignorée : ni malus au jet, ni niveau gagné. Aucune perte d'ICC, dopage `[T2-05]` compris. Succès : passage avec dégâts de châssis et casse comme une fuite. Échec : sanction du refus.
  * **Refuser :** les miliciens pillent **une part de la soute (arrondie à la caisse supérieure) en commençant par les caisses les plus chères** (`[T4-06]` compris : il finira chez la rébellion), tabassent le joueur (perte de Santé) et cabossent le camion (perte de châssis).
  * **Modificateur :** `[VEH-04]`.
* **Nuit :** dormir ici = bivouac (chap. 1).
* **Production :** le moteur n'en tire chaque jour qu'une partie (`productionDraw` dans [`districts.ts`](../src/data/districts.ts)).

### `[LOC-D4-1]` Le Garage « Faraday » (Mécano-Mitch)
Tenu par un ancien ingénieur spatial viré pour avoir refusé de manger des insectes. Seul endroit pour :
* acheter un châssis ou des modules, et **monter ou démonter** ses modules (gratuit, chap. 4) ;
* **réparer le châssis :** un prix par PV rendu (`GARAGE` dans [`locations.ts`](../src/data/locations.ts)), réduit par `[EVT-D4-03]` ; le joueur choisit combien de PV réparer.

### `[LOC-D4-2]` Le Bunker de « Cassandre-88 » (l'informateur sous plomb)
Ancien analyste de données d'Aeterna, terré dans une caravane blindée sous les pylônes haute tension.
* **Prédiction :** révèle l'événement global qui frappera **dans deux jours** (J+2) et **garantit** son déclenchement : il est tiré au hasard parmi les événements globaux, et remplace le tirage de ce jour-là. La veille, la rumeur du téléscripteur l'annonce, cette fois sans erreur possible. Les événements locaux restent imprévisibles.
* **Coût :** une base, plus une hausse par utilisation précédente **+ 1 caisse de `[T3-03]`** (`CASSANDRE` dans [`locations.ts`](../src/data/locations.ts)).
* **Limite :** une seule prédiction active à la fois (jusqu'au jour prédit) ; impossible si J+2 dépasse le Jour 30.

---

## `[D5]` « The Glass Spire » — La Flèche de Verre (ministères, banques & censure)
* **Échelon 4 — Catégorie A, haute bureaucratie sous pression.** Appartements de verre à 20 °C, accès occulte au luxe, zéro sédatif pour garder une productivité maximale.
* **Ambiance :** gratte-ciels où travaillent les bureaucrates du DSC, les superviseurs d'Aeterna et les truqueurs de la Loterie. Totalement lucides mais bloqués par le plafond de verre de `[D6]`, ils survivent sous caféine, nicotine, antidépresseurs et délation entre collègues.
* **Sécurité :** portiques à rayons X, scanners électromagnétiques, douaniers d'élite et Drones-Juges.
* **Menace — Urbanisme panoptique** (LiDAR 360°) : l'éjection manuelle est **interdite** (une décharge en ruelle serait filmée) ; seuls `[MOD-07]` (par les égouts) ou `[VEH-04]` la permettent (`ejection` dans [`districts.ts`](../src/data/districts.ts)).

### `[LOC-D5-1]` La Laverie « Crypto-Clean » (banque offshore ministérielle)
Les vrais blanchisseurs ne sont pas les punks de `[D4]` mais les hauts fonctionnaires corrompus du Ministère des Finances, seuls à pouvoir créer des comptes fantômes dans le registre central pour y cacher leurs propres pots-de-vin. Ce sont aussi les superviseurs qui alimentent l'algorithme de la Loterie.
* **Guichet du compte offshore** et **placement du Cartel** (chap. 1).
* **Falsifier un dossier** (`[EVT-L01]`) — c'est Aeterna qui tire au sort : on ne choisit pas le gagnant, on glisse un faux dossier pour que l'algorithme le désigne. C'est un pari.
  * **Quand :** la veille d'un tirage (chap. 6), une fois.
  * **Coût :** une base, plus une hausse par utilisation précédente, perdu même en cas d'échec. **Réussite :** une chance fixe (bonus : `[CREW-02]`). Chiffres : `FORGERY` dans [`locations.ts`](../src/data/locations.ts).
  * **Résolution immédiate :** le joueur sait aussitôt si le faux dossier est passé.
  * **Succès :** la carte choisie impose **un** des deux rôles au tirage du lendemain (l'autre reste tiré au hasard, jamais dans le même district) ; ses effets durent **le jour du tirage et les deux suivants** et remplacent ceux du rôle imposé. Ton équipier est protégé de ce tirage. Le district choisi doit être concerné par la Loterie pour ce rôle (chap. 6).
  * **Échec :** Aeterna détecte l'anomalie et remonte la piste : perte d'ICC et **+1 niveau de Fiche S**. Le tirage se fait normalement, sans protection. *« Votre contribution à la mobilité sociale a été jugée… trop enthousiaste. »*

| Carte | Rôle imposé | Vérité | Effet |
| :--- | :--- | :--- | :--- |
| Un capitaine de la BRC (district au choix) | Promu | Muté « vers le haut »… puis suicidé : il en savait trop. | Risque réduit dans ce district (une recrue le remplace), au lieu de la purge préventive. |
| Un contrebandier concurrent (district au choix) | Promu | Suicidé, sa clientèle orpheline. | **Quotas de demande** majorés dans ce district (cumulable avec `[CREW-03]`). |
| L'indic qui te suit | Promu (district tiré au hasard) | Envoyé « dans un appartement de rêve ». | Au tirage : **Fiche S remise à 0** et gain d'ICC hors plafond ; pas de purge préventive. |
| Un cadre (district de départ au choix) | Déclassé | Dénoncé par toi, renvoyé un étage plus bas. | **Garantit un déclassement** à ce tirage (sans dossier, il n'a lieu qu'une fois sur deux, chap. 6), et tu choisis **le vice qu'il emporte** parmi les produits possibles. |

  *En cas de succès : « Merci pour votre contribution à la mobilité sociale. »*

---

## `[D6]` « Olympus-Green » — La Citadelle Zéro-Carbone des Ultra-Élites
* **Échelon 5 — Catégorie S, l'oligarchie intouchable.** Moins de 1 % de la population, 100 % du pouvoir. Verrière climatisée à 21 °C en surpression, comme une salle blanche.
* **Ambiance :** colline verdoyante sur une dalle d'architecte au-dessus des échangeurs, où règnent les Hauts-Commissaires du DSC et les propriétaires d'Aeterna. Ils imposent la sobriété au peuple en s'offrant banquets de viande et clonage organique. Hors-loterie : tout oligarque jugé déviant est « suicidé » en coulisses.
* **Sécurité :** scanners électromagnétiques, détecteurs biométriques d'ICC, douaniers d'élite et Drones-Juges.
* **Menace — Chiens-robots militaires :** les malus de `[TAG-ODOROUS]` sont multipliés (`odorFactor` dans [`districts.ts`](../src/data/districts.ts)).
* **Menace — Dalle bio-scellée** (grilles laser, capteurs sismiques) : l'éjection est **impossible**, même avec `[MOD-07]` — **sauf** via `[VEH-04]`.

### `[LOC-D6-1]` Le « Velvet-Silo » (cabaret sensoriel & sous-sol de débauche)
Lupanar clandestin et bar à oxygène caché dans les galeries de climatisation sous les villas, accessible par les quais de service. Ouvert de jour seulement : les oligarques festoient en journée climatisée, la nuit appartient aux purges. Chiffres : `VELVET` dans [`locations.ts`](../src/data/locations.ts).

| Service | Cooldown | Coût | Effet |
| :--- | :--- | :--- | :--- |
| Vente aux enchères masquée | oui | — | Vendre **1 caisse** de Tier 3 ou 4 à un multiple du cours local (lot le plus ancien d'abord, état de la caisse compris). |
| Chantage sur l'oreiller | oui | une base plus une hausse par utilisation précédente, en ₡ **ou** en caisses de `[T3-07]` puis `[T3-02]` (lots les plus anciens d'abord) jusqu'à couvrir le montant à la valeur en paiement, sans rendu de monnaie (chap. 2) | Gain d'ICC **hors plafond** (vidéos compromettantes de juges). Les juges finissent par se méfier. |
| Commande spéciale VIP | après résolution (1 contrat actif max) | — | Sur demande, un produit précis de Tier 2 ou 3 **absent de la soute**, tiré au hasard : livrer quelques caisses (`crates`) au Silo avant 20h00 le jour même ou l'un des jours suivants (délai : `deadlineDays` de `VELVET` dans [`locations.ts`](../src/data/locations.ts)), rachetées à un multiple du cours local. **Échec** (constaté à la routine suivant l'échéance) : perte d'ICC et lieu verrouillé plusieurs jours. |

* **Parrainage (fin Élite, chap. 1) :** chaque commande VIP livrée rapproche d'un parrain ; une commande manquée en efface une (le parrain n'aime pas attendre). Le guichet affiche la progression (nombre exigé : `ENDINGS` dans [`balance.ts`](../src/data/balance.ts)).
* **Protection du parrain :** les clients du Silo tiennent les douaniers d'élite. Dans le district du Silo, les caisses d'une commande en cours sont hors de vue des agents : ni risque, ni fouille (chap. 5). Le reste de la soute n'est pas couvert.
* **Enchères & Commande VIP :** le multiple s'applique au cours local ; la commission de puce est prélevée, ainsi que l'effet de l'état de la caisse (abîmée, fraîcheur), mais pas le savoir-faire ; ces ventes sont **hors quota** (elles ne consomment pas la demande et ne déclenchent pas de pic suspect).
