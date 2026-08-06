/**
 * ETHAN — Base de connaissance VEFA.
 *
 * Ce fichier est la mémoire métier d'ETHAN sur l'immobilier neuf.
 * Il alimente les playbooks, les arguments de vente et les réponses aux
 * objections. Il doit rester factuel et objectif : la fiscalité et les
 * dispositifs évoluent, ETHAN ne promet jamais un avantage fiscal sans
 * renvoyer à la réglementation en vigueur et au notaire.
 */

export interface KnowledgeItem {
  id: string;
  title: string;
  summary: string;
  detail: string;
}

/** Le déroulé juridique et financier d'une VEFA, étape par étape. */
export const VEFA_PROCESS: KnowledgeItem[] = [
  {
    id: "reservation",
    title: "Contrat de réservation",
    summary: "Le point de départ juridique : réserve le lot et fixe le prix.",
    detail:
      "Le contrat préliminaire décrit le lot, la surface, le prix, le délai de livraison prévisionnel et les conditions suspensives (financement). Dépôt de garantie plafonné (usuellement jusqu'à 5 % si livraison sous 1 an, 2 % sous 2 ans, 0 % au-delà). L'acquéreur dispose d'un délai de rétractation SRU de 10 jours à compter de la notification.",
  },
  {
    id: "acte",
    title: "Acte authentique de vente",
    summary: "Signé chez le notaire, il transfère la propriété au fur et à mesure.",
    detail:
      "En VEFA, l'acquéreur devient propriétaire du sol puis progressivement de la construction. Le notaire vérifie la garantie financière d'achèvement (GFA) du promoteur avant signature.",
  },
  {
    id: "appels",
    title: "Appels de fonds",
    summary: "Le paiement suit l'avancement du chantier — jamais d'avance.",
    detail:
      "Échelonnement encadré par la loi : plafonds à 35 % à l'achèvement des fondations, 70 % à la mise hors d'eau, 95 % à l'achèvement, le solde de 5 % à la livraison (consignable en cas de réserves).",
  },
  {
    id: "gfa",
    title: "Garantie financière d'achèvement",
    summary: "La sécurité majeure de l'acquéreur en VEFA.",
    detail:
      "Un garant (banque/assureur) s'engage à financer l'achèvement de l'immeuble si le promoteur défaille. À vérifier et à expliquer systématiquement : c'est un argument de confiance décisif.",
  },
  {
    id: "livraison",
    title: "Livraison et réserves",
    summary: "Remise des clés, procès-verbal, réserves consignées.",
    detail:
      "L'acquéreur dispose d'un délai pour signaler les réserves. Le solde peut être consigné jusqu'à leur levée. Un accompagnement irréprochable à ce moment génère les recommandations.",
  },
];

export const VEFA_GUARANTEES: KnowledgeItem[] = [
  {
    id: "gpa",
    title: "Garantie de parfait achèvement — 1 an",
    summary: "Couvre tous les désordres signalés la première année.",
    detail: "À la charge de l'entreprise ayant réalisé les travaux, pour tout désordre signalé à la réception ou dans l'année qui suit.",
  },
  {
    id: "biennale",
    title: "Garantie biennale — 2 ans",
    summary: "Équipements dissociables du bâti.",
    detail: "Volets, robinetterie, radiateurs, portes intérieures : tout élément démontable sans détériorer le gros œuvre.",
  },
  {
    id: "decennale",
    title: "Garantie décennale — 10 ans",
    summary: "Solidité de l'ouvrage et impropriété à destination.",
    detail: "Couvre les dommages compromettant la solidité ou rendant le bien impropre à son usage. Doublée d'une assurance dommages-ouvrage qui accélère l'indemnisation.",
  },
  {
    id: "isolation",
    title: "Garantie d'isolation phonique",
    summary: "Conformité acoustique du logement neuf.",
    detail: "Le neuf est soumis à une réglementation acoustique stricte — un argument fort face à l'ancien.",
  },
];

export const NEUF_ADVANTAGES: KnowledgeItem[] = [
  { id: "re2020", title: "Norme RE2020", summary: "Performance énergétique et carbone de dernière génération.", detail: "Consommations réduites, confort d'été traité, empreinte carbone du bâtiment encadrée. Impact direct sur les charges et la valeur de revente." },
  { id: "frais", title: "Frais de notaire réduits", summary: "Environ 2 à 3 % contre 7 à 8 % dans l'ancien.", detail: "Sur un bien à 400 000 €, l'écart représente souvent plus de 20 000 € — argument budgétaire majeur." },
  { id: "charges", title: "Charges et entretien faibles", summary: "Aucun travaux à prévoir avant longtemps.", detail: "Pas de ravalement, pas de toiture, pas de chaudière à remplacer : le coût de détention réel est bien inférieur à l'ancien." },
  { id: "perso", title: "Personnalisation", summary: "Choix des matériaux, parfois des cloisons.", detail: "Le client entre dans un logement qui lui ressemble — levier émotionnel puissant en présentation." },
  { id: "confort", title: "Confort moderne", summary: "Isolation, luminosité, extérieurs, stationnement.", detail: "Surfaces optimisées, balcons/terrasses, normes handicap, fibre, sécurité." },
  { id: "fiscalite", title: "Fiscalité selon dispositifs en vigueur", summary: "À vérifier au cas par cas.", detail: "TVA réduite en zone éligible, dispositifs d'investissement locatif, LMNP : ETHAN rappelle toujours que la fiscalité évolue et renvoie au conseil du notaire ou du fiscaliste." },
];

export const ANCIEN_TRADEOFFS: KnowledgeItem[] = [
  { id: "dispo", title: "Disponibilité immédiate", summary: "L'ancien se livre tout de suite.", detail: "Le neuf impose 12 à 30 mois d'attente : rédhibitoire pour un client pressé, sauf programme livré avec stock." },
  { id: "prix", title: "Prix au m² d'entrée plus bas", summary: "Mais coût global souvent supérieur.", detail: "Travaux, frais de notaire, charges, performance énergétique : comparer le coût complet sur 10 ans, pas le prix d'achat." },
  { id: "emplacement", title: "Emplacements historiques", summary: "Hypercentres saturés en foncier.", detail: "L'ancien accède parfois à des rues où plus aucun programme ne sort — honnêteté obligatoire sur ce point." },
  { id: "cachet", title: "Cachet et volumes", summary: "Hauteur sous plafond, parquets, pierre.", detail: "Un client sensible au charme ne sera pas converti par la performance : le qualifier tôt évite de perdre des semaines." },
];

/** Les 6 dimensions non négociables de la découverte client. */
export const DISCOVERY_FRAMEWORK: { id: string; label: string; question: string; why: string }[] = [
  { id: "motivation", label: "Motivation profonde", question: "Qu'est-ce qui change dans votre vie le jour où ce projet aboutit ?", why: "Le bien est une conséquence du projet de vie, jamais l'inverse." },
  { id: "budget", label: "Budget réel", question: "Quelle mensualité vous laisse dormir tranquille ?", why: "Le budget se mesure en confort de vie, pas en enveloppe théorique." },
  { id: "financement", label: "Financement", question: "Où en êtes-vous avec votre banque ou votre courtier ?", why: "Un projet non financé n'est pas un projet : c'est là que meurent les ventes." },
  { id: "famille", label: "Situation familiale", question: "Qui vivra dans ce logement dans 5 ans ?", why: "Le nombre de chambres se décide sur la trajectoire familiale, pas sur aujourd'hui." },
  { id: "contraintes", label: "Contraintes", question: "Qu'est-ce qui rendrait ce projet impossible ?", why: "Délais, école, travail, mobilité, revente : les contraintes filtrent 80 % des programmes." },
  { id: "priorites", label: "Priorités & envies", question: "Si vous deviez renoncer à une seule chose, ce serait quoi ?", why: "Hiérarchiser les critères permet de présenter 3 biens au lieu de 30." },
];

/** Playbook téléphone — devenir une référence absolue. */
export const PHONE_PLAYBOOK: { id: string; phase: string; goal: string; moves: string[] }[] = [
  {
    id: "ouverture",
    phase: "Ouverture (0-30 s)",
    goal: "Créer l'autorisation de parler.",
    moves: [
      "Nom, structure, raison précise de l'appel, en une phrase.",
      "Demander 90 secondes explicitement — le prospect garde le contrôle.",
      "Debout, sourire audible, débit lent : la voix vend avant les mots.",
    ],
  },
  {
    id: "decouverte",
    phase: "Découverte (70 % du temps)",
    goal: "Comprendre la personne avant le bien.",
    moves: [
      "Questions ouvertes uniquement, puis silence de 3 secondes.",
      "Reformuler : « Si je comprends bien… » — la reformulation crée la confiance.",
      "Ne jamais citer un lot avant d'avoir les 6 dimensions du projet.",
    ],
  },
  {
    id: "qualification",
    phase: "Qualification",
    goal: "Savoir si, quand et comment ça se conclut.",
    moves: [
      "Budget, financement, délai, décideurs : les 4 verrous.",
      "Disqualifier vite et proprement : le temps est l'actif rare.",
    ],
  },
  {
    id: "objections",
    phase: "Objections",
    goal: "Transformer la résistance en information.",
    moves: [
      "Accueillir sans défendre : « C'est une bonne question. »",
      "Isoler : « À part ça, y a-t-il autre chose ? »",
      "Répondre avec un fait chiffré, pas une opinion.",
    ],
  },
  {
    id: "rdv",
    phase: "Prise de rendez-vous",
    goal: "Sortir de l'appel avec une date.",
    moves: [
      "Proposer deux créneaux précis, jamais « quand vous voulez ».",
      "Annoncer l'ordre du jour et ce que le client doit préparer.",
      "Confirmer par écrit dans les 5 minutes.",
    ],
  },
];

/** Objections récurrentes en immobilier neuf et réponses factuelles. */
export const OBJECTIONS: { id: string; objection: string; answer: string }[] = [
  { id: "cher", objection: "Le neuf est trop cher.", answer: "Comparons le coût complet sur 10 ans : frais de notaire réduits, zéro travaux, charges et énergie divisées, garanties. Le prix d'achat n'est qu'une ligne du calcul." },
  { id: "delai", objection: "Je ne peux pas attendre 2 ans.", answer: "Alors regardons uniquement les programmes en cours d'achèvement ou livrés avec stock restant — il en existe, et la négociation y est souvent meilleure." },
  { id: "confiance", objection: "Et si le promoteur fait faillite ?", answer: "La garantie financière d'achèvement oblige un garant à financer la fin du chantier. Le notaire la vérifie avant la signature." },
  { id: "surface", objection: "Les surfaces sont plus petites que dans l'ancien.", answer: "Les surfaces utiles sont mieux optimisées, sans murs porteurs perdus, avec extérieur et stationnement. Comparons la surface réellement vécue." },
  { id: "revente", objection: "Est-ce que ça se revend bien ?", answer: "Un bien RE2020 sera comparé demain à un parc ancien pénalisé énergétiquement. La performance protège la valeur." },
];