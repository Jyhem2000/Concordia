import type { ActionError } from '../engine/actions.ts'
import type { RuleSource } from '../engine/breakdown.ts'
import type {
  CrewId,
  DifficultyId,
  DistrictId,
  EndingId,
  EventId,
  GlobalEventId,
  LocationId,
  ModuleId,
  ProductId,
  RoadEventId,
  TagId,
  Tier,
  VehicleId,
} from '../engine/types.ts'

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

/** Énumération : « a », « a et b », « a, b et c » */
const listOf = (items: readonly string[]) => new Intl.ListFormat('fr', { type: 'conjunction' }).format(items)

/** Énumération d'alternatives : « a ou b », « a, b ou c » */
const oneOf = (items: readonly string[]) => new Intl.ListFormat('fr', { type: 'disjunction' }).format(items)

type Named = { name: string }
type NamedWithSubtitle = Named & { subtitle: string }
type RoadTexts = { situation: string; a: string; b: string }
/** Chapitre du manuel : paragraphes, puis la liste tirée des données (tags, lieux) */
type ManualChapter = { title: string; paragraphs: string[]; list?: 'tags' | 'places' }

/** Paniques algorithmiques de Karma-Cham, par tag proposé */
const KARMA_OPTIONS: Partial<Record<TagId, string>> = {
  'TAG-CULTURE': '« Cancel Wave Culturelle »',
  'TAG-GOURMET': '« Rumeur de Pénurie Alimentaire »',
  'TAG-BIO': '« Scandale Bio-Sanitaire »',
}

export const fr = {
  /** Balise de langue BCP 47 pour Intl (séparateurs, décimales, pourcentages) */
  intlLocale: 'fr-FR',

  app: {
    title: 'Concordia',
  },

  format: {
    /** `amount` est déjà formaté selon la langue ; espace insécable avant le symbole */
    credits: (amount: string) => `${amount}${NBSP}₡`,
    dayShort: (day: number, total: number) => `${day}/${total}`,
  },

  /** Moment de la journée (chap. 1) : Journée, 20h00, Nuit */
  moment: {
    short: { day: 'Journée', curfew: '20h00', night: 'Nuit' },
    tripLeft: 'Trajet libre',
    tripDone: 'Trajet fait',
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

  /** Paliers de crédit social (chap. 1) */
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
    'rule.production': 'Production locale',
    'rule.strong-demand': 'Forte demande',
    'rule.tier-bonus': 'Bonus de tier',
    'rule.noise': 'Tendance du marché',
    'rule.quote': 'Cours du jour',
    'rule.commission': 'Commission de puce',
    'rule.saturation': 'Marché saturé',
    'rule.know-how': 'Savoir-faire',
    'rule.after': 'After du couvre-feu',
    'rule.diminishing-returns': 'Rendements décroissants',
    'rule.anti-arbitrage': 'Pas de voyage, pas de bonus',
    'rule.debt-balance': 'Solde de la veille',
    'rule.debt-rate': 'Intérêts du jour',
    'rule.debt-late-rate': 'Intérêts majorés (retard)',
    'rule.cash': 'Cash-Puce',
    'rule.cargo-value': 'Soute (prix de base)',
    'rule.protection': 'Part de Viktor',
    'rule.offshore-rate': 'Taux offshore',
    'rule.venture-rate': 'Taux du placement',
    'rule.withdrawal': 'Retrait',
    'rule.laundry-fee': 'Commission de la Laverie',
    'rule.suspicion': 'Suspicion (ICC)',
    'rule.suspicious-peak': 'Pic suspect de la veille',
    'rule.night-trip': 'Trajet de nuit',
    'rule.crossed-districts': 'Districts traversés',
    'rule.exit-gate': 'Portique du sas',
    'rule.ambush': 'Embuscades de la dette',
    'rule.patrol': 'Ronde renforcée',
    'rule.wanted': 'Fiche S',
    'rule.route-watch': 'Itinéraire repéré',
    'rule.notoriety': 'Notoriété',
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
    'rule.freshness-extra': 'Extra-frais',
    'rule.freshness-standard': 'Fraîcheur standard',
    'rule.freshness-gamey': 'Défraîchi',
    'rule.freshness-spoiled': 'Dégradé',
    'rule.damaged': 'Caisse endommagée',
    'rule.bluff-failed': 'Bluff raté',
    'rule.drone-judges': 'Drones-Juges (incorruptibles)',
    'rule.flee-base': 'Fuite : chance de base',
    'rule.flee-cap': 'Plafond de fuite',
    'rule.eject-manual': 'Éjection manuelle',
    'rule.aftershock': 'Contrecoup',
    'rule.event-cap': 'Plafond des événements',
    'rule.repair': 'Réparation (par PV)',
    'rule.refining': 'Affinage de Mama Rosa (Frais vendu Extra-frais)',
    'rule.worn': 'Chauffeur à bout',
    'rule.cantine': 'Tarif syndical',
  } satisfies Record<RuleSource, string>,

  // ─── Interface ───

  /** Contrats de la Pègre, chez Viktor (chap. 3) */
  contract: {
    offerTitle: 'Contrat de la Pègre proposé',
    activeTitle: 'Contrat de la Pègre en cours',
    terms: (qty: number, product: string, district: string, deadline: number, reward: string) =>
      `${qty} ${product} à livrer à ${district} avant la fin du J${deadline}, prime ${reward}.`,
    owned: (owned: number, needed: number) => `En soute : ${owned}/${needed}`,
    rule: (penalty: string) => `Un seul contrat à la fois. Délai manqué : Viktor ajoute ${penalty} de la prime à la dette.`,
    accept: 'Accepter le contrat',
    deliver: (reward: string) => `Livrer (${reward})`,
    fil: (qty: number, product: string, district: string, deadline: number) =>
      `Contrat de la Pègre : ${qty} ${product} à livrer à ${district} avant la fin du J${deadline}`,
    offerFil: (product: string, reward: string) =>
      `Viktor propose un contrat aujourd'hui (${product}, prime ${reward}) : à accepter à son guichet, jour et nuit`,
  },

  /** Pompe à Synthanol du district (chap. 3) */
  pump: {
    name: { official: 'Pompe officielle Aeterna', fixed: 'Pompe pirate' },
    rule: {
      official: "Connectée à Aeterna : fermée la nuit sous un certain niveau d'ICC.",
      fixed: 'Hors réseau : toujours ouverte.',
    },
    reserve: (fuel: number, tank: number) => `${fuel}/${tank}`,
  },

  modal: {
    close: 'Fermer',
    cancel: 'Annuler',
  },

  /** Onglets en bas d'écran du téléphone (chap. 7) */
  tabs: {
    label: 'Écrans',
    market: 'Marché',
    places: 'Lieux',
    fil: 'En bref',
    vehicle: 'Véhicule',
    map: 'Carte',
    groups: { brief: 'En bref', trade: 'Marché & véhicule', road: 'Carte & lieux' },
  },

  /** Onglet En bref : tout ce qui compte aujourd'hui, avant d'aller au marché puis sur la carte (chap. 7) */
  fil: {
    news: 'Actualités',
    newsGlobal: 'Dans toute la ville',
    lastsUntil: (day: number) => `jusqu'au J${day}`,
    newsLocal: 'Événements locaux, district par district',
    newsAftershock: "Contrecoups d'hier",
    newsAftershockInfo:
      "Le lendemain d'un événement qui a fait bouger des cours, le marché se corrige le temps d'une journée : ce qui a flambé retombe, ce qui a été bradé remonte.",
    newsInfo:
      "Le Fil d'Aeterna diffuse à toute la ville les événements de chaque district : ce qui se passe ailleurs se sait sans y aller. Chaque événement s'ouvre sur ses effets.",
    newsLottery: 'Loterie',
    newsInfluence: 'Karma-Cham',
    newsTomorrow: 'Demain',
    noNews: "Rien à signaler aujourd'hui.",
    today: "Aujourd'hui",
    forYou: 'Pour vous',
    deliveryOffer: (district: string, crates: number, fee: string) =>
      `Livraison officielle : ${crates} caisses scellées pour ${district}, prime ${fee} (à accepter sur la carte)`,
    deliveryActive: (district: string) => `Livraison officielle en cours vers ${district}`,
    missionTonight: (district: string, crates: number, fee: string) =>
      `Mission de nuit ce soir : ${crates} caisses scellées pour ${district}, prime ${fee}`,
    patrol: (district: string) => `Ronde renforcée aujourd'hui : ${district}`,
    peaks: (districts: string) => `Pic suspect (risque accru) : ${districts}`,
    nothingToday: "Pas de commande ni d'alerte particulière aujourd'hui.",
    agenda: 'Agenda',
    agendaEmpty: 'Aucune échéance à venir.',
    /** `ahead` : jours d'ici l'échéance */
    dayLabel: (day: number, ahead: number) => (ahead <= 0 ? "Aujourd'hui" : ahead < 2 ? 'Demain' : `J${day}`),
    debt: (amount: string) => `Échéance de la dette (${amount})`,
    debtLate: 'Dette en retard : la prochaine échéance est un audit',
    protection: (amount: string) => `Collecte de Viktor (≈ ${amount})`,
    audit: (day: number) => `Audit du Jour ${day}, à minuit`,
    lottery: 'Tirage de la Loterie',
    viceEnd: (product: string, district: string) => `Fin du vice : ${product} en Forte demande à ${district}`,
    serviceReady: (service: string) => `${service} : de nouveau disponible`,
    prophecy: (event: string) => `Prophétie de Cassandre-88 : ${event}, garanti`,
    calendarDay: (day: number) => `Jour ${day}`,
    calendarEmpty: 'Rien de connu ce jour-là.',
    calendarCount: (count: number) => `${count} élément${count > 1 ? 's' : ''}`,
    agendaContract: (district: string) => `Dernier jour du contrat de la Pègre (livraison à ${district})`,
    service: {
      meal: 'Plat du routier',
      influence: 'Karma-Cham',
      pass: 'Laissez-passer',
      surgery: 'Chirurgie',
      certificate: 'Certificat',
      prophecy: 'Cassandre-88',
      forgery: 'Faux dossier',
      auction: 'Enchères du Velvet-Silo',
      vip: 'Commande VIP',
    },
    deals: 'Bonnes affaires connues',
    dealsEmpty: 'Aucun cours vu ailleurs : les marchés des autres districts se découvrent en y passant.',
    dealsOwned: 'Où revendre la soute',
    dealsShop: 'À acheter ici',
    canBuy: (qty: number) => `jusqu'à ${qty} caisse${qty > 1 ? 's' : ''} achetable${qty > 1 ? 's' : ''}`,
    held: (qty: number) => `${qty} en soute`,
    dealsSeen:
      'Cours relevés lors de votre dernier passage dans chaque district : ils ont pu bouger depuis. Les marchés des autres districts se découvrent en y passant.',
    bestQuote: (quote: string, age: number) => `${quote} (${age === 0 ? "vu aujourd'hui" : `vu il y a ${age} jour${age > 1 ? 's' : ''}`})`,
    neverSeen: 'jamais vu ailleurs',
    strongAt: (districts: string) => `Forte demande : ${districts}`,
    alerts: 'Alertes',
    worn: (below: number, penalty: string) =>
      `Chauffeur à bout (moins de ${below} PV) : bluff et fuite à −${penalty}. Le relais et la Morgue soignent.`,
    rotsTomorrow: (qty: number, product: string) => `${qty} × ${product} perdu${qty > 1 ? 's' : ''} demain matin`,
    damaged: (qty: number, product: string) => `${qty} ${product} abîmée${qty > 1 ? 's' : ''}`,
    fuelLow: (fuel: number, longest: number) =>
      `Synthanol bas : ${fuel} ration${fuel > 1 ? 's' : ''}, le trajet le plus long d'ici en coûte ${longest}`,
    fuelOut: (fuel: number, shortest: number) =>
      `Synthanol : ${fuel} ration${fuel > 1 ? 's' : ''}, pas assez pour quitter le district (${shortest} au minimum)`,
    beacon: (product: string, risk: string) => `${product} à bord : sa balise ajoute ${risk} de risque de contrôle partout`,
    beaconJammed: (product: string) => `${product} à bord : sa balise est brouillée par votre équipière`,
    wanted: (level: number, max: number, risk: string, flee: string, days: number) =>
      `Fiche S ${level}/${max} : Aeterna vous recherche. Risque de contrôle +${risk} partout, fuite −${flee}. Un niveau s'efface après ${days} jours sans écart.`,
    protectionTomorrow: (amount: string) =>
      `Collecte de Viktor demain matin : ≈ ${amount} (une part du Cash-Puce et de la soute ; l'offshore lui échappe).`,
    crewUnpaid: (name: string) => `${name} n'a pas été payé ce matin : pas de travail aujourd'hui.`,
    compartmentRoom: (room: number) => `${room} place${room > 1 ? 's' : ''} libre${room > 1 ? 's' : ''} au double fond`,
    journal: 'Bilan & carnet de route',
    yesterday: (day: number) => `Bilan du J${day}`,
    noYesterday: 'Premier jour : pas encore de bilan.',
    flows: (bought: string, sold: string) => `Achats ${bought} · ventes ${sold}`,
    wealth: 'Patrimoine (cash + offshore − dette)',
    wealthLabel: 'Patrimoine net (cash + offshore − dette) chaque matin, puis maintenant',
    wealthReadout: (when: string, amount: string) => `Patrimoine net, ${when} : ${amount}`,
    morningOf: (day: number) => `J${day} à 06h00`,
    now: 'maintenant',
    showAll: 'Tout le carnet',
    hideAll: 'Masquer le carnet',
  },

  /** Carrière, d'une partie à l'autre (chap. 7) */
  records: {
    title: 'Carrière',
    none: 'Aucune partie terminée pour l’instant : les fins atteintes et les hauts faits s’inscriront ici.',
    endings: 'Fins atteintes',
    feats: 'Hauts faits',
    featsThisGame: 'Hauts faits de cette partie',
    feat: {
      escapes: { name: 'Pied au plancher', how: (count: number) => `${count} fuites réussies devant la BRC dans une même partie.` },
      summitBluff: {
        name: "Langue d'argent",
        how: (stars: number) => `Un bluff réussi face à la BRC dans un district de ${stars} étoiles ou plus.`,
      },
      clean: { name: 'Casier vierge', how: () => 'Une partie gagnée sans un seul jour de garde à vue.' },
      wantedMax: { name: 'Ennemi public', how: (level: number) => `Fiche S au niveau ${level}, et la partie gagnée quand même.` },
      contracts: { name: 'Fidèle de Viktor', how: (count: number) => `${count} contrats de la Pègre livrés dans une même partie.` },
      nightOwl: { name: 'Oiseau de nuit', how: (count: number) => `${count} trajets de nuit dans une même partie.` },
      earlyDebt: { name: 'Ardoise effacée', how: (day: number) => `La dette initiale soldée au plus tard le J${day}.` },
      gold: { name: 'Plaqué or', how: () => 'Atteindre le palier Citoyen Or.' },
    },
    summary: (games: number, defeats: number) =>
      `${games} partie${games > 1 ? 's' : ''} terminée${games > 1 ? 's' : ''}, dont ${defeats} défaite${defeats > 1 ? 's' : ''}.`,
    best: (score: string, mode: string) => `Meilleur score (${mode}) : ${score}`,
    reached: (title: string, count: number) => `${title} ×${count}`,
  },

  /** Carnet de route : faits marquants d'une journée (chap. 7) */
  journal: {
    trip: (from: string, to: string, night: boolean) => `${night ? 'Nuit' : 'Trajet'} : ${from} → ${to}`,
    control: (move: string, outcome: string) => `Contrôle : ${move}${outcome ? ` — ${outcome}` : ''}`,
    lostCrates: (qty: number) => `${qty} caisse${qty > 1 ? 's' : ''} perdue${qty > 1 ? 's' : ''}`,
    custody: (days: number) => `garde à vue ${days} jour${days > 1 ? 's' : ''}`,
    road: (event: string, outcome: string) => `Aléa : ${event}${outcome ? ` — ${outcome}` : ''}`,
    delivered: (fee: string) => `Commande livrée (prime ${fee})`,
    deviated: 'Écart de nuit enregistré',
    injection: (total: number, needed: number) => `Injection du serveur (${total}/${needed})`,
    vehicle: (name: string) => `Nouveau châssis : ${name}`,
    module: (name: string) => `Module acheté : ${name}`,
    crew: (name: string) => `Recrue : ${name}`,
    debtPaid: 'Dette initiale soldée',
    wanted: (level: number) => `Fiche S : niveau ${level}`,
    iccTier: (tier: string) => `Nouveau statut : ${tier}`,
    ending: (title: string, score: string) => `Fin : ${title} (${score})`,
    raid: (loss: string) => `Coup de filet sur le placement du Cartel : −${loss}`,
    contractDone: (reward: string) => `Contrat de la Pègre livré (prime ${reward})`,
    contractFailed: (penalty: string) => `Contrat de la Pègre manqué : +${penalty} de dette`,
    highlights: 'Faits marquants',
    noHighlight: 'Aucun fait marquant.',
  },

  /** Vue véhicule, soute et équipage (chap. 7) */
  hold: {
    vehicleTitle: 'Véhicule & équipage',
    modules: (mounted: number, slots: number) => `Modules ${mounted}/${slots}`,
    noModule: 'Aucun module monté : ils se montent au garage.',
    noCrew: 'Aucun équipier : ils se recrutent au Quai 9.',
    garageAt: (district: string) =>
      `Garage « Faraday » de Mécano-Mitch à ${district}, de jour : modules, châssis et réparations s'y font, dans cet onglet.`,
    title: (used: number, capacity: number) => `Soute ${used}/${capacity}`,
    empty: 'Soute vide.',
    cargoSlots: (used: number, capacity: number) => `Soute ${used}/${capacity}`,
    compartment: (used: number, capacity: number) => `Double fond ${used}/${capacity}`,
    compartmentRule:
      "Les caisses illégales qui arrivent s'y rangent d'elles-mêmes, et prennent la place des moins chères. Cliquer sur une caisse cachée l'en sort ; « Cacher » remplit les places libres. Le double fond fait partie de la soute : quand il n'y a rien à cacher, ses places reçoivent des caisses visibles.",
    hidden: (qty: number) => `${qty} au double fond`,
    beacon: 'Balise',
    hide: 'Cacher au double fond',
    hiddenSlot: (product: string) => `${product}, caché au double fond : cliquer pour le sortir (une caisse)`,
    notice: (product: string, crates: string) => `Double fond : ${product} prend la place de ${crates}.`,
    profile: 'Profil de la cargaison',
    profileRule: 'Ces parts pilotent le risque de contrôle ; une caisse masquée par un Tier 0 compte moins.',
    masked: (qty: number) => `${qty} masquée${qty > 1 ? 's' : ''}`,
  },

  hud: {
    day: 'Jour',
    dayInfo: (auditDay: number) =>
      `Chaque journée : un trajet de jour, puis à 20h00 le couvre-feu : dormir, ou un second trajet de nuit. Audit le Jour ${auditDay} à minuit.`,
    /** Libellé court du Cash-Puce dans la rangée de tête du bandeau */
    cash: 'Cash',
    daysLeft: (days: number) => (days <= 0 ? "aujourd'hui" : `dans ${days} j`),
    debtInfo: (lateDay: number, auditDay: number) =>
      `Dette de Viktor, à intérêts chaque matin. Si la dette initiale n'est pas soldée avant le matin du J${lateDay}, elle passe en retard pour toute la partie : taux majoré et embuscades (risque de contrôle accru partout). À l'audit du J${auditDay} à minuit, le solde doit être nul. Remboursement à l'Arrière-Salle, jour et nuit.`,
    cashToday: (delta: string) => `${delta} aujourd'hui`,
    dayMode: (mode: string) => `Mode ${mode}`,
    notoriety: (risk: string) => `Notoriété : risque de contrôle ${risk}`,
    notorietyNext: (wealth: string) => `Prochain palier de notoriété à ${wealth} de patrimoine`,
    cashInfo:
      "Cash-Puce en poche : achats, Synthanol, services, corruption, collecte de Viktor. Il ne compte pas au score : seul ce qui dort à l'offshore et au placement du Cartel compte.",
    withVenture: (amount: string) => `Placement du Cartel : ${amount}`,
    offshoreInfo: (rate: string) =>
      `Compte offshore : à l'abri de la collecte de Viktor et de l'audit, ${rate} d'intérêts simples par jour. Avec le placement du Cartel, c'est le score de fin de partie. Guichet à la Laverie, de jour. Rien n'y est saisi, mais un gros patrimoine fait parler : la notoriété ajoute du risque de contrôle par palier (Cash-Puce, offshore et placement), moitié moins au palier Citoyen Or.`,
    iccInfo: (left: number, cap: number) =>
      `Gains d'ICC « de route » (relais, contrôle avec soute légale, bluff réussi, certains aléas) : ${left} sur ${cap} encore possibles aujourd'hui ; au-delà, ils sont perdus jusqu'au lendemain 06h00. Les services payants n'ont pas de plafond.`,
    healthValue: (health: string) => `${health} PV`,
    exhausted: 'Épuisé',
    exhaustedInfo:
      "Tournée de nuit hier : pas de nouvelle nuit sur la route ce soir, sauf boisson pour une nuit blanche. Une nuit au relais ou en bivouac efface l'épuisement.",
    healthInfo: (below: number, penalty: string) =>
      `Santé du chauffeur : à zéro, la partie est perdue. Sous ${below} PV, chauffeur à bout : bluff et fuite à −${penalty}. Fuite ratée, racket, aléas, canicule et cellule en coûtent ; le relais et la Morgue en rendent.`,
    worn: 'À bout : bluff et fuite diminués',
    newGame: 'Nouvelle partie',
    newGameConfirm: (mode: string) => `Abandonner la partie en cours et recommencer au Jour 1, en mode ${mode} ? Elle ne comptera pas à la carrière.`,
    newGameAction: 'Abandonner et recommencer',
    offshoreRate: (rate: string) => `Intérêts : ${rate} par jour`,
    wanted: (level: number, max: number) => `Fiche S ${level}/${max}`,
    wantedLabel: 'Fiche S',
    wantedValue: (level: number, max: number) => `${level}/${max}`,
    wantedNow: (risk: string, flee: string) => `Recherché : risque de contrôle +${risk} partout, fuite −${flee}`,
    wantedInfo: (risk: string, flee: string, days: number) =>
      `Fiche S : votre niveau de recherche dans les fichiers d'Aeterna. Il monte d'un niveau à chaque fuite réussie devant la BRC et à chaque tournée de nuit hors mission passée sans contrôle (l'écart est filmé, sauf sous la plaque rotative). Par niveau : risque de contrôle +${risk} partout, fuite −${flee}. Un niveau s'efface après ${days} jours de suite sans nouvel écart.`,
    wantedGain: (levels: number) => `+${levels} niveau${levels > 1 ? 'x' : ''} de Fiche S`,
    debtLate: 'Dette initiale en retard',
    debtDue: (when: string) => `Dette initiale à solder ${when}`,
    place: 'Lieu',
    placeInfo: 'District où se trouve le camion. Chaque district a sa propre économie : ses cours ne valent que chez lui.',
    offshore: 'Offshore',
    patrol: (district: string) => `Ronde renforcée : ${district}`,
    countdown: (day: number) =>
      `Audit le Jour ${day} à minuit : dernier dépôt offshore possible le J${day} avant 20h00 ; Viktor encaisse jusqu'à minuit.`,
  },

  ticker: {
    label: 'Message Aeterna',
    messages: [
      // ─── Hygiène mentale, sédation & IA Aeterna ───
      'Un Citoyen-Livreur sourit, un Citoyen-Livreur produit.',
      'Toute émotion non déclarée est soumise à cotisation.',
      'Le couvre-feu sanitaire protège ceux qui dorment. Fermez les yeux : Aeterna veille.',
      'Aeterna ne vous punit jamais : elle optimise votre potentiel civique.',
      "Le sarcasme est une micro-agression envers l'harmonie collective. Choisissez la bienveillance.",
      'Vous semblez tendu, Citoyen. Avez-vous pris votre comprimé de Sourire+ ce matin ?',
      "Le libre arbitre est la première cause d'anxiété évitable.",
      'Une pensée négative détectée est une pensée déjà pardonnée par la garde à vue sensorielle.',
      'Le doute est un bug. Nos serveurs pensent pour vous, à 99,98 % sans erreur.',
      "L'ennui n'existe pas sur le Fil Rose. Scrollez, souriez, recommencez.",
      'Vos rêves de cette nuit ont été jugés conformes. Aucune action requise de votre part.',
      "Aeterna ne ment jamais : elle réécrit la vérité avant qu'elle ne vous blesse.",
      'Le bonheur est obligatoire, mais il reste gratuit. Profitez-en tant que le Directoire le permet.',
      'Penser par soi-même fatigue les neurones. Laissez-les se reposer sur nos serveurs.',
      "Un Citoyen calme est un Citoyen qui n'a pas encore lu les nouvelles. Restez calme.",
      'Le silence de vos voisins est une preuve de leur sérénité. Ou de leur prochain signalement.',
      "L'eau du robinet contient désormais un apaisant citoyen. L'eau des routiers, elle, reste lucide : jalousez-les sans haine.",
      'Les larmes non autorisées sont recyclées en eau de refroidissement. Pleurez utile.',
      'Aeterna a calculé votre humeur de demain. Elle sera excellente. Ne la contrariez pas.',

      // ─── Camisole Métabolique & terrorisme gastronomique ───
      'Aeterna rappelle que la sobriété est la plus belle des libertés.',
      'Le cholestérol est un complot contre la République. Exigez le label Nutri-Standard.',
      "Une Bio-Brique par jour éloigne l'infarctus pour toujours. Goût soja-grillon garanti sans surprise.",
      "Alerte du DSC : le beurre demi-sel tue plus sûrement qu'une balle. Signalez toute odeur suspecte.",
      "L'Eau Minérale Déminéralisée : 0 % d'électrolytes, 100 % de sérénité civique.",
      'La nostalgie gustative est un trouble psychiatrique, pris en charge à Panacea.',
      "Mâcher lentement votre ration d'insectes augmente la sensation de satiété de 14 %. Faites un effort.",
      "La caféine fausse votre jugement ; la tisane d'État le remet d'aplomb.",
      "Le vrai sucre ronge vos dents et votre Indice de Conformité Civique. Préférez la douceur de l'obéissance.",
      'Le fromage affiné est une arme biologique. Toute meule détectée sera confisquée et dégustée par un expert habilité.',
      'Une odeur de friture dans votre quartier ? Ne paniquez pas, alertez le Comité de Pureté.',
      'Le goût est une illusion bourgeoise. La texture, une simple suggestion.',
      "Les épices d'avant-guerre provoquaient des passions. Les passions provoquaient des guerres. Mangez fade.",
      'Le chocolat noir est classé substance agitatrice. Le chocolat blanc, simple erreur de goût.',
      'Votre ration de grillons a été enrichie en gratitude. Mâchez avec reconnaissance.',
      'Un dîner entre amis sans déclaration préalable est un banquet clandestin. Pensez au formulaire.',
      'Les cantines du DSC servent un menu unique : celui qui vous convient, selon Aeterna.',
      'Saliver devant une vitrine est un symptôme. Consultez votre terminal de santé civique.',

      // ─── Délation, surveillance & Loterie ───
      'Le Comité de Pureté remercie les citoyens qui signalent les citoyens déviants.',
      "Vous aimez votre voisin ? Aidez-le à s'améliorer en signalant ses écarts de conduite.",
      "Les murs n'ont pas d'oreilles, mais votre terminal dispose d'un microphone haute-fidélité.",
      "La vie privée est un privilège d'égoïste. La transparence est la vertu des justes.",
      "Félicitations aux gagnants de l'Ascenseur Civique de la semaine ! Leurs remplaçants prennent leur poste dès 06h00.",
      'Le statut de Citoyen Or est le meilleur des déodorants sociaux.',
      "Parents : les Jeunesses d'Aeterna recrutent dès 6 ans. Un enfant vigile est un foyer tranquille.",
      "Si vous n'avez rien à cacher, pourquoi fermez-vous les portes de votre fourgon à clé ?",
      "Les Drones-Juges de la BRC n'ont ni préjugés, ni fatigue, ni pitié. Respectez les couloirs de livraison.",
      'Un signalement par jour, et votre ICC vous dira merci.',
      'La BRC ne fouille que les coupables. Si elle vous fouille, demandez-vous pourquoi.',
      "Les caméras du réseau de service ne dorment jamais. C'est pour cela qu'elles vous aiment.",
      'Votre fourgon a dévié de son trajet habituel ? Aeterna aussi se pose la question.',
      "La Loterie de l'Ascenseur Civique récompense les méritants. Les autres méritent aussi, autre chose.",
      "Les Citoyens d'Honneur ne paient pas l'eau. Ils paient en exemple.",
      'Un Citoyen fiché est un Citoyen connu. Être connu, c’est déjà être aimé.',
      'Les rumeurs sont des virus. Toute rumeur vérifiée devient une information, et toute information appartient au DSC.',
      "La délation n'est pas une trahison : c'est un service après-vente de la société.",

      // ─── Éco-panique, infrastructure & Délestage Thermique ───
      "Votre consommation d'eau a été jugée exemplaire. Presque.",
      "La canicule est une opinion. L'algorithme, lui, est un fait.",
      "Les coupures d'eau à Hives refroidissent les serveurs qui calculent votre bonheur. Merci de transpirer utile.",
      "Il fait 42 °C dans les dortoirs, mais toujours 21 °C dans le cœur d'Aeterna.",
      'Retenir sa respiration 10 secondes par minute réduit votre empreinte carbone de 8 %. Essayez maintenant.',
      "L'air chaud rejeté par les échangeurs thermiques est un chauffage gratuit anticipé pour cet hiver.",
      "Chaque goutte de Synthanol économisée est une victoire contre l'effondrement.",
      'Le gazon synthétique de Pastel-Heights ne jaunit jamais, tout comme notre foi dans le Directoire.',
      "Les galeries de service sont réservées aux véhicules autorisés. Les autres y sont filmés avec beaucoup d'attention.",
      "Le soleil est surfacturé cet été. Restez à l'ombre des serveurs.",
      "Une panne d'ascenseur à Hives libère de l'énergie pour illuminer The Glass Spire. Montez les escaliers avec fierté.",
      'Le recyclage de vos vieux souvenirs alimente le chauffage collectif. Oubliez généreusement.',
      'Les pigeons de Rust Valley ne sont pas des drones. Ne leur parlez pas quand même.',
      "Le délestage thermique de ce soir est une fête : éteignez tout, et célébrez l'obscurité réglementaire.",
      'Chaque fourgon à l’arrêt réduit le smog. Chaque fourgon en mouvement réduit la dette. Choisissez la dette.',
      'Les fumées violettes des Docks sont parfaitement inoffensives, selon les fumées elles-mêmes.',
      'Le Synthanol pirate détruit les moteurs et les âmes. Le Synthanol officiel ne détruit que votre budget.',

      // ─── Monde Extérieur, économie & contrebande ───
      'Les prix montent pour votre sécurité. Merci de votre compréhension.',
      "Météo du Monde Extérieur : pluies acides, cannibalisme et chaos. N'êtes-vous pas bien derrière le Mur ?",
      "La musique rock d'avant-guerre provoque des arythmies cardiaques et des pensées séditieuses.",
      "Tout objet non connecté au Cloud d'Aeterna est considéré comme un déchet dangereux.",
      'Les rumeurs de banquets de viande bovine à Olympus-Green sont des hallucinations collectives.',
      "L'Audit Mensuel approche toujours : un portefeuille remis à zéro est une âme purifiée.",
      'Votre rythme cardiaque au dernier portique a été archivé. Bonne route, Citoyen-Livreur.',
      'La dette est un lien affectueux entre vous et votre créancier. Entretenez-le.',
      "L'offshore n'existe pas. Ceux qui y placent leur argent non plus, bientôt.",
      'Un marché libre est un marché qui obéit librement aux cours fixés par Aeterna.',
      'La contrebande nuit gravement à la balance commerciale et aux rotules des contrebandiers.',
      "Le Mur protège Concordia du dehors. Le dehors, lui, n'a jamais demandé à entrer. C'est suspect.",
      'Le troc est interdit. Le paiement en nature aussi. Le paiement tout court, vivement encouragé.',
      'Les cartels sont un mythe urbain entretenu par des citoyens au portefeuille trop rempli.',
      'Acheter bas et revendre haut est une spéculation. Acheter haut et revendre bas est du civisme.',
      "Les chalutiers de Rust Valley ne transportent que du poisson. Le poisson, lui, transporte ce qu'il veut.",
      "Viktor Varga n'existe pas. Ses intérêts, si.",
      'Un portefeuille vide est un portefeuille transparent. Le DSC vous remercie de votre transparence.',
    ],
  },

  chart: {
    dayTick: (day: number) => `J${day}`,
  },

  briefing: {
    wantedCleared: (level: number, max: number, days: number) => `Fiche S effacée d'un niveau, après ${days} jours sans écart : ${level}/${max}.`,
    wanted: (level: number, max: number, risk: string, flee: string) =>
      `Fiche S montée hier (fuite ou écart de nuit filmé) : ${level}/${max}. Risque de contrôle +${risk} partout, fuite −${flee} ; quelques jours sans écart en effacent un niveau.`,
    title: (day: number) => `Briefing de 06h00 — Jour ${day}`,
    ventureRaid: (loss: string) => `Coup de filet de la BRC sur une filière du Cartel : le placement perd ${loss}.`,
    ventureInterest: 'Intérêts du placement',
    contractFailed: (penalty: string) => `Contrat de la Pègre manqué : Viktor ajoute ${penalty} à la dette.`,
    nightRelay: (district: string) => `Réveil à ${district}, après une nuit au relais routier.`,
    nightBivouac: (district: string) => `Réveil à ${district}, après une nuit en bivouac.`,
    nightCell: (district: string) => `Réveil à ${district}, au sortir de la cellule.`,
    places: (names: string) => `Ouverts ici de jour : ${names}.`,
    noPlace: 'Aucun lieu spécial ici : marché et route seulement.',
    dismiss: 'Compris',
    sleep: (icc: string, health: number) => `Nuit au relais : ICC ${icc}, Santé +${health}`,
    custody: (health: number) => `Nuit en caisson blanc, hymnes à 90 décibels : −${health} PV.`,
    rotten: (crates: number) =>
      `${crates} caisse${crates > 1 ? 's' : ''} perdue${crates > 1 ? 's' : ''} (trop dégradée${crates > 1 ? 's' : ''}), détruite${crates > 1 ? 's' : ''} à 06h00.`,
    heat: (products: readonly string[], melted: number, aged: number, rotten: number) =>
      `Canicule : ${melted} caisse${melted > 1 ? 's' : ''} fondue${melted > 1 ? 's' : ''} en soute (${listOf(products)}), ${aged} caisse${aged > 1 ? 's' : ''} au frais vieillie${aged > 1 ? 's' : ''}, ${rotten} perdue${rotten > 1 ? 's' : ''} et détruite${rotten > 1 ? 's' : ''}.`,
    salary: (name: string, amount: string) => `Salaire de ${name} : ${amount}.`,
    salaryInKind: (name: string, amount: string, product: string) => `Salaire de ${name} : ${amount} et 1 × ${product}.`,
    salaryCell: (name: string) => `${name} reste à son poste pendant votre garde à vue (pas de salaire).`,
    unpaid: (name: string) => `Cash-Puce insuffisant : ${name} ne travaille pas aujourd'hui.`,
    missionReclaimed: (crates: number) =>
      `Commande du DSC non livrée : la plateforme reprend ${crates} caisses scellées et note le retard (ICC en baisse).`,
    vipFailed: 'Commande VIP manquée : ICC en baisse, le Velvet-Silo vous ferme ses portes.',
    informant: "Faux dossier : l'indic a été « promu ». Fiche S effacée, ICC en hausse.",
    crewLost: (name: string) => `Loterie : ${name} a été « promu ». Vous ne le reverrez plus ; le prochain recrutement est gratuit.`,
    recovered: (back: number, lost: number) =>
      `Trappe de largage : les complices rapportent ${back} caisse${back > 1 ? 's' : ''}, ${lost} perdue${lost > 1 ? 's' : ''}.`,
    lockedIn: (district: string) => `Complexe bouclé : vous restez au sas de ${district}, la journée commence à 20h00.`,
    debtInterest: 'Dette après intérêts',
    debtLate: "Dette initiale jamais soldée : taux majoré et embuscades jusqu'à la fin de la partie.",
    protection: 'Collecte de protection',
    protectionToDebt: (amount: string) => `Cash-Puce insuffisant : ${amount} ajoutés à la dette.`,
    offshoreInterest: 'Intérêts offshore',
  },

  events: {
    prophecy: (text: string) => `Prédiction de Cassandre-88 pour demain : ${text} (certain)`,
    influence: (tag: string, factor: string) => `Panique algorithmique : tout ${tag} ${factor} aujourd'hui`,
    rumor: (text: string, reliability: string) => `Rumeur pour demain : ${text} (se vérifie ${reliability} du temps)`,
    aftershock: (name: string, rush: string, sale: string) =>
      `Contrecoup de « ${name} » : cours ${rush} sur ce qui a flambé hier, ${sale} sur ce qui a été bradé`,
    local: (district: string, name: string) => `${district} : ${name}`,
    promoted: (name: string, district: string) =>
      `🎉 Félicitations à ${name}, promu·e Citoyen·ne d'Honneur à ${district} ! Purge préventive : contrôles renforcés aujourd'hui.`,
    demoted: (name: string, from: string, to: string) => `🌱 ${name}, ex-${from}, rejoint avec enthousiasme ${to}.`,
    vice: (product: string, district: string, until: number) =>
      `Son goût pour « ${product} » l'y suit : Forte demande à ${district} jusqu'au J${until}.`,
    /** Citoyens tirés à la Loterie (promu, déclassé) : des inconnus, sans lien avec les personnages du jeu */
    names: [
      'Mme R. Delcourt',
      'M. K. Okafor',
      'Mme L. Ferreira',
      'M. T. Nguyen',
      'Mme S. Haddad',
      'M. J. Kowalski',
      'Mme A. Lindqvist',
      'M. D. Mbeki',
      'Mme E. Rossi',
      'M. P. Tanaka',
    ],
    effects: {
      price: (products: string, factor: string, dayOnly: boolean) => `Cours ${factor} : ${products}${dayOnly ? ' (jour seulement)' : ''}`,
      appear: (products: string, factor: string) => `En vente exceptionnelle, cours ${factor} : ${products}`,
      appearSome: (min: number, max: number, products: string, factor: string) =>
        `${min} à ${max} produits en vente exceptionnelle, cours ${factor} sur tous : ${products}`,
      stockAll: (factor: string) => `Stocks des boutiques ${factor}`,
      stock: (products: string, factor: string) => `Stock ${factor} : ${products}`,
      risk: (add: string) => `Risque de contrôle ${add}`,
      finalRisk: (factor: string) => `Risque de contrôle final ${factor}`,
      baseRisk: (value: string) => `Risque de base porté à ${value}`,
      tagOff: (tag: string) => `Effets ${tag} annulés`,
      tag: (tag: string, factor: string) => `Effets ${tag} ${factor}`,
      halfDay: "Entrer dans le district, ou s'y trouver à 06h00, coûte une demi-journée au sas",
      repair: (factor: string) => `Réparations du garage ${factor}`,
      grounded: 'Drones cloués au sol : aucun contrôle volant',
      unfilmed: "Galeries non filmées : un trajet de nuit hors mission n'ajoute pas de Fiche S",
      heat: (products: readonly string[], days: number, chassis: number, health: number) =>
        `À 06h00 : ${listOf(products)} ${products.length > 1 ? 'fondent' : 'fond'} en soute, les autres produits au frais vieillissent de ${days} jours. Trajets de jour : châssis −${chassis} (sauf refroidissement), Santé −${health}`,
      tagged: (tag: string) => `tout ${tag}`,
      tiers: (tiers: string) => `tout Tier ${tiers}`,
      scope: (districts: string) => ` — ${districts}`,
    },
  },

  rumor: {
    'EVT-G01': 'la météo annonce un épisode de chaleur « historique »',
    'EVT-G02': "des toux suspectes sont signalées dans les files d'attente du DSC",
    'EVT-G03': 'des techniciens du Cloud sont sortis en sueur des data-centers',
    'EVT-G04': 'un documentaire choc sur le méthane serait en montage',
    'EVT-G05': 'les syndicats de transport se réunissent à huis clos',
    'EVT-G06': "les traiteurs de l'élite refusent toute nouvelle commande",
    'EVT-G07': "une mise à jour d'Aeterna serait prévue « dans la plus grande transparence »",
  } satisfies Record<GlobalEventId, string>,

  road: {
    title: 'Aléa routier',
    payWith: 'Payer avec',
    cost: {
      fuel: (rations: number) => `${rations} ration${rations > 1 ? 's' : ''}`,
      crates: (qty: number, product: string) => `${qty} × ${product}`,
      cratesMissing: (qty: number, what: string) => `${qty} caisse${qty > 1 ? 's' : ''} ${what}`,
      tier: (tiers: string) => `de Tier ${tiers}`,
      freeSlot: 'une place libre en soute',
    },
    outcome: {
      cash: (amount: string) => `Cash-Puce ${amount}`,
      icc: (points: string) => `ICC ${points}`,
      health: (pv: string) => `Santé ${pv}`,
      chassis: (pv: string) => `Châssis ${pv}`,
      fuel: (rations: string) => `Rations ${rations}`,
      crate: (tier: number) => `1 caisse au hasard de Tier ${tier}`,
      nothing: 'Aucun effet',
    },
    gamble: (chance: string, win: string, lose: string) => `Pari, ${chance} de chance : ${win} ; sinon : ${lose}`,
    won: 'pari gagné',
    lost: 'pari perdu',
    fuelGain: 'Rations',
    events: {
      'EVT-R01': { situation: "Un écolier des Jeunesses d'Aeterna relève le numéro de tes pneus.", a: 'Acheter son silence', b: "L'ignorer" },
      'EVT-R02': { situation: 'Un chômeur photographie ta soute ouverte pour toucher la prime.', a: 'Acheter son silence', b: 'Foncer' },
      'EVT-R03': { situation: 'Trois retraités du Comité « Air Pur » bloquent un passage piéton.', a: 'Écouter le sermon', b: 'Les enfumer' },
      'EVT-R04': { situation: "Un auto-stoppeur lève le pouce. Ses bottes ressemblent à celles d'un indic.", a: 'Refuser', b: 'Le prendre' },
      'EVT-R05': { situation: 'Le terminal exige de fixer la caméra 8 secondes, à 70 km/h.', a: 'Obéir', b: 'Faire sauter le fusible' },
      'EVT-R06': { situation: 'Quiz vocal de rééducation : réciter le Décret Zéro-Carbone.', a: 'Payer la « formation civique »', b: 'Bafouiller' },
      'EVT-R07': { situation: 'Collecte de sang au péage : 400 ml « volontaires ».', a: 'Donner', b: 'Payer la dispense' },
      'EVT-R08': { situation: 'Bridage moteur forcé à 15 km/h sur tout le secteur.', a: 'Subir', b: 'Court-circuiter' },
      'EVT-R09': { situation: "Un citoyen en hypoglycémie s'effondre devant ton pare-chocs.", a: 'Contourner par le trottoir', b: "L'aider" },
      'EVT-R10': { situation: 'Un convoi de « gagnants de la Loterie » bloque la voie rapide.', a: 'Attendre', b: 'Prendre la bretelle de chantier' },
      'EVT-R11': { situation: 'Nuage de désinfection aérienne : javel et sédatifs.', a: 'Apnée', b: "Arroser l'habitacle" },
      'EVT-R12': { situation: "Un drone-livreur s'est crashé sur la chaussée, batterie intacte.", a: 'Signaler (déposition au poste)', b: 'Piller' },
      'EVT-R13': { situation: 'Une citerne du DSC en panne, son chauffeur novice en larmes.', a: 'Aider', b: 'Passer' },
      'EVT-R14': { situation: "Péage caritatif : autocollants « J'aime Aeterna ».", a: 'Acheter', b: 'Refuser' },
      'EVT-R15': { situation: 'Un autre contrebandier propose un échange dans un angle mort.', a: 'Troc aveugle', b: 'Refuser' },
    } satisfies Record<RoadEventId, RoadTexts>,
  },

  /** Conditions de progression (chap. 1, 3 et 4) : ce qui manque, et où en est le joueur */
  requirement: {
    debtPaid: 'Après la dette initiale soldée.',
    deliveries: (done: number, needed: number) => `Après ${needed} commandes du DSC livrées (${done}/${needed}).`,
    wanted: "Réservé aux fichés : après une première Fiche S (votre nom dans les fichiers d'Aeterna).",
    iccTier: (tier: string, icc: string) => `ICC au palier ${tier} ou mieux (actuellement ${icc}).`,
    wealth: (needed: string, current: string) => `Patrimoine d'au moins ${needed} (Cash-Puce et offshore : ${current}).`,
    tagSales: (tag: string, done: number, needed: number) => `Après ${needed} caisses ${tag} vendues (${done}/${needed}).`,
    controls: (done: number, needed: number) =>
      `Après ${needed} contrôle${needed > 1 ? 's' : ''} de la BRC franchi${needed > 1 ? 's' : ''} sans garde à vue (${done}/${needed}).`,
    compartmentHeld: (done: number, needed: number) =>
      `Après ${needed > 1 ? `${needed} fouilles` : 'une fouille'} où la BRC n'a pas trouvé votre double fond (${done}/${needed}) : Mitch aime les clients dont le travail tient.`,
  },

  crewDesk: {
    title: 'Équipage',
    rule: (fee: string) =>
      `Un seul équipier à la fois, salaire payé d'avance chaque matin. Prochain recrutement : ${fee} de frais, plus le salaire du jour.`,
    active: (name: string) => `Équipier : ${name}`,
    working: "payé, il travaille aujourd'hui",
    unpaid: 'non payé, il ne travaille pas',
    inKind: (amount: string, product: string) => `Payer ${amount} et une caisse au lieu du plein salaire (prochaine : ${product})`,
    noCrate: 'aucune en soute',
    dismiss: 'Renvoyer',
    hire: 'Recruter',
    salary: (amount: string) => `${amount}/jour`,
    risk: (factor: string) => `risque de contrôle ${factor} partout`,
    bribe: (bonus: string) => `corruption ${bonus}`,
    patrol: 'révèle la ronde renforcée',
    liveQuotes: 'cours de tous les districts en temps réel',
    masksBeacon: 'brouille la balise de traçage du serveur Aeterna (son malus de risque est annulé)',
    injection: (done: number, needed: number) =>
      `avec le serveur Aeterna en soute, chaque tournée clandestine arrivée sans garde à vue injecte un morceau de ton dossier (${done}/${needed}, Fantôme)`,
    offshore: (bonus: string) => `rendement offshore ${bonus}`,
    flee: (bonus: string) => `fuite ${bonus}`,
    forgery: (bonus: string) => `falsification de la Loterie ${bonus}`,
    knowHow: (factor: string) => `produits Gourmet vendus ${factor}`,
    refining: 'affinage : Gourmet Frais vendu au prix Extra-frais',
    quota: (factor: string) => `quotas des produits Gourmet ${factor}`,
    inKindRule: (amount: string, tier: number) => `salaire réduit à ${amount} contre une caisse addictive de Tier ${tier} ou plus`,
  },

  desks: {
    availableFrom: (day: number) => `Disponible à nouveau le J${day}.`,
    karma: {
      title: 'Panique Algorithmique sur Commande',
      rule: (factor: string, cooldown: number) =>
        `Demain seulement, tous les produits du tag choisi valent ${factor} dans tous les districts (plafond compris). Recharge ${cooldown} jours, prix en hausse à chaque commande.`,
      pick: 'Tag de la panique',
      held: (qty: number) => (qty > 0 ? `${qty} en soute` : 'rien en soute'),
      order: (cost: string) => `Commander la panique (${cost})`,
      pending: (tag: string, day: number) => `Panique commandée : ${tag}, le J${day}.`,
      options: KARMA_OPTIONS,
    },
    morgue: {
      title: 'Services du Dr. K.',
      services: { pass: 'Laissez-passer sanitaire', surgery: "Chirurgie d'urgence", certificate: 'Certificat de décontamination' },
      passEffect: (days: number, district: string, tag: string, event: string) =>
        `${days} jours : bio-scanners de ${district} aveugles au ${tag}, « ${event} » sans effet à ${district}`,
      surgeryEffect: (health: number, cap: number) => `Santé +${health}, jusqu'à ${cap} PV`,
      certificateEffect: (icc: number) => `ICC +${icc} %, hors plafond`,
      passValid: (day: number) => `Laissez-passer valable jusqu'au J${day}.`,
    },
    cassandre: {
      title: 'Prédiction',
      consult: 'Consulter',
      cost: (cost: string, product: string, ahead: number) => `${cost} et 1 × ${product} : l'événement global de J+${ahead}, garanti`,
      foretold: (day: number, event: string) => `Prédit pour le J${day} : ${event}.`,
    },
    forgery: {
      title: 'Faux dossier de Loterie',
      nextDraw: (day: number) => `Prochain tirage : J${day}. Le dossier se glisse la veille.`,
      noDraw: "Plus de tirage avant l'audit.",
      rule: (cost: string, chance: string) => `${cost}, perdus même en cas d'échec ; ${chance} de chance de passer.`,
      card: 'Carte',
      district: 'District',
      vice: 'Vice emporté',
      cards: {
        captain: 'Un capitaine de la BRC',
        competitor: 'Un contrebandier concurrent',
        informant: "L'indic qui te suit",
        cadre: 'Un cadre à dénoncer',
      },
      effects: {
        captain: (days: number) => `Promu : risque réduit dans ce district pendant ${days} jours, sans purge.`,
        competitor: (days: number) => `Promu : quotas de demande majorés dans ce district pendant ${days} jours, sans purge.`,
        informant: 'Promu au hasard : Fiche S effacée et ICC en hausse au tirage, sans purge.',
        cadre: "Déclassé : tu choisis le vice qu'il emporte un étage plus bas.",
      },
      submit: 'Glisser le dossier',
      failure: (icc: number, wanted: string) => `Échec : ICC −${icc} % et ${wanted}.`,
      accepted: 'Dossier accepté : « Merci pour votre contribution à la mobilité sociale. » Ton équipier est protégé du tirage.',
      rejected: (icc: number, wanted: string) => `Dossier rejeté : « trop enthousiaste ». ICC −${icc} %, ${wanted}.`,
    },
    velvet: {
      locked: (day: number) => `Commande VIP manquée : le Velvet-Silo vous est fermé jusqu'au J${day}.`,
      auctionTitle: 'Vente aux enchères masquée',
      auctionRule: (tier: number, factor: string, cooldown: number) =>
        `1 caisse de Tier ${tier} ou plus au cours local ${factor}, hors quota. Recharge ${cooldown} jours.`,
      nothingToAuction: (tier: number) => `Aucune caisse de Tier ${tier} ou plus en soute.`,
      auction: (product: string) => `Vendre 1 × ${product}`,
      payCash: 'Payer en Cash-Puce',
      payCrates: 'Payer en caisses',
      notEnoughCrates: 'pas assez de caisses acceptées en soute',
      vipTitle: 'Commande spéciale VIP',
      vipRule: (crates: number, factor: string, icc: number, lock: number) =>
        `${crates} caisses d'un produit tiré au hasard, absent de la soute, à livrer avant 20h00 le lendemain, au cours local ${factor}, hors quota. Échec : ICC −${icc} % et Velvet-Silo fermé ${lock} jours.`,
      request: 'Demander une commande',
      requestDetail: (tiers: string) => `Produit de Tier ${tiers}`,
      deliver: 'Livrer',
      sponsor: (done: number, needed: number) =>
        `Parrainage : ${done}/${needed} commandes livrées. Un oligarque servi assez souvent te parraine pour un fauteuil (fin Élite) ; une commande manquée en efface une.`,
      contract: (crates: number, product: string, deadline: number, value: string) =>
        `${crates} × ${product}, avant le J${deadline} à 20h00 (valeur : ${value})`,
    },
  },

  garage: {
    repairTitle: 'Réparation du châssis',
    repairRule: (missing: number) => `${missing} PV à réparer, prix par PV :`,
    repair: 'Réparer (PV)',
    modulesTitle: (mounted: number, slots: number) => `Modules (${mounted}/${slots} slots montés)`,
    vehiclesTitle: 'Châssis',
    vehicleRule:
      "Le nouveau châssis reprend la marchandise et le carburant ; l'ancien est perdu, sans reprise. Les modules électroniques suivent, les mécaniques sont adaptés (compris dans le prix), les soudés restent sur l'ancien.",
    withRefit: (refit: string) => `(dont ${refit} d'adaptation des modules)`,
    weldedLost: (modules: string) => `Perdu avec l'ancien châssis (soudé) : ${modules}.`,
    fitting: { portable: 'Démontable', adaptable: 'Adaptable', welded: 'Soudé' },
    fittingInfo: {
      portable: () => 'Électronique : il se démonte et suit le joueur sur un nouveau châssis, sans frais.',
      adaptable: (refit: string) => `Mécanique : Mitch l'adapte à un nouveau châssis pour ${refit}.`,
      welded: () => "Soudé au châssis : perdu si l'on change de véhicule.",
    },
    vehicleStats: (cargo: number, hidden: number, slots: number, chassis: number, tank: number, day: number, night: number) =>
      `Soute ${cargo} (double fond ${hidden}) · ${slots} slot${slots > 1 ? 's' : ''} · châssis ${chassis} PV · réservoir ${tank} · ${day} ration${day > 1 ? 's' : ''} de jour, ${night} de nuit`,
    buy: 'Acheter',
    mount: 'Monter',
    unmount: 'Démonter',
    mounted: 'monté',
    stored: 'en réserve',
    lowProfile: (factor: string) => `Profil bas : risque de contrôle ${factor}.`,
    ecoEngine: 'Consomme autant de nuit que de jour.',
    camouflage: (factor: string, share: string) =>
      `Camouflage corporatif : risque ${factor} si le Légal fait au moins ${share} de la soute (soute vide comprise).`,
    coldChain: "Chaîne du froid : les produits au frais ne perdent de la fraîcheur qu'un matin sur deux.",
    transponder: (districts: string, bonus: string, icc: string) =>
      `Transpondeur à ${districts} : fuite ${bonus}, aucun dégât de châssis au succès, perte d'ICC ${icc}.`,
    heavy: (toll: string, crusher: string, risk: string) =>
      `Monstre blindé : péage des milices ${toll}, passage forcé sans dégât, broyeur acide partout (${crusher}, sans dégât). Risque de contrôle ${risk}.`,
    heatProof: 'Immunise soute et moteur contre la canicule.',
    drivingAssist: (bonus: string) => `Fuite ${bonus} ; le chauffeur à bout ne pénalise plus la fuite.`,
    tagOff: (tag: string) => `Annule la détection ${tag}.`,
    tagFactor: (tag: string, factor: string) => `Malus ${tag} ${factor} (risque et bluff).`,
    smoothRide: "Fragiles immunisés à la casse ; pas d'usure de châssis la nuit.",
    nightRisk: (factor: string) => `Malus de risque d'un trajet de nuit hors mission ${factor}.`,
    flyingChecks: (factor: string) => `Contrôles volants ${factor} (les drones perdent le signal).`,
    noFlyingChecks: 'Plus aucun contrôle volant : les drones perdent le signal du camion.',
    rotatingPlate:
      "Plaque illisible pour les caméras : une fuite réussie devant la BRC ne coûte ni ICC ni Fiche S, et un trajet de nuit hors mission n'est pas filmé (pas de Fiche S).",
    ram: (bonus: string, factor: string) => `Fuite et passage forcé ${bonus} ; dégâts de la fuite ${factor}.`,
    trapdoor: (chance: string, minRecovery: string, maxRecovery: string, sealed: string) =>
      `Éjection par les égouts (${chance}, sans dégât, sauf ${sealed}), à chaque barrage ; le double fond reste fermé. Le lendemain, ${minRecovery} à ${maxRecovery} des caisses larguées rapportées.`,
    fakeTerminal: (bonus: string, factor: string) => `Bluff ${bonus} ; tarif standard de corruption ${factor}.`,
    ghostWall: (factor: string) =>
      `Isolation anti-odeur, anti-scanner, anti-chien : à la fouille, chance que les agents trouvent le double fond ${factor}. Ne cache pas l'odeur de la soute, ni le chauffeur.`,
  },

  place: {
    cantineLore:
      "Ici, l'eau est servie sans sédatifs et la cuisine sent encore quelque chose : un privilège syndical des routiers. Partout ailleurs, l'eau courante d'Aeterna apaise les citoyens.",
    meal: 'Plat du routier',
    mealEffect: (cost: string, health: number) => `${cost} · Santé +${health}, une fois par jour`,
    cantineFuel: 'Synthanol au tarif syndical · réserve',
    ventureTitle: 'Placement du Cartel',
    ventureRule: (rate: string, chance: string, loss: string) =>
      `Plus rentable que l'offshore (${rate} par jour), mais chaque matin ${chance} de risque de coup de filet : le placement perd alors ${loss} de son solde. Retrait avec la même commission. Compte dans le score.`,
    invest: 'Placer',
    divest: 'Retirer',
    closedAtNight: 'Fermé : ouvert de 06h00 à 20h00.',
    amount: 'Montant',
    max: 'MAX',
    debtTitle: 'Dette',
    repay: 'Rembourser',
    borrow: 'Emprunter',
    advanceRule: (total: string) =>
      `Avance de survie : Viktor avance jusqu'à ${total} au total sur toute la partie, au taux de la dette ; rembourser ne la reconstitue pas.`,
    loanRoom: (amount: string) => `Encore ${amount} empruntables`,
    noAdvance: (mode: string) => `Mode ${mode} : Viktor n'avance rien, la dette ne fait que grossir.`,
    offshoreTitle: 'Compte offshore',
    deposit: 'Déposer',
    withdraw: 'Retirer',
    received: 'Reçu en Cash-Puce',
    breakEven: (days: number) =>
      `Dépôt crédité en entier ; un retrait est taxé par la Laverie. Au taux du jour, un dépôt couvre cette commission en ${days} jour${days > 1 ? 's' : ''}.`,
    balance: (deposited: string, interest: string) => `dont dépôts ${deposited}, intérêts ${interest}`,
    rate: 'Taux du jour',
    nextInterest: (amount: string) => `+${amount} demain matin`,
  },

  objectives: {
    title: (day: number) => `Objectifs du Jour ${day}`,
    score: 'Score (compte offshore)',
    threshold: (amount: string) => `≥ ${amount}`,
    goldStatus: 'Statut Citoyen Or à minuit (portiques de la dalle)',
    goldAtMidnight: 'Statut Citoyen Or à minuit',
    cleanRecord: 'Fiche S vierge à minuit',
    sponsor: (done: number, needed: number) => `Parrain au Velvet-Silo : ${done}/${needed} commandes VIP livrées`,
    injections: (done: number, needed: number) => `Injections du serveur par Glitch : ${done}/${needed}`,
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
    localEconomy: (district: string) => `Chaque district a sa propre économie : ces cours, stocks et rachats ne valent qu'à ${district}.`,
    filters: 'Filtrer les produits',
    filterTierLabel: 'Filtrer par tier',
    filterTagLabel: 'Filtrer par tag',
    allTiers: 'Tiers',
    allTags: 'Tags',
    filterTier: (tier: number) => `Tier ${tier}`,
    resetFilters: 'Effacer',
    rowHint: (product: string) => `${product} : ouvrir la fiche`,
    sortLabel: 'Trier les produits',
    sort: { tier: 'Par tier', priceAsc: 'Prix ↑', priceDesc: 'Prix ↓' },
    noMatch: 'Aucun produit de ce filtre ici.',
    streetOnly: 'Passé 20h00 : seul le marché de rue est ouvert.',
    quote: 'Cours',
    stock: 'Stock',
    owned: 'En soute',
    demand: 'Rachat',
    demandHint:
      "Caisses que ce district rachète encore aujourd'hui au plein cours. Au-delà, le prix est saturé et Aeterna note un pic suspect. Le rachat remonte chaque matin.",
    sale: 'Vente',
    notInShop: 'Hors boutique',
    unlimited: 'Illimitée',
    demandLeft: (left: number, refill: number) => (refill > 0 ? `${left} (+${refill} demain)` : `${left}`),
    saturated: (qty: number) => `dont ${qty} à prix saturé`,
    averageCost: (cost: string) => `acheté ${cost}/u`,
    trend: (change: string) => `${change} depuis hier`,
    condition: 'État',
    freshness: { extra: 'Extra-frais', standard: 'Frais', gamey: 'Défraîchi', spoiled: 'Dégradé' },
    damaged: 'abîmée',
    rotsIn: (days: number) => (days <= 1 ? 'perdu demain matin' : `perdu dans ${days} jours`),
    use: 'Utiliser',
    iccRestore: (icc: number) => `+${icc} % d'ICC, hors plafond, une seule fois par partie`,
    margin: 'Marge',
    marginUnit: '/u',
    marginAll: (qty: number) => `En vendant tout (${qty}) :`,
    buy: 'Acheter',
    sell: 'Vendre',
    buyCost: (cost: string) => `Coût : −${cost}`,
    fullRate: (qty: number) => `Plein cours (${qty})`,
    all: (qty: number) => `Tout (${qty})`,
    maxOf: (qty: number) => `Max (${qty})`,
    saleTotal: (total: string) => `Vente : +${total}`,
    max: 'MAX',
    status: {
      production: 'Arrivage régulier',
      strong: 'Forte demande',
      neutral: '',
    },
    origin: {
      production: "Arrivage régulier : le produit arrive ici chaque jour, d'où un cours bas ; il se revend mieux ailleurs.",
      official: 'Socle officiel : le Tier 0 est en boutique partout, chaque jour.',
      arrival: 'Arrivage du jour : un complément tiré au hasard ce matin.',
      exceptional: "Arrivage d'événement : en boutique grâce à l'événement du jour.",
    },
  },

  /** Sens d'une tendance publique (chap. 2) */
  trend: { up: 'en hausse', down: 'en baisse', flat: 'stable' },
  trendSince: (trend: string, days: number) => `${trend} depuis ${days} jour${days > 1 ? 's' : ''}`,

  sheet: {
    title: 'Fiche',
    quotesTitle: 'Tendance publique, district par district',
    seenTitle: 'Cours vus sur place',
    seenDay: 'Jour',
    seenQuote: 'Cours',
    trendSoon: 'Le Fil publiera la tendance dès demain.',
    trendReadout: (district: string, day: number, trend: string) => `${district}, J${day} : ${trend}`,
    historyDistrict: 'District de la courbe',
    trendRule:
      "Chaque district a sa propre économie : un produit n'a ni le même cours ni la même tendance d'un district à l'autre. Les cours dérivent d'un jour à l'autre ; une baisse dure souvent quelques jours, puis le cours revient vers la normale. Les événements s'y ajoutent. À vous de repérer les bons moments.",
    tagsTitle: 'Tags',
    actionsTitle: 'Actions',
    seizureTitle: 'Contrôle',
    saleTitle: 'Où le vendre',
    cover: (risk: string, offGrid: string) => `couverture, −${risk} de risque de contrôle × sa part dans la soute (sauf ${offGrid})`,
    tripRisk: (risk: string, offGrid: string, doubled: string) =>
      `+${risk} de risque de contrôle × sa part dans la soute, à chaque trajet (sauf ${offGrid}${doubled ? ` ; doublé à ${doubled}` : ''})`,
    detectedRisk: (risk: string, districts: string) => `+${risk} de risque de contrôle × sa part dans la soute, à ${districts}`,
    bluffMalus: (malus: string, doubled: string) => `−${malus} au bluff × sa part dans la soute${doubled ? ` (doublé à ${doubled})` : ''}`,
    perishable: (rottenAge: number) => `Extra-frais le jour de l'achat jusqu'à 20h00, puis Frais, Défraîchi, Dégradé ; perdu le ${rottenAge}e matin`,
    breakage: (flee: string, shock: string, threshold: number, factor: string) =>
      `chaque caisse peut casser (${flee} en fuite réussie, ${shock} à chaque choc de ${threshold} PV de châssis ou plus) ; abîmée, elle vaut ${factor}`,
    bribeGift: "s'offre à un agent corrompu, avec la connivence",
    masks: (tag: string) => `Chaque caisse masque 1 caisse ${tag} (moins de risque, bonus au bluff)`,
    bluffAid: (crates: number, effect: string) => `Au bluff, dès ${crates} caisse${crates > 1 ? 's' : ''} en soute : ${effect}, sans rien donner`,
    doping: (bonus: string, chassis: number, icc: number) =>
      `En fuite : dopage du pilote, ${bonus} de chance (châssis −${chassis}, ICC −${icc} %), une fois par jour`,
    sleepless: (health: number) => `Le soir : une nuit blanche de plus malgré l'épuisement (Santé −${health})`,
    cooling: (crates: number) => `La nuit : ${crates} caisses refroidissent le moteur au lieu d'user le châssis`,
    beacon: (risk: string) => `Balise de traçage : ${risk} de risque de contrôle partout tant qu'il est en soute`,
    lethal: 'Fouille effective avec ce produit en soute : exécution sommaire',
    nightSale: (factor: string, after: string | null) => `la nuit, se vend ${factor}${after ? `, et ${after} à l'after du couvre-feu` : ''}`,
    legal: 'Fouille : rien à craindre, simple formalité',
    seizure: (fine: string, icc: number, custodyDays: number, high: boolean) =>
      `Saisie : confiscation, amende de ${fine} de leur valeur (prix de base), ICC −${icc}${high ? `, garde à vue ${custodyDays} jour${custodyDays > 1 ? 's' : ''} (haut tier)` : ''}`,
    tollFavorite: (districts: string) => `Pris en premier par les milices de ${districts}`,
    strong: (districts: string) => `Forte demande : ${districts} (jamais en boutique là-bas, sauf événement)`,
    nowhere: 'nulle part',
    produced: (districts: string) => `Arrivage régulier : ${districts} (en boutique chaque jour, moins cher)`,
    hereTitle: (district: string) => `À ${district}, aujourd'hui`,
    boughtAt: (qty: number, cost: string) => `${qty} en soute, acheté${qty > 1 ? 's' : ''} ${cost}/u en moyenne`,
    condition: (condition: string) => `État : ${condition}`,
    best: (quote: string, district: string, age: number) =>
      `Meilleur cours vu ailleurs : ${quote} à ${district} (${age === 0 ? "aujourd'hui" : `il y a ${age} jour${age > 1 ? 's' : ''}`})`,
    noMemory: 'Aucun cours vu ailleurs pour ce produit',
    historyEmpty: 'Jamais vu sur place : le cours exact se découvre en y passant.',
    historyLabel: (district: string) => `Tendance publique à ${district}, jour par jour, sans prix, avec le cours normal en pointillé`,
  },

  margin: {
    trend: {
      up: 'Vente rentable',
      flat: 'Marge faible',
      down: 'Vente à perte',
    },
  },

  interception: {
    title: { brc: 'Barrage de la BRC', flying: 'Contrôle volant de la BRC', racket: 'Racket des milices' },
    /** Lieu du contrôle selon la couche du réseau (chap. 3) */
    place: {
      street: (district: string) => `à l'entrée de ${district}`,
      gallery: (district: string) => `dans la galerie de service de ${district}`,
      docks: (district: string) => `au sas du quai de service de ${district}`,
    },
    intro: {
      brc: (place: string) =>
        `Barrage de la BRC à 300 m, ${place}. Un agent vous fait signe de vous ranger : il est encore temps de vider la soute ou de tourner les talons.`,
      flying: (place: string) =>
        `Un drone vous a repéré ${place} : une unité de la BRC vous coince et l'agent a déjà la main sur la portière. Trop tard pour fuir ou vider la soute.`,
      racket: (place: string) => `Une barricade des milices barre le passage, ${place}. Les miliciens réclament leur dû.`,
    },
    compartment: (crates: string) => `Double fond : ${crates} ; à la fouille, chance que les agents le trouvent :`,
    sponsorCovered: (crates: string) => `Commande du Velvet-Silo : ${crates}, sous la protection de ton parrain. Les agents ne les verront pas.`,
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
    sanction: (fine: string, icc: string) => `Confiscation de l'illégal, amende de ${fine}, ICC ${icc}.`,
    fine: (rate: string, amount: string) => `${rate} de la valeur saisie (≈ ${amount} si tout est saisi)`,
    unpaid: (days: number) =>
      `Cash-Puce insuffisant pour l'amende : il part en entier, et la garde à vue s'allonge de ${days} jour${days > 1 ? 's' : ''}.`,
    custody: (days: number) => `Garde à vue : ${days} jour${days > 1 ? 's' : ''}.`,
    bluffSuccess: (icc: string) => `Succès : tout passe, ICC ${icc}.`,
    bluffFailure: (icc: string, fine: string, penalty: string, canFlee: boolean) =>
      `Échec : ICC ${icc}, amende portée à ${fine}, chance de corruption${canFlee ? ' et de fuite' : ''} ${penalty}.`,
    bribeRate: 'Tarif standard',
    offer: 'Offre',
    offerCash: 'Cash-Puce offert',
    offerCrates: 'Caisses de Luxe offertes (valeur en paiement : prix de base ; une seule suffit pour la connivence)',
    noGift: "Aucune caisse de Luxe en soute : l'agent ne prend que du cash. Le Luxe (cigares, whisky…) s'offre aussi, et le dispose mieux.",
    bribeRateInfo: (minimum: string) =>
      `L'agent évalue ce qu'il laisse passer : le plus élevé entre une part fixe par étoile du district et une part de la valeur de vos caisses illégales. En dessous de ${minimum}, il refuse ; au-delà du tarif, la chance monte par paliers.`,
    offerTotal: (amount: string) => `Valeur totale de l'offre : ${amount}`,
    crateValue: (value: string, cost: string) => `${value}/u en paiement, acheté ${cost}/u`,
    crateGain: (gain: string) => `${gain}/u face au cash`,
    addCrate: (product: string) => `Offrir une caisse de plus : ${product}`,
    removeCrate: (product: string) => `Offrir une caisse de moins : ${product}`,
    cancelsSmell: "annule le malus d'odeur",
    bluffAid: (product: string, effect: string) => `${product} (${effect})`,
    bluffAids: (aids: string) => `Aides en soute, déjà comptées : ${aids}`,
    searchInfo:
      "Utile quand la soute est légale (simple formalité, gain d'ICC), quand l'illégal tient au double fond, ou quand un échec des autres options coûterait plus cher (amende relevée, garde à vue, châssis).",
    bluffInfo:
      "Une fausse déclaration : elle passe mieux avec une soute couverte de Tier 0, sans odeur, dans un district peu gardé. Les aides en soute comptent d'elles-mêmes.",
    bribeInfo:
      "Une offre en Cash-Puce et en caisses de Luxe. Elle est perdue même en cas d'échec ; plus elle dépasse le tarif standard, plus la chance monte.",
    fleeInfo:
      "Pied au plancher : la cargaison est sauvée si ça passe, mais la Fiche S monte et le châssis souffre. La chance tient à l'équipement (assistance de conduite, pare-buffles, transpondeur, Glitch) et au dopage, jamais au reste de la soute ; la Fiche S et la fatigue la font baisser.",
    bribeSuccess: "Succès : l'agent coupe sa caméra-piéton, tout passe, ICC inchangé.",
    breakageRisk: (tag: string, chance: string, factor: string) =>
      `En cas de succès, chaque caisse ${tag} peut casser (${chance}) : elle se vendra et paiera ${factor}.`,
    dope: (product: string, bonus: string, chassis: number, icc: number) =>
      `Dopage : boire 1 × ${product} (${bonus}, châssis −${chassis}, ICC −${icc} % sauf face aux milices ; une fois par jour)`,
    tollInKind: (crates: string, value: string) => `Les miliciens prendraient : ${crates} (valeur ${value}, sans rendre la monnaie).`,
    bribe: 'Proposer',
    bribeFailure: (fine: string, icc: string) => `Échec : l'offre est perdue, confiscation, amende de ${fine}, ICC ${icc}.`,
    fleeSuccess: (chassis: string, icc: string, wanted: string) => `Succès : la cargaison est sauvée, châssis ${chassis}, ICC ${icc}, ${wanted}.`,
    plateCovers: 'plaque rotative : ni ICC ni Fiche S',
    fleeSuccessRacket: (chassis: string) => `Succès : passage, châssis ${chassis}.`,
    fleeFailure: (seizure: string, icc: string, chassis: string, health: string) =>
      `Échec : confiscation, amende de ${seizure}, ICC ${icc}, châssis ${chassis}, Santé ${health}.`,
    fleeFailureRacket: 'Échec : les miliciens appliquent la sanction du refus.',
    ejectMode: {
      trapdoor: 'Trappe de largage (égouts)',
      crusher: 'Broyeur acide',
      manual: "Éjection d'urgence (ruelle)",
    },
    ejectTrapdoor: (minRecovery: string, maxRecovery: string) =>
      `Succès : l'illégal visible file aux égouts, sans dégât, le double fond reste fermé ; demain à 06h00, des complices en rapportent entre ${minRecovery} et ${maxRecovery}.`,
    ejectCrusher: 'Succès : la contrebande est dissoute dans la benne, sans dégât ni récupération.',
    ejectSuccess: (chassis: string) => `Succès : l'illégal finit dans une ruelle, la fouille ne trouve rien. Châssis ${chassis}.`,
    ejectFailure: (raise: string, icc: string) => `Échec : sanction de base, amende relevée de ${raise} de la valeur saisie, ICC ${icc} de plus.`,
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
    compartmentKept: (crates: number) => `Double fond non trouvé : ${crates} caisse${crates > 1 ? 's' : ''} sauvée${crates > 1 ? 's' : ''}.`,
    compartmentFound: 'Double fond découvert : tout est confisqué, ICC en moins pour dissimulation.',
    sacrificed: 'dont caisses sacrifiées',
    custody: (days: number) => `Garde à vue : ${days} jour${days > 1 ? 's' : ''}, sortie à 20h00.`,
    tow: (bill: string) => `Châssis à 0 : dépannage d'urgence facturé ${bill}.`,
    unpaidFine: (amount: string, days: number) => `Amende impayée (${amount}) : garde à vue prolongée de ${days} jour${days > 1 ? 's' : ''}.`,
    dismiss: 'Compris',
  },

  travel: {
    title: 'Carte',
    fuelPrice: (price: string) => `Synthanol ${price} la ration`,
    places: (names: string) => `Lieux : ${names}`,
    mapHint:
      "Survolez ou touchez un district : sa fiche complète et son itinéraire s'affichent sous la carte. En bleu, vous êtes ici ; en ambre, le district choisi. Les autres destinations sont listées à part.",
    destinations: 'Autres destinations',
    here: 'Vous êtes ici',
    direct: 'Liaison directe',
    via: (names: string) => `Via ${names}`,
    fuel: (rations: number) => `${rations} ration${rations > 1 ? 's' : ''}`,
    go: 'Aller',
    goNight: 'Aller de nuit',
    goMission: (fee: string) => `Livrer de nuit (prime ${fee})`,
    goNightDrink: (product: string, health: number) => `Aller de nuit — nuit blanche : 1 × ${product} (Santé −${health})`,
    deliveryTarget: 'Livraison officielle du jour (marché)',
    memoryNever: 'Cours jamais observés',
    memoryToday: "Cours vus aujourd'hui",
    memoryDaysAgo: (days: number) => `Cours vus il y a ${days} jour${days > 1 ? 's' : ''}`,
    security: (stars: number) => `Sécurité ${stars} sur 5`,
    risk: "Risque d'interception",
    flyingShare: (share: string) => `dont ${share} de contrôles volants (ni fuite ni éjection)`,
    riskHint: 'La ronde renforcée du jour reste cachée.',
    routeWatched: (count: number, risk: string) =>
      `Itinéraire repéré : ${count} passage${count > 1 ? 's' : ''} sur cette liaison ces derniers jours (${risk})`,
    riskHintRevealed: 'Ronde renforcée comprise : Vance la révèle chaque matin.',
    peak: "Pic suspect : risque accru aujourd'hui",
    lastTrip: 'Dernier trajet',
    exposed: (crates: number, cost: string, hidden: number) =>
      `Soute exposée : ${crates} caisse${crates > 1 ? 's' : ''} illégale${crates > 1 ? 's' : ''}, payée${crates > 1 ? 's' : ''} ${cost}${hidden > 0 ? `, dont ${hidden} au double fond` : ''}.`,
    exposedSanction: (fine: string, custodyDays: number) =>
      `Une saisie les confisque, avec une amende de ${fine}${custodyDays > 0 ? ` et une garde à vue (haut tier à bord)` : ''}.`,
    neverSeen: 'jamais vu',
    patrol: 'Ronde renforcée (révélée par Vance)',
    wear: (pv: number) => `usure du châssis −${pv}`,
    cooled: (crates: number, product: string) => `moteur refroidi : ${crates} × ${product} consommées`,
    heatStroke: (health: number) => `coup de chaleur, Santé −${health}`,
    delivered: (fee: string) => `commande du DSC livrée, prime ${fee}`,
    deviated: (wanted: string) => `écart de mission enregistré, ${wanted}`,
    unfilmed: "écart de nuit non filmé (maintenance d'Aeterna), Fiche S intacte",
    plated: 'écart de nuit non filmé (plaque rotative illisible), Fiche S intacte',
    injected: (done: number, needed: number) => `Glitch a injecté un morceau de ton dossier dans Aeterna (${done}/${needed})`,
    mission: 'Mission de nuit',
    after: 'After du couvre-feu ce soir',
    trust: (deliveries: number, factor: string) =>
      `Confiance du DSC : ${deliveries} commande${deliveries > 1 ? 's' : ''} livrée${deliveries > 1 ? 's' : ''}, prime ${factor}.`,
    deliveryTitle: 'Livraison officielle du jour',
    deliveryOffer: (district: string, crates: number, fee: string) =>
      `La plateforme du DSC propose ${crates} caisses scellées à livrer à ${district} par le trajet de jour, prime ${fee}. Légales, elles couvrent la soute ; non livrées, elles sont reprises à 06h00 (ICC en baisse).`,
    deliveryActive: (district: string) => `Livraison en cours : caisses scellées à remettre à ${district}, par le trajet de jour.`,
    acceptDelivery: 'Accepter la livraison',
    sealed: (crates: number, district: string) => `${crates} caisses scellées du DSC à livrer à ${district}`,
    estimateHint: 'Marge estimée sur le cours vu, commission déduite (hors savoir-faire et saturation)',
  },

  evening: {
    pricePerRation: (price: string) => `${price} la ration`,
    refuelOne: '+1 ration',
    refuelFull: 'Plein',
    siphon: 'Corvée DSC',
    siphonHint: "Une ration contre de l'ICC et une demi-journée.",
    curfewTitle: '20h00 — couvre-feu sanitaire',
    curfewInfo:
      'À 20h00, Aeterna confine les citoyens chez eux, pour leur hygiène de sommeil : rues vides, marché de rue seulement, lieux fermés. La nuit appartient aux véhicules autorisés du DSC, dans les galeries de service filmées, et aux afters, ces fêtes clandestines où la foule brave le couvre-feu.',
    wait: 'Attendre le soir',
    waitHint: 'Rester sur place sans trajet de jour : la journée passe, marché de rue seulement, lieux fermés.',
    beforeEvening: 'Le soir venu (après le trajet du jour, ou en attendant le soir) : mission de nuit, tournée clandestine ou sommeil.',
    contractTonight: (district: string) => `Contrat de Viktor en cours : il se livre à ${district} par n'importe quel trajet, de nuit aussi.`,
    nightRule:
      'Ce soir : dormir, ou un second trajet dans les galeries de service, où tout est filmé. Une tournée interdit la suivante le lendemain, sauf nuit blanche forcée.',
    missionTourHint: (crates: number) =>
      `La plateforme charge ${crates} caisses scellées (place libre requise) : le trajet vers ce district est couvert, et votre marchandise peut voyager avec.`,
    lethalConfirm: 'Tournée clandestine avec le serveur ?',
    lethalWarning: (product: string) =>
      `${product} est à bord : si les agents fouillent la soute, c'est l'exécution sommaire et la fin de la partie.`,
    lethalAction: 'Partir quand même',
    nightFromMap: 'Pour partir cette nuit, choisissez la destination sur la carte : « Aller de nuit », ou « Livrer de nuit » vers la mission.',
    sleepShort: "Repos jusqu'à 06h00.",
    sleepRelayHint: "Nuit au relais routier du DSC : gain d'ICC et de Santé, épuisement effacé.",
    bivouacHint: 'Bivouac, faute de relais ici : épuisement effacé, mais ni ICC, ni Santé.',
    clandestineHint: (wanted: string) => `Hors mission, vers le district de votre choix : risque accru, et ${wanted} si le trajet passe.`,
    clandestineHintPlated:
      'Hors mission, vers le district de votre choix : risque accru ; la plaque rotative rend le trajet illisible pour les caméras, sans Fiche S.',
    injectionHint: (next: number, needed: number) =>
      `Serveur Aeterna en soute et Glitch au travail : si tu arrives sans garde à vue, elle injecte un morceau de ton dossier (${next}/${needed}).`,
    missionLocked: (done: number, needed: number) =>
      `La plateforme ne vous confie pas encore la nuit : ${done}/${needed} commandes livrées (livraisons officielles du jour). Seule la tournée clandestine reste possible.`,
    missionOffer: (district: string, crates: number, fee: string) =>
      `Mission de ce soir : livrer ${crates} caisses scellées à ${district}, prime ${fee}.`,
    missionHere: (district: string) => `Mission de ce soir vers ${district} : vous y êtes déjà, rien à livrer.`,
    noMission: 'Pas de mission de nuit ce soir : toute tournée sera hors mission.',
    after: (district: string, festive: string, elsewhere: string, cover: string) =>
      `After du couvre-feu ce soir à ${district} : la fête paie le festif ${festive} (${elsewhere} ailleurs la nuit), et la foule retire ${cover} du malus d'une tournée hors mission.`,
    missionActive: (district: string) => `Tournée de nuit sur mission : livrer à ${district}.`,
    offMission: 'Tournée de nuit hors mission : tout trajet sera un écart enregistré.',
    sleepRelay: 'Dormir au relais',
    bivouac: 'Bivouac',
    nightNotice: 'Tournée de nuit : 1 trajet, puis dormir.',
    cooling: (crates: number, product: string) => `Refroidir le moteur la nuit avec ${crates} × ${product} au lieu d'user le châssis`,
  },

  end: {
    score: 'Score final (offshore et placement)',
    gameOver: 'Game Over',
    endings: {
      saboteur: {
        title: 'Le Saboteur',
        epilogue:
          "Le chalutier blindé des cartels franchit l'écluse de Rust Valley. Derrière le mur, les preuves inondent le Fil Rose et Concordia s'embrase pendant que tu goûtes un vrai whisky au soleil des îles libres.",
      },
      resident: {
        title: 'Le Fantôme',
        epilogue:
          "La dernière greffe prend à 03h12. Le code d'Aeterna se réécrit ligne par ligne : résident de Catégorie S, né sous la verrière, casier vierge. Le lendemain, les douaniers d'élite te saluent par ton nom. L'algorithme ne se trompe jamais : c'est donc que tu as toujours été des leurs.",
      },
      elite: {
        title: 'Nouvel Oligarque',
        epilogue:
          "Ton parrain du Velvet-Silo glisse ton nom pour le fauteuil d'un Haut-Commissaire « suicidé » la semaine dernière. Le Conseil vote à l'unanimité, par habitude. Sous la verrière, c'est désormais toi qui commandes de la vraie viande aux petits livreurs.",
      },
      mafia: {
        title: 'Baron de Rust Valley',
        epilogue:
          'Trop grillé pour la haute société, tu rachètes la boucherie de Viktor et les quais de Rust Valley : la contrebande a un nouveau parrain.',
      },
      notable: {
        title: 'Notable de Hives',
        epilogue:
          "Tu rachètes la Cantine des Chauffeurs et deviens l'homme qu'on salue dans les tours de Hives. Viktor y mange gratuitement : certaines dettes ne s'éteignent jamais.",
      },
      exemplary: {
        title: 'Citoyen exemplaire',
        epilogue:
          'Aeterna te cite en exemple : te voilà formateur des nouveaux livreurs de Catégorie C. Personne ne soupçonne ce que cache ton double fond.',
      },
      standard: {
        title: 'Survivant',
        epilogue:
          'Tu as échappé au recyclage, mais ton pécule ne rachète pas ta liberté. Demain 06h00, septembre commence et tu remontes dans ta fourgonnette…',
      },
      'bio-bricks': {
        title: 'Recyclé en Bio-Briques',
        epilogue: "L'audit tombe, la dette court toujours. Viktor ne rachète pas, il recycle : direction l'usine de Bio-Briques.",
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
    'cannot-hide': 'Rien à cacher : seules les caisses illégales, hors encombrantes, vont au double fond.',
    'compartment-full': "Double fond plein : retirez d'abord un produit.",
    'tank-full': 'Réservoir plein.',
    'same-district': 'Vous y êtes déjà.',
    'trip-done': 'Trajet déjà effectué pour cette phase.',
    'not-enough-fuel': 'Pas assez de Synthanol.',
    'not-daytime': 'Possible seulement de jour.',
    exhausted: "Épuisement nerveux : pas de seconde nuit blanche d'affilée.",
    'not-evening': 'Les tournées de nuit partent le soir : après le trajet du jour, ou en attendant le soir.',
    'siphon-unavailable': "La corvée DSC n'est possible que bloqué, sans carburant, ni cargaison, ni Cash-Puce.",
    'invalid-amount': 'Montant invalide.',
    'not-at-location': "Ce lieu n'est pas dans ce district.",
    'location-closed': 'Fermé : les lieux spéciaux ouvrent de 06h00 à 20h00.',
    'no-debt': 'Aucune dette à rembourser.',
    'advance-used': 'Avance de survie épuisée : Viktor ne prête qu’une fois par partie.',
    'not-enough-venture': 'Le placement ne contient pas autant.',
    'not-enough-offshore': 'Solde offshore insuffisant.',
    intercepted: "Un barrage vous attend : réglez d'abord le contrôle.",
    'not-intercepted': 'Aucun contrôle en cours.',
    'move-unavailable': "Cette option n'est pas possible ici.",
    'offer-too-low': "L'agent refuse une offre aussi basse.",
    'doping-used': "Dopage déjà utilisé aujourd'hui.",
    'not-usable': 'Ce produit ne peut pas servir ainsi.',
    'already-used': 'Déjà utilisé : une seule fois par partie.',
    'third-night': 'Encore une nuit blanche ? Impossible, même dopé : le corps ne suit plus.',
    'too-weak': 'Santé trop basse pour une nuit blanche de plus.',
    'road-event': 'Un aléa routier attend votre choix.',
    'no-road-event': 'Aucun aléa routier en cours.',
    'already-owned': 'Déjà possédé.',
    'not-owned': 'Module non possédé ou non monté.',
    'no-free-slot': 'Plus de slot libre sur ce châssis : démontez un module.',
    'crew-lost': 'Disparu à la Loterie : il ne reviendra pas.',
    'no-crew': 'Aucun équipier engagé.',
    'no-mission': 'Aucune mission de nuit valable ce soir.',
    'mission-locked': 'La plateforme ne vous confie pas encore la nuit : livrez d’abord quelques commandes.',
    locked: 'Pas encore débloqué : voir sa condition.',
    'nothing-to-sell': 'Rien à vendre.',
    'no-delivery': "Aucune livraison officielle valable aujourd'hui.",
    'delivery-pending': 'Livraison du jour encore à bord : la plateforme ne confie pas de mission de nuit.',
    'pump-closed': "Pompe officielle fermée la nuit pour votre niveau d'ICC.",
    'not-eligible': "Impossible ici ou aujourd'hui.",
    cooldown: 'Pas encore disponible.',
    'already-healthy': 'Le Dr. K. ne touche pas à un patient en si bonne santé.',
    'full-health': 'Vous êtes en pleine forme : gardez votre appétit pour demain.',
    'already-fed': 'Déjà servi aujourd’hui : Borg vous ressert demain.',
    'prophecy-active': 'Une prédiction est déjà en cours.',
    'too-late': 'Trop tard.',
    'location-locked': 'Lieu verrouillé.',
    'contract-active': 'Une commande est déjà en cours.',
    'no-contract': 'Aucune commande en cours.',
    'not-contract-district': 'Le contrat se livre dans son district de destination.',
    'contract-untravelled': "Viktor veut des caisses apportées d'ailleurs : celles achetées ici ne comptent pas.",
  } satisfies Record<ActionError, string>,

  /** Écran d'accueil (chap. 7) */
  title: {
    broadcast: "Transmission d'Aeterna · canal citoyen",
    name: 'Concordia',
    tagline: 'Zéro-Risque, Zéro-Offense, Zéro-Saveur, Zéro-Carbone.',
    worldTitle: 'Le monde',
    world: [
      "Derrière son mur-frontière, la République d'Autarcia s'est enfermée avec une mégalopole : Concordia. Le Directoire de la Santé Civique y a confié chaque calorie, chaque émotion et chaque trajet à une IA bienveillante, Aeterna.",
      "Le gras, le sucre, l'alcool, l'art et la vie privée y sont des « bugs mortels ». L'eau des quartiers pauvres est sédative, l'ICC note chaque citoyen, et les Crédits expirent à la fin du mois.",
    ],
    roleTitle: 'Ton rôle',
    role: [
      "Livreur de Catégorie C, tu traverses tous les districts au volant d'un utilitaire d'État, de Hives à Olympus-Green, la citadelle des élites. Officiellement, tu livres des caisses légales.",
      "Officieusement, tu es un Passeur du Monde d'Avant : café, beurre, vinyles, whisky, cartes graphiques… tout ce qu'Aeterna interdit, et que tout le monde réclame.",
    ],
    goalTitle: 'Le but',
    goal: (days: number, debt: string, cash: string) => [
      `Tu démarres avec ${cash} en poche et ${debt} de dette envers Viktor Varga, l'usurier de Hives. Ses intérêts courent chaque matin.`,
      `Le Jour ${days} à minuit, c'est l'Audit : la dette doit être soldée, sinon Viktor te recycle en Bio-Briques. Le Cash-Puce est alors effacé.`,
      "Seul compte ce que tu as mis à l'abri sur le compte offshore de la Laverie (et le placement du Cartel) : c'est ton score, et il décide de ta fin.",
    ],
    dayTitle: 'Une journée',
    day: [
      "Achète là où l'on produit, revends là où ça manque : la carte dit ce que chaque district fabrique et réclame.",
      'Chaque trajet peut finir à un barrage de la BRC : fouille, bluff, corruption, fuite ou éjection. Chaque probabilité est affichée, ligne par ligne.',
      'À 20h00, couvre-feu : dormir au relais, ou repartir de nuit, sur mission du DSC ou en clandestin.',
    ],
    endingsTitle: 'Les fins',
    teaser: {
      saboteur: 'Franchir le mur avec les preuves qui feront tomber Aeterna.',
      resident: "Devenir un fantôme : réécrire ton dossier dans le code d'Aeterna.",
      elite: "Être coopté par un oligarque et t'installer sous la verrière.",
      mafia: 'Racheter la boucherie de Viktor et régner sur la contrebande.',
      notable: 'Mettre assez de côté pour devenir quelqu’un à Hives.',
      exemplary: 'Finir la saison au-dessus de tout soupçon, aux yeux d’Aeterna.',
      standard: "Survivre à l'Audit, et reprendre le volant en septembre.",
    } satisfies Record<Exclude<EndingId, 'bio-bricks' | 'death' | 'execution'>, string>,
    start: 'Lancer la partie',
    resume: (day: number) => `Reprendre la partie (Jour ${day})`,
    review: 'Revoir le bilan',
    newGame: 'Nouvelle partie',
    newGameConfirm: (mode: string) => `La partie en cours sera perdue. Commencer une nouvelle partie en mode ${mode} ?`,
    currentMode: (mode: string) => `Partie en cours : mode ${mode}. Le mode choisi vaut pour la prochaine partie.`,
  },

  /** Bilan de fin de partie, à la victoire comme à la mort (chap. 7) */
  recap: {
    title: 'Bilan de la partie',
    wealth: 'Patrimoine net, matin après matin',
    reached: (day: number, district: string) => `Jour ${day}, ${district}`,
    adviceTitle: 'Pour la prochaine fois',
    advice: {
      'bio-bricks':
        "La dette se rembourse chez Viktor, à Hives, jour et nuit. Solde-la tôt : ses intérêts courent chaque matin, et l'Audit ne pardonne rien. La case Dette du bandeau et le compte à rebours de l'Audit le rappellent.",
      death:
        'La Santé ne remonte qu’au relais routier, au plat du routier de la Cantine ou à la Morgue. Chauffeur à bout, une fuite ratée peut être la dernière : sous le seuil, préfère la fouille ou le bluff.',
      execution:
        "Le Vieux Serveur Aeterna ne survit à aucune fouille : avec lui à bord, bluffe, corromps ou fuis, mais n'ouvre jamais la soute. Les trajets courts et une soute couverte de Tier 0 limitent le risque.",
    } satisfies Record<'bio-bricks' | 'death' | 'execution', string>,
    groups: { money: 'Argent', road: 'Route', jobs: 'Commandes', gear: 'Parcours' },
    score: 'Score',
    peak: 'Patrimoine au plus haut',
    final: 'Patrimoine final',
    bought: 'Achats de marchandise',
    sold: 'Ventes',
    trips: 'Trajets',
    tripsValue: (day: number, night: number) => `${day} de jour · ${night} de nuit`,
    controls: 'Contrôles',
    controlsValue: (total: number, clean: number) => `${total}, dont ${clean} sans perte`,
    tactics: 'Fuites · bluffs · corruptions réussis',
    custody: 'Garde à vue',
    days: (days: number) => `${days} jour${days > 1 ? 's' : ''}`,
    cratesLost: 'Caisses perdues aux contrôles',
    deliveries: 'Commandes du DSC livrées',
    contracts: 'Contrats de la Pègre',
    contractsValue: (done: number, failed: number) => `${done} livré${done > 1 ? 's' : ''} · ${failed} manqué${failed > 1 ? 's' : ''}`,
    debtPaid: 'Dette initiale soldée',
    debtPaidValue: (day: number | null) => (day === null ? 'jamais' : `Jour ${day}`),
    wantedMax: 'Fiche S au plus haut',
    vehicle: 'Véhicule final',
    vehicleValue: (name: string, modules: number) => `${name}${modules > 0 ? ` · ${modules} module${modules > 1 ? 's' : ''}` : ''}`,
    atDay: (amount: string, day: number) => `${amount} (J${day})`,
    toDo: "Ce qu'il reste à accomplir",
    print: 'Imprimer',
    share: 'Partager',
    copied: 'Bilan copié : il ne reste qu’à le coller.',
    shareTitle: 'Concordia',
    shareVictory: (ending: string, score: string, days: number, mode: string) =>
      `Concordia (${mode}) — ${ending}. Score : ${score} en ${days} jours.`,
    shareDefeat: (ending: string, day: number, mode: string) => `Concordia (${mode}) — ${ending}, au Jour ${day}.`,
    shareStats: (controls: number, escapes: number, night: number) =>
      `${controls} contrôle${controls > 1 ? 's' : ''} de la BRC, ${escapes} fuite${escapes > 1 ? 's' : ''}, ${night} trajet${night > 1 ? 's' : ''} de nuit.`,
    shareFeats: (feats: string) => `Hauts faits : ${feats}.`,
  },

  /** Manuel du passeur : les règles en clair, depuis l'accueil et En bref (chap. 7) */
  manual: {
    title: 'Manuel du passeur',
    open: 'Manuel',
    previous: 'Précédent',
    next: 'Suivant',
    chapters: (days: number, debts: readonly { mode: string; debt: string }[]): ManualChapter[] => [
      {
        title: 'Le but du jeu',
        paragraphs: [
          `La partie dure ${days} jours. Tu dois de l'argent à Viktor Varga (${oneOf(debts.map(({ mode, debt }) => `${debt} en mode ${mode}`))}), et sa dette grossit chaque matin : rembourse-la à l'Arrière-Salle de Viktor Varga, à Hives, ouverte jour et nuit.`,
          `Le Jour ${days} à minuit, l'Audit d'Aeterna efface ton Cash-Puce. Si la dette n'est pas soldée, c'est la fin. Sinon, ton score est le solde de ton compte offshore et de ton placement du Cartel, tous deux à la Laverie de The Glass Spire, ouverte de jour seulement.`,
          `Ce score, et ce que tu as accompli, décident de ta fin : de simple Survivant à Saboteur. Une fois la dette initiale soldée, l’encart « Objectifs du Jour ${days} » d’En bref montre ce que chaque grande fin exige.`,
          'On perd aussi en mourant (Santé à zéro) ou en se faisant fouiller avec le Vieux Serveur Aeterna à bord.',
          "Trois modes de difficulté, au choix à l'accueil : Citoyen pour découvrir, Contrebandier pour le jeu normal, Hors-la-loi pour qui le connaît. Ils changent la dette de départ, l'avance de Viktor et les amendes de la BRC ; la carrière garde un meilleur score par mode.",
        ],
      },
      {
        title: 'Une journée',
        paragraphs: [
          "À 06h00, la routine : salaire de l'équipier, intérêts, collecte de Viktor les jours prévus, fraîcheur des produits au frais, événements du jour, cours et boutiques. Le briefing d'En bref résume ce qui a changé.",
          'De jour : acheter, vendre, faire le plein, passer aux lieux spéciaux du district, accepter la livraison officielle du DSC, et 1 trajet. On peut aussi attendre le soir sur place.',
          "À 20h00, le couvre-feu : dormir au relais routier (Santé et ICC), bivouaquer à Rust Valley, ou partir en tournée de nuit depuis la carte. Sur mission du DSC, le trajet est couvert et payé ; hors mission, il est risqué et ajoute un niveau de Fiche S s'il passe (sauf sous la plaque rotative, illisible pour les caméras). Une tournée épuise : pas de seconde nuit d'affilée sans Tcherno-Bull.",
          'Garde à vue, panne ou siphonage font perdre une demi-journée : on passe directement au soir.',
        ],
      },
      {
        title: 'Le marché',
        paragraphs: [
          "Chaque district a sa liste Production (pas cher) et sa Forte demande (bien payé, jamais en boutique là-bas). Le cours du jour se lit sur place ; ailleurs, tu n'as que ta mémoire du dernier passage, et la tendance publique du Fil.",
          "Rachat au cours : un district ne rachète qu'un nombre limité de caisses de chaque produit au plein prix, et sa demande se reconstitue chaque matin. Au-delà, le prix s'effondre et Aeterna repère un pic suspect : le risque y monte le lendemain.",
          "Une caisse revendue là où elle a été achetée, sans avoir voyagé, se vend mal. Les produits au frais perdent leur prime d'Extra-frais à 20h00, puis se dégradent jusqu'à être perdus.",
          "La nuit, le marché de rue reste ouvert : le Festif s'y vend mieux, surtout à l'after du couvre-feu.",
        ],
      },
      {
        title: 'Les tags',
        paragraphs: ['Chaque produit porte des tags : ils disent ce qui le trahit, ce qui le protège et où il se vend le mieux.'],
        list: 'tags',
      },
      {
        title: 'La route et la BRC',
        paragraphs: [
          "Le risque d'un trajet s'affiche avant le départ, ligne par ligne : district, ICC, tags de la soute, nuit, districts traversés, Fiche S. Les caisses légales le diluent.",
          'Aeterna a de la mémoire. Refaire la même liaison plusieurs jours de suite la fait repérer : le risque monte, et retombe quand tu varies tes routes. Et plus ton patrimoine grossit, plus on parle de toi : la notoriété rend chaque contrôle plus probable, sauf à Rust Valley. Un Citoyen Or attire deux fois moins les regards.',
          "Un barrage fixe se voit de loin : toutes les options sont ouvertes. Un contrôle volant (un drone t'a repéré) ne laisse ni fuir ni éjecter : restent la fouille, le bluff et la corruption.",
          "Fouille : formalité si la soute est légale, sinon saisie, amende et perte d'ICC, garde à vue pour le haut tier. Bluff : le Tier 0 et le masquage aident, l'odeur trahit. Corruption : du cash, et une caisse de Luxe pour la connivence. Fuite : sauve la soute, coûte du châssis et un niveau de Fiche S ; elle tient à l'équipement (assistance de conduite, pare-buffles, transpondeur) et au dopage, pas au reste de la soute. Éjection : larguer l'illégal avant le barrage.",
          'Le double fond cache quelques caisses illégales : à la fouille, un second jet décide si les agents le trouvent.',
          'À Rust Valley, pas de BRC mais des milices : payer leur péage, forcer le passage ou refuser.',
        ],
      },
      {
        title: 'Les jauges',
        paragraphs: [
          "ICC : ta conformité. Basse, elle attire les contrôles et ferme des portes ; au palier Citoyen Or, les portiques s'ouvrent plus vite.",
          "Santé : à zéro, c'est la mort. Elle remonte au relais, au plat du routier de la Cantine ou à la Morgue. Chauffeur à bout, bluff et fuite deviennent plus durs ; en fuite, l'assistance de conduite compense.",
          "Châssis : il s'use la nuit et dans les coups durs ; Mitch le répare à Rust Valley. À zéro, la dépanneuse te coûte une facture et une demi-journée.",
          "Synthanol : chaque trajet en consomme, davantage pour traverser des districts. Fiche S : le regard d'Aeterna ; chaque niveau ajoute du risque partout, et s'efface après quelques jours sans écart.",
          "Cash-Puce : exposé aux amendes, au racket, à la collecte de Viktor et à l'Audit. Le compte offshore, lui, est intouchable.",
        ],
      },
      {
        title: 'Véhicules, modules et équipage',
        paragraphs: [
          "Le Garage « Faraday » de Mécano-Mitch, à Rust Valley, vend des châssis plus grands et des modules : chacun sert un build (couverture légale, chaîne du froid, fuite, corruption, haut tier). Certains ne sortent qu'aux clients qui ont fait leurs preuves.",
          "Au changement de châssis, les modules démontables suivent, les adaptables se paient, les soudés restent sur l'ancien.",
          'Au Quai 9 de Hives, un équipier à la fois : Vance réduit le risque et aide la corruption, Glitch voit tous les cours et pirate les feux, Mama Rosa sublime la vraie nourriture. Chacun se présente après un acte qui le fait remarquer.',
        ],
      },
      {
        title: 'Les lieux spéciaux',
        paragraphs: [
          "Ouverts de 06h00 à 20h00, sauf l'Arrière-Salle de Viktor qui ne ferme jamais. Certains services ne s'ouvrent qu'à qui s'est fait une place : le lieu affiche la condition et ta progression.",
        ],
        list: 'places',
      },
      {
        title: 'Les événements',
        paragraphs: [
          'Événements globaux : tirés la veille, ils frappent toute la ville. Une rumeur les annonce parfois, avec sa fiabilité ; Cassandre-88 les garantit.',
          "Événements locaux : visibles dès 06h00 sur la carte, pour la journée. Le lendemain d'une flambée, le contrecoup fait retomber le cours : on revend le jour même.",
          'Aléas routiers : de jour, sans barrage, une rencontre et deux choix. La nuit, personne dans les galeries.',
          "Loterie de l'Ascenseur Civique : chaque semaine, un promu (purge préventive dans son district, et parfois ton équipier qui disparaît) et parfois un déclassé, qui emporte ses vices un étage plus bas.",
        ],
      },
      {
        title: 'Conseils du passeur',
        paragraphs: [
          'Commence petit : les produits bon marché de Hives se revendent à Rust Valley, et ce qu’on y trouve remonte vers Hives et Pastel-Heights.',
          'Solde la dette tôt : chaque matin la fait grossir, et une fois soldée, Viktor ouvre ses contrats et Mitch son matériel de contrebande.',
          "Mets ton argent à l'abri à la Laverie dès que tu passes à The Glass Spire : la collecte de Viktor, les amendes et l'Audit ne touchent pas l'offshore.",
          "Survole les pourcentages : chaque chance, chaque risque, chaque prix s'explique ligne par ligne au survol ou au toucher.",
        ],
      },
    ],
    tags: {
      'TAG-LEGAL': 'Ne trahit rien : dilue le risque de la soute, aide le bluff, et chaque caisse masque une caisse illégale.',
      'TAG-PERISHABLE': "Doit rester au frais : prime le jour de l'achat, puis décote jusqu'à être perdu. La canicule l'abîme.",
      'TAG-FRAGILE': 'Peut casser en fuite et aux chocs : une caisse endommagée se vend moins cher.',
      'TAG-ADDICTIVE': 'Clientèle captive : le rachat au cours se reconstitue plus vite.',
      'TAG-ODOROUS': 'Attire les contrôles en route et gêne le bluff ; doublé chez les chiens-robots d’Olympus-Green.',
      'TAG-CULTURE': 'Dénoncé par les Voisins-Vigiles de Pastel-Heights.',
      'TAG-TECH': 'Repéré par les scanners de The Glass Spire et d’Olympus-Green.',
      'TAG-BIO': 'Flairé par les bio-scanners de Panacea.',
      'TAG-FESTIVE': 'Se vend mieux la nuit, et bien mieux à l’after du couvre-feu.',
      'TAG-LUXURY': 'Seul cadeau qu’un agent accepte en corruption, avec la connivence en prime.',
      'TAG-GOURMET': 'La vraie nourriture d’avant : Mama Rosa la vend plus cher.',
    } satisfies Record<TagId, string>,
    places: {
      'LOC-D1-1': 'Viktor Varga : rembourser, emprunter une avance, et ses contrats de livraison.',
      'LOC-D1-2': 'Le plat du routier, une fois par jour, et le Synthanol au tarif syndical.',
      'LOC-D1-3': 'Recruter, remplacer ou renvoyer ton équipier.',
      'LOC-D2-1': 'Commander une panique algorithmique : un tag flambe partout le lendemain.',
      'LOC-D3-1': 'Laissez-passer sanitaire, chirurgie, certificat de décontamination (ICC).',
      'LOC-D4-1': 'Châssis, modules, montage et réparations.',
      'LOC-D4-2': "Savoir, et garantir, l'événement global d'après-demain.",
      'LOC-D5-1': 'Compte offshore, placement du Cartel, et faux dossiers de Loterie.',
      'LOC-D6-1': 'Enchères, commandes VIP et parrainage de l’élite.',
    } satisfies Record<LocationId, string>,
  },

  // Modes de difficulté (chap. 1)
  difficulty: {
    title: 'Mode de difficulté',
    modes: {
      citizen: { name: 'Citoyen', blurb: 'Pour découvrir : une dette légère, une avance généreuse et des amendes adoucies.' },
      smuggler: { name: 'Contrebandier', blurb: 'Le jeu tel qu’il est pensé : chaque erreur se paie, sans être fatale.' },
      outlaw: { name: 'Hors-la-loi', blurb: 'Pour qui connaît le jeu : une dette lourde, une avance de Viktor réduite, des amendes salées.' },
    } satisfies Record<DifficultyId, { name: string; blurb: string }>,
    settings: (debt: string, advance: string | null, fines: string | null) =>
      [`dette ${debt}`, advance ? `avance ${advance}` : 'aucune avance', fines ? `amendes ${fines}` : 'amendes normales'].join(' · '),
  },

  // Page de contrôle des images, hors jeu (`?debug=true`, chap. 7)
  debug: {
    title: 'Contrôle des images',
    intro:
      "Toutes les données qui peuvent recevoir une image, pour vérifier qu'elles sont présentes, cohérentes et de même taille. Le cadre en pointillés montre les bords réels du fichier.",
    summary: (present: number, total: number) => `${present} images sur ${total}`,
    size: (width: number, height: number) => `${width} × ${height} px`,
    missing: 'Manquante',
    odd: 'Taille différente',
    sections: { products: 'Produits', vehicles: 'Véhicules', modules: 'Modules', crew: 'Équipiers' },
    orphans: 'Fichiers sans donnée',
  },

  // ─── Données de jeu (chap. 2 à 6) ───

  tier: {
    0: 'Marchandises officielles',
    1: 'Petits plaisirs coupables',
    2: 'Contrebande culturelle & épicerie noire',
    3: 'Trafic lourd & « armes » gastronomiques',
    4: 'Ennemis publics n°1',
  } satisfies Record<Tier, string>,

  tag: {
    'TAG-LEGAL': { name: 'Légal' },
    'TAG-PERISHABLE': { name: 'Au frais' },
    'TAG-FRAGILE': { name: 'Fragile' },
    'TAG-ADDICTIVE': { name: 'Addictif' },
    'TAG-ODOROUS': { name: 'Odorant' },
    'TAG-CULTURE': { name: 'Culture' },
    'TAG-TECH': { name: 'Tech' },
    'TAG-BIO': { name: 'Bio-signature' },
    'TAG-LUXURY': { name: 'Luxe' },
    'TAG-FESTIVE': { name: 'Festif' },
    'TAG-GOURMET': { name: 'Gourmet' },
  } satisfies Record<TagId, Named>,

  product: {
    'T0-01': { name: 'Bio-Briques « Nutri-Standard »', lore: 'Soja et insectes compressés, saveur neutre garantie par décret.' },
    'T0-02': {
      name: 'Eau Minérale Déminéralisée',
      lore: "Rien dedans, et c'est bien là sa promesse. Empilée autour de l'électronique, elle boit les ondes des scanners.",
    },
    'T0-03': { name: 'Antidépresseurs « Sourire+ »', lore: "La bonne humeur d'État, en comprimés doux, sur ordonnance automatique." },
    'T0-04': { name: "Manuels d'Auto-Censure", lore: "Le guide officiel du Citoyen qui se corrige avant qu'on le corrige." },
    'T0-05': { name: 'Caisses scellées du DSC', lore: 'Contenu inconnu, plombs intacts : on livre, on ne regarde pas.' },
    'T1-01': {
      name: 'Œufs en Chocolat Fourrés',
      lore: 'Vrai cacao, vrai sucre, coquille qui casse pour un rien : le Comité de Pureté les cherche jusque dans les jardins.',
    },
    'T1-02': { name: "Grains d'Arabica Torréfiés", lore: 'Une odeur qui trahit à trois rues : le café réveille, et Aeterna déteste ça.' },
    'T1-03': { name: 'Beurre de Baratte Demi-Sel', lore: 'Gras, salé, interdit : le cholestérol en motte.' },
    'T1-04': { name: 'Nouilles « MSG-621 »', lore: 'Instantanées, hyper-salées, exhausteur de goût dopé : la consolation des dortoirs.' },
    'T1-05': { name: 'Chewing-gums à la Nicotine', lore: 'Le vice qui se mâche en silence, par cartons entiers.' },
    'T1-06': { name: 'Huile de Friture Usagée', lore: 'Bidons noirs de friteries clandestines, carburant des nuits grasses.' },
    'T2-01': { name: 'Curry Vindaloo « Lava-Grade »', lore: "Importé d'Inde par des routes oubliées, il brûle la langue et les capteurs." },
    'T2-02': {
      name: 'Saucisson Ibérique & Chorizo',
      lore: "Chorizo frais et saucisson à peine séché du Monde d'Avant : ça sent la rébellion, et ça tourne vite.",
    },
    'T2-03': { name: 'Caisses de Vinyles Rock & Rap', lore: "Des sillons pleins de colère d'avant-guerre, sans aucune connexion." },
    'T2-04': { name: 'Lots de « Dumbphones »', lore: 'Des téléphones à clapet sans Cloud : on appelle sans être écouté.' },
    'T2-05': { name: 'Canettes « Tcherno-Bull »', lore: 'Taurine à dose déraisonnable : de quoi tenir une nuit, ou doubler un barrage.' },
    'T2-06': { name: 'Clés USB « Monde Libre »', lore: "Des valises de mémoires interdites : livres, films, archives d'avant." },
    'T2-07': { name: 'Miel Sauvage Non-Pasteurisé', lore: 'Des ruches hors registre, des abeilles sans badge.' },
    'T3-01': { name: 'Roquefort « Bio-Hazard »', lore: 'Un fromage français classé arme biologique, et adoré pour ça.' },
    'T3-02': { name: 'Boîtes de Cigares Cubains', lore: 'Roulés à la main, fumés en cachette au sommet de la pyramide.' },
    'T3-03': { name: 'Whisky Écossais Vieilli', lore: 'Des fûts plus âgés que le Directoire, et bien plus respectés.' },
    'T3-04': {
      name: 'Antibiotiques « Old-School »',
      lore: "Antibiotiques et ivermectine d'avant les protocoles : ils soignent sans demander l'avis d'Aeterna.",
    },
    'T3-05': { name: 'Graines de Tomates Fertiles', lore: 'Des semences qui repoussent : un crime contre le monopole agricole.' },
    'T3-06': { name: 'Cartes Graphiques Sans Bride', lore: 'Du matériel rétro sans bride IA, assez puissant pour penser tout seul.' },
    'T3-07': { name: 'Clones Vocaux & Deepfakes', lore: 'Des voix et des visages sur mesure, pour mentir aux portiques.' },
    'T4-01': { name: 'Bœuf Wagyu de Kobé', lore: 'Wagyu et côtes argentines : la viande rouge, luxe suprême des élites.' },
    'T4-02': { name: "Œuvres d'Art du Monde d'Avant", lore: 'Des toiles sauvées des purges, roulées dans des malles.' },
    'T4-03': { name: 'Pass Biométriques « ICC-100% »', lore: 'Une identité de Citoyen modèle, le temps de passer un contrôle.' },
    'T4-04': {
      name: '« Placebo-Officiel » du DSC',
      lore: 'Du sérum physiologique sous scellé officiel : le QR-code sanitaire validé, sans la molécule de docilité.',
    },
    'T4-05': { name: 'Cellules Souches « Jouvence »', lore: 'Des cuves de clonage pour élites qui refusent de vieillir.' },
    'T4-06': { name: 'Vieux Serveur Aeterna', lore: "Une baie d'avant la mise à jour : la mémoire qu'Aeterna voudrait effacer." },
  } satisfies Record<ProductId, Named & { lore: string }>,

  district: {
    D1: { name: 'Hives', subtitle: 'Cités-dortoirs ouvrières' },
    D2: { name: 'Pastel-Heights', subtitle: "L'Éco-Ghetto Bobo & Campus Idéologique" },
    D3: { name: 'Panacea', subtitle: 'Le Complexe Pharmaceutique & Médical' },
    D4: {
      name: 'Rust Valley',
      subtitle: 'La Zone Tampon (friche industrielle & anciens abattoirs)',
    },
    D5: { name: 'The Glass Spire', subtitle: 'Ministères, banques & censure' },
    D6: { name: 'Olympus-Green', subtitle: 'La Citadelle Zéro-Carbone des Ultra-Élites' },
  } satisfies Record<DistrictId, NamedWithSubtitle>,

  location: {
    'LOC-D1-1': { name: "L'Arrière-Salle de Viktor Varga", subtitle: 'Usurier mafieux' },
    'LOC-D1-2': { name: 'La Cantine des Chauffeurs', subtitle: '« Chez Borg »' },
    'LOC-D1-3': { name: 'Le Quai 9', subtitle: 'Bar clandestin des quais de service' },
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
    'MOD-01': { name: 'Assistance de Conduite « Esquive »' },
    'MOD-02': { name: "Diffuseur d'Échappement « Pin Sylvestre & Javel »" },
    'MOD-03': { name: 'Doublure en Plomb & Cage de Faraday' },
    'MOD-04': { name: 'Suspensions & Silentblocs « Velours »' },
    'MOD-05': { name: "Plaque d'Immatriculation Rotative « E-Ink »" },
    'MOD-06': { name: 'Pare-Buffles en Acier Trempé' },
    'MOD-07': { name: 'Trappe de Largage « Égouts »' },
    'MOD-08': { name: 'Faux Terminal « Citoyen Or »' },
    'MOD-10': { name: 'Cloison Fantôme' },
  } satisfies Record<ModuleId, Named>,

  crew: {
    'CREW-01': {
      name: 'Commandant Vance',
      subtitle: "« L'Ancien de la BRC » : copilote accrédité, vieux limier d'avant Aeterna",
    },
    'CREW-02': {
      name: 'Glitch',
      subtitle: 'Jeune hackeuse sous caféine (opératrice radio distante)',
    },
    'CREW-03': {
      name: 'Mama Rosa',
      subtitle: "« La Matriarche » : cheffe étoilée d'avant le Grand Reset, atelier d'affinage",
    },
  } satisfies Record<CrewId, NamedWithSubtitle>,

  event: {
    'EVT-G01': { name: 'Alerte Canicule & Délestage Thermique' },
    'EVT-G02': { name: 'Alerte Sanitaire « Variant-X »' },
    'EVT-G03': { name: 'Blackout du Cloud & sevrage du Fil Rose' },
    'EVT-G04': { name: 'Éco-Panique' },
    'EVT-G05': { name: 'Blocus Alimentaire & Grève des Transports' },
    'EVT-G06': { name: 'La Nuit des Fondateurs' },
    'EVT-G07': { name: "Maintenance d'Aeterna" },
    'EVT-D1-01': { name: 'Grève des Éboueurs Automatisés' },
    'EVT-D1-02': { name: "Panne des Ascenseurs & Coupure d'Eau Chaude" },
    'EVT-D1-03': { name: "Descente d'Huissiers d'Aeterna" },
    'EVT-D2-01': { name: 'Tribunal Populaire « Détox & Repentance »' },
    'EVT-D2-02': { name: 'Festival Clandestin « Sans-Ondes »' },
    'EVT-D2-03': { name: 'Semaine des Partiels « Zéro-Échec »' },
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
