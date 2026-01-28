import { useEffect, useCallback, useState } from "react";
import { useBucketStore } from "@/stores/bucketStore";
import { useFileStore } from "@/stores/fileStore";
import { useR2 } from "@/hooks/useR2";
import { useTransfer } from "@/hooks/useTransfer";
import { useToast } from "@/hooks/useToast";
import { FileToolbar } from "./FileToolbar";
import { Breadcrumb } from "./Breadcrumb";
import { FileGrid } from "./FileGrid";
import { FileList } from "./FileList";
import { EmptyState } from "./EmptyState";
import { DropZone } from "./DropZone";
import { FilePreview } from "./FilePreview";
import { FileGridSkeleton, FileListSkeleton } from "@/components/ui/Skeleton";
import { FolderOpen } from "lucide-react";

export function FileExplorer() {
  const { selectedAccountId, selectedBucket, currentPath, navigateToFolder } = useBucketStore();
  const { files, viewMode, isLoading, selectedFiles, selectAll, clearSelection } = useFileStore();
  const { loadFiles, deleteFiles, getDownloadUrl } = useR2();
  const { downloadFile } = useTransfer();
  const { toast } = useToast();

  // Preview state
  const [previewFile, setPreviewFile] = useState<{
    name: string;
    size: number;
    key: string;
  } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Load files when bucket or path changes
  useEffect(() => {
    if (selectedBucket) {
      loadFiles();
    }
  }, [selectedBucket, currentPath, loadFiles]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Ctrl/Cmd + A: Select all
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        selectAll();
      }

      // Escape: Clear selection
      if (e.key === "Escape") {
        clearSelection();
        setPreviewFile(null);
      }

      // Delete: Delete selected files
      if (e.key === "Delete" && selectedFiles.size > 0) {
        e.preventDefault();
        const keys = Array.from(selectedFiles);
        deleteFiles(keys);
        clearSelection();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectAll, clearSelection, selectedFiles, deleteFiles]);

  // Handle file drop (drag & drop upload)
  const handleFileDrop = useCallback(
    async (droppedFiles: File[]) => {
      if (!selectedAccountId || !selectedBucket) {
        toast({
          type: "error",
          message: "请先选择一个存储桶",
        });
        return;
      }

      // For now, just show a message - full implementation would use File System Access API
      toast({
        type: "info",
        message: `准备上传 ${droppedFiles.length} 个文件，请使用工具栏上传按钮`,
      });
    },
    [selectedAccountId, selectedBucket, toast]
  );

  // Handle file preview
  const handlePreview = useCallback(
    async (file: { key: string; name: string; size: number }) => {
      setPreviewFile(file);
      setPreviewUrl(null);

      const url = await getDownloadUrl(file.key);
      setPreviewUrl(url);
    },
    [getDownloadUrl]
  );

  // Handle download from preview
  const handleDownloadFromPreview = useCallback(() => {
    if (previewFile) {
      downloadFile(previewFile.key, previewFile.name);
    }
  }, [previewFile, downloadFile]);

  // Handle open folder
  const handleOpenFolder = useCallback(
    (folderName: string) => {
      navigateToFolder(folderName);
    },
    [navigateToFolder]
  );

  // Handle copy link
  const handleCopyLink = useCallback(
    async (key: string) => {
      const url = await getDownloadUrl(key);
      if (url) {
        await navigator.clipboard.writeText(url);
        toast({
          type: "success",
          message: "链接已复制到剪贴板",
        });
      }
    },
    [getDownloadUrl, toast]
  );

  if (!selectedBucket) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
        <FolderOpen className="mb-4 h-16 w-16 opacity-50" />
        <p className="text-lg">选择一个存储桶开始浏览</p>
        <p className="mt-2 text-sm">从左侧添加账户并选择存储桶</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Toolbar */}
        <FileToolbar />

        {/* Breadcrumb */}
        <Breadcrumb />

        {/* File View with Drop Zone */}
        <DropZone onDrop={handleFileDrop} disabled={!selectedBucket}>
          <div className="flex-1 overflow-auto p-4">
            {isLoading ? (
              viewMode === "grid" ? (
                <FileGridSkeleton />
              ) : (
                <FileListSkeleton />
              )
            ) : files.length === 0 ? (
              <EmptyState />
            ) : viewMode === "grid" ? (
              <FileGrid
                onPreview={handlePreview}
                onOpenFolder={handleOpenFolder}
                onCopyLink={handleCopyLink}
                onDownload={(key, name) => downloadFile(key, name)}
                onDelete={(keys) => {
                  deleteFiles(keys);
                  clearSelection();
                }}
              />
            ) : (
              <FileList
                onPreview={handlePreview}
                onOpenFolder={handleOpenFolder}
                onCopyLink={handleCopyLink}
                onDownload={(key, name) => downloadFile(key, name)}
                onDelete={(keys) => {
                  deleteFiles(keys);
                  clearSelection();
                }}
              />
            )}
          </div>
        </DropZone>
      </div>

      {/* File Preview Modal */}
      <FilePreview
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
        fileName={previewFile?.name || ""}
        fileSize={previewFile?.size || 0}
        previewUrl={previewUrl}
        onDownload={handleDownloadFromPreview}
      />
    </>
  );
}
