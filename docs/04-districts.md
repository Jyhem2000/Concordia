# 4. Districts & lieux spéciaux

## Règles géographiques
* **Accès libre dès le Jour 1.** Le joueur ne circule jamais sur les avenues privées des élites : il emprunte le **Réseau Logistique Souterrain** (sas de maintenance et quais de service). Même les ministères et les milliardaires ont besoin que les Livreurs de Catégorie C approvisionnent leurs cuisines, livrent l'eau des domestiques et évacuent leurs déchets — mais les portiques à l'entrée des tunnels y sont impitoyables.
* **Carte :** les districts ne sont pas tous voisins. Un trajet vers un district non voisin passe par les districts intermédiaires : **+1 ration et +5 % de risque par district traversé** (le test d'interception n'a lieu qu'à destination). L'app propose l'itinéraire le plus court.

```
[D4] — [D1] — [D2] — [D5] — [D6]
          \     |     /
           \— [D3] —/
```
  Liaisons : D4–D1, D1–D2, D1–D3, D2–D3, D2–D5, D3–D5, D5–D6. *Ex. :* `[D4]` → `[D6]` traverse `[D1]`, `[D2]` et `[D5]` (+3 rations, +15 %).
* **Pompes :** *officielle* = connectée à Aeterna, **fermée la nuit** si l'ICC est sous 50 % (chap. 2) ; *fixe* = toujours ouverte.
* **Coefficients de marché** (chap. 7) : chaque district applique un coefficient à ses produits de **Production**, aux produits **Neutres** (1.00) et à ceux en **Forte demande** (plus le bonus de tier).

## Tableau de synthèse

| ID | Nom | Échelon | Sécurité | Risque de base | Synthanol | Pompe | Détection spéciale | Drones-Juges | Coef. Production | Coef. Demande |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- | :--- | :---: | :---: | :---: |
| `[D4]` | Rust Valley | 0 | ★★☆☆☆ | 20 % | 80 ₡ | fixe (pirate) | — (zone hors-réseau) | — | 0.75 | 1.40 |
| `[D1]` | Hives | 1 | ★☆☆☆☆ | 10 % | 80 ₡ | officielle | — | — | 0.75 | 1.50 |
| `[D2]` | Pastel-Heights | 2 | ★★☆☆☆ | 20 % | 120 ₡ | officielle | Délation idéologique (`[TAG-CULTURE]`) | — | 0.75 | 1.60 |
| `[D3]` | Panacea | 3 | ★★★☆☆ | 35 % | 150 ₡ | officielle | Bio-scanners (`[TAG-CHEMICAL]`) | — | 0.75 | 1.75 |
| `[D5]` | The Glass Spire | 4 | ★★★★☆ | 40 % | 200 ₡ | officielle | Scanners EM (`[TAG-TECH]`) | ✓ | 0.75 | 1.90 |
| `[D6]` | Olympus-Green | 5 | ★★★★★ | 55 % | 300 ₡ | officielle | Scanners EM (`[TAG-TECH]`) + chiens-robots (`[TAG-ODOROUS]` ×2) | ✓ | 0.85 | 2.30 |

*Échelon :* place dans la pyramide sociale, du pire (0) au meilleur (5). *Sécurité :* le nombre d'étoiles entre dans le bluff, la corruption et le plafond de fuite (chap. 6). *Coef. Demande :* échelonné sur le danger — plus le district est risqué, mieux il paie. Montants en ₡ : valeurs de base, indexées sur l'inflation (chap. 7).

---

## `[D1]` « Hives » — Les Ruches Grises (zone de départ)
* **Échelon 1 — Catégorie C, prolétariat sous camisole.** 60 % de la population. Chaleur étouffante (38 °C), eau tiède rationnée, sédation maximale (`[T0-01]` + `[T0-03]`). Rêve anesthésié de monter en `[D2]`.
* **Ambiance :** tours de béton brutales autour de la Cantine Centrale. Les ouvriers passent leurs soirées hypnotisés par les loteries virtuelles. Le marché noir est toléré comme « soupape de décompression » : un peu de vrai soda ou de saucisson le week-end suffit à empêcher les émeutes de la faim.
* **Sécurité :** caméras bas de gamme souvent en panne, patrouilles humaines de la BRC fatiguées et corruptibles.
* **Production :** `[T0-01]`, `[T0-02]`, `[T1-04]`, `[T1-06]`, `[T2-03]` *(caves des Ruches)*, `[T2-04]` *(ateliers de réparation clandestins)*
* **Forte demande :** `[T1-01]`, `[T1-02]`, `[T1-05]`, `[T2-01]`, `[T2-02]`, `[T2-05]`, `[T2-06]`

### `[LOC-D1-1]` L'Arrière-Salle de Viktor Varga (usurier mafieux)
Boucherie clandestine de Viktor Varga et de ses « Bouchers ».
* **Dette :** remboursement et emprunts (chap. 7, *Dette mafieuse*).
* **Hachoir Industriel** — *« Viktor ne rachète pas, il recycle. »* Rachète les caisses `[TAG-PERISHABLE]` Faisandées ou Avariées au prix de **cours local du produit × coefficient de fraîcheur × 1,2**, dans la limite de **5 caisses par jour**. Le montant est déduit de la dette, ou versé en Cash-Puce si la dette est à 0.

### `[LOC-D1-2]` La Cantine des Chauffeurs (« Chez Borg »)
Bar enfumé réservé aux routiers, où l'on sert l'eau de l'Exemption Métabolique.
* **Exemption Métabolique :** chaque passage de jour remet la protection contre la Sédation au maximum (chap. 2).
* **Synthanol :** **60 ₡** / ration, tarif syndical **fixe** : il n'est **pas indexé** sur l'inflation.
* **Équipage :** recrutement et remplacement de l'équipier actif (chap. 5).

---

## `[D2]` « Pastel-Heights » — L'Éco-Ghetto Bobo & Campus Idéologique
* **Échelon 2 — Catégorie B−, petits soldats idéologiques.** Climatisation modérée (26 °C), gazon synthétique, eau filtrée.
* **Ambiance :** façades pastel, citoyens récemment promus (influenceurs d'État, étudiants zélés, comités de voisinage). Moins drogués que `[D1]`, ils savent d'où ils viennent : leur terreur d'être rétrogradés les pousse à un zèle hystérique : ils dénoncent sans relâche le jour, et s'empiffrent de charcuterie en cachette la nuit.
* **Sécurité :** peu de patrouilles lourdes (agents humains), mais les **Voisins-Vigiles** dénoncent les camions suspects via l'application d'Aeterna pour gagner des points d'ICC.
* **Menace — Délation idéologique :** tout ce qui sent la culture interdite est signalé, la détection de `[TAG-CULTURE]` s'applique ici (chap. 3).
* **Production :** `[T0-01]`, `[T0-04]`, `[T1-02]`, `[T2-06]`, `[T2-07]`, `[T3-05]`, `[T3-07]`
* **Forte demande :** `[T1-03]`, `[T2-02]`, `[T2-03]`, `[T3-01]`, `[T4-04]`

### `[LOC-D2-1]` Le Studio de « Karma-Cham » (influenceuse d'État corrompue)
Icône officielle le jour, mercenaire vénale en coulisses. **Panique Algorithmique sur Commande :**
* **Coût :** **10 000 ₡**, **+5 000 ₡** par utilisation précédente. **Cooldown :** 5 jours.
* **Effet :** le joueur choisit **un** tag ; le soir même, une fausse polémique virale force Aeterna à réagir : le lendemain, tous les produits de ce tag valent **×1.5** dans tous les districts (*bonus d'influence*, chap. 7).
* **Options :** A « Cancel Wave Culturelle » `[TAG-CULTURE]` · B « Rumeur de Pénurie Alimentaire » `[TAG-PERISHABLE]` · C « Scandale Chimique & Pharmaceutique » `[TAG-CHEMICAL]`.

---

## `[D3]` « Panacea » — Le Complexe Pharmaceutique & Médical
* **Échelon 3 — Catégorie B+, caste scientifique & médicale.** Air stérile (22 °C), vraies douches, cafés de synthèse.
* **Ambiance :** immense secteur blanc saturé de javel : laboratoires du DSC, usines de synthèse, centres de quarantaine. C'est ici qu'Aeterna modélise les « variants saisonniers ». Les chercheurs savent ce qu'il y a dans `[T0-01]` et enchaînent des gardes de 60h, terrifiés qu'une baisse d'ICC les renvoie de l'autre côté de la seringue.
* **Sécurité :** portiques de désinfection obligatoires, bio-scanners IA, agents humains.
* **Production :** `[T0-02]`, `[T0-03]`, `[T1-05]`, `[T2-05]`, `[T3-04]`, `[T4-04]`, `[T4-05]`
* **Forte demande :** `[T1-02]`, `[T2-01]`, `[T2-03]`, `[T3-02]`, `[T3-03]`

### `[LOC-D3-1]` La Morgue Arrière (Dr. K.)
| Service | Coût | Cooldown | Effet |
| :--- | :--- | :--- | :--- |
| Laissez-passer sanitaire falsifié | 3 000 ₡ | dure 5 jours | Immunité aux bio-scanners de `[D3]` (annule le malus `[TAG-CHEMICAL]`) et au surcroît de sécurité de `[EVT-G02]` dans ce district. |
| Chirurgie d'urgence | 3 500 ₡ + 10 % du Cash-Puce | 5 jours | **+35 PV** de Santé, sans dépasser **85 PV**. |
| Certificat de décontamination | 4 000 ₡, **+2 000 ₡ par utilisation précédente** | 7 jours | **+10 % d'ICC**. |

---

## `[D4]` « Rust Valley » — La Zone Tampon (friche industrielle & anciens abattoirs)
* **Échelon 0 — l'Angle Mort Toléré.** Bannis, survivalistes et contrebandiers sans puce d'ICC, retranchés dans un ancien bassin industriel fluvial contre le mur-frontière.
* **Pourquoi ne fuient-ils pas ?** L'unique accès à l'extérieur est un canal-écluse hérissé de mines magnétiques et de tourelles autonomes : seuls les chalutiers blindés des cartels, munis des codes vendus par les oligarques de `[D6]`, le franchissent de nuit. Et les barons locaux règnent ici en maîtres grâce au ravitaillement occulte de `[D6]`.
* **Pourquoi le régime les tolère :** c'est l'unique sas d'entrée de la contrebande extérieure. Classée « Décharge à Rendement Négatif » pour qu'Aeterna n'y envoie pas la BRC, la zone n'est accessible qu'aux livreurs de Catégorie C, autorisés à y déverser les déchets de la ville.
* **Portique du sas :** le régime tolère la décharge, mais surveille ce qui en sort. Tout trajet **au départ de `[D4]`** passe un portique de décontamination : **+15 %** au risque d'interception à destination.
* **Ambiance :** mécanos renégats et Bouchers de la Vieille École vivent en seigneurs libres, de petits élevages clandestins, de `[T1-04]` et de prélèvements sur la charcuterie de passage, mais dépendent des livreurs pour les antibiotiques, les nouilles et l'huile de leurs générateurs.
* **Crédits sans puce :** les bannis n'ont pas de puce ; les milices encaissent les ₡ sur des puces mortes qu'elles écoulent ensuite via les livreurs, contre une commission.
* **Zone hors-réseau :** ni caméras, ni BRC. Au calcul du risque, *ce qui dépend d'Aeterna disparaît, ce qui est physique reste* :
  * s'appliquent : risque de base, trajet de nuit, districts traversés, `[EVT-D4-01]`, `[VEH-01]`, `[CREW-01]`, balise de `[T4-06]`, embuscades de la dette (chap. 7) ;
  * valent 0 : suspicion d'ICC, malus de tags, couverture légale et camouflage de `[VEH-02]`, ronde renforcée, Fiche S, pic suspect, malus d'événements visant la BRC.
* **Menace — Racket des milices** (remplace l'interception de la BRC : ni bluff, ni corruption, ni éjection, ni garde à vue). Le joueur choisit :
  * **Payer le péage :** **10 % de la valeur de la soute** (au prix de base), en ₡ **ou** en caisses choisies par les miliciens (`[T1-06]`, `[T3-03]` et `[T3-04]` en priorité).
  * **Forcer :** jet de fuite (chap. 6, mêmes bonus, sacrifices et Sédation). La Fiche S est ignorée : ni malus au jet, ni niveau gagné. Aucune perte d'ICC, dopage `[T2-05]` compris. Succès : passage avec dégâts de châssis et casse comme une fuite. Échec : sanction du refus.
  * **Refuser :** les miliciens pillent **30 % de la soute en commençant par les caisses les plus chères** (`[T4-06]` compris : il finira chez la rébellion), tabassent le joueur (**−20 PV** de Santé) et cabossent le camion (**−25 PV** de châssis).
  * **Modificateur :** `[VEH-04]`.
* **Nuit :** dormir ici = bivouac (chap. 2).
* **Production :** `[T1-01]`, `[T1-03]`, `[T2-01]`, `[T2-02]`, `[T3-01]`, `[T3-02]`, `[T3-03]`, `[T3-06]`, `[T4-01]`, `[T4-02]` — le moteur n'en tire que **6 à 8 par jour**.
* **Forte demande :** `[T1-04]`, `[T1-06]`, `[T2-06]`, `[T2-07]`, `[T3-04]`, `[T3-05]`, `[T4-03]`, `[T4-04]`, `[T4-06]`

### `[LOC-D4-1]` Le Garage « Faraday » (Mécano-Mitch)
Tenu par un ancien ingénieur spatial viré pour avoir refusé de manger des insectes. Seul endroit pour acheter un châssis, acheter des modules et **changer les modules montés** (gratuit, chap. 5), et **réparer le châssis : 40 ₡ par PV manquant** (modificateur : `[EVT-D4-03]`).

### `[LOC-D4-2]` Le Bunker de « Cassandre-88 » (l'informateur sous plomb)
Ancien analyste de données d'Aeterna, terré dans une caravane blindée sous les pylônes haute tension.
* **Prédiction :** révèle quel événement global frappera à J+2 et **garantit** son déclenchement (il remplace le tirage de ce jour-là). Les événements locaux restent imprévisibles.
* **Coût :** `3 000 + 1 500 × utilisations précédentes` ₡ (indexé sur l'inflation) **+ 1 caisse de `[T3-03]`**.
* **Limite :** une seule prédiction active à la fois (jusqu'au jour prédit).

---

## `[D5]` « The Glass Spire » — La Flèche de Verre (ministères, banques & censure)
* **Échelon 4 — Catégorie A, haute bureaucratie sous pression.** Appartements de verre à 20 °C, accès occulte au luxe, zéro sédatif pour garder une productivité maximale.
* **Ambiance :** gratte-ciels où travaillent les bureaucrates du DSC, les superviseurs d'Aeterna et les truqueurs de la Loterie. Totalement lucides mais bloqués par le plafond de verre de `[D6]`, ils survivent sous caféine, nicotine, antidépresseurs et délation entre collègues.
* **Sécurité :** portiques à rayons X, scanners électromagnétiques, douaniers d'élite et Drones-Juges.
* **Menace — Urbanisme panoptique** (LiDAR 360°) : l'éjection manuelle est **interdite** ; seuls `[MOD-07]` ou `[VEH-04]` la permettent.
* **Production :** `[T0-03]`, `[T0-04]`, `[T2-06]` *(saisies de la censure)*, `[T4-03]`, `[T4-06]` *(fuites rares)*
* **Forte demande :** `[T1-02]`, `[T1-05]`, `[T2-04]`, `[T3-02]`, `[T3-03]`, `[T3-06]`, `[T3-07]`, `[T4-02]`, `[T4-04]`

### `[LOC-D5-1]` La Laverie « Crypto-Clean » (banque offshore ministérielle)
Les vrais blanchisseurs ne sont pas les punks de `[D4]` mais les hauts fonctionnaires corrompus du Ministère des Finances, seuls à pouvoir créer des comptes fantômes dans le registre central pour y cacher leurs propres pots-de-vin. Ce sont aussi les superviseurs qui alimentent l'algorithme de la Loterie.
* **Guichet du compte offshore** (chap. 7).
* **Falsifier un dossier** (`[EVT-L01]`) — c'est Aeterna qui tire au sort : on ne choisit pas le gagnant, on glisse un faux dossier pour que l'algorithme le désigne. C'est un pari.
  * **Quand :** la veille d'un tirage (chap. 8).
  * **Coût :** **15 000 ₡, +15 000 ₡ par utilisation précédente** (perdu même en cas d'échec).
  * **Réussite : 60 %** (bonus : `[CREW-02]`).
  * **Succès :** la carte choisie impose **un** des deux rôles (l'autre reste tiré au hasard) ; ses effets durent **3 jours** et remplacent ceux du rôle imposé. Ton équipier est protégé de ce tirage. Le district choisi doit être concerné par la Loterie pour ce rôle (chap. 8).
  * **Échec :** Aeterna détecte l'anomalie et remonte la piste : **−10 % d'ICC** et **+1 niveau de Fiche S**. Le tirage se fait normalement, sans protection. *« Votre contribution à la mobilité sociale a été jugée… trop enthousiaste. »*

| Carte | Rôle imposé | Vérité | Effet |
| :--- | :--- | :--- | :--- |
| Un capitaine de la BRC (district au choix) | Promu | Muté « vers le haut »… puis suicidé : il en savait trop. | **−15 %** de risque dans ce district (une recrue le remplace), au lieu de la purge préventive. |
| Un contrebandier concurrent (district au choix) | Promu | Suicidé, sa clientèle orpheline. | **Quotas de demande ×1.5** dans ce district (cumulable avec `[CREW-03]`). |
| L'indic qui te suit | Promu | Envoyé « dans un appartement de rêve ». | **Fiche S remise à 0**, **+5 % d'ICC**. |
| Un cadre (district de départ au choix) | Déclassé | Dénoncé par toi, renvoyé un étage plus bas. | Tu choisis **le vice qu'il emporte** : le produit qui passe en Forte demande en dessous. |

  *En cas de succès : « Merci pour votre contribution à la mobilité sociale. »*

---

## `[D6]` « Olympus-Green » — La Citadelle Zéro-Carbone des Ultra-Élites
* **Échelon 5 — Catégorie S, l'oligarchie intouchable.** Moins de 1 % de la population, 100 % du pouvoir. Verrière climatisée à 21 °C en surpression, comme une salle blanche.
* **Ambiance :** colline verdoyante sur une dalle d'architecte au-dessus des échangeurs, où règnent les Hauts-Commissaires du DSC et les propriétaires d'Aeterna. Ils imposent la sobriété au peuple en s'offrant banquets de viande et clonage organique. Hors-loterie : tout oligarque jugé déviant est « suicidé » en coulisses.
* **Sécurité :** scanners électromagnétiques, détecteurs biométriques d'ICC, douaniers d'élite et Drones-Juges.
* **Menace — Chiens-robots militaires :** les malus de `[TAG-ODOROUS]` sont **×2**.
* **Menace — Dalle bio-scellée** (grilles laser, capteurs sismiques) : l'éjection est **impossible**, même avec `[MOD-07]` — **sauf** via `[VEH-04]`.
* **Production** *(réserves VIP, stocks très restreints)* : `[T4-03]`, `[T4-04]`
* **Forte demande** *(« vente jackpot »)* : `[T1-03]`, `[T2-07]`, `[T3-01]`, `[T3-02]`, `[T3-03]`, `[T3-07]`, `[T4-01]`, `[T4-02]`, `[T4-05]`, `[T4-06]`

### `[LOC-D6-1]` Le « Velvet-Silo » (cabaret sensoriel & sous-sol de débauche)
Lupanar clandestin et bar à oxygène caché dans les galeries de climatisation sous les villas, accessible par les quais de service. Ouvert de jour seulement : les oligarques festoient en journée climatisée, la nuit appartient aux purges.

| Service | Cooldown | Coût | Effet |
| :--- | :--- | :--- | :--- |
| Vente aux enchères masquée | 3 jours | — | Vendre **1 caisse** de Tier 3 ou 4 au **double du cours local**. |
| Chantage sur l'oreiller | 4 jours | 8 000 ₡ **+4 000 ₡ par utilisation précédente**, ou des caisses de `[T3-07]` / `[T3-02]` dont la valeur totale couvre ce montant (paiement en nature, chap. 7) | **+12 % d'ICC** (vidéos compromettantes de juges). Les juges finissent par se méfier. |
| Commande spéciale VIP | 3 jours après résolution (1 contrat actif max) | — | Livrer **3 caisses** d'un produit précis de Tier 2 ou 3 (absent de la soute à l'offre) avant le lendemain 20h00, racheté **×3.5** du cours local. **Échec :** **−10 % d'ICC** et lieu verrouillé **5 jours**. |

* **Enchères & Commande VIP :** le ×2 / ×3.5 s'applique au cours local ; la commission de puce (×0,90) est prélevée, mais ces ventes sont **hors quota** (elles ne consomment pas la demande et ne déclenchent pas de pic suspect).
