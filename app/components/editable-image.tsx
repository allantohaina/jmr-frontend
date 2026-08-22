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

  async function compressIfNeeded(file: File): Promise<File> {
    const MAX_BYTES = 1.8 * 1024 * 1024; // cible <2M pour passer le 2M php par défaut + perf
    const MAX_DIM = 1920;
    const isSupported = ["image/jpeg", "image/png", "image/webp"].includes(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name);
    if (!isSupported) return file;
    // Si déjà petit et dimensions OK, on laisse tel quel
    if (file.size <= MAX_BYTES) {
      try {
        const bmp = await createImageBitmap(file).catch(() => null);
        if (bmp && bmp.width <= MAX_DIM && bmp.height <= MAX_DIM) {
          bmp.close?.();
          return file;
        }
        bmp?.close?.();
      } catch { /* fallback canvas */ }
    }
    try {
      // Utilise data: URL pour éviter CSP blob: bloqué sur admin.jmrtextile.com
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new window.Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = dataUrl;
      });
      let { width, height } = img;
      const scale = Math.min(1, MAX_DIM / Math.max(width, height));
      width = Math.round(width * scale);
      height = Math.round(height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return file;
      ctx.drawImage(img, 0, 0, width, height);
      // JPEG plus compatible que WEBP pour is_image/GD côté serveur
      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", 0.82));
      if (!blob) return file;
      if (blob.size >= file.size && file.size <= MAX_BYTES) return file;
      const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
      return new File([blob], name, { type: "image/jpeg" });
    } catch {
      return file;
    }
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      window.alert("Format non supporté : utilisez JPG, PNG ou WEBP. (HEIC/AVIF non supporté par le serveur)");
      event.target.value = "";
      return;
    }
    // Debug visible dans console pour le 422
    console.log(`[upload] original ${file.name} ${file.type} ${(file.size/1024).toFixed(0)}ko`);
    setUploading(true);
    try {
      const toUpload = await compressIfNeeded(file);
      console.log(`[upload] compressé ${toUpload.name} ${toUpload.type} ${(toUpload.size/1024).toFixed(0)}ko`);
      if (toUpload.size > 5 * 1024 * 1024) {
        window.alert("Image encore trop volumineuse après compression (5 Mo max). Réduisez la résolution.");
        return;
      }
      const doSave = async (storedName: string) => {
        await onSave(`${getBackendApiUrls()[0].replace(/\/api$/, "")}/uploads/${storedName}`);
      };
      try {
        const form = new FormData();
        form.append("file", toUpload);
        const response = await authAPI.post<{ file: { stored_name: string } }>("/uploads/image", form);
        const name = response.data?.file?.stored_name;
        if (!name) throw new Error("Image non reçue par le serveur.");
        await doSave(name);
        return;
      } catch (multipartError) {
        const msg = multipartError instanceof Error ? multipartError.message : "";
        // Fallback base64 si multipart échoue avec "Image requise." (422) - contourne php.ini / is_image / CSP multipart
        const isUploadValidationError = msg.includes("Image requise") || msg.includes("422") || msg.includes("Unprocessable");
        if (!isUploadValidationError) throw multipartError;
        console.warn("[upload] multipart échoué, tentative base64", multipartError);
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(toUpload);
        });
        const response2 = await authAPI.post<{ file: { stored_name: string } }>("/uploads/image-base64", { image: dataUrl } as unknown as FormData);
        const name2 = (response2.data as unknown as { file?: { stored_name?: string } })?.file?.stored_name ?? (response2 as unknown as { stored_name?: string })?.stored_name;
        // authAPI.post wraps en ApiResponse, mais image-base64 renvoie pareil
        const stored = name2 ?? (response2.data as unknown as { stored_name?: string })?.stored_name;
        if (!stored) {
          // tente lecture alternative du payload
          const alt = response2 as unknown as { data?: { file?: { stored_name: string } } };
          const altName = alt.data?.file?.stored_name;
          if (!altName) throw multipartError;
          await doSave(altName);
          return;
        }
        await doSave(stored);
        return;
      }
    } catch (error) {
      console.error("Impossible d’enregistrer l’image", error);
      const msg = error instanceof Error ? error.message : "Import de l’image impossible.";
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
