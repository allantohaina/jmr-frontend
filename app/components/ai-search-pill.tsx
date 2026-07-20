"use client";

export function AiSearchPill() {
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 block md:hidden pointer-events-none">
      <button
        onClick={() => {}}
        className="ai-search-pill px-8 py-4 flex items-center gap-3 pointer-events-auto cursor-pointer bg-gradient-to-r from-primary/10 via-primary/25 to-primary/10 backdrop-blur-sm border border-primary/20 rounded-full animate-pulse"
        style={{ clipPath: "ellipse(60% 100% at 50% 100%)" }}
      >
        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
          smart_toy
        </span>
        <span className="font-label text-[11px] text-primary uppercase tracking-widest font-bold">
          Recherche par IA
        </span>
        <span className="bg-primary text-surface text-[8px] font-bold px-2 py-0.5 rounded-full -mt-4 -mr-4">
          NOUVEAU
        </span>
      </button>
    </div>
  );
}
