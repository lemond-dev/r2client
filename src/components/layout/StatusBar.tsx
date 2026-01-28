import { Upload, Download, CheckCircle2, XCircle } from "lucide-react";
import { useTransferStore } from "@/stores/transferStore";
import { useFileStore } from "@/stores/fileStore";
import { useBucketStore } from "@/stores/bucketStore";
import { formatBytes } from "@/lib/utils";

export function StatusBar() {
  const { transfers } = useTransferStore();
  const { files, selectedFiles } = useFileStore();
  const { selectedBucket, currentPath } = useBucketStore();

  const activeUploads = transfers.filter((t) => t.status === "uploading").length;
  const activeDownloads = transfers.filter((t) => t.status === "downloading").length;
  const completedCount = transfers.filter((t) => t.status === "completed").length;
  const failedCount = transfers.filter((t) => t.status === "failed").length;

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const selectedCount = selectedFiles.size;

  return (
    <footer className="flex h-7 items-center justify-between border-t border-border bg-card px-3 text-xs text-muted-foreground">
      {/* Left: File info */}
      <div className="flex items-center gap-4">
        {selectedBucket ? (
          <>
            <span>
              {files.length} 个项目
              {currentPath && ` | ${currentPath}`}
            </span>
            <span>{formatBytes(totalSize)}</span>
            {selectedCount > 0 && (
              <span className="text-primary">
                已选择 {selectedCount} 项
              </span>
            )}
          </>
        ) : (
          <span>请选择一个存储桶</span>
        )}
      </div>

      {/* Right: Transfer status */}
      <div className="flex items-center gap-3">
        {activeUploads > 0 && (
          <div className="flex items-center gap-1">
            <Upload className="h-3 w-3 text-blue-500" />
            <span>{activeUploads} 上传中</span>
          </div>
        )}
        {activeDownloads > 0 && (
          <div className="flex items-center gap-1">
            <Download className="h-3 w-3 text-green-500" />
            <span>{activeDownloads} 下载中</span>
          </div>
        )}
        {completedCount > 0 && (
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            <span>{completedCount}</span>
          </div>
        )}
        {failedCount > 0 && (
          <div className="flex items-center gap-1">
            <XCircle className="h-3 w-3 text-red-500" />
            <span>{failedCount}</span>
          </div>
        )}
      </div>
    </footer>
  );
}
