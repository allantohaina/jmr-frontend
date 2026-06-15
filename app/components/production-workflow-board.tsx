"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { authAPI } from "@/app/lib";
import { useToast } from "./toast-provider";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Clock3,
  GitBranch,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
  Users,
  XCircle,
  AlertTriangle,
  CircleAlert,
  ListChecks,
  PlayCircle,
  FileText,
} from "lucide-react";

type WorkflowStep = {
  id: string;
  title: string;
  objective: string;
  roles: string[];
  depends_on: string[];
  key_step: boolean;
  requires_validation: boolean;
  validation_roles: string[];
  notes?: string | null;
  status: string;
  position: number;
  validated_at?: string | null;
  validated_by?: string | null;
  rejected_at?: string | null;
  rejected_by?: string | null;
  rejection_reason?: string | null;
  correction_notes?: string | null;
  next_step_ids?: string[];
  is_ready?: boolean;
  is_blocked?: boolean;
  is_current?: boolean;
  display_status?: string;
  validation_required?: boolean;
};

type WorkflowHistoryEntry = {
  id: string;
  action: string;
  step_id?: string | null;
  context?: Record<string, unknown> | null;
  actor?: {
    id?: string | string | null;
    role?: string | null;
    name?: string | null;
    email?: string | null;
  } | null;
  created_at: string;
};

type WorkflowMetrics = {
  total_steps: number;
  validated_steps: number;
  ready_steps: number;
  blocked_steps: number;
  progress: number;
};

type RollbackContext = {
  reason?: string;
  steps_to_redo?: string[];
  impacted_roles?: string[];
  return_to_step_id?: string | null;
  requested_at?: string;
  requested_by?: string | null;
};

type WorkflowRecord = {
  id: string;
  project_id?: string | null;
  name: string;
  status: string;
  current_step_id?: string | null;
  last_validated_step_id?: string | null;
  steps: WorkflowStep[];
  history: WorkflowHistoryEntry[];
  rollback_context?: RollbackContext | null;
  metrics?: WorkflowMetrics;
  created_at?: string;
  updated_at?: string;
};

type WorkflowPayloadStep = {
  id: string;
  title: string;
  objective: string;
  roles: string[];
  depends_on: string[];
  key_step: boolean;
  requires_validation: boolean;
  validation_roles: string[];
  notes?: string | null;
  status: string;
  validated_at?: string | null;
  validated_by?: string | null;
  rejected_at?: string | null;
  rejected_by?: string | null;
  rejection_reason?: string | null;
  correction_notes?: string | null;
};

const DEFAULT_WORKFLOW_NAME = "Processus atelier";

function createStepId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 10);
}

function emptyStep(position: number): WorkflowStep {
  return {
    id: createStepId(),
    title: `Etape ${position + 1}`,
    objective: "",
    roles: [],
    depends_on: [],
    key_step: false,
    requires_validation: false,
    validation_roles: ["worker", "admin"],
    notes: "",
    status: "pending",
    position: position + 1,
    validated_at: null,
    validated_by: null,
    rejected_at: null,
    rejected_by: null,
    rejection_reason: null,
    correction_notes: "",
    next_step_ids: [],
    is_ready: true,
    is_blocked: false,
    is_current: false,
    display_status: "pending",
    validation_required: false,
  };
}

function normalizeList(value: string) {
  return value
    .split(/[\n,;]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function joinList(values: string[] = []) {
  return values.join(", ");
}

function hasClientValidationRole(values: string[] = []) {
  return values.some((value) => {
    const normalized = value.trim().toLowerCase();
    return normalized === "user" || normalized === "client";
  });
}

function serializeStep(step: WorkflowStep): WorkflowPayloadStep {
  return {
    id: step.id,
    title: step.title,
    objective: step.objective,
    roles: step.roles,
    depends_on: step.depends_on,
    key_step: step.key_step,
    requires_validation: step.requires_validation,
    validation_roles: step.validation_roles,
    notes: step.notes ?? "",
    status: step.status,
    validated_at: step.validated_at ?? null,
    validated_by: step.validated_by ?? null,
    rejected_at: step.rejected_at ?? null,
    rejected_by: step.rejected_by ?? null,
    rejection_reason: step.rejection_reason ?? null,
    correction_notes: step.correction_notes ?? null,
  };
}

function getStatusTone(status: string) {
  switch (status) {
    case "validated":
      return "bg-green-50 text-green-700 border-green-100";
    case "awaiting_validation":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "needs_correction":
      return "bg-red-50 text-red-700 border-red-100";
    case "in_progress":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "blocked":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-[#173428]/5 text-[#173428]/70 border-[#173428]/10";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "validated":
      return "Validee";
    case "awaiting_validation":
      return "En validation";
    case "needs_correction":
      return "A corriger";
    case "in_progress":
      return "En cours";
    case "blocked":
      return "Bloquee";
    case "completed":
      return "Terminee";
    case "active":
      return "Actif";
    case "draft":
      return "Brouillon";
    default:
      return "A traiter";
  }
}

function getActionIcon(action: string) {
  switch (action) {
    case "create":
    case "update":
      return <RefreshCw className="h-4 w-4" />;
    case "complete_step":
      return <PlayCircle className="h-4 w-4" />;
    case "approve_step":
      return <CheckCircle2 className="h-4 w-4" />;
    case "reject_step":
      return <XCircle className="h-4 w-4" />;
    case "major_rollback":
      return <RotateCcw className="h-4 w-4" />;
    default:
      return <CircleDashed className="h-4 w-4" />;
  }
}

function historyLabel(action: string) {
  switch (action) {
    case "create":
      return "Creation";
    case "update":
      return "Mise a jour";
    case "complete_step":
      return "Etape terminee";
    case "approve_step":
      return "Validation";
    case "reject_step":
      return "Rejet";
    case "major_rollback":
      return "Rollback";
    default:
      return action;
  }
}

function cloneWorkflow(workflow: WorkflowRecord): WorkflowRecord {
  return {
    ...workflow,
    steps: workflow.steps.map((step) => ({
      ...step,
      roles: [...(step.roles ?? [])],
      depends_on: [...(step.depends_on ?? [])],
      validation_roles: [...(step.validation_roles ?? [])],
      next_step_ids: [...(step.next_step_ids ?? [])],
    })),
    history: workflow.history.map((entry) => ({
      ...entry,
      context: entry.context ? { ...entry.context } : null,
      actor: entry.actor ? { ...entry.actor } : null,
    })),
    rollback_context: workflow.rollback_context
      ? {
          ...workflow.rollback_context,
          steps_to_redo: [...(workflow.rollback_context.steps_to_redo ?? [])],
          impacted_roles: [...(workflow.rollback_context.impacted_roles ?? [])],
        }
      : workflow.rollback_context ?? null,
    metrics: workflow.metrics ? { ...workflow.metrics } : workflow.metrics,
  };
}

export function ProductionWorkflowBoard() {
  const { showToast } = useToast();
  const [workflows, setWorkflows] = useState<WorkflowRecord[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [draftName, setDraftName] = useState(DEFAULT_WORKFLOW_NAME);
  const [draftProjectId, setDraftProjectId] = useState("");
  const [rollbackReason, setRollbackReason] = useState("");
  const [rollbackRoles, setRollbackRoles] = useState("");
  const [rollbackTargets, setRollbackTargets] = useState<Record<string, boolean>>({});
  const workflowsRef = useRef<WorkflowRecord[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadWorkflows() {
      try {
        const response = await authAPI.get<WorkflowRecord[]>("/workflows");
        if (!mounted) {
          return;
        }

        const list = Array.isArray(response.data) ? response.data : [];
        setWorkflows(list);
        setSelectedWorkflowId((current) => current ?? list[0]?.id ?? null);
        if (list[0]) {
          setDraftName(list[0].name ?? DEFAULT_WORKFLOW_NAME);
          setDraftProjectId(list[0].project_id ?? "");
        }
      } catch (error) {
        console.error("Failed to load production workflows:", error);
        showToast("Impossible de charger les processus de production", "error");
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadWorkflows();

    return () => {
      mounted = false;
    };
  }, [showToast]);

  const selectedWorkflow = useMemo(
    () => workflows.find((workflow) => workflow.id === selectedWorkflowId) ?? null,
    [selectedWorkflowId, workflows],
  );

  useEffect(() => {
    workflowsRef.current = workflows;
  }, [workflows]);

  useEffect(() => {
    if (!selectedWorkflowId) {
      return;
    }

    const workflow = workflowsRef.current.find((item) => item.id === selectedWorkflowId);
    if (!workflow) {
      return;
    }

    setDraftName(workflow.name);
    setDraftProjectId(workflow.project_id ?? "");
    setRollbackTargets((current) => {
      const nextTargets: Record<string, boolean> = {};
      for (const step of workflow.steps ?? []) {
        nextTargets[step.id] = current[step.id] ?? false;
      }
      return nextTargets;
    });
  }, [selectedWorkflowId]);

  const updateSelectedWorkflow = (updater: (workflow: WorkflowRecord) => WorkflowRecord) => {
    if (!selectedWorkflowId) {
      return;
    }

    setWorkflows((current) =>
      current.map((workflow) => {
        if (workflow.id !== selectedWorkflowId) {
          return workflow;
        }

        return updater(cloneWorkflow(workflow));
      }),
    );
    setHasUnsavedChanges(true);
  };

  const refreshSelectedWorkflow = (nextWorkflow: WorkflowRecord) => {
    setWorkflows((current) =>
      current.map((workflow) => (workflow.id === nextWorkflow.id ? nextWorkflow : workflow)),
    );
    setSelectedWorkflowId(nextWorkflow.id);
    setDraftName(nextWorkflow.name);
    setDraftProjectId(nextWorkflow.project_id ?? "");
    setHasUnsavedChanges(false);
  };

  const createWorkflow = async () => {
    if (!draftName.trim()) {
      showToast("Le nom du processus est requis", "warning");
      return;
    }

    setIsSaving(true);
    try {
      const response = await authAPI.post<WorkflowRecord>("/workflows", {
        name: draftName,
        project_id: draftProjectId || null,
        steps: [],
      });

      const created = response.data;
      setWorkflows((current) => [...current, created]);
      setSelectedWorkflowId(created.id);
      setHasUnsavedChanges(false);
      showToast("Nouveau processus cree", "success");
    } catch (error) {
      console.error("Failed to create workflow:", error);
      showToast("Creation du processus impossible", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const persistWorkflow = async () => {
    if (!selectedWorkflow) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await authAPI.put<WorkflowRecord>(`/workflows/${selectedWorkflow.id}`, {
        name: draftName,
        project_id: draftProjectId || null,
        steps: selectedWorkflow.steps.map(serializeStep),
      });

      refreshSelectedWorkflow(response.data);
      showToast("Processus enregistre", "success");
    } catch (error) {
      console.error("Failed to save workflow:", error);
      showToast("Enregistrement du processus impossible", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const transitionWorkflow = async (
    action: "complete_step" | "approve_step" | "reject_step" | "major_rollback",
    stepId?: string,
    extra?: Record<string, unknown>,
  ) => {
    if (!selectedWorkflow) {
      return;
    }

    setIsTransitioning(true);
    try {
      const response = await authAPI.post<WorkflowRecord>(
        `/workflows/${selectedWorkflow.id}/transition`,
        {
          action,
          step_id: stepId,
          ...extra,
        },
      );

      refreshSelectedWorkflow(response.data);
      showToast("Transition appliquee", "success");
      setRollbackReason("");
      setRollbackRoles("");
      setRollbackTargets({});
    } catch (error) {
      console.error("Failed to transition workflow:", error);
      showToast("Transition impossible", "error");
    } finally {
      setIsTransitioning(false);
    }
  };

  const addStep = () => {
    if (!selectedWorkflow) {
      return;
    }

    updateSelectedWorkflow((workflow) => ({
      ...workflow,
      steps: [...workflow.steps, emptyStep(workflow.steps.length)],
    }));
  };

  const removeStep = (stepId: string) => {
    if (!selectedWorkflow) {
      return;
    }

    updateSelectedWorkflow((workflow) => ({
      ...workflow,
      steps: workflow.steps.filter((step) => step.id !== stepId),
    }));
  };

  const updateStepField = (
    stepId: string,
    field: keyof WorkflowStep,
    value: string | boolean | string[],
  ) => {
    updateSelectedWorkflow((workflow) => ({
      ...workflow,
      steps: workflow.steps.map((step) => {
        if (step.id !== stepId) {
          return step;
        }

        const nextStep = { ...step, [field]: value } as WorkflowStep;

        if (field === "key_step" && value === true) {
          nextStep.requires_validation = true;
          if (!nextStep.validation_roles || nextStep.validation_roles.length === 0) {
            nextStep.validation_roles = ["worker", "admin"];
          }
        }

        if (field === "key_step" && value === false) {
          nextStep.requires_validation = false;
        }

        if (field === "requires_validation" && value === false) {
          nextStep.key_step = false;
        }

        return nextStep;
      }),
    }));
  };

  const toggleDependency = (stepId: string, dependencyId: string) => {
    updateSelectedWorkflow((workflow) => ({
      ...workflow,
      steps: workflow.steps.map((step) => {
        if (step.id !== stepId) {
          return step;
        }

        const hasDependency = step.depends_on.includes(dependencyId);
        return {
          ...step,
          depends_on: hasDependency
            ? step.depends_on.filter((id) => id !== dependencyId)
            : [...step.depends_on, dependencyId],
        };
      }),
    }));
  };

  const updateCommaField = (
    stepId: string,
    field: "roles" | "validation_roles",
    value: string,
  ) => {
    updateStepField(stepId, field, normalizeList(value));
  };

  const updateNotesField = (stepId: string, value: string) => {
    updateStepField(stepId, "notes", value);
  };

  const updateCorrectionField = (stepId: string, value: string) => {
    updateStepField(stepId, "correction_notes", value);
  };

  const selectedSteps = selectedWorkflow?.steps ?? [];
  const activeWorkflowName = selectedWorkflowId
    ? draftName.trim() || selectedWorkflow?.name || DEFAULT_WORKFLOW_NAME
    : selectedWorkflow?.name ?? "Aucun processus";
  const validatedCount = selectedSteps.filter((step) => step.status === "validated").length;
  const totalSteps = selectedSteps.length;
  const progress = totalSteps > 0 ? Math.round((validatedCount / totalSteps) * 1000) / 10 : 0;
  const readySteps = selectedSteps.filter((step) => step.is_ready).length;
  const blockedSteps = selectedSteps.filter((step) => step.is_blocked).length;
  const currentStep = selectedSteps.find((step) => step.id === selectedWorkflow?.current_step_id) ?? null;
  const lastValidatedStep = selectedSteps.find((step) => step.id === selectedWorkflow?.last_validated_step_id) ?? null;
  const recentHistory = (selectedWorkflow?.history ?? []).slice(-5).reverse();

  const workflowCards = [
    { label: "Etapes", value: totalSteps || "0", icon: ListChecks },
    { label: "Validees", value: validatedCount || "0", icon: CheckCircle2 },
    { label: "Prêtes", value: readySteps || "0", icon: ShieldCheck },
    { label: "Bloquees", value: blockedSteps || "0", icon: AlertTriangle },
  ];

  return (
    <div className="min-h-full bg-[#f4efe6] text-[#173428]">
      <section className="border-b border-[#173428]/10 bg-[#173428]">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3 text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-orange-300">
                <GitBranch className="h-3.5 w-3.5" />
                Workflow de production
              </div>
              <h2 className="font-headline text-4xl text-white">Etapes dynamiques, validation et rollback</h2>
              <p className="max-w-2xl text-sm text-white/70">
                Ajoutez les etapes du process, liez les responsables, fixez les dependances et pilotez
                les validations sans quitter le meme ecran.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={addStep}
                disabled={!selectedWorkflow}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#173428] transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Etape
              </button>
              <button
                onClick={persistWorkflow}
                disabled={!selectedWorkflow || isSaving || !hasUnsavedChanges}
                className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Enregistrer
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {workflowCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.label}
                  className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/45">
                        {card.label}
                      </p>
                      <p className="mt-2 text-3xl font-headline text-white">{card.value}</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-3 text-orange-300">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        {isLoading ? (
          <div className="rounded-3xl border border-[#173428]/10 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 text-[#173428]/60">
              <CircleDashed className="h-5 w-5 animate-spin" />
              <p className="text-sm font-medium">Chargement des processus de production...</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 xl:grid-cols-[1.9fr_1fr]">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 rounded-3xl border border-[#173428]/10 bg-white p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#173428]/45">
                    Processus
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                      {workflows.map((workflow) => (
                        <button
                          key={workflow.id}
                          onClick={() => setSelectedWorkflowId(workflow.id)}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition ${
                          workflow.id === selectedWorkflowId
                            ? "border-[#173428] bg-[#173428] text-white"
                            : "border-[#173428]/10 bg-[#f8f4eb] text-[#173428]/70 hover:border-[#173428]/20"
                        }`}
                          >
                            <FileText className="h-3.5 w-3.5" />
                        {workflow.id === selectedWorkflowId ? draftName : workflow.name}
                        </button>
                      ))}

                    <button
                      onClick={createWorkflow}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 rounded-full border border-dashed border-orange-300 bg-orange-50 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Nouveau
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[420px]">
                  <label className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#173428]/45">
                      Nom du processus
                    </span>
                    <input
                      value={draftName}
                      onChange={(event) => {
                        setDraftName(event.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full rounded-2xl border border-[#173428]/10 bg-[#f8f4eb] px-4 py-3 text-sm font-medium outline-none ring-0 focus:border-orange-400"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#173428]/45">
                      Project ID
                    </span>
                    <input
                      value={draftProjectId}
                      onChange={(event) => {
                        setDraftProjectId(event.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Optionnel"
                      className="w-full rounded-2xl border border-[#173428]/10 bg-[#f8f4eb] px-4 py-3 text-sm font-medium outline-none ring-0 focus:border-orange-400"
                    />
                  </label>
                </div>
              </div>

              {!selectedWorkflow ? (
                <div className="rounded-3xl border border-dashed border-[#173428]/15 bg-white p-8 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#173428]/45">
                        Aucun processus selectionne
                      </p>
                      <h3 className="font-headline text-2xl text-[#173428]">Créez votre premier workflow</h3>
                      <p className="max-w-2xl text-sm text-[#173428]/60">
                        Demarrez avec un process vide, puis ajoutez les etapes avec le bouton plus.
                      </p>
                    </div>
                    <button
                      onClick={createWorkflow}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 rounded-full bg-[#173428] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-[#173428]/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Plus className="h-4 w-4 text-orange-300" />
                      Creer le processus
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedSteps.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-[#173428]/15 bg-white p-8 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="rounded-2xl bg-orange-50 p-4 text-orange-600">
                          <CircleAlert className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-headline text-2xl text-[#173428]">Aucune etape pour le moment</h3>
                          <p className="text-sm text-[#173428]/60">
                            Cliquez sur le bouton plus pour definir l&apos;objectif, les responsables et les
                            dependances de la premiere etape.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {selectedSteps.map((step, index) => {
                    const stepTone = getStatusTone(step.display_status ?? step.status);
                    const canApprove = step.status === "awaiting_validation";
                    const canReject = step.status === "awaiting_validation";
                    const isValidated = step.status === "validated";
                    const isWaitingValidation = step.status === "awaiting_validation";
                    const hasClientValidation = hasClientValidationRole(step.validation_roles);
                    const primaryLabel = step.key_step
                      ? isWaitingValidation
                        ? "En attente"
                        : "Soumettre"
                      : "Terminer";
                    const stepNumber = String(index + 1).padStart(2, "0");

                    return (
                      <div
                        key={step.id}
                        className="rounded-3xl border border-[#173428]/10 bg-white p-6 shadow-sm transition hover:shadow-md"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#173428] text-sm font-bold text-white">
                              {stepNumber}
                            </div>
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-headline text-2xl text-[#173428]">{step.title}</h3>
                                <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${stepTone}`}>
                                  {getStatusLabel(step.display_status ?? step.status)}
                                </span>
                                {step.key_step ? (
                                  <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-700">
                                    Etape cle
                                  </span>
                                ) : null}
                                {hasClientValidation ? (
                                  <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-sky-700">
                                    Validation client
                                  </span>
                                ) : null}
                              </div>
                            <p className="max-w-3xl text-sm text-[#173428]/60">
                                {step.objective || "Definissez l&apos;objectif ou l&apos;utilite de cette etape."}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => transitionWorkflow("complete_step", step.id)}
                              disabled={isTransitioning || isValidated || isWaitingValidation}
                              className="inline-flex items-center gap-2 rounded-full border border-[#173428]/10 bg-[#173428] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-[#173428]/90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <PlayCircle className="h-4 w-4 text-orange-300" />
                              {primaryLabel}
                            </button>
                            {canApprove ? (
                              <button
                                onClick={() => transitionWorkflow("approve_step", step.id)}
                                disabled={isTransitioning}
                                className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Valider
                              </button>
                            ) : null}
                            {canReject ? (
                              <button
                                onClick={() =>
                                  transitionWorkflow("reject_step", step.id, {
                                    reason: step.correction_notes || step.notes || "Rejet de l'etape",
                                    correction_notes: step.correction_notes || step.notes || "",
                                  })
                                }
                                disabled={isTransitioning}
                                className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <XCircle className="h-4 w-4" />
                                Rejeter
                              </button>
                            ) : null}
                            <button
                              onClick={() => removeStep(step.id)}
                              disabled={isTransitioning}
                              className="inline-flex items-center gap-2 rounded-full border border-[#173428]/10 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#173428]/70 transition hover:border-red-200 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Supprimer
                            </button>
                          </div>
                        </div>

                        <div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                          <div className="space-y-4">
                            <label className="space-y-2">
                              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#173428]/45">
                                Intitule
                              </span>
                              <input
                                value={step.title}
                                onChange={(event) => updateStepField(step.id, "title", event.target.value)}
                                className="w-full rounded-2xl border border-[#173428]/10 bg-[#f8f4eb] px-4 py-3 text-sm font-medium outline-none focus:border-orange-400"
                              />
                            </label>

                            <label className="space-y-2">
                              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#173428]/45">
                                Objectif / utilite
                              </span>
                              <textarea
                                value={step.objective}
                                onChange={(event) => updateStepField(step.id, "objective", event.target.value)}
                                rows={4}
                                className="w-full rounded-2xl border border-[#173428]/10 bg-[#f8f4eb] px-4 py-3 text-sm font-medium outline-none focus:border-orange-400"
                              />
                            </label>

                            <div className="grid gap-4 md:grid-cols-2">
                              <label className="space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#173428]/45">
                                  Responsables
                                </span>
                                <input
                                  value={joinList(step.roles)}
                                  onChange={(event) =>
                                    updateCommaField(step.id, "roles", event.target.value)
                                  }
                                  placeholder="couturier, modeliste, chef atelier"
                                  className="w-full rounded-2xl border border-[#173428]/10 bg-[#f8f4eb] px-4 py-3 text-sm font-medium outline-none focus:border-orange-400"
                                />
                              </label>

                              <label className="space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#173428]/45">
                                  Validation
                                </span>
                                <input
                                  value={joinList(step.validation_roles)}
                                  onChange={(event) =>
                                    updateCommaField(step.id, "validation_roles", event.target.value)
                                  }
                                  placeholder="user, client, worker, admin"
                                  className="w-full rounded-2xl border border-[#173428]/10 bg-[#f8f4eb] px-4 py-3 text-sm font-medium outline-none focus:border-orange-400"
                                />
                                <p className="text-[10px] leading-relaxed text-[#173428]/45">
                                  Utilisez <span className="font-bold text-[#173428]">user</span> ou{" "}
                                  <span className="font-bold text-[#173428]">client</span> pour une validation
                                  client obligatoire.
                                </p>
                              </label>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="grid gap-3 sm:grid-cols-2">
                              <label className="flex items-center justify-between gap-3 rounded-2xl border border-[#173428]/10 bg-[#f8f4eb] px-4 py-4">
                                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#173428]/55">
                                  Etape cle
                                </span>
                                <input
                                  type="checkbox"
                                  checked={step.key_step}
                                  onChange={(event) =>
                                    updateStepField(step.id, "key_step", event.target.checked)
                                  }
                                  className="h-5 w-5 rounded border-[#173428]/20 text-orange-500 focus:ring-orange-400"
                                />
                              </label>
                              <label className="flex items-center justify-between gap-3 rounded-2xl border border-[#173428]/10 bg-[#f8f4eb] px-4 py-4">
                                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#173428]/55">
                                  Validation requise
                                </span>
                                <input
                                  type="checkbox"
                                  checked={step.requires_validation}
                                  onChange={(event) =>
                                    updateStepField(step.id, "requires_validation", event.target.checked)
                                  }
                                  className="h-5 w-5 rounded border-[#173428]/20 text-orange-500 focus:ring-orange-400"
                                />
                              </label>
                            </div>

                            <div className="rounded-2xl border border-[#173428]/10 bg-[#f8f4eb] p-4">
                              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#173428]/45">
                                <GitBranch className="h-4 w-4 text-orange-500" />
                                Dependances
                              </div>
                              <div className="mt-4 grid gap-3">
                                {selectedSteps
                                  .filter((candidate) => candidate.id !== step.id)
                                  .map((candidate) => {
                                    const checked = step.depends_on.includes(candidate.id);

                                    return (
                                      <label
                                        key={candidate.id}
                                        className="flex items-center justify-between gap-3 rounded-xl border border-white bg-white px-3 py-2"
                                      >
                                        <div className="min-w-0">
                                          <p className="truncate text-sm font-semibold text-[#173428]">
                                            {candidate.title}
                                          </p>
                                          <p className="truncate text-[10px] uppercase tracking-widest text-[#173428]/40">
                                            {candidate.display_status ?? candidate.status}
                                          </p>
                                        </div>
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={() => toggleDependency(step.id, candidate.id)}
                                          className="h-5 w-5 rounded border-[#173428]/20 text-orange-500 focus:ring-orange-400"
                                        />
                                      </label>
                                    );
                                  })}
                                {selectedSteps.length <= 1 ? (
                                  <p className="text-sm text-[#173428]/50">
                                    Ajoutez d&apos;autres etapes pour definir les dependances.
                                  </p>
                                ) : null}
                              </div>
                            </div>

                            <label className="space-y-2">
                              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#173428]/45">
                                Notes / corrections
                              </span>
                              <textarea
                                value={step.correction_notes ?? ""}
                                onChange={(event) => updateCorrectionField(step.id, event.target.value)}
                                rows={3}
                                placeholder="Ex: reprendre la couture, ajuster le patron, revalider les mesures..."
                                className="w-full rounded-2xl border border-[#173428]/10 bg-[#f8f4eb] px-4 py-3 text-sm font-medium outline-none focus:border-orange-400"
                              />
                            </label>

                            <label className="space-y-2">
                              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#173428]/45">
                                Notes internes
                              </span>
                              <textarea
                                value={step.notes ?? ""}
                                onChange={(event) => updateNotesField(step.id, event.target.value)}
                                rows={2}
                                placeholder="Commentaire interne pour l'atelier"
                                className="w-full rounded-2xl border border-[#173428]/10 bg-[#f8f4eb] px-4 py-3 text-sm font-medium outline-none focus:border-orange-400"
                              />
                            </label>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#173428]/10 pt-5">
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#173428]/45">
                            <Users className="h-4 w-4 text-orange-500" />
                            <span>{joinList(step.roles) || "Aucun responsable"}</span>
                            <ChevronRight className="h-4 w-4" />
                            <span>{step.validation_required ? "Validation active" : "Validation facultative"}</span>
                          </div>

                          <div className="ml-auto flex flex-wrap items-center gap-2">
                            {step.is_current ? (
                              <span className="inline-flex items-center gap-2 rounded-full border border-[#173428]/10 bg-[#173428]/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#173428]/70">
                                <Clock3 className="h-3.5 w-3.5" />
                                Etape courante
                              </span>
                            ) : null}
                            {step.is_ready ? (
                              <span className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-green-700">
                                <ArrowRight className="h-3.5 w-3.5" />
                                Prete
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                                <CircleDashed className="h-3.5 w-3.5" />
                                Bloquee
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-[#173428]/10 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#173428]/45">
                      Resume du flux
                    </p>
                    <h3 className="mt-2 font-headline text-2xl text-[#173428]">{activeWorkflowName}</h3>
                  </div>
                  <div className={`rounded-2xl border px-3 py-2 text-[10px] font-bold uppercase tracking-widest ${getStatusTone(selectedWorkflow?.status ?? "draft")}`}>
                    {getStatusLabel(selectedWorkflow?.status ?? "draft")}
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.24em] text-[#173428]/45">
                      <span>Progression</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#173428]/5">
                      <div
                        className="h-full rounded-full bg-[#173428] transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[#173428]/10 bg-[#f8f4eb] p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#173428]/45">Etape courante</p>
                      <p className="mt-2 font-semibold text-[#173428]">
                        {currentStep?.title ?? "Aucune"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[#173428]/10 bg-[#f8f4eb] p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#173428]/45">Derniere validation</p>
                      <p className="mt-2 font-semibold text-[#173428]">
                        {lastValidatedStep?.title ?? "Aucune"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-[#173428]/10 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
                    <RotateCcw className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#173428]/45">
                      Rollback majeur
                    </p>
                    <h3 className="font-headline text-xl text-[#173428]">Reprise structurelle</h3>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <label className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#173428]/45">
                      Etapes a refaire
                    </span>
                    <div className="space-y-2">
                      {selectedSteps.map((step) => (
                        <label
                          key={step.id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-[#173428]/10 bg-[#f8f4eb] px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#173428]">{step.title}</p>
                            <p className="truncate text-[10px] uppercase tracking-widest text-[#173428]/40">
                              {step.display_status ?? step.status}
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={rollbackTargets[step.id] ?? false}
                            onChange={(event) =>
                              setRollbackTargets((current) => ({
                                ...current,
                                [step.id]: event.target.checked,
                              }))
                            }
                            className="h-5 w-5 rounded border-[#173428]/20 text-orange-500 focus:ring-orange-400"
                          />
                        </label>
                      ))}
                    </div>
                  </label>

                  <label className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#173428]/45">
                      Raison du rollback
                    </span>
                    <textarea
                      value={rollbackReason}
                      onChange={(event) => setRollbackReason(event.target.value)}
                      rows={3}
                      className="w-full rounded-2xl border border-[#173428]/10 bg-[#f8f4eb] px-4 py-3 text-sm font-medium outline-none focus:border-orange-400"
                      placeholder="Pourquoi faut-il reprendre le processus ?"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#173428]/45">
                      Roles impactes
                    </span>
                    <input
                      value={rollbackRoles}
                      onChange={(event) => setRollbackRoles(event.target.value)}
                      placeholder="couturier, modeliste, chef atelier"
                      className="w-full rounded-2xl border border-[#173428]/10 bg-[#f8f4eb] px-4 py-3 text-sm font-medium outline-none focus:border-orange-400"
                    />
                  </label>

                  <button
                    onClick={() =>
                      transitionWorkflow("major_rollback", undefined, {
                        steps_to_redo: Object.entries(rollbackTargets)
                          .filter(([, checked]) => checked)
                          .map(([stepId]) => stepId),
                        reason: rollbackReason,
                        impacted_roles: normalizeList(rollbackRoles),
                      })
                    }
                    disabled={isTransitioning || !rollbackReason.trim() || !Object.values(rollbackTargets).some(Boolean)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#173428] px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-[#173428]/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RotateCcw className="h-4 w-4 text-orange-300" />
                    Lancer le rollback
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-[#173428]/10 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-[#173428]/5 p-3 text-[#173428]">
                    <ListChecks className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#173428]/45">
                      Historique
                    </p>
                    <h3 className="font-headline text-xl text-[#173428]">Actions recentes</h3>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {recentHistory.length === 0 ? (
                    <p className="text-sm text-[#173428]/55">Aucune action enregistree.</p>
                  ) : (
                    recentHistory.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start gap-3 rounded-2xl border border-[#173428]/10 bg-[#f8f4eb] p-4"
                      >
                        <div className="rounded-xl bg-white p-2 text-orange-500">
                          {getActionIcon(entry.action)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-[#173428]">
                              {historyLabel(entry.action)}
                            </p>
                            <span className="text-[10px] uppercase tracking-widest text-[#173428]/40">
                              {entry.created_at}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-[#173428]/55">
                            {entry.step_id ? `Etape: ${entry.step_id}` : "Processus global"}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {selectedWorkflow?.rollback_context ? (
                <div className="rounded-3xl border border-orange-200 bg-orange-50 p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-white p-3 text-orange-600">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-orange-700/60">
                        Dernier rollback
                      </p>
                      <h3 className="font-headline text-xl text-orange-900">Rattrapage en cours</h3>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3 text-sm text-orange-900/80">
                    <p>
                      <span className="font-bold">Raison:</span> {selectedWorkflow.rollback_context.reason}
                    </p>
                    <p>
                      <span className="font-bold">Etapes:</span>{" "}
                      {joinList(
                        selectedWorkflow.rollback_context.steps_to_redo ?? [],
                      ) || "Aucune"}
                    </p>
                    <p>
                      <span className="font-bold">Roles impactes:</span>{" "}
                      {joinList(selectedWorkflow.rollback_context.impacted_roles ?? []) || "Aucun"}
                    </p>
                  </div>
                </div>
              ) : null}
            </aside>
          </div>
        )}
      </section>

      {selectedWorkflow ? (
        <section className="mx-auto max-w-7xl px-6 pb-12 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#173428]/10 bg-white px-6 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#173428] p-3 text-white">
                <ShieldCheck className="h-5 w-5 text-orange-300" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#173428]/45">Etat</p>
                <p className="font-semibold text-[#173428]">
                  {selectedWorkflow.status} {hasUnsavedChanges ? " - modifications en attente" : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#173428]/10 bg-[#f8f4eb] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#173428]/70">
                <Users className="h-3.5 w-3.5" />
                {joinList(selectedSteps.flatMap((step) => step.roles).slice(0, 4)) || "Aucun role"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#173428]/10 bg-[#f8f4eb] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#173428]/70">
                <ShieldCheck className="h-3.5 w-3.5" />
                {selectedSteps.filter((step) => step.key_step).length} etapes cle
              </span>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
