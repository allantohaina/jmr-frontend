"use client";

import { useState } from "react";
import { uploadImage } from "@/app/lib/api";

export default function TestUploadPage() {
  const [fileInfo, setFileInfo] = useState("");
  const [responseJson, setResponseJson] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileInfo(`nom: ${file.name} | taille: ${file.size} octets | type: ${file.type || "(vide)"}`);
    setResponseJson("envoi en cours…");
    setImageUrl("");
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

  return (
    <div className="min-h-screen bg-[#1e2a38] flex items-center justify-center p-6 font-body">
      <div className="w-full max-w-lg rounded-2xl bg-[#25303a] border border-[#e5ad46]/10 p-8 space-y-6">
        <div>
          <h1 className="font-headline text-2xl text-[#e5ad46]">Test upload image</h1>
          <p className="text-xs text-[#eccc90]/50 mt-1">POST corps brut vers /admin/media/upload</p>
        </div>

        <label className="block cursor-pointer rounded-xl border border-[#e5ad46]/20 bg-[#1e2a38] px-4 py-3 text-sm font-bold text-[#e5ad46] hover:bg-[#e5ad46]/10 transition-colors text-center">
          Choisir une image…
          <input type="file" accept="image/*" className="hidden" onChange={handleChange} />
        </label>

        {fileInfo !== "" && (
          <p className="text-xs text-[#eccc90] break-all">{fileInfo}</p>
        )}

        {responseJson !== "" && (
          <pre className="whitespace-pre-wrap break-all rounded-xl bg-[#1e2a38] border border-[#e5ad46]/10 p-4 font-mono text-[11px] text-[#eccc90]">
            {responseJson}
          </pre>
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
