"use client";

import React, { useState, useEffect, useCallback } from "react";
import { workflowsAPI, type KanbanCard } from "@/app/lib/api";
import { Loader } from "lucide-react";

const COLUMN_ORDER = ["draft", "active", "needs_correction", "completed"];
const COLUMN_COLORS: Record<string, string> = {
  draft: "border-[#1b1c19]/20",
  active: "border-[#e5ad46]/40",
  needs_correction: "border-red-200",
  completed: "border-green-200",
};

export default function KanbanPage() {
  const [board, setBoard] = useState<Record<string, KanbanCard[]>>({});
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await workflowsAPI.board();
      setBoard(res.data?.data ?? {});
      setLabels(res.data?.status_labels ?? {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  const labelFor = (key: string) => labels[key] ?? key;
  const totalCards = COLUMN_ORDER.reduce((s, k) => s + (board[k]?.length ?? 0), 0);

  return (
    <div className="px-6 md:px-12 py-10 space-y-8">
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="font-headline text-3xl text-[#163526]">Suivi Production</h2>
          <p className="text-[#1b1c19]/40 text-xs font-bold uppercase tracking-widest mt-1">Tableau de bord des workflows · Atelier JMR</p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#163526]/40">{totalCards} workflows</span>
      </div>

      {error && <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-xs text-red-700 font-medium">{error}</div>}

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader className="h-6 w-6 animate-spin text-[#e5ad46]" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMN_ORDER.map((key) => {
            const cards = board[key] ?? [];
            return (
              <div key={key} className={`rounded-2xl border-2 ${COLUMN_COLORS[key] ?? "border-[#163526]/10"} bg-white/60 p-3 min-h-[200px]`}>
                <div className="flex items-center justify-between px-2 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#163526]">{labelFor(key)}</p>
                  <span className="rounded-full bg-[#163526]/5 px-2 py-0.5 text-[10px] font-bold text-[#163526]/60">{cards.length}</span>
                </div>
                <div className="space-y-2 mt-2">
                  {cards.length === 0 && (
                    <div className="rounded-xl border border-dashed border-[#163526]/15 p-6 text-center text-xs text-[#163526]/30 italic">Aucune carte</div>
                  )}
                  {cards.map((card) => (
                    <div key={card.id} className="rounded-xl bg-white border border-[#163526]/10 p-3 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-sm font-bold text-[#163526]">{card.name || "Sans titre"}</p>
                      {card.client_name && <p className="text-[10px] text-[#163526]/50 mt-0.5">{card.client_name}</p>}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#163526]/5">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#e5ad46]/80">{card.workflow_type}</span>
                        {card.current_step && <span className="text-[9px] font-bold text-[#163526]/60">{card.current_step}</span>}
                      </div>
                      {card.delivery_date && (
                        <p className="text-[9px] text-[#163526]/40 mt-1">Livraison : {card.delivery_date}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}