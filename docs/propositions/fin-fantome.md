# Proposition — Fin « Le Fantôme d'Olympus-Green »

> Validée sur le principe, pas encore écrite dans les chapitres ni dans le code. Les seuils seront mesurés au simulateur.

## Idée
Un seul serveur `[T4-06]`, deux usages à minuit le Jour 30 :
* **en `[D4]`** : tu diffuses les preuves et tu fuis par l'écluse (le Saboteur, inchangé) ;
* **en `[D6]`, avec Glitch** (`[CREW-02]`) : elle branche le serveur sur Aeterna et réécrit ton dossier. Tu n'achètes pas ta place dans la verrière, tu la voles.

## Conditions (dette soldée)
* score ≥ seuil Fantôme (entre l'Élite et le Saboteur, environ 400 000 ₡, à mesurer) ;
* au moins une caisse de `[T4-06]` en soute ;
* Glitch engagée et au travail ce jour-là (salaire payé) ;
* être **en `[D6]` à minuit** ;
* **aucune condition d'ICC** : le dossier est réécrit.

Ordre d'évaluation : Saboteur → **Fantôme** → Élite → Baron → Standard.

## Ce qui la distingue de l'Élite
| | Élite | Fantôme |
| :--- | :--- | :--- |
| **Voie** | officielle : on rachète sa place | pègre : on la vole |
| **Condition clé** | ICC Or à minuit (dossier propre, ou blanchi par certificat et chantage) | serveur + Glitch + `[D6]` à minuit, ICC indifférent |
| **Où à minuit** | n'importe où | en `[D6]`, le district le plus surveillé |
| **Risque final** | aucun : on finit en livraisons légales | entrer en `[D6]` avec un objet qui tue si la fouille le trouve (contrôles volants fréquents, sécurité maximale) |
| **Prérequis de progression** | aucun | Glitch se débloque par une Fiche S : il faut avoir été recherché |
| **Épilogue** | tu rejoins l'oligarchie, au grand jour | personne ne sait que tu existes ; Aeterna te sert sans le savoir |

Les deux fins mènent en `[D6]`, mais par des chemins opposés. Le joueur qui a sali son ICC n'a aujourd'hui que le Baron ou le Saboteur ; le Fantôme lui ouvre la verrière. Et le serveur devient un vrai dilemme de fin de partie : **le détruire** (`[D4]`, plus cher) ou **s'en servir** (`[D6]`, plus risqué à livrer).

## Épilogue proposé
*Glitch branche la baie de serveur sur un port de maintenance d'Aeterna. Trois secondes de silence, puis ton dossier se réécrit ligne par ligne : citoyen de Catégorie A, résident d'Olympus-Green, né dans la verrière. Personne ne te connaît, personne ne te cherche. Chaque matin, l'algorithme te recommande à toi-même ta propre viande rouge.*

## À faire si retenue
* Chap. 2 (tableau des grandes fins), chap. 5 (Glitch), chap. 3 (`[T4-06]`), chap. 9 (objectif du bot).
* Code : nouvelle fin dans `ENDINGS`, `endingFor`, écran de fin, modale « Objectifs du Jour 30 », textes dans `fr.ts`, tests.
* Bot : objectif Fantôme (chasse du serveur comme le Saboteur, Glitch à engager, entrée en `[D6]` la dernière nuit).
