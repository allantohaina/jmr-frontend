"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Document, Page, pdfjs } from "react-pdf";
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

type FileAttachment = { name: string; url: string; type: string };

export function DocumentPreview({ file }: { file: FileAttachment }) {
  const [pages, setPages] = useState<number>();
  const [error, setError] = useState(false);
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-[#163526]/10 bg-[#faf9f4] p-2">
      {error ? (
        <a className="flex items-center gap-2 p-3 text-xs font-semibold text-[#163526] underline" href={file.url} target="_blank" rel="noopener noreferrer">
          <FileText className="h-4 w-4" /> Ouvrir le PDF
        </a>
      ) : (
        <Document file={file.url} loading={<Loader2 className="m-5 h-5 w-5 animate-spin text-[#e5ad46]" />} onLoadSuccess={({ numPages }) => setPages(numPages)} onLoadError={() => setError(true)}>
          <Page pageNumber={1} width={220} renderTextLayer={false} renderAnnotationLayer={false} />
        </Document>
      )}
      {pages ? <p className="px-2 pt-2 text-[10px] font-bold uppercase tracking-widest text-[#163526]/45">PDF · {pages} page{pages > 1 ? "s" : ""}</p> : null}
    </div>
  );
}

export function CsvPreview({ file }: { file: File }) {
  const [rows, setRows] = useState<string[][]>([]);
  const [error, setError] = useState("");

  function readCsv() {
    setError("");
    Papa.parse<string[]>(file, {
      skipEmptyLines: true,
      complete: ({ data }) => setRows(data.slice(0, 6)),
      error: (parseError) => setError(parseError.message),
    });
  }

  return (
    <div className="rounded-xl border border-[#163526]/10 bg-[#faf9f4] p-3">
      <button type="button" onClick={readCsv} className="inline-flex items-center gap-2 text-xs font-bold text-[#163526] underline">
        <FileSpreadsheet className="h-4 w-4 text-[#e5ad46]" /> Prévisualiser le CSV
      </button>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
      {rows.length > 0 ? (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-[11px] text-[#163526]/70">
            <tbody>{rows.map((row, index) => <tr key={index} className="border-t border-[#163526]/10">{row.map((cell, cellIndex) => <td key={cellIndex} className="px-2 py-1.5">{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
