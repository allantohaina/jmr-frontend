"use client";

import React, { useState } from "react";
import { useToast } from "@/app/components";
import { 
  FileText, 
  Send, 
  CheckCircle2, 
  Plus, 
  Trash2,
  Package,
  Clock
} from "lucide-react";

export function DailyReportForm() {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState([{ id: 1, description: "", progress: 0 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addTask = () => {
    setTasks([...tasks, { id: Date.now(), description: "", progress: 0 }]);
  };

  const removeTask = (id: number) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const updateTask = (id: number, field: string, value: string | number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      showToast("Rapport de fin de journée envoyé !", "success");
      setTasks([{ id: 1, description: "", progress: 0 }]);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-[#163526]/5 overflow-hidden">
      <div className="p-8 border-b border-[#163526]/5 flex justify-between items-center bg-[#faf9f4]/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#163526]/5 flex items-center justify-center">
            <FileText className="text-[#163526] w-6 h-6" />
          </div>
          <div>
            <h2 className="font-headline text-2xl text-[#163526]">Rapport de Production</h2>
            <p className="text-[10px] uppercase tracking-widest text-[#163526]/40 font-bold">Détails de fin de session</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-full">
          <Clock className="w-3 h-3 text-orange-500" />
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Fin de journée</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#163526]/40">Détails des tâches</h3>
            <button 
              type="button" 
              onClick={addTask}
              className="flex items-center gap-2 text-orange-500 hover:text-orange-600 text-[10px] font-bold uppercase tracking-widest transition-all"
            >
              <Plus className="w-3 h-3" /> Ajouter une tâche
            </button>
          </div>

          <div className="space-y-4">
            {tasks.map((task, index) => (
              <div key={task.id} className="flex gap-4 items-start animate-in fade-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex-1 space-y-4">
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#163526]/20" />
                    <input
                      type="text"
                      placeholder="Description de la tâche..."
                      value={task.description}
                      onChange={(e) => updateTask(task.id, "description", e.target.value)}
                      className="w-full p-4 pl-12 bg-[#faf9f4] border border-[#163526]/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={task.progress}
                      onChange={(e) => updateTask(task.id, "progress", parseInt(e.target.value))}
                      className="flex-1 accent-[#163526]"
                    />
                    <span className="text-[10px] font-bold text-[#163526] w-12">{task.progress}%</span>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => removeTask(task.id)}
                  className="p-4 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-[#163526]/5">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg ${
              isSubmitting 
                ? "bg-green-500 text-white cursor-not-allowed" 
                : "bg-[#163526] text-white hover:bg-[#163526]/90 active:scale-[0.98]"
            }`}
          >
            {isSubmitting ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Envoi en cours...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Soumettre le Rapport de Production
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
