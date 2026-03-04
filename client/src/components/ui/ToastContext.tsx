// client/src/components/ui/ToastContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { XCircle, CheckCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container - Fixed Top Right */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded shadow-lg text-white animate-fade-in-down min-w-75 ${
              toast.type === "success" ? "bg-brand-success" :
              toast.type === "error" ? "bg-brand-error" : "bg-brand-blue"
            }`}
          >
            {toast.type === "success" && <CheckCircle size={20} />}
            {toast.type === "error" && <XCircle size={20} />}
            {toast.type === "info" && <Info size={20} />}
            
            <span className="font-medium text-sm flex-1">{toast.message}</span>
            
            <button onClick={() => removeToast(toast.id)} className="hover:opacity-75">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};