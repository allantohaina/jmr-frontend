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

export const PROFILE_NOTIFICATIONS: ProfileNotification[] = [];

export const PROFILE_ORDERS: ProfileOrder[] = [];

export const PROFILE_ACTIVITY: ProfileActivity[] = [];

export const PROFILE_DOCUMENTS: ProfileDocument[] = [];

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

export const TEXTILE_PROBLEM_THREADS: ProblemThread[] = [];

export const CLIENT_SIGNATURE_LOCK_COPY = {
  validationRequired: "Validation client requise avant de continuer.",
  lockedVersion: "Version signee verrouillee pour le client. Les corrections passent par une nouvelle version signee.",
};
