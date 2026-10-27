# 10. Interface (UI / UX)

* **Single-Page Application** réactive, écran unique responsive : mobile-first en portrait (onglets rapides en bas d'écran), panneaux côte à côte sur desktop / paysage.
* **Aucun chiffre codé en dur :** boutons et panneaux affichent les valeurs calculées depuis les règles du jour (inflation comprise).
* **Principe de transparence — « zéro calculatrice, zéro boîte noire » :** chaque probabilité, prix ou coût affiché peut être touché pour révéler son **détail ligne par ligne**, avec la source de chaque ligne (district, tag, module, équipier, événement…). Le joueur occasionnel lit le total ; le joueur optimisateur lit le détail et ajuste son build.
  * **Toutes les règles sont accessibles en jeu.** Aucune mécanique n'est cachée au joueur (seuls des tirages le sont, comme la ronde renforcée). Chaque calcul se détaille, et chaque règle qui pèse sur un choix est expliquée à l'endroit du choix, en une ou deux phrases. Un **manuel en jeu**, consultable à tout moment et organisé comme ces docs, rassemble l'ensemble (prévu avec l'habillage).
  * *Ex. (risque, valeurs indicatives) :* « Base D5 40 % · Suspicion +10 % · Tech (4/12) +16,7 % · Couverture légale −10 % = 56,7 % · Zéro-C ×0,85 = **48 %** ».

## Bandeau supérieur permanent & briefing de 06h00
* **Téléscripteur d'Aeterna (Flash Info TV) :** sous les barres d'état, un message passif-agressif par jour, **l'indice d'inflation du jour** et sa hausse depuis la veille, l'événement global et les événements locaux du jour.
* **Barres d'état (toujours visibles) :**
  * Jour X / 30 + ☀️ ou 🌙 ;
  * Cash-Puce (jaune) · Compte offshore (cyan, cadenas, taux effectif) · Dette (rouge, prochaine échéance : tabassage, puis retard si la dette initiale n'a jamais été soldée, puis audit ; mention « en retard » une fois le retard acquis) ;
  * ICC (couleur selon le palier ci-dessous, avec le prochain seuil de crédit social et le **reste du plafond de gains du jour**) ;
  * Santé ❤️ · Châssis 🔧 (sur le max du véhicule) · Synthanol ⛽ (sur la capacité du véhicule, + achat rapide au prix local) ;
  * **Exemption Métabolique** 💧 (jours de protection restants ; alerte la veille, icône de Sédation une fois à 0) ;
  * **Fiche S** (0 à 3 icônes 🎯, détail des malus au toucher) ;
  * **Balise** 📡 tant que `[T4-06]` est en soute ;
  * **Prochaine collecte de Viktor** (date et montant estimé ; apparaît une fois la dette initiale soldée).
* **Briefing de 06h00 :** chaque matin, un encadré refermable récapitule la nuit et la routine : gains de sommeil, PV perdus en cellule, dette après intérêts, tabassage, passage en retard, collecte de Viktor (et reliquat ajouté à la dette), intérêts offshore. Chaque montant est détaillable.
* **Compte à rebours de l'audit** (à partir de `AUDIT_COUNTDOWN_DAY`, [`balance.ts`](../src/data/balance.ts)) : *« Dernier dépôt offshore possible : J30, 19h59 »* et *« Dernier remboursement possible : J30, 19h59 »*.
* **Graphique d'inflation :** au toucher de l'indice, la règle de calcul, la courbe de l'historique depuis le Jour 1 et sa projection (atténuée) jusqu'au Jour 30, la valeur de chaque jour au survol, et la liste de ce qui est indexé ou non (chap. 7).

### Dégradation de l'UI selon l'ICC
Mêmes paliers et mêmes noms que les règles (chap. 2) : l'interface ne définit aucun seuil propre.

| Palier (chap. 2) | Rendu | Exemple de message |
| :--- | :--- | :--- |
| Citoyen Or | Interface nette et dorée, couleurs apaisantes, ton maternel. Jauge **verte**. | *« Bonne route, Citoyen-Livreur ! Pensez à vous hydrater. »* |
| Citoyen ordinaire | Interface standard, ton faussement enjoué. Jauge **jaune**. | *« Maman Aeterna est fière de vous. Presque. »* |
| Citoyen sous réserve | Légères scanlines, ton passif-agressif. Jauge **orange**. | *« Votre rythme cardiaque suggère une déviance fiscale, Maman Aeterna vous observe. »* |
| Déviant notoire | Glitchs chromatiques, ● REC rouge clignotant, bip sonar aux changements d'onglet, ton froid. Jauge **rouge clignotante**. | *« Anomalie civique confirmée. Les unités de la BRC convergent vers votre secteur. »* |

## Vue « Véhicule, soute & équipage »
* **Grille de soute :** une case par emplacement. Chaque caisse : couleur du tier (**vert** 0, **jaune** 1, **orange** 2, **rouge** 3, **violet** 4), icône du produit, badge d'état (bouclier si masquée, goutte/chrono si sa fraîcheur a baissé, fêlure si endommagée).
* **Profil de la cargaison :** jauges de part odorante, Tech, chimique, culturelle et légale (ce sont elles qui pilotent le risque), avec les masquages actifs.
* **Modules & équipage :** slots du châssis (modifiables seulement au garage de `[D4]`), canal radio / portrait de l'équipier actif.

## Vue « Marché noir & lieux spéciaux »
* **Tableau des cours :** la boutique du jour, plus, en haut de liste, tous les produits en soute (vente toujours possible). Le prix de vente affiché est le **prix net** (commission, fraîcheur, nuit… comprises), détaillable.
* **Indicateurs :**
  * 📉 vert (prix très bas / production locale) · 🔥 orange (forte demande) · 🚀 rouge clignotant (explosion liée à un événement) ;
  * profil nuit à côté du prix (🌙 + / 🌙 −) ;
  * **demande restante** sur chaque ligne, avec sa reconstitution du lendemain (*« Demande restante : 5 (+2 demain) »*), le prix saturé s'affichant au-delà ;
  * **PMA** sur chaque ligne possédée, ex. *« En soute : 8 (acheté à 410 ₡/u) »*.
  * **Marge** sur chaque ligne possédée : gain net de la prochaine caisse vendue (₡/u et % de son prix d'achat), et gain net si l'on vend tout (saturation comprise). Icône verte (rentable), ambre (marge faible, sous un seuil d'affichage fixé dans `Margin.tsx`) ou rouge (à perte).
* **Filtres** par tag et par tier (Tous, En soute, chaque tag) ; curseurs d'achat / vente (+1, +5, MAX).
* **Onglet lieux spéciaux :** accès direct aux services du district, coûts du jour et cooldowns affichés.

## Vue « Carte tactique & navigation »
* Carte schématique style terminal rétro-futuriste des six districts et de leurs liaisons (chap. 4).
* **Marge estimée :** sous chaque district, les cours mémorisés des produits en soute portent la même icône de marge, estimée sur le cours vu moins la commission de puce (sans savoir-faire ni saturation).
* **Mémoire de marché :** au toucher d'un district, derniers cours observés avec leur ancienneté (*« vu il y a 3 jours »*), en fourchette en cas de Sédation ; cours en temps réel avec `[CREW-02]`.
* **Bulles d'indices :** événements du jour, ronde renforcée révélée par `[CREW-01]` (🚓), pic suspect de la veille (👁️).
* **Panneau de prévision (au clic sur un district) :** itinéraire et districts traversés, rations nécessaires, étoiles de sécurité, prix local du Synthanol, lieux spéciaux, et le **risque d'interception** pour la soute actuelle (détaillable), avant validation. La ronde renforcée, cachée, n'y figure pas ; tout le reste est exact. Les districts en pic suspect portent l'icône 👁️.
* **Boutons de départ :** « Rouler de jour » ; à 20h00, « Dormir au relais » (ou « Bivouac » en `[D4]`) face à « Forcer le couvre-feu », chacun affichant coûts et effets calculés.

## Écran d'interception
Options numérotées **0** Fouille · **1** Bluff · **2** Corruption · **3** Fuite · **4** Éjection (masquée dès qu'une autre action a été tentée). Le barrage occupe tout l'écran : aucune autre action n'est possible avant de l'avoir réglé. Face aux milices de `[D4]` : Payer le péage · Forcer le passage · Refuser. Si la fouille effective serait fatale (`[T4-06]` en soute), l'écran l'annonce. Chaque option affiche sa **probabilité détaillable** et ses **conséquences en cas d'échec** (*« Aeterna estime vos chances de survie fiscale à 35 % »*). Pour la corruption, l'offre se compose de Cash-Puce (raccourcis aux paliers de bonus, du minimum accepté au dernier palier) et de caisses de la soute. Pour chaque produit en soute : la valeur en paiement d'une caisse, son prix d'achat, le gain ou la perte face au cash, et la mention « connivence » si les agents l'apprécient. La valeur totale de l'offre et la chance détaillée se mettent à jour en temps réel. Face aux milices, l'option « Payer en caisses » annonce à l'avance les caisses qui seraient prises et leur valeur.

## Modale « Objectifs du Jour 30 »
Accessible une fois la dette initiale soldée : les quatre grandes fins et la progression vers chacune (score, statut Citoyen Or, `[T4-06]` en soute, position en `[D4]` à minuit).
