"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import {
  CLIENT_SIGNATURE_LOCK_COPY,
  type ProblemSeverity,
  type ProblemSubProblem,
  type ProblemThread,
} from "@/app/lib";

type ProblemHierarchyPanelProps = {
  problems: ProblemThread[];
  mode?: "client" | "admin";
  theme?: "light" | "dark";
  className?: string;
};

type DraftProblem = {
  title: string;
  summary: string;
  detail: string;
  owner: string;
  severity: ProblemSeverity;
  requiresClientValidation: boolean;
};

type DraftSubProblem = {
  title: string;
  detail: string;
  owner: string;
};

const VISIBLE_MAJOR_PROBLEMS = 4;

const emptyMainDraft: DraftProblem = {
  title: "",
  summary: "",
  detail: "",
  owner: "",
  severity: "warning",
  requiresClientValidation: false,
};

const emptySubDraft: DraftSubProblem = {
  title: "",
  detail: "",
  owner: "",
};

const themeMap = {
  light: {
    note: "border-[#163526]/5 bg-[#faf9f4] text-[#163526]/60",
    title: "text-[#163526]",
    detail: "text-[#163526]/65",
    meta: "text-[#1b1c19]/40",
    item: "border-[#163526]/5 bg-white",
    itemBody: "bg-[#faf9f4]",
    chip: "border-[#163526]/10 bg-[#163526]/5 text-[#163526]",
    button: "border-[#163526]/10 bg-white text-[#163526] hover:bg-[#faf9f4]",
    primaryButton: "border-orange-200 bg-orange-500 text-white hover:bg-orange-600",
    composer: "border-[#163526]/10 bg-[#faf9f4]",
    input: "border-[#163526]/10 bg-white text-[#163526]",
    placeholder: "text-[#163526]/35",
    subItem: "border-[#163526]/5 bg-white",
  },
  dark: {
    note: "border-[#e5ad46]/10 bg-[#1e2a38] text-[#e5ad46]/60",
    title: "text-[#e5ad46]",
    detail: "text-[#e5ad46]/65",
    meta: "text-[#e5ad46]/30",
    item: "border-[#e5ad46]/5 bg-[#1e2a38]",
    itemBody: "bg-[#25303a]",
    chip: "border-[#e5ad46]/10 bg-[#e5ad46]/5 text-[#e5ad46]",
    button: "border-[#e5ad46]/10 bg-[#25303a] text-[#e5ad46] hover:bg-[#25303a]/80",
    primaryButton: "border-[#e5ad46]/10 bg-[#e5ad46] text-[#25303a] hover:bg-[#f0c35e]",
    composer: "border-[#e5ad46]/10 bg-[#25303a]",
    input: "border-[#e5ad46]/10 bg-[#1e2a38] text-[#e5ad46]",
    placeholder: "text-[#e5ad46]/35",
    subItem: "border-[#e5ad46]/5 bg-[#1e2a38]",
  },
} as const;

function cloneProblems(list: ProblemThread[]): ProblemThread[] {
  return list.map((problem) => ({
    ...problem,
    subProblems: problem.subProblems.map((subProblem) => ({ ...subProblem })),
  }));
}

function createLocalId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function preventEnterSubmit(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key === "Enter") {
    event.preventDefault();
  }
}

function formatDateLabel() {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function severityLabel(severity: ProblemSeverity) {
  switch (severity) {
    case "critical":
      return "Probleme";
    case "warning":
      return "A suivre";
    case "info":
      return "Validation client";
    case "success":
      return "Signe";
    default:
      return "Probleme";
  }
}

function severityClasses(severity: ProblemSeverity, theme: keyof typeof themeMap) {
  if (theme === "dark") {
    switch (severity) {
      case "critical":
        return "border-red-400/20 bg-red-400/10 text-red-100";
      case "warning":
        return "border-amber-400/20 bg-amber-400/10 text-amber-100";
      case "info":
        return "border-sky-400/20 bg-sky-400/10 text-sky-100";
      case "success":
        return "border-emerald-400/20 bg-emerald-400/10 text-emerald-100";
      default:
        return "border-[#e5ad46]/10 bg-[#e5ad46]/5 text-[#e5ad46]";
    }
  }

  switch (severity) {
    case "critical":
      return "border-red-200 bg-red-50 text-red-700";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "info":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    default:
      return "border-[#163526]/10 bg-[#163526]/5 text-[#163526]";
  }
}

function roleChipClasses(theme: keyof typeof themeMap) {
  return theme === "dark"
    ? "border-[#e5ad46]/10 bg-[#e5ad46]/5 text-[#e5ad46]"
    : "border-[#163526]/10 bg-white text-[#163526]";
}

function compactButtonClasses(theme: keyof typeof themeMap) {
  return theme === "dark"
    ? "border-[#e5ad46]/10 bg-[#25303a] text-[#e5ad46] hover:bg-[#25303a]/80"
    : "border-[#163526]/10 bg-white text-[#163526] hover:bg-[#faf9f4]";
}

export function ProblemHierarchyPanel({
  problems: initialProblems,
  mode = "client",
  theme = "light",
  className = "",
}: ProblemHierarchyPanelProps) {
  const styles = themeMap[theme];
  const [problems, setProblems] = useState<ProblemThread[]>(() => cloneProblems(initialProblems));
  const [showAllMajorProblems, setShowAllMajorProblems] = useState(false);
  const [expandedProblemIds, setExpandedProblemIds] = useState<string[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [activeSubComposerId, setActiveSubComposerId] = useState<string | null>(null);
  const [mainDraft, setMainDraft] = useState<DraftProblem>(emptyMainDraft);
  const [subDraft, setSubDraft] = useState<DraftSubProblem>(emptySubDraft);

  useEffect(() => {
    setProblems(cloneProblems(initialProblems));
  }, [initialProblems]);

  const visibleProblems = showAllMajorProblems
    ? problems
    : problems.slice(0, VISIBLE_MAJOR_PROBLEMS);

  const hasMoreProblems = problems.length > VISIBLE_MAJOR_PROBLEMS;
  const hasClientValidation = problems.some((problem) => problem.requiresClientValidation);
  const hasLockedVersion = problems.some((problem) => problem.lockedForClient);

  const noteLines = useMemo(() => {
    if (mode === "admin") {
      return [
        `Les ${Math.min(VISIBLE_MAJOR_PROBLEMS, problems.length)} premiers problemes restent visibles par defaut.`,
        "Cliquez sur Probleme pour ajouter un point principal, puis sur Sous-probleme dans une carte ouverte.",
      ];
    }

    const lines = [
      `Seuls les ${Math.min(VISIBLE_MAJOR_PROBLEMS, problems.length)} problemes majeurs sont affiches par defaut.`,
      "Les sous-problemes apparaissent uniquement apres un clic volontaire sur Voir plus.",
    ];

    if (hasClientValidation) {
      lines.push(CLIENT_SIGNATURE_LOCK_COPY.validationRequired);
    }

    if (hasLockedVersion) {
      lines.push(CLIENT_SIGNATURE_LOCK_COPY.lockedVersion);
    }

    return lines;
  }, [hasClientValidation, hasLockedVersion, mode, problems.length]);

  function toggleProblem(problemId: string) {
    setExpandedProblemIds((current) =>
      current.includes(problemId)
        ? current.filter((entry) => entry !== problemId)
        : [...current, problemId],
    );
  }

  function resetMainDraft() {
    setMainDraft(emptyMainDraft);
  }

  function resetSubDraft() {
    setSubDraft(emptySubDraft);
  }

  function addMainProblem() {
    const title = mainDraft.title.trim();
    const summary = mainDraft.summary.trim();
    const detail = mainDraft.detail.trim();

    if (!title || !summary || !detail) {
      return;
    }

    const nextProblem: ProblemThread = {
      id: createLocalId("problem"),
      title,
      summary,
      detail,
      date: formatDateLabel(),
      severity: mainDraft.severity,
      requiresClientValidation: mainDraft.requiresClientValidation,
      lockedForClient: mainDraft.severity === "success",
      owner: mainDraft.owner.trim() || undefined,
      subProblems: [],
    };

    setProblems((current) => [nextProblem, ...current]);
    setExpandedProblemIds((current) => [nextProblem.id, ...current]);
    setShowAllMajorProblems(true);
    setComposerOpen(false);
    resetMainDraft();
  }

  function addSubProblem(problemId: string) {
    const title = subDraft.title.trim();
    const detail = subDraft.detail.trim();

    if (!title || !detail) {
      return;
    }

    setProblems((current) =>
      current.map((problem) => {
        if (problem.id !== problemId) {
          return problem;
        }

        const nextSubProblem: ProblemSubProblem = {
          id: createLocalId("subproblem"),
          title,
          detail,
          owner: subDraft.owner.trim() || undefined,
        };

        return {
          ...problem,
          subProblems: [...problem.subProblems, nextSubProblem],
        };
      }),
    );
    setExpandedProblemIds((current) => (current.includes(problemId) ? current : [...current, problemId]));
    setActiveSubComposerId(null);
    resetSubDraft();
  }

  const composerClassName =
    theme === "dark"
      ? "border-[#e5ad46]/10 bg-[#25303a]"
      : "border-[#163526]/10 bg-[#faf9f4]";

  return (
    <div className={`space-y-4 ${className}`.trim()}>
      <div className={`rounded-2xl border px-4 py-4 ${styles.note}`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <p className={`text-[10px] font-bold uppercase tracking-[0.24em] ${styles.meta}`}>
              Problemes
            </p>
            {noteLines.map((line) => (
              <p key={line} className="text-xs leading-relaxed sm:text-sm">
                {line}
              </p>
            ))}
          </div>

          {mode === "admin" ? (
            <button
              type="button"
              onClick={() => setComposerOpen((current) => !current)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition ${styles.primaryButton}`}
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              Probleme
            </button>
          ) : null}
        </div>
      </div>

      {mode === "admin" && composerOpen ? (
        <div className={`rounded-2xl border p-4 ${composerClassName}`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-[0.24em] ${styles.meta}`}>
                Nouveau probleme
              </p>
              <p className={`mt-1 text-sm ${styles.detail}`}>
                Ajoutez un probleme principal visible par le client.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setComposerOpen(false)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition ${compactButtonClasses(theme)}`}
            >
              <span className="material-symbols-outlined text-sm">close</span>
              Fermer
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="space-y-2 md:col-span-1">
              <span className={`text-[10px] font-bold uppercase tracking-[0.24em] ${styles.meta}`}>
                Titre
              </span>
              <input
                value={mainDraft.title}
                onKeyDown={preventEnterSubmit}
                onChange={(event) =>
                  setMainDraft((current) => ({ ...current, title: event.target.value }))
                }
                className={`w-full rounded-2xl border px-4 py-3 text-sm font-medium outline-none ${styles.input}`}
                placeholder="Ex: Retard de coupe"
              />
            </label>

            <label className="space-y-2 md:col-span-1">
              <span className={`text-[10px] font-bold uppercase tracking-[0.24em] ${styles.meta}`}>
                Poste concerne
              </span>
              <input
                value={mainDraft.owner}
                onKeyDown={preventEnterSubmit}
                onChange={(event) =>
                  setMainDraft((current) => ({ ...current, owner: event.target.value }))
                }
                className={`w-full rounded-2xl border px-4 py-3 text-sm font-medium outline-none ${styles.input}`}
                placeholder="Ex: chef atelier"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className={`text-[10px] font-bold uppercase tracking-[0.24em] ${styles.meta}`}>
                Resume client
              </span>
              <input
                value={mainDraft.summary}
                onKeyDown={preventEnterSubmit}
                onChange={(event) =>
                  setMainDraft((current) => ({ ...current, summary: event.target.value }))
                }
                className={`w-full rounded-2xl border px-4 py-3 text-sm font-medium outline-none ${styles.input}`}
                placeholder="Ex: La coupe attend une derniere confirmation"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className={`text-[10px] font-bold uppercase tracking-[0.24em] ${styles.meta}`}>
                Detail
              </span>
              <textarea
                value={mainDraft.detail}
                onChange={(event) =>
                  setMainDraft((current) => ({ ...current, detail: event.target.value }))
                }
                rows={3}
                className={`w-full rounded-2xl border px-4 py-3 text-sm font-medium outline-none ${styles.input}`}
                placeholder="Detail court pour l'atelier ou l'admin"
              />
            </label>

            <label className="space-y-2">
              <span className={`text-[10px] font-bold uppercase tracking-[0.24em] ${styles.meta}`}>
                Niveau
              </span>
              <select
                value={mainDraft.severity}
                onChange={(event) =>
                  setMainDraft((current) => ({
                    ...current,
                    severity: event.target.value as ProblemSeverity,
                    requiresClientValidation: event.target.value === "info",
                  }))
                }
                className={`w-full rounded-2xl border px-4 py-3 text-sm font-medium outline-none ${styles.input}`}
              >
                <option value="critical">Probleme majeur</option>
                <option value="warning">A suivre</option>
                <option value="info">Validation client</option>
                <option value="success">Version signee</option>
              </select>
            </label>

            <label className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-4 md:col-span-1 bg-white/70 text-[#163526]">
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#163526]/60">
                Validation client
              </span>
              <input
                type="checkbox"
                checked={mainDraft.requiresClientValidation}
                onChange={(event) =>
                  setMainDraft((current) => ({
                    ...current,
                    requiresClientValidation: event.target.checked,
                    severity: event.target.checked ? "info" : current.severity,
                  }))
                }
                className="h-5 w-5 rounded border-[#163526]/20 text-orange-500 focus:ring-orange-400"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={addMainProblem}
              className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-orange-600"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              Ajouter
            </button>
            <button
              type="button"
              onClick={resetMainDraft}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition ${compactButtonClasses(theme)}`}
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              Reinitialiser
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {visibleProblems.map((problem) => {
          const isExpanded = expandedProblemIds.includes(problem.id);
          const hasSubProblems = problem.subProblems.length > 0;

          return (
            <article key={problem.id} className={`rounded-2xl border p-4 ${styles.item}`}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className={`text-sm font-bold sm:text-base ${styles.title}`}>{problem.title}</h4>
                    <span
                      className={`rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${severityClasses(
                        problem.severity,
                        theme,
                      )}`}
                    >
                      {severityLabel(problem.severity)}
                    </span>
                    {problem.requiresClientValidation ? (
                      <span className={`rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${styles.chip}`}>
                        Validation client
                      </span>
                    ) : null}
                    {problem.lockedForClient ? (
                      <span className={`rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${styles.chip}`}>
                        Signe
                      </span>
                    ) : null}
                  </div>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.24em] ${styles.meta}`}>
                    {problem.date}
                  </p>
                </div>

                {problem.owner ? (
                  <span className={`rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${roleChipClasses(theme)}`}>
                    {problem.owner}
                  </span>
                ) : null}
              </div>

              <p className={`mt-3 text-sm leading-relaxed ${styles.detail}`}>{problem.summary}</p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleProblem(problem.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition ${compactButtonClasses(theme)}`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {isExpanded ? "expand_less" : "expand_more"}
                  </span>
                  {isExpanded ? "Voir moins" : "Voir plus"}
                </button>

                {mode === "admin" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSubComposerId((current) => (current === problem.id ? null : problem.id));
                      setExpandedProblemIds((current) =>
                        current.includes(problem.id) ? current : [...current, problem.id],
                      );
                    }}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition ${compactButtonClasses(theme)}`}
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    Sous-probleme
                  </button>
                ) : null}
              </div>

              {isExpanded ? (
                <div className={`mt-4 space-y-4 border-t pt-4 ${theme === "dark" ? "border-[#e5ad46]/10" : "border-[#163526]/10"}`}>
                  <p className={`text-sm leading-relaxed ${styles.detail}`}>{problem.detail}</p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className={`text-[10px] font-bold uppercase tracking-[0.24em] ${styles.meta}`}>
                        Sous-problemes
                      </p>
                      <span className={`text-[10px] font-bold uppercase tracking-[0.24em] ${styles.meta}`}>
                        {problem.subProblems.length}
                      </span>
                    </div>

                    {hasSubProblems ? (
                      <div className="space-y-2">
                        {problem.subProblems.map((subProblem) => (
                          <div
                            key={subProblem.id}
                            className={`rounded-xl border px-4 py-3 ${styles.subItem}`}
                          >
                            <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                              <div className="space-y-1">
                                <p className={`text-sm font-semibold ${styles.title}`}>{subProblem.title}</p>
                                <p className={`text-sm leading-relaxed ${styles.detail}`}>{subProblem.detail}</p>
                              </div>
                              {subProblem.owner ? (
                                <span
                                  className={`rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${roleChipClasses(theme)}`}
                                >
                                  {subProblem.owner}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-sm ${styles.detail}`}>Aucun sous-probleme pour le moment.</p>
                    )}
                  </div>

                  {mode === "admin" && activeSubComposerId === problem.id ? (
                    <div className={`rounded-2xl border p-4 ${composerClassName}`}>
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="space-y-2 md:col-span-1">
                          <span className={`text-[10px] font-bold uppercase tracking-[0.24em] ${styles.meta}`}>
                            Sous-probleme
                          </span>
                          <input
                            value={subDraft.title}
                            onKeyDown={preventEnterSubmit}
                            onChange={(event) =>
                              setSubDraft((current) => ({ ...current, title: event.target.value }))
                            }
                            className={`w-full rounded-2xl border px-4 py-3 text-sm font-medium outline-none ${styles.input}`}
                            placeholder="Ex: Ajustement des tailles"
                          />
                        </label>

                        <label className="space-y-2 md:col-span-1">
                          <span className={`text-[10px] font-bold uppercase tracking-[0.24em] ${styles.meta}`}>
                            Poste concerne
                          </span>
                          <input
                            value={subDraft.owner}
                            onKeyDown={preventEnterSubmit}
                            onChange={(event) =>
                              setSubDraft((current) => ({ ...current, owner: event.target.value }))
                            }
                            className={`w-full rounded-2xl border px-4 py-3 text-sm font-medium outline-none ${styles.input}`}
                            placeholder="Ex: modeliste"
                          />
                        </label>

                        <label className="space-y-2 md:col-span-2">
                          <span className={`text-[10px] font-bold uppercase tracking-[0.24em] ${styles.meta}`}>
                            Detail
                          </span>
                          <textarea
                            value={subDraft.detail}
                            onChange={(event) =>
                              setSubDraft((current) => ({ ...current, detail: event.target.value }))
                            }
                            rows={2}
                            className={`w-full rounded-2xl border px-4 py-3 text-sm font-medium outline-none ${styles.input}`}
                            placeholder="Detail court du sous-probleme"
                          />
                        </label>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => addSubProblem(problem.id)}
                          className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-orange-600"
                        >
                          <span className="material-symbols-outlined text-sm">add_circle</span>
                          Ajouter
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSubComposerId(null);
                            resetSubDraft();
                          }}
                          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition ${compactButtonClasses(theme)}`}
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                          Fermer
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {hasMoreProblems ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowAllMajorProblems((current) => !current)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition ${compactButtonClasses(theme)}`}
          >
            <span className="material-symbols-outlined text-sm">
              {showAllMajorProblems ? "expand_less" : "expand_more"}
            </span>
            {showAllMajorProblems ? "Voir moins" : "Voir plus"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
