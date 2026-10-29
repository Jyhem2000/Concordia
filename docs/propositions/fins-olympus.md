# Proposition — Deux chemins vers Olympus-Green

> **Révisé après mesure du risque** (`sim/probe-resident.ts`) : l'injection compte à toute arrivée sans garde à vue (contrôle franchi compris), et Glitch brouille la balise du serveur. Le serveur reste hors du double fond.
>
> **Adopté le 29/10/2026** : écrit dans les chap. 2 à 5, 7, 9 et 10, et dans le code (3 injections, 3 commandes VIP, seuils à mesurer). L'avance de survie est ouverte toute la partie dans le même changement. Reste : un bot pour le Résident Réécrit, et la remesure.
> * **Le Résident Réécrit :** validé sur le principe (ex-« Fantôme »). Ce n'est pas un fantôme : Aeterna le reconnaît comme résident autorisé.
> * **L'Élite par cooptation :** proposé pour remplacer « Citoyen Or + score », peu crédible dans le lore.

## Le problème de l'Élite actuelle
Aujourd'hui : un score et un ICC Or suffisent pour emménager sous la verrière. Or le lore dit l'inverse :
* on ne monte qu'avec un laissez-passer **professionnel**, jamais pour une visite privée, quel que soit l'ICC (chap. 4) ;
* les seules promotions sont celles de la Loterie, souvent truquées (chap. 8) ;
* en `[D6]`, *« tout oligarque jugé déviant est suicidé en coulisses »* : les fauteuils se libèrent par purge, et se donnent entre soi.

L'argent et un dossier propre sont nécessaires, mais pas suffisants : il manque **quelqu'un en haut qui te doit quelque chose**.

## L'Élite par cooptation : « Nouvel Oligarque d'Olympus-Green »
* **Le parrain :** un oligarque du Velvet-Silo (`[LOC-D6-1]`) dont tu as servi les vices. Chaque **commande spéciale VIP livrée** compte ; il en faut plusieurs (nombre dans les données, 3 en première proposition). Une commande ratée en efface une (le parrain n'aime pas attendre).
* **Le chemin est déjà en jeu :** l'invitation au Velvet-Silo (palier d'ICC et patrimoine), puis les commandes VIP. On leur donne un but de fin de partie.
* **Conditions à l'audit (dette soldée) :** parrainage acquis + score ≥ seuil Élite + **ICC Or** (les portiques biométriques de la dalle lisent l'ICC : un parrain ne fait pas entrer un déviant).
* **Ce qui se joue :** rester présentable *et* fréquenter assez le Silo pour y gagner un parrain, alors que la contrebande abîme l'ICC. C'est la voie officielle poussée à son terme.
* **Épilogue :** *Ton parrain glisse ton nom pour le fauteuil d'un Haut-Commissaire « suicidé » la semaine dernière. Le Conseil vote à l'unanimité, par habitude. Tu emménages sous la verrière : c'est toi, désormais, qui commandes de la vraie viande aux petits livreurs.*

## Le Résident Réécrit (ex-« Fantôme »)
Glitch (`[CREW-02]`) **injecte** un nouveau dossier dans Aeterna, morceau par morceau, en branchant le serveur `[T4-06]` sur les fermes de serveurs que survolent les **galeries de service** (chap. 4). Quand la greffe a pris, le code d'Aeterna est réécrit : tu es un résident autorisé de `[D6]`, reconnu par tous les portiques.

* **Une injection** = une **tournée de nuit hors mission**, avec le serveur en soute et Glitch au travail ce jour-là. Elle a lieu à l'arrivée, si le trajet n'est pas interrompu par une garde à vue.
* **Il en faut plusieurs** (3 en première proposition), pas forcément d'affilée.
* **Le risque est celui de la nuit :** malus de trajet de nuit, balise du serveur, fouille effective mortelle. Et chaque injection ajoute un niveau de Fiche S : Aeterna sent une anomalie sans la localiser.
* **Conditions à l'audit (dette soldée) :** injection complète + score ≥ seuil. **Ni ICC, ni lieu à minuit, ni serveur à bord** : la greffe a pris, le serveur peut ensuite être revendu ou porté à `[D4]`.
* **Affichage :** progression (« Injection 2/3 ») dans la modale « Objectifs du Jour 30 » et au bureau de Glitch ; la tournée de nuit annonce qu'elle comptera.
* **Épilogue :** *La dernière greffe prend à 03h12. Le code d'Aeterna se réécrit ligne par ligne : résident de Catégorie S, né sous la verrière, casier vierge, accès à tous les portiques. Le lendemain, les douaniers d'élite te saluent par ton nom. L'algorithme ne se trompe jamais : c'est donc que tu as toujours été des leurs.*

## Les trois fins de prestige, côte à côte
| | Élite (cooptation) | Résident Réécrit | Saboteur |
| :--- | :--- | :--- | :--- |
| **Voie** | officielle | pègre | rébellion |
| **Obtention** | parrainage au Velvet-Silo + ICC Or | plusieurs injections de nuit avec Glitch | le serveur à `[D4]` à minuit |
| **Prérequis** | invitation au Velvet-Silo | Glitch (une Fiche S) + serveur | serveur |
| **Ce qui se joue** | rester propre tout en fréquentant le Silo | accumuler des nuits mortelles, Fiche S qui monte | un dernier trajet |
| **Commun** | — | le serveur | le serveur |

Ordre d'évaluation : Saboteur → Résident Réécrit → Élite → Baron → Standard.

## À faire si retenu
* Chap. 2 (grandes fins), chap. 4 (Velvet-Silo), chap. 5 (Glitch), chap. 3 (`[T4-06]`), chap. 10 (objectifs, tournée de nuit, Silo), chap. 9 (objectifs des bots Élite et Résident).
* Code : compteurs (commandes VIP livrées, injections) dans l'état, règles à la livraison VIP et à l'arrivée d'une tournée de nuit, fins dans `ENDINGS` et `endingFor`, écran de fin, modale des objectifs, textes, tests, sauvegarde.
* Bots : Élite (invitation, commandes VIP, ICC) et Résident (Glitch, serveur, tournées de nuit).
