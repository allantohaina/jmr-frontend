"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useToast } from "@/app/components";
import { 
  ClipboardCheck, 
  Calendar as CalendarIcon, 
  Clock, 
  MessageSquare, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export function AtelierCheckIn() {
  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [checkInData, setCheckInData] = useState({
    time: format(new Date(), "HH:mm"),
    status: "disponible",
    notes: "",
    completedTasks: "",
    plannedTasks: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Simulation d'envoi à l'API
    setTimeout(() => {
      setIsSubmitted(false);
      showToast("Rapport de check-in envoyé avec succès !", "success");
    }, 1500);
  };

  return (
    <div className="bg-[#25303a] rounded-[2rem] shadow-xl border border-[#F5A623]/5 overflow-hidden">
      <div className="p-8 bg-[#1e2a38] text-[#F5A623] border-b border-[#F5A623]/10">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-[#F5A623]/10 flex items-center justify-center">
            <ClipboardCheck className="text-[#F5A623] w-6 h-6" />
          </div>
          <div>
            <h2 className="font-headline text-2xl text-[#F5A623]">Check-in Quotidien</h2>
            <p className="text-[10px] uppercase tracking-widest text-[#F5A623]/40 font-bold">Rapport d&apos;activité & Présence</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Date & Time Section */}
          <div className="space-y-6">
            <div className="relative">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#F5A623]/40 mb-2 block">Date de l&apos;activité</label>
              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full flex items-center justify-between p-4 bg-[#1e2a38] border border-[#F5A623]/10 rounded-2xl hover:bg-[#1e2a38]/80 transition-colors text-[#F5A623]"
              >
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-4 h-4 text-[#F5A623]" />
                  <span className="text-sm font-semibold">{format(selectedDate, "PPP", { locale: fr })}</span>
                </div>
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>
              
              {showCalendar && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-[#25303a] shadow-2xl rounded-2xl border border-[#F5A623]/10 p-4 animate-in fade-in slide-in-from-top-2">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) setSelectedDate(date);
                      setShowCalendar(false);
                    }}
                    locale={fr}
                    className="border-0"
                    styles={{
                      caption: { color: "#F5A623" },
                      head_cell: { color: "#F5A623", fontSize: "0.75rem" },
                      day_selected: { backgroundColor: "#F5A623", color: "#1e2a38" },
                      day_today: { color: "#F5A623", fontWeight: "bold", border: "1px solid #F5A623" }
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#F5A623]/40 mb-2 block">Heure d&apos;arrivée</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F5A623]/40" />
                <input
                  type="time"
                  value={checkInData.time}
                  onChange={(e) => setCheckInData({ ...checkInData, time: e.target.value })}
                  className="w-full p-4 pl-12 bg-[#1e2a38] border border-[#F5A623]/10 rounded-2xl text-sm font-semibold text-[#F5A623] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 appearance-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#F5A623]/40 mb-2 block">Statut de Disponibilité</label>
              <div className="grid grid-cols-2 gap-3">
                {["disponible", "occupe"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setCheckInData({ ...checkInData, status })}
                    className={`p-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
                      checkInData.status === status
                        ? "bg-[#F5A623] text-[#1e2a38] border-[#F5A623]"
                        : "bg-[#1e2a38] text-[#F5A623]/40 border-[#F5A623]/10 hover:bg-white/5"
                    }`}
                  >
                    {status === "disponible" ? (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle2 className={`w-3 h-3 ${checkInData.status === status ? "text-[#1e2a38]" : "text-green-400"}`} /> Disponible
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <AlertCircle className={`w-3 h-3 ${checkInData.status === status ? "text-[#1e2a38]" : "text-orange-400"}`} /> Occupé
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#F5A623]/40 mb-2 block">Tâches Accomplies (Hier)</label>
              <textarea
                value={checkInData.completedTasks}
                onChange={(e) => setCheckInData({ ...checkInData, completedTasks: e.target.value })}
                placeholder="Ex: Finition des 50 polos #CMD-104..."
                className="w-full p-4 bg-[#1e2a38] border border-[#F5A623]/10 rounded-2xl text-sm text-[#F5A623] min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 resize-none placeholder:text-[#F5A623]/20"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#F5A623]/40 mb-2 block">Tâches Prévues (Aujourd&apos;hui)</label>
              <textarea
                value={checkInData.plannedTasks}
                onChange={(e) => setCheckInData({ ...checkInData, plannedTasks: e.target.value })}
                placeholder="Ex: Début de la coupe des chemises #CMD-105..."
                className="w-full p-4 bg-[#1e2a38] border border-[#F5A623]/10 rounded-2xl text-sm text-[#F5A623] min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 resize-none placeholder:text-[#F5A623]/20"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#F5A623]/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-[#F5A623]/40">
            <MessageSquare className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Une notification sera envoyée à l&apos;admin</span>
          </div>
          <button
            type="submit"
            disabled={isSubmitted}
            className={`w-full md:w-auto px-10 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg ${
              isSubmitted 
                ? "bg-green-500 text-[#1e2a38] cursor-not-allowed" 
                : "bg-[#F5A623] text-[#1e2a38] hover:bg-[#F5A623] active:scale-95"
            }`}
          >
            {isSubmitted ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Rapport Envoyé
              </span>
            ) : "Envoyer le Rapport"}
          </button>
        </div>
      </form>
    </div>
  );
}
