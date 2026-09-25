"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { useSiteContent } from "@/app/lib/site-content";
import { useToast } from "@/app/components/toast-provider";
import { useIsAdmin } from "@/app/components/editable-shared";

type EditableTextProps = {
  contentKey: string;
  fallback: string;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div";
  className?: string;
  multiline?: boolean;
};

export function EditableText({
  contentKey,
  fallback,
  as = "span",
  className = "",
  multiline = false,
}: EditableTextProps) {
  const { get, save, ready } = useSiteContent();
  const { showToast } = useToast();
  const isAdmin = useIsAdmin();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(fallback);
  const [colorDraft, setColorDraft] = useState("");
  const [scaleDraft, setScaleDraft] = useState(1);
  const [saving, setSaving] = useState(false);
  // Snapshot des valeurs au moment où l'édition démarre : seules les
  // clés modifiées sont envoyées, pour ne jamais écraser couleur/taille
  // quand on ne voulait changer que le texte.
  const [initial, setInitial] = useState({ text: fallback, color: "", scale: 1 });

  const value = get(contentKey, fallback);
  const colorKey = `${contentKey}.color`;
  const sizeKey = `${contentKey}.size`;
  const color = get(colorKey, "");
  const scale = parseFloat(get(sizeKey, "1")) || 1;

  async function persist() {
    const next = draft.trim() === "" ? fallback : draft;
    const jobs: Promise<void>[] = [];
    if (next !== initial.text) jobs.push(save(contentKey, next, "text"));
    if (colorDraft !== initial.color) {
      // Chaîne vide = retour au style par défaut : on persiste vide plutôt
      // que de forcer une couleur, pour ne pas teinter le texte malgré soi.
      jobs.push(save(colorKey, colorDraft, "text"));
    }
    if (scaleDraft !== initial.scale) jobs.push(save(sizeKey, String(scaleDraft), "text"));
    if (jobs.length === 0) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await Promise.all(jobs);
      showToast("Texte mis à jour", "success");
    } catch (err) {
      console.error(err);
      showToast("Échec de la sauvegarde du texte", "error");
      return;
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  function startEditing() {
    if (!ready) {
      showToast("Contenu en cours de chargement, réessayez dans un instant", "info");
      return;
    }
    setDraft(value);
    const c = color || "";
    const s = scale;
    setColorDraft(c);
    setScaleDraft(s);
    setInitial({ text: value, color: c, scale: s });
    setEditing(true);
  }

  if (!editing) {
    const Tag = as;
    return (
      <Tag
        className={`group/editable relative ${className}`}
        style={{
          ...(color ? { color } : null),
          ...(scale !== 1 ? { fontSize: `${scale}em` } : null),
        }}
      >
        {value}
        {isAdmin && (
          <button
            type="button"
            className="absolute -top-1 -right-1 z-20 opacity-0 group-hover/editable:opacity-100 focus-visible:opacity-100 focus:opacity-100 transition-opacity duration-200
                       bg-[#1e2a38]/80 hover:bg-[#1e2a38] text-[#EAA100] rounded-full p-1.5
                       border border-[#EAA100]/50"
            onClick={startEditing}
            title="Modifier le texte"
          >
            <Pencil size={12} />
          </button>
        )}
      </Tag>
    );
  }

  const inputClassName =
    "w-full rounded-lg border border-[#EAA100]/40 bg-[#1e2a38] px-3 py-2 text-sm text-[#EAA100] outline-none focus:border-[#EAA100]";

  function changeScale(delta: number) {
    setScaleDraft((prev) => Math.min(3, Math.max(0.5, Math.round((prev + delta) * 10) / 10)));
  }

  return (
    <span className={`relative ${className}`}>
      {multiline ? (
        <textarea
          className={`${inputClassName} min-h-[80px]`}
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setEditing(false);
          }}
        />
      ) : (
        <input
          className={inputClassName}
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void persist();
            if (e.key === "Escape") setEditing(false);
          }}
        />
      )}
      {/* Sauvegarde volontaire uniquement : pas d'auto-save au blur,
          pour ne pas écraser le contenu en cliquant à côté. */}
      <span className="mt-2 flex items-center gap-2">
        <input
          type="color"
          value={colorDraft || "#EAA100"}
          title="Couleur du texte"
          onChange={(e) => setColorDraft(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded-lg border border-[#EAA100]/40 bg-[#1e2a38] p-1"
        />
        <button
          type="button"
          title="Revenir à la couleur par défaut"
          onClick={() => setColorDraft("")}
          className="rounded-lg border border-[#EAA100]/40 px-2.5 py-1 text-xs font-bold text-[#EAA100] hover:bg-[#EAA100]/10"
        >
          Défaut
        </button>
        <button
          type="button"
          title="Réduire la taille"
          onClick={() => changeScale(-0.1)}
          className="rounded-lg border border-[#EAA100]/40 px-2.5 py-1 text-xs font-bold text-[#EAA100] hover:bg-[#EAA100]/10"
        >
          A-
        </button>
        <span className="min-w-[3rem] text-center font-mono text-label text-[#EAA100]">
          {Math.round(scaleDraft * 100)}%
        </span>
        <button
          type="button"
          title="Agrandir la taille"
          onClick={() => changeScale(0.1)}
          className="rounded-lg border border-[#EAA100]/40 px-2.5 py-1 text-xs font-bold text-[#EAA100] hover:bg-[#EAA100]/10"
        >
          A+
        </button>
        <button
          type="button"
          onClick={() => void persist()}
          disabled={saving}
          className="rounded-lg bg-[#EAA100] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#1e2a38] hover:bg-[#EAA100] disabled:opacity-50"
        >
          {saving ? "…" : "Valider"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-lg border border-[#EAA100]/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#EAA100]/60 hover:text-[#EAA100]"
        >
          Annuler
        </button>
      </span>
    </span>
  );
}
