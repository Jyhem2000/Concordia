# Proposition — Des nuits qui demandent un choix

> **Ouvert** : à trancher avant tout code. Rien n'est encore écrit dans les chapitres ni dans les données.

## Constat
Aujourd'hui, la nuit se résume à trois règles :
* **La mission du soir :** une destination imposée, un trajet couvert, une prime et des caisses scellées qui prennent de la place. Le choix est trivial : on l'accepte si la destination convient.
* **La tournée clandestine :** un malus de risque et un niveau de Fiche S. On ne la fait que pour écouler une soute avant 06h00.
* **Le profil festif :** un multiplicateur à la vente la nuit, valable partout. Il ne pèse pas sur la destination.

La mesure le confirme : le plan Nuit festive fait à peu près le Sans build en Équilibré (`sim/reports/analyse-etape-2.md`). La nuit n'est pas trop faible ; elle est **sans décision**. Les trois idées ci-dessous en créent une, chacune ancrée dans le couvre-feu sanitaire (chap. 1).

## A. Les afters du couvre-feu (recommandée)
À 20h00, la ville doit dormir. Elle ne dort pas : la fête se cache, et elle change de cave chaque soir.

* **Une after par soir**, dans un district tiré le matin et annoncé dès 06h00 : chez Borg, au téléscripteur, comme une rumeur sûre. Le joueur prépare sa soute de jour.
* **Lieux, pour le texte :**
  * les toits des Ruches `[D1]` ;
  * le campus de Pastel-Heights `[D2]`, cousin du festival Sans-Ondes ;
  * les anciens abattoirs de Rust Valley `[D4]` ;
  * le sous-sol du Velvet-Silo `[D6]`.
* **Effet sur le marché :** le profil festif se concentre.
  * Dans le district de l'after, les produits festifs se vendent nettement plus cher qu'aujourd'hui, mais dans la limite d'un quota propre : la soif de la foule.
  * Ailleurs, le profil festif baisse.
  * La nuit cesse d'être un bonus diffus. Elle devient une **destination à viser**.
* **La foule couvre :** dans le district de l'after, le malus de risque d'une tournée hors mission est réduit. Des dizaines de véhicules violent le couvre-feu en même temps, et Aeterna ne peut pas tous les suivre. L'écart reste enregistré (Fiche S).
* **Le dilemme du soir :** si la mission va au district de l'after, c'est le gros lot, à la fois couvert et payé. Sinon, il faut choisir : la mission sûre, ou l'after clandestine, plus risquée et bien plus payée.
* **Coût de mise en œuvre :**
  * un tirage dans la routine ;
  * un facteur et un quota dans les données ;
  * un réglage du malus de nuit ;
  * une ligne au téléscripteur et sur la carte.
  * Le profil festif existe déjà.

## B. L'écrémage des caisses scellées
Les caisses du DSC ne sont pas vides : vraie viande des cuisines de l'élite, médicaments, pièces d'Aeterna. Un Passeur du Monde d'Avant sait les ouvrir.

* **Ouvrir une caisse scellée** pendant une mission : une action au marché de rue. Elle rapporte une caisse d'un produit de Tier 2–3 (tiré selon la destination de la mission), à vendre ou à garder.
* **À la livraison**, la plateforme constate le manque :
  * prime réduite, perte d'ICC ;
  * la confiance du DSC redescend, et les missions s'espacent.
  * Le gain est immédiat ; la facture arrive plus tard.
* **Ce que ça change :** la mission n'est plus un trajet gratuit. C'est une tentation, comme dans la satire : le livreur nourrit l'élite et se sert au passage.
* **Coût :** une action et un état « caisse ouverte » sur la mission. Les pénalités sont celles d'une mission non livrée, en plus fort.

## C. Deux ordres de mission au choix
Le soir, la plateforme propose deux ordres vers deux districts différents. Chacun porte une cargaison, et chaque cargaison a sa propre contrainte :

| Cargaison | Contrainte |
| :--- | :--- |
| Cuisines de l'élite (vers `[D5]` ou `[D6]`) | Prime élevée, mais caisses fragiles : un choc baisse la prime. |
| Déchets (vers `[D4]`) | Prime faible, mais le camion-benne peut larguer des caisses illégales avec les ordures. |
| Médical (vers `[D3]`) | Trajet prioritaire, sans contrôle volant. |

* **Ce que ça change :** deux destinations couvertes au lieu d'une, donc une vraie route de nuit à choisir.
* **Coût :** le plus élevé des trois. Il faut un tirage double, trois effets de cargaison, l'interface du choix, et un nouveau réglage du bot.

## Recommandation
**A** d'abord : c'est la plus simple, et elle répond au problème, puisqu'elle donne à la nuit une destination à viser. Elle se mesure directement avec le plan Nuit festive. Il faudra ajuster deux points :
* le profil festif dans le district de l'after ;
* le malus de nuit sous la foule.

**B** en second : la tentation peut s'ajouter sans toucher au reste. **C** plus tard, si la nuit reste plate après A.

## À faire si retenu (A)
* **Docs :**
  * chap. 2 : tournée de nuit, routine de 06h00 ;
  * chap. 7 : profil festif ;
  * chap. 8 : annonce de l'after ;
  * chap. 10 : téléscripteur, carte, panneau du soir ;
  * chap. 9 : le bot Nuit festive vise l'after.
* **Code :**
  * tirage dans la routine et état « after du soir » ;
  * facteur et quota dans les données ;
  * malus de nuit réduit dans le district de l'after ;
  * textes, tests, sauvegarde.
