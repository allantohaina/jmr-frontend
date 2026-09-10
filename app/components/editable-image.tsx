"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { uploadImage } from "@/app/lib/api";
import { getUser } from "@/app/lib/auth";

export function EditableImage({
  src,
  alt = "",
  className = "w-full h-full object-cover",
  wrapperClassName = "relative h-full w-full",
}: {
  src: string;
  alt?: string;
  className?: string;
  wrapperClassName?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState(src);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(getUser()?.role === "admin");
  }, []);

  async function handleUpload(file: File) {
    const result = await uploadImage(file);
    if (result.success) {
      const previousUrl = imageUrl;
      const nextUrl = String(result.url);
      setImageUrl(nextUrl);
      if (previousUrl && previousUrl !== nextUrl) {
        void deleteOldImage(previousUrl);
      }
    } else {
      console.error(result.error);
    }
  }

  // Supprime l'ancienne image remplacée pour éviter l'accumulation.
  // Uniquement les fichiers déjà uploadés (uploads/site/), jamais les
  // images par défaut du design (/human_images/...) ni les externes.
  async function deleteOldImage(url: string) {
    const marker = "uploads/site/";
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const filename = url.slice(idx + marker.length).split(/[?#]/)[0];
    if (!filename || filename.includes("/") || filename.includes("\\")) return;
    const params = new URLSearchParams();
    params.set("filename", filename);
    try {
      await fetch("https://api.jmrtextile.com/admin/media/delete", {
        method: "POST",
        body: params,
      });
    } catch {
      // Suppression best-effort : l'upload a déjà réussi.
    }
  }

  return (
    <div className={`group/editable ${wrapperClassName}`}>
      <img src={imageUrl} alt={alt} className={className} />
      {isAdmin && (
        <button
          type="button"
          className="absolute top-2 right-2 z-20 opacity-0 group-hover/editable:opacity-100 transition-opacity duration-200
                     bg-[#1e2a38]/80 hover:bg-[#1e2a38] text-[#e5ad46] rounded-full p-2.5
                     border border-[#e5ad46]/50"
          onClick={() => fileInputRef.current?.click()}
          title="Modifier l'image"
        >
          <Pencil size={15} />
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
    </div>
  );
}
