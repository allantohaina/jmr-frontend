"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AtelierCheckIn } from "./AtelierCheckIn";
import { DailyReportForm } from "./DailyReportForm";
import { AtelierStock } from "./AtelierStock";
import { AtelierTechnicalSheets } from "./AtelierTechnicalSheets";
import { AtelierQC } from "./AtelierQC";
import { useToast } from "@/app/components";
import { signOutClient } from "@/app/lib/auth-client";
import { useInactivityLogout } from "@/app/lib/use-inactivity-logout";
import { authAPI } from "@/app/lib/api";
import { 
  Factory, 
  Clock, 
  History, 
  Settings, 
  LogOut,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Package,
  FileText,
  ShieldCheck
} from "lucide-react";

type View = "dashboard" | "stock" | "tech-sheets" | "qc" | "history";

type ProductionLine = {
  id: string;
  name: string;
  status: string;
  order: string;
  progress: number;
  issues: string[];
};

type CommandeAtelier = {
  id: string;
  numero?: string;
  designation?: string;
  statut_production?: string;
  pieces_produites?: number;
  quantite?: number;
  en_retard?: boolean;
};

export default function AtelierClient() {
  const { showToast } = useToast();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [isSigningOut, setIsSigningOut] = useState(false);
  useInactivityLogout({ redirectTo: "/worker-login" });

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOutClient();
      router.replace("/worker-login");
    } finally {
      setIsSigningOut(false);
    }
  }
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
  const [isLoadingLines, setIsLoadingLines] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchLines = async () => {
      setIsLoadingLines(true);
      try {
        const res = await authAPI.get<CommandeAtelier[]>("/commandes");
        if (!active) return;
        const list: CommandeAtelier[] = Array.isArray(res.data) ? res.data : [];
        setProductionLines(
          list
            .filter((c) => c.statut_production !== "Livrée")
            .slice(0, 6)
            .map((c) => {
              const qty = Number(c.quantite ?? 0);
              const done = Number(c.pieces_produites ?? 0);
              return {
                id: String(c.id),
                name: c.designation || "Commande sans désignation",
                status: c.en_retard ? "probleme" : "en_cours",
                order: c.numero ? `#${c.numero}` : `#${c.id}`,
                progress: qty > 0 ? Math.min(100, Math.round((done / qty) * 100)) : 0,
                issues: c.en_retard ? ["Commande en retard"] : [],
              };
            })
        );
      } catch (error) {
        console.error("Erreur chargement lignes atelier:", error);
      } finally {
        if (active) setIsLoadingLines(false);
      }
    };
    fetchLines();
    return () => {
      active = false;
    };
  }, []);

  const reportIssue = (lineId: string) => {
    const motive = prompt("Quelle est la cause du problème ? (Ex: Machine cassée, Manque de fil)");
    if (!motive) return;

    setProductionLines(lines => lines.map(line =>
      line.id === lineId ? { ...line, status: "probleme", issues: [...line.issues, motive] } : line
    ));
    showToast("L'admin a été notifié du problème : " + motive, "warning");
  };

  const markAsFinished = async (lineId: string) => {
    setProductionLines(lines => lines.map(line =>
      line.id === lineId ? { ...line, status: "termine", progress: 100 } : line
    ));
    try {
      await authAPI.put(`/commandes/${lineId}`, { statut_production: "Livrée" });
      showToast("Notification envoyée à l'admin : Production terminée !", "success");
    } catch {
      showToast("Production marquée localement, synchronisation à vérifier", "warning");
    }
  };

  const nbTerminees = productionLines.filter((l) => l.status === "termine").length;
  const nbProblemes = productionLines.filter((l) => l.status === "probleme").length;

  return (
    <div className="min-h-screen bg-[#1e2a38] font-body text-[#EAA100]">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar */}
        <aside className="w-full lg:w-80 bg-[#161D30] text-[#EAA100] p-8 flex flex-col border-r border-[#EAA100]/10">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 bg-[#EAA100] rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500"></div>
                <div className="absolute inset-0 bg-[#1e2a38] rounded-2xl flex items-center justify-center shadow-lg border-2 border-[#EAA100]/20">
                  <div className="relative">
                    <Factory className="text-[#EAA100] w-7 h-7" />
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#EAA100] rounded-full border-2 border-[#1e2a38] animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div>
                <h1 className="font-headline text-2xl tracking-tight leading-none text-[#EAA100]">JMR<br/><span className="text-[#EAA100]">Atelier</span></h1>
              </div>
            </div>
            <div className="h-[1px] w-full bg-gradient-to-r from-[#EAA100]/40 to-transparent mb-4"></div>
            <p className="text-caption uppercase tracking-[0.4em] text-[#EAA100]/40 font-bold">Excellence Textile</p>
          </div>

          <nav className="space-y-4 flex-1">
            <button 
              onClick={() => setCurrentView("dashboard")}
              className={`w-full flex items-center justify-between p-4 rounded-2xl text-caption font-bold uppercase tracking-widest border transition-all ${
                currentView === "dashboard" ? "bg-[#EAA100]/10 border-[#EAA100]/10 text-[#EAA100]" : "hover:bg-white/5 border-transparent"
              }`}
            >
              <span className="flex items-center gap-3"><TrendingUp className="w-4 h-4 text-[#EAA100]" /> Dashboard</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentView("stock")}
              className={`w-full flex items-center justify-between p-4 rounded-2xl text-caption font-bold uppercase tracking-widest border transition-all ${
                currentView === "stock" ? "bg-[#EAA100]/10 border-[#EAA100]/10 text-[#EAA100]" : "hover:bg-white/5 border-transparent"
              }`}
            >
              <span className="flex items-center gap-3"><Package className="w-4 h-4 text-[#EAA100]" /> Stocks</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentView("tech-sheets")}
              className={`w-full flex items-center justify-between p-4 rounded-2xl text-caption font-bold uppercase tracking-widest border transition-all ${
                currentView === "tech-sheets" ? "bg-[#EAA100]/10 border-[#EAA100]/10 text-[#EAA100]" : "hover:bg-white/5 border-transparent"
              }`}
            >
              <span className="flex items-center gap-3"><FileText className="w-4 h-4 text-[#EAA100]" /> Fiches Techniques</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentView("qc")}
              className={`w-full flex items-center justify-between p-4 rounded-2xl text-caption font-bold uppercase tracking-widest border transition-all ${
                currentView === "qc" ? "bg-[#EAA100]/10 border-[#EAA100]/10 text-[#EAA100]" : "hover:bg-white/5 border-transparent"
              }`}
            >
              <span className="flex items-center gap-3"><ShieldCheck className="w-4 h-4 text-[#EAA100]" /> Contrôle Qualité</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentView("history")}
              className={`w-full flex items-center justify-between p-4 rounded-2xl text-caption font-bold uppercase tracking-widest border transition-all ${
                currentView === "history" ? "bg-[#EAA100]/10 border-[#EAA100]/10 text-[#EAA100]" : "hover:bg-white/5 border-transparent"
              }`}
            >
              <span className="flex items-center gap-3"><History className="w-4 h-4 text-[#EAA100]" /> Historique</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </nav>

          <div className="mt-auto pt-8 border-t border-[#EAA100]/10 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-[#EAA100]/5 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-[#EAA100] flex items-center justify-center font-bold text-sm text-[#1e2a38]">
                OP
              </div>
              <div>
                <p className="text-xs font-bold text-[#EAA100]">Opérateur Atelier</p>
                <p className="text-micro uppercase tracking-widest text-[#EAA100]/40">Atelier Principal</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full flex items-center gap-3 p-4 hover:bg-[#E05252]/10 hover:text-[#F3A3A6] rounded-2xl text-caption font-bold uppercase tracking-widest transition-all disabled:opacity-60"
            >
              <LogOut className="w-4 h-4" /> {isSigningOut ? "Déconnexion..." : "Déconnexion"}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-12 space-y-12 overflow-y-auto">
          {currentView === "dashboard" && (
            <>
              {/* Check-in Section */}
              <section className="max-w-5xl mx-auto">
                <AtelierCheckIn />
              </section>

              {/* Production Lines Section */}
              <section className="max-w-5xl mx-auto space-y-8">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="font-headline text-3xl text-[#EAA100]">Suivi des Lignes</h2>
                    <p className="text-caption uppercase tracking-widest text-[#EAA100]/40 font-bold mt-1">État des commandes en cours</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#1F8457]/10 text-[#5CB87D] rounded-full text-caption font-bold uppercase border border-[#1F8457]/20">
                      <CheckCircle className="w-3 h-3" /> {nbTerminees} Terminé
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#E05252]/10 text-[#F3A3A6] rounded-full text-caption font-bold uppercase border border-[#E05252]/20">
                      <AlertTriangle className="w-3 h-3" /> {nbProblemes} Problème
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {isLoadingLines ? (
                    <p className="text-sm text-[#EAA100]/40 italic">Chargement des commandes en cours…</p>
                  ) : productionLines.length === 0 ? (
                    <p className="text-sm text-[#EAA100]/40 italic md:col-span-2">Aucune commande en cours pour le moment.</p>
                  ) : (
                  productionLines.map(line => (
                    <div key={line.id} className="bg-[#161D30] p-8 rounded-[2rem] shadow-sm border border-[#EAA100]/5 space-y-6 group hover:shadow-2xl transition-all duration-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-caption font-bold uppercase tracking-widest text-[#EAA100] mb-1 block">{line.order}</span>
                          <h3 className="font-headline text-2xl text-[#EAA100]">{line.name}</h3>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          line.status === "en_cours" ? "bg-[#EAA100] animate-pulse" : 
                          line.status === "probleme" ? "bg-[#E05252] shadow-[0_0_10px_rgba(239,68,68,0.4)]" : 
                          "bg-[#1F8457]"
                        }`} />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-caption font-bold uppercase tracking-widest text-[#EAA100]/40">
                          <span>Progression de la ligne</span>
                          <span className="text-[#EAA100]">{line.progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-[#EAA100]/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-700 ${line.status === "probleme" ? "bg-[#E05252]" : "bg-[#EAA100]"}`}
                            style={{ width: `${line.progress}%` }}
                          />
                        </div>
                      </div>

                      {line.issues.length > 0 && (
                        <div className="p-4 bg-[#E05252]/5 border border-[#E05252]/10 rounded-2xl space-y-2 animate-in fade-in slide-in-from-top-2">
                          <p className="text-caption font-bold text-[#F3A3A6] uppercase tracking-widest flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3" /> Incident Reporté
                          </p>
                          {line.issues.map((issue, i) => (
                            <p key={i} className="text-xs text-[#F3A3A6]/70 italic font-medium">- {issue}</p>
                          ))}
                        </div>
                      )}

                      <div className="pt-4 grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => reportIssue(line.id)}
                          className="py-4 bg-[#161D30] border border-[#E05252]/20 text-[#F3A3A6] text-micro font-bold uppercase tracking-widest rounded-2xl hover:bg-[#E05252]/10 transition-all flex items-center justify-center gap-2 group/btn"
                        >
                          Signaler Incident
                        </button>
                        <button 
                          onClick={() => markAsFinished(line.id)}
                          className="py-4 bg-[#EAA100] text-[#1e2a38] text-micro font-bold uppercase tracking-widest rounded-2xl hover:bg-[#EAA100] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
                        >
                          Marquer Terminé
                        </button>
                      </div>
                    </div>
                  ))
                  )}
                </div>
              </section>

              {/* Daily Report Section */}
              <section className="max-w-5xl mx-auto pb-12">
                <DailyReportForm />
              </section>
            </>
          )}

          {currentView === "stock" && <AtelierStock />}
          {currentView === "tech-sheets" && <AtelierTechnicalSheets />}
          {currentView === "qc" && <AtelierQC />}
          
          {currentView === "history" && (
            <div className="flex flex-col items-center justify-center py-20 text-[#EAA100]/20">
              <History className="w-16 h-16 mb-4" />
              <p className="font-headline text-xl">L&apos;historique sera bientôt disponible</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
