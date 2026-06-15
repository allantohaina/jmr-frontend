"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CreditCard,
  Loader2,
  RefreshCcw,
  Save,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { backofficeHrAPI } from "@/app/lib/backoffice-hr-api";

const DRAFT_STORAGE_KEY = "jmr-add-employee-draft-v1";

const ETAT_CIVIL = {
  CELIBATAIRE: "CELIBATAIRE",
  MARIE: "MARIE",
  DIVORCE: "DIVORCE",
  VEUF: "VEUF",
} as const;

const ETAT_CIVIL_OPTIONS = [
  { value: ETAT_CIVIL.CELIBATAIRE, label: "Celibataire" },
  { value: ETAT_CIVIL.MARIE, label: "Marie(e)" },
  { value: ETAT_CIVIL.DIVORCE, label: "Divorce(e)" },
  { value: ETAT_CIVIL.VEUF, label: "Veuf/Veuve" },
];

const TRIAL_DURATIONS = [
  { value: "2", label: "2 mois" },
  { value: "3", label: "3 mois" },
  { value: "6", label: "6 mois" },
];

const SUGGESTED_CONTRACT_DURATIONS: Record<string, number[]> = {
  CONT001: [],
  CONT002: [3, 6, 12, 18, 24],
  CONT003: [1, 2, 3, 6],
  CONT004: [12, 18, 24, 36],
  CONT008: [3, 6, 12, 18],
  CONT010: [3, 6, 9, 12],
};

const inputClassName =
  "w-full rounded-2xl border border-[#163526]/10 bg-[#fcfbf7] px-4 py-3 text-sm text-[#163526] outline-none transition focus:border-orange-400 focus:bg-white";
const labelClassName =
  "mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[#163526]/45";

type EtatCivil = (typeof ETAT_CIVIL)[keyof typeof ETAT_CIVIL];
type LookupRecord = Record<string, unknown>;

type OptionItem = {
  id: string;
  label: string;
  meta?: string;
};

type PaymentMode = {
  id: string;
  typePaiementId: string;
  nomBanque: string;
  codeBanque: string;
  codeGuichet: string;
  numeroCompte: string;
  cleRib: string;
  titulaireCompte: string;
  domiciliationAgence: string;
  telephoneMobile: string;
  estActif: boolean;
  estParDefaut: boolean;
};

type ManagerSummary = {
  id: string;
  fullName: string;
};

type LookupState = {
  sexes: OptionItem[];
  contractTypes: OptionItem[];
  departments: OptionItem[];
  nationalities: OptionItem[];
  regions: OptionItem[];
  categories: OptionItem[];
  workTimes: OptionItem[];
  entryTypes: OptionItem[];
  paymentTypes: OptionItem[];
};

type EmployeeFormState = {
  nom: string;
  prenom: string;
  sexeId: string;
  dateNaissance: string;
  telephone: string;
  email: string;
  adresse: string;
  nomMere: string;
  nomPere: string;
  lieuNaissance: string;
  nationaliteId: string;
  contactUrgence: string;
  emailUrgence: string;
  adresseUrgence: string;
  telephoneUrgence: string;
  numCnaps: string;
  cin: string;
  nombreEnfants: string;
  etatCivil: EtatCivil;
  nomConjoint: string;
  numOstie: string;
  codePostal: string;
  idRegion: string;
  dateEmbauche: string;
  matricule: string;
  salaireBaseEssai: string;
  salaireBaseApresEssai: string;
  typeContratId: string;
  dureeContratMois: string;
  posteId: string;
  departementId: string;
  managerId: string;
  classification: string;
  idCategorie: string;
  idTempsTravail: string;
  idTypeEntree: string;
  avecPeriodeEssai: boolean;
  dureeEssai: string;
  dateDebutEssai: string;
  dateFinEssai: string;
  dateFinAssignation: string;
  modePaiements: PaymentMode[];
};

type AddEmployeePageProps = {
  basePath?: string;
};

type FieldErrors = Record<string, string>;
type TouchedFields = Record<string, boolean>;

function createLocalId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getAccountHolder(state: Pick<EmployeeFormState, "nom" | "prenom">) {
  return `${state.nom} ${state.prenom}`.trim();
}

function createPaymentMode(holder: string, isDefault: boolean): PaymentMode {
  return {
    id: createLocalId(),
    typePaiementId: "",
    nomBanque: "",
    codeBanque: "",
    codeGuichet: "",
    numeroCompte: "",
    cleRib: "",
    titulaireCompte: holder,
    domiciliationAgence: "",
    telephoneMobile: "",
    estActif: true,
    estParDefaut: isDefault,
  };
}

function createInitialForm(): EmployeeFormState {
  return {
    nom: "",
    prenom: "",
    sexeId: "",
    dateNaissance: "",
    telephone: "",
    email: "",
    adresse: "",
    nomMere: "",
    nomPere: "",
    lieuNaissance: "",
    nationaliteId: "",
    contactUrgence: "",
    emailUrgence: "",
    adresseUrgence: "",
    telephoneUrgence: "",
    numCnaps: "",
    cin: "",
    nombreEnfants: "0",
    etatCivil: ETAT_CIVIL.CELIBATAIRE,
    nomConjoint: "",
    numOstie: "",
    codePostal: "",
    idRegion: "",
    dateEmbauche: "",
    matricule: "",
    salaireBaseEssai: "",
    salaireBaseApresEssai: "",
    typeContratId: "",
    dureeContratMois: "",
    posteId: "",
    departementId: "",
    managerId: "",
    classification: "",
    idCategorie: "",
    idTempsTravail: "",
    idTypeEntree: "",
    avecPeriodeEssai: true,
    dureeEssai: "3",
    dateDebutEssai: "",
    dateFinEssai: "",
    dateFinAssignation: "",
    modePaiements: [],
  };
}

function toLookupArray(value: unknown): LookupRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is LookupRecord => typeof item === "object" && item !== null);
}

function pickText(record: LookupRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return "";
}

function pickId(record: LookupRecord) {
  const value = record.id ?? record.code ?? record.value;

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
}

function normalizeOptions(data: unknown, labelKeys: string[], metaKeys: string[] = ["code"]) {
  const options: OptionItem[] = [];

  for (const record of toLookupArray(data)) {
    const id = pickId(record);
    const label = pickText(record, labelKeys);
    const meta = pickText(record, metaKeys);

    if (!id || !label) {
      continue;
    }

    const option: OptionItem = {
      id,
      label,
    };

    if (meta) {
      option.meta = meta;
    }

    options.push(option);
  }

  return options;
}

function normalizeManager(data: unknown): ManagerSummary | null {
  if (typeof data !== "object" || data === null) {
    return null;
  }

  const record = data as LookupRecord;
  const employee =
    typeof record.employe === "object" && record.employe !== null
      ? (record.employe as LookupRecord)
      : undefined;

  const baseRecord = employee ?? record;
  const firstName = pickText(baseRecord, ["prenom", "firstName", "first_name"]);
  const lastName = pickText(baseRecord, ["nom", "lastName", "last_name"]);
  const fallbackName = pickText(record, ["fullName", "nomComplet", "name"]);
  const fullName = `${firstName} ${lastName}`.trim() || fallbackName;
  const id = pickId(record);

  if (!id || !fullName) {
    return null;
  }

  return {
    id,
    fullName,
  };
}

function calculateTrialEnd(startDate: string, durationInMonths: string) {
  if (!startDate || !durationInMonths) {
    return "";
  }

  const [year, month, day] = startDate.split("-").map(Number);
  let target = new Date(year, month - 1 + Number(durationInMonths), day);

  if (target.getDate() !== day) {
    target = new Date(year, month - 1 + Number(durationInMonths) + 1, 0);
  }

  target.setDate(target.getDate() - 1);

  const yyyy = target.getFullYear();
  const mm = String(target.getMonth() + 1).padStart(2, "0");
  const dd = String(target.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

function calculateContractEnd(startDate: string, durationInMonths: string) {
  if (!startDate || !durationInMonths) {
    return "";
  }

  const target = new Date(startDate);
  target.setMonth(target.getMonth() + Number.parseInt(durationInMonths, 10));
  const lastDay = new Date(target.getFullYear(), target.getMonth(), 0);

  return lastDay.toISOString().split("T")[0] ?? "";
}

function getNextDate(dateValue: string) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0] ?? "";
}

function formatDateLabel(value: string) {
  if (!value) {
    return "A definir";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatCurrency(value: string) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    return "A definir";
  }

  return `${amount.toLocaleString("fr-FR")} Ar`;
}

function getPaymentModeKind(option?: OptionItem) {
  const label = option?.label.toLowerCase() ?? "";

  if (
    label.includes("mobile") ||
    label.includes("mvola") ||
    label.includes("orange") ||
    label.includes("airtel")
  ) {
    return "mobile";
  }

  if (label.includes("cash") || label.includes("espece")) {
    return "cash";
  }

  if (label.includes("bank") || label.includes("banque") || label.includes("rib") || label.includes("virement")) {
    return "bank";
  }

  return "generic";
}

function applyDerivedFields(state: EmployeeFormState): EmployeeFormState {
  const next = {
    ...state,
    modePaiements: state.modePaiements.map((mode) => ({
      ...mode,
      titulaireCompte: mode.titulaireCompte || getAccountHolder(state),
    })),
  };
  const isCDI = next.typeContratId === "CONT001";
  const isCDD = next.typeContratId === "CONT002";

  if (next.etatCivil !== ETAT_CIVIL.MARIE) {
    next.nomConjoint = "";
  }

  if (isCDI) {
    next.avecPeriodeEssai = true;
    next.dureeEssai = next.dureeEssai || "3";
    next.dureeContratMois = "";
  } else if (isCDD) {
    next.dureeEssai = next.dureeEssai || "3";
    next.dureeContratMois = next.dureeContratMois || "12";
  }

  const trialEnabled = isCDI || (isCDD && next.avecPeriodeEssai);

  if (trialEnabled) {
    next.dateDebutEssai = next.dateDebutEssai || next.dateEmbauche;
    next.dateFinEssai = calculateTrialEnd(next.dateDebutEssai || next.dateEmbauche, next.dureeEssai);
  } else {
    next.dateDebutEssai = "";
    next.dateFinEssai = "";
  }

  if (!isCDI && next.dateEmbauche && next.dureeContratMois) {
    next.dateFinAssignation = calculateContractEnd(next.dateEmbauche, next.dureeContratMois);
  } else {
    next.dateFinAssignation = "";
  }

  if (next.modePaiements.length > 0 && !next.modePaiements.some((mode) => mode.estParDefaut)) {
    next.modePaiements[0] = { ...next.modePaiements[0], estParDefaut: true };
  }

  return next;
}

function findOptionLabel(options: OptionItem[], id: string) {
  return options.find((option) => option.id === id)?.label ?? "A definir";
}

function isBlank(value: string) {
  return value.trim().length === 0;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidPhone(value: string) {
  return /^[+0-9()\-\s]{8,}$/.test(value.trim());
}

function isPositiveNumber(value: string) {
  return Number.isFinite(Number(value)) && Number(value) > 0;
}

function getFieldErrors(state: EmployeeFormState, paymentTypeMap: Map<string, OptionItem>): FieldErrors {
  const errors: FieldErrors = {};
  const trialEnabled = state.typeContratId === "CONT001" || (state.typeContratId === "CONT002" && state.avecPeriodeEssai);

  if (isBlank(state.nom)) {
    errors.nom = "Le nom est obligatoire.";
  }

  if (isBlank(state.prenom)) {
    errors.prenom = "Le prenom est obligatoire.";
  }

  if (isBlank(state.cin)) {
    errors.cin = "Le CIN est obligatoire.";
  }

  if (isBlank(state.sexeId)) {
    errors.sexeId = "Choisissez le sexe.";
  }

  if (isBlank(state.dateNaissance)) {
    errors.dateNaissance = "La date de naissance est obligatoire.";
  } else if (new Date(state.dateNaissance) > new Date()) {
    errors.dateNaissance = "La date de naissance ne peut pas etre dans le futur.";
  }

  if (isBlank(state.nationaliteId)) {
    errors.nationaliteId = "Choisissez la nationalite.";
  }

  if (isBlank(state.telephone)) {
    errors.telephone = "Le telephone est obligatoire.";
  } else if (!isValidPhone(state.telephone)) {
    errors.telephone = "Le numero de telephone semble invalide.";
  }

  if (isBlank(state.email)) {
    errors.email = "L'email est obligatoire.";
  } else if (!isValidEmail(state.email)) {
    errors.email = "L'adresse email est invalide.";
  }

  if (isBlank(state.adresse)) {
    errors.adresse = "L'adresse est obligatoire.";
  }

  if (!isBlank(state.nombreEnfants) && Number(state.nombreEnfants) < 0) {
    errors.nombreEnfants = "Le nombre d'enfants ne peut pas etre negatif.";
  }

  if (state.etatCivil === ETAT_CIVIL.MARIE && isBlank(state.nomConjoint)) {
    errors.nomConjoint = "Le nom du conjoint est obligatoire pour un employe marie.";
  }

  if (isBlank(state.contactUrgence)) {
    errors.contactUrgence = "Ajoutez au moins un contact d'urgence.";
  }

  if (!isBlank(state.telephoneUrgence) && !isValidPhone(state.telephoneUrgence)) {
    errors.telephoneUrgence = "Le numero du contact d'urgence semble invalide.";
  }

  if (!isBlank(state.emailUrgence) && !isValidEmail(state.emailUrgence)) {
    errors.emailUrgence = "L'email du contact d'urgence est invalide.";
  }

  if (isBlank(state.matricule)) {
    errors.matricule = "Le matricule est obligatoire.";
  }

  if (isBlank(state.dateEmbauche)) {
    errors.dateEmbauche = "La date d'embauche est obligatoire.";
  }

  if (isBlank(state.typeContratId)) {
    errors.typeContratId = "Choisissez le type de contrat.";
  }

  if (!isBlank(state.dureeContratMois) && Number(state.dureeContratMois) <= 0) {
    errors.dureeContratMois = "La duree du contrat doit etre superieure a zero.";
  }

  if (state.typeContratId && state.typeContratId !== "CONT001" && isBlank(state.dureeContratMois)) {
    errors.dureeContratMois = "Precisez la duree du contrat.";
  }

  if (isBlank(state.departementId)) {
    errors.departementId = "Choisissez le departement.";
  }

  if (isBlank(state.posteId)) {
    errors.posteId = "Choisissez le poste.";
  }

  if (isBlank(state.salaireBaseEssai)) {
    errors.salaireBaseEssai = "Le salaire de base est obligatoire.";
  } else if (!isPositiveNumber(state.salaireBaseEssai)) {
    errors.salaireBaseEssai = "Le salaire de base doit etre superieur a zero.";
  }

  if (trialEnabled) {
    if (isBlank(state.salaireBaseApresEssai)) {
      errors.salaireBaseApresEssai = "Le salaire apres essai est obligatoire.";
    } else if (!isPositiveNumber(state.salaireBaseApresEssai)) {
      errors.salaireBaseApresEssai = "Le salaire apres essai doit etre superieur a zero.";
    }

    if (isBlank(state.dateFinEssai)) {
      errors.dateFinEssai = "La date de fin d'essai doit etre calculee.";
    }
  }

  let hasDefaultPaymentMode = false;

  state.modePaiements.forEach((mode, index) => {
    const hasStartedPaymentMode = [
      mode.typePaiementId,
      mode.nomBanque,
      mode.numeroCompte,
      mode.telephoneMobile,
    ].some((value) => value.trim());

    if (!hasStartedPaymentMode) {
      return;
    }

    const keyPrefix = `modePaiements.${index}`;
    const kind = getPaymentModeKind(paymentTypeMap.get(mode.typePaiementId));

    if (mode.estParDefaut) {
      hasDefaultPaymentMode = true;
    }

    if (isBlank(mode.typePaiementId)) {
      errors[`${keyPrefix}.typePaiementId`] = "Choisissez le type de paiement.";
    }

    if (kind === "mobile" && isBlank(mode.telephoneMobile)) {
      errors[`${keyPrefix}.telephoneMobile`] = "Le numero mobile est obligatoire pour ce mode.";
    }

    if ((kind === "bank" || kind === "generic") && isBlank(mode.nomBanque)) {
      errors[`${keyPrefix}.nomBanque`] = "Le nom de la banque est obligatoire.";
    }

    if ((kind === "bank" || kind === "generic") && isBlank(mode.numeroCompte)) {
      errors[`${keyPrefix}.numeroCompte`] = "Le numero de compte est obligatoire.";
    }
  });

  const hasStartedAnyPaymentMode = state.modePaiements.some((mode) =>
    [mode.typePaiementId, mode.nomBanque, mode.numeroCompte, mode.telephoneMobile].some((value) => value.trim()),
  );

  if (hasStartedAnyPaymentMode && !hasDefaultPaymentMode) {
    errors.modePaiements = "Choisissez un mode de paiement par defaut.";
  }

  return errors;
}

function getStepFieldKeys(step: number, state: EmployeeFormState, paymentTypeMap: Map<string, OptionItem>) {
  if (step === 1) {
    return [
      "nom",
      "prenom",
      "cin",
      "sexeId",
      "dateNaissance",
      "nationaliteId",
      "telephone",
      "email",
      "adresse",
      "nombreEnfants",
      "nomConjoint",
      "contactUrgence",
      "telephoneUrgence",
      "emailUrgence",
    ];
  }

  if (step === 2) {
    return [
      "matricule",
      "dateEmbauche",
      "typeContratId",
      "dureeContratMois",
      "departementId",
      "posteId",
      "salaireBaseEssai",
      "salaireBaseApresEssai",
      "dateFinEssai",
    ];
  }

  if (step === 3) {
    const keys = ["modePaiements"];

    state.modePaiements.forEach((mode, index) => {
      const hasStartedPaymentMode = [
        mode.typePaiementId,
        mode.nomBanque,
        mode.numeroCompte,
        mode.telephoneMobile,
      ].some((value) => value.trim());

      if (!hasStartedPaymentMode) {
        return;
      }

      const kind = getPaymentModeKind(paymentTypeMap.get(mode.typePaiementId));
      keys.push(`modePaiements.${index}.typePaiementId`);

      if (kind === "mobile") {
        keys.push(`modePaiements.${index}.telephoneMobile`);
      }

      if (kind === "bank" || kind === "generic") {
        keys.push(`modePaiements.${index}.nomBanque`);
        keys.push(`modePaiements.${index}.numeroCompte`);
      }
    });

    return keys;
  }

  return [];
}

function getStepError(step: number, state: EmployeeFormState, paymentTypeMap: Map<string, OptionItem>) {
  const fieldErrors = getFieldErrors(state, paymentTypeMap);
  const stepFieldKeys = getStepFieldKeys(step, state, paymentTypeMap);

  for (const key of stepFieldKeys) {
    if (fieldErrors[key]) {
      return fieldErrors[key];
    }
  }

  return null;
}

function buildPayload(
  state: EmployeeFormState,
  assignedManager: ManagerSummary | null,
  paymentTypeMap: Map<string, OptionItem>,
) {
  const filledPaymentModes = state.modePaiements.filter((mode) =>
    [mode.typePaiementId, mode.nomBanque, mode.numeroCompte, mode.telephoneMobile].some((value) => value.trim()),
  );

  const validPaymentModes = filledPaymentModes.filter((mode) => {
    const kind = getPaymentModeKind(paymentTypeMap.get(mode.typePaiementId));

    if (!mode.typePaiementId) {
      return false;
    }

    if (kind === "mobile") {
      return Boolean(mode.telephoneMobile.trim());
    }

    if (kind === "bank") {
      return Boolean(mode.nomBanque.trim() && mode.numeroCompte.trim());
    }

    return true;
  });

  const infosProfessionnelles: Array<Record<string, unknown>> = [];
  const manager = assignedManager ? { id: assignedManager.id } : state.managerId ? { id: state.managerId } : null;
  const trialEnabled = state.typeContratId === "CONT001" || (state.typeContratId === "CONT002" && state.avecPeriodeEssai);

  if (trialEnabled) {
    infosProfessionnelles.push({
      matricule: state.matricule,
      dateEmbauche: state.dateEmbauche,
      dateDebutAssignationPoste: state.dateEmbauche,
      dateFinAssignationPoste: state.dateFinEssai,
      salaireBase: Number.parseFloat(state.salaireBaseEssai),
      typeContrat: { id: "CONT002" },
      poste: { id: state.posteId },
      departement: { id: state.departementId },
      categorieProfessionnelle: state.idCategorie ? { id: state.idCategorie } : null,
      typeTempsTravail: state.idTempsTravail ? { id: state.idTempsTravail } : null,
      typeEntree: state.idTypeEntree ? { id: state.idTypeEntree } : null,
      manager,
      employe: {},
    });

    const nextStart = getNextDate(state.dateFinEssai);
    const nextContractId = state.typeContratId;
    const nextContractEnd =
      nextContractId === "CONT001" ? null : calculateContractEnd(nextStart, state.dureeContratMois);

    infosProfessionnelles.push({
      matricule: state.matricule,
      dateEmbauche: state.dateEmbauche,
      dateDebutAssignationPoste: nextStart,
      dateFinAssignationPoste: nextContractEnd,
      salaireBase: Number.parseFloat(state.salaireBaseApresEssai),
      typeContrat: { id: nextContractId },
      poste: { id: state.posteId },
      departement: { id: state.departementId },
      categorieProfessionnelle: state.idCategorie ? { id: state.idCategorie } : null,
      typeTempsTravail: state.idTempsTravail ? { id: state.idTempsTravail } : null,
      typeEntree: state.idTypeEntree ? { id: state.idTypeEntree } : null,
      manager,
      employe: {},
    });
  } else {
    infosProfessionnelles.push({
      matricule: state.matricule,
      dateEmbauche: state.dateEmbauche,
      dateDebutAssignationPoste: state.dateEmbauche,
      dateFinAssignationPoste:
        state.typeContratId === "CONT001" ? null : calculateContractEnd(state.dateEmbauche, state.dureeContratMois),
      salaireBase: Number.parseFloat(state.salaireBaseEssai || state.salaireBaseApresEssai),
      typeContrat: { id: state.typeContratId },
      poste: { id: state.posteId },
      departement: { id: state.departementId },
      categorieProfessionnelle: state.idCategorie ? { id: state.idCategorie } : null,
      typeTempsTravail: state.idTempsTravail ? { id: state.idTempsTravail } : null,
      typeEntree: state.idTypeEntree ? { id: state.idTypeEntree } : null,
      manager,
      employe: {},
    });
  }

  return {
    employe: {
      nom: state.nom,
      prenom: state.prenom,
      dateNaissance: state.dateNaissance,
      telephone: state.telephone,
      email: state.email,
      adresse: state.adresse,
      nomMere: state.nomMere || "",
      nomPere: state.nomPere || "",
      lieuNaissance: state.lieuNaissance || "",
      numCnaps: state.numCnaps || "",
      numOstie: state.numOstie || "",
      codePostal: state.codePostal ? Number.parseInt(state.codePostal, 10) : 0,
      cin: state.cin,
      nbEnfants: state.nombreEnfants ? Number.parseInt(state.nombreEnfants, 10) : 0,
      etatCivil: state.etatCivil,
      nomConjoint: state.etatCivil === ETAT_CIVIL.MARIE ? state.nomConjoint : null,
    },
    region: {
      id: state.idRegion,
    },
    sexe: {
      id: state.sexeId,
    },
    nationalite: {
      id: state.nationaliteId,
    },
    infosAdministratives: {
      createdAt: `${new Date().toISOString().split("T")[0]}T08:00:00`,
      modifiedAt: null,
    },
    emergencyContact: {
      nom: state.contactUrgence,
      email: state.emailUrgence || "",
      adresse: state.adresseUrgence || "",
      contact: state.telephoneUrgence || "",
    },
    infosProfessionnelles,
    modePaiements: validPaymentModes.map((mode) => ({
      nomBanque: mode.nomBanque,
      codeBanque: mode.codeBanque,
      codeGuichet: mode.codeGuichet,
      numeroCompte: mode.numeroCompte,
      cleRib: mode.cleRib,
      titulaireCompte: mode.titulaireCompte,
      domiciliationAgence: mode.domiciliationAgence,
      telephoneMobile: mode.telephoneMobile,
      estActif: mode.estActif,
      estParDefaut: mode.estParDefaut,
      typePaiement: { id: mode.typePaiementId },
    })),
  };
}

function StepBadge({
  index,
  title,
  active,
  done,
  onClick,
}: {
  index: number;
  title: string;
  active: boolean;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-[160px] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
        active
          ? "border-[#163526] bg-[#163526] text-white shadow-lg"
          : done
            ? "border-orange-200 bg-orange-50 text-[#163526]"
            : "border-[#163526]/10 bg-[#fcfbf7] text-[#163526]/75 hover:bg-white"
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
          active ? "bg-white/15 text-white" : done ? "bg-orange-500 text-white" : "bg-[#163526]/6 text-[#163526]"
        }`}
      >
        {done && !active ? <CheckCircle2 className="h-4 w-4" /> : index}
      </span>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-60">Etape {index}</p>
        <p className="text-sm font-semibold">{title}</p>
      </div>
    </button>
  );
}

function StatCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5 backdrop-blur">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-orange-300">
        {icon}
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-white/65">{helper}</p>
    </div>
  );
}

function Field({
  label,
  children,
  helper,
  error,
}: {
  label: string;
  children: ReactNode;
  helper?: string;
  error?: string;
}) {
  return (
    <label
      className={`block ${
        error
          ? "[&_input]:border-red-400 [&_input]:bg-red-50/60 [&_input]:focus:border-red-500 [&_select]:border-red-400 [&_select]:bg-red-50/60 [&_select]:focus:border-red-500"
          : ""
      }`}
    >
      <span className={`${labelClassName} ${error ? "text-red-600" : ""}`}>{label}</span>
      {children}
      {error ? <span className="mt-2 block text-xs font-medium text-red-600">{error}</span> : null}
      {helper ? <span className="mt-2 block text-xs text-[#163526]/45">{helper}</span> : null}
    </label>
  );
}

export default function AddEmployeePage({ basePath = "/backoffice" }: AddEmployeePageProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<EmployeeFormState>(createInitialForm);
  const [lookups, setLookups] = useState<LookupState>({
    sexes: [],
    contractTypes: [],
    departments: [],
    nationalities: [],
    regions: [],
    categories: [],
    workTimes: [],
    entryTypes: [],
    paymentTypes: [],
  });
  const [positions, setPositions] = useState<OptionItem[]>([]);
  const [assignedManager, setAssignedManager] = useState<ManagerSummary | null>(null);
  const [isLookupLoading, setIsLookupLoading] = useState(true);
  const [isPositionsLoading, setIsPositionsLoading] = useState(false);
  const [isManagerLoading, setIsManagerLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftReady, setIsDraftReady] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({});

  const paymentTypeMap = useMemo(
    () => new Map(lookups.paymentTypes.map((option) => [option.id, option])),
    [lookups.paymentTypes],
  );

  const isCDI = form.typeContratId === "CONT001";
  const isCDD = form.typeContratId === "CONT002";
  const trialEnabled = isCDI || (isCDD && form.avecPeriodeEssai);
  const contractDurations = SUGGESTED_CONTRACT_DURATIONS[form.typeContratId] ?? [];
  const accountHolder = useMemo(() => `${form.nom} ${form.prenom}`.trim(), [form.nom, form.prenom]);
  const completion = useMemo(() => {
    const fields = [
      form.nom,
      form.prenom,
      form.cin,
      form.sexeId,
      form.nationaliteId,
      form.dateNaissance,
      form.telephone,
      form.email,
      form.adresse,
      form.contactUrgence,
      form.matricule,
      form.dateEmbauche,
      form.typeContratId,
      form.departementId,
      form.posteId,
      form.salaireBaseEssai,
      isCDI ? "filled" : form.typeContratId ? form.dureeContratMois : "optional",
      trialEnabled ? form.salaireBaseApresEssai : "optional",
    ];

    const meaningfulFields = fields.filter((value) => value !== "optional");
    const filled = meaningfulFields.filter((value) => Boolean(String(value).trim())).length;

    return Math.round((filled / meaningfulFields.length) * 100);
  }, [
    form.adresse,
    form.cin,
    form.contactUrgence,
    form.dateEmbauche,
    form.dateNaissance,
    form.departementId,
    form.dureeContratMois,
    form.email,
    form.matricule,
    form.nationaliteId,
    form.nom,
    form.posteId,
    form.prenom,
    form.salaireBaseApresEssai,
    form.salaireBaseEssai,
    form.sexeId,
    form.telephone,
    form.typeContratId,
    isCDI,
    trialEnabled,
  ]);

  const stepTitles = [
    "Profil personnel",
    "Contrat et poste",
    "Paiement et verification",
  ];
  const fieldErrors = useMemo(() => getFieldErrors(form, paymentTypeMap), [form, paymentTypeMap]);
  const currentStepFieldKeys = useMemo(
    () => getStepFieldKeys(step, form, paymentTypeMap),
    [step, form, paymentTypeMap],
  );
  const currentStepVisibleIssues = useMemo(
    () => currentStepFieldKeys.filter((field) => touchedFields[field] && fieldErrors[field]),
    [currentStepFieldKeys, fieldErrors, touchedFields],
  );

  useEffect(() => {
    try {
      const draft = window.localStorage.getItem(DRAFT_STORAGE_KEY);

      if (draft) {
        const parsed = JSON.parse(draft) as Partial<EmployeeFormState>;
        const nextForm = applyDerivedFields({
          ...createInitialForm(),
          ...parsed,
          modePaiements: Array.isArray(parsed.modePaiements) ? parsed.modePaiements : [],
        });
        setForm(nextForm);
      }
    } catch (draftError) {
      console.error("Failed to restore employee draft:", draftError);
    } finally {
      setIsDraftReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isDraftReady) {
      return;
    }

    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(form));
  }, [form, isDraftReady]);

  useEffect(() => {
    async function loadLookups() {
      setIsLookupLoading(true);
      setError("");

      try {
        const [
          sexesResponse,
          contractTypesResponse,
          departmentsResponse,
          nationalitiesResponse,
          regionsResponse,
          categoriesResponse,
          workTimesResponse,
          entryTypesResponse,
          paymentTypesResponse,
        ] = await Promise.all([
          backofficeHrAPI.get<LookupRecord[]>("/lookups/sexes"),
          backofficeHrAPI.get<LookupRecord[]>("/lookups/type-contrats"),
          backofficeHrAPI.get<LookupRecord[]>("/lookups/departements"),
          backofficeHrAPI.get<LookupRecord[]>("/lookups/nationalites"),
          backofficeHrAPI.get<LookupRecord[]>("/lookups/regions"),
          backofficeHrAPI.get<LookupRecord[]>("/lookups/categories-professionnelles"),
          backofficeHrAPI.get<LookupRecord[]>("/lookups/types-temps-travail"),
          backofficeHrAPI.get<LookupRecord[]>("/lookups/types-entree"),
          backofficeHrAPI.get<LookupRecord[]>("/lookups/types-paiement"),
        ]);

        setLookups({
          sexes: normalizeOptions(sexesResponse.data, ["sexe", "nom", "label", "libelle"]),
          contractTypes: normalizeOptions(contractTypesResponse.data, ["intitule", "nom", "label", "libelle"]),
          departments: normalizeOptions(departmentsResponse.data, ["nom", "label", "libelle"]),
          nationalities: normalizeOptions(nationalitiesResponse.data, ["nom", "nationalite", "label", "libelle"]),
          regions: normalizeOptions(regionsResponse.data, ["nom", "label", "libelle"]),
          categories: normalizeOptions(categoriesResponse.data, ["libelle", "nom", "label"], ["code"]),
          workTimes: normalizeOptions(workTimesResponse.data, ["tempsTravail", "libelle", "nom"]),
          entryTypes: normalizeOptions(entryTypesResponse.data, ["nom", "libelle", "typeEntree", "label"]),
          paymentTypes: normalizeOptions(paymentTypesResponse.data, ["nom", "libelle", "typePaiement", "intitule"]),
        });
      } catch (lookupError) {
        console.error("Failed to fetch employee lookup data:", lookupError);
        setError("Impossible de charger les listes necessaires pour le formulaire.");
      } finally {
        setIsLookupLoading(false);
      }
    }

    void loadLookups();
  }, []);

  useEffect(() => {
    if (lookups.regions.length === 0 && lookups.workTimes.length === 0) {
      return;
    }

    setForm((current) => {
      let changed = false;
      const next = { ...current };

      if (!current.idRegion) {
        const defaultRegion = lookups.regions.find((region) => region.label.toLowerCase().includes("analamanga"));
        if (defaultRegion) {
          next.idRegion = defaultRegion.id;
          changed = true;
        }
      }

      if (!current.idTempsTravail) {
        const defaultWorkTime = lookups.workTimes.find((workTime) =>
          workTime.label.toLowerCase().includes("plein"),
        );

        if (defaultWorkTime) {
          next.idTempsTravail = defaultWorkTime.id;
          changed = true;
        }
      }

      return changed ? next : current;
    });
  }, [lookups.regions, lookups.workTimes]);

  useEffect(() => {
    if (!form.departementId) {
      setPositions([]);
      setAssignedManager(null);
      return;
    }

    let cancelled = false;

    async function loadDepartmentDetails() {
      setIsPositionsLoading(true);
      setIsManagerLoading(true);

      const [positionsResult, managerResult] = await Promise.allSettled([
        backofficeHrAPI.get<LookupRecord[]>(`/departements/${form.departementId}/postes`),
        backofficeHrAPI.get<LookupRecord>(`/departements/${form.departementId}/manager`),
      ]);

      if (cancelled) {
        return;
      }

      if (positionsResult.status === "fulfilled") {
        const nextPositions = normalizeOptions(positionsResult.value.data, ["nom", "libelle", "intitule"]);
        setPositions(nextPositions);
        setForm((current) =>
          nextPositions.some((position) => position.id === current.posteId)
            ? current
            : { ...current, posteId: "" },
        );
      } else {
        setPositions([]);
      }

      if (managerResult.status === "fulfilled") {
        const manager = normalizeManager(managerResult.value.data);
        setAssignedManager(manager);
        setForm((current) => ({
          ...current,
          managerId: manager?.id ?? "",
        }));
      } else {
        setAssignedManager(null);
        setForm((current) => ({
          ...current,
          managerId: "",
        }));
      }

      setIsPositionsLoading(false);
      setIsManagerLoading(false);
    }

    void loadDepartmentDetails();

    return () => {
      cancelled = true;
    };
  }, [form.departementId]);

  useEffect(() => {
    setForm((current) => {
      if (current.modePaiements.length === 0) {
        return current;
      }

      const nextModes = current.modePaiements.map((mode) =>
        mode.titulaireCompte === accountHolder ? mode : { ...mode, titulaireCompte: accountHolder },
      );

      const hasChanged = nextModes.some(
        (mode, index) => mode.titulaireCompte !== current.modePaiements[index]?.titulaireCompte,
      );

      return hasChanged ? { ...current, modePaiements: nextModes } : current;
    });
  }, [accountHolder]);

  function updateForm(updater: (current: EmployeeFormState) => EmployeeFormState) {
    setError("");
    setSuccess("");
    setForm((current) => applyDerivedFields(updater(current)));
  }

  function markFieldsAsTouched(fields: string[]) {
    if (fields.length === 0) {
      return;
    }

    setTouchedFields((current) => {
      const next = { ...current };

      for (const field of fields) {
        next[field] = true;
      }

      return next;
    });
  }

  function getVisibleError(field: string) {
    return touchedFields[field] ? fieldErrors[field] : undefined;
  }

  function handleFieldChange<K extends keyof EmployeeFormState>(field: K, value: EmployeeFormState[K]) {
    setTouchedFields((current) => ({
      ...current,
      [String(field)]: true,
    }));

    updateForm((current) => {
      const next = { ...current, [field]: value } as EmployeeFormState;

      if (field === "departementId") {
        next.posteId = "";
        next.managerId = "";
      }

      if (field === "typeContratId" && value !== "CONT002" && value !== "CONT001") {
        next.avecPeriodeEssai = false;
      }

      return next;
    });
  }

  function handlePaymentModeChange<K extends keyof PaymentMode>(index: number, field: K, value: PaymentMode[K]) {
    setTouchedFields((current) => ({
      ...current,
      [`modePaiements.${index}.${String(field)}`]: true,
      modePaiements: true,
    }));

    updateForm((current) => {
      const modes = [...current.modePaiements];
      const target = modes[index];

      if (!target) {
        return current;
      }

      modes[index] = { ...target, [field]: value };

      if (field === "estParDefaut" && value === true) {
        for (let modeIndex = 0; modeIndex < modes.length; modeIndex += 1) {
          if (modeIndex !== index) {
            modes[modeIndex] = { ...modes[modeIndex], estParDefaut: false };
          }
        }
      }

      return {
        ...current,
        modePaiements: modes,
      };
    });
  }

  function addPaymentMode() {
    updateForm((current) => {
      if (current.modePaiements.length >= 2) {
        return current;
      }

      return {
        ...current,
        modePaiements: [
          ...current.modePaiements,
          createPaymentMode(getAccountHolder(current), current.modePaiements.length === 0),
        ],
      };
    });
  }

  function removePaymentMode(index: number) {
    setTouchedFields((current) => {
      const next: TouchedFields = {};

      for (const [key, value] of Object.entries(current)) {
        if (!key.startsWith("modePaiements")) {
          next[key] = value;
        }
      }

      return next;
    });

    updateForm((current) => {
      const modes = current.modePaiements.filter((_, modeIndex) => modeIndex !== index);

      if (modes.length > 0 && !modes.some((mode) => mode.estParDefaut)) {
        modes[0] = { ...modes[0], estParDefaut: true };
      }

      return {
        ...current,
        modePaiements: modes,
      };
    });
  }

  function clearDraft() {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    setStep(1);
    setSuccess("");
    setError("");
    setTouchedFields({});
    setForm(applyDerivedFields(createInitialForm()));
  }

  function goToNextStep() {
    const stepError = getStepError(step, form, paymentTypeMap);

    if (stepError) {
      markFieldsAsTouched(getStepFieldKeys(step, form, paymentTypeMap));
      setError(stepError);
      return;
    }

    setStep((current) => Math.min(current + 1, stepTitles.length));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    for (let currentStep = 1; currentStep <= stepTitles.length; currentStep += 1) {
      const stepError = getStepError(currentStep, form, paymentTypeMap);

      if (stepError) {
        markFieldsAsTouched(getStepFieldKeys(currentStep, form, paymentTypeMap));
        setStep(currentStep);
        setError(stepError);
        return;
      }
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const payload = buildPayload(form, assignedManager, paymentTypeMap);
      const response = await backofficeHrAPI.post("/employes", payload);

      setSuccess(response.message || "Employe enregistre avec succes.");
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      setStep(1);
      setTouchedFields({});
      setForm(applyDerivedFields(createInitialForm()));
      setAssignedManager(null);
      setPositions([]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submitError) {
      console.error("Failed to create employee:", submitError);
      setError(submitError instanceof Error ? submitError.message : "Une erreur inattendue est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="px-6 py-10 md:px-12">
      <div className="space-y-8">
        <section className="overflow-hidden rounded-[2.75rem] bg-[linear-gradient(135deg,#163526_0%,#1f4b37_55%,#0c2118_100%)] px-6 py-8 text-white shadow-[0_30px_80px_rgba(16,37,28,0.35)] md:px-10 md:py-10">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl space-y-5">
              <Link
                href={basePath}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour au backoffice
              </Link>
              <div className="space-y-3">
                <p className="inline-flex items-center gap-2 rounded-full bg-orange-400/15 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-orange-200">
                  <Sparkles className="h-4 w-4" />
                  Ressources humaines
                </p>
                <h1 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
                  Creer un dossier employe relie au backoffice.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-white/72">
                  Les listes RH sont chargees depuis le backend et l&apos;enregistrement cree maintenant un vrai dossier
                  de test, sans raccourci temporaire.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={clearDraft}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Reinitialiser le formulaire
                </button>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/10 px-5 py-3 text-sm text-emerald-100">
                  <ShieldCheck className="h-4 w-4" />
                  Brouillon local actif
                </div>
              </div>
            </div>

            <div className="grid w-full gap-4 md:grid-cols-3 xl:max-w-[640px]">
              <StatCard
                icon={<UserPlus className="h-5 w-5" />}
                label="Progression"
                value={`${completion}%`}
                helper={`Etape ${step}/${stepTitles.length} en cours`}
              />
              <StatCard
                icon={<BriefcaseBusiness className="h-5 w-5" />}
                label="Contrat"
                value={findOptionLabel(lookups.contractTypes, form.typeContratId)}
                helper={form.dateFinAssignation ? `Fin prevue ${formatDateLabel(form.dateFinAssignation)}` : "CDI ou date a definir"}
              />
              <StatCard
                icon={<BadgeDollarSign className="h-5 w-5" />}
                label="Salaire"
                value={formatCurrency(form.salaireBaseApresEssai || form.salaireBaseEssai)}
                helper={trialEnabled ? "Salaire apres essai affiche en priorite" : "Base actuelle du contrat"}
              />
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-[1.75rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 shadow-sm">
            {success}
          </div>
        ) : null}

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <form onSubmit={handleSubmit} className="rounded-[2.25rem] border border-[#163526]/8 bg-white p-6 shadow-sm md:p-8">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                {stepTitles.map((title, index) => (
                  <StepBadge
                    key={title}
                    index={index + 1}
                    title={title}
                    active={step === index + 1}
                    done={step > index + 1}
                    onClick={() => setStep(index + 1)}
                  />
                ))}
              </div>

              {currentStepVisibleIssues.length > 0 ? (
                <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {currentStepVisibleIssues.length} champ{currentStepVisibleIssues.length > 1 ? "s" : ""} a corriger
                  avant de continuer.
                </div>
              ) : null}

              {isLookupLoading ? (
                <div className="flex min-h-[320px] items-center justify-center rounded-[2rem] border border-dashed border-[#163526]/12 bg-[#fcfbf7]">
                  <div className="flex items-center gap-3 text-sm text-[#163526]/65">
                    <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                    Chargement des listes RH...
                  </div>
                </div>
              ) : (
                <>
                  {step === 1 ? (
                    <div className="space-y-8">
                      <div className="grid gap-6 md:grid-cols-2">
                        <Field label="Nom *" error={getVisibleError("nom")}>
                          <input
                            className={inputClassName}
                            value={form.nom}
                            onChange={(event) => handleFieldChange("nom", event.target.value)}
                            placeholder="Rakoto"
                          />
                        </Field>
                        <Field label="Prenom *" error={getVisibleError("prenom")}>
                          <input
                            className={inputClassName}
                            value={form.prenom}
                            onChange={(event) => handleFieldChange("prenom", event.target.value)}
                            placeholder="Miora"
                          />
                        </Field>
                        <Field label="CIN *" error={getVisibleError("cin")}>
                          <input
                            className={inputClassName}
                            value={form.cin}
                            onChange={(event) => handleFieldChange("cin", event.target.value)}
                            placeholder="101 234 567 890"
                          />
                        </Field>
                        <Field label="Sexe *" error={getVisibleError("sexeId")}>
                          <select
                            className={inputClassName}
                            value={form.sexeId}
                            onChange={(event) => handleFieldChange("sexeId", event.target.value)}
                          >
                            <option value="">Choisir...</option>
                            {lookups.sexes.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Date de naissance *" error={getVisibleError("dateNaissance")}>
                          <input
                            type="date"
                            className={inputClassName}
                            value={form.dateNaissance}
                            onChange={(event) => handleFieldChange("dateNaissance", event.target.value)}
                          />
                        </Field>
                        <Field label="Lieu de naissance">
                          <input
                            className={inputClassName}
                            value={form.lieuNaissance}
                            onChange={(event) => handleFieldChange("lieuNaissance", event.target.value)}
                            placeholder="Antananarivo"
                          />
                        </Field>
                        <Field label="Nationalite *" error={getVisibleError("nationaliteId")}>
                          <select
                            className={inputClassName}
                            value={form.nationaliteId}
                            onChange={(event) => handleFieldChange("nationaliteId", event.target.value)}
                          >
                            <option value="">Choisir...</option>
                            {lookups.nationalities.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Telephone *" error={getVisibleError("telephone")}>
                          <input
                            className={inputClassName}
                            value={form.telephone}
                            onChange={(event) => handleFieldChange("telephone", event.target.value)}
                            placeholder="+261 ..."
                          />
                        </Field>
                        <Field label="Email *" error={getVisibleError("email")}>
                          <input
                            type="email"
                            className={inputClassName}
                            value={form.email}
                            onChange={(event) => handleFieldChange("email", event.target.value)}
                            placeholder="prenom.nom@atelier.com"
                          />
                        </Field>
                        <Field label="Adresse *" error={getVisibleError("adresse")}>
                          <input
                            className={inputClassName}
                            value={form.adresse}
                            onChange={(event) => handleFieldChange("adresse", event.target.value)}
                            placeholder="Quartier, ville"
                          />
                        </Field>
                      </div>

                      <div className="rounded-[2rem] border border-[#163526]/8 bg-[#fcfbf7] p-5 md:p-6">
                        <div className="mb-5 flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#163526] text-white">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-[#163526]">Situation personnelle</h2>
                            <p className="text-sm text-[#163526]/55">Informations administratives et foyer</p>
                          </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                          <Field label="Etat civil">
                            <select
                              className={inputClassName}
                              value={form.etatCivil}
                              onChange={(event) =>
                                handleFieldChange("etatCivil", event.target.value as EmployeeFormState["etatCivil"])
                              }
                            >
                              {ETAT_CIVIL_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </Field>
                          <Field label="Nombre d'enfants" error={getVisibleError("nombreEnfants")}>
                            <input
                              type="number"
                              min="0"
                              className={inputClassName}
                              value={form.nombreEnfants}
                              onChange={(event) => handleFieldChange("nombreEnfants", event.target.value)}
                            />
                          </Field>
                          {form.etatCivil === ETAT_CIVIL.MARIE ? (
                            <Field label="Nom du conjoint *" error={getVisibleError("nomConjoint")}>
                              <input
                                className={inputClassName}
                                value={form.nomConjoint}
                                onChange={(event) => handleFieldChange("nomConjoint", event.target.value)}
                                placeholder="Nom du conjoint"
                              />
                            </Field>
                          ) : null}
                          <Field label="Region">
                            <select
                              className={inputClassName}
                              value={form.idRegion}
                              onChange={(event) => handleFieldChange("idRegion", event.target.value)}
                            >
                              <option value="">Choisir...</option>
                              {lookups.regions.map((option) => (
                                <option key={option.id} value={option.id}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </Field>
                          <Field label="Numero CNAPS">
                            <input
                              className={inputClassName}
                              value={form.numCnaps}
                              onChange={(event) => handleFieldChange("numCnaps", event.target.value)}
                            />
                          </Field>
                          <Field label="Numero OSTIE">
                            <input
                              className={inputClassName}
                              value={form.numOstie}
                              onChange={(event) => handleFieldChange("numOstie", event.target.value)}
                            />
                          </Field>
                          <Field label="Nom du pere">
                            <input
                              className={inputClassName}
                              value={form.nomPere}
                              onChange={(event) => handleFieldChange("nomPere", event.target.value)}
                            />
                          </Field>
                          <Field label="Nom de la mere">
                            <input
                              className={inputClassName}
                              value={form.nomMere}
                              onChange={(event) => handleFieldChange("nomMere", event.target.value)}
                            />
                          </Field>
                        </div>
                      </div>

                      <div className="rounded-[2rem] border border-[#163526]/8 bg-white p-5 md:p-6">
                        <div className="mb-5 flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white">
                            <ShieldCheck className="h-5 w-5" />
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-[#163526]">Contact d&apos;urgence</h2>
                            <p className="text-sm text-[#163526]/55">Une personne a prevenir si besoin</p>
                          </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                          <Field label="Nom du contact *" error={getVisibleError("contactUrgence")}>
                            <input
                              className={inputClassName}
                              value={form.contactUrgence}
                              onChange={(event) => handleFieldChange("contactUrgence", event.target.value)}
                              placeholder="Nom complet"
                            />
                          </Field>
                          <Field label="Telephone du contact" error={getVisibleError("telephoneUrgence")}>
                            <input
                              className={inputClassName}
                              value={form.telephoneUrgence}
                              onChange={(event) => handleFieldChange("telephoneUrgence", event.target.value)}
                            />
                          </Field>
                          <Field label="Email du contact" error={getVisibleError("emailUrgence")}>
                            <input
                              type="email"
                              className={inputClassName}
                              value={form.emailUrgence}
                              onChange={(event) => handleFieldChange("emailUrgence", event.target.value)}
                            />
                          </Field>
                          <Field label="Adresse du contact">
                            <input
                              className={inputClassName}
                              value={form.adresseUrgence}
                              onChange={(event) => handleFieldChange("adresseUrgence", event.target.value)}
                            />
                          </Field>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {step === 2 ? (
                    <div className="space-y-8">
                      <div className="grid gap-6 md:grid-cols-2">
                        <Field label="Matricule *" error={getVisibleError("matricule")}>
                          <input
                            className={inputClassName}
                            value={form.matricule}
                            onChange={(event) => handleFieldChange("matricule", event.target.value)}
                            placeholder="EMP-026"
                          />
                        </Field>
                        <Field label="Date d'embauche *" error={getVisibleError("dateEmbauche")}>
                          <input
                            type="date"
                            className={inputClassName}
                            value={form.dateEmbauche}
                            onChange={(event) => handleFieldChange("dateEmbauche", event.target.value)}
                          />
                        </Field>
                        <Field label="Type de contrat *" error={getVisibleError("typeContratId")}>
                          <select
                            className={inputClassName}
                            value={form.typeContratId}
                            onChange={(event) => handleFieldChange("typeContratId", event.target.value)}
                          >
                            <option value="">Choisir...</option>
                            {lookups.contractTypes.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </Field>
                        {isCDI ? (
                          <Field label="Duree du contrat">
                            <input className={inputClassName} value="CDI - sans date de fin" disabled />
                          </Field>
                        ) : (
                          <Field label="Duree du contrat (mois) *" error={getVisibleError("dureeContratMois")}>
                            <div className="space-y-3">
                              <input
                                type="number"
                                min="1"
                                max="60"
                                className={inputClassName}
                                value={form.dureeContratMois}
                                onChange={(event) => handleFieldChange("dureeContratMois", event.target.value)}
                              />
                              {contractDurations.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {contractDurations.map((duration) => (
                                    <button
                                      key={duration}
                                      type="button"
                                      onClick={() => handleFieldChange("dureeContratMois", String(duration))}
                                      className={`rounded-full px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] transition ${
                                        form.dureeContratMois === String(duration)
                                          ? "bg-[#163526] text-white"
                                          : "bg-[#163526]/6 text-[#163526] hover:bg-[#163526]/10"
                                      }`}
                                    >
                                      {duration} mois
                                    </button>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          </Field>
                        )}
                        <Field label="Departement *" error={getVisibleError("departementId")}>
                          <select
                            className={inputClassName}
                            value={form.departementId}
                            onChange={(event) => handleFieldChange("departementId", event.target.value)}
                          >
                            <option value="">Choisir...</option>
                            {lookups.departments.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field
                          label="Poste *"
                          helper={isPositionsLoading ? "Chargement des postes..." : undefined}
                          error={getVisibleError("posteId")}
                        >
                          <select
                            className={inputClassName}
                            value={form.posteId}
                            onChange={(event) => handleFieldChange("posteId", event.target.value)}
                            disabled={!form.departementId || isPositionsLoading}
                          >
                            <option value="">Choisir...</option>
                            {positions.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Manager assigne">
                          <div className="rounded-2xl border border-[#163526]/10 bg-[#fcfbf7] px-4 py-3 text-sm text-[#163526]/75">
                            {isManagerLoading
                              ? "Chargement du manager..."
                              : assignedManager?.fullName || "Aucun manager detecte pour ce departement"}
                          </div>
                        </Field>
                        <Field label="Categorie professionnelle">
                          <select
                            className={inputClassName}
                            value={form.idCategorie}
                            onChange={(event) => handleFieldChange("idCategorie", event.target.value)}
                          >
                            <option value="">Choisir...</option>
                            {lookups.categories.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label}
                                {option.meta ? ` (${option.meta})` : ""}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Type de temps de travail">
                          <select
                            className={inputClassName}
                            value={form.idTempsTravail}
                            onChange={(event) => handleFieldChange("idTempsTravail", event.target.value)}
                          >
                            <option value="">Choisir...</option>
                            {lookups.workTimes.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Type d'entree">
                          <select
                            className={inputClassName}
                            value={form.idTypeEntree}
                            onChange={(event) => handleFieldChange("idTypeEntree", event.target.value)}
                          >
                            <option value="">Choisir...</option>
                            {lookups.entryTypes.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </div>

                      <div className="rounded-[2rem] border border-[#163526]/8 bg-[#fcfbf7] p-5 md:p-6">
                        <div className="mb-5 flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#163526] text-white">
                            <BadgeDollarSign className="h-5 w-5" />
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-[#163526]">Remuneration et essai</h2>
                            <p className="text-sm text-[#163526]/55">Dates automatiques et salaires utiles au contrat</p>
                          </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                        <Field label="Salaire de base pendant l'essai *" error={getVisibleError("salaireBaseEssai")}>
                            <input
                              type="number"
                              min="0"
                              className={inputClassName}
                              value={form.salaireBaseEssai}
                              onChange={(event) => handleFieldChange("salaireBaseEssai", event.target.value)}
                              placeholder="450000"
                            />
                          </Field>
                          <Field label="Classification">
                            <input
                              className={inputClassName}
                              value={form.classification}
                              onChange={(event) => handleFieldChange("classification", event.target.value)}
                              placeholder="Cadre, employe, agent..."
                            />
                          </Field>

                          {isCDD ? (
                            <label className="md:col-span-2 flex items-start gap-3 rounded-2xl border border-[#163526]/10 bg-white px-4 py-4 text-sm text-[#163526]">
                              <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 rounded border-[#163526]/20 text-orange-500"
                                checked={form.avecPeriodeEssai}
                                onChange={(event) => handleFieldChange("avecPeriodeEssai", event.target.checked)}
                              />
                              <span>
                                <span className="block font-semibold">Inclure une periode d&apos;essai</span>
                                <span className="mt-1 block text-[#163526]/55">
                                  Pour un CDD vous pouvez garder ou retirer l&apos;essai.
                                </span>
                              </span>
                            </label>
                          ) : null}

                          {trialEnabled ? (
                            <>
                              <Field label="Salaire apres periode d'essai *" error={getVisibleError("salaireBaseApresEssai")}>
                                <input
                                  type="number"
                                  min="0"
                                  className={inputClassName}
                                  value={form.salaireBaseApresEssai}
                                  onChange={(event) => handleFieldChange("salaireBaseApresEssai", event.target.value)}
                                  placeholder="500000"
                                />
                              </Field>
                              <Field label="Duree de la periode d'essai *">
                                <select
                                  className={inputClassName}
                                  value={form.dureeEssai}
                                  onChange={(event) => handleFieldChange("dureeEssai", event.target.value)}
                                >
                                  {TRIAL_DURATIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </Field>
                              <Field label="Debut de l'essai">
                                <input
                                  type="date"
                                  className={inputClassName}
                                  value={form.dateDebutEssai}
                                  onChange={(event) => handleFieldChange("dateDebutEssai", event.target.value)}
                                />
                              </Field>
                              <Field label="Fin calculee de l'essai" error={getVisibleError("dateFinEssai")}>
                                <div className="rounded-2xl border border-[#163526]/10 bg-white px-4 py-3 text-sm font-medium text-[#163526]">
                                  {form.dateFinEssai ? formatDateLabel(form.dateFinEssai) : "A definir"}
                                </div>
                              </Field>
                            </>
                          ) : (
                            <div className="md:col-span-2 rounded-2xl border border-dashed border-[#163526]/12 bg-white px-5 py-5 text-sm text-[#163526]/55">
                              Aucun module de periode d&apos;essai actif pour le contrat choisi.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {step === 3 ? (
                    <div className="space-y-8">
                      <div className="rounded-[2rem] border border-[#163526]/8 bg-[#fcfbf7] p-5 md:p-6">
                        <div className="mb-5 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#163526] text-white">
                              <CreditCard className="h-5 w-5" />
                            </div>
                            <div>
                              <h2 className="text-lg font-semibold text-[#163526]">Modes de paiement</h2>
                              <p className="text-sm text-[#163526]/55">
                                Jusqu&apos;a deux modes avec un mode par defaut.
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={addPaymentMode}
                            disabled={form.modePaiements.length >= 2}
                            className="rounded-full bg-[#163526] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#163526]/90 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Ajouter un mode
                          </button>
                        </div>

                        <div className="space-y-4">
                          {getVisibleError("modePaiements") ? (
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                              {getVisibleError("modePaiements")}
                            </div>
                          ) : null}

                          {form.modePaiements.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-[#163526]/12 bg-white px-5 py-5 text-sm text-[#163526]/55">
                              Aucun mode ajoute pour le moment. Vous pouvez enregistrer sans mode si le backend
                              l&apos;accepte, ou en preparer un maintenant.
                            </div>
                          ) : null}

                          {form.modePaiements.map((mode, index) => {
                            const type = paymentTypeMap.get(mode.typePaiementId);
                            const kind = getPaymentModeKind(type);

                            return (
                              <div key={mode.id} className="rounded-[1.75rem] border border-[#163526]/10 bg-white p-5 shadow-sm">
                                <div className="mb-4 flex items-center justify-between gap-4">
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#163526]/40">
                                      Mode {index + 1}
                                    </p>
                                    <p className="text-base font-semibold text-[#163526]">
                                      {type?.label || "Mode de paiement a configurer"}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removePaymentMode(index)}
                                    className="text-xs font-bold uppercase tracking-[0.15em] text-red-500 transition hover:text-red-600"
                                  >
                                    Supprimer
                                  </button>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                  <Field label="Type de paiement" error={getVisibleError(`modePaiements.${index}.typePaiementId`)}>
                                    <select
                                      className={inputClassName}
                                      value={mode.typePaiementId}
                                      onChange={(event) =>
                                        handlePaymentModeChange(index, "typePaiementId", event.target.value)
                                      }
                                    >
                                      <option value="">Choisir...</option>
                                      {lookups.paymentTypes.map((option) => (
                                        <option key={option.id} value={option.id}>
                                          {option.label}
                                        </option>
                                      ))}
                                    </select>
                                  </Field>
                                  <Field label="Titulaire du compte">
                                    <input
                                      className={inputClassName}
                                      value={mode.titulaireCompte}
                                      onChange={(event) =>
                                        handlePaymentModeChange(index, "titulaireCompte", event.target.value)
                                      }
                                    />
                                  </Field>

                                  {kind === "bank" || kind === "generic" ? (
                                    <>
                                      <Field label="Nom de la banque" error={getVisibleError(`modePaiements.${index}.nomBanque`)}>
                                        <input
                                          className={inputClassName}
                                          value={mode.nomBanque}
                                          onChange={(event) =>
                                            handlePaymentModeChange(index, "nomBanque", event.target.value)
                                          }
                                        />
                                      </Field>
                                      <Field label="Numero de compte" error={getVisibleError(`modePaiements.${index}.numeroCompte`)}>
                                        <input
                                          className={inputClassName}
                                          value={mode.numeroCompte}
                                          onChange={(event) =>
                                            handlePaymentModeChange(index, "numeroCompte", event.target.value)
                                          }
                                        />
                                      </Field>
                                      <Field label="Code banque">
                                        <input
                                          className={inputClassName}
                                          value={mode.codeBanque}
                                          onChange={(event) =>
                                            handlePaymentModeChange(index, "codeBanque", event.target.value)
                                          }
                                        />
                                      </Field>
                                      <Field label="Code guichet">
                                        <input
                                          className={inputClassName}
                                          value={mode.codeGuichet}
                                          onChange={(event) =>
                                            handlePaymentModeChange(index, "codeGuichet", event.target.value)
                                          }
                                        />
                                      </Field>
                                    </>
                                  ) : null}

                                  {kind === "mobile" ? (
                                    <Field label="Numero mobile" error={getVisibleError(`modePaiements.${index}.telephoneMobile`)}>
                                      <input
                                        className={inputClassName}
                                        value={mode.telephoneMobile}
                                        onChange={(event) =>
                                          handlePaymentModeChange(index, "telephoneMobile", event.target.value)
                                        }
                                      />
                                    </Field>
                                  ) : null}

                                  <label className="flex items-start gap-3 rounded-2xl border border-[#163526]/10 bg-[#fcfbf7] px-4 py-4 text-sm text-[#163526]">
                                    <input
                                      type="checkbox"
                                      checked={mode.estParDefaut}
                                      onChange={(event) =>
                                        handlePaymentModeChange(index, "estParDefaut", event.target.checked)
                                      }
                                      className="mt-1 h-4 w-4 rounded border-[#163526]/20"
                                    />
                                    <span>
                                      <span className="block font-semibold">Mode par defaut</span>
                                      <span className="mt-1 block text-[#163526]/55">
                                        Utilise en priorite pour la paie.
                                      </span>
                                    </span>
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="rounded-[2rem] border border-[#163526]/8 bg-white p-5 md:p-6">
                        <div className="mb-5 flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-[#163526]">Resume avant envoi</h2>
                            <p className="text-sm text-[#163526]/55">Verification rapide des points importants</p>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-2xl border border-[#163526]/8 bg-[#fcfbf7] p-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#163526]/40">
                              Identite
                            </p>
                            <p className="mt-2 text-lg font-semibold text-[#163526]">
                              {[form.prenom, form.nom].filter(Boolean).join(" ") || "A definir"}
                            </p>
                            <p className="mt-2 text-sm text-[#163526]/55">
                              CIN {form.cin || "---"} • Contact {form.telephone || "---"}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-[#163526]/8 bg-[#fcfbf7] p-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#163526]/40">
                              Affectation
                            </p>
                            <p className="mt-2 text-lg font-semibold text-[#163526]">
                              {findOptionLabel(lookups.departments, form.departementId)}
                            </p>
                            <p className="mt-2 text-sm text-[#163526]/55">
                              {findOptionLabel(positions, form.posteId)} • Manager {assignedManager?.fullName || "Aucun"}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-[#163526]/8 bg-[#fcfbf7] p-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#163526]/40">
                              Contrat
                            </p>
                            <p className="mt-2 text-lg font-semibold text-[#163526]">
                              {findOptionLabel(lookups.contractTypes, form.typeContratId)}
                            </p>
                            <p className="mt-2 text-sm text-[#163526]/55">
                              Debut {formatDateLabel(form.dateEmbauche)} • Fin {formatDateLabel(form.dateFinAssignation)}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-[#163526]/8 bg-[#fcfbf7] p-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#163526]/40">
                              Remuneration
                            </p>
                            <p className="mt-2 text-lg font-semibold text-[#163526]">
                              {formatCurrency(form.salaireBaseApresEssai || form.salaireBaseEssai)}
                            </p>
                            <p className="mt-2 text-sm text-[#163526]/55">
                              Essai {trialEnabled ? formatDateLabel(form.dateFinEssai) : "Non active"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-[#163526]/8 pt-6 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-[#163526]/50">
                Brouillon local actif. Les donnees restent sur ce navigateur jusqu&apos;a validation ou reinitialisation.
              </div>

              <div className="flex flex-wrap gap-3">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((current) => Math.max(current - 1, 1))}
                    className="inline-flex items-center gap-2 rounded-full border border-[#163526]/10 px-5 py-3 text-sm font-semibold text-[#163526] transition hover:bg-[#163526]/5"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Retour
                  </button>
                ) : null}

                {step < stepTitles.length ? (
                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="inline-flex items-center gap-2 rounded-full bg-[#163526] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#163526]/92"
                  >
                    Continuer
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || isLookupLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isSubmitting ? "Enregistrement..." : "Enregistrer l'employe"}
                  </button>
                )}
              </div>
            </div>
          </form>

          <aside className="space-y-6 xl:sticky xl:top-24">
            <div className="rounded-[2rem] border border-[#163526]/8 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#163526] text-white">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#163526]">Synthese du dossier</h2>
                  <p className="text-sm text-[#163526]/55">Informations calculees a partir des choix en cours</p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-[#163526]/72">
                <div className="rounded-2xl bg-[#fcfbf7] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#163526]/40">Region par defaut</p>
                  <p className="mt-2 font-semibold text-[#163526]">{findOptionLabel(lookups.regions, form.idRegion)}</p>
                </div>
                <div className="rounded-2xl bg-[#fcfbf7] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#163526]/40">Temps de travail</p>
                  <p className="mt-2 font-semibold text-[#163526]">
                    {findOptionLabel(lookups.workTimes, form.idTempsTravail)}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#fcfbf7] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#163526]/40">Essai auto</p>
                  <p className="mt-2 font-semibold text-[#163526]">
                    {trialEnabled ? `Fin prevue ${formatDateLabel(form.dateFinEssai)}` : "Non active"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-orange-200 bg-[linear-gradient(180deg,rgba(255,247,237,1)_0%,rgba(255,251,245,1)_100%)] p-6 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">Flux actif</p>
              <h2 className="mt-3 text-xl font-semibold text-[#163526]">Le formulaire passe maintenant par l&apos;API RH.</h2>
              <p className="mt-3 text-sm leading-7 text-[#163526]/68">
                Les listes de reference et la creation d&apos;un employe utilisent le backend du projet. Le brouillon
                local reste present pour securiser une saisie longue pendant les tests.
              </p>
              <div className="mt-5 rounded-2xl border border-orange-200/70 bg-white/80 p-4 text-sm text-[#163526]/72">
                Point d&apos;entree:{" "}
                <span className="font-semibold text-[#163526]">{`${basePath}/employees/new`}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
