import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Download,
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronUp,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useTransferStore, type TransferItem } from "@/stores/transferStore";
import { cn, formatBytes } from "@/lib/utils";

export function TransferQueue() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { transfers, removeTransfer, clearCompleted } = useTransferStore();

  const activeTransfers = transfers.filter(
    (t) => t.status === "uploading" || t.status === "downloading" || t.status === "pending"
  );
  const completedTransfers = transfers.filter(
    (t) => t.status === "completed" || t.status === "failed" || t.status === "cancelled"
  );

  if (transfers.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 w-80">
      <div className="rounded-lg border border-border bg-card shadow-xl overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">传输队列</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {activeTransfers.length} 进行中
            </span>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {/* Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="max-h-64 overflow-y-auto">
                {/* Active Transfers */}
                {activeTransfers.map((transfer) => (
                  <TransferItemRow
                    key={transfer.id}
                    transfer={transfer}
                    onRemove={() => removeTransfer(transfer.id)}
                  />
                ))}

                {/* Completed Transfers */}
                {completedTransfers.length > 0 && (
                  <>
                    <div className="flex items-center justify-between border-t border-border px-4 py-2">
                      <span className="text-xs text-muted-foreground">
                        已完成 ({completedTransfers.length})
                      </span>
                      <button
                        onClick={clearCompleted}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Trash2 className="h-3 w-3" />
                        清除
                      </button>
                    </div>
                    {completedTransfers.map((transfer) => (
                      <TransferItemRow
                        key={transfer.id}
                        transfer={transfer}
                        onRemove={() => removeTransfer(transfer.id)}
                      />
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface TransferItemRowProps {
  transfer: TransferItem;
  onRemove: () => void;
}

function TransferItemRow({ transfer, onRemove }: TransferItemRowProps) {
  const isActive =
    transfer.status === "uploading" ||
    transfer.status === "downloading" ||
    transfer.status === "pending";

  return (
    <div className="flex items-center gap-3 border-t border-border px-4 py-2">
      {/* Icon */}
      <div
        className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
          transfer.status === "completed" && "bg-emerald-500/10 text-emerald-500",
          transfer.status === "failed" && "bg-red-500/10 text-red-500",
          transfer.status === "cancelled" && "bg-muted text-muted-foreground",
          isActive && transfer.type === "upload" && "bg-blue-500/10 text-blue-500",
          isActive && transfer.type === "download" && "bg-green-500/10 text-green-500"
        )}
      >
        {transfer.status === "completed" ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : transfer.status === "failed" ? (
          <XCircle className="h-4 w-4" />
        ) : isActive ? (
          transfer.type === "upload" ? (
            <Upload className="h-4 w-4" />
          ) : (
            <Download className="h-4 w-4" />
          )
        ) : (
          <X className="h-4 w-4" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm">{transfer.fileName}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {isActive ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>
                {transfer.type === "upload" ? "上传中" : "下载中"}...
              </span>
            </>
          ) : transfer.status === "completed" ? (
            <span>完成</span>
          ) : transfer.status === "failed" ? (
            <span className="text-red-500 truncate">{transfer.error || "失败"}</span>
          ) : (
            <span>已取消</span>
          )}
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
