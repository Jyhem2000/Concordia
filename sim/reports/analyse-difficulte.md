# Analyse — leviers de difficulté et refonte des véhicules

Campagnes Contrôle, 1 à 4 et des modes, rejouées après :
- la refonte des véhicules : le Fourgon Bio-Médical est immunisé à la canicule, la Navette passe à 3 emplacements, le Bunker à 40 places, et l'assistance de conduite remplace le caisson cryo ;
- la refonte des tags : Inflammable et Diurne retirés, Périssable devenu « Au frais », Chimique devenu Bio-signature ;
- les trois leviers de difficulté : itinéraire repéré, notoriété, modes de difficulté (chap. 1 et 5).

Référence : les mêmes campagnes juste avant les leviers, avec le Fourgon « Panacea-V8 » déjà donné au plan Fuite au sommet.

## Piège de mesure corrigé : le plan Fuite au sommet
Le plan n'avait pas de véhicule. Sur la fourgonnette de départ, à un seul emplacement, le bot montait le pare-buffles et laissait le brouilleur, puis l'assistance, au garage : leurs retraits ne mesuraient que leur prix (assistance à −12 600 ₡). Le plan roule désormais en Fourgon « Panacea-V8 » (3 emplacements, transpondeur en `[D3]` et `[D5]`) : la fin Fantôme remonte de 75 à 79 % de survie avant les leviers.

## Calibrage des leviers (campagne des modes)
Premier passage : un passage répété coûtait déjà du risque, et le Hors-la-loi n'avait aucune avance de survie.
- **Contrebandier :** le Prudent tombait de 93 à 86 % de survie, sous l'Équilibré. Il refait ses routes les plus sûres, et l'itinéraire repéré le punissait. **Correction :** le premier passage répété est toléré, un aller-retour ne coûte rien.
- **Hors-la-loi :** l'Équilibré survivait à 57 % (score médian quasi nul), le Novice à 54 %. Sans avance, le premier barrage raté devenait fatal (l'avance vaut +12 à +14 points de survie). **Correction :** une avance réduite (1 000 ₡).

Après calibrage, survie par mode :

| Mode | Novice | Prudent | Équilibré | Casse-cou |
| :--- | ---: | ---: | ---: | ---: |
| Citoyen | 90 % | 95 % | 90 % | 85 % |
| Contrebandier | 83 % | 93 % | 86 % | 79 % |
| Hors-la-loi | 66 % | 79 % | 72 % | 70 % |

L'ordre des tempéraments tient dans chaque mode. Le Novice reste au-dessus de 80 % en Contrebandier (84 % avant les leviers).

## Effet des leviers en mode Contrebandier
- **Campagne 1 :** survie inchangée en moyenne sur les 36 combinaisons (−0,2 point), score −3,4 % en moyenne. Les profils qui bouclent ou s'enrichissent perdent 5 à 15 % : Électronique (score moyen −6 à −14 % selon le tempérament), Haut tier Équilibré (−12 %, survie 87 → 83 %), Fuite au sommet. Le Citoyen modèle gagne un peu : au palier Or, sa notoriété est divisée par deux.
- **Campagne 3 (1 000 graines) :** survie identique, scores −3 à −8 %, surtout pour les plans qui gagnent gros (Haut tier Casse-cou −7 %, Couverture légale −7 %).
- **Campagne 2 :** la fin Résident recule (7 → 3 % pour le Fantôme). Les injections imposent des tournées de nuit répétées, que l'itinéraire repéré surveille. Elle reste atteignable, mais c'est la fin la plus touchée.
- **Lecture :** les leviers déplacent la difficulté vers la deuxième moitié de partie, sur le score et sans tuer. La vraie difficulté se règle par le mode.

## Campagne 4 : ce qui change
- **`[VEH-03]` positif** (+14 300 ₡ ± 7 100), alors qu'il était neutre avant la refonte : la chaîne du froid et l'immunité à la canicule, réunies sur le châssis, valent leur prix.
- **`[VEH-04]` reste positif** avec 40 places (+49 700 ₡).
- **`[MOD-01]`, l'assistance de conduite, est neutre** (−200 ₡ ± 12 700), même montée. Le plafond de fuite absorbe son bonus : 35 % de base, +40 % pour le pare-buffles et +20 % pour Glitch atteignent déjà le plafond (95 %, moins dans les districts très gardés). Elle ne sert qu'à un build de fuite sans pare-buffles, ou à un chauffeur à bout. **À revoir :** lui donner un effet que le plafond n'écrase pas.
- **`[VEH-02]` devient neutre en score** (+1 500 ₡ ± 10 900, contre +12 800 au dernier commit). Ses 3 emplacements ne servent pas au plan Couverture légale, qui n'achète qu'un module.
- Le reste ne bouge pas au-delà du bruit. L'avance de survie (+12 points) et la dilution en Tier 0 (+6 points) restent les premiers filets.

## Limites des bots (comblées depuis, voir l'analyse des bots experts)
- Ils ne se dopaient jamais au Tcherno-Bull.
- Ils ne couvraient leur soute qu'avec des briques : le masquage de la Tech par l'eau, de la Bio-signature par les antidépresseurs et de la Culture par les manuels n'était pas joué.

## Correction après analyse (non remesurée)
- **Pare-buffles `[MOD-06]` : bonus de fuite divisé par deux** (+40 → +20 %), égal à celui de l'assistance. Les dégâts divisés et le bonus au passage forcé ne changent pas.
- **Calcul :** build de fuite complet, Fiche S niveau 1, district à 2 étoiles : 35 % de base, +20 % de pare-buffles, +20 % de Glitch et −10 % de Fiche S donnent 65 %, sous le plafond de 90 %. L'assistance y ajoute ses 20 % en entier (85 %) ; dans le district le mieux gardé (plafond 75 %), seulement 10 points.
- **À vérifier à la prochaine campagne :** l'assistance et le brouilleur devraient devenir mesurables dans la Fuite au sommet. Le pare-buffles perd de son poids dans la Nuit festive, où il était déjà neutre en score.

## Bots experts : dopage et couverture
Les bots se dopent désormais au barrage quand ils ont du `[T2-05]` (caisse, choc de châssis et ICC comptés), et couvrent leur soute avec le Tier 0 qui masque le tag le plus présent (eau pour la Tech, antidépresseurs pour la Bio-signature, manuels pour la Culture), la brique quand il n'y a rien à masquer. Toutes les campagnes sont rejouées, avec le pare-buffles à +20 %.

- **La couverture est une vraie compétence.** Dilution en Tier 0 : +26 100 ₡ et **+9 points de survie** (+2 points avec les seules briques). Couverture légale +7 à +21 % de score, Citoyen modèle +11 à +22 % ; campagne 3 : Couverture légale de 87 à 90 % de survie, +8 % de score.
- **Des verdicts changent avec elle :** `[VEH-02]` positif (+22 700 ₡, neutre avant), `[MOD-02]` positif (+13 600 ₡), `[MOD-04]` et `[CREW-03]` positifs.
- **Le dopage est neutre** (Fuite au sommet Casse-cou, +5 000 ₡ ± 9 300, joué dans 24 % des parties) : un appoint, ni piège ni passage obligé.
- **Le pare-buffles à +20 %** coûte aux plans qui fuient : Fuite au sommet −7 à −16 %, Haut tier et Saboteur Casse-cou autour de −10 %. En échange, **l'assistance de conduite** n'est plus écrasée par le plafond : +13 300 ₡ ± 14 200 (−200 ₡ avant), positive sans être encore significative.
- **Le Novice et les modes ne bougent pas** : le Novice ne se dope pas, le Sans build ne se couvre pas.

**Restent neutres :** `[MOD-03]`, `[MOD-05]`, `[MOD-06]` (piège d'emplacement de la Nuit festive), `[MOD-07]`, `[MOD-09]` (tendance négative), `[CREW-02]`, Karma-Cham, les trois services de la Morgue et les deux du Velvet-Silo.

## Simplifications : chantage retiré, quatre modules renforcés
Chantage du Velvet-Silo retiré ; doublure Faraday `[MOD-03]` sans aucun contrôle volant ; plaque rotative `[MOD-05]` à chaque fuite ; trappe `[MOD-07]` sans recharge ; brouilleur `[MOD-09]` saisi sans garde à vue.

- **Plans qui en profitent (campagne 1) :** Haut tier +9 % de score en Équilibré et Casse-cou (trappe), Saboteur Casse-cou +16 % et Électronique +5 % (doublure), Fuite au sommet +2 à +5 %. Le Citoyen modèle perd 2 à 3 % sans le chantage ; la fin Élite recule un peu (Couverture légale 7 → 4 %, Rentier 3 → 1 %), ce qui la garde rare.
- **Campagne 4 : aucun des quatre modules ne devient significatif.** `[MOD-03]` −4 600 ₡ (−5 500 avant), `[MOD-07]` +2 400 ₡ (+1 200), `[MOD-09]` −12 500 ₡ (−17 100), tous dans le bruit.
- **La plaque rotative ne change pas du tout** (mêmes chiffres au ₡ près) : deux fuites réussies le même jour n'arrivent presque jamais, « une fois par jour » et « à chaque fuite » reviennent au même. Son renforcement est sans effet ; il faut chercher ailleurs (par exemple effacer aussi la perte de châssis, ou un niveau de Fiche S déjà acquis).
- **Lecture :** ces modules apportent peu face à l'écart entre graines (intervalles de ±6 000 à ±17 000 ₡). Ils servent des builds précis sans peser sur la moyenne : à décider s'ils restent comme options de niche ou doivent être fusionnés.

## Modules recentrés : contre-surveillance, plaque anti-caméras, complices fiables
Le brouilleur de drones est fondu dans la doublure `[MOD-03]` (Tech non détectée, plus de contrôle volant, désormais adaptable) ; la plaque rotative `[MOD-05]` rend aussi les tournées de nuit hors mission invisibles aux caméras (pas de Fiche S) ; les complices de la trappe `[MOD-07]` rapportent de la moitié à la totalité des caisses larguées. Neuf modules au lieu de dix.

- **Piège de mesure, encore :** le plan de test de la plaque (Nuit festive + plaque) roulait en fourgonnette de départ, à un emplacement ; la plaque, achetée en troisième, restait au garage. Il roule désormais en Fourgon « Panacea-V8 ».
- **`[MOD-05]` devient positif** : +30 300 ₡ ± 22 500 (neutre jusque-là). Ne plus être filmé la nuit fait de la plaque le module des tournées hors mission.
- **`[MOD-07]`** : +3 300 ₡ ± 6 000 (+2 400 avant), dans le bruit ; Haut tier +3 à +4 % en campagne 1, Haut tier Casse-cou +5 % en campagne 3.
- **`[MOD-03]` reste neutre** dans ses deux plans de mesure (Électronique −4 600 ₡, Fuite au sommet −9 200 ₡ ± 19 100). La Fuite au sommet y gagne pourtant par rapport au brouilleur (+23 % de score en Équilibré, survie Fantôme 68 → 73 %) : le brouilleur lui coûtait plus que la doublure ne rapporte. Effet réel mais sous le bruit.
