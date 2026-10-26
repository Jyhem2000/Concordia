# 8. Événements

| Type | Déclenchement | Durée | Cooldown |
| :--- | :--- | :--- | :--- |
| **Global** (Flash Info TV) | Routine matinale : **30 %** de chance qu'un événement frappe tous les districts. Prévisible et forçable via `[LOC-D4-2]`. | 24h | — |
| **Local** | Routine matinale : **20 %** de chance par district qu'un de ses 3 événements se déclenche. **Visibles dès 06h00** sur la carte et le téléscripteur. | la journée, dans ce district | 4 jours par événement |
| **Routier** | Trajet **sans interception** : **25 %** de chance. 2 choix, résolus en 1 clic. | instantané | 5 jours par aléa |

* Les multiplicateurs de prix passent par `Mult_EvtActif` (chap. 7). Un multiplicateur marqué **jour seulement** vaut 1.00 pendant le couvre-feu.
* **Les aléas routiers ne tuent jamais :** leurs pertes de Santé s'arrêtent à 1 PV. Leurs montants en ₡ sont indexés sur l'inflation (chap. 7). Les rations gagnées ne dépassent jamais la capacité du réservoir. Leurs gains d'ICC sont des gains de route, plafonnés (chap. 2).
* *Philosophie des aléas routiers :* acheter le silence d'un délateur évite une perte d'ICC, sans jamais en faire gagner. Seule une soumission humiliante et coûteuse à une procédure d'Aeterna rapporte un maigre +1 % ou +2 %.

---

## Loterie de l'Ascenseur Civique

`[EVT-L01]` **Tirage hebdomadaire** — Jours **4, 11, 18 et 25** à 06h00. L'ascenseur civique tourne dans les deux sens : chaque tirage désigne un **promu** et un **déclassé**, annoncés au téléscripteur. Le promu est tiré parmi `[D1]`, `[D2]`, `[D3]`, `[D5]` ; le déclassé parmi `[D2]`, `[D3]`, `[D5]` (il n'y a rien sous `[D1]` dans la pyramide de l'ICC). `[D4]` est hors-ICC ; `[D6]` est hors-loterie, on y meurt seulement « de mort naturelle ».
* **Falsification :** la veille d'un tirage, à `[LOC-D5-1]`.

| Rôle | Ce que dit Aeterna | Ce qui se passe vraiment | Effet en jeu |
| :--- | :--- | :--- | :--- |
| **Le promu** | « Félicitations, il monte d'un étage ! » | Vrai promu, ou opposant « suicidé » et remplacé par un Deepfake radieux. | **Purge préventive :** son district subit **+15 %** de risque d'interception pour la journée (« célébration civique »). **10 %** de chance que ce soit ton **équipier actif** : il disparaît définitivement, son salaire s'arrête, le prochain recrutement est gratuit. |
| **Le déclassé** | « Un citoyen a choisi la sobriété heureuse. » | Un cadre tombé en disgrâce, renvoyé un échelon plus bas avec ses vices. | **Il emporte ses vices :** pendant **3 jours**, un produit de la Forte demande de son ancien district devient en Forte demande dans le district inférieur (`[D5]` → `[D3]` → `[D2]` → `[D1]`). |

* Le tirage peut être **faussé** par un dossier falsifié à `[LOC-D5-1]` (pari, pas garanti).
* *Ex. de bandeau :* « 🎉 Félicitations à Mme R. Marini, promue Citoyenne d'Honneur ! Elle ne pourra pas vous répondre : elle est très occupée à être heureuse. » · « 🌱 M. K. Okafor, ex-Glass Spire, rejoint avec enthousiasme les Ruches Grises. Son goût pour les cigares l'y suit. »

---

## Événements globaux

| ID | Événement | Marché (tous districts sauf mention) | Autres effets |
| :--- | :--- | :--- | :--- |
| `[EVT-G01]` | **Alerte Canicule & Délestage Thermique** — 48 °C ; Aeterna coupe la climatisation publique pour refroidir ses processeurs. | `[T0-02]`, `[T1-01]`, `[T2-05]` ×2.5 | Sans `[MOD-01]` : tout `[T1-03]` en soute **fond** ; les autres `[TAG-PERISHABLE]` perdent **2 crans** de fraîcheur. Trajets de jour : **−10 PV** de châssis (annulable par `[MOD-01]` ou `[T0-02]`) et **−5 PV** de Santé (coup de chaleur, plancher à 1 PV). |
| `[EVT-G02]` | **Alerte Sanitaire « Variant-X »** — virus saisonnier hautement suspect. | `[T3-04]` ×3.5, `[T2-07]` ×2.5, `[T1-04]` ×2, `[T0-03]` ×2 | **+15 %** de risque partout (sauf `[D3]` avec le laissez-passer de `[LOC-D3-1]`). |
| `[EVT-G03]` | **Blackout du Cloud & sevrage du Fil Rose** — la population cherche frénétiquement des sensations hors-ligne. | `[T1-02]`, `[T1-05]`, `[T2-03]`, `[T2-04]`, `[T2-06]`, `[T3-06]` ×3 | Scanners électromagnétiques de `[D5]` hors-service : malus `[TAG-TECH]` à 0 en `[D5]`. |
| `[EVT-G04]` | **Éco-Panique** — documentaire en boucle sur le méthane et le cholestérol. | `[T0-01]`, `[T3-05]` ×2 ; `[T2-02]`, `[T3-01]`, `[T4-01]` ×0.6 **jour seulement** (la nuit, la ville basse s'en gave en cachette) | Malus `[TAG-ODOROUS]` **×2** partout. |
| `[EVT-G05]` | **Blocus Alimentaire & Grève des Transports** — convois officiels paralysés. | Tout Tier 1 et 2 ×1.5 ; `[T1-04]` ×2.5 | Stocks des boutiques **÷2**. |
| `[EVT-G06]` | **La Nuit des Fondateurs** — gala anniversaire de la fermeture du mur. | En `[D5]` et `[D6]` : `[T3-01]`, `[T3-02]`, `[T3-03]`, `[T4-01]`, `[T4-02]` ×3 | — |

---

## Événements locaux

| ID | Événement | Marché (dans le district) | Autres effets |
| :--- | :--- | :--- | :--- |
| `[EVT-D1-01]` | **Grève des Éboueurs Automatisés** — l'odeur pestilentielle couvre tout. | `[T1-06]` ×0.5 | Malus `[TAG-ODOROUS]` à 0 ; stock de `[T1-06]` doublé. |
| `[EVT-D1-02]` | **Panne des Ascenseurs & Coupure d'Eau Chaude** — ruée sur les calories. | `[T3-03]`, `[T2-01]`, `[T1-03]`, `[T1-02]` ×2 | — |
| `[EVT-D1-03]` | **Descente d'Huissiers d'Aeterna** — les concierges revendent les saisies. | Apparition à l'achat de `[T2-07]`, `[T3-02]`, `[T3-06]` à ×0.6 | **+20 %** de risque. |
| `[EVT-D2-01]` | **Tribunal Populaire « Détox & Repentance »** — autodafé sur le campus. | `[T2-02]`, `[T1-03]` ×2.5 | Malus `[TAG-CULTURE]` **×2** (la délation redouble). |
| `[EVT-D2-02]` | **Festival Clandestin « Sans-Ondes »** — retraite loin des antennes 6G. | `[T2-04]`, `[T2-07]`, `[T2-03]` ×3 | — |
| `[EVT-D2-03]` | **Invasion de Punaises de Lit Bio** — insecticides bannis. | Tout `[TAG-CHEMICAL]` ×2.5 | — |
| `[EVT-D3-01]` | **Fuite au Laboratoire P4** — complexe bouclé. | `[T3-04]`, `[T2-07]` ×4 | Tout joueur qui entre en `[D3]` (ou s'y trouve à 06h00) perd une **demi-journée** au sas. |
| `[EVT-D3-02]` | **Burn-out Collectif des Internes** — fin d'une garde marathon. | Tout `[TAG-ADDICTIVE]` ×2.5 | Risque final **÷2**. |
| `[EVT-D3-03]` | **Inventaire de la Pharmacie Centrale** — palettes à pilonner. | `[T0-03]`, `[T3-04]` ×0.4 | Stock de ces produits doublé. |
| `[EVT-D4-01]` | **Alerte « Chemtrails »** — les survivalistes se barricadent. | `[T0-02]`, `[T1-04]`, `[T3-04]`, `[T4-04]` ×3 | **+25 %** de risque (milices nerveuses). |
| `[EVT-D4-02]` | **Arrivage d'un Cargo Fantôme** — chalutier non-répertorié. | Au moins 3 produits parmi `[T3-03]`, `[T3-02]`, `[T3-06]`, `[T4-01]`, `[T4-02]` à ×0.65 | — |
| `[EVT-D4-03]` | **Tournoi de Démolition d'Exosquelettes** — braseros géants. | `[T1-06]`, `[T2-02]`, `[T3-03]` ×2.2 | Réparations de `[LOC-D4-1]` **−20 %**. |
| `[EVT-D5-01]` | **Clôture Trimestrielle & Krach Algorithmique** | `[T0-03]`, `[T1-02]`, `[T1-05]`, `[T3-03]` ×2.8 | — |
| `[EVT-D5-02]` | **Audit du Comité de Pureté Idéologique** — les cadres bradent leurs objets compromettants. | Apparition forcée à l'achat (dérogation à l'exclusion) de `[T2-06]`, `[T3-02]`, `[T3-07]`, `[T4-03]` à ×0.5 | Risque de base porté à **60 %**. |
| `[EVT-D5-03]` | **Bug des Portiques Rayons-X** — détection en panne toute la journée. | — | Risque final **÷2** ; malus `[TAG-TECH]` annulé. |
| `[EVT-D6-01]` | **Sommet Mondial « Zéro-Carbone »** — orgie gastronomique en coulisses. | `[T3-01]`, `[T3-02]`, `[T3-03]`, `[T4-01]` ×3.5 | — |
| `[EVT-D6-02]` | **Purge Politique au Sommet** — un Haut-Commissaire disgracié cherche à fuir. | `[T2-04]`, `[T3-07]`, `[T4-03]` ×4 | — |
| `[EVT-D6-03]` | **Caprice d'Oligarque « Nostalgie Prolétaire »** — dîner « comme les pauvres d'avant le Reset ». | `[T1-01]`, `[T1-03]`, `[T1-04]` ×5 | — |

---

## Aléas routiers

| ID | Situation | Choix A | Choix B |
| :--- | :--- | :--- | :--- |
| **Délation civile** | | | |
| `[EVT-R01]` | **Enfant-Vigile** : un écolier des Jeunesses d'Aeterna relève le numéro de tes pneus. | 1 caisse `[TAG-ADDICTIVE]` ou 300 ₡ : rien | L'ignorer : **−4 % ICC** |
| `[EVT-R02]` | **Chasseur de primes d'ICC** : un chômeur photographie ta soute ouverte. | 1 caisse `[T0-01]` ou 250 ₡ : rien | Foncer : **−5 PV** châssis, **−5 % ICC** |
| `[EVT-R03]` | **Comité « Air Pur »** : trois retraités bloquent un passage piéton. | Écouter le sermon : **−1 Ration**, **+1 % ICC** | Les enfumer : **−4 % ICC** |
| `[EVT-R04]` | **Faux auto-stoppeur** : ses bottes ressemblent à celles d'un indic. | Refuser : **−2 % ICC** | Le prendre : 50 % **+400 ₡**, 50 % **−6 % ICC** |
| **Terminal d'Aeterna** | | | |
| `[EVT-R05]` | **Scan rétinien en conduite** : fixer la caméra 8 s à 70 km/h. | Obéir : **+1 % ICC**, **−10 PV** châssis, **−5 PV** Santé | Faire sauter le fusible : **−5 % ICC** |
| `[EVT-R06]` | **Quiz vocal de rééducation** : réciter le Décret Zéro-Carbone. | Payer la « formation civique » (400 ₡) : **+2 % ICC** | Bafouiller : **−3 % ICC** |
| `[EVT-R07]` | **Collecte de sang au péage** : 400 ml « volontaires ». | Donner : **−10 PV** Santé, **+2 % ICC** | Dispense : **−500 ₡**, **−2 % ICC** |
| `[EVT-R08]` | **Bridage moteur forcé** à 15 km/h. | Subir : **−1 Ration**, **+1 % ICC** | Court-circuiter : **−4 % ICC**, **−5 PV** châssis |
| **Dystopie quotidienne** | | | |
| `[EVT-R09]` | **Citoyen en hypoglycémie** effondré devant ton pare-chocs. | Contourner par le trottoir : **+1 % ICC**, **−5 PV** châssis | L'aider (1 caisse Tier 0 ou 1) : **−4 % ICC**, **+1 Ration** |
| `[EVT-R10]` | **Convoi de « gagnants de la Loterie »** bloque la voie rapide. | Attendre : **−1 Ration** | Bretelle de chantier : **−10 PV** châssis, **−3 % ICC** |
| `[EVT-R11]` | **Nuage de désinfection aérienne** (javel et sédatifs). | Apnée : **−10 PV** Santé | 2 caisses `[T0-02]` : aucun dégât |
| `[EVT-R12]` | **Drone-livreur crashé**, batterie intacte. | Signaler (déposition au poste) : **+1 % ICC**, **−1 Ration** | Piller : **+600 ₡**, **−5 % ICC** |
| **Rencontres louches** | | | |
| `[EVT-R13]` | **Citerne du DSC en panne**, chauffeur novice en larmes. | Aider : **−5 PV** Santé, **+2 Rations** | Passer : aucun effet |
| `[EVT-R14]` | **Péage caritatif** : autocollants « J'aime Maman Aeterna ». | Acheter : **−500 ₡**, **+2 % ICC** | Refuser : **−4 % ICC** |
| `[EVT-R15]` | **Échange d'angle mort** avec un autre contrebandier. | Troc aveugle : **−500 ₡**, +1 caisse aléatoire de Tier 2 (si place libre) | Refuser : aucun effet |
