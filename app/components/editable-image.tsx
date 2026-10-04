"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { uploadImage } from "@/app/lib/api";
import { useSiteContent } from "@/app/lib/site-content";
import { useToast } from "@/app/components/toast-provider";
import {
  deleteOldSiteMedia,
  useIsAdmin,
  validateImageFile,
} from "@/app/components/editable-shared";

type EditableImageProps = {
  src: string;
  alt?: string;
  className?: string;
  wrapperClassName?: string;
  placeholder?: React.ReactNode;
  onUploaded?: (url: string) => void;
  contentKey?: string;
  /** Image au-dessus de la ligne de flottaison : chargement prioritaire. */
  eager?: boolean;
};

export function EditableImage({
  src,
  alt = "",
  className = "w-full h-full object-cover",
  wrapperClassName = "relative h-full w-full",
  placeholder = null,
  onUploaded,
  contentKey,
  eager = false,
}: EditableImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { get, save, ready } = useSiteContent();
  const { showToast } = useToast();
  // L'image affichée : le fallback tout de suite, comme si elle était
  // statique. L'utilisateur ne voit jamais de squelette ni de trou.
  const [displayUrl, setDisplayUrl] = useState(src);
  const isAdmin = useIsAdmin();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasUploaded, setHasUploaded] = useState(false);
  const storedUrl = contentKey ? get(contentKey, src) : src;

  // Suit la valeur persistée (CMS) : on ne bascule vers l'override
  // qu'une fois préchargé, avec un SEUL <img>. Pas de double calque :
  // l'ancien fondu à 2 couches pouvait rester bloqué à cheval (rAF /
  // timer désynchronisés) et affichait deux photos superposées.
  useEffect(() => {
    if (hasUploaded || storedUrl === displayUrl) return;
    if (!storedUrl) return;
    let cancelled = false;
    const preloader = new window.Image();
    preloader.src = storedUrl;
    const apply = () => {
      if (!cancelled) setDisplayUrl(storedUrl);
    };
    if (preloader.complete && preloader.naturalWidth !== 0) {
      apply();
    } else {
      preloader.onload = apply;
      preloader.onerror = apply;
    }
    return () => {
      cancelled = true;
      preloader.onload = null;
      preloader.onerror = null;
    };
  }, [storedUrl, hasUploaded, displayUrl]);

  async function handleUpload(file: File) {
    setError(null);
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const result = await uploadImage(file, (pct) => setProgress(pct));
      if (result.success && result.url) {
        const previousUrl = displayUrl;
        const nextUrl = String(result.url);
        setHasUploaded(true);
        setDisplayUrl(nextUrl);
        if (contentKey) {
          try {
            await save(contentKey, nextUrl, "image");
          } catch (err) {
            console.error(err);
            setError("Image envoyée, mais sauvegarde du contenu échouée.");
            showToast("Image envoyée, sauvegarde échouée", "error");
            return;
          }
        }
        onUploaded?.(nextUrl);
        showToast("Image mise à jour", "success");
        if (previousUrl && previousUrl !== nextUrl) {
          void deleteOldSiteMedia(previousUrl);
        }
      } else {
        const msg = result.error ?? "Échec de l'envoi de l'image.";
        setError(msg);
        showToast(msg, "error");
      }
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Échec de l'envoi de l'image.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // Squelette uniquement quand il n'y a RIEN à afficher (pas de fallback) :
  // avec un fallback, l'utilisateur voit une image normale dès le premier
  // rendu et ne remarque jamais le caractère dynamique.
  const hasAnyImage = !!displayUrl;

  return (
    <div className={`group/editable ${wrapperClassName}`}>
      {!hasAnyImage ? (
        contentKey && !ready ? (
          <div className="w-full h-full animate-pulse bg-[#EAA100]/10" aria-hidden="true" />
        ) : (
          placeholder
        )
      ) : (
        <img
          src={displayUrl}
          alt={alt}
          className={className}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={eager ? "high" : "auto"}
        />
      )}
      {uploading && (
        <div className="absolute inset-x-0 bottom-2 z-20 mx-auto w-max rounded-full bg-[#1e2a38]/85 px-3 py-1 text-xs text-[#EAA100] border border-[#EAA100]/50">
          Envoi image… {progress}%
        </div>
      )}
      {error && isAdmin && (
        <div className="absolute inset-x-0 bottom-2 z-20 mx-auto w-max max-w-[90%] rounded-lg bg-red-900/90 px-3 py-1 text-xs text-white">
          {error}
        </div>
      )}
      {isAdmin && (
        <button
          type="button"
          className="absolute top-2 right-2 z-20 opacity-0 group-hover/editable:opacity-100 focus-visible:opacity-100 focus:opacity-100 transition-opacity duration-200
                     bg-[#1e2a38]/80 hover:bg-[#1e2a38] text-[#EAA100] rounded-full p-2.5
                     border border-[#EAA100]/50 disabled:opacity-50"
          onClick={() => fileInputRef.current?.click()}
          title="Modifier l'image (max 5 Mo)"
          disabled={uploading}
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
          if (file) void handleUpload(file);
        }}
      />
    </div>
  );
}
