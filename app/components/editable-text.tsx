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
  const [saving, setSaving] = useState(false);

  const value = get(contentKey, fallback);

  useEffect(() => {
    setIsAdmin(getUser()?.role === "admin");
  }, []);

  async function persist() {
    const next = draft.trim() === "" ? fallback : draft;
    setSaving(true);
    try {
      await save(contentKey, next, "text");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  function startEditing() {
    setDraft(value);
    setEditing(true);
  }

  if (!editing) {
    const Tag = as;
    return (
      <Tag className={`group/editable relative ${className}`}>
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

  return (
    <span className={`relative ${className}`}>
      {multiline ? (
        <textarea
          className={`${inputClassName} min-h-[80px]`}
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            if (!saving) void persist();
          }}
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
          onBlur={() => {
            if (!saving) void persist();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") void persist();
            if (e.key === "Escape") setEditing(false);
          }}
        />
      )}
    </span>
  );
}
