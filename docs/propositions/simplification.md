# Proposition — Mécaniques à simplifier

> **Adopté le 29/10/2026** (docs et code à jour, campagnes à remesurer) :
> * inflation retirée, chaque coût fixé à 1,5 fois son ancienne valeur de base ;
> * commission de la Laverie au retrait, délai de rentabilité affiché au guichet ;
> * « Demande ici » renommé « Rachat au cours », origine de chaque produit en boutique affichée ;
> * Hachoir de Viktor, tabassage du Jour 10 et emprunt tactique retirés.
>
> **Conservés :** Karma-Cham et les pompes fermées la nuit (elles forcent à anticiper).
>
> **Recommandé de garder, à confirmer :** chantage du Velvet-Silo, laissez-passer de la Morgue, collecte de protection, rendements décroissants, plafond des événements, tranches du compte offshore (voir le tableau plus bas).
>
> **Nouvelle question :** le filet de sécurité après la dette initiale (voir *Avance de survie* plus bas).

Analyse de conception. Chaque mécanique est revue sous trois angles : **ce qu'elle apporte au joueur**, **ce qu'elle coûte** (règles à apprendre, chiffres à l'écran, code), **ce que disent les mesures** (`sim/reports/`). Les propositions retenues rejoindront leurs chapitres ; les chiffres seront mesurés au simulateur avant d'être fixés.

## Mécaniques examinées à la demande

### Inflation (chap. 7)
* **Règle :** un indice quotidien, ×1 au Jour 1, ×2 au Jour 16, ×2,93 au Jour 30 (moyenne ×2 sur la partie). Il multiplie les services : carburant, réparations, dépannage, salaires et recrutement, lieux spéciaux, part fixe de la corruption, aléas routiers, primes des livraisons et des missions. **Pas les produits**, ni les véhicules, modules, dette ou seuils de fin.
* **Pourquoi elle existe :** elle vient de la conception d'origine (premier commit). Intention écrite : *« les services coûtent de plus en plus cher ; les équipements, non indexés, rapportent d'autant plus qu'on les achète tôt »*. C'est une ponction de fin de partie, plus une satire (« Aeterna ajuste les prix en temps réel »).
* **Ce qu'elle apporte :** un coût qui monte pendant que les revenus du joueur montent aussi. La décision qu'elle crée (« équiper tôt ») est désormais contredite par la progression, qui fait débloquer l'équipement au fil des actes.
* **Ce qu'elle coûte :** chaque montant de service change chaque jour (le joueur ne peut pas apprendre un prix), un graphique et une ligne de téléscripteur, la règle de rédaction n° 4 (« valeurs de base au Jour 1 »), 18 appels dans 9 fichiers du moteur.
* **Le nom trompe :** une inflation qui épargne les produits n'est pas une inflation. Le joueur s'attend à voir les prix monter.
* **Options :**
  1. **La retirer** et fixer chaque coût à sa valeur moyenne de partie (environ ×1,5 la valeur de base, à mesurer). Le plus simple.
  2. **En faire une vraie inflation**, produits compris : le Cash-Puce perd de la valeur, le compte offshore devient une couverture contre elle. Cohérent, mais une règle de plus à comprendre.
  3. La garder telle quelle.
* **Recommandation : option 1.** La ponction de fin de partie se fait mieux par des coûts fixes plus élevés et par la collecte de Viktor.

### Production locale et boutique du jour (chap. 7)
* **Ce qui fait apparaître un produit dans un district :**
  1. tout le Tier 0, partout ;
  2. toute la liste Production du district (tirage partiel en `[D4]`, et `[T4-06]` seulement une chance sur 0,15 par jour en `[D5]`) ;
  3. un complément aléatoire de Tier 1 à 3, neutres pour ce district, jusqu'à 10 produits ;
  4. **jamais** un produit de la Forte demande du district, sauf événement.
* **Oui, le joueur est dirigé**, et c'est voulu : c'est la boucle du jeu de négoce (acheter là où on produit, au coefficient de production, et vendre là où ça manque). C'est aussi réaliste : un quartier vend son surplus et ne vend pas ce qui lui manque.
* **Afficher plus de produits** donnerait plus de choix mais affaiblirait les routes : si tout est partout, la carte ne compte plus. Le complément aléatoire apporte déjà la variété d'un jour à l'autre.
* **Ce qui manque :** l'écran ne dit pas *pourquoi* un produit est en boutique (production ou arrivage du jour), ni qu'un produit de Forte demande n'y sera jamais.
* **Recommandation :** garder la règle, l'expliquer à l'écran (étiquette « arrivage du jour » pour le complément, mention « ne se vend jamais ici » sur la fiche des produits en Forte demande).

### « Demande ici » (chap. 7)
* **Ce que c'est :** le **quota de rachat**. Combien de caisses de ce produit le quartier rachète encore aujourd'hui au plein cours. Au-delà, le prix est divisé par deux (saturation) et Aeterna note un pic suspect (risque du lendemain). Il remonte d'un tiers du quota chaque matin.
* **Pourquoi il apparaît sur un produit en vente :** tout se revend partout (demande universelle). Un produit de la production locale a le quota neutre, mais il se revend au coefficient de production : c'est le pire endroit pour le vendre.
* **Ton intuition est déjà la règle :** les produits en Forte demande ne sont jamais en boutique. Le mot « demande » prête à confusion parce qu'il désigne à la fois le statut (Forte demande) et ce quota.
* **Recommandation :** renommer en **« Rachat au cours »** (« 6 caisses, +2 demain »), et sur les produits de la production locale ajouter « se revend mal ici ».

### Compte offshore (chap. 7)
* **Rôle :** c'est **le score**. Le Cash-Puce est effacé à l'audit : sans dépôt, pas de score. Il protège aussi des saisies, du racket et de la collecte.
* **Commission de dépôt de 5 %** et intérêts simples de 1,5 % par jour, en tranches (1 % au-delà de 200 000 ₡, 0,5 % au-delà de 500 000 ₡).
  * Un dépôt est rentabilisé en **3,4 jours**. Ton exemple : 20 000 → 19 000 ₡, 285 ₡ par jour, la commission est remboursée au bout d'un peu moins de 4 jours.
  * **C'est punitif en fin de partie :** les derniers dépôts (forcés, le Cash-Puce va être effacé) paient 5 % sans rien rapporter. C'est une taxe sur le score, pas une décision.
  * Les intérêts peuvent ajouter jusqu'à +43 % à un dépôt du Jour 1 : c'est une boule de neige qui récompense le dépôt précoce plutôt que le réinvestissement (plan Rentier).
* **Options :**
  1. **Supprimer la commission**, garder les intérêts. Le dépôt devient un arbitrage pur : sécurité et intérêts contre capital de travail.
  2. **Commission au retrait** plutôt qu'au dépôt (l'argent blanchi coûte à ressortir) : on ne taxe plus le score final, on taxe l'aller-retour.
  3. **Un taux unique** à la place des tranches (moins de chiffres, à mesurer avec les nouveaux seuils de fin).
* **Recommandation : option 2**, plus l'affichage du délai de rentabilité au guichet. Tranches : à trancher après mesure.

## Autres mécaniques à intérêt limité
Repérées en relisant les docs, le code et la campagne 4 (retraits). Chaque ligne est une candidate, pas une décision.

| Mécanique | Constat | Piste |
| :--- | :--- | :--- |
| **Hachoir de Viktor** | utilisé dans 1 % des parties, effet nul mesuré | retirer, ou en faire un vrai débouché (racheter les caisses pourries au prix fort quand la dette presse) |
| **Emprunt tactique** (après la dette) | jamais utilisé par les bots, jamais mesuré ; à 5 % par jour il est rarement rentable | retirer, ou le réserver à un usage clair (acheter un véhicule plus tôt) et le mesurer |
| **Tabassage du Jour 10** | la dette se solde entre J2 et J6, dette maximale médiane de 5 000 à 6 000 ₡ : il ne se déclenche presque jamais | retirer, ou le fusionner avec le retard du Jour 20 |
| **Chantage du Velvet-Silo** | 3 % des parties, effet nul | utile seulement pour l'Élite : à garder si la fin Élite reste, sinon retirer |
| **Laissez-passer de la Morgue** | légèrement négatif (−1 300 ₡) | revoir le prix ou l'effet |
| **Karma-Cham** | négatif (−9 300 ₡) depuis que la nuit rapporte | revoir le prix, ou vérifier que le bot l'utilise bien |
| **Collecte de protection** | ne change pas la survie (même à 20 %), retire du score : le joueur averti dépose avant | garder (elle donne une raison de déposer) ou retirer avec l'inflation |
| **Pompes fermées la nuit sous 50 d'ICC** | règle de niche, jamais mesurée | à mesurer, sinon retirer |
| **Rendements décroissants du savoir-faire** | au-delà d'un seuil, le bonus ne compte qu'à moitié ; déjà affiché dans le détail du prix de vente | garder |
| **Plafond et choix du plus fort écart des événements** | trois règles empilées (plafond, plus fort écart, influence par-dessus) | garder le plafond seul |

### Avance de survie après la dette initiale
* **Le besoin d'origine :** un joueur qui a tout dépensé et se fait arrêter n'a plus rien. C'est l'**avance de survie** qui y répond (toujours en jeu), pas l'emprunt tactique retiré.
* **Le trou :** l'avance se ferme dès que la dette initiale est soldée. Ensuite, un joueur ruiné n'a plus que le siphonnage (une ration gratuite) et les livraisons du DSC (prime sans capital) pour repartir : c'est lent.
* **Piste :** ouvrir l'avance **toute la partie**, toujours avec le même total sur la partie. Le filet reste le même, la règle devient plus simple (plus de condition), et un joueur qui s'en sert tard remet une dette en jeu avant l'audit : de la tension de fin de partie, qui manque aujourd'hui.

**Restent utiles** malgré leur coût : la clause anti-arbitrage (sans elle, acheter de jour et revendre au même endroit la nuit au profil festif ×2 serait un gain sans trajet), l'avance de survie (+16 points de survie), la saturation et le pic suspect (ils répartissent les ventes dans l'espace).

## Écarts entre docs et code
* **Contrôle mécanique :** toutes les constantes citées dans les docs existent dans le code, et chaque constante de `src/data/` non citée par son nom est décrite en clair (recrutement, cooldowns des événements, caisses scellées) ou est une table de données. Aucun écart trouvé à ce niveau.
* **Reste à faire :** une relecture chapitre par chapitre, règle par règle, face au moteur (la règle n° 7 de rédaction). La dernière (étape de la nuit) avait trouvé trois écarts, tous corrigés. À refaire après les simplifications retenues, pour ne pas relire deux fois.

## Ordre proposé
1. Trancher la liste (garder, retirer, retravailler).
2. Retirer d'abord (inflation, hachoir, tabassage, emprunt tactique… selon le choix) : chaque retrait simplifie les docs, le code et l'écran.
3. Relecture docs ↔ code sur le jeu simplifié.
4. Une seule campagne de remesure pour tout le lot, avec le recalage de difficulté et les bots Élite et Saboteur corrigés.
