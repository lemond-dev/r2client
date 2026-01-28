import { motion } from "framer-motion";
import {
  Folder,
  File,
  Image,
  FileText,
  FileCode,
  FileArchive,
  Film,
  Music,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useFileStore, type FileItem, type SortField } from "@/stores/fileStore";
import { ContextMenu, useContextMenu, getFileActions } from "./ContextMenu";
import { cn, formatBytes, formatDate, getFileExtension } from "@/lib/utils";

interface FileListProps {
  onPreview: (file: { key: string; name: string; size: number }) => void;
  onOpenFolder: (name: string) => void;
  onCopyLink: (key: string) => void;
  onDownload: (key: string, name: string) => void;
  onDelete: (keys: string[]) => void;
}

export function FileList({
  onPreview,
  onOpenFolder,
  onCopyLink,
  onDownload,
  onDelete,
}: FileListProps) {
  const {
    files,
    selectedFiles,
    toggleFileSelection,
    searchQuery,
    sortField,
    sortOrder,
    setSortField,
    setSortOrder,
  } = useFileStore();
  const { position, targetData, handleContextMenu, closeMenu } = useContextMenu();

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort files
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    // Folders always first
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;

    let comparison = 0;
    switch (sortField) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "size":
        comparison = a.size - b.size;
        break;
      case "lastModified":
        comparison =
          new Date(a.lastModified).getTime() -
          new Date(b.lastModified).getTime();
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleDoubleClick = (file: FileItem) => {
    if (file.isFolder) {
      onOpenFolder(file.name);
    } else {
      onPreview({ key: file.key, name: file.name, size: file.size });
    }
  };

  const contextMenuActions = targetData
    ? getFileActions({
        isFolder: targetData.isFolder,
        onOpen: () => {
          if (targetData.isFolder) {
            onOpenFolder(targetData.name);
          } else {
            onPreview({ key: targetData.key, name: targetData.name, size: targetData.size });
          }
        },
        onDownload: () => onDownload(targetData.key, targetData.name),
        onCopyLink: () => onCopyLink(targetData.key),
        onPreview: () => onPreview({ key: targetData.key, name: targetData.name, size: targetData.size }),
        onDelete: () => onDelete([targetData.key]),
      })
    : [];

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center border-b border-border bg-muted/50 text-xs font-medium text-muted-foreground">
          <div className="w-10 px-3 py-2" />
          <SortableHeader
            label="名称"
            field="name"
            currentField={sortField}
            order={sortOrder}
            onClick={() => handleSort("name")}
            className="flex-1"
          />
          <SortableHeader
            label="大小"
            field="size"
            currentField={sortField}
            order={sortOrder}
            onClick={() => handleSort("size")}
            className="w-24 text-right"
          />
          <SortableHeader
            label="修改时间"
            field="lastModified"
            currentField={sortField}
            order={sortOrder}
            onClick={() => handleSort("lastModified")}
            className="w-40 text-right"
          />
        </div>

        {/* Rows */}
        <div className="divide-y divide-border">
          {sortedFiles.map((file, index) => (
            <motion.div
              key={file.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <FileListItem
                file={file}
                isSelected={selectedFiles.has(file.key)}
                onClick={() => toggleFileSelection(file.key)}
                onDoubleClick={() => handleDoubleClick(file)}
                onContextMenu={(e) => handleContextMenu(e, file)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Context Menu */}
      <ContextMenu
        position={position}
        actions={contextMenuActions}
        onClose={closeMenu}
      />
    </>
  );
}

interface SortableHeaderProps {
  label: string;
  field: SortField;
  currentField: SortField;
  order: "asc" | "desc";
  onClick: () => void;
  className?: string;
}

function SortableHeader({
  label,
  field,
  currentField,
  order,
  onClick,
  className,
}: SortableHeaderProps) {
  const isActive = field === currentField;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 px-3 py-2 hover:text-foreground transition-colors",
        className
      )}
    >
      <span>{label}</span>
      {isActive &&
        (order === "asc" ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        ))}
    </button>
  );
}

interface FileListItemProps {
  file: FileItem;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

function FileListItem({
  file,
  isSelected,
  onClick,
  onDoubleClick,
  onContextMenu,
}: FileListItemProps) {
  const Icon = getFileIcon(file);

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      className={cn(
        "flex cursor-pointer items-center text-sm transition-colors",
        isSelected ? "bg-primary/10" : "hover:bg-accent"
      )}
    >
      {/* Checkbox area */}
      <div className="flex w-10 items-center justify-center px-3 py-2">
        <div
          className={cn(
            "h-4 w-4 rounded border-2 transition-colors",
            isSelected
              ? "border-primary bg-primary"
              : "border-muted-foreground/30"
          )}
        >
          {isSelected && (
            <svg viewBox="0 0 16 16" className="text-primary-foreground">
              <path
                fill="currentColor"
                d="M6.5 11.5L3 8l1-1 2.5 2.5 5-5 1 1z"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Name */}
      <div className="flex flex-1 items-center gap-2 px-3 py-2">
        <Icon
          className={cn(
            "h-4 w-4 flex-shrink-0",
            file.isFolder ? "text-amber-500" : "text-muted-foreground"
          )}
        />
        <span className="truncate">{file.name}</span>
      </div>

      {/* Size */}
      <div className="w-24 px-3 py-2 text-right text-muted-foreground">
        {file.isFolder ? "-" : formatBytes(file.size)}
      </div>

      {/* Last Modified */}
      <div className="w-40 px-3 py-2 text-right text-muted-foreground">
        {formatDate(file.lastModified)}
      </div>
    </div>
  );
}

function getFileIcon(file: FileItem) {
  if (file.isFolder) return Folder;

  const ext = getFileExtension(file.name).toLowerCase();

  const iconMap: Record<string, typeof File> = {
    jpg: Image,
    jpeg: Image,
    png: Image,
    gif: Image,
    webp: Image,
    svg: Image,
    pdf: FileText,
    doc: FileText,
    docx: FileText,
    txt: FileText,
    md: FileText,
    js: FileCode,
    ts: FileCode,
    jsx: FileCode,
    tsx: FileCode,
    json: FileCode,
    html: FileCode,
    css: FileCode,
    zip: FileArchive,
    rar: FileArchive,
    "7z": FileArchive,
    tar: FileArchive,
    gz: FileArchive,
    mp4: Film,
    avi: Film,
    mkv: Film,
    mov: Film,
    mp3: Music,
    wav: Music,
    flac: Music,
  };

  return iconMap[ext] || File;
}
