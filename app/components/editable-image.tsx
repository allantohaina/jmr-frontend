"use client";

import { useRef } from "react";
import { Pencil } from "lucide-react";
import { uploadImage } from "@/app/lib/api";

type EditableImageProps = {
  src: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  placeholder?: React.ReactNode;
  onUploaded?: (url: string) => void;
};

export function EditableImage({
  src,
  alt = "",
  className = "",
  imgClassName = "w-full h-full object-cover",
  placeholder = null,
  onUploaded,
}: EditableImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await uploadImage(file);
    if (result.success) {
      console.log("Image uploadée :", result.url);
      onUploaded?.(result.url);
    } else {
      console.error(result.error);
    }
  }

  return (
    <div className={`group relative ${className}`}>
      {src ? (
        <img src={src} alt={alt} className={imgClassName} />
      ) : (
        placeholder
      )}
      <button
        type="button"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200
                   bg-[#1e2a38]/80 hover:bg-[#1e2a38] text-[#e5ad46] rounded-full p-2.5
                   border border-[#e5ad46]/50"
        onClick={() => fileInputRef.current?.click()}
        title="Modifier l'image"
      >
        <Pencil size={15} />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
