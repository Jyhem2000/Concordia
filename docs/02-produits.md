# 2. Produits & marché

> Les stats des produits et des tiers (prix, tags, masquage, stocks, quotas) sont dans [`products.ts`](../src/data/products.ts), qui fait foi : ce chapitre porte les règles des tags et le lore. Les multiplicateurs d'événements sont au chap. 6, les districts producteurs / demandeurs dans [`districts.ts`](../src/data/districts.ts), les sanctions par tier au chap. 5.
> **Unité :** 1 caisse = 1 emplacement de soute.

## Les tags système

| ID | Libellé | Règles |
| :--- | :--- | :--- |
| `[TAG-LEGAL]` | Légal | Ne peut jamais devenir illégal. Un produit Légal ne porte **aucun autre tag**. **Couverture :** risque retiré × part de Légal dans la cargaison (valeurs des tags : [`tags.ts`](../src/data/tags.ts)). Chaque caisse **masque 1 caisse** du tag indiqué dans sa fiche (voir *Masquage*). Interactions : `[VEH-02]`. Sans effet en `[D4]`. |
| `[TAG-PERISHABLE]` | Au frais | Tout ce qui doit rester au frais, pour se conserver ou pour ne pas fondre : **cycle de fraîcheur** (ci-dessous). Modificateurs : `[VEH-03]`, `[EVT-G01]` (qui fait fondre le beurre et le chocolat) ; l'affinage de `[CREW-03]` (produits au frais Gourmet seulement). |
| `[TAG-GOURMET]` | Gourmet | La vraie nourriture d'avant, celle qu'une cheffe étoilée sait vendre : beurre, charcuterie, curry, miel, roquefort, viande rouge. Pas les biotechnologies (`[T4-05]` est au frais, mais pas Gourmet). Modificateurs : `[CREW-03]` (savoir-faire, affinage des Gourmet au frais, quotas), `[LOC-D2-1]`. |
| `[TAG-FRAGILE]` | Fragile | Lors d'une **fuite réussie** (ou d'un passage forcé chez les milices), chaque caisse intacte peut être endommagée. **Chocs :** hors fuite, à chaque perte de châssis d'au moins un seuil en une fois (aléas, refus du racket, dopage, éjection…), chaque caisse intacte peut aussi être endommagée. Chances et seuil : `breakage` dans [`tags.ts`](../src/data/tags.ts). Une caisse endommagée le reste, forme un lot à part et se vend comme elle paie à prix réduit (`DAMAGED_FACTOR` dans [`balance.ts`](../src/data/balance.ts)). Immunité : `[MOD-04]`. |
| `[TAG-ADDICTIVE]` | Addictif | **Clientèle captive :** les accros reviennent chaque matin, le rachat au cours se reconstitue plus vite (`demandRefill` dans [`tags.ts`](../src/data/tags.ts) ; *Quota de rachat*). Interactions : `[CREW-01]` (salaire en nature), `[EVT-D3-02]`, `[EVT-R01]`. |
| `[TAG-ODOROUS]` | Odorant | **Au trajet :** risque ajouté × part odorante de la cargaison. **Au contrôle :** chance retirée au bluff × part odorante (*malus d'odeur*), annulable par `[T2-01]`. Modificateurs (sur les deux malus) : `[D6]`, `[EVT-G04]`, `[MOD-02]`, `[EVT-D1-01]` ; les doublements de `[D6]` et `[EVT-G04]` ne se cumulent pas. |
| `[TAG-CULTURE]` | Culture | Cible idéologique : **risque ajouté × part culturelle** de la cargaison dans les districts à **délation idéologique** (chap. 3). Modificateur : `[EVT-D2-01]`. Interaction : `[LOC-D2-1]`. |
| `[TAG-TECH]` | Tech | **risque ajouté × part Tech** de la cargaison dans les districts équipés de **scanners électromagnétiques** (chap. 3). Modificateurs : `[MOD-03]` (annulation), masquage par `[T0-02]`, `[EVT-G03]`, `[EVT-D5-03]`. |
| `[TAG-BIO]` | Bio-signature | La trace moléculaire que flairent les **bio-scanners** : additifs, pharmacie, biotechnologies, semences vivantes (l'ADN non breveté). **Risque ajouté × part Bio-signature** de la cargaison dans les districts qui en sont équipés (chap. 3). Modificateur : `[LOC-D3-1]`. Interaction : `[LOC-D2-1]`. |
| `[TAG-FESTIVE]` | Festif | **Vente de nuit :** pendant le couvre-feu, se vend mieux (la vie nocturne réclame ses vices : confiseries et boissons énergisantes, alcool, cigares, musique interdite, charcuterie d'apéro, et la vraie viande du buffet). À l'**after du couvre-feu** (chap. 1), beaucoup mieux. Coefficients : `nightSale` dans [`tags.ts`](../src/data/tags.ts), `AFTER` dans [`balance.ts`](../src/data/balance.ts) (chap. 2). |
| `[TAG-LUXURY]` | Luxe | Ce qu'un agent corrompu accepte en nature : café, cigares, whisky, roquefort, viande rouge, œuvres d'art. **Seul le Luxe s'offre à la corruption**, avec le Cash-Puce, et une seule caisse apporte la **connivence** (chap. 5). |

### Masquage 1:1 (partiel)
Chaque caisse de Tier 0 masque **1 caisse** du tag associé à ce produit (champ `masks`). Le masquage se compte **tag par tag** : pour un tag, le nombre de caisses masquées est le plus petit entre les caisses de Tier 0 qui masquent ce tag et les caisses qui le portent. Une caisse ne peut être masquée qu'une fois **par tag** : une caisse qui porterait deux tags masquables aurait besoin d'un Tier 0 pour chacun. Une caisse masquée :
* **compte pour une fraction** (`MASKED_CRATE_WEIGHT` dans [`balance.ts`](../src/data/balance.ts)) dans la part de son tag pour la détection (odeur, culture, Bio-signature) : le masquage réduit le risque sans jamais l'annuler ;
* compte dans le bonus de bluff (chap. 5), qui compte les **masquages effectifs**, c'est-à-dire les caisses de Tier 0 qui masquent réellement une caisse.

`[TAG-PERISHABLE]` et les autres tags sans colonne de masquage ne se masquent pas. Pour la Tech, le masquage par l'eau réduit le risque ; seul `[MOD-03]` l'annule.

### Cycle de fraîcheur
Tout lot acheté démarre **Extra-frais**. L'Extra-frais est une **prime de livraison express** : elle ne survit pas à 20h00 (tournée de nuit, demi-journée perdue, sortie de garde à vue). Coefficients et âges : `FRESHNESS` dans [`balance.ts`](../src/data/balance.ts) ; le coefficient de fraîcheur entre dans le Savoir-Faire (chap. 2).

| État | Coefficient de vente | Période (sans équipement) |
| :--- | :--- | :--- |
| Extra-frais | prime | le jour de l'achat, jusqu'à 20h00 |
| Frais | neutre | de 20h00 le jour d'achat jusqu'à la fin du lendemain |
| Défraîchi | décote | à partir du 2e matin après l'achat |
| Dégradé | forte décote | à partir du 3e matin |
| Perdu | — | 4e matin : détruit à 06h00 (signalé au briefing) |

* **Lecture :** livrer le jour même = prime ; livrer de nuit ou le lendemain = prix normal ; traîner = perte.
* **La prime suppose un trajet :** une caisse revendue sans avoir quitté son district d'achat a son Savoir-Faire plafonné (clause anti-arbitrage, chap. 2). Livrer le jour même, c'est acheter, rouler, vendre avant 20h00.
* **Ordre de vente :** les lots les plus anciens partent en premier (chap. 2) : on écoule d'abord ce qui se dégrade.
* **Recours :** les lots Défraîchis ou Dégradés se revendent à prix réduit (coefficient de fraîcheur), ou se donnent en paiement (chap. 2).
* **Équipement :** les états se calculent sur un **âge effectif**. Le fourgon frigorifique `[VEH-03]` ne compte qu'un matin sur deux (âge divisé par deux, arrondi au supérieur). *Ex. :* une caisse achetée le Jour 5 est Extra-frais jusqu'au Jour 5 à 20h00, Fraîche les Jours 6–7, Défraîchie les Jours 8–9, Dégradée les Jours 10–11, et perdue le Jour 12 à 06h00.
* *Pourquoi pas « jamais sous Frais » :* avec l'affinage de `[CREW-03]`, les produits au frais Gourmet seraient devenus une rente sans risque, et le dilemme de la fraîcheur aurait disparu.

---

## Les tiers

| Tier | Nom | Intention de design |
| :--- | :--- | :--- |
| **0** | Marchandises officielles (couverture inviolable) | Marge infime, risque zéro. Couvre et masque la contrebande. |
| **1** | Petits plaisirs coupables (déviances légères) | Faible investissement, idéal en début de partie. |
| **2** | Contrebande culturelle & épicerie noire (délits majeurs) | Le cœur du jeu. Fortes fluctuations selon la propagande. |
| **3** | Trafic lourd & « armes » gastronomiques (crimes fédéraux) | Gros investissements, fortes marges. |
| **4** | Ennemis publics n°1 (légendaires) | Fin de partie. Marges colossales. |

Stock par jour, quota de demande (chap. 2) et bonus de Forte demande de chaque tier : `TIERS` dans [`products.ts`](../src/data/products.ts).

---

**Noms :** un nom de produit tient sur une ligne du marché, 30 caractères au plus ; le reste (origine, détail de lore) va dans la ligne de lore de la fiche produit (chap. 7).

## Tier 0

| ID | Nom |
| :--- | :--- |
| `[T0-01]` | Bio-Briques « Nutri-Standard » |
| `[T0-02]` | Eau Minérale Déminéralisée |
| `[T0-03]` | Antidépresseurs « Sourire+ » |
| `[T0-04]` | Manuels d'Auto-Censure |

* **[T0-01]** — Briques de pâte nutritive grise (« Bug-Blocks »), base de la Camisole Métabolique. Leur odeur d'insecte fermenté couvre n'importe quel saucisson.
* **[T0-02]** — Garantie 0 % d'électrolytes pour éviter l'excitation citoyenne. Empilée autour de l'électronique, elle absorbe les ondes des scanners : elle masque la Tech. **Refroidissement moteur :** des caisses (`cooling` dans [`products.ts`](../src/data/products.ts)) sont consommées automatiquement pour annuler l'usure d'un trajet de nuit ou la surchauffe de `[EVT-G01]`, s'il en reste assez. Désactivable depuis le panneau du soir ; la carte indique ce que le dernier trajet a consommé ou usé.
* **[T0-03]** — Pilules d'acceptation prescrites par Aeterna, aussi injectées dans l'eau courante.
* **Caisses scellées du DSC** — chargées par la plateforme pour une mission de nuit (chap. 1) : légales, Tier 0, hors commerce (jamais en boutique, ni vendues, ni données, valeur nulle), livrées d'office ou reprises à 06h00. Elles n'existent que la nuit.
* **[T0-04]** — Petit guide papier rédigé par Aeterna. **Aide au bluff, passive :** dès un certain nombre de caisses en soute, bonus au bluff, sans rien donner (`bluffAid` dans [`products.ts`](../src/data/products.ts)).

## Tier 1

| ID | Nom |
| :--- | :--- |
| `[T1-01]` | Œufs en Chocolat Fourrés |
| `[T1-02]` | Grains d'Arabica Torréfiés |
| `[T1-03]` | Beurre de Baratte Demi-Sel |
| `[T1-04]` | Nouilles « MSG-621 » |
| `[T1-05]` | Chewing-gums à la Nicotine |
| `[T1-06]` | Huile de Friture Usagée |

* **[T1-01]** — Vrai cacao et saccharose non-édulcoré, sous une coquille qui casse au moindre choc.
* **[T1-02]** — Torréfié en cachette sur le campus de `[D2]`. L'odeur du vrai café attire les patrouilles, mais il ouvre bien des portes.
* **[T1-03]** — Classé « Poison Cardiovasculaire ». Particulièrement vulnérable à `[EVT-G01]`.
* **[T1-04]** — Glutamate monosodique et exhausteurs E621 interdits. Valeur refuge en temps de crise.
* **[T1-05]** — Détournés des laboratoires de sevrage de `[D3]`. Très prisés des bureaucrates stressés de `[D5]`.
* **[T1-06]** — Récupérée dans des friteuses clandestines pour les générateurs hors-réseau de `[D4]`.

## Tier 2

| ID | Nom |
| :--- | :--- |
| `[T2-01]` | Curry Vindaloo « Lava-Grade » |
| `[T2-02]` | Saucisson Ibérique & Chorizo |
| `[T2-03]` | Caisses de Vinyles Rock & Rap |
| `[T2-04]` | Lots de « Dumbphones » |
| `[T2-05]` | Canettes « Tcherno-Bull » |
| `[T2-06]` | Clés USB « Monde Libre » |
| `[T2-07]` | Miel Sauvage Non-Pasteurisé |

* **[T2-01]** — Épices importées en fraude. **Aide au bluff, passive :** une caisse en soute sature le nez des chiens-robots et annule le malus d'odeur du bluff (`bluffAid` dans [`products.ts`](../src/data/products.ts)), sans rien donner.
* **[T2-02]** — Chorizo frais et saucisson à peine séché : ça tourne vite. Recherché dans les zones ouvrières et chez les bobos, surtout la nuit.
* **[T2-03]** — Paroles jugées « micro-agressives » par Aeterna.
* **[T2-04]** — Téléphones 2G sans GPS ni micro d'écoute, retapés dans les ateliers clandestins des Ruches.
* **[T2-05]** — Boisson énergisante bannie. **Double action :**
  1. **Dopage pilote** (fuite ou passage forcé, une fois par jour) : chance de fuite en plus, mais perte de châssis (un choc, qui peut casser les fragiles) et d'ICC, sauf face aux milices (`doping` dans [`products.ts`](../src/data/products.ts)).
  2. **Nuit blanche** (à 20h00) : lève l'épuisement pour une 2e tournée de nuit consécutive, au prix de Santé, et interdite sous un seuil de Santé (`sleeplessNight` dans [`products.ts`](../src/data/products.ts)). Une 3e nuit d'affilée reste impossible.
  * Chaque usage **boit une caisse**.
* **[T2-06]** — Encyclopédie non-censurée d'avant-guerre, films interdits, archives de mèmes.
* **[T2-07]** — Produit par de vraies abeilles dans des ruches clandestines cachées sur les toits végétalisés de `[D2]`, en bocaux de verre cassants, fragile, et sans rien que les bio-scanners cherchent.

## Tier 3

| ID | Nom |
| :--- | :--- |
| `[T3-01]` | Roquefort « Bio-Hazard » |
| `[T3-02]` | Boîtes de Cigares Cubains |
| `[T3-03]` | Whisky Écossais Vieilli |
| `[T3-04]` | Antibiotiques « Old-School » |
| `[T3-05]` | Graines de Tomates Fertiles |
| `[T3-06]` | Cartes Graphiques Sans Bride |
| `[T3-07]` | Clones Vocaux & Deepfakes |

* **[T3-01]** — Moisissure vivante au lait cru, classée Arme Biologique par le DSC.
* **[T3-02]** — Feuilles de tabac entières importées en fraude. Luxe : monnaie de corruption, et de `[LOC-D6-1]`.
* **[T3-03]** — Single malt à 46°. **Monnaie d'initié :** `[LOC-D4-2]`, corruption (Luxe), racket de `[D4]` .
* **[T3-04]** — Génériques sans micropuce de traçage biométrique.
* **[T3-05]** — Semences paysannes reproductibles, interdites par le monopole agro-industriel du DSC.
* **[T3-06]** — GPU permettant de faire tourner des IA locales non-censurées.
* **[T3-07]** — Kits détournés des studios du ministère, ceux qui fabriquent les faux gagnants de la Loterie. Espionnage et chantage. Monnaie de `[LOC-D6-1]`.

## Tier 4

| ID | Nom |
| :--- | :--- |
| `[T4-01]` | Bœuf Wagyu de Kobé |
| `[T4-02]` | Œuvres d'Art du Monde d'Avant |
| `[T4-03]` | Pass Biométriques « ICC-100% » |
| `[T4-04]` | « Placebo-Officiel » du DSC |
| `[T4-05]` | Cellules Souches « Jouvence » |
| `[T4-06]` | Vieux Serveur Aeterna |

* **[T4-01]** — L'élevage bovin est puni de rééducation à vie pour « Écocide Méthanier » : cette vraie viande vaut une fortune chez l'élite.
* **[T4-02]** — Toiles de maîtres et sculptures d'avant la fermeture du mur, rayées des inventaires officiels : valeur refuge des élites, hors des Crédits périssables.
* **[T4-03]** — Certificats administratifs vierges. Les bannis sans puce de `[D4]` s'en arrachent pour se refaire une identité. **Action joueur :** utiliser une mallette (consommée) restaure de l'ICC hors plafond (`iccRestore` dans [`products.ts`](../src/data/products.ts)), **1 seule fois par partie** (un double réenregistrement d'identité alerterait le noyau d'Aeterna).
* **[T4-04]** — Sérum physiologique détourné de `[D3]`, qui valide le QR-code sanitaire sans injecter la molécule de docilité.
* **[T4-05]** — Bioréacteurs de sang synthétique et greffons volés dans les cliniques de `[D3]`. Extrêmement sensibles aux chocs, et à garder au frais : le fourgon bio-médical `[VEH-03]` est fait pour eux. Convoités par les gérontocrates en quête d'immortalité.
* **[T4-06]** — Serveur optronique arraché aux salles blanches ministérielles, contenant les preuves qu'Aeterna fabrique les pandémies et que le DSC revend la vraie nourriture au marché noir.
  * **Stock :** réduit, avec une apparition aléatoire dans son district producteur (`dailyStock` et `appearanceChance` dans [`products.ts`](../src/data/products.ts)).
  * **Mort subite :** une fouille effective avec au moins 1 caisse en soute déclenche l'exécution sommaire (Game Over).
  * **Encombrant :** une baie de serveur n'entre pas dans le double fond (chap. 4).
  * **Balise de traçage :** tant qu'au moins 1 caisse est en soute, un malus au risque d'interception partout (`beaconRisk` dans [`products.ts`](../src/data/products.ts)), racket de `[D4]` compris (les milices captent aussi le signal) ; annulé tant que `[CREW-02]` travaille (chap. 4).
  * **Grandes fins :** condition de la fin « Saboteur » (en `[D4]` à minuit), et outil des injections de Glitch pour la fin « Fantôme » (chap. 1 et 4).

---

## Information de marché
* **District actuel :** cours exacts du jour.
* **Autres districts :** le joueur ne voit que la **mémoire de marché** — le dernier cours qu'il y a lui-même observé, avec sa date (*« vu il y a 3 jours »*).
* **Tendance publique :** chaque matin, le Fil publie pour chaque district le cours du matin de chaque produit, mais le joueur n'en voit que la **tendance** des jours passés, jusqu'à la veille : le sens de chaque mouvement (hausse, baisse, stable sous un seuil, `TREND_FLAT` dans [`market.ts`](../src/engine/market.ts)), depuis combien de jours il dure, et la forme de la courbe, jamais les prix. Le prix exact se découvre sur place (mémoire de marché) ou avec `[CREW-02]`. *Intention :* parier sur un cours (« ça monte depuis trois jours, encore un ? ») sans tout savoir d'avance : la tendance dit d'où vient le cours, pas où il est aujourd'hui.
* **Historique :** chaque observation (à l'arrivée dans un district, et chaque matin dans le district où l'on se trouve) est gardée, une par district et par jour (la dernière du jour l'emporte, par exemple de nuit quand un multiplicateur « jour seulement » tombe).
* **Vision en temps réel :** `[CREW-02]`.
* **Profil public des districts :** les listes Production et Forte demande de chaque district sont connues de tous (catalogue de consommation du DSC, rumeur des quais) : la carte et la fiche de chaque produit les affichent. Ce qui reste à découvrir sur place, c'est le cours du jour (bruit, événements) et la boutique.
* Les événements (globaux et locaux) sont publics : ils passent au téléscripteur dès 06h00 (chap. 6).

## Boutique du jour (générée à 06h00)
Chaque district propose un **minimum de produits** (`SHOP_MIN_PRODUCTS` dans [`balance.ts`](../src/data/balance.ts) ; davantage en `[D4]` et les jours d'événement à apparition) :
1. **Socle officiel :** tous les produits de Tier 0, toujours disponibles partout ; aucun district ne les place en Forte demande. *Lore :* même l'élite de `[D6]` en achète pour nourrir ses domestiques et afficher une comptabilité « 100 % Zéro-Carbone ».
2. **Production locale :** tous les produits de la liste Production du district (exceptions : tirage partiel en `[D4]`, apparition limitée de `[T4-06]`).
3. **Complément neutre :** si le total est inférieur au minimum, tirage aléatoire de produits de Tier 1 à 3 neutres pour ce district.

* **Exclusion :** un district ne vend **jamais** un produit de sa liste Forte demande, sauf événement qui le précise. *Logique :* un quartier vend son surplus et ne vend pas ce qui lui manque ; le joueur achète là où l'on produit et revend là où ça manque.
* **Affichage :** chaque produit en boutique dit pourquoi il y est (production locale, socle officiel, arrivage du jour, arrivage d'événement), et la fiche produit rappelle qu'un produit en Forte demande n'est jamais en boutique là-bas (chap. 7).
* **Stocks :** par produit et par jour, selon le tier ([`products.ts`](../src/data/products.ts)). Modificateurs : `[EVT-G05]`, `[EVT-D1-01]`, `[EVT-D3-03]`.
* **Demande universelle :** le joueur peut **toujours vendre** n'importe quelle caisse, dans n'importe quel district.

## Cours du jour (06h00)
```
Cours = Arrondi( Prix_Base × Coef_District × Bruit × Mult_Événement )
```
* **Coef_District :** coefficient Production, Neutre (1.00) ou Forte demande du district ([`districts.ts`](../src/data/districts.ts)). En Forte demande, on ajoute le **bonus de tier** ([`products.ts`](../src/data/products.ts)) — plus le produit est dangereux, plus il se paie cher.
  *Ex. :* `[T4-01]` en `[D6]` se paie au coefficient de Forte demande de `[D6]` plus le bonus du Tier 4.
* **Bruit (tendance du marché) :** propre à chaque produit dans chaque district, il **garde la mémoire de la veille** et revient vers la normale (`QUOTE_NOISE` dans [`balance.ts`](../src/data/balance.ts)) :
  ```
  Écart du jour = Persistance × Écart de la veille + Choc du jour   (borné)
  Bruit = 1 + Écart du jour
  ```
  Le choc est tiré uniformément chaque matin ; le Jour 1, l'écart est tiré uniformément entre les bornes. *Lecture :* un produit anormalement bon marché aujourd'hui le restera probablement demain, puis revient vers son cours normal en quelques jours ; une hausse de plusieurs jours n'annonce pas une baisse, seulement un retour progressif. Un mauvais tirage aux deux bouts peut rendre un trajet perdant. L'historique des cours observés (fiche produit, chap. 7) permet de lire ces tendances.
* **Mult_Événement = min( plafond, produit des multiplicateurs d'événement × Bonus_Influence )** (plafond : `EVENT_MULT_CAP` dans [`events.ts`](../src/data/events.ts))
  * *Multiplicateurs d'événement :* 1.00 par défaut ; un par événement en vigueur et par contrecoup, qui se multiplient (chap. 6).
  * *Bonus_Influence :* `[LOC-D2-1]`, le lendemain de la commande seulement (1.00 sinon).
  * *Plafond :* quel que soit le cumul, jamais au-dessus. Le détail du cours montre chaque multiplicateur, puis la ligne du plafond s'il s'applique.
* **Le cours est fixe toute la journée.** La nuit ne recalcule rien ; elle n'applique que deux ajustements connus dès le matin : le tag de vente de nuit (Festif), et l'annulation des événements marqués « jour seulement ».

## Quota de rachat
Pendant de la boutique : un district ne rachète qu'une quantité limitée de chaque produit au plein cours. À ne pas confondre avec le statut *Forte demande* (qui fixe le cours et le quota) : tout produit a un quota, même produit sur place, où il se revend mal (coefficient de production).
* **Quota :** par produit et par district, selon le tier et le statut du produit dans le district ([`products.ts`](../src/data/products.ts)). Modificateurs (multiplicatifs entre eux) : `[CREW-03]` (Gourmet), carte « contrebandier concurrent » de `[LOC-D5-1]`.
* **Rachat restant :** plein au Jour 1. Chaque vente le consomme, de jour comme de nuit. **Chaque matin à 06h00, il remonte d'une fraction du quota** (`DEMAND_REFILL_DIVISOR` dans [`balance.ts`](../src/data/balance.ts), arrondi au supérieur ; plus vite pour `[TAG-ADDICTIVE]`, clientèle captive), sans dépasser le quota. Vider un marché le pénalise donc plusieurs jours.
* **Au-delà du rachat restant, le marché est saturé :** chaque caisse supplémentaire se vend à prix réduit (`Coef_Demande`, `SATURATED_SALE_FACTOR` dans [`balance.ts`](../src/data/balance.ts)).
* **Pic suspect :** vendre au-delà du rachat restant alerte Aeterna — **le lendemain**, le risque de base de ce district augmente pour toute la journée (un seul pic par district, quel que soit le nombre de ventes saturées ; `SUSPICIOUS_PEAK_RISK` dans [`balance.ts`](../src/data/balance.ts) ; icône 👁️ sur la carte).
* **Affichage :** *« Rachat au cours : 5 (+2 demain) »* sur chaque ligne du tableau des cours (chap. 7).
* *Lecture stratégique :* on répartit ses ventes **dans le temps et dans l'espace** (8 caisses en `[D6]` aujourd'hui, le reste en `[D5]` demain, et on laisse `[D6]` se reconstituer), en arbitrant avec la fraîcheur et la collecte de Viktor.

## Prix de vente
* **Ordre de vente :** les caisses d'un produit partent des lots les plus anciens aux plus récents ; chaque caisse garde son prix d'achat et son statut de voyage (clause anti-arbitrage).
* **Arrondis :** tout montant calculé (cours, prix de vente, intérêts, amendes, commissions, collecte) est arrondi au ₡ le plus proche. Exceptions : l'offre minimale de corruption et le pillage des milices sont arrondis au supérieur.
```
Prix_Vente = Arrondi( Cours × Commission × Coef_Demande × Coef_Condition × Savoir_Faire )
```
* **Commission de puce** (`SALE_COMMISSION` dans [`balance.ts`](../src/data/balance.ts)) **:** chaque vente P2P est ponctionnée par l'infrastructure d'Aeterna, à l'aveugle : le relais prélève sa part sans rien enregistrer (voir *Cash-Puce*). Acheter puis revendre au même endroit coûte donc toujours la commission.
* **Coef_Demande :** 1.00 dans la limite du rachat restant, prix saturé au-delà.
* **Coef_Condition :** caisse endommagée (`[TAG-FRAGILE]`, chap. 2 ; `DAMAGED_FACTOR` dans [`balance.ts`](../src/data/balance.ts)).
* **Savoir_Faire = Coef_Fraîcheur × Coef_Nuit × Bonus_Mama**, avec **rendements décroissants** : au-delà d'un seuil, l'excédent ne compte qu'en partie (`KNOW_HOW_SOFT_CAP` et `KNOW_HOW_EXCESS_FACTOR` dans [`balance.ts`](../src/data/balance.ts)).
  * *Coef_Fraîcheur :* `[TAG-PERISHABLE]` (chap. 2).
  * *Coef_Nuit — tags de vente de nuit* (pendant le couvre-feu ; coefficients : `nightSale` dans [`tags.ts`](../src/data/tags.ts) ; à l'after du couvre-feu, le Festif prend le coefficient de la fête, `AFTER` dans [`balance.ts`](../src/data/balance.ts), chap. 1) :

| Tag | Effet | Logique |
| :--- | :---: | :--- |
| `[TAG-FESTIVE]` Festif | léger bonus ; fort à l'after | Prime de fête clandestine : la vie nocturne réclame ses vices, surtout là où la fête bat son plein. |
| aucun des deux | aucun | — |

  * *Bonus_Mama :* `[CREW-03]`, sur les produits `[TAG-GOURMET]`.
* **Clause anti-arbitrage :** Savoir_Faire est plafonné (`ANTI_ARBITRAGE_CAP` dans [`balance.ts`](../src/data/balance.ts)) si la caisse est revendue dans son district d'achat sans avoir voyagé.
* *Intention — des builds, pas une recette :* chaque axe de bonus vise une famille de produits différente (équipier, modules, `[LOC-D2-1]`, nuit). Les combinaisons rapportent davantage, mais les plafonds (`Mult_Événement`, `Savoir_Faire`) empêchent une seule combinaison d'écraser les autres.

## Paiement en nature
Toute caisse donnée en paiement (corruption, seulement le Luxe ; chantage, salaire, péage…) est valorisée à son **prix de base** ([`products.ts`](../src/data/products.ts)), jamais au cours local ni à son prix d'achat, **réduit par son état** : une caisse endommagée ou défraîchie (Défraîchie, Dégradée) paie moins, l'Extra-frais ne paie jamais plus. Les lots les plus anciens partent en premier. C'est un barème officieux, le même partout, que les agents et les milices appliquent sans discuter.
* **Pourquoi payer en caisses :**
  1. **Une économie réelle** sur les caisses achetées sous leur prix de base (production locale, bonne fluctuation) : elles paient plus qu'elles n'ont coûté. À l'inverse, une caisse achetée cher (forte demande, mauvais tirage) paie moins qu'elle n'a coûté.
  2. **La connivence** en corruption (chap. 5) : une caisse de Luxe rend l'agent plus conciliant.
  3. **Le Cash-Puce reste intact** : utile quand il manque pour une offre, ou pour garder de quoi payer le plein.
* **Affichage :** pour chaque caisse proposée, l'app montre sa valeur en paiement et son prix d'achat, donc ce que le paiement en nature fait gagner ou perdre par rapport au cash (chap. 7).
