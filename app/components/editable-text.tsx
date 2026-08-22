"use client";

import React, { useState, useEffect, useRef } from "react";

interface EditableTextProps {
  content: string;
  onSave: (newContent: string) => Promise<void> | void;
  isAdmin: boolean;
  className?: string;
  tag?: "h1" | "h2" | "h3" | "p" | "span" | "div";
}

export function EditableText({ 
  content: initialContent, 
  onSave, 
  isAdmin, 
  className = "", 
  tag: Tag = "span" 
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  // Sync avec la prop quand le contenu backend change (après save / reload)
  useEffect(() => {
    if (!isEditing) setContent(initialContent);
  }, [initialContent, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (content === initialContent) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(content);
      setIsEditing(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Sauvegarde impossible. Vérifiez votre connexion ou votre session admin.";
      setError(msg);
      // reste en édition pour permettre de réessayer
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setContent(initialContent);
    setError(null);
  };

  if (!isAdmin) {
    return <Tag className={className}>{initialContent}</Tag>;
  }

  if (isEditing) {
    return (
      <div className="relative group/edit min-w-[100px] w-full">
        {Tag === "p" || Tag === "div" ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`w-full bg-white/10 backdrop-blur-md border-2 border-orange-500 rounded-lg p-2 outline-none text-inherit font-inherit resize-none ${className}`}
            rows={4}
            disabled={saving}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            className={`w-full bg-white/10 backdrop-blur-md border-2 border-orange-500 rounded-lg p-2 outline-none text-inherit font-inherit ${className}`}
            disabled={saving}
          />
        )}
        {error && <p className="mt-1 text-xs text-red-600 bg-white/90 rounded px-2 py-1">{error}</p>}
        <div className="absolute -top-8 right-0 flex gap-2">
          <button 
            onMouseDown={(e) => { e.preventDefault(); handleSave(); }}
            disabled={saving}
            className="bg-green-500 text-white p-1 rounded shadow-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-1 text-xs px-2"
          >
            <span className="material-symbols-outlined text-sm">check</span> {saving ? "…" : ""}
          </button>
          <button 
            onMouseDown={(e) => { e.preventDefault(); handleCancel(); }}
            disabled={saving}
            className="bg-red-500 text-white p-1 rounded shadow-lg hover:bg-red-600 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group/editable inline-block w-full">
      <Tag className={className}>{content}</Tag>
      <button
        onClick={() => setIsEditing(true)}
        onTouchEnd={(e) => { e.preventDefault(); setIsEditing(true); }}
        className="absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-orange-500 text-white p-1.5 rounded-full shadow-xl transition-all hover:scale-110 active:scale-95 z-50 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover/editable:opacity-100 focus:opacity-100 border-2 border-white/20 min-w-[32px] min-h-[32px]"
        title="Modifier ce texte"
        aria-label="Modifier ce texte"
      >
        <span className="material-symbols-outlined text-[14px]">edit</span>
      </button>
    </div>
  );
}
