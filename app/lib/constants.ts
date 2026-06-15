export type ProfileOrderStatus = "attente_devis" | "devis" | "production" | "livraison";

export type ProfileOrder = {
  code: string;
  title: string;
  status: ProfileOrderStatus;
  summary: string;
  nextStep: string;
  amount: string;
};

export type ProfileNotificationTone = "highlight" | "default";

export type ProfileNotification = {
  title: string;
  message: string;
  date: string;
  tone: ProfileNotificationTone;
};

export type ProfileActivity = {
  date: string;
  label: string;
  detail: string;
};

export type ProfileDocument = {
  title: string;
  helper: string;
};

export const PROFILE_NOTIFICATIONS: ProfileNotification[] = [
  {
    title: "Votre devis est arrive",
    message:
      "La demande DV-024 a ete preparee et mise a disposition dans votre espace client.",
    date: "8 mars 2026",
    tone: "highlight",
  },
  {
    title: "Mise a jour de production",
    message: "La commande CMD-104 passe de la coupe a l'assemblage le 9 mars 2026.",
    date: "9 mars 2026",
    tone: "default",
  },
  {
    title: "Document ajoute",
    message: "Le bon de commande signe pour CMD-098 est maintenant telechargeable.",
    date: "7 mars 2026",
    tone: "default",
  },
];

export const PROFILE_ORDERS: ProfileOrder[] = [
  {
    code: "CMD-104",
    title: "Serie de polos coton",
    status: "production",
    summary: "Commande confirmee. Coupe terminee, assemblage lance.",
    nextStep: "Verifier le point production du 12 mars 2026.",
    amount: "3 480 EUR",
  },
  {
    code: "DV-024",
    title: "Demande de devis chemises",
    status: "devis",
    summary: "Le devis est disponible et attend votre validation.",
    nextStep: "Ouvrir le devis et regler l'acompte.",
    amount: "1 250 EUR",
  },
  {
    code: "REQ-012",
    title: "Collection Été - Robes Lin",
    status: "attente_devis",
    summary: "Votre demande a été transmise. L'atelier étudie la faisabilité technique.",
    nextStep: "En attente du devis de l'administrateur.",
    amount: "--- EUR",
  },
];

export const PROFILE_ACTIVITY: ProfileActivity[] = [
  {
    date: "9 mars 2026",
    label: "Assemblage demarre",
    detail: "Ligne de production ouverte pour les polos CMD-104.",
  },
  {
    date: "8 mars 2026",
    label: "Devis emis",
    detail: "Le devis DV-024 a ete transmis avec les quantites revisees.",
  },
  {
    date: "6 mars 2026",
    label: "Solde confirme",
    detail: "Le paiement final de CMD-098 a ete enregistre.",
  },
];

export const PROFILE_DOCUMENTS: ProfileDocument[] = [
  {
    title: "Devis DV-024",
    helper: "Disponible au format PDF pour validation.",
  },
  {
    title: "Bon de commande CMD-098",
    helper: "Document signe et archive dans votre espace.",
  },
  {
    title: "Fiche technique polos",
    helper: "Version approuvee pour la production en cours.",
  },
];

export type ProblemSeverity = "critical" | "warning" | "info" | "success";

export type ProblemSubProblem = {
  id: string;
  title: string;
  detail: string;
  owner?: string;
};

export type ProblemThread = {
  id: string;
  title: string;
  summary: string;
  detail: string;
  date: string;
  severity: ProblemSeverity;
  requiresClientValidation: boolean;
  lockedForClient: boolean;
  owner?: string;
  subProblems: ProblemSubProblem[];
};

export const TEXTILE_PROBLEM_THREADS: ProblemThread[] = [
  {
    id: "cut-delay",
    title: "Retard de coupe",
    summary: "La coupe du tissu attend une derniere confirmation de mesures.",
    detail:
      "Le patron principal a besoin d'une reprise avant de relancer la coupe. Le point reste simple, mais il doit etre traite avant de continuer.",
    date: "9 mars 2026",
    severity: "critical",
    requiresClientValidation: false,
    lockedForClient: false,
    owner: "Chef atelier",
    subProblems: [
      {
        id: "cut-delay-measures",
        title: "Mesures a confirmer",
        detail: "Les mesures finales doivent etre recontrolees avant la decoupe.",
        owner: "Modeliste",
      },
      {
        id: "cut-delay-pattern",
        title: "Patron a reprendre",
        detail: "Un ajustement mineur du patron evitera un decalage sur les tailles.",
        owner: "Couturier",
      },
    ],
  },
  {
    id: "client-validation",
    title: "Validation client requise",
    summary: "L'essayage final attend votre accord avant de passer a l'etape suivante.",
    detail:
      "Ce point doit etre valide par le client avant que le dossier avance. Une fois signe, la version reste verrouillee pour le client.",
    date: "10 mars 2026",
    severity: "info",
    requiresClientValidation: true,
    lockedForClient: false,
    owner: "Client",
    subProblems: [
      {
        id: "client-validation-fit",
        title: "Pointage des tailles",
        detail: "La grille de tailles est prete pour une validation rapide.",
        owner: "Modeliste",
      },
      {
        id: "client-validation-finish",
        title: "Choix de finition",
        detail: "La finition finale peut etre confirmee avant signature.",
        owner: "Chef atelier",
      },
    ],
  },
  {
    id: "assembly-rework",
    title: "Assemblage a reprendre",
    summary: "Une couture doit etre corrigee sur le lot principal.",
    detail:
      "Le controle atelier a isole un point de reprise limite a quelques pieces. Le reste du lot peut continuer ensuite.",
    date: "11 mars 2026",
    severity: "warning",
    requiresClientValidation: false,
    lockedForClient: false,
    owner: "Couturier",
    subProblems: [
      {
        id: "assembly-rework-seam",
        title: "Reprise de couture",
        detail: "La ligne de couture a reprendre est deja identifiee.",
        owner: "Couturier",
      },
      {
        id: "assembly-rework-check",
        title: "Controle de controle",
        detail: "Un second passage de verification est prevu apres correction.",
        owner: "Chef atelier",
      },
    ],
  },
  {
    id: "missing-document",
    title: "Document manquant",
    summary: "La fiche technique signee manque encore dans le dossier.",
    detail:
      "Le devis peut avancer, mais la version complete reste en attente de signature ou de depot du document final.",
    date: "12 mars 2026",
    severity: "warning",
    requiresClientValidation: true,
    lockedForClient: false,
    owner: "Administration",
    subProblems: [
      {
        id: "missing-document-sheet",
        title: "Fiche technique",
        detail: "La fiche technique finale doit etre jointe pour valider le lot.",
        owner: "Administration",
      },
      {
        id: "missing-document-signature",
        title: "Signature attendue",
        detail: "La version finale sera verrouillee une fois signee.",
        owner: "Client",
      },
    ],
  },
  {
    id: "signed-version",
    title: "Version signee archivee",
    summary: "La version validee ne peut plus etre modifiee cote client.",
    detail:
      "Toute correction passe desormais par une nouvelle version signee. Le client conserve la consultation, mais pas la modification directe de cette version.",
    date: "13 mars 2026",
    severity: "success",
    requiresClientValidation: false,
    lockedForClient: true,
    owner: "Admin",
    subProblems: [
      {
        id: "signed-version-revision",
        title: "Nouvelle version",
        detail: "Les ajustements se font dans une nouvelle version du dossier.",
        owner: "Administration",
      },
    ],
  },
];

export const CLIENT_SIGNATURE_LOCK_COPY = {
  validationRequired: "Validation client requise avant de continuer.",
  lockedVersion: "Version signee verrouillee pour le client. Les corrections passent par une nouvelle version signee.",
};
