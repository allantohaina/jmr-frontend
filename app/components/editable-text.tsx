"use client";

import React, { useState, useEffect, useRef } from "react";

interface EditableTextProps {
  content: string;
  onSave: (newContent: string) => void;
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
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (content !== initialContent) {
      onSave(content);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setContent(initialContent);
  };

  if (!isAdmin) {
    return <Tag className={className}>{content}</Tag>;
  }

  if (isEditing) {
    return (
      <div className="relative group/edit min-w-[100px] w-full">
        {Tag === "p" || Tag === "div" ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSave}
            className={`w-full bg-white/10 backdrop-blur-md border-2 border-orange-500 rounded-lg p-2 outline-none text-inherit font-inherit resize-none ${className}`}
            rows={4}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            className={`w-full bg-white/10 backdrop-blur-md border-2 border-orange-500 rounded-lg p-2 outline-none text-inherit font-inherit ${className}`}
          />
        )}
        <div className="absolute -top-8 right-0 flex gap-2">
          <button 
            onMouseDown={(e) => { e.preventDefault(); handleSave(); }}
            className="bg-green-500 text-white p-1 rounded shadow-lg hover:bg-green-600"
          >
            <span className="material-symbols-outlined text-sm">check</span>
          </button>
          <button 
            onMouseDown={(e) => { e.preventDefault(); handleCancel(); }}
            className="bg-red-500 text-white p-1 rounded shadow-lg hover:bg-red-600"
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
        className="absolute -top-4 -right-4 opacity-0 group-hover/editable:opacity-100 bg-orange-500 text-white p-1.5 rounded-full shadow-xl transition-all hover:scale-110 z-50 flex items-center justify-center"
        title="Modifier ce texte"
      >
        <span className="material-symbols-outlined text-[14px]">edit</span>
      </button>
    </div>
  );
}
