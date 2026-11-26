"use client";

import React, { useState } from "react";
import { Pencil } from "lucide-react";
import { useSiteContent } from "@/app/lib/site-content";
import { useToast } from "@/app/components/toast-provider";
import { useIsAdmin } from "@/app/components/editable-shared";
import { safeUrl } from "@/app/lib/utils";

type EditableLinkProps = {
  urlKey: string;
  fallback: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel: string;
  external?: boolean;
};

/**
 * Lien dont la destination est éditable depuis le contenu du site.
 * Une URL absente ou invalide rend un simple élément non cliquable plutôt
 * qu'un lien mort — l'admin peut la renseigner sans redéployer.
 */
export function EditableLink({
  urlKey,
  fallback,
  children,
  className = "",
  ariaLabel,
  external = false,
}: EditableLinkProps) {
  const { get, save, ready } = useSiteContent();
  const { showToast } = useToast();
  const isAdmin = useIsAdmin();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const raw = get(urlKey, fallback);
  const href = safeUrl(raw);

  function startEditing() {
    if (!ready) {
      showToast("Contenu en cours de chargement, réessayez dans un instant", "info");
      return;
    }
    setDraft(raw);
    setEditing(true);
  }

  async function saveUrl() {
    const next = draft.trim();
    if (next !== raw) {
      setSaving(true);
      try {
        await save(urlKey, next);
        showToast("Lien modifié", "success");
      } catch (err) {
        console.error(err);
        showToast("Échec de la sauvegarde", "error");
      } finally {
        setSaving(false);
      }
    }
    setEditing(false);
  }

  const content = href ? (
    <a
      href={href}
      aria-label={ariaLabel}
      className={className}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  ) : (
    <span aria-label={ariaLabel} className={`${className} cursor-default opacity-50`}>
      {children}
    </span>
  );

  return (
    <span className="relative inline-flex">
      {content}
      {isAdmin && !editing && (
        <button
          type="button"
          className="absolute -top-1 -right-1 z-20 rounded-full border border-[#EAA100]/50 bg-[#1e2a38]/80 p-1.5 text-[#EAA100] transition-opacity duration-200 hover:bg-[#1e2a38] focus-visible:opacity-100"
          onClick={startEditing}
          title="Modifier le lien"
        >
          <Pencil size={12} />
        </button>
      )}
      {editing && (
        <span className="absolute bottom-full left-0 z-50 mb-2 flex items-center gap-2 rounded-lg border border-[#EAA100]/40 bg-[#1e2a38] p-2 shadow-xl">
          <input
            autoFocus
            type="url"
            value={draft}
            placeholder="https://..."
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void saveUrl();
              if (e.key === "Escape") setEditing(false);
            }}
            className="w-72 rounded-lg border border-[#EAA100]/40 bg-[#0A0E19] px-3 py-2 text-sm text-[#FFF8EC] outline-none focus:border-[#EAA100]"
          />
          <button
            type="button"
            disabled={saving}
            onClick={() => void saveUrl()}
            className="rounded-lg bg-[#EAA100] px-3 py-2 text-xs font-bold text-[#1B2436] disabled:opacity-50"
          >
            OK
          </button>
        </span>
      )}
    </span>
  );
}
