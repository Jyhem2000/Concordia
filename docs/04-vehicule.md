# 4. Véhicules, modules & équipage

> Prix, capacités, bonus et salaires : [`vehicles.ts`](../src/data/vehicles.ts), qui fait foi. Ce chapitre porte les règles, les effets et le lore.

## Véhicules
* **Achat** uniquement à `[LOC-D4-1]`, de jour.
* **Changement de châssis :** le nouveau véhicule reprend la marchandise, le carburant (dans la limite de son réservoir) et les modules possédés ; l'ancien est **perdu** (aucune reprise). Le nouveau châssis arrive en parfait état.
  * Achat refusé si la soute actuelle dépasse la capacité du nouveau véhicule.
  * Si le nouveau véhicule a moins de slots, les derniers modules montés sont démontés (ils restent possédés).
* *Lore :* tous les châssis sont des utilitaires officiellement enregistrés auprès du DSC (modifiés en secret par Mécano-Mitch), d'où leur accès à tous les quais de service.
* *Conso :* par trajet, selon la phase, plus le surcoût des districts traversés (chap. 3).
* *Bonus de risque :* les passifs qui réduisent le risque sont des **multiplicateurs** (chap. 5).
* *Stats* (prix, soute, slots de modules, PV max, réservoir, consommation de jour et de nuit) et chiffres des passifs : `VEHICLES` dans [`vehicles.ts`](../src/data/vehicles.ts).

| ID | Nom | Passif |
| :--- | :--- | :--- |
| `[VEH-01]` | Fourgonnette « Citi-Volt » (départ) | **Profil bas :** risque d'interception réduit (multiplicateur, zone hors-réseau comprise). *Éco-Moteur :* consomme autant de nuit que de jour (les autres châssis consomment davantage la nuit). |
| `[VEH-02]` | Navette « Zéro-C » | **Camouflage corporatif :** aux couleurs du DSC ; tant que les caisses `[TAG-LEGAL]` font au moins une part de la cargaison, risque réduit (multiplicateur). Une soute vide n'a rien à cacher : le camouflage s'applique. Sans effet en zone hors-réseau. |
| `[VEH-03]` | Fourgon Bio-Médical « Panacea-V8 » | **Chaîne du froid médicale :** les périssables ne perdent de la fraîcheur qu'**un matin sur deux** (chap. 2). **Transpondeur d'urgence :** en `[D3]` et `[D5]`, lors d'une fuite : chance en plus, **aucun dégât** de châssis en cas de succès, perte d'ICC du succès réduite (arrondie en faveur du joueur). |
| `[VEH-04]` | Compacteur Sanitaire « Bunker-Lourd » | **Monstre blindé & benne acide :** au racket de `[D4]`, péage réduit, et un passage forcé réussi ne coûte **aucun dégât** de châssis. **Broyeur acide :** mode d'éjection utilisable **partout** (`[D5]` et `[D6]` compris), sans cooldown, sans dégât, contrebande dissoute sans récupération (`[MOD-07]` reste prioritaire s'il est disponible). *Contrepartie :* risque accru partout, zone hors-réseau comprise (tonnage hors-norme, c'est physique). |

### Double fond
Chaque châssis a un **double fond** d'origine, soudé par Mécano-Mitch : quelques emplacements cachés sous le plancher, sans slot de module (`hiddenCompartment` dans [`vehicles.ts`](../src/data/vehicles.ts) ; il fait partie de la soute, il ne l'agrandit pas).
* **Remplissage :** par défaut, il contient les caisses illégales les plus chères (prix de base), jusqu'à sa capacité. Les caisses légales n'y vont jamais (rien à cacher). Le joueur peut changer ce choix produit par produit, depuis la soute (chap. 7) :
  * **Envoyer au double fond :** le produit passe avant le remplissage automatique (le dernier envoyé en premier), quitte à en déloger d'autres caisses. Utile quand un événement fait exploser le cours d'un produit moins cher ailleurs.
  * **Retirer du double fond :** le produit n'y entre plus, même s'il est le plus cher.
  * Le choix s'oublie dès que le produit quitte la soute (vendu, saisi, jeté…) : une caisse rachetée plus tard repart du remplissage par défaut.
* **Trop encombrant :** `[T4-06]` n'y entre pas (une baie de serveur, chap. 2). La règle d'exécution sommaire et la fin « Saboteur » ne changent donc pas.
* **À la fouille effective de la BRC** (chap. 5) : un second jet décide si les agents trouvent le double fond. Chance de le trouver : par étoile de sécurité du district (`COMPARTMENT` dans [`balance.ts`](../src/data/balance.ts)), du simple coup d'œil des ruches aux scanners du sommet.
  * **Non trouvé :** ses caisses sont gardées. La sanction est jugée sur la soute visible seulement (formalité si elle est légale, sanction de bas tier si le haut tier était caché).
  * **Trouvé :** tout est confisqué comme sans double fond, la sanction est jugée sur toute la soute, plus une perte d'ICC pour dissimulation.
* **Ne cache pas l'odeur :** le risque d'interception, le bluff et le tarif de corruption se calculent sur toute la soute. Le double fond protège la marchandise, pas le chauffeur.
* **Éjection réussie :** seules les caisses visibles sont larguées ; le double fond reste fermé (pas de fouille). Le racket des milices l'ignore : elles pillent ce qui leur plaît.
* *Intention :* une saisie ne doit plus ruiner toute une partie d'un coup. Quelques caisses de valeur survivent souvent à un contrôle, sans rendre un convoi sûr : plus la soute est grosse, plus la part cachée est petite.

---

## Modules
* Chaque châssis a un nombre strict de slots. Les modules s'achètent **définitivement** à `[LOC-D4-1]` ; un module acheté est monté aussitôt s'il reste un slot libre. C'est **uniquement là** qu'on monte ou démonte (gratuitement) ses modules. Le montage est donc un choix de build pour plusieurs jours, pas un réglage par trajet.
* Seuls les modules **montés** agissent. Prix, catégorie et chiffres : `MODULES` dans [`vehicles.ts`](../src/data/vehicles.ts).
* **Le catalogue en rayons :** Mitch ne sort pas tout à n'importe qui (`requires` de chaque module et véhicule). Le garage affiche tout, avec la condition de ce qui est réservé et la progression vers elle.
  * **Rayon libre** dès le Jour 1 : `[MOD-02]`, `[MOD-04]`, réparations.
  * **Matériel de contrebande**, une fois la dette initiale soldée (client solvable) : `[MOD-01]`, `[MOD-03]`, `[MOD-06]`, `[MOD-07]`, et les châssis `[VEH-03]` et `[VEH-04]`.
  * **Voie pègre**, pour les fichés (première Fiche S) : `[MOD-05]`, `[MOD-09]`, de quoi tromper les caméras et les drones.
  * **Voie officielle**, après quelques commandes du DSC livrées : `[VEH-02]` aux couleurs du DSC et `[MOD-08]`, le faux terminal « Citoyen Or ».

| ID | Nom | Effet |
| :--- | :--- | :--- |
| `[MOD-01]` | Caisson Cryo à l'Azote Volé | **Retard** sur tout le cycle de fraîcheur des `[TAG-PERISHABLE]` (`freshnessDelay`, en jours) : Extra-Frais jusqu'à 20h00 autant de jours après l'achat, et chaque état suivant d'autant plus tard (chap. 2). Protège soute **et** moteur contre `[EVT-G01]` (ni fonte, ni vieillissement, ni usure de châssis ; le coup de chaleur du pilote reste). |
| `[MOD-02]` | Diffuseur d'Échappement « Pin Sylvestre & Javel » | Réduit fortement les malus de `[TAG-ODOROUS]` (risque au trajet et malus de bluff), après les doublements de district ou d'événement. |
| `[MOD-03]` | Doublure en Plomb & Cage de Faraday | Annule la détection de `[TAG-TECH]`. **Cage de Faraday :** les drones perdent le signal du camion, la part de contrôles volants est réduite partout (multiplicateur, chap. 5). |
| `[MOD-04]` | Suspensions & Silentblocs « Velours » | Immunise `[TAG-FRAGILE]` à la casse (fuite et chocs). Annule l'usure de châssis des trajets de nuit (aucune caisse de refroidissement n'est alors consommée). **Silentblocs :** le camion glisse sans bruit dans les galeries ; le malus de risque d'un trajet de nuit hors mission est réduit (multiplicateur, chap. 1). |
| `[MOD-05]` | Plaque d'Immatriculation Rotative « E-Ink » | **Une fois par jour**, lors d'une fuite réussie devant la BRC : annule la perte d'ICC des caméras de trafic. |
| `[MOD-06]` | Pare-Buffles en Acier Trempé | Fuite et passage forcé : chance en plus ; dégâts de châssis de la fuite (succès et échec) et perte de Santé de l'échec divisés (arrondis en faveur du joueur). |
| `[MOD-07]` | Trappe de Largage « Égouts » | Mode d'éjection par les égouts : partout sauf en `[D6]` (dalle bio-scellée), y compris en `[D5]` où l'éjection manuelle est interdite. Cooldown en jours à compter de l'usage, réussi ou non. Réussite plus probable que le mode manuel, sans dégât. **Récupération :** le lendemain à 06h00, des complices rapportent une part tirée au hasard (uniformément, arrondie à la caisse inférieure) des caisses larguées, dans la limite de la place en soute ; le reste est perdu. Les caisses rapportées gardent leur état. |
| `[MOD-08]` | Faux Terminal « Citoyen Or » | Bonus au bluff ; tarif standard de corruption réduit. |
| `[MOD-09]` | Brouilleur de Drones « Grésil » | **Une fois par jour**, quand un drone repère le camion, il le fait décrocher : le **contrôle volant devient un barrage fixe** un peu plus loin (fuite et éjection redeviennent possibles ; l'interception a toujours lieu). **Sabotage d'infrastructure :** découvert lors d'une fouille effective (chap. 5), il est saisi (perdu) et la sanction comprend une garde à vue, même avec une soute de bas tier ou légale. |

---

## Équipage
* **Recrutement** à `[LOC-D1-2]`, de jour, **1 seul équipier actif** à la fois. Le premier recrutement est gratuit ; chaque recrutement suivant coûte des frais. **Renvoyer** l'équipier est gratuit. Chaque équipier ouvre un build différent : sûreté (Vance), information et finance (Glitch), gastronomie périssable (Mama Rosa).
* **Salaire payé d'avance** : à l'embauche pour le jour même, puis à chaque routine matinale, avant toute prestation (chap. 1). S'il ne peut pas être payé en Cash-Puce, l'équipier **ne travaille pas ce jour-là** (aucun bonus) mais reste engagé ; le salaire manqué ne s'ajoute pas à la dette. Les matins passés en cellule, aucun salaire n'est dû et l'équipier reste à son poste. Montants : `CREW` dans [`vehicles.ts`](../src/data/vehicles.ts).
* **Ils ne se présentent pas d'emblée.** Chacun rejoint le joueur après un acte qui le fait remarquer (`requires` de chaque équipier dans [`vehicles.ts`](../src/data/vehicles.ts)) ; d'ici là, la Cantine l'affiche avec sa condition et la progression vers elle :
  * **Vance :** après un contrôle de la BRC franchi sans garde à vue. Il vous a repéré au barrage : vous avez du sang-froid.
  * **Mama Rosa :** après un certain nombre de caisses `[TAG-PERISHABLE]` vendues. Elle ne travaille qu'avec qui connaît la marchandise.
  * **Glitch :** à votre première Fiche S. Elle surveille les fichiers d'Aeterna et vous trouve quand votre nom y entre.
  * Une fois débloqué, un équipier le reste toute la partie (sauf disparition à la Loterie).
* **Disparition** (Loterie, chap. 6) : l'équipier disparaît définitivement (il ne peut plus être recruté), son salaire s'arrête, et le prochain recrutement est gratuit.
* **Discrétion aux portiques :** Glitch et Mama Rosa, recherchées par Aeterna, ne montent jamais en cabine : elles opèrent en amont ou par radio cryptée. Seul Vance voyage en cabine, grâce à son badge d'inspecteur réserviste.

| ID | Équipier | Bonus |
| :--- | :--- | :--- |
| `[CREW-01]` | « L'Ancien de la BRC » — Commandant Vance (copilote accrédité) | **Salaire réduit** s'il **consomme** à 06h00 une caisse `[TAG-ADDICTIVE]` de Tier 2 ou plus (la moins chère au prix de base ; réglage du joueur, activé par défaut) · risque d'interception réduit partout, zone hors-réseau comprise (multiplicateur) · bonus à la corruption · **révèle chaque matin** le district de la ronde renforcée (carte et prévision du risque) |
| `[CREW-02]` | « Glitch » — jeune hackeuse sous caféine (opératrice radio distante) | **Flux pirate :** cours de tous les districts en temps réel (mémoire de marché toujours à jour, jamais brouillée par la Sédation) · rendement offshore majoré sur chaque tranche, sauf les matins en cellule · bonus à la fuite et au passage forcé (elle pirate les feux) · bonus pour falsifier un dossier de Loterie · brouille la balise de `[T4-06]` · **injection du serveur** (voir plus bas) |
| `[CREW-03]` | « La Matriarche » — Mama Rosa Marini (atelier d'affinage) | Produits `[TAG-PERISHABLE]` vendus plus cher (bonus de savoir-faire, chap. 2) · **affinage :** les caisses Standard se vendent au coefficient Extra-Frais · quotas de demande des produits `[TAG-PERISHABLE]` majorés (arrondis au supérieur ; ses maîtres d'hôtel répartissent les livraisons) |

* **Vance :** vieux limier désabusé de l'époque où la police n'était pas dirigée par Aeterna, avec un laissez-passer d'inspecteur honoraire.
* **Glitch :** prodige du code bannie des écoles du DSC pour avoir fait réciter des poèmes anarchistes à Aeterna ; te guide depuis un cyber-squat blindé.
* **Injection du serveur (fin « Résident Réécrit », chap. 1) :** avec `[T4-06]` en soute et Glitch au travail ce jour-là, chaque **tournée de nuit hors mission** qui arrive à destination sans garde à vue (contrôle franchi compris) lui permet de brancher le serveur sur les fermes de serveurs que survolent les galeries de service (chap. 3) et d'injecter un morceau de ton nouveau dossier dans Aeterna. Il en faut plusieurs, pas forcément d'affilée (`ENDINGS` dans [`balance.ts`](../src/data/balance.ts)). Une tournée passée sans interception reste un écart de nuit (Fiche S, chap. 1) : la trace grossit. Une garde à vue interrompt l'injection ; une fouille effective avec le serveur reste mortelle (chap. 2). Une fois l'injection complète, le serveur n'est plus nécessaire.
  * *Pourquoi le serveur ne va pas dans le double fond :* c'est une baie de serveur (encombrante, chap. 2). Le risque se gère autrement : Glitch brouille sa balise, une soute couverte de Tier 0 réduit le risque et aide le bluff, et les trajets courts entre districts voisins sont les moins exposés.
  * **Brouillage de balise :** tant que Glitch travaille, la balise de traçage des produits en soute n'ajoute plus de risque (ligne propre dans le détail du risque).
* **Mama Rosa :** ancienne cheffe triplement étoilée d'avant le Grand Reset, condamnée pour « Terrorisme Gastronomique et Incitation au Cholestérol » ; reconditionne ta marchandise sous faux scellés gastronomiques.
