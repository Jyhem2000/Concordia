# 7. Interface (UI / UX)

* **Single-Page Application** réactive, écran unique responsive : mobile-first en portrait, panneaux côte à côte sur desktop / paysage.
  * **Onglets en bas d'écran (téléphone) :** Marché (cours et ventes), Lieux (services du district, garage, Cantine ; absent dans un district sans lieu spécial), Soute (véhicule, soute et équipage), Carte (plein, panneau du soir, objectifs, livraison officielle, carte et départs). Le bandeau supérieur, le briefing et les comptes rendus restent au-dessus de l'onglet ouvert. Un trajet ou une nouvelle demi-journée ramène à l'onglet Marché.
  * **Desktop :** tous les panneaux visibles, marché à gauche, le reste à droite, sans onglets.
* **Aucun chiffre codé en dur :** boutons et panneaux affichent les valeurs calculées depuis les règles du jour.
* **Principe de transparence — « zéro calculatrice, zéro boîte noire » :** chaque probabilité, prix ou coût affiché peut être touché pour révéler son **détail ligne par ligne**, avec la source de chaque ligne (district, tag, module, équipier, événement…). Le joueur occasionnel lit le total ; le joueur optimisateur lit le détail et ajuste son build.
  * **Toutes les règles sont accessibles en jeu.** Aucune mécanique n'est cachée au joueur (seuls des tirages le sont, comme la ronde renforcée). Chaque calcul se détaille, et chaque règle qui pèse sur un choix est expliquée à l'endroit du choix, en une ou deux phrases. Un **manuel en jeu** rassemble l'ensemble (voir plus bas).
  * *Ex. (risque, valeurs indicatives) :* « Base D5 40 % · Suspicion +10 % · Tech (4/12) +16,7 % · Couverture légale −10 % = 56,7 % · Zéro-C ×0,85 = **48 %** ».

## Charte graphique
Terminal de livraison d'Aeterna : fond ardoise sombre, cartes à bords arrondis, titres en capitales, chiffres alignés (chiffres tabulaires). Un seul thème, sombre.
* **Couleurs par rôle, jamais par écran :** Cash-Puce jaune, offshore cyan, dette rouge, gain vert, perte rouge, nuit indigo, action principale ambre, action risquée ou destructrice rouge. Les tiers gardent leur couleur partout : **vert** 0, **jaune** 1, **orange** 2, **rouge** 3, **violet** 4 (liseré à gauche de chaque ligne de produit, case d'image). Ces couleurs sont des variables du thème (`src/index.css`), utilisées par leur nom de rôle.
* **Composants partagés** (`src/ui/shared/`) : panneau repliable, bouton, pastille (tag, statut, indicateur), jauge, statistique, encadré d'information, image de produit. Un style qui sert à deux endroits devient un composant ou une variante, jamais une copie.
* **Images :** produits, véhicules et modules ont une image dans une case carrée. Sans fichier d'image, une icône vectorielle (lucide) dans la couleur du tier la remplace. Déposer une image 32×32 (pixel art) dans `src/assets/images/`, sous le nom de l'ID de la donnée (`T1-03.png`), suffit à la remplacer, sans toucher au code ; elle s'affiche à 32 px dans les listes et doublée sans flou dans la carte du véhicule. Le reste de l'interface reste en icônes vectorielles.

## Panneaux repliables
Chaque panneau (marché, carte, lieux spéciaux, plein, couvre-feu, objectifs) et les longues sous-parties du garage (modules, châssis) se replient d'un clic sur leur titre, pour faire de la place. Le choix est mémorisé dans les réglages du joueur, d'une partie à l'autre.

**Retour en haut de page** à chaque changement de scène : arrivée d'un trajet, matin, soirée, barrage et chaque option jouée, aléa routier, comptes rendus, fin de partie. Le briefing et les comptes rendus sont en haut de l'écran.

## Bandeau supérieur permanent & briefing de 06h00
* **Téléscripteur d'Aeterna (Flash Info TV) :** sous les barres d'état, un message passif-agressif par demi-journée (jour, puis nuit ; le catalogue, rangé par thèmes, est parcouru en sautant d'un thème à l'autre et passe en entier en une partie), l'événement global et les événements locaux du jour, les contrecoups, le tirage de la Loterie (le promu, et le déclassé seulement s'il y en a un) et ses vices en cours, et la **rumeur** du lendemain avec sa fiabilité. Chaque événement se déplie sur ses effets exacts (produits et facteurs, risque, tags, stocks).
* **Barres d'état (toujours visibles) :** une rangée de tête (Jour, Cash-Puce, Dette et son échéance, ICC et son palier, Santé), puis le district et le moment, les jauges en barre du châssis et du Synthanol, et le reste en petit.
  * Jour X / 30 + ☀️ ou 🌙, et le moment de la journée (Journée, 20h00, Nuit, chap. 1) avec l'état du trajet du moment (disponible ou effectué) ;
  * Cash-Puce (jaune) · Compte offshore (cyan, cadenas, taux effectif) · Dette (rouge, prochaine échéance : retard si la dette initiale n'a jamais été soldée, puis audit ; mention « en retard » une fois le retard acquis) ;
  * ICC (couleur selon le palier ci-dessous, avec le prochain seuil de crédit social et le **reste du plafond de gains du jour**) ;
  * Santé ❤️ · Châssis 🔧 (sur le max du véhicule) · Synthanol ⛽ (sur la capacité du véhicule, + achat rapide au prix local) ;
  * **Exemption Métabolique** 💧 (jours de protection restants ; alerte la veille, icône de Sédation une fois à 0) ;
  * **Fiche S** (0 à 3 icônes 🎯, détail des malus au toucher) ;
  * **Balise** 📡 tant que `[T4-06]` est en soute ;
  * **Prochaine collecte de Viktor** (date et montant estimé ; apparaît une fois la dette initiale soldée).
* **Briefing de 06h00 :** chaque matin, un encadré refermable récapitule la nuit et la routine : gains de sommeil, PV perdus en cellule, dette après intérêts, passage en retard, collecte de Viktor (et reliquat ajouté à la dette), intérêts offshore. Chaque montant est détaillable.
* **Compte à rebours de l'audit** (à partir de `AUDIT_COUNTDOWN_DAY`, [`balance.ts`](../src/data/balance.ts)) : *« Dernier dépôt offshore possible : J30, 19h59 »* et *« Dernier remboursement possible : J30, 19h59 »*.

### Couleur de l'ICC
Dans le bandeau, l'ICC prend la couleur de son palier (chap. 1), avec le nom du palier : **vert** Citoyen Or, **jaune** Citoyen ordinaire, **orange** Citoyen sous réserve, **rouge** Déviant notoire. L'interface ne définit aucun seuil propre.

## Vue « Véhicule, soute & équipage »
* **Véhicule & équipage :** image et nom du châssis, jauges de châssis et de Synthanol, modules montés sur les slots du châssis (avec leur image ; ils se changent au garage), équipier actif.
* **Soute :** une case par emplacement, dans la couleur du tier de sa caisse (en pointillés si elle est au double fond, vide si l'emplacement est libre), puis une ligne par produit, du plus haut tier au plus bas : image, quantité, tags, état (fraîcheur, caisses abîmées, délai avant pourriture) et caisses cachées au double fond.
* **Double fond :** son occupation sur sa capacité. Toucher un produit illégal ouvre un menu pour l'**envoyer au double fond**, avec les caisses qu'il délogerait ; toucher un produit caché, pour l'en **retirer** (chap. 4). Un produit envoyé ou retiré le reste affiché ; un produit légal ou encombrant dit pourquoi il n'y va pas.
* **Profil de la cargaison :** une jauge par tag qui pèse sur le risque (ceux qui ajoutent du risque au trajet ou à la détection, et la couverture du Légal), avec la part dans la soute et les caisses masquées par un Tier 0.

## Vue « Marché noir & lieux spéciaux »
* **Ventes groupées :** « Vendre tout ce qui marge » (chaque produit dont la vente entière, saturation comprise, rapporte plus que son prix d'achat) et « Vendre tout », chacun avec le produit annoncé ; les caisses scellées n'en font pas partie.
* **Tableau des cours :** la boutique du jour, plus, en haut de liste, tous les produits en soute (vente toujours possible). Le prix de vente affiché est le **prix net** (commission, fraîcheur, nuit… comprises), détaillable.
* **Indicateurs :**
  * 📉 vert (prix très bas / production locale, « se revend mal ici ») · 🔥 orange (forte demande) · 🚀 rouge clignotant (explosion liée à un événement) ;
  * **origine** de chaque produit en boutique : production locale, socle officiel (Tier 0), arrivage du jour (complément neutre) ou arrivage d'événement ;
  * tags de vente de nuit (Festif, Diurne) parmi les tags du produit ;
  * **rachat au cours** sur chaque ligne : les caisses que ce district rachète encore aujourd'hui au plein cours (côté acheteurs, indépendant du stock de la boutique), avec sa reconstitution du lendemain (*« 5 (+2 demain) »*) et une explication au survol ; au-delà, le prix saturé s'affiche ;
  * **PMA** sur chaque ligne possédée, ex. *« En soute : 8 (acheté à 410 ₡/u) »*.
  * **État** sur chaque ligne possédée : caisses par état de fraîcheur, caisses abîmées, et délai avant que le lot le plus ancien pourrisse.
  * **Tendance** : variation du cours depuis la dernière observation dans ce district, si elle date de la veille.
  * **Utiliser** sur les produits qui ont une action joueur (`[T4-03]`), avec son effet ou la raison d'un refus.
  * **Marge** sur chaque ligne possédée : gain net de la prochaine caisse vendue (₡/u et % de son prix d'achat), et gain net si l'on vend tout (saturation comprise). Icône verte (rentable), ambre (marge faible, sous un seuil d'affichage fixé dans `Margin.tsx`) ou rouge (à perte).
* **Fiche produit :** sous le nom, les tags du produit en pastilles ; une fiche dépliable détaille, sans rien cacher :
  * l'effet de chaque tag (risque ajouté ou retiré et où, malus de bluff, fraîcheur, casse, explosion, largage), le masquage d'un Tier 0 ;
  * les actions du produit (aide au bluff, dopage, nuit blanche, refroidissement, pass d'identité, balise) ;
  * la sanction en cas de saisie (formalité, amende sur la valeur saisie, ou garde à vue pour le haut tier) ;
  * les agents qui l'apprécient (connivence) et les milices qui le prennent en premier ;
  * où le vendre : districts en Forte demande (jamais en boutique là-bas, sauf événement) et districts producteurs (en boutique chaque jour, moins cher) (profil public, chap. 2, vices de la Loterie compris), et le meilleur cours mémorisé ailleurs avec son ancienneté ;
  * l'**historique des cours** observés dans le district actuel, en courbe, avec le cours normal (sans tendance ni événement) en repère ; la valeur de chaque jour au survol, et le tableau des valeurs pour les lecteurs d'écran.
* **Filtres** en pastilles, un seul à la fois : Tous, En soute, chaque tier et chaque tag présents dans le tableau. Le filtre choisi reste d'un district à l'autre ; s'il ne garde plus aucun produit ici, tout s'affiche.
* **Curseurs d'achat / vente :** 1, 5, MAX.
* **Onglet lieux spéciaux :** accès direct aux services du district, coûts et cooldowns affichés. À la Laverie, le Cash-Puce reçu pour un retrait (commission déduite) et le nombre de jours qu'il faut à un dépôt pour couvrir cette commission au taux du jour.

## Vue « Carte tactique & navigation »
* **Récapitulatif de la soute :** en haut de la carte, l'occupation (caisses / capacité) et chaque produit avec sa quantité, dont la part cachée dans le double fond, pour choisir la destination sans revenir au marché.
* **Livraison officielle du jour** (chap. 1) : en haut de la carte, de jour, l'offre de la plateforme (district, caisses scellées, prime) avec son bouton d'acceptation, puis la livraison en cours ; la confiance du DSC (commandes livrées, multiplicateur de prime) l'accompagne.
* **Carte schématique** des six districts et de leurs liaisons (chap. 3), de la périphérie en bas à gauche au sommet de la pyramide en haut à droite : position actuelle, étoiles de sécurité et bulles d'indices sous chaque district. Toucher un district trace l'itinéraire le plus court et amène à sa ligne dans la liste des destinations, mise en avant.
* **Soute exposée :** en tête de carte, le nombre de caisses illégales en soute (dont celles du double fond), ce qu'elles ont coûté, et la sanction de base d'une saisie (garde à vue si du haut tier est à bord).
* **Produits en soute par district :** sous chaque district, chaque produit en soute avec son statut public (Forte demande, Production) et son cours mémorisé, ou « jamais vu ».
* **Marge estimée :** sous chaque district, les cours mémorisés des produits en soute portent la même icône de marge, estimée sur le cours vu moins la commission de puce (sans savoir-faire ni saturation).
* **Mémoire de marché :** au toucher d'un district, derniers cours observés avec leur ancienneté (*« vu il y a 3 jours »*), en fourchette en cas de Sédation ; cours en temps réel avec `[CREW-02]`.
* **Bulles d'indices :** sur la carte et dans la liste, mission de nuit acceptée, ronde renforcée révélée par `[CREW-01]`, after du couvre-feu de ce soir, pic suspect de la veille ; sur la carte, l'événement local du jour (son nom au survol), et dans la liste son nom, avec ses effets au toucher.
* **Prévision (ligne de chaque destination) :** itinéraire et districts traversés, rations nécessaires, étoiles de sécurité, prix du Synthanol à l'arrivée (détaillable), lieux spéciaux, et le **risque d'interception** pour la soute actuelle (détaillable), avec la part de contrôles volants du district (fuite impossible), avant validation. La ronde renforcée, cachée, n'y figure pas ; tout le reste est exact.
* **Dernier trajet :** ce que le dernier trajet a coûté hors barrage (usure du châssis ou caisses consommées pour refroidir le moteur).
* **Verrous de progression :** tout ce qui n'est pas encore débloqué s'affiche quand même, avec sa condition et la progression vers elle (équipiers à la Cantine, mission de nuit au panneau du soir, modules et châssis au garage, services réservés des lieux spéciaux).
* **Boutons de départ :** « Rouler de jour » ; à 20h00, trois choix explicites, chacun avec ses effets : « Dormir au relais » (ou « Bivouac » en `[D4]`), « Livraison de nuit autorisée vers … (prime) » quand une mission est proposée (caisses scellées chargées, trajet couvert, la marchandise du joueur peut voyager avec), et « Tournée clandestine » (hors mission : risque accru, Fiche S). Épuisé, chaque tournée propose la nuit blanche forcée si le joueur a de quoi boire.
* **After du couvre-feu :** le panneau du soir l'annonce dès le matin (district, coefficient festif de la fête et d'ailleurs, foule qui couvre), de jour comme de nuit ; la carte marque son district.
* **Mission de nuit :** le panneau du soir affiche dès le matin la mission proposée (destination, caisses scellées, prime), une chaque soir une fois débloquée, et le bouton qui l'accepte en partant ; la nuit, la carte marque le district de la mission, et le risque des autres destinations montre le malus hors mission. Les caisses scellées apparaissent dans la soute, sans vente possible. Le dernier trajet dit si la mission a été livrée ou si l'écart a été enregistré.

## Écran d'aléa routier
Comme le barrage, il occupe tout l'écran jusqu'au choix : la situation, puis les deux options avec leurs coûts et effets exacts (₡, ICC, Santé, châssis, rations, caisse demandée), la chance d'un pari, et la raison d'une option indisponible. Après le choix, un compte rendu détaille ce qui a changé.

## Écran d'interception
Options numérotées **0** Fouille · **1** Bluff · **2** Corruption · **3** Fuite · **4** Éjection (masquée dès qu'une autre action a été tentée). Le barrage occupe tout l'écran : aucune autre action n'est possible avant de l'avoir réglé. Face aux milices de `[D4]` : Payer le péage · Forcer le passage · Refuser. Si la fouille effective serait fatale (`[T4-06]` en soute), l'écran l'annonce. Face à la BRC, l'écran annonce le double fond : caisses cachées et chance que les agents le trouvent (détaillable) ; le compte rendu dit s'il a été trouvé et combien de caisses il a sauvées. L'annonce dit la forme du contrôle : un **barrage fixe** se voit **à 300 m** (il est encore temps d'éjecter la cargaison ou de tourner les talons) ; un **contrôle volant** arrête le véhicule sur place, l'écran le dit et ne propose ni fuite ni éjection. Chaque option affiche sa **probabilité détaillable** et ses **conséquences en cas de succès et d'échec**. Pour la corruption, l'offre se compose de Cash-Puce (raccourcis aux paliers de bonus, du minimum accepté au dernier palier) et de caisses de la soute. Pour chaque produit en soute : la valeur en paiement d'une caisse, son prix d'achat, le gain ou la perte face au cash, et la mention « connivence » si les agents l'apprécient. La valeur totale de l'offre et la chance détaillée se mettent à jour en temps réel. Le bluff propose les aides possibles (caisses à donner ou sacrifier) et la fuite le largage offensif (libellé avec son effet : une caisse jetée derrière soi aveugle les poursuivants) et le dopage, chance recalculée à chaque choix ; le compte rendu compte à part les caisses sacrifiées ; la fuite annonce aussi les risques de casse et d'explosion de la soute. Face aux milices, l'option « Payer en caisses » annonce à l'avance les caisses qui seraient prises et leur valeur.

## Modale « Objectifs du Jour 30 »
Accessible une fois la dette initiale soldée : les grandes fins et la progression vers chacune (score, `[T4-06]` en soute et position en `[D4]` à minuit, injections de Glitch, commandes VIP du parrain, statut Citoyen Or).
* **Suivi en route :** le bureau de Glitch et la tournée clandestine du soir annoncent l'injection à venir (« 2/3 ») quand le serveur est à bord et Glitch au travail ; le compte rendu du trajet la confirme. Le guichet VIP du Velvet-Silo affiche le parrainage.

## Manuel en jeu
Un bouton « ? » du bandeau ouvre le manuel, consultable à tout moment, même pendant un barrage. Il est écrit pour le joueur, pas recopié de ces docs : mêmes chapitres (1 à 6), sans renvoi au code.
* **Chiffres lus dans les données :** le texte reçoit ses valeurs en paramètres, et les tableaux de référence (produits et tags, districts et lieux, véhicules, modules et équipiers, événements) sont générés depuis `src/data/`. Le manuel ne peut donc pas se tromper de chiffre.
* **Aide en contexte :** les choix importants (départ, barrage, garage, lieux spéciaux, double fond) portent un lien « ? » vers le passage du manuel qui les explique.
