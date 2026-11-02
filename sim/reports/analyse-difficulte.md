# Analyse — leviers de difficulté et refonte des véhicules

Campagnes Contrôle, 1 à 4 et des modes, rejouées après :
- la refonte des véhicules : le Fourgon Bio-Médical est immunisé à la canicule, la Navette passe à 3 emplacements, le Bunker à 40 places, et l'assistance de conduite remplace le caisson cryo ;
- la refonte des tags : Inflammable et Diurne retirés, Périssable devenu « Au frais », Chimique devenu Bio-signature ;
- les trois leviers de difficulté : itinéraire repéré, notoriété, modes de difficulté (chap. 1 et 5).

Référence : les mêmes campagnes juste avant les leviers, avec la Panacea déjà donnée au plan Fuite au sommet.

## Piège de mesure corrigé : le plan Fuite au sommet
Le plan n'avait pas de véhicule. Sur la fourgonnette de départ, à un seul emplacement, le bot montait le pare-buffles et laissait le brouilleur, puis l'assistance, au garage : leurs retraits ne mesuraient que leur prix (assistance à −12 600 ₡). Le plan roule désormais en Panacea (3 emplacements, transpondeur en `[D3]` et `[D5]`) : la fin Fantôme remonte de 75 à 79 % de survie avant les leviers.

## Calibrage des leviers (campagne des modes)
Premier passage : un passage répété coûtait déjà du risque, et le Hors-la-loi n'avait aucune avance de survie.
- **Passeur :** le Prudent tombait de 93 à 86 % de survie, sous l'Équilibré. Il refait ses routes les plus sûres, et l'itinéraire repéré le punissait. **Correction :** le premier passage répété est toléré, un aller-retour ne coûte rien.
- **Hors-la-loi :** l'Équilibré survivait à 57 % (score médian quasi nul), le Novice à 54 %. Sans avance, le premier barrage raté devenait fatal (l'avance vaut +12 à +14 points de survie). **Correction :** une avance réduite (1 000 ₡).

Après calibrage, survie par mode :

| Mode | Novice | Prudent | Équilibré | Casse-cou |
| :--- | ---: | ---: | ---: | ---: |
| Citoyen | 90 % | 95 % | 90 % | 85 % |
| Passeur | 83 % | 93 % | 86 % | 79 % |
| Hors-la-loi | 66 % | 79 % | 72 % | 70 % |

L'ordre des tempéraments tient dans chaque mode. Le Novice reste au-dessus de 80 % en Passeur (84 % avant les leviers).

## Effet des leviers en mode Passeur
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

## Limites des bots, toujours ouvertes
- Ils ne se dopent jamais au Tcherno-Bull.
- Ils ne couvrent leur soute qu'avec des briques : le masquage de la Tech par l'eau, de la Bio-signature par les antidépresseurs et de la Culture par les manuels n'est pas joué.

## Correction après analyse (non remesurée)
- **Pare-buffles `[MOD-06]` : bonus de fuite divisé par deux** (+40 → +20 %), égal à celui de l'assistance. Les dégâts divisés et le bonus au passage forcé ne changent pas.
- **Calcul :** build de fuite complet, Fiche S niveau 1, district à 2 étoiles : 35 % de base, +20 % de pare-buffles, +20 % de Glitch et −10 % de Fiche S donnent 65 %, sous le plafond de 90 %. L'assistance y ajoute ses 20 % en entier (85 %) ; dans le district le mieux gardé (plafond 75 %), seulement 10 points.
- **À vérifier à la prochaine campagne :** l'assistance et le brouilleur devraient devenir mesurables dans la Fuite au sommet. Le pare-buffles perd de son poids dans la Nuit festive, où il était déjà neutre en score.
