"use client";

import React, { useState } from "react";
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
  id: number;
  name: string;
  status: string;
  order: string;
  progress: number;
  issues: string[];
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
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([
    { id: 1, name: "Ligne A - Polos", status: "en_cours", order: "#CMD-104", progress: 65, issues: [] },
    { id: 2, name: "Ligne B - Chemises", status: "probleme", order: "#CMD-105", progress: 30, issues: ["Machine #4 en panne"] },
    { id: 3, name: "Ligne C - Vestes", status: "termine", order: "#CMD-103", progress: 100, issues: [] },
  ]);

  const reportIssue = (lineId: number) => {
    const motive = prompt("Quelle est la cause du problème ? (Ex: Machine cassée, Manque de fil)");
    if (!motive) return;

    setProductionLines(lines => lines.map(line => 
      line.id === lineId ? { ...line, status: "probleme", issues: [...line.issues, motive] } : line
    ));
    showToast("L'admin a été notifié du problème : " + motive, "warning");
  };

  const markAsFinished = (lineId: number) => {
    setProductionLines(lines => lines.map(line => 
      line.id === lineId ? { ...line, status: "termine", progress: 100 } : line
    ));
    showToast("Notification envoyée à l'admin : Production terminée !", "success");
  };

  return (
    <div className="min-h-screen bg-[#1e2a38] font-body text-[#eccc90]">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar */}
        <aside className="w-full lg:w-80 bg-[#25303a] text-[#eccc90] p-8 flex flex-col border-r border-[#e5ad46]/10">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 bg-[#e5ad46] rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500"></div>
                <div className="absolute inset-0 bg-[#1e2a38] rounded-2xl flex items-center justify-center shadow-lg border-2 border-[#e5ad46]/20">
                  <div className="relative">
                    <Factory className="text-[#e5ad46] w-7 h-7" />
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#e5ad46] rounded-full border-2 border-[#1e2a38] animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div>
                <h1 className="font-headline text-2xl tracking-tight leading-none text-[#e5ad46]">JMR<br/><span className="text-[#eccc90]">Atelier</span></h1>
              </div>
            </div>
            <div className="h-[1px] w-full bg-gradient-to-r from-[#e5ad46]/40 to-transparent mb-4"></div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#eccc90]/40 font-bold">Excellence Textile</p>
          </div>

          <nav className="space-y-4 flex-1">
            <button 
              onClick={() => setCurrentView("dashboard")}
              className={`w-full flex items-center justify-between p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                currentView === "dashboard" ? "bg-[#e5ad46]/10 border-[#e5ad46]/10 text-[#e5ad46]" : "hover:bg-white/5 border-transparent"
              }`}
            >
              <span className="flex items-center gap-3"><TrendingUp className="w-4 h-4 text-[#e5ad46]" /> Dashboard</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentView("stock")}
              className={`w-full flex items-center justify-between p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                currentView === "stock" ? "bg-[#e5ad46]/10 border-[#e5ad46]/10 text-[#e5ad46]" : "hover:bg-white/5 border-transparent"
              }`}
            >
              <span className="flex items-center gap-3"><Package className="w-4 h-4 text-[#e5ad46]" /> Stocks</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentView("tech-sheets")}
              className={`w-full flex items-center justify-between p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                currentView === "tech-sheets" ? "bg-[#e5ad46]/10 border-[#e5ad46]/10 text-[#e5ad46]" : "hover:bg-white/5 border-transparent"
              }`}
            >
              <span className="flex items-center gap-3"><FileText className="w-4 h-4 text-[#e5ad46]" /> Fiches Techniques</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentView("qc")}
              className={`w-full flex items-center justify-between p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                currentView === "qc" ? "bg-[#e5ad46]/10 border-[#e5ad46]/10 text-[#e5ad46]" : "hover:bg-white/5 border-transparent"
              }`}
            >
              <span className="flex items-center gap-3"><ShieldCheck className="w-4 h-4 text-[#e5ad46]" /> Contrôle Qualité</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentView("history")}
              className={`w-full flex items-center justify-between p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                currentView === "history" ? "bg-[#e5ad46]/10 border-[#e5ad46]/10 text-[#e5ad46]" : "hover:bg-white/5 border-transparent"
              }`}
            >
              <span className="flex items-center gap-3"><History className="w-4 h-4 text-[#e5ad46]" /> Historique</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </nav>

          <div className="mt-auto pt-8 border-t border-[#e5ad46]/10 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-[#e5ad46]/5 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-[#e5ad46] flex items-center justify-center font-bold text-sm text-[#1e2a38]">
                OP
              </div>
              <div>
                <p className="text-xs font-bold text-[#eccc90]">Opérateur #12</p>
                <p className="text-[9px] uppercase tracking-widest text-[#eccc90]/40">Atelier Principal</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full flex items-center gap-3 p-4 hover:bg-red-500/10 hover:text-red-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-60"
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
                    <h2 className="font-headline text-3xl text-[#e5ad46]">Suivi des Lignes</h2>
                    <p className="text-[10px] uppercase tracking-widest text-[#eccc90]/40 font-bold mt-1">État des commandes en cours</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-full text-[10px] font-bold uppercase border border-green-500/20">
                      <CheckCircle className="w-3 h-3" /> 1 Terminé
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-full text-[10px] font-bold uppercase border border-red-500/20">
                      <AlertTriangle className="w-3 h-3" /> 1 Problème
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {productionLines.map(line => (
                    <div key={line.id} className="bg-[#25303a] p-8 rounded-[2rem] shadow-sm border border-[#e5ad46]/5 space-y-6 group hover:shadow-2xl transition-all duration-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#e5ad46] mb-1 block">{line.order}</span>
                          <h3 className="font-headline text-2xl text-[#eccc90]">{line.name}</h3>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          line.status === "en_cours" ? "bg-[#e5ad46] animate-pulse" : 
                          line.status === "probleme" ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]" : 
                          "bg-green-500"
                        }`} />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40">
                          <span>Progression de la ligne</span>
                          <span className="text-[#eccc90]">{line.progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-[#e5ad46]/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-700 ${line.status === "probleme" ? "bg-red-500" : "bg-[#e5ad46]"}`}
                            style={{ width: `${line.progress}%` }}
                          />
                        </div>
                      </div>

                      {line.issues.length > 0 && (
                        <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl space-y-2 animate-in fade-in slide-in-from-top-2">
                          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3" /> Incident Reporté
                          </p>
                          {line.issues.map((issue, i) => (
                            <p key={i} className="text-xs text-red-400/70 italic font-medium">- {issue}</p>
                          ))}
                        </div>
                      )}

                      <div className="pt-4 grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => reportIssue(line.id)}
                          className="py-4 bg-[#25303a] border border-red-500/20 text-red-400 text-[9px] font-bold uppercase tracking-widest rounded-2xl hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 group/btn"
                        >
                          Signaler Incident
                        </button>
                        <button 
                          onClick={() => markAsFinished(line.id)}
                          className="py-4 bg-[#e5ad46] text-[#1e2a38] text-[9px] font-bold uppercase tracking-widest rounded-2xl hover:bg-[#eccc90] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
                        >
                          Marquer Terminé
                        </button>
                      </div>
                    </div>
                  ))}
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
            <div className="flex flex-col items-center justify-center py-20 text-[#eccc90]/20">
              <History className="w-16 h-16 mb-4" />
              <p className="font-headline text-xl">L&apos;historique sera bientôt disponible</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
