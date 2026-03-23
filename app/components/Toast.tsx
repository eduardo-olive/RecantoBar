"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  exiting?: boolean;
}

interface ToastContextType {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | null>(null);

let idCounter = 0;

const config: Record<ToastType, { icon: typeof CheckCircle2; bg: string; border: string; text: string; bar: string }> = {
  success: {
    icon: CheckCircle2,
    bg: "bg-emerald-950/90",
    border: "border-emerald-500/30",
    text: "text-emerald-300",
    bar: "bg-emerald-500",
  },
  error: {
    icon: AlertCircle,
    bg: "bg-rose-950/90",
    border: "border-rose-500/30",
    text: "text-rose-300",
    bar: "bg-rose-500",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-950/90",
    border: "border-amber-500/30",
    text: "text-amber-300",
    bar: "bg-amber-500",
  },
  info: {
    icon: Info,
    bg: "bg-blue-950/90",
    border: "border-blue-500/30",
    text: "text-blue-300",
    bar: "bg-blue-500",
  },
};

function ToastItem({ toast: t, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  const c = config[t.type];
  const Icon = c.icon;

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl
        ${c.bg} ${c.border}
        ${t.exiting ? "animate-toast-out" : "animate-toast-in"}
        min-w-[320px] max-w-[460px] relative overflow-hidden
      `}
    >
      {/* Barra de progresso */}
      <div className={`absolute bottom-0 left-0 h-[2px] ${c.bar} animate-toast-progress`} />

      <Icon size={18} className={`${c.text} flex-shrink-0 mt-0.5`} />
      <p className={`text-sm font-semibold ${c.text} flex-1 leading-snug`}>{t.message}</p>
      <button
        onClick={() => onRemove(t.id)}
        className={`${c.text} opacity-40 hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5`}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3500);
  }, [removeToast]);

  const toast = {
    success: (msg: string) => addToast(msg, "success"),
    error: (msg: string) => addToast(msg, "error"),
    warning: (msg: string) => addToast(msg, "warning"),
    info: (msg: string) => addToast(msg, "info"),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Container dos toasts */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de <ToastProvider>");
  return ctx.toast;
}
