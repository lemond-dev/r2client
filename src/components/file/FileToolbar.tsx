import { useState } from "react";
import {
  Upload,
  Download,
  Trash2,
  RefreshCw,
  LayoutGrid,
  List,
  Search,
  FolderPlus,
} from "lucide-react";
import { useFileStore, type ViewMode } from "@/stores/fileStore";
import { useR2 } from "@/hooks/useR2";
import { useTransfer } from "@/hooks/useTransfer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { InputDialog } from "@/components/ui/InputDialog";
import { cn } from "@/lib/utils";

export function FileToolbar() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);

  const {
    files,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedFiles,
    clearSelection,
  } = useFileStore();

  const { loadFiles, createFolder, deleteFiles } = useR2();
  const { uploadFiles, downloadFiles } = useTransfer();

  const hasSelection = selectedFiles.size > 0;
  const selectedCount = selectedFiles.size;

  const handleRefresh = () => {
    loadFiles();
  };

  const handleUpload = () => {
    uploadFiles();
  };

  const handleCreateFolder = (name: string) => {
    createFolder(name);
  };

  const handleDelete = () => {
    const keys = Array.from(selectedFiles);
    deleteFiles(keys);
    clearSelection();
  };

  const handleDownload = () => {
    const filesToDownload = files
      .filter((f) => selectedFiles.has(f.key) && !f.isFolder)
      .map((f) => ({ key: f.key, name: f.name }));

    if (filesToDownload.length > 0) {
      downloadFiles(filesToDownload);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        {/* Left Actions */}
        <div className="flex items-center gap-1">
          <ToolbarButton icon={Upload} label="上传" onClick={handleUpload} />
          <ToolbarButton
            icon={FolderPlus}
            label="新建文件夹"
            onClick={() => setIsFolderDialogOpen(true)}
          />
          <div className="mx-2 h-4 w-px bg-border" />
          <ToolbarButton icon={RefreshCw} label="刷新" onClick={handleRefresh} />
          {hasSelection && (
            <>
              <div className="mx-2 h-4 w-px bg-border" />
              <ToolbarButton
                icon={Download}
                label="下载"
                onClick={handleDownload}
              />
              <ToolbarButton
                icon={Trash2}
                label="删除"
                variant="danger"
                onClick={() => setIsDeleteDialogOpen(true)}
              />
            </>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索文件..."
              className={cn(
                "h-8 w-48 rounded-md border border-input bg-background pl-8 pr-3",
                "text-sm placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring"
              )}
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex rounded-md border border-border">
            <ViewModeButton
              mode="grid"
              icon={LayoutGrid}
              currentMode={viewMode}
              onClick={() => setViewMode("grid")}
            />
            <ViewModeButton
              mode="list"
              icon={List}
              currentMode={viewMode}
              onClick={() => setViewMode("list")}
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="确认删除"
        description={`确定要删除选中的 ${selectedCount} 个项目吗？此操作无法撤销。`}
        confirmText="删除"
        variant="danger"
        onConfirm={handleDelete}
      />

      {/* Create Folder Dialog */}
      <InputDialog
        open={isFolderDialogOpen}
        onOpenChange={setIsFolderDialogOpen}
        title="新建文件夹"
        placeholder="输入文件夹名称"
        confirmText="创建"
        onConfirm={handleCreateFolder}
      />
    </>
  );
}

interface ToolbarButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  variant?: "default" | "danger";
  onClick?: () => void;
}

function ToolbarButton({
  icon: Icon,
  label,
  variant = "default",
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2.5 py-1.5",
        "text-sm transition-colors",
        variant === "default" &&
          "text-muted-foreground hover:bg-accent hover:text-foreground",
        variant === "danger" && "text-destructive hover:bg-destructive/10"
      )}
      title={label}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

interface ViewModeButtonProps {
  mode: ViewMode;
  icon: React.ComponentType<{ className?: string }>;
  currentMode: ViewMode;
  onClick: () => void;
}

function ViewModeButton({
  mode,
  icon: Icon,
  currentMode,
  onClick,
}: ViewModeButtonProps) {
  const isActive = mode === currentMode;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center transition-colors",
        mode === "grid" && "rounded-l-md border-r border-border",
        mode === "list" && "rounded-r-md",
        isActive
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
      title={mode === "grid" ? "网格视图" : "列表视图"}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
