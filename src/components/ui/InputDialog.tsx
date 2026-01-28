import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (value: string) => void;
  isLoading?: boolean;
  defaultValue?: string;
}

export function InputDialog({
  open,
  onOpenChange,
  title,
  description,
  placeholder = "",
  confirmText = "确认",
  cancelText = "取消",
  onConfirm,
  isLoading = false,
  defaultValue = "",
}: InputDialogProps) {
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value.trim());
      setValue("");
      onOpenChange(false);
    }
  };

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

          {/* Title */}
          <h2 className="mb-2 text-lg font-semibold">{title}</h2>

          {/* Description */}
          {description && (
            <p className="mb-4 text-sm text-muted-foreground">{description}</p>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              autoFocus
              className={cn(
                "mb-4 w-full rounded-md border border-input bg-background px-3 py-2",
                "text-sm placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring"
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
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
                type="submit"
                disabled={isLoading || !value.trim()}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium",
                  "bg-primary text-primary-foreground",
                  "hover:bg-primary/90 transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isLoading ? "处理中..." : confirmText}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
