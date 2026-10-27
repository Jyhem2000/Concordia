# 3. Tags & catalogue des produits

> Les stats des produits et des tiers (prix, tags, masquage, profil nuit, stocks, quotas) sont dans [`products.ts`](../src/data/products.ts), qui fait foi : ce chapitre porte les règles des tags et le lore. Les multiplicateurs d'événements sont au chap. 8, les districts producteurs / demandeurs dans [`districts.ts`](../src/data/districts.ts), les sanctions par tier au chap. 6.
> **Unité :** 1 caisse = 1 emplacement de soute.

## Les tags système

| ID | Libellé | Règles |
| :--- | :--- | :--- |
| `[TAG-LEGAL]` | Légal | Ne peut jamais devenir illégal. Un produit Légal ne porte **aucun autre tag**. **Couverture :** risque retiré × part de Légal dans la cargaison (valeurs des tags : [`tags.ts`](../src/data/tags.ts)). Chaque caisse **masque 1 caisse** du tag indiqué dans sa fiche (voir *Masquage*). Interactions : `[VEH-02]`. Sans effet en `[D4]`. |
| `[TAG-PERISHABLE]` | Périssable | **Cycle de fraîcheur** (ci-dessous). Modificateurs : `[MOD-01]`, `[VEH-03]`, `[CREW-03]`, `[EVT-G01]`, `[LOC-D2-1]`. Rachat des lots dégradés : `[LOC-D1-1]`. |
| `[TAG-FRAGILE]` | Fragile | Lors d'une **fuite réussie**, chaque caisse a **30 %** de chance d'être endommagée : elle se vend alors **×0.50**. **Chocs :** hors fuite, à chaque perte de châssis d'au moins **10 PV** en une fois (aléas, racket, dopage, éjection…), chaque caisse intacte a **10 %** de chance d'être endommagée. Immunité : `[MOD-04]`. |
| `[TAG-ADDICTIVE]` | Addictif | Monnaie de corruption (liste exacte au chap. 6). Interactions : `[CREW-01]`, `[EVT-D3-02]`, `[EVT-R01]`. |
| `[TAG-ODOROUS]` | Odorant | **Au trajet :** risque ajouté × part odorante de la cargaison. **Au contrôle :** chance retirée au bluff × part odorante (*malus d'odeur*), annulable par `[T2-01]`. Modificateurs (sur les deux malus) : `[D6]`, `[EVT-G04]`, `[MOD-02]`, `[EVT-D1-01]` ; les doublements de `[D6]` et `[EVT-G04]` ne se cumulent pas. |
| `[TAG-CULTURE]` | Culture | Cible idéologique : **risque ajouté × part culturelle** de la cargaison dans les districts à **délation idéologique** (chap. 4). Modificateur : `[EVT-D2-01]`. Interaction : `[LOC-D2-1]`. |
| `[TAG-TECH]` | Tech | **risque ajouté × part Tech** de la cargaison dans les districts équipés de **scanners électromagnétiques** (chap. 4). Modificateurs : `[MOD-03]`, `[EVT-G03]`, `[EVT-D5-03]`. |
| `[TAG-CHEMICAL]` | Chimique | **risque ajouté × part chimique** de la cargaison dans les districts équipés de **bio-scanners** (chap. 4). Modificateur : `[LOC-D3-1]`. **Largage offensif** en fuite : sacrifier 1 caisse crée un nuage aveuglant, **+15 %** de réussite. Interactions : `[EVT-D2-03]`, `[LOC-D2-1]`. |
| `[TAG-FLAMMABLE]` | Inflammable | **Explosion :** en cas d'échec de fuite, chaque caisse **non masquée** a **25 %** de chance d'exploser (**−15 PV** de châssis, caisse détruite). **Largage offensif** en fuite : déverser / enflammer 1 caisse, **+20 %** de réussite. |

### Masquage 1:1 (partiel)
Chaque caisse de Tier 0 masque **1 caisse** du tag associé à ce produit (champ `masks`). Le masquage se compte **tag par tag** : pour un tag, le nombre de caisses masquées est le plus petit entre les caisses de Tier 0 qui masquent ce tag et les caisses qui le portent. Une caisse ne peut être masquée qu'une fois **par tag** : une caisse à deux tags masquables (ex. `[T2-01]`, odorant et chimique) a besoin d'un Tier 0 pour chacun. Une caisse masquée :
* **compte pour une fraction** (`MASKED_CRATE_WEIGHT` dans [`balance.ts`](../src/data/balance.ts)) dans la part de son tag pour la détection (odeur, culture, chimique) : le masquage réduit le risque sans jamais l'annuler ;
* compte dans le bonus de bluff (chap. 6), qui compte les **masquages effectifs**, c'est-à-dire les caisses de Tier 0 qui masquent réellement une caisse ;
* est protégée de l'explosion `[TAG-FLAMMABLE]`.

`[TAG-PERISHABLE]`, `[TAG-TECH]` et les autres tags sans colonne de masquage ne se masquent pas (pour la Tech : `[MOD-03]`).

### Cycle de fraîcheur
Tout lot acheté démarre **Extra-Frais**. L'Extra-Frais est une **prime de livraison express** : elle ne survit pas au couvre-feu.

| État | Coefficient de vente | Période (sans équipement) |
| :--- | :--- | :--- |
| Extra-Frais | **×1.30** | de l'achat jusqu'à **20h le jour même** |
| Standard | **×1.00** | de 20h le jour d'achat jusqu'à la fin du lendemain |
| Faisandé | **×0.60** | à partir du 2e matin après l'achat |
| Avarié | **×0.25** | à partir du 3e matin |
| Pourri | **×0** | 4e matin — détruit automatiquement à 06h00 |

* **Lecture :** livrer le jour même = ×1.30 ; livrer de nuit ou le lendemain = ×1.00 ; traîner = perte.

---

## Les tiers

| Tier | Nom | Intention de design |
| :--- | :--- | :--- |
| **0** | Marchandises officielles (couverture inviolable) | Marge infime, risque zéro. Couvre et masque la contrebande. |
| **1** | Petits plaisirs coupables (déviances légères) | Faible investissement, idéal en début de partie. |
| **2** | Contrebande culturelle & épicerie noire (délits majeurs) | Le cœur du jeu. Fortes fluctuations selon la propagande. |
| **3** | Trafic lourd & « armes » gastronomiques (crimes fédéraux) | Gros investissements, fortes marges. |
| **4** | Ennemis publics n°1 (légendaires) | Fin de partie. Marges colossales. |

Stock par jour, quota de demande (chap. 7) et bonus de Forte demande de chaque tier : `TIERS` dans [`products.ts`](../src/data/products.ts). **Profil nuit** (*Festif* ou *Diurne*, chap. 7) : champ `nightProfile` de chaque produit.

---

## Tier 0

| ID | Nom |
| :--- | :--- |
| `[T0-01]` | Bio-Briques « Nutri-Standard » (Soja & Insectes) |
| `[T0-02]` | Eau Minérale Déminéralisée |
| `[T0-03]` | Antidépresseurs Doux « Sourire+ » |
| `[T0-04]` | Manuels d'Auto-Censure Citoyenne |

* **[T0-01]** — Briques de pâte nutritive grise (« Bug-Blocks »), base de la Camisole Métabolique. Leur odeur d'insecte fermenté couvre n'importe quel saucisson.
* **[T0-02]** — Garantie 0 % d'électrolytes pour éviter l'excitation citoyenne. **Refroidissement moteur :** **2 caisses** sont consommées automatiquement pour annuler l'usure d'un trajet de nuit ou la surchauffe de `[EVT-G01]` (désactivable dans les réglages).
* **[T0-03]** — Pilules d'acceptation prescrites par Aeterna, aussi injectées dans l'eau courante.
* **[T0-04]** — Petit guide papier rédigé par Aeterna. **Action contrôle :** donner **5 caisses** à l'agent donne **+10 %** au bluff.

## Tier 1

| ID | Nom |
| :--- | :--- |
| `[T1-01]` | Sodas « Mega-Cola » (Vrai Sucre) |
| `[T1-02]` | Grains d'Arabica Torréfiés |
| `[T1-03]` | Beurre de Baratte Demi-Sel |
| `[T1-04]` | Nouilles Instantanées « MSG-621 » |
| `[T1-05]` | Cartons de Chewing-gums Nicotine |
| `[T1-06]` | Bidons d'Huile de Friture Usagée |

* **[T1-01]** — Vrai saccharose non-édulcoré.
* **[T1-02]** — Torréfié en cachette sur le campus de `[D2]`. L'odeur du vrai café attire les patrouilles, mais il ouvre bien des portes.
* **[T1-03]** — Classé « Poison Cardiovasculaire ». Particulièrement vulnérable à `[EVT-G01]`.
* **[T1-04]** — Glutamate monosodique et exhausteurs E621 interdits. Valeur refuge en temps de crise.
* **[T1-05]** — Détournés des laboratoires de sevrage de `[D3]`. Très prisés des bureaucrates stressés de `[D5]`.
* **[T1-06]** — Récupérée dans des friteuses clandestines pour les générateurs hors-réseau de `[D4]`.

## Tier 2

| ID | Nom |
| :--- | :--- |
| `[T2-01]` | Curry Vindaloo « Lava-Grade » (Inde) |
| `[T2-02]` | Saucisson Sec Ibérique & Chorizo |
| `[T2-03]` | Caisses de Vinyles Rock & Rap |
| `[T2-04]` | Lots de « Dumbphones » (type 3310) |
| `[T2-05]` | Canettes « Tcherno-Bull » (Taurine x10) |
| `[T2-06]` | Valises de Clés USB « Monde Libre » |
| `[T2-07]` | Pots de Miel Sauvage Non-Pasteurisé |

* **[T2-01]** — Épices importées en fraude. **Action contrôle :** sacrifier **1 caisse** neutralise les chiens-robots et annule le malus d'odeur du bluff.
* **[T2-02]** — Recherché dans les zones ouvrières et chez les bobos, surtout la nuit.
* **[T2-03]** — Paroles jugées « micro-agressives » par Aeterna.
* **[T2-04]** — Téléphones 2G sans GPS ni micro d'écoute, retapés dans les ateliers clandestins des Ruches.
* **[T2-05]** — Boisson énergisante bannie. **Double action :**
  1. **Dopage pilote** (fuite, max 1 par jour) : **+25 %** de réussite, mais **−10 PV** de châssis et **−5 % d'ICC**.
  2. **Nuit blanche forcée** (à 20h00) : lève l'épuisement pour une 2e nuit consécutive, au prix de **−10 PV** de Santé. Interdit si la Santé est **≤ 10 PV**.
* **[T2-06]** — Encyclopédie non-censurée d'avant-guerre, films interdits, archives de mèmes.
* **[T2-07]** — Produit par de vraies abeilles dans des ruches clandestines cachées sur les toits végétalisés de `[D2]`, en bocaux de verre cassants, chargé de pollens et d'enzymes traqués par les bio-scanners.

## Tier 3

| ID | Nom |
| :--- | :--- |
| `[T3-01]` | Roquefort Français « Bio-Hazard » |
| `[T3-02]` | Boîtes de Cigares Cubains |
| `[T3-03]` | Caisses de Whisky Écossais (18 ans) |
| `[T3-04]` | Antibiotiques & Ivermectine « Old-School » |
| `[T3-05]` | Sacs de Graines de Tomates Fertiles |
| `[T3-06]` | Cartes Graphiques Rétro (Sans Bride IA) |
| `[T3-07]` | Clones Vocaux & Deepfakes sur Mesure |

* **[T3-01]** — Moisissure vivante au lait cru, classée Arme Biologique par le DSC.
* **[T3-02]** — Feuilles de tabac entières importées en fraude. Monnaie de corruption des douaniers d'élite et de `[LOC-D6-1]`.
* **[T3-03]** — Single malt à 46°. **Monnaie d'initié :** `[LOC-D4-2]`, corruption, racket de `[D4]`.
* **[T3-04]** — Génériques sans micropuce de traçage biométrique.
* **[T3-05]** — Semences paysannes reproductibles, interdites par le monopole agro-industriel du DSC.
* **[T3-06]** — GPU permettant de faire tourner des IA locales non-censurées.
* **[T3-07]** — Kits détournés des studios du ministère, ceux qui fabriquent les faux gagnants de la Loterie. Espionnage et chantage. Monnaie de `[LOC-D6-1]`.

## Tier 4

| ID | Nom |
| :--- | :--- |
| `[T4-01]` | Bœuf Wagyu de Kobé & Côtes Argentines |
| `[T4-02]` | Malles d'Œuvres d'Art & Montres Suisses |
| `[T4-03]` | Mallettes de Pass Biométriques « ICC-100% » |
| `[T4-04]` | Glacières de « Placebo-Officiel » (Anti-Vaccin DSC) |
| `[T4-05]` | Cuves de Cellules Souches « Jouvence » (Clonage) |
| `[T4-06]` | Vieux Serveur Aeterna |

* **[T4-01]** — L'élevage bovin est puni de rééducation à vie pour « Écocide Méthanier » : cette vraie viande vaut une fortune chez l'élite.
* **[T4-02]** — Toiles de maîtres et chronographes sans puce : valeur refuge des élites, hors des Crédits périssables.
* **[T4-03]** — Certificats administratifs vierges. Les bannis sans puce de `[D4]` s'en arrachent pour se refaire une identité. **Action joueur :** utiliser 1 mallette restaure **+25 % d'ICC**, **1 seule fois par partie** (un double réenregistrement d'identité alerterait le noyau d'Aeterna).
* **[T4-04]** — Sérum physiologique détourné de `[D3]`, qui valide le QR-code sanitaire sans injecter la molécule de docilité.
* **[T4-05]** — Bioréacteurs de sang synthétique et greffons volés dans les cliniques de `[D3]`. Extrêmement sensibles aux chocs. Convoités par les gérontocrates en quête d'immortalité.
* **[T4-06]** — Serveur optronique arraché aux salles blanches ministérielles, contenant les preuves qu'Aeterna fabrique les pandémies et que le DSC revend la vraie nourriture au marché noir.
  * **Stock :** réduit, avec une apparition aléatoire dans son district producteur (`dailyStock` et `appearanceChance` dans [`products.ts`](../src/data/products.ts)).
  * **Mort subite :** une fouille effective avec au moins 1 caisse en soute déclenche l'exécution sommaire (Game Over).
  * **Balise de traçage :** tant qu'au moins 1 caisse est en soute, un malus au risque d'interception partout (`beaconRisk` dans [`products.ts`](../src/data/products.ts)), racket de `[D4]` compris (les milices captent aussi le signal).
  * **Objectif ultime :** condition de la fin « Saboteur » (chap. 2).
