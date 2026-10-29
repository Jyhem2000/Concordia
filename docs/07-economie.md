# 7. Économie : marché & finances

> Les routes commerciales de référence (intention d'équilibrage) sont au chap. 9.

## Information de marché
* **District actuel :** cours exacts du jour.
* **Autres districts :** le joueur ne voit que la **mémoire de marché** — le dernier cours qu'il y a lui-même observé, avec sa date (*« vu il y a 3 jours »*). Brouillée en cas de Sédation (chap. 2).
* **Historique :** chaque observation (à l'arrivée dans un district, et chaque matin dans le district où l'on se trouve) est gardée, une par district et par jour (la dernière du jour l'emporte, par exemple de nuit quand un multiplicateur « jour seulement » tombe).
* **Vision en temps réel :** `[CREW-02]`.
* **Profil public des districts :** les listes Production et Forte demande de chaque district sont connues de tous (catalogue de consommation du DSC, rumeur des quais) : la carte et la fiche de chaque produit les affichent. Ce qui reste à découvrir sur place, c'est le cours du jour (bruit, événements) et la boutique.
* Les événements (globaux et locaux) sont publics : ils passent au téléscripteur dès 06h00 (chap. 8).

## Boutique du jour (générée à 06h00)
Chaque district propose un **minimum de produits** (`SHOP_MIN_PRODUCTS` dans [`balance.ts`](../src/data/balance.ts) ; davantage en `[D4]` et les jours d'événement à apparition) :
1. **Socle officiel :** tous les produits de Tier 0, toujours disponibles partout ; aucun district ne les place en Forte demande. *Lore :* même l'élite de `[D6]` en achète pour nourrir ses domestiques et afficher une comptabilité « 100 % Zéro-Carbone ».
2. **Production locale :** tous les produits de la liste Production du district (exceptions : tirage partiel en `[D4]`, apparition limitée de `[T4-06]`).
3. **Complément neutre :** si le total est inférieur au minimum, tirage aléatoire de produits de Tier 1 à 3 neutres pour ce district.

* **Exclusion :** un district ne vend **jamais** un produit de sa liste Forte demande, sauf événement qui le précise. *Logique :* un quartier vend son surplus et ne vend pas ce qui lui manque ; le joueur achète là où l'on produit et revend là où ça manque.
* **Affichage :** chaque produit en boutique dit pourquoi il y est (production locale, socle officiel, arrivage du jour, arrivage d'événement), et la fiche produit rappelle qu'un produit en Forte demande n'est jamais en boutique là-bas (chap. 10).
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
  Le choc est tiré uniformément chaque matin ; le Jour 1, l'écart est tiré uniformément entre les bornes. *Lecture :* un produit anormalement bon marché aujourd'hui le restera probablement demain, puis revient vers son cours normal en quelques jours ; une hausse de plusieurs jours n'annonce pas une baisse, seulement un retour progressif. Un mauvais tirage aux deux bouts peut rendre un trajet perdant. L'historique des cours observés (fiche produit, chap. 10) permet de lire ces tendances.
* **Mult_Événement = min( plafond, Mult_EvtActif × Bonus_Influence )** (plafond : `EVENT_MULT_CAP` dans [`events.ts`](../src/data/events.ts))
  * *Mult_EvtActif :* 1.00 par défaut. Si plusieurs multiplicateurs touchent le même produit (événement global, local, contrecoup, chap. 8), on garde celui dont l'écart `|Mult − 1.00|` est le plus fort (égalité : le local prime, puis le contrecoup cède).
  * *Bonus_Influence :* `[LOC-D2-1]`, multiplié par-dessus, le lendemain de la commande seulement (1.00 sinon).
  * *Plafond :* quel que soit le cumul, jamais au-dessus.
* **Le cours est fixe toute la journée.** La nuit ne recalcule rien ; elle n'applique que deux ajustements connus dès le matin : le profil nuit à la vente, et l'annulation des événements marqués « jour seulement ».

## Quota de rachat
Pendant de la boutique : un district ne rachète qu'une quantité limitée de chaque produit au plein cours. À ne pas confondre avec le statut *Forte demande* (qui fixe le cours et le quota) : tout produit a un quota, même produit sur place, où il se revend mal (coefficient de production).
* **Quota :** par produit et par district, selon le tier et le statut du produit dans le district ([`products.ts`](../src/data/products.ts)). Modificateurs (multiplicatifs entre eux) : `[CREW-03]`, carte « contrebandier concurrent » de `[LOC-D5-1]`.
* **Rachat restant :** plein au Jour 1. Chaque vente le consomme, de jour comme de nuit. **Chaque matin à 06h00, il remonte d'une fraction du quota** (`DEMAND_REFILL_DIVISOR` dans [`balance.ts`](../src/data/balance.ts), arrondi au supérieur), sans dépasser le quota. Vider un marché le pénalise donc plusieurs jours.
* **Au-delà du rachat restant, le marché est saturé :** chaque caisse supplémentaire se vend à prix réduit (`Coef_Demande`, `SATURATED_SALE_FACTOR` dans [`balance.ts`](../src/data/balance.ts)).
* **Pic suspect :** vendre au-delà du rachat restant alerte Aeterna — **le lendemain**, le risque de base de ce district augmente pour toute la journée (un seul pic par district, quel que soit le nombre de ventes saturées ; `SUSPICIOUS_PEAK_RISK` dans [`balance.ts`](../src/data/balance.ts) ; icône 👁️ sur la carte).
* **Affichage :** *« Rachat au cours : 5 (+2 demain) »* sur chaque ligne du tableau des cours (chap. 10).
* *Lecture stratégique :* on répartit ses ventes **dans le temps et dans l'espace** (8 caisses en `[D6]` aujourd'hui, le reste en `[D5]` demain, et on laisse `[D6]` se reconstituer), en arbitrant avec la fraîcheur et la collecte de Viktor.

## Prix de vente
* **Ordre de vente :** les caisses d'un produit partent des lots les plus anciens aux plus récents ; chaque caisse garde son prix d'achat et son statut de voyage (clause anti-arbitrage).
* **Arrondis :** tout montant calculé (cours, prix de vente, intérêts, amendes, commissions, collecte) est arrondi au ₡ le plus proche. Exceptions : l'offre minimale de corruption et le pillage des milices sont arrondis au supérieur.
```
Prix_Vente = Arrondi( Cours × Commission × Coef_Demande × Coef_Condition × Savoir_Faire )
```
* **Commission de puce** (`SALE_COMMISSION` dans [`balance.ts`](../src/data/balance.ts)) **:** chaque vente P2P est ponctionnée par l'infrastructure d'Aeterna, à l'aveugle : le relais prélève sa part sans rien enregistrer (voir *Cash-Puce*). Acheter puis revendre au même endroit coûte donc toujours la commission.
* **Coef_Demande :** 1.00 dans la limite du rachat restant, prix saturé au-delà.
* **Coef_Condition :** caisse endommagée (`[TAG-FRAGILE]`, chap. 3 ; `DAMAGED_FACTOR` dans [`balance.ts`](../src/data/balance.ts)).
* **Savoir_Faire = Coef_Fraîcheur × Coef_Nuit × Bonus_Mama**, avec **rendements décroissants** : au-delà d'un seuil, l'excédent ne compte qu'en partie (`KNOW_HOW_SOFT_CAP` et `KNOW_HOW_EXCESS_FACTOR` dans [`balance.ts`](../src/data/balance.ts)).
  * *Coef_Fraîcheur :* `[TAG-PERISHABLE]` (chap. 3).
  * *Coef_Nuit — profil nocturne* (pendant le couvre-feu ; coefficients : `NIGHT_PROFILE_FACTOR` dans [`balance.ts`](../src/data/balance.ts)) :

| Profil nuit | Effet | Logique |
| :--- | :---: | :--- |
| Festif | bonus | Prime de fête clandestine : la vie nocturne réclame ses vices (produits addictifs, culture interdite, charcuterie). |
| Diurne | malus | Excitants de bureau : leurs clients dorment. |
| — | aucun | — |

  * *Bonus_Mama :* `[CREW-03]`.
* **Clause anti-arbitrage :** Savoir_Faire est plafonné (`ANTI_ARBITRAGE_CAP` dans [`balance.ts`](../src/data/balance.ts)) si la caisse est revendue dans son district d'achat sans avoir voyagé.
* *Intention — des builds, pas une recette :* chaque axe de bonus vise une famille de produits différente (équipier, modules, `[LOC-D2-1]`, nuit). Les combinaisons rapportent davantage, mais les plafonds (`Mult_Événement`, `Savoir_Faire`) empêchent une seule combinaison d'écraser les autres.

## Paiement en nature
Toute caisse donnée en paiement (corruption, chantage, salaire, péage…) est valorisée à son **prix de base** ([`products.ts`](../src/data/products.ts)), jamais au cours local ni à son prix d'achat, **réduit par son état** : une caisse endommagée ou défraîchie (Faisandée, Avariée) paie moins, l'Extra-Frais ne paie jamais plus. Les lots les plus anciens partent en premier. C'est un barème officieux, le même partout, que les agents et les milices appliquent sans discuter.
* **Pourquoi payer en caisses :**
  1. **Une économie réelle** sur les caisses achetées sous leur prix de base (production locale, bonne fluctuation) : elles paient plus qu'elles n'ont coûté. À l'inverse, une caisse achetée cher (forte demande, mauvais tirage) paie moins qu'elle n'a coûté.
  2. **La connivence** en corruption (chap. 6) : certains produits rendent l'agent plus conciliant.
  3. **Le Cash-Puce reste intact** : utile quand il manque pour une offre, ou pour garder de quoi payer le plein.
* **Affichage :** pour chaque caisse proposée, l'app montre sa valeur en paiement et son prix d'achat, donc ce que le paiement en nature fait gagner ou perdre par rapport au cash (chap. 10).

---

## Les trois portefeuilles

### Cash-Puce (portefeuille courant)
* **Départ :** [`balance.ts`](../src/data/balance.ts). Utilisable partout, ne rapporte **aucun intérêt**.
* **Vulnérable :** ponctionné par les sanctions d'interception, le racket de `[D4]` et la collecte de protection, et **effacé** à l'audit du Jour 30.
* *Lore :* les transactions du marché noir se font de puce à puce, en local. Pour économiser ses serveurs, Aeterna n'analyse jamais l'historique P2P : à l'audit, elle formate brutalement toutes les puces. Personne n'est démasqué, mais tout crédit non transféré offshore est vaporisé.

### Dette mafieuse
* **Créancier :** `[LOC-D1-1]`. **Solde unique :** la dette de départ, l'avance de survie et les reliquats (dépannage, collecte) s'ajoutent au même solde. **Départ :** [`balance.ts`](../src/data/balance.ts).
* **Dette initiale soldée :** statut acquis **définitivement** la première fois que le solde atteint 0. Il ferme l'avance de survie et débloque la collecte de protection et la modale « Objectifs du Jour 30 ».
* **Taux :** un taux quotidien, arrondi au ₡ chaque matin (`DEBT_DAILY_RATE` dans [`balance.ts`](../src/data/balance.ts)) sur tout le solde, composés à chaque routine matinale (pas le Jour 1).
* **Échéances :**
  * **Retard** (jour, taux majoré et malus de risque : `DEBT_LATE` dans [`balance.ts`](../src/data/balance.ts)) **:** à 06h00 du jour d'échéance, si la dette initiale n'a **jamais** été soldée, le taux est majoré et ses hommes de main renseignent patrouilles et milices : malus au risque d'interception partout (*embuscades*). Ces deux pénalités restent acquises jusqu'à la fin de la partie, même après remboursement.
  * **Jour 30, minuit :** audit — le solde doit être à 0 (chap. 2).
* **Avance de survie :** tant que la dette initiale n'est pas soldée, Viktor avance au plus une somme fixe **sur toute la partie** (`SURVIVAL_ADVANCE` dans [`balance.ts`](../src/data/balance.ts)), ajoutée au solde au taux en vigueur. *Lore :* un débiteur à sec ne rembourse rien ; Viktor avance de quoi repartir, une fois. *Intention :* un joueur ruiné par un barrage n'est jamais bloqué sans issue, mais sa dette, et la menace de l'audit, grossissent. Les remboursements ne reconstituent pas l'avance.
* **Augmentée** par l'avance de survie, le dépannage d'urgence (chap. 2) et la collecte de protection ; **réduite** par les remboursements à `[LOC-D1-1]`.

### Collecte de protection
*« Viktor ne t'oublie pas. Viktor n'oublie personne. »*
* **Quand :** une fois la dette initiale soldée, à 06h00 des jours de collecte (`PROTECTION` dans [`balance.ts`](../src/data/balance.ts)).
* **Montant :** **une part de ta richesse visible** = Cash-Puce + valeur de la soute (au prix de base). Le compte offshore est invisible pour Viktor.
* **Paiement :** prélevé automatiquement sur le Cash-Puce ; le reliquat éventuel s'ajoute à la dette.
* **Affichage :** date et estimation de la prochaine collecte en permanence (chap. 10). *Lecture stratégique :* arriver léger au matin de la collecte, ou blanchir avant.

### Compte offshore
* **Guichet :** `[LOC-D5-1]`, de jour uniquement.
* **Insaisissable :** ni la BRC, ni les milices, ni Viktor, ni l'audit n'y touchent.
* **Dépôt :** crédité en entier. **Retrait :** sur place, commission de la Laverie (`OFFSHORE_WITHDRAW_FACTOR` dans [`balance.ts`](../src/data/balance.ts)) : le compte est débité du montant demandé, le Cash-Puce n'en reçoit qu'une part, et l'argent redevient exposé. Les intérêts versés sont retirés en premier, les dépôts (seuls à rapporter) en dernier.
  * *Intention :* le score déposé n'est jamais taxé ; seul l'aller-retour coûte. L'app affiche au guichet en combien de jours un dépôt couvre la commission d'un retrait, au taux du jour.
* **Rendement — intérêts simples** (les intérêts versés ne produisent pas d'intérêts), versés à la routine matinale sur le solde déposé avant 20h00. Le taux baisse par tranche du solde déposé, à cause des **« frais de conformité »** (`OFFSHORE_TRANCHES` dans [`balance.ts`](../src/data/balance.ts)).
* **Modificateur :** `[CREW-02]`. L'app affiche le **taux effectif** du compte.
* **Score final** = solde à l'audit.
