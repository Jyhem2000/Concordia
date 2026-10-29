# CONCORDIA · Game Design

## Fiche d'identité
- **Genre :** Simulation économique satirique / Gestion de risques (Drug Wars-like).
- **Plateformes :** Navigateur Web & Mobile (responsive portrait/paysage), portée internationale (i18n).
- **Ton :** Satire mordante, humour noir, paranoïa bureaucratique, dystopie algorithmique (Brazil, Papers Please, South Park, Black Mirror, Demolition Man).

## Chapitres
Les chapitres 1 à 8 décrivent le jeu : univers, règles, données. Les deux derniers décrivent comment on le fabrique : le chap. 9 l'équilibrage par simulation, le chap. 10 l'interface.

| # | Fichier | Contenu |
| :---: | :--- | :--- |
| 1 | [01-univers.md](01-univers.md) | Monde, factions, piliers du quotidien, rôle du joueur |
| 2 | [02-joueur.md](02-joueur.md) | Objectif, jauges, déroulé d'une journée, fins de partie |
| 3 | [03-produits.md](03-produits.md) | Tags, tiers, catalogue des produits |
| 4 | [04-districts.md](04-districts.md) | Règles géographiques, districts, lieux spéciaux |
| 5 | [05-vehicule.md](05-vehicule.md) | Véhicules, modules, équipage |
| 6 | [06-interception.md](06-interception.md) | Risque, choix tactiques, garde à vue |
| 7 | [07-economie.md](07-economie.md) | Boutique, cours, vente, portefeuilles, routes |
| 8 | [08-evenements.md](08-evenements.md) | Événements globaux, locaux, aléas routiers |
| 9 | [09-simulation.md](09-simulation.md) | Bots de test (plan × tempérament × objectif), routes de référence, campagnes, critères d'équilibrage |
| 10 | [10-interface.md](10-interface.md) | Écrans et feedback |

## Où trouver une règle
Index complet : chaque mécanique du jeu y figure, avec les chapitres qui la décrivent, dans l'ordre de lecture (le premier porte la règle, les suivants ses modificateurs). Une mécanique ajoutée aux docs s'ajoute ici dans le même changement (règle 9).

| Thème | Mécaniques | Où lire |
| :--- | :--- | :--- |
| **Partie** | objectif, audit du Jour 30, défaites (Bio-Briques, mort, exécution), grandes fins, score | chap. 2 → chap. 7 (dette, compte offshore) |
| **Jauges** | ICC (paliers, suspicion, gains de route et plafond), Santé, châssis, carburant, Exemption Métabolique et Sédation | chap. 2 → chap. 5 (capacités du véhicule) |
| **Journée** | moments (Journée, 20h00, Nuit), routine de 06h00, service de jour, dilemme de 20h00 (relais, bivouac, tournée de nuit), livraison officielle du jour, missions de nuit et caisses scellées, épuisement, demi-journée perdue, immobilisation, dépannage d'urgence | chap. 2 |
| **Trajet** | ordre de résolution, consommation, usure de nuit et canicule, carte et districts traversés, couches du réseau (surface, galeries, quais), zone hors-réseau, mission de nuit | chap. 2 → chap. 4 → chap. 8 (canicule, aléas de jour) |
| **Risque d'interception** | formule, risque de base, suspicion, tags détectés, contexte (nuit, traversée, portique, balise, ronde renforcée, Fiche S, pic suspect, embuscades), couverture légale, bonus d'équipement, multiplicateurs finaux | chap. 6 → chap. 3 (tags, masquage) → chap. 4 (détection des districts) → chap. 8 (effets d'événements) |
| **Contrôle** | barrage fixe ou contrôle volant, brouilleur de drones, fouille et sanctions, double fond, bluff (aides), corruption (offre, connivence, Drones-Juges), fuite (largage, dopage, casse, explosions), éjection, exécution sommaire, garde à vue | chap. 6 → chap. 3 (actions des produits, état des caisses) |
| **Racket des milices** | péage en ₡ ou en caisses, passage forcé, refus | chap. 4 → chap. 6 |
| **Produits** | tags, masquage 1:1, tiers, catalogue, actions (aide au bluff, largage, dopage, nuit blanche, refroidissement, pass d'identité, balise) | chap. 3 |
| **État des caisses** | fraîcheur (Extra-Frais à Pourri), casse des fragiles, explosion des inflammables, valeur d'une caisse abîmée ou défraîchie | chap. 3 → chap. 7 (vente, paiement en nature) |
| **Marché** | information (mémoire, historique, profil public des districts), boutique du jour, exclusion, cours (coefficient du district, tendance, Mult_Événement), quota de rachat, saturation, pic suspect | chap. 7 → chap. 8 (événements, contrecoups, vices de la Loterie) |
| **Vente** | prix de vente, commission, savoir-faire (fraîcheur, nuit, rendements décroissants), clause anti-arbitrage, lots les plus anciens d'abord | chap. 7 → chap. 3 (fraîcheur) |
| **Argent** | Cash-Puce, paiement en nature, dette (intérêts, retard, avance de survie), collecte de protection, compte offshore (commission au retrait) | chap. 7 → chap. 4 (guichets des lieux spéciaux) |
| **Lieux spéciaux** | services, horaires, effets de chaque lieu | chap. 4 → chap. 7 (dette, offshore) |
| **Équipement** | véhicules (double fond compris), modules (brouilleur de drones compris), équipage, salaires | chap. 5 |
| **Événements** | globaux, locaux, rumeurs, contrecoups, Loterie, aléas routiers | chap. 8 |
| **Prévisibilité** | ce que le joueur sait ou peut deviner (cours, rumeurs, contrecoups, Loterie) et ce qui reste caché (ronde renforcée) | chap. 7 → chap. 8 → chap. 6 |
| **Affichage** | où chaque règle est montrée et détaillée au joueur | chap. 10 |

## État d'implémentation
Les docs décrivent le jeu complet ; tout n'est pas encore en jeu. Ce tableau dit ce qui l'est, chapitre par chapitre, et se met à jour à chaque étape.

| Chap. | En jeu | À venir |
| :---: | :--- | :--- |
| 2 | Jauges (ICC, Santé, châssis, carburant), journée, couvre-feu, épuisement, demi-journée perdue, dépannage, audit et fins, Exemption Métabolique et Sédation, pompes officielles fermées la nuit, livraison officielle du jour, confiance du DSC et mission de nuit débloquée | — |
| 3 | Tags, masquage, fraîcheur, casse, explosions, actions des produits | — |
| 4 | Carte, districts, racket et portique de `[D4]`, tous les lieux spéciaux et leurs services, services réservés (voies officielle et pègre) | — |
| 5 | Véhicules, modules, catalogue du garage en rayons, double fond, équipage (débloqué par des actes) et salaires | — |
| 6 | Risque, Fiche S, barrage fixe et contrôle volant, toutes les options et modes d'éjection, garde à vue, bonus des véhicules, modules et équipiers | — |
| 7 | Boutique, cours et tendance, quotas, prix de vente, paiement en nature, dette, avance de survie, collecte, compte offshore, flux et bonus de `[CREW-02]`, bonus d'influence de `[LOC-D2-1]` | — |
| 8 | Événements globaux et locaux, rumeurs, contrecoups, Loterie (faux dossiers compris), aléas routiers, prédictions de Cassandre-88 | — |
| 9 | Moteur de simulation, invariants, Novice, Aléatoire, marchand (12 plans × 3 tempéraments, lieux spéciaux, commande VIP), objectifs de grande fin ; campagnes Contrôle, 1 à 4 (`sim/reports/`) | Spéculation sur l'événement de demain (Cassandre-88, rumeur), faux dossier de Loterie, optimiseur et campagne 5 |
| 10 | Bandeau, téléscripteur, marché et fiche produit, carte, lieux, soir, briefing, barrage, aléa routier, objectifs | Vue véhicule et soute (dont le choix du contenu du double fond), filtres du marché, dégradation de l'interface selon l'ICC, manuel en jeu |

## Propositions en cours
Analyses de conception pas encore tranchées ; les règles retenues rejoindront leurs chapitres.
* [Mini-progression : débloquer les mécaniques au fil de la partie](propositions/progression.md)
* [Mécaniques à simplifier](propositions/simplification.md) : premier lot adopté (inflation, Laverie, rachat, Hachoir de Viktor, tabassage, emprunt tactique), le reste ouvert
* [Deux chemins vers Olympus-Green : l'Élite par cooptation et le Résident Réécrit](propositions/fins-olympus.md)

## Feuille de route
Étapes restantes, dans l'ordre des dépendances :
1. **Simulations** — campagnes du chap. 9 sur le jeu complet, sans interface, puis équilibrage. L'équilibrage peut changer des règles : l'habillage et le manuel viennent après.
2. **Habillage et manuel du jeu** — interface restante (chap. 10), manuel du joueur en jeu, et refonte des docs à cette occasion : répartir le contenu de `07-economie.md` (marché, vente, argent) dans les autres chapitres, renommer et renuméroter les fichiers, puis mettre à jour par script tous les renvois « chap. N » (docs et commentaires du code).

## Règles de rédaction
1. **Un chiffre, un seul endroit.** Une valeur (prix, %, durée…) n'est écrite que là où la donnée est définie. Un bonus est écrit chez ce qui le produit (le module, le véhicule, l'événement…) ; les formules ne font que citer la source.
   * **Le code fait foi pour les stats.** Les caractéristiques des données de jeu (prix, tags, coefficients, listes de production, capacités, valeurs de départ…) vivent dans `src/data/` et n'apparaissent plus dans ces docs, qui gardent les règles, les effets et le lore.
   * Un effet chiffré encore décrit ici (passif, service, formule, événement) migre dans le code quand le moteur l'implémente, et disparaît alors des docs.
   * Les exemples chiffrés sont des illustrations : en cas d'écart, le code fait foi.
   * Les textes affichés en jeu (noms, messages) sont dans `src/i18n/fr.ts`. Les noms restent cités ici pour la lisibilité.
2. **IDs réservés aux données de jeu** — les entités qui ont des stats et des effets :

| ID | Donnée | Règles | Stats (font foi) |
| :--- | :--- | :--- | :--- |
| `T0-01` … `T4-06` | Produits et tiers | chap. 3 | [`products.ts`](../src/data/products.ts) |
| `TAG-*` | Tags | chap. 3 | [`tags.ts`](../src/data/tags.ts) |
| `D1` … `D6` | Districts et carte | chap. 4 | [`districts.ts`](../src/data/districts.ts) |
| `LOC-Dx-y` | Lieux spéciaux | chap. 4 | [`locations.ts`](../src/data/locations.ts) |
| `VEH-*`, `MOD-*`, `CREW-*` | Véhicules, modules, équipiers | chap. 5 | [`vehicles.ts`](../src/data/vehicles.ts) |
| `EVT-G*`, `EVT-Dx-*`, `EVT-R*`, `EVT-L*` | Événements | chap. 8 | [`events.ts`](../src/data/events.ts) |

Constantes globales (valeurs de départ…) : [`balance.ts`](../src/data/balance.ts).

3. Hors de son chapitre, une donnée à ID est citée **par son ID seul** (pas de libellé ni de stat recopiés).
4. Toute mécanique chiffrée doit être **affichée et détaillable** dans l'app (chap. 10) : le joueur ne calcule jamais, mais peut toujours comprendre.
5. Le lore, les factions (Aeterna, DSC, BRC…), les monnaies et les règles (garde à vue, couvre-feu…) s'écrivent en clair, sans ID.
6. **Les docs décrivent toutes les règles.** Développeur ou joueur, on doit comprendre le jeu sans lire le code. Toute décision prise en codant (ordre de résolution, arrondi, cas limite, interprétation d'une règle ambiguë) est écrite dans le chapitre concerné, dans le même changement. Seuls les chiffres vivent dans le code (règle 1).
7. **Relecture critique avant chaque étape.** Avant d'implémenter un chapitre, on le relit et on le remet en cause : mécanique impossible ou bugguée, gameplay sans intérêt, lore incohérent, règle déjà contredite par le code. Les corrections sont tranchées et écrites avant de coder.
8. **L'état d'implémentation** (plus haut) se met à jour dans le même changement que le code qui fait entrer une mécanique en jeu.
9. **L'index « Où trouver une règle »** est complet : une mécanique ajoutée ou déplacée y est reportée dans le même changement.
