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
              <div className={`flex items-center gap-4 p-4 rounded-2xl shadow-2xl border min-w-[300px] max-w-md bg-white ${
                toast.type === "success" ? "border-green-100" :
                toast.type === "error" ? "border-red-100" :
                toast.type === "warning" ? "border-orange-100" : "border-blue-100"
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  toast.type === "success" ? "bg-green-50 text-green-600" :
                  toast.type === "error" ? "bg-red-50 text-red-600" :
                  toast.type === "warning" ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                }`}>
                  {toast.type === "success" && <CheckCircle2 className="w-5 h-5" />}
                  {toast.type === "error" && <AlertCircle className="w-5 h-5" />}
                  {toast.type === "warning" && <AlertCircle className="w-5 h-5" />}
                  {toast.type === "info" && <Info className="w-5 h-5" />}
                </div>
                
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#163526]">{toast.message}</p>
                </div>

                <button 
                  onClick={() => removeToast(toast.id)}
                  className="p-2 hover:bg-[#163526]/5 rounded-lg transition-colors text-[#163526]/20 hover:text-[#163526]/40"
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
