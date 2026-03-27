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
