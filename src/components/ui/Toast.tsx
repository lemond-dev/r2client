import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";
import { useToast, type ToastData } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastItemProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
    error: "bg-red-500/10 border-red-500/20 text-red-500",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-500",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-500",
  };

  const Icon = icons[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      className={cn(
        "flex items-center gap-3 rounded-lg border px-4 py-3",
        "bg-card shadow-lg backdrop-blur-sm",
        "min-w-[300px] max-w-[400px]"
      )}
    >
      <div className={cn("rounded-full p-1", colors[toast.type])}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="flex-1 text-sm text-foreground">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
