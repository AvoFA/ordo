"use client";

import { useEffect } from "react";
import { useUiStore, type Toast } from "@/shared/model/ui-store";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

export function ToastContainer() {
  const toasts = useUiStore((state) => state.toasts);
  const removeToast = useUiStore((state) => state.removeToast);

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-destructive shrink-0" />,
    info: <Info className="h-5 w-5 text-primary shrink-0" />,
  };

  const currentIcon = toast.type ? icons[toast.type] : icons.info;

  return (
    <div className="pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-border/60 bg-card/90 backdrop-blur-md p-4 shadow-lg animate-in slide-in-from-right-5 fade-in duration-300">
      {currentIcon}
      <div className="flex-1 space-y-1">
        <h4 className="text-xs font-bold text-foreground leading-none">{toast.message}</h4>
        {toast.description && (
          <p className="text-[11px] font-medium leading-relaxed text-muted-foreground">
            {toast.description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        className="text-muted-foreground/60 hover:text-foreground hover:bg-secondary/40 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
