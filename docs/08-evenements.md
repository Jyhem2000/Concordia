# 8. Événements

> Les chances, durées, multiplicateurs et montants sont dans [`events.ts`](../src/data/events.ts), qui fait foi : ce chapitre porte les règles et le lore. Les effets de chaque événement (produits touchés, sens de l'effet) sont décrits ici ; l'app affiche les facteurs exacts au téléscripteur et dans le détail des cours et du risque.

| Type | Déclenchement | Durée | Cooldown |
| :--- | :--- | :--- | :--- |
| **Global** (Flash Info TV) | Tiré **la veille** : chaque matin, une chance qu'un événement frappe tous les districts **le lendemain**. Une **rumeur** l'annonce parfois (voir plus bas). | la journée | — |
| **Local** | Routine matinale : une chance par district qu'un de ses 3 événements se déclenche, parmi ceux hors cooldown. **Visibles dès 06h00** sur la carte et le téléscripteur. | la journée, dans ce district | par événement |
| **Contrecoup** | Le lendemain d'un événement qui a touché des cours, si le même événement ne se répète pas. | la journée | — |
| **Loterie** | Jours fixes de tirage, à 06h00. | voir plus bas | — |
| **Routier** | Trajet **de jour sans interception** (ni barrage ni racket) : une chance d'aléa. 2 choix, résolus en 1 clic. La nuit, dans les galeries de service, personne à croiser : jamais d'aléa. | instantané | par aléa |

### Règles communes
* **Ordre :** les événements sont tirés à 06h00 **avant** la demande, les cours et les boutiques, qu'ils modifient (chap. 2, routine matinale, étape 7).
* **Multiplicateurs de prix :** ils passent par `Mult_EvtActif` (chap. 7). Quand plusieurs touchent le même produit dans le même district (événement global, local, contrecoup, ou deux lignes d'un même événement), on garde celui dont l'écart `|Mult − 1.00|` est le plus fort ; égalité : le local prime, puis le contrecoup cède. Un multiplicateur marqué **jour seulement** vaut 1.00 après 20h00.
* **Plafond :** `Mult_Événement` ne dépasse jamais le plafond du chap. 7 ; aucun événement n'est défini au-dessus (`[EVT-D6-03]`, prévu à ×5, est ramené au plafond).
* **Apparitions à l'achat :** les produits indiqués entrent dans la boutique du district, même s'ils y sont en Forte demande (dérogation à l'exclusion, chap. 7), avec le stock de leur tier. Leur multiplicateur s'applique aussi à la vente dans ce district (le marché est inondé).
* **Stocks :** un facteur de stock s'applique au stock tiré, arrondi au supérieur, au moins 1.
* **Risque :** les ajouts de risque des événements visent les contrôles d'Aeterna et ne s'appliquent pas dans la zone hors-réseau, sauf mention (milices de `[D4]`). Un risque « final » est multiplié après tous les autres termes, avant les bornes.
* **Tags :** un événement peut annuler ou doubler l'effet d'un tag (risque au trajet, détection, malus de bluff) dans les districts qu'il touche. Pour l'odeur, les doublements de `[D6]` et `[EVT-G04]` ne se cumulent pas ; une annulation l'emporte toujours.
* **Effets liés à l'équipement et aux lieux :** immunité du caisson cryo à la canicule (chap. 5), laissez-passer de la Morgue contre l'alerte sanitaire, réparations moins chères au garage pendant le tournoi, prédictions de Cassandre-88 et faux dossiers de la Laverie (chap. 4).

### Rumeurs (événements globaux)
* Chaque matin, le moteur tire l'événement global **du lendemain**. S'il y en a un, une rumeur le laisse fuiter **le jour même** avec une certaine chance ; s'il n'y en a pas, une fausse rumeur (un événement global au hasard) circule parfois. Chances : `RUMOR` dans [`events.ts`](../src/data/events.ts).
* La rumeur est un texte « bateau » propre à chaque événement global (*« La météo annonce un épisode de chaleur historique »*), sans le nommer. L'app affiche sa **fiabilité**, calculée à partir des chances : la part des rumeurs qui se vérifient.
* *Intention :* rendre le marché en partie prévisible. Acheter la veille ce qu'une rumeur fait monter est un pari lisible.
* `[LOC-D4-2]` (chap. 4) donnera la certitude, et le moyen de forcer l'événement.

### Contrecoups
* Le lendemain d'un événement qui a touché des cours, chaque produit touché subit l'effet inverse, dans les mêmes districts, pour la journée : après une ruée (multiplicateur au-dessus de 1), le marché saturé retombe ; après une braderie (en dessous de 1), la pénurie fait remonter. Facteurs : `AFTERSHOCK` dans [`events.ts`](../src/data/events.ts).
* Pas de contrecoup si le même événement se répète, ni pour les effets hors prix (risque, stocks, tags). Un contrecoup d'un effet « jour seulement » dure toute la journée.
* Ils passent au téléscripteur. *Lecture :* revendre le jour même d'une ruée ; acheter le lendemain d'une ruée.

### Hasard limité
* Les aléas routiers ne tuent jamais : leurs pertes de Santé s'arrêtent à 1 PV. Leurs montants en ₡ sont indexés sur l'inflation (chap. 7). Les rations gagnées ne dépassent jamais la capacité du réservoir. Leurs gains d'ICC sont des gains de route, plafonnés (chap. 2).
* *Philosophie des aléas routiers :* acheter le silence d'un délateur évite une perte d'ICC, sans jamais en faire gagner. Seule une soumission humiliante et coûteuse à une procédure d'Aeterna rapporte un maigre gain d'ICC.

---

## Loterie de l'Ascenseur Civique

`[EVT-L01]` **Tirage hebdomadaire** à 06h00, aux jours de `LOTTERY` ([`events.ts`](../src/data/events.ts)). Chaque tirage désigne un **promu**, toujours : c'est la vitrine du régime. Il ne désigne un **déclassé** qu'**une fois sur deux** (`demotionChance`) : Aeterna ne fait un exemple que lorsqu'elle en a besoin. Le téléscripteur annonce le promu, et le déclassé s'il y en a un. Le promu est tiré parmi `[D1]`, `[D2]`, `[D3]`, `[D5]` ; le déclassé parmi `[D2]`, `[D3]`, `[D5]`, jamais le district du promu (il n'y a rien sous `[D1]` dans la pyramide de l'ICC). `[D4]` est hors-ICC ; `[D6]` est hors-loterie, on y meurt seulement « de mort naturelle ».
* **Pourquoi personne ne vérifie** (chap. 1) : la circulation des citoyens est verrouillée vers le haut, et le foyer promu (conjoint, enfants mineurs) passe des mois dans une Résidence d'Acclimatation fermée, joignable seulement par vidéo. Une promotion se truque donc sans peine ; un déclassement, non : le déclassé arrive bel et bien chez ses nouveaux voisins.
* **Falsification :** la veille d'un tirage, à `[LOC-D5-1]` (chap. 4) ; un faux dossier accepté impose un rôle et protège l'équipier.

| Rôle | Ce que dit Aeterna | Ce qui se passe vraiment | Effet en jeu |
| :--- | :--- | :--- | :--- |
| **Le promu** | « Félicitations, il monte d'un étage ! » | Vrai promu, ou opposant « suicidé », dont un Deepfake radieux appelle la famille depuis la Résidence d'Acclimatation. | **Purge préventive :** risque d'interception accru dans son district pour la journée (« célébration civique »). Une chance que ce soit ton **équipier actif** : il disparaît définitivement, son salaire s'arrête, le prochain recrutement est gratuit (avec l'équipage, chap. 5). |
| **Le déclassé** (une fois sur deux) | « Un citoyen a choisi la sobriété heureuse. » | Un vrai cadre tombé en disgrâce, renvoyé un échelon plus bas avec son foyer et ses vices, au vu de tout le quartier. | **Il emporte ses vices :** pendant quelques jours (tirage compris), un produit de la Forte demande de son ancien district passe en Forte demande dans le district inférieur (`[D5]` → `[D3]` → `[D2]` → `[D1]`). Le produit est tiré parmi ceux qui n'y sont ni produits ni déjà en Forte demande. Il sort de la boutique de ce district (exclusion), comme toute Forte demande. |

* Les noms du promu et du déclassé sont tirés au hasard (lore seulement).
* Un faux dossier « cadre » de `[LOC-D5-1]` garantit le déclassement de ce tirage (chap. 4).
* *Ex. de bandeau :* « 🎉 Félicitations à Mme R. Marini, promue Citoyenne d'Honneur ! Elle ne pourra pas vous répondre : elle est très occupée à être heureuse. » · « 🌱 M. K. Okafor, ex-Glass Spire, rejoint avec enthousiasme les Ruches Grises. Son goût pour les cigares l'y suit. »

---

## Événements globaux

↑ : cours en hausse · ↓ : cours en baisse. Facteurs exacts : [`events.ts`](../src/data/events.ts).

| ID | Événement | Marché (tous districts sauf mention) | Autres effets |
| :--- | :--- | :--- | :--- |
| `[EVT-G01]` | **Alerte Canicule & Délestage Thermique** — 48 °C ; Aeterna coupe la climatisation publique pour refroidir ses processeurs. | ↑ `[T0-02]`, `[T1-01]`, `[T2-05]` | À 06h00, sans `[MOD-01]` : tout `[T1-03]` en soute **fond** (détruit) ; les autres `[TAG-PERISHABLE]` **vieillissent de 2 jours** (une caisse qui atteint Pourri est détruite aussitôt). Trajets de jour : perte de châssis (annulable par `[MOD-01]` ou, comme la nuit, par le refroidissement de `[T0-02]`) et de Santé (coup de chaleur, plancher à 1 PV). |
| `[EVT-G02]` | **Alerte Sanitaire « Variant-X »** — virus saisonnier hautement suspect. | ↑↑ `[T3-04]`, ↑ `[T2-07]`, `[T1-04]`, `[T0-03]` | Risque accru partout, hors zone hors-réseau (sauf `[D3]` avec le laissez-passer de `[LOC-D3-1]`, chap. 4). |
| `[EVT-G03]` | **Blackout du Cloud & sevrage du Fil Rose** — la population cherche frénétiquement des sensations hors-ligne. | ↑ `[T1-02]`, `[T1-05]`, `[T2-03]`, `[T2-04]`, `[T2-06]`, `[T3-06]` | Scanners électromagnétiques de `[D5]` hors service : détection `[TAG-TECH]` annulée en `[D5]`. |
| `[EVT-G04]` | **Éco-Panique** — documentaire en boucle sur le méthane et le cholestérol. | ↑ `[T0-01]`, `[T3-05]` ; ↓ `[T2-02]`, `[T3-01]`, `[T4-01]` **jour seulement** (la nuit, la ville basse s'en gave en cachette) | Malus `[TAG-ODOROUS]` doublés partout. |
| `[EVT-G05]` | **Blocus Alimentaire & Grève des Transports** — convois officiels paralysés. | ↑ tout Tier 1 et 2 ; ↑↑ `[T1-04]` | Stocks des boutiques réduits. |
| `[EVT-G06]` | **La Nuit des Fondateurs** — gala anniversaire de la fermeture du mur. | En `[D5]` et `[D6]` seulement : ↑ `[T3-01]`, `[T3-02]`, `[T3-03]`, `[T4-01]`, `[T4-02]` | — |

---

## Événements locaux

| ID | Événement | Marché (dans le district) | Autres effets |
| :--- | :--- | :--- | :--- |
| `[EVT-D1-01]` | **Grève des Éboueurs Automatisés** — l'odeur pestilentielle couvre tout. | ↓ `[T1-06]` | Malus `[TAG-ODOROUS]` annulés ; stock de `[T1-06]` accru. |
| `[EVT-D1-02]` | **Panne des Ascenseurs & Coupure d'Eau Chaude** — ruée sur les calories. | ↑ `[T3-03]`, `[T2-01]`, `[T1-03]`, `[T1-02]` | — |
| `[EVT-D1-03]` | **Descente d'Huissiers d'Aeterna** — les concierges revendent les saisies. | Apparition à l'achat de `[T2-07]`, `[T3-02]`, `[T3-06]`, ↓ | Risque accru. |
| `[EVT-D2-01]` | **Tribunal Populaire « Détox & Repentance »** — autodafé sur le campus. | ↑ `[T2-02]`, `[T1-03]` | Détection `[TAG-CULTURE]` doublée (la délation redouble). |
| `[EVT-D2-02]` | **Festival Clandestin « Sans-Ondes »** — retraite loin des antennes 6G. | ↑ `[T2-04]`, `[T2-07]`, `[T2-03]` | — |
| `[EVT-D2-03]` | **Invasion de Punaises de Lit Bio** — insecticides bannis. | ↑ tout `[TAG-CHEMICAL]` | — |
| `[EVT-D3-01]` | **Fuite au Laboratoire P4** — complexe bouclé. | ↑↑ `[T3-04]`, `[T2-07]` | Tout joueur qui entre en `[D3]` (à l'arrivée, après l'éventuel contrôle et l'aléa) ou s'y trouve à 06h00 perd une **demi-journée** au sas (chap. 2). |
| `[EVT-D3-02]` | **Burn-out Collectif des Internes** — fin d'une garde marathon. | ↑ tout `[TAG-ADDICTIVE]` | Risque final divisé. |
| `[EVT-D3-03]` | **Inventaire de la Pharmacie Centrale** — palettes à pilonner. | ↓↓ `[T0-03]`, `[T3-04]` | Stock de ces produits accru. |
| `[EVT-D4-01]` | **Alerte « Chemtrails »** — les survivalistes se barricadent. | ↑ `[T0-02]`, `[T1-04]`, `[T3-04]`, `[T4-04]` | Risque de racket accru (milices nerveuses). |
| `[EVT-D4-02]` | **Arrivage d'un Cargo Fantôme** — chalutier non répertorié. | Apparition à l'achat d'une partie de `[T3-03]`, `[T3-02]`, `[T3-06]`, `[T4-01]`, `[T4-02]` (nombre tiré), ↓ sur les cinq | — |
| `[EVT-D4-03]` | **Tournoi de Démolition d'Exosquelettes** — braseros géants. | ↑ `[T1-06]`, `[T2-02]`, `[T3-03]` | Réparations de `[LOC-D4-1]` moins chères (avec le garage, chap. 4). |
| `[EVT-D5-01]` | **Clôture Trimestrielle & Krach Algorithmique** | ↑ `[T0-03]`, `[T1-02]`, `[T1-05]`, `[T3-03]` | — |
| `[EVT-D5-02]` | **Audit du Comité de Pureté Idéologique** — les cadres bradent leurs objets compromettants. | Apparition à l'achat de `[T2-06]`, `[T3-02]`, `[T3-07]`, `[T4-03]`, ↓ | Risque de base du district relevé. |
| `[EVT-D5-03]` | **Bug des Portiques Rayons-X** — détection en panne toute la journée. | — | Risque final divisé ; détection `[TAG-TECH]` annulée. |
| `[EVT-D6-01]` | **Sommet Mondial « Zéro-Carbone »** — orgie gastronomique en coulisses. | ↑↑ `[T3-01]`, `[T3-02]`, `[T3-03]`, `[T4-01]` | — |
| `[EVT-D6-02]` | **Purge Politique au Sommet** — un Haut-Commissaire disgracié cherche à fuir. | ↑↑ `[T2-04]`, `[T3-07]`, `[T4-03]` | — |
| `[EVT-D6-03]` | **Caprice d'Oligarque « Nostalgie Prolétaire »** — dîner « comme les pauvres d'avant le Reset ». | ↑↑ `[T1-01]`, `[T1-03]`, `[T1-04]` | — |

---

## Aléas routiers

**Résolution :** de jour seulement (sur les voies de surface, chap. 4), l'aléa est tiré après le test d'interception, s'il n'y a eu ni barrage ni racket, parmi les aléas hors cooldown. Le trajet reste suspendu jusqu'au choix (aucune autre action possible). Ensuite viennent le dépannage d'urgence si le châssis est tombé à 0, puis l'arrivée (effets d'arrivée des événements locaux).
* **Coûts :** une option n'est proposée que si le joueur peut en payer tous les coûts (₡, caisses, rations, place libre en soute). Les pertes de Santé et de châssis se paient toujours. Chaque aléa garde au moins une option toujours possible.
* **Paiement au choix** (« 1 caisse ou des ₡ ») : le joueur choisit. Une caisse demandée par tag ou par tier est la **moins chère** (prix de base) parmi celles qui conviennent, annoncée avant de valider.
* **Paris** (`[EVT-R04]`) : chance annoncée avant de valider.
* **Caisse gagnée** (`[EVT-R15]`) : un produit tiré au hasard dans le tier indiqué, au prix payé, acheté dans le district d'arrivée (clause anti-arbitrage, chap. 7).
* Montants, pertes et gains : `ROAD_EVENTS` dans [`events.ts`](../src/data/events.ts). L'app les affiche sur chaque option.

| ID | Situation | Choix A | Choix B |
| :--- | :--- | :--- | :--- |
| **Délation civile** | | | |
| `[EVT-R01]` | **Enfant-Vigile** : un écolier des Jeunesses d'Aeterna relève le numéro de tes pneus. | 1 caisse `[TAG-ADDICTIVE]` ou des ₡ : rien | L'ignorer : perte d'ICC |
| `[EVT-R02]` | **Chasseur de primes d'ICC** : un chômeur photographie ta soute ouverte. | 1 caisse `[T0-01]` ou des ₡ : rien | Foncer : perte de châssis et d'ICC |
| `[EVT-R03]` | **Comité « Air Pur »** : trois retraités bloquent un passage piéton. | Écouter le sermon : 1 ration, petit gain d'ICC | Les enfumer : perte d'ICC |
| `[EVT-R04]` | **Faux auto-stoppeur** : ses bottes ressemblent à celles d'un indic. | Refuser : petite perte d'ICC | Le prendre : pari, des ₡ ou une perte d'ICC |
| **Terminal d'Aeterna** | | | |
| `[EVT-R05]` | **Scan rétinien en conduite** : fixer la caméra 8 s à 70 km/h. | Obéir : petit gain d'ICC, perte de châssis et de Santé | Faire sauter le fusible : perte d'ICC |
| `[EVT-R06]` | **Quiz vocal de rééducation** : réciter le Décret Zéro-Carbone. | Payer la « formation civique » : gain d'ICC | Bafouiller : perte d'ICC |
| `[EVT-R07]` | **Collecte de sang au péage** : 400 ml « volontaires ». | Donner : perte de Santé, gain d'ICC | Dispense : des ₡ et une petite perte d'ICC |
| `[EVT-R08]` | **Bridage moteur forcé** à 15 km/h. | Subir : 1 ration, petit gain d'ICC | Court-circuiter : perte d'ICC et de châssis |
| **Dystopie quotidienne** | | | |
| `[EVT-R09]` | **Citoyen en hypoglycémie** effondré devant ton pare-chocs. | Contourner par le trottoir : petit gain d'ICC, perte de châssis | L'aider (1 caisse de Tier 0 ou 1) : perte d'ICC (secourir un citoyen non déclaré est suspect), +1 ration de remerciement |
| `[EVT-R10]` | **Convoi de « gagnants de la Loterie »** bloque la voie rapide. | Attendre : 1 ration | Bretelle de chantier : perte de châssis et d'ICC |
| `[EVT-R11]` | **Nuage de désinfection aérienne** (javel et sédatifs). | Apnée : perte de Santé | 2 caisses `[T0-02]` : aucun dégât |
| `[EVT-R12]` | **Drone-livreur crashé**, batterie intacte. | Signaler (déposition au poste) : 1 ration, petit gain d'ICC | Piller : des ₡, perte d'ICC |
| **Rencontres louches** | | | |
| `[EVT-R13]` | **Citerne du DSC en panne**, chauffeur novice en larmes. | Aider : perte de Santé, des rations | Passer : aucun effet |
| `[EVT-R14]` | **Péage caritatif** : autocollants « J'aime Aeterna ». | Acheter : des ₡, gain d'ICC | Refuser : perte d'ICC |
| `[EVT-R15]` | **Échange d'angle mort** avec un autre contrebandier. | Troc aveugle : des ₡ contre 1 caisse aléatoire de Tier 2 (place libre requise) | Refuser : aucun effet |
