import { create } from "zustand";

export type TransferStatus = "pending" | "uploading" | "downloading" | "completed" | "failed" | "cancelled";

export interface TransferItem {
  id: string;
  fileName: string;
  filePath: string;
  bucketName: string;
  objectKey: string;
  size: number;
  progress: number;
  status: TransferStatus;
  type: "upload" | "download";
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

interface TransferState {
  transfers: TransferItem[];
  activeTransfers: number;
  maxConcurrent: number;

  // Actions
  addTransfer: (transfer: Omit<TransferItem, "id" | "startedAt">) => string;
  updateProgress: (id: string, progress: number) => void;
  updateStatus: (id: string, status: TransferStatus, error?: string) => void;
  removeTransfer: (id: string) => void;
  clearCompleted: () => void;
  cancelTransfer: (id: string) => void;
}

export const useTransferStore = create<TransferState>((set, get) => ({
  transfers: [],
  activeTransfers: 0,
  maxConcurrent: 3,

  addTransfer: (transfer) => {
    const id = crypto.randomUUID();
    set((state) => ({
      transfers: [
        ...state.transfers,
        {
          ...transfer,
          id,
          startedAt: new Date(),
        },
      ],
    }));
    return id;
  },

  updateProgress: (id, progress) =>
    set((state) => ({
      transfers: state.transfers.map((t) =>
        t.id === id ? { ...t, progress } : t
      ),
    })),

  updateStatus: (id, status, error) =>
    set((state) => ({
      transfers: state.transfers.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              error,
              completedAt: status === "completed" ? new Date() : t.completedAt,
            }
          : t
      ),
      activeTransfers:
        status === "uploading" || status === "downloading"
          ? state.activeTransfers + 1
          : status === "completed" || status === "failed" || status === "cancelled"
          ? Math.max(0, state.activeTransfers - 1)
          : state.activeTransfers,
    })),

  removeTransfer: (id) =>
    set((state) => ({
      transfers: state.transfers.filter((t) => t.id !== id),
    })),

  clearCompleted: () =>
    set((state) => ({
      transfers: state.transfers.filter((t) => t.status !== "completed"),
    })),

  cancelTransfer: (id) =>
    set((state) => ({
      transfers: state.transfers.map((t) =>
        t.id === id ? { ...t, status: "cancelled" as TransferStatus } : t
      ),
    })),
}));
