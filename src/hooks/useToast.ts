import { create } from "zustand";

export interface ToastData {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, "id">) => void;
  removeToast: (id: string) => void;
}

const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = crypto.randomUUID();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    // Auto remove after duration
    const duration = toast.duration ?? 4000;
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export function useToast() {
  const { toasts, addToast, removeToast } = useToastStore();

  return {
    toasts,
    toast: addToast,
    dismiss: removeToast,
  };
}
