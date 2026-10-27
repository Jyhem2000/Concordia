# 7. Économie : marché & finances

## Information de marché
* **District actuel :** cours exacts du jour.
* **Autres districts :** le joueur ne voit que la **mémoire de marché** — le dernier cours qu'il y a lui-même observé, avec sa date (*« vu il y a 3 jours »*). Brouillée en cas de Sédation (chap. 2).
* **Vision en temps réel :** `[CREW-02]`.
* Les événements (globaux et locaux) sont publics : ils passent au téléscripteur dès 06h00 (chap. 8).

## Boutique du jour (générée à 06h00)
Chaque district propose un **minimum de produits** (`SHOP_MIN_PRODUCTS` dans [`balance.ts`](../src/data/balance.ts) ; davantage en `[D4]` et les jours d'événement à apparition) :
1. **Socle officiel :** tous les produits de Tier 0, toujours disponibles partout ; aucun district ne les place en Forte demande. *Lore :* même l'élite de `[D6]` en achète pour nourrir ses domestiques et afficher une comptabilité « 100 % Zéro-Carbone ».
2. **Production locale :** tous les produits de la liste Production du district (exceptions : tirage partiel en `[D4]`, apparition limitée de `[T4-06]`).
3. **Complément neutre :** si le total est inférieur au minimum, tirage aléatoire de produits de Tier 1 à 3 neutres pour ce district.

* **Exclusion :** un district ne vend **jamais** un produit de sa liste Forte demande, sauf événement qui le précise.
* **Stocks :** par produit et par jour, selon le tier ([`products.ts`](../src/data/products.ts)). Modificateurs : `[EVT-G05]`, `[EVT-D1-01]`, `[EVT-D3-03]`.
* **Demande universelle :** le joueur peut **toujours vendre** n'importe quelle caisse, dans n'importe quel district.

## Cours du jour (06h00)
```
Cours = Arrondi( Prix_Base × Coef_District × Bruit × Mult_Événement )
```
* **Coef_District :** coefficient Production, Neutre (1.00) ou Forte demande du district ([`districts.ts`](../src/data/districts.ts)). En Forte demande, on ajoute le **bonus de tier** ([`products.ts`](../src/data/products.ts)) — plus le produit est dangereux, plus il se paie cher.
  *Ex. :* `[T4-01]` en `[D6]` se paie au coefficient de Forte demande de `[D6]` plus le bonus du Tier 4.
* **Bruit :** tirage uniforme quotidien (`QUOTE_NOISE` dans [`balance.ts`](../src/data/balance.ts)), propre à chaque produit dans chaque district. Un mauvais tirage aux deux bouts peut rendre un trajet perdant.
* **Mult_Événement = min( 4, Mult_EvtActif × Bonus_Influence )**
  * *Mult_EvtActif :* 1.00 par défaut. Si un événement global et un local touchent le même produit, on garde celui dont l'écart `|Mult − 1.00|` est le plus fort (égalité : le local prime).
  * *Bonus_Influence :* `[LOC-D2-1]`, multiplié par-dessus.
  * *Plafond :* **×4**, quel que soit le cumul.
* **Le cours est fixe toute la journée.** La nuit ne recalcule rien ; elle n'applique que deux ajustements connus dès le matin : le profil nuit à la vente, et l'annulation des événements marqués « jour seulement ».

## Quota de demande
Pendant de la boutique : un district n'achète qu'une quantité limitée de chaque produit.
* **Quota :** par produit et par district, selon le tier et le statut du produit dans le district ([`products.ts`](../src/data/products.ts)). Modificateurs (multiplicatifs entre eux) : `[CREW-03]`, carte « contrebandier concurrent » de `[LOC-D5-1]`.
* **Demande restante :** pleine au Jour 1. Chaque vente la consomme, de jour comme de nuit. **Chaque matin à 06h00, elle remonte d'une fraction du quota** (`DEMAND_REFILL_DIVISOR` dans [`balance.ts`](../src/data/balance.ts), arrondi au supérieur), sans dépasser le quota. Vider un marché le pénalise donc plusieurs jours.
* **Au-delà de la demande restante, le marché est saturé :** chaque caisse supplémentaire se vend à prix réduit (`Coef_Demande`, `SATURATED_SALE_FACTOR` dans [`balance.ts`](../src/data/balance.ts)).
* **Pic suspect :** vendre au-delà de la demande restante alerte Aeterna — **le lendemain**, le risque de base de ce district augmente de **+10 %** (icône 👁️ sur la carte).
* **Affichage :** *« Demande restante : 5 (+2 demain) »* sur chaque ligne du tableau des cours (chap. 9).
* *Lecture stratégique :* on répartit ses ventes **dans le temps et dans l'espace** (8 caisses en `[D6]` aujourd'hui, le reste en `[D5]` demain, et on laisse `[D6]` se reconstituer), en arbitrant avec la fraîcheur et la collecte de Viktor.

## Prix de vente
```
Prix_Vente = Arrondi( Cours × Commission × Coef_Demande × Coef_Condition × Savoir_Faire )
```
* **Commission de puce** (`SALE_COMMISSION` dans [`balance.ts`](../src/data/balance.ts)) **:** chaque vente P2P est ponctionnée par l'infrastructure d'Aeterna. Acheter puis revendre au même endroit coûte donc toujours la commission.
* **Coef_Demande :** 1.00 dans la limite de la demande restante, prix saturé au-delà.
* **Coef_Condition :** `[TAG-FRAGILE]` (chap. 3).
* **Savoir_Faire = Coef_Fraîcheur × Coef_Nuit × Bonus_Mama**, avec **rendements décroissants** : au-delà d'un seuil, l'excédent ne compte qu'en partie (`KNOW_HOW_SOFT_CAP` et `KNOW_HOW_EXCESS_FACTOR` dans [`balance.ts`](../src/data/balance.ts)).
  * *Coef_Fraîcheur :* `[TAG-PERISHABLE]` (chap. 3).
  * *Coef_Nuit — profil nocturne* (pendant le couvre-feu ; coefficients : `NIGHT_PROFILE_FACTOR` dans [`balance.ts`](../src/data/balance.ts)) :

| Profil nuit | Effet | Logique |
| :--- | :---: | :--- |
| Festif | bonus | Prime de fête clandestine. |
| Diurne | malus | Excitants de bureau : leurs clients dorment. |
| — | aucun | — |

  * *Bonus_Mama :* `[CREW-03]`.
* **Clause anti-arbitrage :** Savoir_Faire est plafonné (`ANTI_ARBITRAGE_CAP` dans [`balance.ts`](../src/data/balance.ts)) si la caisse est revendue dans son district d'achat sans avoir voyagé.
* *Intention — des builds, pas une recette :* chaque axe de bonus vise une famille de produits différente (équipier, modules, `[LOC-D2-1]`, nuit). Les combinaisons rapportent davantage, mais les plafonds (`Mult_Événement`, `Savoir_Faire`) empêchent une seule combinaison d'écraser les autres.

## Paiement en nature
Toute caisse donnée en paiement (corruption, chantage, salaire, péage…) est valorisée à son **prix de base** ([`products.ts`](../src/data/products.ts)), jamais au cours local. Les caisses restent utiles (connivence, pas de cash exposé), mais ne sont pas une monnaie au rabais.

---

## Indice d'inflation algorithmique
*« Pour votre sécurité économique, Aeterna ajuste les prix en temps réel. »*
* **Indice du jour = 1 + (jour − 1) / période** (`INFLATION_PERIOD_DAYS` dans [`balance.ts`](../src/data/balance.ts)) : ×1.00 au Jour 1, puis croissance linéaire.
* **Tous les montants en ₡ de la doc sont des valeurs de base (Jour 1)**, multipliées par l'indice pour : carburant, réparations, dépannage, salaires et frais d'équipage, services des lieux spéciaux, part fixe du tarif de corruption, montants des aléas routiers.
* **Non indexés :** prix des produits (ils ont leur propre marché), véhicules, modules, dette et emprunts, seuils de fin, tarif syndical de `[LOC-D1-2]`.
* *Lore :* le marché noir facture ses services en indice officiel : c'est la seule unité de compte que les puces acceptent sans éveiller l'algorithme.
* **Affichage :** valeur du jour au téléscripteur dès le Jour 1, avec un graphique d'historique (chap. 9).
* *Lecture stratégique :* les services coûtent de plus en plus cher ; les équipements, eux, ne sont pas indexés et rapportent d'autant plus qu'on les achète tôt.

---

## Les trois portefeuilles

### Cash-Puce (portefeuille courant)
* **Départ :** [`balance.ts`](../src/data/balance.ts). Utilisable partout, ne rapporte **aucun intérêt**.
* **Vulnérable :** ponctionné par les sanctions d'interception, le racket de `[D4]` et la collecte de protection, et **effacé** à l'audit du Jour 30.
* *Lore :* les transactions du marché noir se font de puce à puce, en local. Pour économiser ses serveurs, Aeterna n'analyse jamais l'historique P2P : à l'audit, elle formate brutalement toutes les puces. Personne n'est démasqué, mais tout crédit non transféré offshore est vaporisé.

### Dette mafieuse
* **Créancier :** `[LOC-D1-1]`. **Solde unique :** la dette de départ, les emprunts et les reliquats (dépannage, collecte) s'ajoutent au même solde. **Départ :** [`balance.ts`](../src/data/balance.ts).
* **Dette initiale soldée :** statut acquis **définitivement** la première fois que le solde atteint 0. Il débloque l'emprunt tactique, la collecte de protection et la modale « Objectifs du Jour 30 ».
* **Taux :** un taux quotidien (`DEBT_DAILY_RATE` dans [`balance.ts`](../src/data/balance.ts)) sur tout le solde, composés à chaque routine matinale (pas le Jour 1).
* **Échéances :**
  * **Tabassage** (jour, seuil, PV perdus et plancher : `DEBT_BEATING` dans [`balance.ts`](../src/data/balance.ts)) **:** à 06h00 du jour d'échéance, si le solde dépasse le seuil, les Bouchers tabassent le joueur, sans le faire descendre sous un plancher de Santé (un débiteur mort ne paie plus).
  * **Retard** (jour, taux majoré et malus de risque : `DEBT_LATE` dans [`balance.ts`](../src/data/balance.ts)) **:** à 06h00 du jour d'échéance, si la dette initiale n'a **jamais** été soldée, le taux est majoré et ses hommes de main renseignent patrouilles et milices : malus au risque d'interception partout (*embuscades*). Ces deux pénalités restent acquises jusqu'à la fin de la partie, même après remboursement.
  * **Jour 30, minuit :** audit — le solde doit être à 0 (chap. 2).
* **Emprunt tactique :** une fois la dette initiale soldée, le joueur peut réemprunter jusqu'à un plafond de solde (`LOAN_CEILING` dans [`balance.ts`](../src/data/balance.ts)), au taux en vigueur.
* **Augmentée** par le dépannage d'urgence (chap. 2) et la collecte de protection ; **réduite** par le Hachoir de `[LOC-D1-1]`.

### Collecte de protection
*« Viktor ne t'oublie pas. Viktor n'oublie personne. »*
* **Quand :** une fois la dette initiale soldée, à 06h00 des jours de collecte (`PROTECTION` dans [`balance.ts`](../src/data/balance.ts)).
* **Montant :** **une part de ta richesse visible** = Cash-Puce + valeur de la soute (au prix de base). Le compte offshore est invisible pour Viktor.
* **Paiement :** prélevé automatiquement sur le Cash-Puce ; le reliquat éventuel s'ajoute à la dette.
* **Affichage :** date et estimation de la prochaine collecte en permanence (chap. 9). *Lecture stratégique :* arriver léger au matin de la collecte, ou blanchir avant.

### Compte offshore
* **Guichet :** `[LOC-D5-1]`, de jour uniquement.
* **Insaisissable :** ni la BRC, ni les milices, ni Viktor, ni l'audit n'y touchent.
* **Dépôt :** commission de la Laverie (`OFFSHORE_DEPOSIT_FACTOR` dans [`balance.ts`](../src/data/balance.ts)). **Retrait :** gratuit mais sur place, l'argent redevient du Cash-Puce exposé. Les intérêts versés sont retirés en premier, les dépôts (seuls à rapporter) en dernier.
* **Rendement — intérêts simples** (les intérêts versés ne produisent pas d'intérêts), versés à la routine matinale sur le solde déposé avant 20h00. Le taux baisse par tranche du solde déposé, à cause des **« frais de conformité »** (`OFFSHORE_TRANCHES` dans [`balance.ts`](../src/data/balance.ts)).
* **Modificateur :** `[CREW-02]`. L'app affiche le **taux effectif** du compte.
* **Score final** = solde à l'audit.

---

## Routes commerciales de référence
*Intention d'équilibrage, non normatif : en cas d'écart, les listes de [`districts.ts`](../src/data/districts.ts) font foi.*
* **Démarrage (Jours 1–6) :** `[T1-04]` et `[T1-06]` de `[D1]` → vente en `[D4]` → `[T1-01]`, `[T1-03]` ou `[T2-02]` de `[D4]` → revente en `[D2]` ou `[D1]` (plein à `[LOC-D1-2]`). Variante : `[T2-03]`, `[T2-04]` de `[D1]` → `[D2]`, `[D3]` ou `[D5]`.
* **Pharmaceutique (Jours 7–18) :** `[T3-04]` de `[D3]` (plus quelques `[T2-05]` gardés pour les fuites, revendables en `[D1]`) → vente en `[D4]` → `[T3-02]`, `[T3-03]`, `[T3-06]` de `[D4]` → revente en `[D3]` ou `[D5]`, gains mis à l'abri via `[LOC-D5-1]`.
* **Haute trahison (Jours 19–30) :** `[T4-01]`, `[T4-02]` de `[D4]` ou `[T4-05]` de `[D3]` → forcer les barrages de `[D6]` (enchères à `[LOC-D6-1]`) → sécuriser le pactole à `[LOC-D5-1]` avant l'audit.
