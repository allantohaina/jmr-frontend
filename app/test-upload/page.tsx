"use client";

import { useState } from "react";
import { uploadImage } from "@/app/lib/api";

export default function TestUploadPage() {
  const [fileInfo, setFileInfo] = useState("");
  const [requestJson, setRequestJson] = useState("");
  const [responseJson, setResponseJson] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileInfo(`nom: ${file.name} | taille: ${file.size} octets | type: ${file.type || "(vide)"}`);
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    const base64Length = dataUrl.includes(",") ? dataUrl.split(",")[1].length : dataUrl.length;
    const totalChunks = Math.ceil(base64Length / 6000);
    setRequestJson(
      JSON.stringify(
        {
          transport: "fragmenté (morceaux ~6 Ko)",
          chunkUrl: "https://api.jmrtextile.com/admin/media/upload-chunk",
          finalizeUrl: "https://api.jmrtextile.com/admin/media/finalize-upload",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          base64Length,
          totalChunks,
        },
        null,
        2,
      ),
    );
    setResponseJson("envoi en cours…");
    setImageUrl("");
    setCopied(false);
    try {
      const result = await uploadImage(file);
      setResponseJson(JSON.stringify(result, null, 2));
      if (result?.success && result?.url) {
        setImageUrl(String(result.url));
      }
    } catch (err) {
      setResponseJson(`ERREUR (pas de JSON reçu) : ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function handleCopy() {
    const report = `FICHIER\n${fileInfo}\n\nREQUÊTE\n${requestJson}\n\nRÉPONSE\n${responseJson}`;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }
  return (
    <div className="min-h-screen bg-[#1e2a38] flex items-center justify-center p-6 font-body">
      <div className="w-full max-w-lg rounded-2xl bg-[#25303a] border border-[#e5ad46]/10 p-8 space-y-6">
        <div>
          <h1 className="font-headline text-2xl text-[#e5ad46]">Test upload image</h1>
          <p className="text-xs text-[#eccc90]/50 mt-1">Upload fragmenté vers /admin/media/upload-chunk</p>
        </div>

        <label className="block cursor-pointer rounded-xl border border-[#e5ad46]/20 bg-[#1e2a38] px-4 py-3 text-sm font-bold text-[#e5ad46] hover:bg-[#e5ad46]/10 transition-colors text-center">
          Choisir une image…
          <input type="file" accept="image/*" className="hidden" onChange={handleChange} />
        </label>

        {fileInfo !== "" && (
          <p className="text-xs text-[#eccc90] break-all">{fileInfo}</p>
        )}

        {requestJson !== "" && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40">Requête envoyée</p>
            <pre className="whitespace-pre-wrap break-all rounded-xl bg-[#1e2a38] border border-[#e5ad46]/10 p-4 font-mono text-[11px] text-[#e5ad46]">
              {requestJson}
            </pre>
          </div>
        )}

        {responseJson !== "" && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40">Réponse reçue</p>
            <pre className="whitespace-pre-wrap break-all rounded-xl bg-[#1e2a38] border border-[#e5ad46]/10 p-4 font-mono text-[11px] text-[#eccc90]">
              {responseJson}
            </pre>
            <button
              type="button"
              onClick={handleCopy}
              className="w-full rounded-xl border border-[#e5ad46]/20 bg-[#1e2a38] px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-[#e5ad46] hover:bg-[#e5ad46]/10 transition-colors"
            >
              {copied ? "Copié ✓" : "Copier le rapport (fichier + requête + réponse)"}
            </button>
          </div>
        )}

        {imageUrl !== "" && (
          <div className="space-y-2">
            <img src={imageUrl} alt="image uploadée" className="w-full rounded-xl object-cover" />
            <p className="break-all font-mono text-[11px] text-[#e5ad46]">{imageUrl}</p>
          </div>
        )}
      </div>
    </div>
  );
}
