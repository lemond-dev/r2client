import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "确认",
  cancelText = "取消",
  variant = "default",
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => !isLoading && onOpenChange(false)}
        />

        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl"
        >
          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Icon */}
          {variant === "danger" && (
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          )}

          {/* Title */}
          <h2 className="mb-2 text-lg font-semibold">{title}</h2>

          {/* Description */}
          <p className="mb-6 text-sm text-muted-foreground">{description}</p>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium",
                "text-muted-foreground hover:bg-accent hover:text-foreground",
                "transition-colors disabled:opacity-50"
              )}
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
              disabled={isLoading}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium",
                "transition-colors disabled:opacity-50",
                variant === "danger"
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {isLoading ? "处理中..." : confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
