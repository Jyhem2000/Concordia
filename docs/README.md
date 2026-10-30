# CONCORDIA · Game Design

## Fiche d'identité
- **Genre :** Simulation économique satirique / Gestion de risques (Drug Wars-like).
- **Plateformes :** Navigateur Web & Mobile (responsive portrait/paysage), portée internationale (i18n).
- **Ton :** Satire mordante, humour noir, paranoïa bureaucratique, dystopie algorithmique (Brazil, Papers Please, South Park, Black Mirror, Demolition Man).

## Chapitres
Les chapitres 1 à 6 décrivent le jeu : univers, règles, données. Les deux derniers décrivent comment on le fabrique : le chap. 7 l'interface, le chap. 8 l'équilibrage par simulation.

| # | Fichier | Contenu |
| :---: | :--- | :--- |
| 1 | [01-jeu.md](01-jeu.md) | Univers, rôle du joueur, objectif, jauges, argent (Cash-Puce, dette, collecte, offshore), déroulé d'une journée, fins de partie |
| 2 | [02-produits.md](02-produits.md) | Tags, tiers, catalogue des produits, marché (boutique, cours, quota de rachat, prix de vente, paiement en nature) |
| 3 | [03-districts.md](03-districts.md) | Règles géographiques, districts, lieux spéciaux |
| 4 | [04-vehicule.md](04-vehicule.md) | Véhicules, modules, équipage |
| 5 | [05-interception.md](05-interception.md) | Risque, choix tactiques, garde à vue |
| 6 | [06-evenements.md](06-evenements.md) | Événements globaux, locaux, Loterie, aléas routiers |
| 7 | [07-interface.md](07-interface.md) | Écrans et feedback |
| 8 | [08-simulation.md](08-simulation.md) | Bots de test (plan × tempérament × objectif), routes de référence, campagnes, critères d'équilibrage |

## Où trouver une règle
Index complet : chaque mécanique du jeu y figure, avec les chapitres qui la décrivent, dans l'ordre de lecture (le premier porte la règle, les suivants ses modificateurs). Une mécanique ajoutée aux docs s'ajoute ici dans le même changement (règle 9).

| Thème | Mécaniques | Où lire |
| :--- | :--- | :--- |
| **Partie** | objectif, audit du Jour 30, défaites (Bio-Briques, mort, exécution), grandes fins (Saboteur, Résident Réécrit et injections, Élite par cooptation, Baron), score | chap. 1 |
| **Jauges** | ICC (paliers, suspicion, gains de route et plafond), Santé, châssis, carburant, Exemption Métabolique et Sédation | chap. 1 → chap. 4 (capacités du véhicule) |
| **Journée** | moments (Journée, 20h00, Nuit), routine de 06h00, service de jour, dilemme de 20h00 (relais, bivouac, tournée de nuit), livraison officielle du jour, missions de nuit et caisses scellées, after du couvre-feu, épuisement, demi-journée perdue, immobilisation, dépannage d'urgence | chap. 1 |
| **Trajet** | ordre de résolution, consommation, usure de nuit et canicule, carte et districts traversés, couches du réseau (surface, galeries, quais), zone hors-réseau, mission de nuit | chap. 1 → chap. 3 → chap. 6 (canicule, aléas de jour) |
| **Argent** | Cash-Puce, dette (intérêts, retard, avance de survie), collecte de protection, compte offshore (commission au retrait), placement du Cartel (coup de filet) | chap. 1 → chap. 3 (guichets des lieux spéciaux) |
| **Risque d'interception** | formule, risque de base, suspicion, tags détectés, contexte (nuit, traversée, portique, balise, ronde renforcée, Fiche S, pic suspect, embuscades), couverture légale, bonus d'équipement, multiplicateurs finaux | chap. 5 → chap. 2 (tags, masquage) → chap. 3 (détection des districts) → chap. 6 (effets d'événements) |
| **Contrôle** | barrage fixe ou contrôle volant, brouilleur de drones, fouille et sanctions, double fond, bluff (aides), corruption (offre, connivence, Drones-Juges), fuite (largage, dopage, casse, explosions), éjection, exécution sommaire, garde à vue | chap. 5 → chap. 2 (actions des produits, état des caisses) |
| **Racket des milices** | péage en ₡ ou en caisses, passage forcé, refus | chap. 3 → chap. 5 |
| **Produits** | tags (dont vente de nuit Festif et Diurne), masquage 1:1, tiers, catalogue, actions (aide au bluff, largage, dopage, nuit blanche, refroidissement, pass d'identité, balise) | chap. 2 |
| **État des caisses** | fraîcheur (Extra-Frais à Pourri), casse des fragiles, explosion des inflammables, valeur d'une caisse abîmée ou défraîchie | chap. 2 |
| **Marché** | information (mémoire, historique, profil public des districts), boutique du jour, exclusion, cours (coefficient du district, tendance, Mult_Événement), quota de rachat, saturation, pic suspect | chap. 2 → chap. 6 (événements, contrecoups, vices de la Loterie) |
| **Vente** | prix de vente, commission, savoir-faire (fraîcheur, nuit, rendements décroissants), clause anti-arbitrage, lots les plus anciens d'abord, paiement en nature | chap. 2 |
| **Lieux spéciaux** | services, horaires, effets de chaque lieu, parrainage du Velvet-Silo | chap. 3 → chap. 1 (dette, offshore) |
| **Équipement** | véhicules (double fond et son contenu compris), modules (brouilleur de drones compris), équipage (injection du serveur par Glitch comprise), salaires | chap. 4 |
| **Événements** | globaux, locaux, rumeurs, contrecoups, Loterie, aléas routiers | chap. 6 |
| **Prévisibilité** | ce que le joueur sait ou peut deviner (cours, rumeurs, contrecoups, Loterie) et ce qui reste caché (ronde renforcée) | chap. 2 → chap. 6 → chap. 5 |
| **Affichage** | charte graphique, onglets, Le Fil (actualités, agenda, bonnes affaires, alertes), carnet de route et courbe du patrimoine, palmarès, confirmations, où chaque règle est montrée et détaillée au joueur, manuel en jeu | chap. 7 |

## État d'implémentation
Toutes les règles des chap. 1 à 6 sont en jeu. Ce tableau dit ce qui reste à faire, et se met à jour à chaque étape.

| Chap. | À venir |
| :---: | :--- |
| 7 | Manuel en jeu |
| 8 | Spéculation sur l'événement de demain (Cassandre-88, rumeur) et faux dossier de Loterie dans les bots, optimiseur et campagne 5 (reportés après l'interface, comme contrôle final) |

## Feuille de route
Étapes restantes :
1. **Interface et manuel du jeu** — interface restante (chap. 7) et manuel du joueur en jeu.
2. **Optimiseur** (campagne 5, chap. 8) — contrôle final de l'équilibrage, gelé le 29/10/2026 ; les écarts assumés sont listés dans [`sim/reports/analyse-etape-2.md`](../sim/reports/analyse-etape-2.md).

## Règles de rédaction
1. **Un chiffre, un seul endroit.** Une valeur (prix, %, durée…) n'est écrite que là où la donnée est définie. Un bonus est écrit chez ce qui le produit (le module, le véhicule, l'événement…) ; les formules ne font que citer la source.
   * **Le code fait foi pour les stats.** Les caractéristiques des données de jeu (prix, tags, coefficients, listes de production, capacités, valeurs de départ…) vivent dans `src/data/` et n'apparaissent plus dans ces docs, qui gardent les règles, les effets et le lore.
   * Un effet chiffré encore décrit ici (passif, service, formule, événement) migre dans le code quand le moteur l'implémente, et disparaît alors des docs.
   * Les exemples chiffrés sont des illustrations : en cas d'écart, le code fait foi.
   * Les textes affichés en jeu (noms, messages) sont dans `src/i18n/fr.ts`. Les noms restent cités ici pour la lisibilité.
2. **IDs réservés aux données de jeu** — les entités qui ont des stats et des effets :

| ID | Donnée | Règles | Stats (font foi) |
| :--- | :--- | :--- | :--- |
| `T0-01` … `T4-06` | Produits et tiers | chap. 2 | [`products.ts`](../src/data/products.ts) |
| `TAG-*` | Tags | chap. 2 | [`tags.ts`](../src/data/tags.ts) |
| `D1` … `D6` | Districts et carte | chap. 3 | [`districts.ts`](../src/data/districts.ts) |
| `LOC-Dx-y` | Lieux spéciaux | chap. 3 | [`locations.ts`](../src/data/locations.ts) |
| `VEH-*`, `MOD-*`, `CREW-*` | Véhicules, modules, équipiers | chap. 4 | [`vehicles.ts`](../src/data/vehicles.ts) |
| `EVT-G*`, `EVT-Dx-*`, `EVT-R*`, `EVT-L*` | Événements | chap. 6 | [`events.ts`](../src/data/events.ts) |

Constantes globales (valeurs de départ…) : [`balance.ts`](../src/data/balance.ts).

3. Hors de son chapitre, une donnée à ID est citée **par son ID seul** (pas de libellé ni de stat recopiés).
4. Toute mécanique chiffrée doit être **affichée et détaillable** dans l'app (chap. 7) : le joueur ne calcule jamais, mais peut toujours comprendre.
5. Le lore, les factions (Aeterna, DSC, BRC…), les monnaies et les règles (garde à vue, couvre-feu…) s'écrivent en clair, sans ID.
6. **Les docs décrivent toutes les règles.** Développeur ou joueur, on doit comprendre le jeu sans lire le code. Toute décision prise en codant (ordre de résolution, arrondi, cas limite, interprétation d'une règle ambiguë) est écrite dans le chapitre concerné, dans le même changement. Seuls les chiffres vivent dans le code (règle 1).
7. **Relecture critique avant chaque étape.** Avant d'implémenter un chapitre, on le relit et on le remet en cause : mécanique impossible ou bugguée, gameplay sans intérêt, lore incohérent, règle déjà contredite par le code. Les corrections sont tranchées et écrites avant de coder.
8. **L'état d'implémentation** (plus haut) se met à jour dans le même changement que le code qui fait entrer une mécanique en jeu.
9. **L'index « Où trouver une règle »** est complet : une mécanique ajoutée ou déplacée y est reportée dans le même changement.
