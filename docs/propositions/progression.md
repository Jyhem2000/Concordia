# Proposition — une mini-progression : débloquer les mécaniques au fil de la partie

> **Statut : analyse, rien n'est décidé ni codé.** Ce document inventorie chaque mécanique, les conditions qui pourraient la débloquer (ou la faire évoluer), et ce que cela changerait sur une partie. Les mesures viennent du simulateur (chap. 9). Une fois les choix tranchés, les règles retenues rejoindront leurs chapitres et ce document disparaîtra.

## Pourquoi
Aujourd'hui, tout est ouvert dès le Jour 1 : six districts, huit lieux spéciaux, trois véhicules, neuf modules, trois équipiers, les cinq tiers, les missions, l'emprunt. Quatre constats plaident pour une progression :

1. **Lisibilité :** un nouveau joueur voit tout d'un coup. Une mécanique qui arrive à son heure s'apprend au moment où elle sert, ce qui prépare aussi le manuel en jeu (feuille de route, étape 2).
2. **Équipement :** les simulations montrent qu'un build payé ne bat pas le jeu libre sur une même partie (32 à 55 % des parties départagées ; [analyse-etape-2.md](../../sim/reports/analyse-etape-2.md)). Gratuit, il gagne (61 à 78 %). Acheté au Jour 4–9, il prive le capital de son effet boule de neige au pire moment. Un équipement qui arrive plus tard, calibré pour cette étape, peut enfin compter.
3. **Hasard :** les gros écarts entre parties naissent tôt (le Cash-Puce du Jour 5 explique à lui seul ≈ 20 % du score). Le Casse-cou qui joue tout son capital en Tier 3 au Jour 2 transforme la partie en loterie.
4. **Arc narratif :** le joueur commence livreur de Catégorie C endetté et finit baron, oligarque ou saboteur. Rien ne marque aujourd'hui ce chemin entre les deux.

## Principes proposés
- **Visible :** tout ce qui est verrouillé s'affiche, avec sa condition et la progression vers elle (« Glitch vous contactera quand votre profil apparaîtra dans les journaux d'Aeterna : Fiche S 0/1 »). C'est la règle de transparence (chap. 10) : le joueur comprend toujours pourquoi.
- **Gagné par le jeu plutôt que par le calendrier :** une condition de jour seule est lisible mais ne raconte rien. Elle sert de garde-fou (« pas avant le Jour 3 »), pas de moteur.
- **Des voies, pas une échelle :** plusieurs conditions de nature différente, pour que deux parties ne débloquent pas la même chose dans le même ordre.
- **Jamais de verrou définitif** sauf par le lore (Loterie, saisie) : un joueur qui a mal commencé doit pouvoir rattraper.
- **Tenir en 30 jours :** une progression en trois temps (apprendre, s'étendre, viser une fin), pas un arbre de compétences.

## Les conditions possibles
| Famille | Exemples | Ce qu'elle raconte | Limites |
| :--- | :--- | :--- | :--- |
| **Temps** | à partir du Jour 3, 5, 10 | Le bouche-à-oreille met du temps ; la ville vous découvre. | Aucune décision. À réserver aux garde-fous. |
| **Dette** | dette initiale soldée (déjà : emprunt tactique, collecte, écran des objectifs) | On ne prête qu'aux solvables ; Viktor vous présente du monde. | Un seul palier, binaire. |
| **Argent** | Cash-Puce ou patrimoine (Cash-Puce + offshore) ≥ X à l'entrée | Les fournisseurs et les lieux chics trient leurs clients. | Récompense ceux qui ont déjà. À doser pour ne pas creuser l'écart. |
| **ICC haut** | palier Or, ou au moins ordinaire (déjà : Velvet-Silo fermé sous ordinaire) | La voie officielle : le DSC confie plus à qui est conforme. | Pousse à ne pas prendre de risque : une voie, pas la seule. |
| **ICC bas, Fiche S** | Fiche S ≥ 1, ICC sous ordinaire | La pègre ne parle qu'aux fichés : un profil propre est suspect. | Paradoxe voulu : le risque ouvre des portes. |
| **Réputation par l'usage** | N livraisons officielles faites ; N ventes d'un tag ; N contrôles franchis ; N fuites réussies | On devient quelqu'un par ce qu'on fait. | Nouveaux compteurs dans la sauvegarde et à afficher. |
| **Contacts en chaîne** | Viktor vous présente Mitch, Mitch vous présente Cassandre | Le réseau se construit par relations. | Ordre fixe, donc rejouabilité faible si la chaîne est unique. |
| **Véhicule** | un module seulement sur certains châssis ; un équipier qui a besoin d'un siège | La logique mécanique : on ne soude pas un caisson cryo sur une fourgonnette. | Restreint les builds. Les slots le font déjà en partie. |
| **Événements** | la Loterie ouvre ou ferme un lieu quelques jours ; un événement global fait apparaître un fournisseur | Le monde bouge sans le joueur. | Hasard en plus : à doser. |
| **Lieu visité** | il faut être passé par un district (ou y avoir vendu) pour y accéder à un lieu | Exploration. | Le joueur passe déjà partout dès le Jour 1. |

## Mécanique par mécanique

### Équipiers (`[LOC-D1-2]`, chap. 5)
Achetés en médiane au **Jour 4** par le marchand. Mama Rosa et Vance restent négatifs ou neutres à leur prix (campagne 4).

| Équipier | Proposition | Justification | Effet attendu |
| :--- | :--- | :--- | :--- |
| Aucun au Jour 1 | Personne à la Cantine avant le Jour 3 (garde-fou) | On ne confie pas sa vie à un inconnu au premier jour. | Premier jour plus simple ; peu d'effet mesurable (le marchand recrute au J4). |
| **Vance** (ex-BRC) | Après le **premier contrôle franchi** (ou ICC ≥ ordinaire) | Il vous repère au barrage : vous avez du sang-froid. | Récompense le premier barrage passé, ce qui en fait un moment marquant plutôt qu'une simple perte. |
| **Mama Rosa** | Après **N ventes de périssables** (par ex. 10 caisses) | Elle ne travaille qu'avec qui connaît la marchandise. | Le build périssable devient un chemin : on y entre par le commerce, puis l'équipière le décuple. |
| **Glitch** | **Fiche S ≥ 1** (son nom apparaît dans les journaux d'Aeterna), ou Jour 5 | Elle surveille les fichiers d'Aeterna et vous trouve quand vous y entrez. | Transforme le premier écart (fuite, tournée clandestine) en ouverture. |

À combiner avec la remarque de la campagne 4 : un salaire qui monte avec le stage (ou un recrutement plus cher plus tard) garderait l'équipier utile en fin de partie.

### Lieux spéciaux (chap. 4)
| Lieu | Aujourd'hui | Proposition | Justification | Effet attendu |
| :--- | :--- | :--- | :--- | :--- |
| Viktor (`[LOC-D1-1]`) | ouvert | ouvert (la dette) ; l'emprunt tactique reste après la dette soldée | Point de départ. | — |
| Cantine (`[LOC-D1-2]`) | ouvert | ouverte ; ses équipiers arrivent (ci-dessus) | Point de départ. | — |
| Karma-Cham (`[LOC-D2-1]`) | ouvert, négatif en moyenne | **ICC ≥ ordinaire** et **patrimoine ≥ X** : une influenceuse ne reçoit que les respectables qui paient | Voie officielle. | Arrive quand on a une soute qui vaut une panique. Corrige son usage trop tôt (campagne 4). |
| Morgue (`[LOC-D3-1]`) | ouverte | Chirurgie ouverte ; **certificat** après la dette soldée ; **laissez-passer** après N ventes de chimique | Dr. K. ne couvre que les habitués. | Le laissez-passer arrive avec le build chimique, pas avant. |
| Garage (`[LOC-D4-1]`) | tout le catalogue | **catalogue qui grandit** (ci-dessous) | Mitch ne sort ses pièces sensibles qu'aux clients sûrs. | L'équipement devient une progression, pas un achat du Jour 4. |
| Cassandre-88 (`[LOC-D4-2]`) | ouvert | **Fiche S ≥ 1** ou présentation par Mitch (N achats au garage) | L'informateur sous plomb ne parle qu'aux fichés. | Voie pègre. La prédiction arrive quand le joueur sait en profiter. |
| Laverie, offshore (`[LOC-D5-1]`) | ouverte | dépôt ouvert dès le Jour 1 (sinon l'audit vaporise tout) ; **intérêts** ou **tranches hautes** après un dépôt cumulé ≥ X | Les comptes fantômes sont pour les gros clients. | Le Rentier gagne sa voie au lieu de l'avoir d'office. |
| Laverie, faux dossier | ouvert | **patrimoine ≥ X** et **ICC Or** (les superviseurs de la Loterie ne trafiquent que pour les leurs), ou Fiche S élevée par la carte de l'indic | Voie officielle et voie pègre se rejoignent ici. | Mécanique de milieu de partie, plus du Jour 1. |
| Velvet-Silo (`[LOC-D6-1]`) | fermé sous ICC ordinaire | **invitation** : patrimoine ≥ X, ou une commande VIP proposée par Karma-Cham | Le cabaret des ultra-élites ne s'ouvre pas au premier livreur venu. | Lieu de fin de partie, lié aux grandes fins. |

### Garage : véhicules, modules, double fond (chap. 5)
Achats médians du marchand : modules aux Jours 5–9, `[VEH-02]` au J9, `[VEH-03]` au J12, `[VEH-04]` au J12–14 (rare).

| Élément | Proposition | Justification | Effet attendu |
| :--- | :--- | :--- | :--- |
| Catalogue en trois rayons | **Rayon 1** dès le Jour 1 : réparations, `[MOD-04]`, `[MOD-02]`. **Rayon 2** après la dette soldée : `[MOD-01]`, `[MOD-03]`, `[MOD-06]`, `[MOD-07]`. **Rayon 3** pour les clients fichés ou fortunés : `[MOD-05]`, `[MOD-08]`, `[MOD-09]` | Mitch vend d'abord du confort, puis du matériel de contrebande, puis de quoi tromper Aeterna. | L'équipement devient un palier ; ses prix peuvent viser l'étape où il arrive. |
| Modules par châssis | `[MOD-01]` (caisson cryo) seulement sur `[VEH-03]` ou `[VEH-04]` ; `[MOD-07]` (trappe) pas sur `[VEH-01]` | Il faut de la place sous le plancher. | Rend le choix du châssis structurant. Restreint des combinaisons : à mesurer. |
| `[VEH-02]` Zéro-C | **N livraisons officielles** faites (le DSC prête ses couleurs aux livreurs de confiance) | Voie officielle. | La livraison du jour devient un tremplin, pas un simple revenu. |
| `[VEH-03]` Panacea-V8 | après un passage à la Morgue (contact de Dr. K.) | Fourgon bio-médical : il faut un contact au complexe. | Le build périssable et chimique se construit par `[D3]`. |
| `[VEH-04]` Bunker-Lourd | dette soldée et patrimoine ≥ X | Le compacteur se négocie à Rust Valley, entre gens solvables. | Arrive en fin de partie, là où sa soute sert les grandes fins. |
| Double fond | agrandissable au garage (rayon 2), choix de son contenu avec la vue véhicule (chap. 10, à venir) | Mitch soude un vrai double fond. | Une progression défensive, mesurée par la campagne 4 comme le levier qui réduit le plus l'écart entre parties. |

### Produits et tiers (chap. 3 et 7)
| Proposition | Justification | Effet attendu |
| :--- | :--- | :--- |
| **Tier 3** en boutique après la dette initiale soldée (ou à partir du Jour 6) ; **Tier 4** avec un patrimoine ≥ X (ou à partir du Jour 12) | Les fournisseurs de haut tier ne vendent pas à un livreur endetté. | Supprime la loterie du Jour 2 (tout le capital en Tier 3), première cause d'écart entre parties. Voir les mesures ci-dessous. |
| `[T4-06]` seulement avec Fiche S ≥ 2 **ou** un contact (Cassandre) | Le serveur d'Aeterna ne se trouve que dans les cercles les plus surveillés. | La fin Saboteur devient une quête : risque, contacts, puis la nuit à Rust Valley. |
| Ventes : Forte demande révélée par un contact (Karma-Cham, Glitch) avant d'être publique | Information comme progression. | Valorise les équipiers d'information sans toucher aux prix. |

### Missions et livraisons (chap. 2)
| Proposition | Justification | Effet attendu |
| :--- | :--- | :--- |
| Livraison du jour : ouverte dès le Jour 1, **prime qui monte** avec le nombre de livraisons faites (confiance du DSC) | Le livreur fiable obtient de meilleures courses. | Le Prudent progresse lui aussi ; la voie officielle a son arc. |
| Mission de nuit : après **N livraisons de jour** (ou ICC ≥ ordinaire) | La plateforme ne confie pas la nuit à un inconnu. | Retire un choix du soir aux premiers jours ; la nuit arrive quand on comprend le jour. |
| Commande VIP (Velvet-Silo) : sur invitation (ci-dessus) | — | Mécanique de fin de partie. |

### Finance (chap. 7)
| Proposition | Justification | Effet attendu |
| :--- | :--- | :--- |
| Avance de survie : inchangée (filet du début, la plus utile des mesures) | — | — |
| Emprunt tactique : plafond qui monte avec le patrimoine (ou les remboursements faits à temps) | Viktor prête à qui rembourse. | Levier de fin de partie pour viser une grande fin, mérité. |
| Tranches offshore : la plus haute ouverte par un dépôt cumulé ≥ X | Voir la Laverie. | Le Rentier a une progression. |

### Événements (chap. 8)
| Proposition | Justification | Effet attendu |
| :--- | :--- | :--- |
| Rumeurs : leur fiabilité affichée seulement avec un contact (Glitch, Cassandre) | L'information se mérite. | Valorise les contacts ; sans contact, la rumeur reste lisible mais incertaine. |
| Loterie : un promu ou un déclassé peut ouvrir ou fermer un lieu de son district quelques jours (un cadre déclassé emporte son vice et ses contacts) | La Loterie redessine déjà la demande ; elle redessinerait l'accès. | Le monde bouge ; à doser (hasard en plus). |
| Événements globaux, locaux, aléas : sans condition | Ils sont le décor et le hasard du jour. | — |

### Districts et réseau (chap. 4)
Le lore dit que le livreur de Catégorie C passe partout dès le Jour 1. Le garder : verrouiller un district couperait les routes, et le réseau à trois couches est déjà riche. La progression passe par ce qu'on y trouve (lieux, tiers, contacts), pas par l'accès.

### Barrage (chap. 6)
Les options restent toutes ouvertes (bluff, corruption, fuite, éjection) : ce sont les réponses de base. Les aides arrivent avec l'équipement et les produits, donc avec la progression ci-dessus.

### Grandes fins (chap. 2)
Déjà : l'écran des objectifs s'ouvre avec la dette soldée. Les voies proposées y mènent naturellement :
- **voie officielle** (ICC, livraisons, Zéro-C, Karma-Cham) → **Élite** ;
- **voie pègre** (Fiche S, Glitch, Cassandre, rayon 3) → **Baron** ;
- **les deux, plus le patrimoine** (`[T4-06]`, Bunker-Lourd) → **Saboteur**.

Les seuils de score des fins, aujourd'hui hors d'atteinte pour le Saboteur (campagne 2), seraient à recaler avec cette progression.

## Ce que cela changerait sur une partie
- **Jours 1–5, apprendre :**
  - Hives, Pastel-Heights, Rust Valley ;
  - livraisons officielles, Tier 0–2 ;
  - rembourser Viktor ;
  - premiers équipiers au Jour 3–5, selon ce qu'on a fait.
- **Jours 6–15, s'étendre :**
  - dette soldée, Tier 3 et rayon 2 du garage ;
  - une voie se dessine (officielle ou pègre) ;
  - premiers lieux de voie (Karma-Cham ou Cassandre).
- **Jours 16–30, viser une fin :**
  - Tier 4, Velvet-Silo, Bunker-Lourd, faux dossier ;
  - la grande fin selon la voie.
- **Sur l'équilibrage :** moins de loterie au début, des équipements calibrés pour l'étape où ils arrivent (et donc enfin rentables), des fins liées à des voies plutôt qu'au seul score.
- **Sur le code :**
  - quelques compteurs de réputation dans la sauvegarde (livraisons faites, ventes par tag, contrôles franchis) ;
  - une fonction de déblocage par élément, qui rend la condition et la progression, comme les `check*` actuels ;
  - l'affichage des verrous ;
  - les règles dans leurs chapitres, et un test qui vérifie que chaque condition a son texte.
  - Coût moyen : le plus gros est l'interface des verrous.

## Mesures (simulateur, sondes)
Verrous simulés en cachant au marchand ce qui n'est pas débloqué (sonde `sim/probe-progression.ts`), 300 parties par variante, mêmes graines. « Bat la référence » : part des parties départagées où la variante fait mieux que le jeu sans verrou.

| Sonde | Référence | Avec le verrou | Bat la référence |
| :--- | :--- | :--- | :--- |
| Tier 3 au J6, Tier 4 au J12 — Équilibré | 56 000 ₡, CV 1,16, survie 84 % | 47 000 ₡, CV 1,22, survie 84 % | 45 % |
| Tier 3–4 après la dette — Équilibré | idem | 45 000 ₡, CV 1,28, survie 81 % | 43 % |
| Tier 3 au J6, Tier 4 au J12 — Casse-cou | 139 000 ₡, CV 1,49, survie 67 % | 72 000 ₡, CV 1,89, survie 70 % | 43 % |
| Tier 3–4 après la dette — Casse-cou | idem | 107 000 ₡, CV 1,78, survie 69 % | 41 % |
| Vance au J3 — Corruption | 59 000 ₡, survie 81 % | 62 000 ₡, survie 81 % | 77 % |
| Mama Rosa au J3 — Chaîne du froid | 39 000 ₡ | 38 000 ₡ | 59 % |
| Glitch au J5 — Rentier | 54 000 ₡ | 50 000 ₡ | 53 % |
| Garage après la dette — Couverture légale | 69 000 ₡, survie 76 % | 74 000 ₡, survie 78 % | 74 % |
| Garage après la dette — Citoyen modèle | 86 000 ₡ | 82 000 ₡ | 15 % |
| Garage après la dette — Fuite au sommet | 50 000 ₡ | 50 000 ₡ | 41 % |

**Lecture :**
- **Verrouiller le haut tier ne réduit pas le hasard**, contrairement à l'hypothèse : il retire surtout les gros gains. Le score moyen baisse, l'écart relatif monte, la survie ne bouge presque pas. Le haut tier n'est donc pas la loterie qui ruine : c'est ce qui fait gagner gros. Si on le verrouille, c'est pour la lisibilité et l'arc de la partie, en relevant ailleurs ce qu'on retire.
- **Les équipiers échelonnés ne coûtent rien**, voire aident : on économise les salaires des premiers jours (Corruption bat sa version d'origine sur 77 % des parties). Un verrou de début de partie sur l'équipage est sans risque.
- **Le garage après la dette** aide la Couverture légale (74 %), ne change rien à la Fuite au sommet, et pénalise le Citoyen modèle, dont le `[MOD-08]` paie tôt. Un catalogue en rayons doit donc garder tôt ce qui sert la voie officielle.
- **Ce que les sondes ne mesurent pas :** l'effet sur un joueur humain, le principal argument d'une progression (apprendre, avoir des objectifs). Le marchand n'apprend rien et ne s'ennuie pas.

## Recommandation
1. **D'abord ce qui ne coûte rien et raconte quelque chose :**
   - équipiers échelonnés et liés à des actes : Vance au premier contrôle franchi, Mama Rosa après des ventes de périssables, Glitch à la première Fiche S ;
   - mission de nuit après quelques livraisons de jour ;
   - prime des livraisons qui monte avec la confiance du DSC.
2. **Ensuite les voies :**
   - lieux conditionnés par l'ICC ou la Fiche S : Karma-Cham et faux dossier côté officiel, Cassandre côté pègre, Velvet-Silo sur invitation ;
   - catalogue du garage en rayons, prix recalés pour l'étape où chaque rayon s'ouvre.
3. **Le haut tier en dernier, et seulement pour l'arc de la partie :** s'il est verrouillé, relever d'autant les gains de milieu de partie pour ne pas rendre le jeu plus pauvre.
4. **Toujours afficher les verrous et la progression vers eux**, et recaler les seuils des grandes fins sur les voies.
