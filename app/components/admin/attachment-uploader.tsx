"use client";

import { useState, useEffect, useCallback } from "react";
import { Upload, X, FileText, Image, Loader2 } from "lucide-react";
import { authAPI } from "@/app/lib";

type Attachment = {
  id: string;
  original_name: string;
  stored_name: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  url: string;
  created_at: string;
};

type EntityType = "demande" | "cotation" | "commande" | "bon_livraison" | "produit";

interface AttachmentUploaderProps {
  entityType: EntityType;
  entityId: string;
  maxSizeMB?: number;
  onUpload?: () => void;
}

export function AttachmentUploader({ entityType, entityId, maxSizeMB = 5, onUpload }: AttachmentUploaderProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fetchAttachments = useCallback(async () => {
    if (!entityId) return;
    setIsLoading(true);
    try {
      const res = await authAPI.get<{ data: Attachment[] }>(
        `/attachments?entity_type=${entityType}&entity_id=${entityId}`
      );
      setAttachments(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch {
      setError("Impossible de charger les pièces jointes");
    } finally {
      setIsLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className="h-5 w-5 text-green-500" />;
    if (mimeType === "application/pdf") return <FileText className="h-5 w-5 text-red-500" />;
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  const isImageFile = (type: string) => type.startsWith("image/") || ["image/jpg", "image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif"].includes(type);

  const handleUpload = async (files: FileList) => {
    if (!entityId) return;

    const validFiles = Array.from(files).filter((file) => {
      const isImage = isImageFile(file.type);
      const isDocument = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
        "text/plain",
      ].includes(file.type);
      if (!isImage && !isDocument) {
        setError(`Type de fichier non autorisé: ${file.name}`);
        return false;
      }
      const maxBytes = (isImage ? Math.min(maxSizeMB, 5) : 10) * 1024 * 1024;
      if (file.size > maxBytes) {
        setError(`Fichier "${file.name}" trop volumineux (max ${isImage ? 5 : 10} MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      let uploaded = 0;
      for (const file of validFiles) {
        const uploadType = isImageFile(file.type) ? "image" : "document";
        const uploadForm = new FormData();
        uploadForm.append("file", file);

        const uploadRes = await authAPI.post<{
          file: { original_name: string; stored_name: string; mime: string | null; size: number | null };
        }>(`/uploads/${uploadType}`, uploadForm);

        const meta = uploadRes.data?.file;
        if (!meta) continue;

        const storedName = meta.stored_name;
        const isImage = uploadType === "image";
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "https://api.jmrtextile.com/api").replace(/\/+$/, "");
        const fileUrl = `${apiUrl.replace(/\/api$/, "")}/uploads/${storedName}`;

        const registerForm = new FormData();
        registerForm.append("entity_type", entityType);
        registerForm.append("entity_id", entityId);
        registerForm.append("original_name", meta.original_name);
        registerForm.append("stored_name", storedName);
        registerForm.append("file_type", meta.original_name.includes(".") ? meta.original_name.split(".").pop()!.toLowerCase() : "file");
        registerForm.append("mime_type", meta.mime ?? "");
        registerForm.append("file_size", String(meta.size ?? file.size));
        registerForm.append("url", fileUrl);

        await authAPI.post("/attachments", registerForm);
        uploaded += 1;
      }
      setNotice({ tone: "success", message: `${uploaded} fichier(s) ajouté(s)` });
      fetchAttachments();
      onUpload?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm("Supprimer cette pièce jointe ?")) return;
    try {
      await authAPI.delete(`/attachments/${attachmentId}`);
      setNotice({ tone: "success", message: "Pièce jointe supprimée" });
      fetchAttachments();
    } catch {
      setError("Erreur lors de la suppression");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const [notice, setNotice] = useState<{ tone: "success" | "danger"; message: string } | null>(null);

  return (
    <div className="space-y-4">
      {notice && (
        <div className={`p-3 rounded-lg border text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${
          notice.tone === "success" ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700"
        }`}>
          <span className="material-symbols-outlined text-sm">{notice.tone === "success" ? "check_circle" : "error"}</span>
          {notice.message}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg border border-red-100 bg-red-50 text-xs text-red-700">
          {error}
        </div>
      )}

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
          dragActive
            ? "border-orange-500 bg-orange-50"
            : "border-[#163526]/10 bg-[#faf9f4] hover:border-[#163526]/30"
        }`}
      >
        <input
          type="file"
          multiple
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
          className="hidden"
          id={`attachment-upload-${entityType}-${entityId}`}
          accept="image/jpeg,image/png,image/webp,application/pdf,text/csv"
        />
        <label
          htmlFor={`attachment-upload-${entityType}-${entityId}`}
          className="cursor-pointer"
        >
          <Upload className={`mx-auto h-10 w-10 ${dragActive ? "text-orange-500" : "text-[#163526]/40"}`} />
          <p className="mt-2 text-sm font-medium text-[#163526]">
            {dragActive ? "Déposez les fichiers ici" : "Cliquez ou déposez pour ajouter des pièces jointes"}
          </p>
          <p className="text-[10px] text-[#1b1c19]/40 uppercase tracking-widest mt-1">
            JPG, PNG, WebP, PDF, CSV — Max {maxSizeMB} MB
          </p>
        </label>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-[#163526]" />
        </div>
      ) : attachments.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">
            Pièces jointes ({attachments.length})
          </p>
          <div className="space-y-2">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-3 p-3 bg-white border border-[#163526]/5 rounded-xl hover:border-[#163526]/20 transition-colors"
              >
                <div className="flex-shrink-0">{getFileIcon(att.mime_type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#163526] truncate">{att.original_name}</p>
                  <p className="text-[10px] text-[#1b1c19]/40 uppercase tracking-widest">
                    {formatFileSize(att.file_size)} • {new Date(att.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-[#163526]/60 hover:text-orange-500 transition-colors"
                  title="Ouvrir"
                >
                  <span className="material-symbols-outlined">open_in_new</span>
                </a>
                <button
                  onClick={() => handleDelete(att.id)}
                  className="p-2 text-red-500/60 hover:text-red-600 transition-colors"
                  title="Supprimer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}