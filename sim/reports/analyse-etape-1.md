# Analyse — étape 1 des simulations

Rapports bruts : [controle.md](controle.md) (200 parties par bot) et [plans.md](plans.md) (100 parties par bot, 8 plans × 3 tempéraments). Mêmes graines pour tous les bots. Bots : marchand de `sim/bots/trader.ts`, réglages dans `sim/plans.ts`.

## Robustesse
* **Aucun bug moteur trouvé** : ni invariant violé, ni blocage, ni action refusée, y compris pour l'Aléatoire (400 parties).
* Les défauts trouvés en route étaient ceux des bots (remboursement total au Jour 1, boucle achat-revente sur place, pompe fermée la nuit, limite du Hachoir, boucle avance-remboursement en fin de partie), tous corrigés.

## Ce que disent les chiffres
1. **La partie se joue en 5 jours.** La survie (audit passé) suit presque exactement la part des parties où la dette initiale est soldée, au Jour 5 en médiane. Une dette non soldée à ce moment n'est presque jamais rattrapée : à 10 % par jour (20 % une fois en retard, Jour 20), elle dépasse vite tout ce qu'un trajet rapporte. Une saisie dans les premiers jours vaut donc un Game Over différé. Le critère « la fin de partie reste tendue » (campagne 2) n'est pas tenu : l'issue est scellée bien avant.
2. **Les barrages sont très fréquents** : 20 à 37 % des trajets sont interceptés selon le tempérament, même à soute légère. Le risque d'un trajet vide va de 18 % (Pastel-Heights, Rust Valley) à 53 % (Olympus-Green). Chaque saisie efface la marchandise illégale : l'espérance d'un trajet reste mince.
3. **Le Novice survit 41 % du temps** (cible : la majorité). Le tempérament prudent survit encore moins (20 à 32 %) : en refusant les trajets risqués, il ne gagne pas assez vite pour la dette.
4. **Les survivants finissent pauvres** : score médian des survivants de quelques centaines à quelques milliers de ₡, alors que le 90e centile atteint 35 000 à 65 000 ₡. Le hasard (saisies) pèse plus que le plan : le critère de la campagne 3 sera difficile à tenir.
5. **L'équipement cher est hors de portée** : véhicules achetés dans 2 à 30 % des parties, le compacteur dans 2 %. Les plans qui en dépendent (Haut tier, Chaîne du froid) ne se distinguent pas du plan Sans build.
6. **Couverture légale, tempérament équilibré, est le meilleur plan** (70 % de survie) : la dilution en Tier 0 réduit à la fois le risque et la perte en cas de saisie.

## Sensibilité mesurée (200 parties, mêmes graines)
| Réglage testé | Novice | Sans build prudent | Sans build équilibré | Couverture légale équilibré |
| :--- | ---: | ---: | ---: | ---: |
| Référence | 41 % | 20 % | 55 % | 66 % |
| Risque de base des districts ×0,6 | 55 % | 51 % | 60 % | 74 % |
| Intérêts de la dette 5 %/j (au lieu de 10 %) | 50 % | 28 % | 60 % | 75 % |
| Les deux | 63 % | 60 % | 66 % | 75 % |

(Taux de survie. Les données ont été remises à l'identique après chaque essai.)

## Propositions à trancher avant l'étape 2
* **Dette :** baisser le taux quotidien (5 % plutôt que 10 %) et garder le retard (Jour 20) comme vraie menace : la dette reste le moteur de la tension sans sceller la partie au Jour 5.
* **Risque :** baisser le risque de base des districts (environ ×0,6) ; les malus de cargaison (tags, haut tier, nuit hors mission) suffisent à faire payer les cargaisons dangereuses.
* **Équipement :** revoir le prix des véhicules après ces deux changements (mesure à refaire : ils sont aujourd'hui hors de portée).
* **Bots :** le marchand reste une heuristique ; un meilleur bot (étape 4, optimiseur) pourrait gagner plus. Les écarts relatifs entre réglages sont plus fiables que les valeurs absolues.

---

## Second passage — réglages appliqués
Changements : intérêts de la dette **10 % → 5 % par jour** (le retard du Jour 20 reste à 20 %), **risque de base des districts ×0,6** (et le risque de base imposé par l'audit du Comité de Pureté, `[EVT-D5-02]`, dans la même proportion). Rapports : [controle.md](controle.md), [plans.md](plans.md).

| Bot | Survie avant | Survie après |
| :--- | ---: | ---: |
| Novice | 41 % | **63 %** |
| Sans build (prudent / équilibré / casse-cou) | 25 / 56 / 44 % | **58 / 63 / 61 %** |
| Couverture légale (prudent / équilibré / casse-cou) | 32 / 70 / 53 % | **71 / 79 / 62 %** |
| Pire plan, meilleur plan (équilibré) | 50 / 70 % | **62 / 79 %** |

* **Critère du contrôle tenu** : le Novice atteint l'audit sans dette dans la majorité des parties. L'Aléatoire reste sans défaut.
* **Le prudent est redevenu jouable** (53 à 71 % de survie selon le plan, au lieu de 24 à 32 %).
* **Interceptions** : 16 à 18 % des trajets en prudent, 23 à 27 % en équilibré, 30 à 33 % en casse-cou. Le reste du risque vient de la cargaison (tags, haut tier), du portique de Rust Valley et de la nuit hors mission, comme voulu.
* **Le casse-cou est une loterie** : 90e centile de 140 000 à 260 000 ₡, mais score médian des survivants de 100 à 500 ₡. Ils soldent la dette puis perdent tout en saisies. Le critère « casse-cou plus dispersé » est tenu ; « plus de Game Over que le prudent » ne l'est pas (37 à 46 % contre 29 à 47 %) : à revoir quand le bot jouera mieux la fin de partie.
* **Le hasard pèse lourd** : même plan, mêmes réglages, du score nul au jackpot selon la graine (campagne 3 à mener).

### Prix des véhicules : mesuré, pas changé
Avec des véhicules ×0,6, le marchand les achète plus souvent (navette 53 → 73 %, compacteur 18 → 25 % en casse-cou), sans gain net de survie ni de score médian : une soute plus grande expose aussi plus de marchandise aux saisies. Les prix restent tels quels ; les tests par retrait (campagne 4) diront ce que vaut chaque équipement.

### Signaux pour la suite
* **Chaîne du froid** est le plan le plus faible (score moyen 3 700 à 10 600 ₡ contre 15 400 à 36 800 ₡ pour Sans build) : le salaire de Mama Rosa (1 000 ₡ par jour, indexé) pèse plus que l'affinage ne rapporte. À confirmer en campagne 4 avant de toucher au salaire.
* **Couverture légale** reste le meilleur plan : la dilution en Tier 0 est forte. À surveiller pour qu'elle ne devienne pas la seule bonne réponse.
