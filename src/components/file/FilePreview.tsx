import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Download, ExternalLink, Loader2, FileText, Image as ImageIcon } from "lucide-react";
import { cn, formatBytes, getFileExtension } from "@/lib/utils";

interface FilePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  fileSize: number;
  previewUrl: string | null;
  onDownload: () => void;
}

export function FilePreview({
  open,
  onOpenChange,
  fileName,
  fileSize,
  previewUrl,
  onDownload,
}: FilePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ext = getFileExtension(fileName).toLowerCase();
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext);
  const isPdf = ext === "pdf";

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      setError(null);
    }
  }, [open, previewUrl]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "relative flex max-h-[90vh] max-w-[90vw] flex-col",
          "rounded-lg border border-border bg-card shadow-2xl",
          "overflow-hidden"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            {isImage ? (
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            ) : (
              <FileText className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <h3 className="font-medium">{fileName}</h3>
              <p className="text-xs text-muted-foreground">{formatBytes(fileSize)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDownload}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5",
                "text-sm text-muted-foreground hover:bg-accent hover:text-foreground",
                "transition-colors"
              )}
            >
              <Download className="h-4 w-4" />
              下载
            </button>
            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5",
                  "text-sm text-muted-foreground hover:bg-accent hover:text-foreground",
                  "transition-colors"
                )}
              >
                <ExternalLink className="h-4 w-4" />
                新窗口
              </a>
            )}
            <button
              onClick={() => onOpenChange(false)}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto p-4">
          {!previewUrl ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isImage ? (
            <div className="flex items-center justify-center">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
              <img
                src={previewUrl}
                alt={fileName}
                className="max-h-[70vh] max-w-full object-contain"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setError("无法加载图片");
                }}
              />
              {error && (
                <p className="text-destructive">{error}</p>
              )}
            </div>
          ) : isPdf ? (
            <iframe
              src={previewUrl}
              className="h-[70vh] w-full rounded border border-border"
              title={fileName}
              onLoad={() => setIsLoading(false)}
            />
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
              <FileText className="mb-4 h-16 w-16 opacity-50" />
              <p>此文件类型不支持预览</p>
              <button
                onClick={onDownload}
                className={cn(
                  "mt-4 flex items-center gap-2 rounded-md px-4 py-2",
                  "bg-primary text-primary-foreground",
                  "text-sm font-medium hover:bg-primary/90"
                )}
              >
                <Download className="h-4 w-4" />
                下载文件
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
