"use client";

import React, { useState } from "react";
import { CheckSquare, Square, ShieldCheck, Camera, Send, AlertCircle } from "lucide-react";
import { useToast } from "@/app/components/toast-provider";

interface QCStep {
  id: number;
  label: string;
  checked: boolean;
}

export function AtelierQC() {
  const { showToast } = useToast();
  const [orderId, setOrderId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [steps, setSteps] = useState<QCStep[]>([
    { id: 1, label: "Conformité des mesures (± 1cm)", checked: false },
    { id: 2, label: "Qualité des coutures et surpiqûres", checked: false },
    { id: 3, label: "Absence de fils pendants", checked: false },
    { id: 4, label: "Solidité des boutons/fermetures", checked: false },
    { id: 5, label: "Propreté et absence de taches", checked: false },
    { id: 6, label: "Étiquetage correct (Taille/Lavage)", checked: false },
  ]);

  const toggleStep = (id: number) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, checked: !step.checked } : step
    ));
  };

  const progress = (steps.filter(s => s.checked).length / steps.length) * 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) {
      showToast("Veuillez entrer un numéro de commande", "error");
      return;
    }
    if (progress < 100) {
      showToast("Toutes les étapes de contrôle doivent être validées", "warning");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      showToast(`Contrôle Qualité validé pour ${orderId}`, "success");
      setOrderId("");
      setSteps(prev => prev.map(s => ({ ...s, checked: false })));
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-[#163526]/5 overflow-hidden">
        <div className="p-10 bg-orange-500 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-headline text-3xl">Contrôle Qualité</h2>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-80">Validation finale avant expédition</p>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">Progression</p>
            <p className="text-3xl font-headline font-bold">{Math.round(progress)}%</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-10">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#163526]/40 mb-3 block">Numéro de Commande / Lot</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Ex: #CMD-104-LOT2"
                className="w-full p-5 bg-[#faf9f4] border border-[#163526]/5 rounded-2xl text-lg font-bold text-[#163526] focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#163526]/40 mb-3 block">Checklist de Vérification</label>
              <div className="grid md:grid-cols-2 gap-4">
                {steps.map(step => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => toggleStep(step.id)}
                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${
                      step.checked 
                        ? "bg-green-50 border-green-200 text-green-800 shadow-sm" 
                        : "bg-white border-[#163526]/5 text-[#163526]/60 hover:border-[#163526]/20"
                    }`}
                  >
                    {step.checked ? (
                      <CheckSquare className="w-6 h-6 text-green-600 flex-shrink-0" />
                    ) : (
                      <Square className="w-6 h-6 opacity-20 flex-shrink-0" />
                    )}
                    <span className="text-sm font-bold">{step.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex gap-4">
              <Camera className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-blue-900 mb-1">Preuve visuelle requise</p>
                <p className="text-xs text-blue-700">Prenez une photo du produit fini avec son étiquette pour les archives de l'atelier.</p>
                <button type="button" className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors">
                  Téléverser Photo
                </button>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-[#163526]/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-[#163526]/40">
              <AlertCircle className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Le rapport sera archivé et visible par l'admin</span>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || progress < 100}
              className={`w-full md:w-auto px-12 py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg ${
                progress === 100 
                  ? "bg-green-600 text-white hover:bg-green-700 active:scale-[0.98]" 
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Envoi du rapport..." : (
                <>
                  <Send className="w-4 h-4" /> Valider le Contrôle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
