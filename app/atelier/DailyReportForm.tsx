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
  Clock,
  Save
} from "lucide-react";
import { useAutoSave } from "@/app/hooks/useAutoSave";

interface Task {
  id: number;
  description: string;
  progress: number;
}

const mockSaveTasks = async (tasks: Task[]) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Tasks saved to server:', tasks);
};

export function DailyReportForm() {
  const { showToast } = useToast();
  const initialTasks: Task[] = [{ id: 1, description: "", progress: 0 }];
  
  const { 
    data: tasks, 
    updateData, 
    flush, 
    isSaving, 
    isDirty,
    lastSaved 
  } = useAutoSave({
    initialData: initialTasks,
    saveFn: mockSaveTasks,
    debounceTime: 3000, // Auto save every 3 seconds
    onSaveStart: () => console.log('Saving...'),
    onSaveSuccess: () => {
      showToast('Rapport auto-sauvegardé !', 'success');
    },
    onSaveError: (error) => {
      console.error('Auto-save error', error);
      showToast('Erreur lors de la sauvegarde', 'error');
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const addTask = () => {
    updateData([...tasks, { id: Date.now(), description: "", progress: 0 }]);
  };

  const removeTask = (id: number) => {
    if (tasks.length > 1) {
      updateData(tasks.filter(t => t.id !== id));
    }
  };

  const updateTask = (id: number, field: string, value: string | number) => {
    updateData(
      tasks.map(t => t.id === id ? { ...t, [field]: value } : t)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await flush(); // Flush any pending auto-saves
      await mockSaveTasks(tasks);
      showToast("Rapport de fin de journée envoyé !", "success");
      updateData([{ id: 1, description: "", progress: 0 }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#25303a] rounded-[2rem] shadow-sm border border-[#e5ad46]/5 overflow-hidden">
      <div className="p-8 border-b border-[#e5ad46]/10 flex justify-between items-center bg-[#1e2a38]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#e5ad46]/10 flex items-center justify-center">
            <FileText className="text-[#e5ad46] w-6 h-6" />
          </div>
          <div>
            <h2 className="font-headline text-2xl text-[#e5ad46]">Rapport de Production</h2>
            <p className="text-[10px] uppercase tracking-widest text-[#eccc90]/40 font-bold">Détails de fin de session</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isSaving ? (
              <div className="animate-pulse flex items-center gap-2 text-[#e5ad46]">
                <Save className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Sauvegarde...</span>
              </div>
            ) : isDirty ? (
              <div className="flex items-center gap-2 text-[#eccc90]/60">
                <Save className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Modifications non sauvegardées</span>
              </div>
            ) : lastSaved ? (
              <div className="flex items-center gap-2 text-[#e5ad46]">
                <CheckCircle2 className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Sauvegardé à {lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-full border border-orange-500/20">
            <Clock className="w-3 h-3 text-orange-400" />
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Fin de journée</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40">Détails des tâches</h3>
            <button 
              type="button" 
              onClick={addTask}
              className="flex items-center gap-2 text-[#e5ad46] hover:text-[#eccc90] text-[10px] font-bold uppercase tracking-widest transition-all"
            >
              <Plus className="w-3 h-3" /> Ajouter une tâche
            </button>
          </div>

          <div className="space-y-4">
            {tasks.map((task, index) => (
              <div key={task.id} className="flex gap-4 items-start animate-in fade-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex-1 space-y-4">
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#eccc90]/20" />
                    <input
                      type="text"
                      placeholder="Description de la tâche..."
                      value={task.description}
                      onChange={(e) => updateTask(task.id, "description", e.target.value)}
                      className="w-full p-4 pl-12 bg-[#1e2a38] border border-[#e5ad46]/10 rounded-2xl text-sm text-[#eccc90] focus:outline-none focus:ring-2 focus:ring-[#e5ad46]/20 placeholder:text-[#eccc90]/20"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={task.progress}
                      onChange={(e) => updateTask(task.id, "progress", parseInt(e.target.value))}
                      className="flex-1 accent-[#e5ad46]"
                    />
                    <span className="text-[10px] font-bold text-[#eccc90] w-12">{task.progress}%</span>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => removeTask(task.id)}
                  className="p-4 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-[#e5ad46]/10">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg ${
              isSubmitting 
                ? "bg-green-500 text-[#1e2a38] cursor-not-allowed" 
                : "bg-[#e5ad46] text-[#1e2a38] hover:bg-[#eccc90] active:scale-[0.98]"
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
