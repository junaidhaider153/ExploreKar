"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-glass transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
              t.type === "success"
                ? "bg-moss-light border-moss/30 text-moss"
                : t.type === "error"
                ? "bg-terracotta-light border-terracotta/30 text-terracotta"
                : "bg-paper-light border-line text-ink"
            }`}
          >
            {t.type === "success" && <CheckCircle2 className="h-5 w-5 shrink-0 text-moss mt-0.5" />}
            {t.type === "error" && <AlertCircle className="h-5 w-5 shrink-0 text-terracotta mt-0.5" />}
            {t.type === "info" && <Info className="h-5 w-5 shrink-0 text-brass mt-0.5" />}
            <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="text-ink-muted hover:text-ink transition-colors p-0.5"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
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
