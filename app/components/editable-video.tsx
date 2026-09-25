"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { uploadImage } from "@/app/lib/api";
import { useSiteContent } from "@/app/lib/site-content";
import { useToast } from "@/app/components/toast-provider";
import { deleteOldSiteMedia, useIsAdmin } from "@/app/components/editable-shared";

type EditableVideoProps = {
  src: string;
  poster?: string;
  className?: string;
  wrapperClassName?: string;
  contentKey?: string;
  onUploaded?: (url: string) => void;
};

const MAX_VIDEO_BYTES = 30 * 1024 * 1024;

function extFromFile(file: File): string {
  const nameExt = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (nameExt === "mp4" || nameExt === "webm") return nameExt;
  if (file.type === "video/webm") return "webm";
  return "mp4";
}

export function EditableVideo({
  src,
  poster,
  className = "home-page__hero-background-video",
  wrapperClassName = "absolute inset-0",
  contentKey,
  onUploaded,
}: EditableVideoProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { get, save, ready } = useSiteContent();
  const { showToast } = useToast();
  const [videoUrl, setVideoUrl] = useState(src);
  const isAdmin = useIsAdmin();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasVideoError, setHasVideoError] = useState(false);
  const uploadedRef = useRef(false);
  const storedUrl = contentKey ? get(contentKey, src) : src;

  // Suit la valeur persistée (chargée après le premier rendu), sauf après
  // un upload local qui a toujours priorité.
  useEffect(() => {
    if (contentKey && !uploadedRef.current && storedUrl !== videoUrl) {
      setVideoUrl(storedUrl);
      setHasVideoError(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedUrl]);

  async function handleUpload(file: File) {
    setError(null);
    if (!file.type.startsWith("video/")) {
      const msg = "Fichier non supporté : choisissez une vidéo mp4/webm.";
      setError(msg);
      showToast(msg, "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setError("Vidéo trop lourde (max 30 Mo).");
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const result = await uploadImage(file, (pct) => setProgress(pct), extFromFile(file));
      if (result.success && result.url) {
        const previousUrl = videoUrl;
        const nextUrl = String(result.url);
        uploadedRef.current = true;
        setVideoUrl(nextUrl);
        setHasVideoError(false);
        if (contentKey) {
          try {
            await save(contentKey, nextUrl, "video");
          } catch (err) {
            console.error(err);
            setError("Vidéo envoyée, mais sauvegarde du contenu échouée.");
            showToast("Vidéo envoyée, sauvegarde échouée", "error");
            return;
          }
        }
        onUploaded?.(nextUrl);
        showToast("Vidéo mise à jour", "success");
        if (previousUrl && previousUrl !== nextUrl) {
          void deleteOldSiteMedia(previousUrl);
        }
      } else {
        const msg = result.error ?? "Échec de l'envoi de la vidéo.";
        setError(msg);
        showToast(msg, "error");
      }
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Échec de l'envoi de la vidéo.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function deleteOldVideo(url: string) {
    await deleteOldSiteMedia(url);
  }

  const waitingForContent = !!contentKey && !ready && !uploadedRef.current && !videoUrl;

  return (
    <div className={`group/editable ${wrapperClassName}`}>
      {waitingForContent ? (
        <div className="w-full h-full animate-pulse bg-[#EAA100]/10" aria-hidden="true" />
      ) : videoUrl && !hasVideoError ? (
        <video
          key={videoUrl}
          className={className}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={poster}
          aria-hidden="true"
          onError={() => setHasVideoError(true)}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : null}
      {uploading && (
        <div className="absolute inset-x-0 bottom-2 z-20 mx-auto w-max rounded-full bg-[#1e2a38]/85 px-3 py-1 text-xs text-[#EAA100] border border-[#EAA100]/50">
          Envoi vidéo… {progress}%
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
          className="absolute top-2 right-2 z-20 opacity-0 group-hover/editable:opacity-100 transition-opacity duration-200
                     bg-[#1e2a38]/80 hover:bg-[#1e2a38] text-[#EAA100] rounded-full p-2.5
                     border border-[#EAA100]/50 disabled:opacity-50"
          onClick={() => fileInputRef.current?.click()}
          title="Changer la vidéo (mp4/webm, max 30 Mo)"
          disabled={uploading}
        >
          <Pencil size={15} />
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,.mp4,.webm"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleUpload(file);
        }}
      />
    </div>
  );
}
