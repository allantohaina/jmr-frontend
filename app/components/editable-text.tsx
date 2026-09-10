"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { getUser } from "@/app/lib/auth";
import { useSiteContent } from "@/app/lib/site-content";

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
  const { get, save } = useSiteContent();
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(fallback);
  const [colorDraft, setColorDraft] = useState("");
  const [scaleDraft, setScaleDraft] = useState(1);
  const [saving, setSaving] = useState(false);

  const value = get(contentKey, fallback);
  const colorKey = `${contentKey}.color`;
  const sizeKey = `${contentKey}.size`;
  const color = get(colorKey, "");
  const scale = parseFloat(get(sizeKey, "1")) || 1;

  useEffect(() => {
    setIsAdmin(getUser()?.role === "admin");
  }, []);

  async function persist() {
    const next = draft.trim() === "" ? fallback : draft;
    setSaving(true);
    try {
      await save(contentKey, next, "text");
      await save(colorKey, colorDraft || "#e5ad46", "text");
      await save(sizeKey, String(scaleDraft), "text");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  function startEditing() {
    setDraft(value);
    setColorDraft(color || "#e5ad46");
    setScaleDraft(scale);
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
            className="absolute -top-1 -right-1 z-20 opacity-0 group-hover/editable:opacity-100 transition-opacity duration-200
                       bg-[#1e2a38]/80 hover:bg-[#1e2a38] text-[#e5ad46] rounded-full p-1.5
                       border border-[#e5ad46]/50"
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
    "w-full rounded-lg border border-[#e5ad46]/40 bg-[#1e2a38] px-3 py-2 text-sm text-[#eccc90] outline-none focus:border-[#e5ad46]";

  function changeScale(delta: number) {
    setScaleDraft((prev) => Math.min(3, Math.max(0.5, Math.round((prev + delta) * 10) / 10)));
  }

  return (
    <span
      className={`relative ${className}`}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null) && !saving) {
          void persist();
        }
      }}
    >
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
      <span className="mt-2 flex items-center gap-2">
        <input
          type="color"
          value={colorDraft}
          title="Couleur du texte"
          onChange={(e) => setColorDraft(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded-lg border border-[#e5ad46]/40 bg-[#1e2a38] p-1"
        />
        <button
          type="button"
          title="Réduire la taille"
          onClick={() => changeScale(-0.1)}
          className="rounded-lg border border-[#e5ad46]/40 px-2.5 py-1 text-xs font-bold text-[#e5ad46] hover:bg-[#e5ad46]/10"
        >
          A-
        </button>
        <span className="min-w-[3rem] text-center font-mono text-[11px] text-[#eccc90]">
          {Math.round(scaleDraft * 100)}%
        </span>
        <button
          type="button"
          title="Agrandir la taille"
          onClick={() => changeScale(0.1)}
          className="rounded-lg border border-[#e5ad46]/40 px-2.5 py-1 text-xs font-bold text-[#e5ad46] hover:bg-[#e5ad46]/10"
        >
          A+
        </button>
        <button
          type="button"
          onClick={() => void persist()}
          disabled={saving}
          className="rounded-lg bg-[#e5ad46] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#1e2a38] hover:bg-[#eccc90] disabled:opacity-50"
        >
          {saving ? "…" : "Valider"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-lg border border-[#e5ad46]/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#eccc90]/60 hover:text-[#eccc90]"
        >
          Annuler
        </button>
      </span>
    </span>
  );
}
