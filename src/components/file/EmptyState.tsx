import { Upload, FileUp } from "lucide-react";
import { useTransfer } from "@/hooks/useTransfer";
import { cn } from "@/lib/utils";

export function EmptyState() {
  const { uploadFiles } = useTransfer();

  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      {/* Drag & Drop hint */}
      <div
        className={cn(
          "mb-6 rounded-xl border-2 border-dashed border-muted-foreground/30 p-8",
          "transition-colors hover:border-primary/50"
        )}
      >
        <div className="mb-4 rounded-full bg-muted p-4 mx-auto w-fit">
          <FileUp className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-medium">拖拽文件到此处上传</h3>
        <p className="text-sm text-muted-foreground">
          或点击下方按钮选择文件
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={uploadFiles}
          className={cn(
            "flex items-center gap-2 rounded-md px-4 py-2",
            "bg-primary text-primary-foreground",
            "text-sm font-medium transition-colors",
            "hover:bg-primary/90"
          )}
        >
          <Upload className="h-4 w-4" />
          上传文件
        </button>
      </div>

      {/* Keyboard shortcut hint */}
      <p className="mt-6 text-xs text-muted-foreground">
        快捷键: <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px]">Ctrl+A</kbd> 全选 | <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px]">Delete</kbd> 删除
      </p>
    </div>
  );
}
