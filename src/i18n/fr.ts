import type { ActionError } from '../engine/actions.ts'
import type { RuleSource } from '../engine/breakdown.ts'
import type { CrewId, DistrictId, EndingId, EventId, LocationId, ModuleId, ProductId, TagId, Tier, VehicleId } from '../engine/types.ts'

/*
 * Catalogue de référence : tous les textes du jeu, en français.
 * C'est le seul fichier à traduire : en.ts devra avoir exactement la même forme
 * (`satisfies Messages`), le compilateur signalera toute clé manquante.
 *
 * Les entrées des données de jeu sont indexées par leur ID (docs, règle n°2) ;
 * les `satisfies Record<…Id, …>` garantissent qu'aucun ID n'est oublié.
 * Un texte variable est une fonction : chaque langue gère ses accords et l'ordre des mots.
 */

// Construite par code : un caractère insécable littéral serait invisible dans le source
const NBSP = String.fromCharCode(0xa0)

type Named = { name: string }
type NamedWithSubtitle = Named & { subtitle: string }

export const fr = {
  /** Balise de langue BCP 47 pour Intl (séparateurs, décimales, pourcentages) */
  intlLocale: 'fr-FR',

  app: {
    title: 'Concordia',
  },

  format: {
    /** `amount` est déjà formaté selon la langue ; espace insécable avant le symbole */
    credits: (amount: string) => `${amount}${NBSP}₡`,
    multiplier: (factor: string) => `×${factor}`,
    day: (day: number, total: number) => `Jour ${day} / ${total}`,
  },

  phase: {
    day: 'Jour',
    night: 'Nuit',
  },

  gauge: {
    cash: 'Cash-Puce',
    offshore: 'Compte offshore',
    debt: 'Dette',
    icc: 'ICC',
    health: 'Santé',
    chassis: 'Châssis',
    fuel: 'Synthanol',
  },

  /** Paliers de crédit social (chap. 2) */
  iccTier: {
    gold: 'Citoyen Or',
    ordinary: 'Citoyen ordinaire',
    probation: 'Citoyen sous réserve',
    deviant: 'Déviant notoire',
  },

  /** Libellés des lignes de Breakdown sans ID de donnée (`rule.*`) */
  rule: {
    'rule.clamp': 'Plafond',
    'rule.round': 'Arrondi',
    'rule.inflation': 'Inflation du jour',
    'rule.production': 'Production locale',
    'rule.strong-demand': 'Forte demande',
    'rule.tier-bonus': 'Bonus de tier',
    'rule.noise': 'Fluctuation du jour',
    'rule.quote': 'Cours du jour',
    'rule.commission': 'Commission de puce',
    'rule.saturation': 'Marché saturé',
    'rule.know-how': 'Savoir-faire',
    'rule.night-festive': 'Nuit festive',
    'rule.night-diurnal': 'Nuit (clients endormis)',
    'rule.diminishing-returns': 'Rendements décroissants',
    'rule.anti-arbitrage': 'Pas de voyage, pas de bonus',
    'rule.debt-balance': 'Solde de la veille',
    'rule.debt-rate': 'Intérêts du jour',
    'rule.debt-late-rate': 'Intérêts majorés (retard)',
    'rule.cash': 'Cash-Puce',
    'rule.cargo-value': 'Soute (prix de base)',
    'rule.protection': 'Part de Viktor',
    'rule.offshore-tranche-1': '1re tranche',
    'rule.offshore-tranche-2': '2e tranche',
    'rule.offshore-tranche-3': '3e tranche',
    'rule.deposit': 'Dépôt',
    'rule.laundry-fee': 'Commission de la Laverie',
    'rule.suspicion': 'Suspicion (ICC)',
    'rule.suspicious-peak': 'Pic suspect de la veille',
    'rule.night-trip': 'Trajet de nuit',
    'rule.crossed-districts': 'Districts traversés',
    'rule.exit-gate': 'Portique du sas',
    'rule.ambush': 'Embuscades de la dette',
    'rule.patrol': 'Ronde renforcée',
    'rule.wanted': 'Fiche S',
    'rule.gold-fast-lane': 'Coupe-file Citoyen Or',
    'rule.icc-scanners': 'Détecteurs biométriques (Déviant notoire)',
    'rule.bluff-base': 'Bluff : chance de base',
    'rule.tier0-share': 'Part de Tier 0',
    'rule.masked-crates': 'Caisses masquées',
    'rule.security-stars': 'Étoiles de sécurité',
    'rule.bribe-rate': 'Tarif standard (étoiles)',
    'rule.bribe-cargo-share': 'Tarif standard (caisses illégales)',
    'rule.bribe-base': 'Corruption : chance de base',
    'rule.offer': "Valeur de l'offre",
    'rule.connivance': 'Connivence',
    'rule.freshness-extra': 'Extra-Frais',
    'rule.freshness-standard': 'Fraîcheur standard',
    'rule.freshness-gamey': 'Faisandé',
    'rule.freshness-spoiled': 'Avarié',
    'rule.damaged': 'Caisse endommagée',
    'rule.grinder-premium': 'Prime du Hachoir',
    'rule.bluff-failed': 'Bluff raté',
    'rule.drone-judges': 'Drones-Juges (incorruptibles)',
    'rule.flee-base': 'Fuite : chance de base',
    'rule.flee-cap': 'Plafond de fuite',
    'rule.eject-manual': 'Éjection manuelle',
    'rule.emergency-tow': "Dépannage d'urgence",
  } satisfies Record<RuleSource, string>,

  // ─── Interface ───

  hud: {
    cargo: 'Soute',
    newGame: 'Nouvelle partie',
    newGameConfirm: 'Abandonner la partie en cours et recommencer au Jour 1 ?',
    offshoreRate: (rate: string) => `${rate}/j`,
    wanted: (level: number, max: number) => `Fiche S ${level}/${max}`,
    debtLate: 'en retard',
    nextBeating: (day: number) => `échéance J${day}`,
    nextProtection: (day: number, amount: string) => `Collecte de Viktor J${day} : ≈ ${amount}`,
    countdown: 'Audit le Jour 30 à minuit : dernier remboursement et dernier dépôt offshore possibles le J30 avant 20h00.',
  },

  ticker: {
    label: 'Flash Info Aeterna',
    index: (index: string) => `Indice d'inflation du jour ${index}`,
    sinceYesterday: (change: string) => `(${change} depuis hier)`,
    messages: [
      'Aeterna rappelle que la sobriété est la plus belle des libertés.',
      "Votre consommation d'eau a été jugée exemplaire. Presque.",
      'Le Comité de Pureté remercie les citoyens qui signalent leurs voisins.',
      "La canicule est une opinion. L'algorithme, lui, est un fait.",
      'Un Citoyen-Livreur sourit, un Citoyen-Livreur produit.',
      'Les prix montent pour votre sécurité. Merci de votre compréhension.',
      'Rappel : toute émotion non déclarée est soumise à cotisation.',
      'Le couvre-feu sanitaire protège ceux qui dorment. Dormez.',
    ],
  },

  inflation: {
    title: "Indice d'inflation algorithmique",
    rule: (period: number) =>
      `Indice du jour = 1 + (jour − 1) / ${period} : il monte chaque matin, de la même hauteur. Les montants de base (valeurs du Jour 1) sont multipliés par l'indice.`,
    readout: (day: number, index: string) => `Jour ${day} : ${index}`,
    projected: '(projection)',
    chartLabel: (index: string, day: number) => `Indice d'inflation : ${index} au Jour ${day}, en hausse linéaire jusqu'au Jour 30.`,
    dayTick: (day: number) => `J${day}`,
    indexed:
      "Indexés : carburant, réparations, dépannage, salaires et frais d'équipage, services des lieux spéciaux, part fixe du tarif de corruption, aléas routiers.",
    notIndexed: 'Non indexés : prix des produits, véhicules, modules, dette et emprunts, seuils de fin, tarif syndical de la Cantine.',
  },

  briefing: {
    title: (day: number) => `Briefing de 06h00 — Jour ${day}`,
    dismiss: 'Compris',
    sleep: (icc: string, health: number) => `Nuit au relais : ICC ${icc}, Santé +${health}`,
    custody: (health: number) => `Nuit en caisson blanc, hymnes à 90 décibels : −${health} PV.`,
    rotten: (crates: number) => `${crates} caisse${crates > 1 ? 's' : ''} pourrie${crates > 1 ? 's' : ''}, détruite${crates > 1 ? 's' : ''} à 06h00.`,
    debtInterest: 'Dette après intérêts',
    beating: (health: number) => `Les Bouchers de Viktor sont passés : −${health} PV.`,
    debtLate: "Dette initiale jamais soldée : taux majoré et embuscades jusqu'à la fin de la partie.",
    protection: 'Collecte de protection',
    protectionToDebt: (amount: string) => `Cash-Puce insuffisant : ${amount} ajoutés à la dette.`,
    offshoreInterest: 'Intérêts offshore',
  },

  place: {
    closedAtNight: 'Fermé : ouvert de 06h00 à 20h00.',
    amount: 'Montant',
    max: 'MAX',
    debtTitle: 'Dette',
    repay: 'Rembourser',
    borrow: 'Emprunter',
    borrowLocked: "L'emprunt tactique s'ouvre une fois la dette initiale soldée.",
    loanRoom: (amount: string) => `Encore ${amount} empruntables`,
    offshoreTitle: 'Compte offshore',
    deposit: 'Déposer',
    withdraw: 'Retirer',
    credited: 'Crédité',
    balance: (deposited: string, interest: string) => `dont dépôts ${deposited}, intérêts ${interest}`,
    rate: 'Taux du jour',
    nextInterest: (amount: string) => `+${amount} demain matin`,
    grinderTitle: 'Hachoir industriel',
    grinderRule: (limit: number, left: number) =>
      `Viktor rachète les périssables Faisandés ou Avariés, ${limit} caisses par jour (reste ${left}). Le montant rembourse la dette, le surplus va au Cash-Puce.`,
    grinderNothing: "Rien à recycler aujourd'hui.",
    grind: 'Recycler',
    grinderOffer: (qty: number, product: string) => `${qty} × ${product}, par caisse :`,
  },

  objectives: {
    title: 'Objectifs du Jour 30',
    score: 'Score (compte offshore)',
    threshold: (amount: string) => `≥ ${amount}`,
    goldStatus: 'Statut Citoyen Or',
    met: 'Atteint :',
    unmet: 'Pas encore :',
    inCargo: (product: string) => `${product} en soute`,
    atMidnight: (district: string) => `Être à ${district} à minuit`,
  },

  breakdown: {
    total: 'Total',
  },

  market: {
    title: 'Marché noir',
    streetOnly: 'Passé 20h00 : seul le marché de rue est ouvert.',
    quote: 'Cours',
    stock: 'Stock',
    owned: 'En soute',
    demand: 'Demande',
    sale: 'Vente nette',
    notInShop: 'Hors boutique',
    unlimited: 'Illimitée',
    demandLeft: (left: number, refill: number) => (refill > 0 ? `${left} (+${refill} demain)` : `${left}`),
    saturated: (qty: number) => `dont ${qty} à prix saturé`,
    averageCost: (cost: string) => `acheté ${cost}/u`,
    condition: 'État',
    freshness: { extra: 'Extra-Frais', standard: 'Standard', gamey: 'Faisandé', spoiled: 'Avarié' },
    damaged: 'abîmée',
    rotsIn: (days: number) => (days <= 1 ? 'pourrit demain matin' : `pourrit dans ${days} jours`),
    use: 'Utiliser',
    iccRestore: (icc: number) => `+${icc} % d'ICC, hors plafond, une seule fois par partie`,
    margin: 'Marge',
    marginUnit: '/u',
    marginAll: (qty: number) => `tout (${qty}) :`,
    buy: 'Acheter',
    sell: 'Vendre',
    max: 'MAX',
    status: {
      production: 'Production locale',
      strong: 'Forte demande',
      neutral: '',
    },
  },

  margin: {
    trend: {
      up: 'Vente rentable',
      flat: 'Marge faible',
      down: 'Vente à perte',
    },
  },

  interception: {
    title: { brc: 'Barrage de la BRC', racket: 'Racket des milices' },
    intro: {
      brc: (district: string) => `Un barrage de la BRC vous arrête à ${district}. Les agents s'approchent de la fourgonnette.`,
      racket: (district: string) => `Les miliciens de ${district} bloquent le passage et réclament leur dû.`,
    },
    odds: (chance: string) => `Aeterna estime vos chances de survie fiscale à ${chance}.`,
    chance: 'Chance',
    moves: {
      search: 'Accepter la fouille',
      bluff: 'Bluff administratif',
      bribe: 'Corruption',
      flee: 'Fuite',
      eject: "Éjection d'urgence",
      payToll: 'Payer le péage',
      payTollInKind: 'Payer en caisses',
      refuseToll: 'Refuser',
    },
    forceThrough: 'Forcer le passage',
    lethal: (product: string) => `La fouille trouvera « ${product} » : exécution sommaire.`,
    formality: (icc: string) => `Soute légale : simple formalité, ICC ${icc}.`,
    sanction: (fine: string, icc: string) => `Confiscation de l'illégal, amende de ${fine} du Cash-Puce, ICC ${icc}.`,
    custody: (days: number) => `Garde à vue : ${days} jour${days > 1 ? 's' : ''}.`,
    bluffSuccess: (icc: string) => `Succès : tout passe, ICC ${icc}.`,
    bluffFailure: (icc: string, fine: string, penalty: string) =>
      `Échec : ICC ${icc}, amende portée à ${fine}, chance de corruption et de fuite ${penalty}.`,
    bribeRate: 'Tarif standard',
    offer: 'Offre',
    offerCash: 'Cash-Puce offert',
    offerCrates: 'Caisses offertes (valeur en paiement : prix de base)',
    offerTotal: (amount: string) => `Valeur totale de l'offre : ${amount}`,
    crateValue: (value: string, cost: string) => `${value}/u en paiement, acheté ${cost}/u`,
    crateGain: (gain: string) => `${gain}/u face au cash`,
    favorite: 'appréciée des agents : connivence',
    addCrate: (product: string) => `Offrir une caisse de plus : ${product}`,
    removeCrate: (product: string) => `Offrir une caisse de moins : ${product}`,
    cancelsSmell: "annule le malus d'odeur",
    bluffAid: (crates: number, product: string, effect: string) => `Donner ${crates} × ${product} à l'agent (${effect})`,
    drop: 'Largage offensif',
    breakageRisk: (tag: string, chance: string, factor: string) =>
      `En cas de succès, chaque caisse ${tag} peut casser (${chance}) : elle se vendra et paiera ${factor}.`,
    explosionRisk: (tag: string, chance: string, chassis: string) =>
      `En cas d'échec, chaque caisse ${tag} non masquée peut exploser (${chance}, châssis ${chassis}).`,
    noDrop: 'Aucun',
    dropOption: (product: string, bonus: string) => `1 × ${product} (${bonus})`,
    dope: (product: string, bonus: string, chassis: number, icc: number) =>
      `Dopage : boire 1 × ${product} (${bonus}, châssis −${chassis}, ICC −${icc} % sauf face aux milices ; une fois par jour)`,
    tollInKind: (crates: string, value: string) => `Les miliciens prendraient : ${crates} (valeur ${value}, sans rendre la monnaie).`,
    bribe: 'Proposer',
    bribeFailure: (fine: string, icc: string) => `Échec : l'offre est perdue, confiscation, amende de ${fine}, ICC ${icc}.`,
    fleeSuccess: (chassis: string, icc: string) => `Succès : la cargaison est sauvée, châssis ${chassis}, ICC ${icc}, +1 niveau de Fiche S.`,
    fleeSuccessRacket: (chassis: string) => `Succès : passage, châssis ${chassis}.`,
    fleeFailure: (seizure: string, icc: string, chassis: string, health: string) =>
      `Échec : confiscation, saisie de ${seizure} du Cash-Puce, ICC ${icc}, châssis ${chassis}, Santé ${health}.`,
    fleeFailureRacket: 'Échec : les miliciens appliquent la sanction du refus.',
    ejectSuccess: (chassis: string) => `Succès : l'illégal finit dans une ruelle, la fouille ne trouve rien. Châssis ${chassis}.`,
    ejectFailure: (raise: string, icc: string) => `Échec : sanction de base, amende +${raise}, ICC ${icc} de plus.`,
    toll: (amount: string) => `Péage : ${amount}.`,
    refuse: (share: string, health: string, chassis: string) =>
      `Pillage de ${share} de la soute (les caisses les plus chères), Santé ${health}, châssis ${chassis}.`,
  },

  report: {
    title: 'Compte rendu du contrôle',
    success: 'réussi',
    failure: 'échoué',
    passed: 'Barrage franchi.',
    ongoing: 'Le contrôle continue.',
    cash: 'Cash-Puce',
    crates: 'Caisses',
    icc: 'ICC',
    health: 'Santé',
    chassis: 'Châssis',
    wanted: 'Fiche S',
    damaged: 'Caisses endommagées',
    exploded: 'Caisses explosées',
    custody: (days: number) => `Garde à vue : ${days} jour${days > 1 ? 's' : ''}, sortie à 20h00.`,
    tow: (bill: string) => `Châssis à 0 : dépannage d'urgence facturé ${bill}.`,
    dismiss: 'Compris',
  },

  travel: {
    title: 'Carte',
    here: 'Vous êtes ici',
    direct: 'Liaison directe',
    via: (names: string) => `Via ${names}`,
    fuel: (rations: number) => `${rations} ration${rations > 1 ? 's' : ''}`,
    go: { day: 'Rouler de jour', night: 'Rouler de nuit' },
    memoryNever: 'Cours jamais observés',
    memoryToday: "Cours vus aujourd'hui",
    memoryDaysAgo: (days: number) => `Cours vus il y a ${days} jour${days > 1 ? 's' : ''}`,
    security: (stars: number) => `Sécurité ${stars} sur 5`,
    risk: "Risque d'interception",
    riskHint: 'La ronde renforcée du jour reste cachée.',
    peak: "Pic suspect : risque accru aujourd'hui",
    lastTrip: 'Dernier trajet',
    wear: (pv: number) => `usure du châssis −${pv}`,
    cooled: (crates: number, product: string) => `moteur refroidi : ${crates} × ${product} consommées`,
    estimateHint: 'Marge estimée sur le cours vu, commission déduite (hors savoir-faire et saturation)',
  },

  evening: {
    fuelTitle: 'Synthanol',
    pricePerRation: (price: string) => `${price} la ration`,
    refuelOne: '+1 ration',
    refuelFull: 'Plein',
    siphon: 'Corvée DSC',
    siphonHint: "Une ration contre de l'ICC et une demi-journée.",
    curfewTitle: '20h00 — couvre-feu sanitaire',
    forceCurfew: 'Forcer le couvre-feu',
    forceCurfewHint: 'Un second trajet, de nuit. Interdit le lendemain.',
    sleepRelay: 'Dormir au relais',
    bivouac: 'Bivouac',
    nightNotice: 'Couvre-feu forcé : 1 trajet de nuit, puis dormir.',
    sleepless: (product: string, health: number) => `Nuit blanche quand même : boire 1 × ${product} (Santé −${health})`,
    cooling: (crates: number, product: string) => `Refroidir le moteur la nuit avec ${crates} × ${product} au lieu d'user le châssis`,
  },

  end: {
    score: 'Score final (compte offshore)',
    gameOver: 'Game Over',
    endings: {
      saboteur: {
        title: "Le Saboteur du Monde d'Avant",
        epilogue:
          "Le chalutier blindé des cartels franchit l'écluse de Rust Valley. Derrière le mur, les preuves inondent le Fil Rose et Concordia s'embrase pendant que tu goûtes un vrai whisky au soleil des îles libres.",
      },
      elite: {
        title: "Nouvel Oligarque d'Olympus-Green",
        epilogue:
          "Le fauteuil d'un Haut-Commissaire purgé t'attendait. Sous la verrière d'Olympus-Green, c'est désormais toi qui commandes de la vraie viande aux petits livreurs.",
      },
      mafia: {
        title: 'Baron de Rust Valley',
        epilogue:
          'Trop grillé pour la haute société, tu rachètes la boucherie de Viktor et les quais de Rust Valley : la contrebande a un nouveau parrain.',
      },
      standard: {
        title: "Survivant du Mois d'Août",
        epilogue:
          'Tu as échappé au hachoir, mais ton pécule ne rachète pas ta liberté. Demain 06h00, septembre commence et tu remontes dans ta fourgonnette…',
      },
      'bio-bricks': {
        title: 'Recyclé en Bio-Briques',
        epilogue: "L'audit tombe, la dette court toujours. Viktor ne rachète pas, il recycle : direction le hachoir.",
      },
      death: {
        title: 'Mort biologique',
        epilogue: "Ton cœur lâche avant ta fourgonnette. Le DSC recycle l'une et l'autre.",
      },
      execution: {
        title: 'Suicidé de 3 balles dans le dos',
        epilogue: 'La fouille a trouvé la balise. Le rapport officiel conclut à un suicide.',
      },
    } satisfies Record<EndingId, { title: string; epilogue: string }>,
  },

  crash: {
    title: 'Panne du terminal de bord',
    body: "Une erreur inattendue a interrompu l'affichage. La sauvegarde est peut-être corrompue : recommencer une partie remet tout d'aplomb.",
    retry: 'Réessayer',
  },

  error: {
    'game-over': 'La partie est terminée.',
    'invalid-quantity': 'Quantité invalide.',
    'not-for-sale': "Ce produit n'est pas en boutique ici.",
    'out-of-stock': 'Stock insuffisant.',
    'cargo-full': 'Soute pleine.',
    'not-enough-cash': 'Cash-Puce insuffisant.',
    'not-enough-cargo': 'Pas assez de caisses en soute.',
    'tank-full': 'Réservoir plein.',
    'same-district': 'Vous y êtes déjà.',
    'trip-done': 'Trajet déjà effectué pour cette phase.',
    'not-enough-fuel': 'Pas assez de Synthanol.',
    'not-daytime': 'Possible seulement de jour.',
    exhausted: "Épuisement nerveux : pas de seconde nuit blanche d'affilée.",
    'siphon-unavailable': "La corvée DSC n'est possible que bloqué, sans carburant, ni cargaison, ni Cash-Puce.",
    'invalid-amount': 'Montant invalide.',
    'not-at-location': "Ce lieu n'est pas dans ce district.",
    'location-closed': 'Fermé : les lieux spéciaux ouvrent de 06h00 à 20h00.',
    'no-debt': 'Aucune dette à rembourser.',
    'loan-locked': "Viktor ne prête qu'une fois la dette initiale soldée.",
    'loan-ceiling': "Plafond d'emprunt atteint.",
    'not-enough-offshore': 'Solde offshore insuffisant.',
    intercepted: "Un barrage vous attend : réglez d'abord le contrôle.",
    'not-intercepted': 'Aucun contrôle en cours.',
    'move-unavailable': "Cette option n'est pas possible ici.",
    'offer-too-low': "L'agent refuse une offre aussi basse.",
    'doping-used': "Dopage déjà utilisé aujourd'hui.",
    'not-usable': 'Ce produit ne peut pas servir ainsi.',
    'already-used': 'Déjà utilisé : une seule fois par partie.',
    'third-night': "Une 3e nuit blanche d'affilée est impossible, même dopé.",
    'too-weak': 'Santé trop basse pour une nuit blanche de plus.',
    'grinder-full': 'Le Hachoir a atteint sa limite du jour.',
    'not-grindable': 'Viktor ne rachète que les périssables Faisandés ou Avariés.',
  } satisfies Record<ActionError, string>,

  // ─── Données de jeu (chap. 3 à 8) ───

  tier: {
    0: 'Marchandises officielles',
    1: 'Petits plaisirs coupables',
    2: 'Contrebande culturelle & épicerie noire',
    3: 'Trafic lourd & « armes » gastronomiques',
    4: 'Ennemis publics n°1',
  } satisfies Record<Tier, string>,

  tag: {
    'TAG-LEGAL': { name: 'Légal' },
    'TAG-PERISHABLE': { name: 'Périssable' },
    'TAG-FRAGILE': { name: 'Fragile' },
    'TAG-ADDICTIVE': { name: 'Addictif' },
    'TAG-ODOROUS': { name: 'Odorant' },
    'TAG-CULTURE': { name: 'Culture' },
    'TAG-TECH': { name: 'Tech' },
    'TAG-CHEMICAL': { name: 'Chimique' },
    'TAG-FLAMMABLE': { name: 'Inflammable' },
  } satisfies Record<TagId, Named>,

  product: {
    'T0-01': { name: 'Bio-Briques « Nutri-Standard » (Soja & Insectes)' },
    'T0-02': { name: 'Eau Minérale Déminéralisée' },
    'T0-03': { name: 'Antidépresseurs Doux « Sourire+ »' },
    'T0-04': { name: "Manuels d'Auto-Censure Citoyenne" },
    'T1-01': { name: 'Sodas « Mega-Cola » (Vrai Sucre)' },
    'T1-02': { name: "Grains d'Arabica Torréfiés" },
    'T1-03': { name: 'Beurre de Baratte Demi-Sel' },
    'T1-04': { name: 'Nouilles Instantanées « MSG-621 »' },
    'T1-05': { name: 'Cartons de Chewing-gums Nicotine' },
    'T1-06': { name: "Bidons d'Huile de Friture Usagée" },
    'T2-01': { name: 'Curry Vindaloo « Lava-Grade » (Inde)' },
    'T2-02': { name: 'Saucisson Sec Ibérique & Chorizo' },
    'T2-03': { name: 'Caisses de Vinyles Rock & Rap' },
    'T2-04': { name: 'Lots de « Dumbphones » (type 3310)' },
    'T2-05': { name: 'Canettes « Tcherno-Bull » (Taurine x10)' },
    'T2-06': { name: 'Valises de Clés USB « Monde Libre »' },
    'T2-07': { name: 'Pots de Miel Sauvage Non-Pasteurisé' },
    'T3-01': { name: 'Roquefort Français « Bio-Hazard »' },
    'T3-02': { name: 'Boîtes de Cigares Cubains' },
    'T3-03': { name: 'Caisses de Whisky Écossais (18 ans)' },
    'T3-04': { name: 'Antibiotiques & Ivermectine « Old-School »' },
    'T3-05': { name: 'Sacs de Graines de Tomates Fertiles' },
    'T3-06': { name: 'Cartes Graphiques Rétro (Sans Bride IA)' },
    'T3-07': { name: 'Clones Vocaux & Deepfakes sur Mesure' },
    'T4-01': { name: 'Bœuf Wagyu de Kobé & Côtes Argentines' },
    'T4-02': { name: "Malles d'Œuvres d'Art & Montres Suisses" },
    'T4-03': { name: 'Mallettes de Pass Biométriques « ICC-100% »' },
    'T4-04': { name: 'Glacières de « Placebo-Officiel » (Anti-Vaccin DSC)' },
    'T4-05': { name: 'Cuves de Cellules Souches « Jouvence » (Clonage)' },
    'T4-06': { name: 'Vieux Serveur Aeterna' },
  } satisfies Record<ProductId, Named>,

  district: {
    D1: { name: 'Hives', subtitle: 'Les Ruches Grises' },
    D2: { name: 'Pastel-Heights', subtitle: "L'Éco-Ghetto Bobo & Campus Idéologique" },
    D3: { name: 'Panacea', subtitle: 'Le Complexe Pharmaceutique & Médical' },
    D4: {
      name: 'Rust Valley',
      subtitle: 'La Zone Tampon (friche industrielle & anciens abattoirs)',
    },
    D5: { name: 'The Glass Spire', subtitle: 'La Flèche de Verre (ministères, banques & censure)' },
    D6: { name: 'Olympus-Green', subtitle: 'La Citadelle Zéro-Carbone des Ultra-Élites' },
  } satisfies Record<DistrictId, NamedWithSubtitle>,

  location: {
    'LOC-D1-1': { name: "L'Arrière-Salle de Viktor Varga", subtitle: 'Usurier mafieux' },
    'LOC-D1-2': { name: 'La Cantine des Chauffeurs', subtitle: '« Chez Borg »' },
    'LOC-D2-1': { name: 'Le Studio de « Karma-Cham »', subtitle: "Influenceuse d'État corrompue" },
    'LOC-D3-1': { name: 'La Morgue Arrière', subtitle: 'Dr. K.' },
    'LOC-D4-1': { name: 'Le Garage « Faraday »', subtitle: 'Mécano-Mitch' },
    'LOC-D4-2': { name: 'Le Bunker de « Cassandre-88 »', subtitle: "L'informateur sous plomb" },
    'LOC-D5-1': {
      name: 'La Laverie « Crypto-Clean »',
      subtitle: 'Banque offshore ministérielle',
    },
    'LOC-D6-1': {
      name: 'Le « Velvet-Silo »',
      subtitle: 'Cabaret sensoriel & sous-sol de débauche',
    },
  } satisfies Record<LocationId, NamedWithSubtitle>,

  vehicle: {
    'VEH-01': { name: 'Fourgonnette « Citi-Volt »' },
    'VEH-02': { name: 'Navette « Zéro-C »' },
    'VEH-03': { name: 'Fourgon Bio-Médical « Panacea-V8 »' },
    'VEH-04': { name: 'Compacteur Sanitaire « Bunker-Lourd »' },
  } satisfies Record<VehicleId, Named>,

  module: {
    'MOD-01': { name: "Caisson Cryo à l'Azote Volé" },
    'MOD-02': { name: "Diffuseur d'Échappement « Pin Sylvestre & Javel »" },
    'MOD-03': { name: 'Doublure en Plomb & Cage de Faraday' },
    'MOD-04': { name: 'Suspensions & Silentblocs « Velours »' },
    'MOD-05': { name: "Plaque d'Immatriculation Rotative « E-Ink »" },
    'MOD-06': { name: 'Pare-Buffles en Acier Trempé' },
    'MOD-07': { name: 'Trappe de Largage « Égouts »' },
    'MOD-08': { name: 'Faux Terminal « Citoyen Or »' },
  } satisfies Record<ModuleId, Named>,

  crew: {
    'CREW-01': {
      name: "« L'Ancien de la BRC » — Commandant Vance",
      subtitle: 'Copilote accrédité',
    },
    'CREW-02': {
      name: '« Glitch »',
      subtitle: 'Jeune hackeuse sous caféine (opératrice radio distante)',
    },
    'CREW-03': {
      name: '« La Matriarche » — Mama Rosa Marini',
      subtitle: "Atelier d'affinage",
    },
  } satisfies Record<CrewId, NamedWithSubtitle>,

  event: {
    'EVT-G01': { name: 'Alerte Canicule & Délestage Thermique' },
    'EVT-G02': { name: 'Alerte Sanitaire « Variant-X »' },
    'EVT-G03': { name: 'Blackout du Cloud & sevrage du Fil Rose' },
    'EVT-G04': { name: 'Éco-Panique' },
    'EVT-G05': { name: 'Blocus Alimentaire & Grève des Transports' },
    'EVT-G06': { name: 'La Nuit des Fondateurs' },
    'EVT-D1-01': { name: 'Grève des Éboueurs Automatisés' },
    'EVT-D1-02': { name: "Panne des Ascenseurs & Coupure d'Eau Chaude" },
    'EVT-D1-03': { name: "Descente d'Huissiers d'Aeterna" },
    'EVT-D2-01': { name: 'Tribunal Populaire « Détox & Repentance »' },
    'EVT-D2-02': { name: 'Festival Clandestin « Sans-Ondes »' },
    'EVT-D2-03': { name: 'Invasion de Punaises de Lit Bio' },
    'EVT-D3-01': { name: 'Fuite au Laboratoire P4' },
    'EVT-D3-02': { name: 'Burn-out Collectif des Internes' },
    'EVT-D3-03': { name: 'Inventaire de la Pharmacie Centrale' },
    'EVT-D4-01': { name: 'Alerte « Chemtrails »' },
    'EVT-D4-02': { name: "Arrivage d'un Cargo Fantôme" },
    'EVT-D4-03': { name: "Tournoi de Démolition d'Exosquelettes" },
    'EVT-D5-01': { name: 'Clôture Trimestrielle & Krach Algorithmique' },
    'EVT-D5-02': { name: 'Audit du Comité de Pureté Idéologique' },
    'EVT-D5-03': { name: 'Bug des Portiques Rayons-X' },
    'EVT-D6-01': { name: 'Sommet Mondial « Zéro-Carbone »' },
    'EVT-D6-02': { name: 'Purge Politique au Sommet' },
    'EVT-D6-03': { name: "Caprice d'Oligarque « Nostalgie Prolétaire »" },
    'EVT-R01': { name: 'Enfant-Vigile' },
    'EVT-R02': { name: "Chasseur de primes d'ICC" },
    'EVT-R03': { name: 'Comité « Air Pur »' },
    'EVT-R04': { name: 'Faux auto-stoppeur' },
    'EVT-R05': { name: 'Scan rétinien en conduite' },
    'EVT-R06': { name: 'Quiz vocal de rééducation' },
    'EVT-R07': { name: 'Collecte de sang au péage' },
    'EVT-R08': { name: 'Bridage moteur forcé' },
    'EVT-R09': { name: 'Citoyen en hypoglycémie' },
    'EVT-R10': { name: 'Convoi de « gagnants de la Loterie »' },
    'EVT-R11': { name: 'Nuage de désinfection aérienne' },
    'EVT-R12': { name: 'Drone-livreur crashé' },
    'EVT-R13': { name: 'Citerne du DSC en panne' },
    'EVT-R14': { name: 'Péage caritatif' },
    'EVT-R15': { name: "Échange d'angle mort" },
    'EVT-L01': { name: "Loterie de l'Ascenseur Civique" },
  } satisfies Record<EventId, Named>,
}
