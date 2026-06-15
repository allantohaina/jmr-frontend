"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[10000] flex flex-col gap-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className="pointer-events-auto"
            >
              <div className={`flex items-center gap-4 p-5 rounded-[1.5rem] shadow-2xl border min-w-[320px] max-w-md bg-[#25303a] backdrop-blur-md ${
                toast.type === "success" ? "border-[#e5ad46]/30" :
                toast.type === "error" ? "border-red-500/30" :
                toast.type === "warning" ? "border-orange-500/30" : "border-[#e5ad46]/30"
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  toast.type === "success" ? "bg-[#e5ad46]/10 text-[#e5ad46]" :
                  toast.type === "error" ? "bg-red-500/10 text-red-400" :
                  toast.type === "warning" ? "bg-orange-500/10 text-orange-400" : "bg-[#e5ad46]/10 text-[#e5ad46]"
                }`}>
                  {toast.type === "success" && <CheckCircle2 className="w-5 h-5" />}
                  {toast.type === "error" && <AlertCircle className="w-5 h-5" />}
                  {toast.type === "warning" && <AlertCircle className="w-5 h-5" />}
                  {toast.type === "info" && <Info className="w-5 h-5" />}
                </div>
                
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#eccc90] leading-tight">{toast.message}</p>
                </div>

                <button 
                  onClick={() => removeToast(toast.id)}
                  className="p-2 hover:bg-[#e5ad46]/10 rounded-lg transition-colors text-[#eccc90]/20 hover:text-[#eccc90]/40"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
