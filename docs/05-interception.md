# 5. Interception par la BRC

> Ce chapitre porte les formules et les issues. Les bonus apportés par un district, un tag, un véhicule, un module, un équipier ou un événement sont chiffrés **chez cette donnée**.
> **Transparence :** toutes ces probabilités sont calculées par l'app et affichées avec leur détail ligne par ligne (chap. 7). Le joueur n'a jamais à calculer, mais peut toujours comprendre et optimiser.

## Risque d'interception
À chaque trajet, le moteur calcule la probabilité de tomber sur un barrage de la BRC dans le district de destination. En `[D4]`, règle propre (chap. 3).

```
Risque = ( Base_District + Suspicion + Malus_Tags + Malus_Contexte − Couverture )
         × Bonus_Équipement × Multiplicateurs_finaux
```

Le résultat est **borné, après** tous les multiplicateurs (`RISK_BOUNDS` dans [`balance.ts`](../src/data/balance.ts)). Seule exception : l'interception automatique des Déviants notoires en `[D6]` (chap. 1), certaine.

| Terme | Calcul / sources |
| :--- | :--- |
| **Base_District** | risque de base du district ([`districts.ts`](../src/data/districts.ts)) ; remplacé par `[EVT-D5-02]` |
| **Suspicion** | selon l'ICC (chap. 1) |
| **Malus_Tags** | pour chaque tag détectable : *valeur du tag × part de la cargaison* — `[TAG-ODOROUS]`, `[TAG-TECH]`, `[TAG-CHEMICAL]`, `[TAG-CULTURE]` |
| **Malus_Contexte** (additif) | trajet de nuit hors mission (chap. 1), districts traversés (chap. 3), portique du sas de `[D4]` (chap. 3), `[VEH-04]`, balise de `[T4-06]` (brouillée par `[CREW-02]`), ronde renforcée, Fiche S, pic suspect de la veille (chap. 2), embuscades de la dette (chap. 1), purge préventive de `[EVT-L01]`, carte « capitaine de la BRC » de `[LOC-D5-1]` (négative), `[EVT-G02]`, `[EVT-D1-03]`, `[EVT-D4-01]` |
| **Couverture** (additive) | `[TAG-LEGAL]` |
| **Bonus_Équipement** (multiplicatif) | produit des coefficients de `[VEH-01]`, `[VEH-02]`, `[CREW-01]` et du coupe-file Citoyen Or (chap. 1) |
| **Multiplicateurs_finaux** | `[EVT-D3-02]`, `[EVT-D5-03]` |

*Pourquoi multiplicatif :* chaque bonus d'équipement garde sa valeur relative, mais leur cumul ne fait jamais tomber le risque à zéro. Le danger d'un district reste lisible quel que soit le build.

**Part de la cargaison :** (caisses du tag non masquées + poids d'une caisse masquée × caisses du tag masquées) ÷ caisses transportées (`MASKED_CRATE_WEIGHT` dans [`balance.ts`](../src/data/balance.ts)) (masquage, chap. 2). Une soute « diluée » dans du légal est donc moins suspecte, quelle que soit la taille du camion.

**Exemple affiché au joueur** *(valeurs indicatives)* : `[VEH-02]` vers `[D5]` de jour, ICC 80 %, 12 caisses dont 4 `[TAG-TECH]` et 6 `[TAG-LEGAL]`.
`( 24 (base) + 10 (suspicion) + 50 × 4/12 (Tech) − 10 × 6/12 (couverture) ) × 0,85 (Zéro-C) = 45,7 × 0,85 = 38,8 % → 39 %`

**Ronde renforcée :** chaque matin (et dès le Jour 1), Aeterna tire **1 district** hors zone hors-réseau : malus de risque pour la journée (`PATROL_RISK` dans [`balance.ts`](../src/data/balance.ts)). Caché au joueur, sauf avec `[CREW-01]`.

### Fiche S algorithmique (niveau de recherche)
* Chaque **fuite réussie** ajoute **1 niveau**, jusqu'à un maximum ; chaque **trajet de nuit hors mission** qui passe sans interception aussi (l'écart est enregistré, chap. 1).
* Par niveau : malus aux prochaines fuites et au risque d'interception partout (`WANTED` dans [`balance.ts`](../src/data/balance.ts)).
* **−1 niveau** par nuit passée au relais routier (le bivouac ne compte pas).
* Affichée en permanence dans le bandeau (chap. 7) : *« Votre profil suscite l'intérêt bienveillant d'Aeterna. »*

### Barrage fixe ou contrôle volant
Une interception de la BRC prend l'une de deux formes, tirée au moment où elle se déclenche :
* **Barrage fixe** — un checkpoint au sas du district, **visible à 300 m** : toutes les options sont ouvertes, éjection et fuite comprises.
* **Contrôle volant** — un drone a repéré le véhicule et une unité de la BRC le coince (contre le trottoir de jour, dans la galerie de nuit, au quai de service de `[D5]` et `[D6]`) ; l'agent a déjà la main sur la portière. **Ni éjection ni fuite** : trop tard pour vider la soute ou démarrer. Restent la fouille, le bluff et la corruption.
* **Part des contrôles volants :** propre à chaque district (`flyingCheckShare` dans [`districts.ts`](../src/data/districts.ts) : rare dans les ruches où la BRC manque de drones, fréquente au sommet), majorée dans le district de la ronde renforcée, faite d'unités mobiles (`FLYING_CHECK` dans [`balance.ts`](../src/data/balance.ts)). En zone hors-réseau, les milices tiennent toujours une barricade visible (chap. 3).
* *Intention :* sans contrôle volant, la fuite (avec largage et dopage) devient le repli universel dès que la cargaison vaut cher. Le contrôle volant oblige à préparer aussi le bluff (masquage, Tier 0, aides) ou la corruption (cash de réserve, caisses appréciées des agents) : chaque build garde ses failles.
* **Brouilleur de drones** (`[MOD-09]`, chap. 4) : une fois par jour, un contrôle volant devient un barrage fixe.
* **Cage de Faraday** (`[MOD-03]`, chap. 4) : la part de contrôles volants est réduite (multiplicateur), dans tous les districts.
* **Lieu du barrage :** le texte suit la couche du réseau (chap. 3) : entrée du district de jour, galerie de service de nuit, sas du quai de service en `[D5]` et `[D6]`.
* L'app annonce la forme du contrôle dès l'écran d'interception, et le panneau de prévision affiche la part de contrôles volants du district de destination (chap. 7).

---

## L'écran d'interception
Le joueur accepte la fouille (**0**) ou tente une action : **1** Bluff, **2** Corruption, **3** Fuite, **4** Éjection (uniquement en tout premier). Fuite et éjection n'existent pas en contrôle volant.
**Ordre de résolution d'une option :** exécution sommaire (fouille effective avec `[T4-06]`, jugée sur la soute *avant* confiscation) → mort si la Santé tombe à 0 → dépannage d'urgence si le châssis tombe à 0 → garde à vue. Les gardes à vue ne se cumulent pas : la plus longue s'applique.
**Amendes :** proportionnelles à la **valeur des caisses saisies**, au prix de base (taux `fineRate` de chaque sanction dans [`balance.ts`](../src/data/balance.ts) ; au-delà de 1, l'amende dépasse la valeur des caisses), arrondie au ₡ : on paie pour ce qu'on transportait, pas pour ce qu'on possède. Le double fond non trouvé n'est ni saisi ni compté. L'amende se paie sur le Cash-Puce (après une offre de corruption perdue, par exemple) ; s'il ne suffit pas, tout le Cash-Puce part et la **garde à vue s'allonge** (`FINE` dans [`balance.ts`](../src/data/balance.ts)), même sans garde à vue prévue. L'app annonce le montant (si tout est saisi) et l'allongement avant de valider.
* *Intention :* la sanction suit l'infraction. Le petit contrebandier perd peu ; celui qui roule chargé de haut tier risque gros, quel que soit son compte. Le Cash-Puce reste exposé à l'audit (chap. 1), pas aux contrôles.
**Compte rendu :** après chaque option, l'app détaille ce qui a été perdu ou gagné (₡, caisses dont celles sacrifiées par une tactique, ICC, Santé, châssis, Fiche S, garde à vue, dépannage).

**Fouille effective :** fouille acceptée, ou échec d'un bluff, d'une corruption, d'une fuite ou d'une éjection — déclencheur de la règle de mort de `[T4-06]` et de la saisie du brouilleur `[MOD-09]` (garde à vue d'au moins un jour).
**Double fond** (chap. 4) : à chaque fouille effective qui confisque, un second jet décide si les agents le trouvent. Non trouvé, ses caisses sont gardées et la sanction se juge sur la soute visible ; trouvé, tout est confisqué, avec une perte d'ICC en plus. L'écran annonce les caisses cachées et la chance qu'il soit trouvé ici.

**Protection du parrain** (chap. 3) : dans le district du Velvet-Silo, les caisses d'une commande VIP en cours (au plus le nombre commandé, échéance non passée) sont hors de vue des agents. Elles ne comptent pas dans le risque du trajet, et au barrage elles sont mises de côté : ni fouille, ni saisie, ni amende, ni éjection ; elles reviennent à bord à la fin du contrôle. L'écran les annonce.
**Sédation** (chap. 1) : malus au bluff, à la corruption et à la fuite (`SEDATION` dans [`balance.ts`](../src/data/balance.ts)).
**Chauffeur à bout** (chap. 1) : sous un seuil de Santé, malus au bluff et à la fuite (`WORN` dans [`balance.ts`](../src/data/balance.ts)).

### 0. Accepter la fouille (sanction de base)
Montants et taux : `SEARCH` dans [`balance.ts`](../src/data/balance.ts) ; le haut tier commence à `HIGH_TIER`.

| Soute | Sanction |
| :--- | :--- |
| Uniquement `[TAG-LEGAL]` (ou vide) | Simple formalité : 0 amende, 0 temps perdu, **gain d'ICC** (« Citoyenneté Exemplaire », gain de route plafonné, chap. 1). |
| Illégal de bas tier uniquement | Confiscation des caisses illégales + amende sur leur valeur + perte d'ICC. |
| Au moins 1 caisse de haut tier | Confiscation + amende à un taux plus lourd + perte d'ICC plus lourde + garde à vue. |

### 1. Bluff administratif — *« Circulez, je livre des briques nutritives ! »*
Valeurs : `BLUFF` dans [`balance.ts`](../src/data/balance.ts).
```
Chance = min( plafond,  base
                   + bonus × part de Tier 0 dans la cargaison
                   + min(plafond, bonus × caisses masquées)
                   − malus × (étoiles du district − 1)
                   − malus d'odeur ([TAG-ODOROUS])
                   − Sédation − chauffeur à bout
                   + bonus ([MOD-08], [T0-04]) )
```
* La chance n'a pas de plancher : une soute très odorante dans un district bien gardé peut la ramener à 0 %.
* **Succès :** passage avec toute la cargaison, **gain d'ICC** (gain de route plafonné, chap. 1).
* **Échec :** **perte d'ICC** (fausse déclaration). Si la soute est uniquement légale, c'est tout. Sinon :
  1. bluff et éjection ne sont plus disponibles ;
  2. l'amende de la sanction de base est relevée (`failedFine`) ;
  3. le joueur paie, ou tente la corruption ou la fuite avec un malus de chance (`followUpPenalty`).

### 2. Corruption — *« On peut s'arranger entre citoyens de goût… »*
Jamais automatique : un jet, amélioré par la valeur de l'offre et par le build.
Valeurs : `BRIBE` dans [`balance.ts`](../src/data/balance.ts).
```
Chance = min( plafond,  base + Offre + Connivence − malus × (étoiles du district − 1) − Sédation + bonus ([CREW-01]) )
```
* **Tarif standard :** le plus élevé entre **une part fixe par étoile du district** et **une part de la valeur des caisses illégales en soute** (au prix de base). L'agent évalue ce qu'il laisse passer. Réduit par `[MOD-08]`.
* **Offre** — Cash-Puce et caisses de la soute, au choix et cumulables ; les caisses comptent à leur valeur en paiement (paiement en nature, chap. 2). Sa valeur totale est comparée au tarif standard. Elle est perdue même en cas d'échec (les caisses offertes ne sont pas confisquées une seconde fois, elles sont déjà parties). **En dessous d'une fraction du tarif, l'agent refuse** : le curseur d'offre démarre à ce minimum.
* **Bonus d'offre par paliers :** plus l'offre dépasse le tarif standard, plus la chance monte, jusqu'à un plafond (`offerBonuses`).

* **Connivence** (bonus `BRIBE.connivance` dans [`balance.ts`](../src/data/balance.ts)) si l'offre contient au moins une caisse d'un produit apprécié des agents du district (`bribeFavorites` dans [`districts.ts`](../src/data/districts.ts)) : les agents humains de `[D1]` à `[D3]` et les douaniers d'élite de `[D5]` et `[D6]` n'apprécient pas les mêmes produits. L'app signale les caisses qui la déclenchent.
* **Drones-Juges** (districts équipés, [`districts.ts`](../src/data/districts.ts)) : un échec critique incompressible (`droneCriticalFailure`), tiré avant le jet (ils sont incorruptibles : il faut tomber sur un douanier).
* **Succès :** l'agent coupe sa caméra-piéton ; passage garanti, ICC inchangé.
* **Échec :** confiscation + lourde amende + perte d'ICC + garde à vue, quel que soit le tier.

### 3. Fuite — *« Pied au plancher ! »*
* **Barrage fixe uniquement** (impossible en contrôle volant).
* **Chance de base** et **plafond** dégressif selon les étoiles du district : `FLEE` dans [`balance.ts`](../src/data/balance.ts).
* **Bonus :** `[MOD-06]`, `[CREW-02]`, `[VEH-03]` (en `[D3]` et `[D5]`). **Malus :** Fiche S, Sédation, chauffeur à bout.
* **Sacrifices :** 1 largage offensif max (une caisse `[TAG-FLAMMABLE]` **ou** `[TAG-CHEMICAL]` ; si le produit porte les deux tags, le meilleur bonus compte) + dopage `[T2-05]` (cumulable). Les caisses sacrifiées ou bues sont perdues quel que soit le résultat. Le joueur choisit le produit à sacrifier ; l'app montre le bonus de chacun.
* **Succès :** cargaison sauvée, **+1 niveau de Fiche S**, mais perte de châssis (tirage uniforme entier dans une fourchette ; `[MOD-06]`, `[VEH-03]`), casse `[TAG-FRAGILE]`, et perte d'ICC (caméras de trafic ; `[VEH-03]`, `[MOD-05]`).
* **Échec :** explosions `[TAG-FLAMMABLE]` d'abord, puis confiscation + amende sur la valeur saisie + perte d'ICC ; perte de châssis et de Santé (`[MOD-06]`), mortelle si la Santé tombe à 0 ; garde à vue.
* Avant validation, l'app affiche la chance et les conséquences du succès et de l'échec.
* *Le largage n'est pas une éjection :* on ne cache rien, on jette une caisse derrière soi pendant la fuite (nuage chimique, nappe enflammée) pour aveugler les poursuivants. Se débarrasser de l'illégal, c'est l'éjection, avant le barrage.

### 4. Éjection / broyage d'urgence — *« Se débarrasser de la cargaison avant le barrage »*
* **Activation :** uniquement au tout début de l'interception, à 300 m d'un barrage fixe (impossible en contrôle volant).
* **Mode** (par priorité, choisi par l'app et annoncé) : `[MOD-07]` s'il est monté, hors cooldown et autorisé dans le district ; sinon `[VEH-04]` ; sinon manuel s'il est autorisé. Autorisations par district (`ejection` dans [`districts.ts`](../src/data/districts.ts)) : en `[D5]`, pas de mode manuel (LiDAR) mais `[MOD-07]` passe par les égouts ; en `[D6]`, ni manuel ni `[MOD-07]` (dalle bio-scellée) ; `[VEH-04]` partout. Chances et dégâts : chez le mode (chap. 4 ; mode manuel : `EJECT` dans [`balance.ts`](../src/data/balance.ts)).
* **Indisponible** après un bluff raté, comme après toute autre action.
* **Double fond :** une éjection réussie ne largue que les caisses visibles ; celles du double fond restent à bord (chap. 4).
* **Mode manuel (décharge dans une ruelle) :** chance fixe (`EJECT` dans [`balance.ts`](../src/data/balance.ts)). Succès : soute propre au barrage (0 amende, 0 ICC, 0 temps perdu), toutes les caisses illégales perdues, perte de châssis.
* **Échec (tous modes)** — un drone LiDAR filme les caisses : sanction de base avec un taux d'amende relevé + une perte d'ICC supplémentaire + garde à vue.
* Un succès a lieu **avant** la fouille : il protège de `[T4-06]`.

---

## Garde à vue sensorielle
*Doctrine :* pour le DSC, emprisonner à vie ou exécuter (sauf haute trahison) gaspille de l'empreinte carbone et de la main-d'œuvre. Le détenu passe en caisson blanc aveuglant, hymnes d'Aeterna à 90 décibels et privation de sommeil, puis est remis au volant pour continuer à produire et payer ses dettes.
* **Durée :** fixée par la règle qui la déclenche. **1 jour** = le reste de la phase en cours (jour ou nuit) **et** la journée suivante : le joueur ressort à **20h00 le lendemain**, dans le district de l'interception, véhicule rendu, face au dilemme de 20h00 (chap. 1). Chaque jour supplémentaire décale la sortie de 24h.
* **Santé :** perte de PV à chaque routine matinale passée en cellule, sans descendre sous un plancher (`CUSTODY` dans [`balance.ts`](../src/data/balance.ts) ; Aeterna ne perd pas un contribuable).
* **Avance rapide :** chaque matin passé en cellule exécute la routine matinale. Une échéance de dette franchie s'applique à la sortie ; franchir le Jour 30 à minuit avec une dette = Game Over.
* **Repos :** la garde à vue réinitialise l'épuisement, sans aucun gain de sommeil.
* **Exception mortelle :** `[T4-06]`.
