# 6. Interception par la BRC

> Ce chapitre porte les formules et les issues. Les bonus apportés par un district, un tag, un véhicule, un module, un équipier ou un événement sont chiffrés **chez cette donnée**.
> **Transparence :** toutes ces probabilités sont calculées par l'app et affichées avec leur détail ligne par ligne (chap. 9). Le joueur n'a jamais à calculer, mais peut toujours comprendre et optimiser.

## Risque d'interception
À chaque trajet, le moteur calcule la probabilité de tomber sur un barrage de la BRC dans le district de destination. En `[D4]`, règle propre (chap. 4).

```
Risque = ( Base_District + Suspicion + Malus_Tags + Malus_Contexte − Couverture )
         × Bonus_Équipement × Multiplicateurs_finaux
```

Le résultat est **borné entre 5 % et 95 %, après** tous les multiplicateurs. Seule exception : l'interception automatique des Déviants notoires en `[D6]` (chap. 2), certaine.

| Terme | Calcul / sources |
| :--- | :--- |
| **Base_District** | risque de base du district (chap. 4) ; remplacé par `[EVT-D5-02]` |
| **Suspicion** | selon l'ICC (chap. 2) |
| **Malus_Tags** | pour chaque tag détectable : *valeur du tag × part de la cargaison* — `[TAG-ODOROUS]`, `[TAG-TECH]`, `[TAG-CHEMICAL]`, `[TAG-CULTURE]` |
| **Malus_Contexte** (additif) | trajet de nuit (chap. 2), districts traversés (chap. 4), portique du sas de `[D4]` (chap. 4), `[VEH-04]`, balise de `[T4-06]`, ronde renforcée, Fiche S, pic suspect de la veille (chap. 7), embuscades de la dette (chap. 7), purge préventive de `[EVT-L01]`, carte « capitaine de la BRC » de `[LOC-D5-1]` (négative), `[EVT-G02]`, `[EVT-D1-03]`, `[EVT-D4-01]` |
| **Couverture** (additive) | `[TAG-LEGAL]` |
| **Bonus_Équipement** (multiplicatif) | produit des coefficients de `[VEH-01]`, `[VEH-02]`, `[CREW-01]` et du coupe-file Citoyen Or (chap. 2) |
| **Multiplicateurs_finaux** | `[EVT-D3-02]`, `[EVT-D5-03]` |

*Pourquoi multiplicatif :* chaque bonus d'équipement garde sa valeur relative, mais leur cumul ne fait jamais tomber le risque à zéro. Le danger d'un district reste lisible quel que soit le build.

**Part de la cargaison :** (caisses du tag non masquées + **0,5** × caisses du tag masquées) ÷ caisses transportées (masquage, chap. 3). Une soute « diluée » dans du légal est donc moins suspecte, quelle que soit la taille du camion.

**Exemple affiché au joueur :** `[VEH-02]` vers `[D5]` de jour, ICC 80 %, 12 caisses dont 4 `[TAG-TECH]` et 6 `[TAG-LEGAL]`.
`( 40 (base) + 10 (suspicion) + 50 × 4/12 (Tech) − 20 × 6/12 (couverture) ) × 0,85 (Zéro-C) = 56,7 × 0,85 = 48,2 % → 48 %`

**Ronde renforcée :** chaque matin, Aeterna tire **1 district** parmi `[D1]`, `[D2]`, `[D3]`, `[D5]`, `[D6]` : **+20 %** de risque pour la journée. Caché au joueur, sauf avec `[CREW-01]`.

### Fiche S algorithmique (niveau de recherche)
* Chaque **fuite réussie** ajoute **1 niveau** (maximum 3).
* Par niveau : **−10 %** aux prochaines fuites et **+5 %** de risque d'interception partout.
* **−1 niveau** par nuit passée au relais routier (le bivouac ne compte pas).
* Affichée en permanence dans le bandeau (chap. 9) : *« Votre profil suscite l'intérêt bienveillant d'Aeterna. »*

---

## L'écran d'interception
Le joueur accepte la fouille (**0**) ou tente une action : **1** Bluff, **2** Corruption, **3** Fuite, **4** Éjection (uniquement en tout premier).
**Fouille effective :** fouille acceptée, ou échec d'un bluff, d'une corruption, d'une fuite ou d'une éjection — déclencheur de la règle de mort de `[T4-06]`.
**Sédation** (chap. 2) : **−10 %** au bluff, à la corruption et à la fuite.

### 0. Accepter la fouille (sanction de base)
| Soute | Sanction |
| :--- | :--- |
| Uniquement `[TAG-LEGAL]` (ou vide) | Simple formalité : 0 amende, 0 temps perdu, **+2 % d'ICC** (« Citoyenneté Exemplaire », gain de route plafonné, chap. 2). |
| Illégal de Tier 1–2 uniquement | Confiscation des caisses illégales + amende de **20 %** du Cash-Puce + **−5 % d'ICC**. |
| Au moins 1 caisse de Tier 3–4 | Confiscation + amende de **35 %** + **−12 % d'ICC** + garde à vue de **1 jour**. |

### 1. Bluff administratif — *« Circulez, je livre des briques nutritives ! »*
```
Chance = min( 90 %,  25 %
                   + 30 % × part de Tier 0 dans la cargaison
                   + min(25 %, 5 % × caisses masquées)
                   − 5 % × (étoiles du district − 1)
                   − malus d'odeur ([TAG-ODOROUS])
                   − Sédation
                   + bonus ([MOD-08], [T0-04]) )
```
* **Succès :** passage avec toute la cargaison, **+3 % d'ICC** (gain de route plafonné, chap. 2).
* **Échec :** **−3 % d'ICC** (fausse déclaration). Si la soute est uniquement légale, c'est tout. Sinon :
  1. bluff et éjection ne sont plus disponibles ;
  2. l'amende de la sanction de base passe à **30 %** (Tier 1–2) ou **45 %** (Tier 3–4) ;
  3. le joueur paie, ou tente la corruption ou la fuite avec **−20 %** de chance.

### 2. Corruption — *« On peut s'arranger entre citoyens de goût… »*
Jamais automatique : un jet, amélioré par la valeur de l'offre et par le build.
```
Chance = min( 95 %,  50 % + Offre + Connivence − 5 % × (étoiles du district − 1) − Sédation + bonus ([CREW-01]) )
```
* **Tarif standard :** le plus élevé entre **1 500 ₡ × étoiles du district** et **10 % de la valeur des caisses illégales en soute** (au prix de base). L'agent évalue ce qu'il laisse passer. Réduit par `[MOD-08]`.
* **Offre** — sa valeur est comparée au tarif standard, payée en ₡ ou en caisses (paiement en nature, chap. 7). Elle est perdue même en cas d'échec. **En dessous de 0,5 × le tarif, l'agent refuse** : le curseur d'offre démarre à 0,5×.

| Valeur de l'offre | Bonus |
| :--- | :---: |
| 0,5 × le tarif standard (minimum) | +0 % |
| 1 × le tarif standard | +15 % |
| 2 × le tarif standard | +30 % |
| 3 × le tarif standard ou plus | +40 % |

* **Connivence (+10 %)** si l'offre contient un produit apprécié des agents : `[T1-02]`, `[T1-05]`, `[T3-03]` en `[D1]`, `[D2]`, `[D3]` (agents humains) ; `[T3-02]`, `[T3-03]` en `[D5]`, `[D6]` (douaniers d'élite).
* **Drones-Juges** (districts équipés, chap. 4) : **20 %** d'échec critique incompressible, tiré avant le jet (ils sont incorruptibles : il faut tomber sur un douanier).
* **Succès :** l'agent coupe sa caméra-piéton ; passage garanti, ICC inchangé.
* **Échec :** confiscation + amende de **50 %** + **−15 % d'ICC** + garde à vue de **1 jour**, quel que soit le tier.

### 3. Fuite — *« Pied au plancher ! »*
* **Chance de base :** **35 %**. **Plafond :** **95 % − 5 % × (étoiles du district − 1)** (95 % en `[D1]`, 75 % en `[D6]`).
* **Bonus :** `[MOD-06]`, `[CREW-02]`, `[VEH-03]`. **Malus :** Fiche S, Sédation.
* **Sacrifices :** 1 largage offensif max (`[TAG-FLAMMABLE]` **ou** `[TAG-CHEMICAL]`) + dopage `[T2-05]` (cumulable).
* **Succès :** cargaison sauvée, **+1 niveau de Fiche S**, mais **−15 à −30 PV** de châssis (tirage uniforme entier ; `[MOD-06]`, `[VEH-03]`), casse `[TAG-FRAGILE]`, et **−15 % d'ICC** (caméras de trafic ; `[VEH-03]`, `[MOD-05]`).
* **Échec :** confiscation + saisie de **40 %** du Cash-Puce + **−25 % d'ICC** ; **−35 PV** de châssis et **−15 PV** de Santé (`[MOD-06]`) ; explosions `[TAG-FLAMMABLE]` ; garde à vue de **1 jour**.
* Avant validation, l'app affiche la chance et le pire scénario : *« Aeterna estime vos chances de survie fiscale à 35 %. »*

### 4. Éjection / broyage d'urgence — *« Se débarrasser de la cargaison avant le barrage »*
* **Activation :** uniquement au tout début de l'interception, à 300 m du barrage.
* **Mode** (par priorité) : `[MOD-07]` s'il est disponible et autorisé ; sinon `[VEH-04]` ; sinon manuel. Restrictions : `[D5]`, `[D6]`.
* **Mode manuel (décharge dans une ruelle) :** **45 %** de réussite. Succès : soute propre au barrage (0 amende, 0 ICC, 0 temps perdu), toutes les caisses illégales perdues, **−10 PV** de châssis.
* **Échec (tous modes)** — un drone LiDAR filme les caisses : sanction de base avec un taux d'amende **+20 points** + **−10 % d'ICC** + garde à vue de **1 jour**.
* Un succès a lieu **avant** la fouille : il protège de `[T4-06]`.

---

## Garde à vue sensorielle
*Doctrine :* pour le DSC, emprisonner à vie ou exécuter (sauf haute trahison) gaspille de l'empreinte carbone et de la main-d'œuvre. Le détenu passe en caisson blanc aveuglant, hymnes d'Aeterna à 90 décibels et privation de sommeil, puis est remis au volant pour continuer à produire et payer ses dettes.
* **Durée :** fixée par la règle qui la déclenche. **1 jour** = le reste de la phase en cours (jour ou nuit) **et** la journée suivante : le joueur ressort à **20h00 le lendemain**, dans le district de l'interception, véhicule rendu, face au dilemme de 20h00 (chap. 2). Chaque jour supplémentaire décale la sortie de 24h.
* **Santé :** **−15 PV** par routine matinale passée en cellule, jamais en dessous de **1 PV** (Aeterna ne perd pas un contribuable).
* **Avance rapide :** chaque matin passé en cellule exécute la routine matinale. Une échéance de dette franchie s'applique à la sortie ; franchir le Jour 30 à minuit avec une dette = Game Over.
* **Repos :** la garde à vue réinitialise l'épuisement, sans aucun gain de sommeil.
* **Exception mortelle :** `[T4-06]`.
