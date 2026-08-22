"use client";

import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { authAPI, getBackendApiUrls } from "@/app/lib/api";

type EditableImageProps = {
  src: string;
  alt: string;
  contentKey: string;
  isAdmin: boolean;
  onSave: (value: string) => Promise<void> | void;
  className?: string;
  fill?: boolean;
};

export function EditableImage({ src, alt, contentKey, isAdmin, onSave, className = "", fill = true }: EditableImageProps) {
  const [uploading, setUploading] = useState(false);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    // Vérif côté client avant envoi (5 Mo max côté backend Config/Upload.php:9)
    if (file.size > 5 * 1024 * 1024) {
      window.alert("Image trop volumineuse : 5 Mo max. Compressez l'image avant.");
      event.target.value = "";
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      window.alert("Format non supporté : utilisez JPG, PNG ou WEBP.");
      event.target.value = "";
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await authAPI.post<{ file: { stored_name: string } }>("/uploads/image", form);
      const name = response.data?.file?.stored_name;
      if (!name) throw new Error("Image non reçue par le serveur.");
      await onSave(`${getBackendApiUrls()[0].replace(/\/api$/, "")}/uploads/${name}`);
    } catch (error) {
      console.error("Impossible d’enregistrer l’image", error);
      const msg = error instanceof Error ? error.message : "Import de l’image impossible.";
      // Message plus actionnable pour le timeout / CORS / session
      window.alert(msg + "\n\nVérifiez : 1) vous êtes connecté en admin, 2) image <5 Mo, 3) backend https://api.jmrtextile.com joignable.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return <div className="absolute inset-0 group/edit-image">
    <Image className={className} src={src} alt={alt} fill={fill} unoptimized />
    {isAdmin && <label className="absolute right-3 top-3 z-30 inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-on-primary shadow-lg transition opacity-100 md:opacity-0 md:group-hover/edit-image:opacity-100 focus-within:opacity-100 border border-white/20 min-h-[36px]">
      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
      {uploading ? "Import…" : "Changer l’image"}
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} disabled={uploading} className="sr-only" aria-label={`Changer ${contentKey}`} />
    </label>}
  </div>;
}
