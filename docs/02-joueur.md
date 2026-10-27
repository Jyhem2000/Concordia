# 2. Jauges, boucle de jeu & fins de partie

## Objectif : l'Audit Mensuel des Allocations
La partie dure **30 jours consécutifs** (Jour 1 à Jour 30), en plein été. Le **Jour 30 à minuit**, Aeterna et le DSC procèdent à l'Audit Mensuel : le Cash-Puce est purgé et l'usurier `[LOC-D1-1]` exige d'avoir été intégralement remboursé.
* **Survie :** solde de la dette à 0 avant l'audit (chap. 7) et Santé au-dessus de 0 PV.
* **Score & fin :** l'argent sécurisé sur le compte offshore détermine la fin débloquée (voir *Fins de partie*).

---

## Les jauges

### ICC — Indice de Conformité Civique
* **Échelle :** 0 % à 100 %. **Départ :** [`balance.ts`](../src/data/balance.ts). S'érode facilement, lent et coûteux à restaurer.
* **Suspicion :** ajoute au risque d'interception un malus par point d'ICC manquant (`SUSPICION_PER_ICC_POINT` dans [`balance.ts`](../src/data/balance.ts)).
* **Paliers de crédit social** (seule échelle de référence, reprise par l'interface, chap. 10 ; seuils : `ICC_TIERS` dans [`balance.ts`](../src/data/balance.ts)), du plus haut au plus bas :

| Palier | Statut | Effet |
| :--- | :--- | :--- |
| 1 | Citoyen Or | **Coupe-file :** risque réduit aux portiques des districts qui en ont un (`goldFastLane` dans [`districts.ts`](../src/data/districts.ts), `GOLD_FAST_LANE_FACTOR` dans [`balance.ts`](../src/data/balance.ts)). Requis pour la fin Élite. |
| 2 | Citoyen ordinaire | — |
| 3 | Citoyen sous réserve | Pompes officielles **fermées la nuit**. `[LOC-D6-1]` inaccessible. |
| 4 | Déviant notoire | Effets du palier précédent, et toute entrée en `[D6]` déclenche **automatiquement** une interception. |

* **Gains de route :** sommeil au relais routier, contrôle avec soute légale, bluff réussi, certains aléas routiers. **Plafond quotidien** (`ICC_DAILY_ROUTE_GAIN_CAP` dans [`balance.ts`](../src/data/balance.ts), de 06h00 à 06h00), au-delà les gains de route sont perdus. Le reste du plafond du jour est affiché dans le bandeau (chap. 10).
* **Gains hors plafond** (le chemin cher) : `[LOC-D3-1]`, `[LOC-D5-1]`, `[LOC-D6-1]`, `[T4-03]`.
* **Atténuateurs de pertes :** `[MOD-05]`, `[VEH-03]` (inutiles en `[D4]`, où la fuite ne coûte pas d'ICC).

### Santé du joueur
* **Échelle :** 0 à 100 PV. **Départ :** [`balance.ts`](../src/data/balance.ts). **À 0 PV :** mort (Game Over).
* **Pertes létales :** échec de fuite (chap. 6), racket des milices de `[D4]`.
* **Pertes non-létales** (plancher à 1 PV, ou défini à la source) : aléas routiers, coup de chaleur de `[EVT-G01]`, tabassage de la dette, garde à vue, nuit blanche sous `[T2-05]`.
* **Soins :** sommeil au relais routier, `[LOC-D3-1]`.

### Intégrité du châssis (PV véhicule)
* **Maximum :** selon le véhicule ([`vehicles.ts`](../src/data/vehicles.ts)). **Départ :** châssis intact. **Réparation :** `[LOC-D4-1]`.
* **Pertes :** trajet de nuit, `[EVT-G01]`, `[T2-05]`, éjection manuelle, fuite, explosion `[TAG-FLAMMABLE]`, racket de `[D4]`, aléas `[EVT-R02]`, `[EVT-R05]`, `[EVT-R08]`, `[EVT-R09]`, `[EVT-R10]`.
* **Dépannage d'urgence (anti soft-lock) :** à 0 PV, une dépanneuse du DSC intervient (en `[D4]`, celle des mécanos pirates, aux mêmes conditions) : **demi-journée** perdue, châssis remis à une part de ses PV max, facture fixe indexée (`EMERGENCY_TOW` dans [`balance.ts`](../src/data/balance.ts)) (si le Cash-Puce ne suffit pas, le reliquat s'ajoute à la dette). Si le châssis tombe à 0 pendant un trajet, le trajet se termine (arrivée à destination), puis le dépannage s'applique.

### Réservoir de Synthanol
* **Unité :** la Ration. **Capacité et consommation :** selon le véhicule ([`vehicles.ts`](../src/data/vehicles.ts)) et la distance (chap. 4). **Départ :** réservoir plein.
* **Prix d'une ration :** fixé par district ([`districts.ts`](../src/data/districts.ts)).
* **Siphonage / Corvée DSC (anti soft-lock) :** bloqué avec 0 ration, une soute vide et pas assez de Cash-Puce pour 1 ration locale → une ration gratuite contre une perte d'ICC (`SIPHON` dans [`balance.ts`](../src/data/balance.ts)) et une **demi-journée** perdue. En `[D4]`, ce sont les milices qui « prêtent » la ration, aux mêmes conditions.

### Exemption Métabolique & Sédation
Seuls les routiers boivent l'eau sans sédatifs de `[LOC-D1-2]` : c'est elle qui leur garde l'esprit clair.
* **Protection :** se trouver en `[D1]` de jour (au réveil ou à l'arrivée d'un trajet de jour, Cantine `[LOC-D1-2]`) la remet au maximum. Elle baisse de 1 à chaque routine matinale. Départ au maximum. Chiffres : `SEDATION` dans [`balance.ts`](../src/data/balance.ts).
* **Sédation** (protection à 0, jusqu'au prochain passage en `[D1]` de jour) : malus au bluff, à la corruption et à la fuite (racket de `[D4]` compris), et la mémoire de marché des autres districts est **brouillée** : les cours mémorisés s'affichent en fourchette autour du vrai relevé (l'historique aussi). Le flux de `[CREW-02]` reste exact. Le district actuel n'est jamais brouillé.
* L'app affiche les jours de protection restants et prévient la veille de la Sédation (chap. 10).

---

## Déroulé d'une journée

### Les moments de la journée
Le **Jour** (Jour 1 à Jour 30) est la date. Chaque jour se découpe en trois moments, toujours nommés ainsi :
* **Journée** (06h00 – 20h00) : commerce, lieux spéciaux, 1 trajet de jour. Elle commence par la routine matinale.
* **20h00** : le couvre-feu sanitaire des citoyens et le dilemme du livreur (dormir, bivouaquer ou partir en tournée de nuit). On y arrive quand le joueur le décide, ou d'office après la perte d'une demi-journée (voir plus bas) : seul le marché de rue reste alors ouvert.
* **Nuit** (après 20h00, tournée de nuit) : marché de rue seulement, 1 trajet de nuit, puis dormir. La nuit s'achève à la routine de 06h00 du jour suivant.

Le bandeau affiche la date, le moment et si le trajet du moment est encore disponible (chap. 10).

### Routine matinale (06h00), dans l'ordre
Le Jour 1 commence sans routine : pas d'intérêts, inflation à ×1,00, boutiques et événements tirés une première fois.
1. Publication de l'**indice d'inflation** du jour (chap. 7).
2. Paiement d'avance du salaire de l'équipier actif (chap. 5) — sauf si le joueur était en garde à vue cette nuit-là ; consommation éventuelle d'une caisse par `[CREW-01]`. Reprise des caisses scellées d'une mission de nuit non livrée (voir *Tournée de nuit*).
3. Intérêts et échéances de la dette ; **collecte de protection** (chap. 7).
4. Intérêts du compte offshore.
5. Dégradation de fraîcheur des caisses `[TAG-PERISHABLE]` (chap. 3). Protection de l'Exemption Métabolique **−1 jour**.
6. Récupération des caisses larguées la veille via `[MOD-07]` ; échéance d'une commande VIP de `[LOC-D6-1]` dépassée (chap. 4).
7. Tirage de la mission de nuit proposée pour ce soir ; tirage de la ronde renforcée ; entrée en vigueur de l'événement global tiré la veille, tirage des événements locaux, de la Loterie les jours de tirage, de l'événement global du lendemain et de sa rumeur ; contrecoups (chap. 8). Puis, parce que les événements les modifient : reconstitution des quotas de demande, cours et boutiques (chap. 7).
8. Effets du matin des événements : canicule sur les périssables, sas de `[EVT-D3-01]` si le joueur se trouve en `[D3]` (chap. 8).

### Service de jour (06h00 – 20h00)
Acheter / vendre au marché, faire le plein, utiliser les lieux spéciaux du district, et effectuer **1 trajet de jour**. Une fois arrivé, on peut à nouveau commercer avant 20h00.

### Trajet
* **Maximum 2 par jour :** 1 de jour, 1 de nuit. Un trajet = **une destination**, quelle que soit la distance : les districts traversés sont de simples passages (aucun arrêt, aucun commerce, aucun test d'interception), ils ne coûtent que du carburant et du risque (chap. 4). Tous les districts sont accessibles dès le Jour 1, mais pas tous voisins (carte au chap. 4).
* **Coût :** consommation du véhicule selon la phase ([`vehicles.ts`](../src/data/vehicles.ts)), plus le surcoût des districts traversés (chap. 4).
* **Résolution :** consommation (et usure du châssis de nuit, ou de jour pendant la canicule `[EVT-G01]`) → test d'interception dans le district de destination (chap. 6), ou racket en `[D4]` → de nuit, sans interception : livraison de la mission ou écart enregistré (voir *Tournée de nuit*) ; de jour, sans interception : tirage d'un aléa routier, en suspens jusqu'au choix (chap. 8) → dépannage d'urgence si le châssis est à 0 → arrivée (effets d'arrivée des événements locaux actifs, ex. `[EVT-D3-01]`, sauf garde à vue).
* **Où l'on roule** (chap. 4) : de jour sur les voies logistiques de surface, de nuit dans les galeries de service, et toujours par les quais de service pour entrer à `[D5]` et `[D6]`.
  * Le risque est celui **du départ** : phase, soute et district quitté au moment de partir, c'est-à-dire celui affiché par le panneau de prévision (ronde renforcée en plus).
  * Le joueur arrêté est déjà dans le district de destination : il y reste en cas de garde à vue.
  * Si le châssis tombe à 0, le dépannage d'urgence s'applique à la fin du trajet, contrôle compris.

### Le dilemme de 20h00
Les sirènes d'Aeterna annoncent le couvre-feu sanitaire : les citoyens rentrent, la logistique continue. Trois options :
* **Dormir au relais routier du DSC** (dans chaque district sauf `[D4]`, côté quais de service) : jusqu'à 06h00. **Gain d'ICC et de Santé** (`RELAY_SLEEP` dans [`balance.ts`](../src/data/balance.ts)), réinitialise l'épuisement, baisse la Fiche S d'un niveau (chap. 6).
* **Bivouac** (seule façon de dormir en `[D4]`) : réinitialise l'épuisement, mais **0 ICC, 0 PV**, et la Fiche S ne baisse pas (aucun capteur ne certifie ta nuit sage).
* **Tournée de nuit :** un second trajet dans la journée, dans les galeries de service. La nuit qui suit ne rapporte aucun gain de sommeil et ne baisse pas la Fiche S, même en dormant ensuite dans un district à relais.

### Tournée de nuit
Tout est filmé : un camion la nuit n'est légitime que sur **ordre de mission** de la plateforme logistique du DSC. Chiffres : `NIGHT_MISSION` dans [`balance.ts`](../src/data/balance.ts).
* **La mission du soir :** chaque matin, la plateforme propose ou non une mission pour le soir (une chance), vers un district tiré au hasard ; elle est affichée toute la journée. Elle n'est valable que si le joueur n'est pas déjà dans ce district à 20h00.
* **Accepter la mission :** au départ en tournée, la plateforme charge des **caisses scellées du DSC** : une part de la capacité du camion (arrondie au supérieur, au moins une caisse), qui doit être libre. Elles sont légales (couverture, Tier 0 pour le bluff), ne se vendent ni ne se donnent, et sont livrées d'office à l'arrivée dans le district de la mission, contre une **prime** (indexée).
* **Sur mission** (trajet vers le district de la mission) : trajet couvert, sans malus de nuit.
* **Hors mission** (autre destination, ou pas de mission acceptée) : c'est une **anomalie**. Malus au risque d'interception (`NIGHT_TRIP_RISK`, milices de `[D4]` comprises) ; si le trajet passe sans interception, Aeterna enregistre l'écart : **+1 niveau de Fiche S** (chap. 6).
* **Mission non livrée** (écart, garde à vue, caisses pillées…) : à 06h00, la plateforme reprend les caisses scellées restantes et note le retard (perte d'ICC).
* *Avantages de la nuit :* écouler sa cargaison avant la dégradation de 06h00 ou la fin d'un événement ; profil nuit des produits (chap. 7) ; aucun aléa routier (personne dans les galeries, chap. 8).
* *Galeries de service :* consommation de nuit du véhicule et usure du châssis (`NIGHT_TRIP_CHASSIS_WEAR` dans [`balance.ts`](../src/data/balance.ts)) : elles passent au-dessus des fermes de serveurs d'Aeterna (chap. 1). L'usure de châssis (pas la consommation) est annulée par `[MOD-04]` ou `[T0-02]`.
* *Fermeture nocturne :* seul le marché de rue est ouvert ; tous les lieux spéciaux ferment jusqu'à 06h00, l'argent gagné reste donc en Cash-Puce.

### Épuisement nerveux
Si le joueur est parti en tournée de nuit le Jour J, la tournée est **verrouillée le soir du Jour J+1** — sauf via `[T2-05]`. Une 3e nuit blanche d'affilée est impossible.

### Perte d'une demi-journée
* **De jour :** le joueur passe directement à 20h00 : son trajet de jour est perdu et les lieux spéciaux sont fermés (ils ouvrent de 06h00 à 20h00) ; seul le marché de rue reste ouvert avant le dilemme de 20h00. Même situation à la sortie de garde à vue (chap. 6).
* **De nuit — Immobilisation :** la nuit s'arrête là, et le lendemain le joueur reste immobilisé jusqu'à 20h00 : il perd son trajet de jour et l'accès aux lieux spéciaux, mais peut commercer au marché de rue. L'immobilisation compte comme repos (réinitialise l'épuisement).

---

## Fins de partie

### L'audit du Jour 30 à minuit
Minuit sonne quand le joueur se couche le Jour 30, après un éventuel trajet de nuit, ou quand une garde à vue franchit cette nuit-là. La position « à minuit » est le district où il se trouve alors.
1. Solde de dette supérieur à 0 → **Game Over « Recyclé en Bio-Briques »**.
2. Sinon, **Formatage Brutal** : le Cash-Puce est remis à 0 et la soute ne peut plus être vendue.
3. **Score final = solde du compte offshore.** Les fins sont évaluées de la plus prestigieuse à la plus modeste ; la première dont toutes les conditions sont remplies se déclenche.

> **Attention :** la dette se rembourse à `[LOC-D1-1]` et le compte offshore s'alimente à `[LOC-D5-1]`, tous deux **de jour uniquement**. Un compte à rebours s'affiche les derniers jours (`AUDIT_COUNTDOWN_DAY` dans [`balance.ts`](../src/data/balance.ts) ; chap. 10).

### Défaites (Game Over)
* **Mort biologique :** Santé à 0 PV.
* **Exécution sommaire :** fouille effective avec `[T4-06]` en soute — *« Suicidé de 3 balles dans le dos »*.
* **Recyclé en Bio-Briques :** dette non soldée à l'audit ; `[LOC-D1-1]` fait passer le joueur au hachoir.

### Les grandes fins
L'écran « Objectifs du Jour 30 » les affiche une fois la dette initiale soldée (chap. 7).

| Fin | Conditions (dette soldée) | Épilogue |
| :--- | :--- | :--- |
| **Ultime — « Le Saboteur du Monde d'Avant »** | Score ≥ seuil Ultime + au moins **1 caisse de `[T4-06]`** en soute + être **en `[D4]`** à minuit | Tu achètes le passage sur le chalutier blindé des cartels à l'écluse de `[D4]`. En franchissant le mur vers les îles libres, tu diffuses les preuves sur le Fil Rose : Concordia s'embrase derrière toi pendant que tu sirotes un vrai whisky au soleil. |
| **Élite — « Nouvel Oligarque d'Olympus-Green »** | Score ≥ seuil Élite + statut **Citoyen Or** (sinon, dossier rejeté : fin suivante) | Tu rachètes en sous-main le fauteuil d'un Haut-Commissaire éliminé lors d'une purge et emménages sous la verrière de `[D6]` : c'est toi qui commandes de la vraie viande aux petits livreurs. |
| **Mafieuse — « Baron de Rust Valley »** | Score ≥ seuil Mafieuse (aucun prérequis d'ICC) | Ton casier est trop grillé pour la haute société, mais tu rachètes la boucherie de `[LOC-D1-1]` et les quais de `[D4]` : tu es le nouveau parrain de la contrebande. |
| **Standard — « Survivant du Mois d'Août »** | Aucune autre fin atteinte | Tu as échappé au hachoir, mais ton pécule ne rachète pas ta liberté. Demain 06h00, septembre commence et tu remontes dans ta fourgonnette… |

*Seuils de score : `ENDINGS` dans [`balance.ts`](../src/data/balance.ts), à recaler en jouant.*
