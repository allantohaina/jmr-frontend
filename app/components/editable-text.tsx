"use client";

import { useEffect, useRef, useState } from "react";
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
  // Snapshot des valeurs au moment où l'édition démarre : tout ce qui
  // change est enregistré aussitôt, sans bouton Valider — une fois
  // modifié, c'est fait.
  const [initial, setInitial] = useState({ text: fallback, color: "", scale: 1 });
  const colorTimer = useRef<number | null>(null);

  const value = get(contentKey, fallback);
  const colorKey = `${contentKey}.color`;
  const sizeKey = `${contentKey}.size`;
  const color = get(colorKey, "");
  const scale = parseFloat(get(sizeKey, "1")) || 1;

  useEffect(() => {
    return () => {
      if (colorTimer.current) window.clearTimeout(colorTimer.current);
    };
  }, []);

  /** Enregistre la couleur (appel immédiat + mise à jour du snapshot). */
  async function saveColorNow(next: string) {
    if (next === initial.color) return;
    try {
      await save(colorKey, next, "text");
      setInitial((prev) => ({ ...prev, color: next }));
    } catch (err) {
      console.error(err);
      showToast("Échec de la sauvegarde de la couleur", "error");
    }
  }

  /** Enregistre la taille (appel immédiat + mise à jour du snapshot). */
  async function saveScaleNow(next: number) {
    if (next === initial.scale) return;
    try {
      await save(sizeKey, String(next), "text");
      setInitial((prev) => ({ ...prev, scale: next }));
    } catch (err) {
      console.error(err);
      showToast("Échec de la sauvegarde de la taille", "error");
    }
  }

  /** Quitter la zone (clic ailleurs) ou Entrée : tout ce qui a changé part, et c'est fini. */
  async function finishEditing() {
    if (colorTimer.current) {
      window.clearTimeout(colorTimer.current);
      colorTimer.current = null;
    }
    const next = draft.trim() === "" ? fallback : draft;
    const jobs: Promise<void>[] = [];
    if (next !== initial.text) {
      jobs.push(
        save(contentKey, next, "text").then(() =>
          setInitial((prev) => ({ ...prev, text: next })),
        ),
      );
    }
    if (colorDraft !== initial.color) {
      // Chaîne vide = retour au style par défaut : on persiste vide plutôt
      // que de forcer une couleur, pour ne pas teinter le texte malgré soi.
      const c = colorDraft;
      jobs.push(
        save(colorKey, c, "text").then(() =>
          setInitial((prev) => ({ ...prev, color: c })),
        ),
      );
    }
    if (scaleDraft !== initial.scale) {
      const s = scaleDraft;
      jobs.push(
        save(sizeKey, String(s), "text").then(() =>
          setInitial((prev) => ({ ...prev, scale: s })),
        ),
      );
    }
    if (jobs.length === 0) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await Promise.all(jobs);
      showToast("Modifié", "success");
    } catch (err) {
      console.error(err);
      showToast("Échec de la sauvegarde", "error");
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

  function cancelEditing() {
    if (colorTimer.current) {
      window.clearTimeout(colorTimer.current);
      colorTimer.current = null;
    }
    setEditing(false);
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
    const next = Math.min(3, Math.max(0.5, Math.round((scaleDraft + delta) * 10) / 10));
    setScaleDraft(next);
    void saveScaleNow(next);
  }

  function changeColor(next: string) {
    setColorDraft(next);
    // La pipette envoie des dizaines d'événements : on enregistre 800 ms
    // après le dernier, pas à chaque intermédiaire.
    if (colorTimer.current) window.clearTimeout(colorTimer.current);
    colorTimer.current = window.setTimeout(() => void saveColorNow(next), 800);
  }

  return (
    <span
      className={`relative ${className}`}
      onBlur={(e) => {
        // Le focus circule entre les contrôles de la zone : on n'enregistre
        // que quand il la quitte vraiment (clic ailleurs).
        if (!e.currentTarget.contains(e.relatedTarget as Node | null) && !saving) {
          void finishEditing();
        }
      }}
    >
      {multiline ? (
        <textarea
          className={`${inputClassName} min-h-[80px]`}
          value={draft}
          autoFocus
          style={colorDraft ? { color: colorDraft } : undefined}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") cancelEditing();
          }}
        />
      ) : (
        <input
          className={inputClassName}
          value={draft}
          autoFocus
          style={colorDraft ? { color: colorDraft } : undefined}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void finishEditing();
            if (e.key === "Escape") cancelEditing();
          }}
        />
      )}
      {/* Pas de bouton : chaque réglage s'enregistre aussitôt. */}
      <span className="mt-2 flex items-center gap-2">
        <input
          type="color"
          value={colorDraft || "#EAA100"}
          title="Couleur du texte (enregistrée aussitôt)"
          onChange={(e) => changeColor(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded-lg border border-[#EAA100]/40 bg-[#1e2a38] p-1"
        />
        <button
          type="button"
          title="Couleur par défaut (enregistrée aussitôt)"
          onClick={() => {
            setColorDraft("");
            void saveColorNow("");
          }}
          className="rounded-lg border border-[#EAA100]/40 px-2.5 py-1 text-xs font-bold text-[#EAA100] hover:bg-[#EAA100]/10"
        >
          Défaut
        </button>
        <button
          type="button"
          title="Réduire la taille (enregistrée aussitôt)"
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
          title="Agrandir la taille (enregistrée aussitôt)"
          onClick={() => changeScale(0.1)}
          className="rounded-lg border border-[#EAA100]/40 px-2.5 py-1 text-xs font-bold text-[#EAA100] hover:bg-[#EAA100]/10"
        >
          A+
        </button>
      </span>
    </span>
  );
}
