# 2. Jauges, boucle de jeu & fins de partie

## Objectif : l'Audit Mensuel des Allocations
La partie dure **30 jours consécutifs** (Jour 1 à Jour 30), en plein été. Le **Jour 30 à minuit**, Aeterna et le DSC procèdent à l'Audit Mensuel : le Cash-Puce est purgé et l'usurier `[LOC-D1-1]` exige d'avoir été intégralement remboursé.
* **Survie :** solde de la dette à 0 avant l'audit (chap. 7) et Santé au-dessus de 0 PV.
* **Score & fin :** l'argent sécurisé sur le compte offshore détermine la fin débloquée (voir *Fins de partie*).

---

## Les jauges

### ICC — Indice de Conformité Civique
* **Échelle :** 0 % à 100 %. **Départ :** [`balance.ts`](../src/data/balance.ts). S'érode facilement, lent et coûteux à restaurer.
* **Suspicion :** ajoute **0,5 × (100 − ICC)** au risque d'interception (ex. ICC 60 % → +20 %).
* **Paliers de crédit social** (seule échelle de référence, reprise par l'interface, chap. 9) :

| ICC | Statut | Effet |
| :--- | :--- | :--- |
| **≥ 85 %** | Citoyen Or | **Coupe-file :** risque **×0,90** aux portiques de `[D5]` et `[D6]`. Requis pour la fin Élite. |
| 50 – 84 % | Citoyen ordinaire | — |
| **30 – 49 %** | Citoyen sous réserve | Pompes officielles **fermées la nuit**. `[LOC-D6-1]` inaccessible. |
| **< 30 %** | Déviant notoire | Effets du palier précédent, et toute entrée en `[D6]` déclenche **automatiquement** une interception. |

* **Gains de route :** sommeil au relais routier, contrôle avec soute légale, bluff réussi, certains aléas routiers. **Plafond : +4 % d'ICC par jour** (de 06h00 à 06h00), au-delà les gains de route sont perdus. Le reste du plafond du jour est affiché dans le bandeau (chap. 9).
* **Gains hors plafond** (le chemin cher) : `[LOC-D3-1]`, `[LOC-D5-1]`, `[LOC-D6-1]`, `[T4-03]`.
* **Atténuateurs de pertes :** `[MOD-05]`, `[VEH-03]` (inutiles en `[D4]`, où la fuite ne coûte pas d'ICC).

### Santé du joueur
* **Échelle :** 0 à 100 PV. **Départ :** [`balance.ts`](../src/data/balance.ts). **À 0 PV :** mort (Game Over).
* **Pertes létales :** échec de fuite (chap. 6), racket des milices de `[D4]`.
* **Pertes non-létales** (plancher à 1 PV, ou défini à la source) : aléas routiers, coup de chaleur de `[EVT-G01]`, tabassage de la dette, garde à vue, nuit blanche sous `[T2-05]`.
* **Soins :** sommeil au relais routier, `[LOC-D3-1]`.

### Intégrité du châssis (PV véhicule)
* **Maximum :** selon le véhicule ([`vehicles.ts`](../src/data/vehicles.ts)). **Réparation :** `[LOC-D4-1]`.
* **Pertes :** trajet de nuit, `[EVT-G01]`, `[T2-05]`, éjection manuelle, fuite, explosion `[TAG-FLAMMABLE]`, racket de `[D4]`, aléas `[EVT-R02]`, `[EVT-R05]`, `[EVT-R08]`, `[EVT-R09]`, `[EVT-R10]`.
* **Dépannage d'urgence (anti soft-lock) :** à 0 PV, une dépanneuse du DSC intervient (en `[D4]`, celle des mécanos pirates, aux mêmes conditions) : **demi-journée** perdue, châssis remis à **25 % de ses PV max**, facture de **2 500 ₡** (si le Cash-Puce ne suffit pas, le reliquat s'ajoute à la dette). Si le châssis tombe à 0 pendant un trajet, le trajet se termine (arrivée à destination), puis le dépannage s'applique.

### Réservoir de Synthanol
* **Unité :** la Ration. **Capacité et consommation :** selon le véhicule ([`vehicles.ts`](../src/data/vehicles.ts)) et la distance (chap. 4).
* **Prix d'une ration :** fixé par district ([`districts.ts`](../src/data/districts.ts)).
* **Siphonage / Corvée DSC (anti soft-lock) :** bloqué avec 0 ration, une soute vide et pas assez de Cash-Puce pour 1 ration locale → une ration gratuite contre une perte d'ICC (`SIPHON` dans [`balance.ts`](../src/data/balance.ts)) et une **demi-journée** perdue. En `[D4]`, ce sont les milices qui « prêtent » la ration, aux mêmes conditions.

### Exemption Métabolique & Sédation
Seuls les routiers boivent l'eau sans sédatifs de `[LOC-D1-2]` : c'est elle qui leur garde l'esprit clair.
* **Protection :** chaque passage à `[LOC-D1-2]` (de jour) remet la protection à **4 jours**. Elle baisse de 1 à chaque routine matinale. **Départ :** 4 jours.
* **Sédation** (protection à 0, jusqu'au prochain passage à `[LOC-D1-2]`) : **−10 %** au bluff, à la corruption et à la fuite (racket de `[D4]` compris), et la mémoire de marché des autres districts est **brouillée** : les cours mémorisés s'affichent en fourchette **±20 %**. Le flux de `[CREW-02]` reste exact.
* L'app affiche les jours de protection restants et prévient la veille de la Sédation (chap. 9).

---

## Déroulé d'une journée

### Routine matinale (06h00), dans l'ordre
Le Jour 1 commence sans routine : pas d'intérêts, inflation à ×1,00, boutiques et événements tirés une première fois.
1. Publication de l'**indice d'inflation** du jour (chap. 7).
2. Paiement d'avance du salaire de l'équipier actif — sauf si le joueur était en garde à vue cette nuit-là.
3. Intérêts et échéances de la dette ; **collecte de protection** (chap. 7).
4. Intérêts du compte offshore.
5. Dégradation de fraîcheur des caisses `[TAG-PERISHABLE]` (chap. 3). Protection de l'Exemption Métabolique **−1 jour**.
6. Récupération des caisses larguées la veille via `[MOD-07]`.
7. Tirage de la ronde renforcée, reconstitution des quotas de demande, calcul des cours et des boutiques (chap. 7), tirage de l'événement global, des événements locaux et, les jours de tirage, de la Loterie (chap. 8).

### Service de jour (06h00 – 20h00)
Acheter / vendre au marché, faire le plein, utiliser les lieux spéciaux du district, et effectuer **1 trajet de jour**. Une fois arrivé, on peut à nouveau commercer avant 20h00.

### Trajet
* **Maximum 2 par jour :** 1 de jour, 1 de nuit. Un trajet = **une destination**, quelle que soit la distance : les districts traversés sont de simples passages (aucun arrêt, aucun commerce, aucun test d'interception), ils ne coûtent que du carburant et du risque (chap. 4). Tous les districts sont accessibles dès le Jour 1, mais pas tous voisins (carte au chap. 4).
* **Coût :** consommation du véhicule selon la phase ([`vehicles.ts`](../src/data/vehicles.ts)), plus le surcoût des districts traversés (chap. 4).
* **Résolution :** consommation → test d'interception dans le district de destination (chap. 6), ou racket en `[D4]` → s'il n'y a pas eu d'interception, tirage d'un aléa routier → arrivée (effets d'arrivée des événements locaux actifs, ex. `[EVT-D3-01]`).

### Le dilemme de 20h00
Les sirènes d'Aeterna annoncent le couvre-feu sanitaire. Trois options :
* **Dormir au relais routier du DSC** (dans chaque district sauf `[D4]`, côté quais de service) : jusqu'à 06h00. **+2 % d'ICC**, **+5 PV** de Santé, réinitialise l'épuisement, baisse la Fiche S d'un niveau (chap. 6).
* **Bivouac** (seule façon de dormir en `[D4]`) : réinitialise l'épuisement, mais **0 ICC, 0 PV**, et la Fiche S ne baisse pas (aucun capteur ne certifie ta nuit sage).
* **Forcer le couvre-feu :** un second trajet dans la journée.
  * *Avantages :* écouler sa cargaison avant la dégradation de 06h00 ou la fin d'un événement ; profil nuit des produits (chap. 7).
  * *Surveillance accrue :* **+25 %** au risque d'interception (milices de `[D4]` comprises), aucun gain de sommeil.
  * *Mode furtif :* consommation de nuit du véhicule et **−5 PV** de châssis (surchauffe des galeries). L'usure de châssis (pas la consommation) est annulée par `[MOD-04]` ou `[T0-02]`.
  * *Fermeture nocturne :* seul le marché de rue est ouvert ; tous les lieux spéciaux ferment jusqu'à 06h00, l'argent gagné reste donc en Cash-Puce.

### Épuisement nerveux
Si le joueur a forcé le couvre-feu le Jour J, le couvre-feu est **verrouillé le soir du Jour J+1** — sauf via `[T2-05]`. Une 3e nuit blanche d'affilée est impossible.

### Perte d'une demi-journée
* **De jour :** le joueur passe directement à 20h00.
* **De nuit — Immobilisation :** la nuit s'arrête là, et le lendemain le joueur reste immobilisé jusqu'à 20h00 : il perd son trajet de jour et l'accès aux lieux spéciaux, mais peut commercer au marché de rue. L'immobilisation compte comme repos (réinitialise l'épuisement).

---

## Fins de partie

### L'audit du Jour 30 à minuit
1. Solde de dette supérieur à 0 → **Game Over « Recyclé en Bio-Briques »**.
2. Sinon, **Formatage Brutal** : le Cash-Puce est remis à 0 et la soute ne peut plus être vendue.
3. **Score final = solde du compte offshore.** Les fins sont évaluées de la plus prestigieuse à la plus modeste ; la première dont toutes les conditions sont remplies se déclenche.

> **Attention :** la dette se rembourse à `[LOC-D1-1]` et le compte offshore s'alimente à `[LOC-D5-1]`, tous deux **de jour uniquement**. Un compte à rebours s'affiche à partir du Jour 28 (chap. 9).

### Défaites (Game Over)
* **Mort biologique :** Santé à 0 PV.
* **Exécution sommaire :** fouille effective avec `[T4-06]` en soute — *« Suicidé de 3 balles dans le dos »*.
* **Recyclé en Bio-Briques :** dette non soldée à l'audit ; `[LOC-D1-1]` fait passer le joueur au hachoir.

### Les grandes fins
L'écran « Objectifs du Jour 30 » les affiche une fois la dette initiale soldée (chap. 7).

| Fin | Conditions (dette soldée) | Épilogue |
| :--- | :--- | :--- |
| **Ultime — « Le Saboteur du Monde d'Avant »** | Score ≥ **1 000 000 ₡** + au moins **1 caisse de `[T4-06]`** en soute + être **en `[D4]`** à minuit | Tu achètes le passage sur le chalutier blindé des cartels à l'écluse de `[D4]`. En franchissant le mur vers les îles libres, tu diffuses les preuves sur le Fil Rose : Concordia s'embrase derrière toi pendant que tu sirotes un vrai whisky au soleil. |
| **Élite — « Nouvel Oligarque d'Olympus-Green »** | Score ≥ **500 000 ₡** + statut **Citoyen Or** (sinon, dossier rejeté : fin suivante) | Tu rachètes en sous-main le fauteuil d'un Haut-Commissaire éliminé lors d'une purge et emménages sous la verrière de `[D6]` : c'est toi qui commandes de la vraie viande aux petits livreurs. |
| **Mafieuse — « Baron de Rust Valley »** | Score ≥ **200 000 ₡** (aucun prérequis d'ICC) | Ton casier est trop grillé pour la haute société, mais tu rachètes la boucherie de `[LOC-D1-1]` et les quais de `[D4]` : tu es le nouveau parrain de la contrebande. |
| **Standard — « Survivant du Mois d'Août »** | Aucune autre fin atteinte | Tu as échappé au hachoir, mais ton pécule ne rachète pas ta liberté. Demain 06h00, septembre commence et tu remontes dans ta fourgonnette… |

*Les seuils de score seront recalés en jouant une fois l'économie codée.*
