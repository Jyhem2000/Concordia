import type { CrewId, DistrictId, EventId, LocationId, ModuleId, ProductId, TagId, Tier, VehicleId } from '../engine/types.ts'

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
    clamp: 'Plafond',
    round: 'Arrondi',
  } as Record<string, string>,

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
