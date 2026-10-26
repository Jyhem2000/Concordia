# 5. Véhicules, modules & équipage

## Véhicules
* **Achat** uniquement à `[LOC-D4-1]`. Le nouveau châssis reprend automatiquement la marchandise et les modules ; l'ancien est **perdu** (aucune reprise).
* *Lore :* tous les châssis sont des utilitaires officiellement enregistrés auprès du DSC (modifiés en secret par Mécano-Mitch), d'où leur accès à tous les quais de service.
* *Conso :* par trajet, selon la phase, plus le surcoût des districts traversés (chap. 4).
* *Bonus de risque :* les passifs qui réduisent le risque sont des **multiplicateurs** (chap. 6).
* *Stats* (prix, soute, slots de modules, PV max, réservoir, consommation de jour et de nuit) : `VEHICLES` dans [`vehicles.ts`](../src/data/vehicles.ts).

| ID | Nom | Passif |
| :--- | :--- | :--- |
| `[VEH-01]` | Fourgonnette « Citi-Volt » (départ) | **Profil bas :** risque d'interception **×0,90**. *Éco-Moteur :* consomme autant de nuit que de jour (les autres châssis consomment davantage la nuit). |
| `[VEH-02]` | Navette « Zéro-C » | **Camouflage corporatif :** aux couleurs du DSC ; tant que les caisses `[TAG-LEGAL]` font **≥ 20 %** de la cargaison, risque **×0,85**. |
| `[VEH-03]` | Fourgon Bio-Médical « Panacea-V8 » | **Chaîne du froid médicale :** les pertes de fraîcheur du matin n'ont lieu **qu'un matin sur deux** (le passage à Standard de 20h reste inchangé). **Transpondeur d'urgence :** en `[D3]` et `[D5]`, lors d'une fuite : **+25 %** de réussite, **0 dégât** de châssis en cas de succès, perte d'ICC du succès **÷2** (arrondie en faveur du joueur). |
| `[VEH-04]` | Compacteur Sanitaire « Bunker-Lourd » | **Monstre blindé & benne acide :** au racket de `[D4]`, péage **÷2**, et un « Forcer » réussi ne coûte **aucun dégât** de châssis ; **broyeur acide** (mode d'éjection) utilisable partout, sans cooldown, **70 %** de réussite, 0 dégât, contrebande dissoute sans récupération (`[MOD-07]` reste prioritaire s'il est disponible). *Contrepartie :* **+10 %** au risque (tonnage hors-norme). |

---

## Modules
Chaque châssis a un nombre strict de slots. Les modules s'achètent **définitivement** à `[LOC-D4-1]`, et c'est **uniquement là** qu'on choisit (gratuitement) lesquels sont montés. Le montage est donc un choix de build pour plusieurs jours, pas un réglage par trajet. Prix et catégorie : `MODULES` dans [`vehicles.ts`](../src/data/vehicles.ts).

| ID | Nom | Effet |
| :--- | :--- | :--- |
| `[MOD-01]` | Caisson Cryo à l'Azote Volé | Les caisses `[TAG-PERISHABLE]` restent **Extra-Frais jusqu'à 20h le lendemain** de l'achat (vente de jour ou de nuit), puis ne descendent **jamais sous Standard**. Protège soute **et** moteur contre `[EVT-G01]`. |
| `[MOD-02]` | Diffuseur d'Échappement « Pin Sylvestre & Javel » | Réduit de **−75 %** les malus de `[TAG-ODOROUS]`. |
| `[MOD-03]` | Doublure en Plomb & Cage de Faraday | Annule le malus de `[TAG-TECH]`. |
| `[MOD-04]` | Suspensions & Silentblocs « Velours » | Immunise `[TAG-FRAGILE]` à la casse. Annule l'usure de châssis des trajets de nuit. |
| `[MOD-05]` | Plaque d'Immatriculation Rotative « E-Ink » | **1 fois par jour**, lors d'une fuite réussie : annule la perte d'ICC des caméras de trafic. |
| `[MOD-06]` | Pare-Buffles en Acier Trempé | Fuite : **+30 %** de réussite ; dégâts de châssis (succès et échec) et de Santé (échec) **÷2**. |
| `[MOD-07]` | Trappe de Largage « Égouts » | Mode d'éjection, **cooldown 3 jours** (interdit en `[D6]`). Jet 1 : **75 %** de réussite, 0 dégât. Jet 2 (si réussi) : le lendemain à 06h00, des complices récupèrent un pourcentage **aléatoire uniforme entre 0 % et 75 %** des caisses larguées. |
| `[MOD-08]` | Faux Terminal « Citoyen Or » | **+35 %** au bluff ; **−50 %** sur le tarif standard de corruption. |

---

## Équipage
* **Recrutement** à `[LOC-D1-2]`, **1 seul équipier actif** à la fois. Le premier recrutement est gratuit ; chaque changement coûte **1 500 ₡**. Chaque équipier ouvre un build différent : sûreté (Vance), information et finance (Glitch), gastronomie périssable (Mama Rosa).
* **Salaire payé d'avance :** à l'embauche pour le premier jour, puis à chaque routine matinale, avant toute prestation. S'il ne peut pas être payé, l'équipier ne travaille pas ce jour-là mais reste engagé. Montants : `CREW` dans [`vehicles.ts`](../src/data/vehicles.ts).
* **Discrétion aux portiques :** Glitch et Mama Rosa, recherchées par Aeterna, ne montent jamais en cabine : elles opèrent en amont ou par radio cryptée. Seul Vance voyage en cabine, grâce à son badge d'inspecteur réserviste.

| ID | Équipier | Bonus |
| :--- | :--- | :--- |
| `[CREW-01]` | « L'Ancien de la BRC » — Commandant Vance (copilote accrédité) | **Salaire réduit à 300 ₡** s'il **consomme** 1 caisse `[TAG-ADDICTIVE]` de **Tier 2 ou plus** de la soute à 06h00 (au choix du joueur) · Risque d'interception **×0,80** partout · **+15 %** à la corruption · révèle chaque matin le district de la ronde renforcée |
| `[CREW-02]` | « Glitch » — jeune hackeuse sous caféine (opératrice radio distante) | **Flux pirate :** cours de tous les districts en temps réel · rendement offshore **+0,5 %** sur chaque tranche (sauf jours de garde à vue) · **+20 %** à la fuite (pirate les feux) · **+20 %** pour falsifier un dossier de Loterie |
| `[CREW-03]` | « La Matriarche » — Mama Rosa Marini (atelier d'affinage) | Produits `[TAG-PERISHABLE]` vendus **×1.25** (bonus de savoir-faire, chap. 7) · **affinage :** les caisses Standard se revendent au coefficient Extra-Frais (**×1.30**) · quotas de demande des produits `[TAG-PERISHABLE]` **+50 %** (ses maîtres d'hôtel répartissent les livraisons) |

* **Vance :** vieux limier désabusé de l'époque où la police n'était pas dirigée par Aeterna, avec un laissez-passer d'inspecteur honoraire.
* **Glitch :** prodige du code bannie des écoles du DSC pour avoir fait réciter des poèmes anarchistes à Aeterna ; te guide depuis un cyber-squat blindé.
* **Mama Rosa :** ancienne cheffe triplement étoilée d'avant le Grand Reset, condamnée pour « Terrorisme Gastronomique et Incitation au Cholestérol » ; reconditionne ta marchandise sous faux scellés gastronomiques.
