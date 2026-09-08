"use client";

import { useState } from "react";
import { EditableImage } from "@/app/components/editable-image";

export default function TempAdminPage() {
  const [url, setUrl] = useState("");

  return (
    <div className="min-h-screen bg-[#1e2a38] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl bg-[#25303a] border border-[#e5ad46]/10 p-4">
        <EditableImage
          src={url}
          alt="image du site"
          onUploaded={setUrl}
          className="flex h-48 items-center justify-center rounded-lg bg-[#1e2a38]"
          imgClassName="h-full w-full rounded-lg object-cover"
          placeholder={<span className="text-sm text-[#eccc90]/50">image du site</span>}
        />
        {url !== "" && (
          <p className="mt-3 break-all font-mono text-[11px] text-[#e5ad46]">{url}</p>
        )}
      </div>
    </div>
  );
}
