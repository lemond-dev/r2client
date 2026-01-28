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
} from "lucide-react";
import { useFileStore, type FileItem } from "@/stores/fileStore";
import { ContextMenu, useContextMenu, getFileActions } from "./ContextMenu";
import { cn, formatBytes, getFileExtension } from "@/lib/utils";

interface FileGridProps {
  onPreview: (file: { key: string; name: string; size: number }) => void;
  onOpenFolder: (name: string) => void;
  onCopyLink: (key: string) => void;
  onDownload: (key: string, name: string) => void;
  onDelete: (keys: string[]) => void;
}

export function FileGrid({
  onPreview,
  onOpenFolder,
  onCopyLink,
  onDownload,
  onDelete,
}: FileGridProps) {
  const { files, selectedFiles, toggleFileSelection, searchQuery } = useFileStore();
  const { position, targetData, handleContextMenu, closeMenu } = useContextMenu();

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort: folders first, then files
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;
    return a.name.localeCompare(b.name);
  });

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
      <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
        {sortedFiles.map((file, index) => (
          <motion.div
            key={file.key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02 }}
          >
            <FileGridItem
              file={file}
              isSelected={selectedFiles.has(file.key)}
              onClick={() => toggleFileSelection(file.key)}
              onDoubleClick={() => handleDoubleClick(file)}
              onContextMenu={(e) => handleContextMenu(e, file)}
            />
          </motion.div>
        ))}
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

interface FileGridItemProps {
  file: FileItem;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

function FileGridItem({
  file,
  isSelected,
  onClick,
  onDoubleClick,
  onContextMenu,
}: FileGridItemProps) {
  const Icon = getFileIcon(file);

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      className={cn(
        "group flex cursor-pointer flex-col items-center rounded-lg p-3",
        "transition-all duration-150",
        isSelected
          ? "bg-primary/10 ring-2 ring-primary"
          : "hover:bg-accent"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "mb-2 flex h-12 w-12 items-center justify-center rounded-lg",
          "transition-transform group-hover:scale-105",
          file.isFolder
            ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-6 w-6" />
      </div>

      {/* Name */}
      <span
        className={cn(
          "w-full truncate text-center text-xs",
          isSelected ? "text-primary font-medium" : "text-foreground"
        )}
        title={file.name}
      >
        {file.name}
      </span>

      {/* Size (for files only) */}
      {!file.isFolder && (
        <span className="mt-0.5 text-[10px] text-muted-foreground">
          {formatBytes(file.size)}
        </span>
      )}
    </div>
  );
}

function getFileIcon(file: FileItem) {
  if (file.isFolder) return Folder;

  const ext = getFileExtension(file.name).toLowerCase();

  const iconMap: Record<string, typeof File> = {
    // Images
    jpg: Image,
    jpeg: Image,
    png: Image,
    gif: Image,
    webp: Image,
    svg: Image,
    // Documents
    pdf: FileText,
    doc: FileText,
    docx: FileText,
    txt: FileText,
    md: FileText,
    // Code
    js: FileCode,
    ts: FileCode,
    jsx: FileCode,
    tsx: FileCode,
    json: FileCode,
    html: FileCode,
    css: FileCode,
    // Archives
    zip: FileArchive,
    rar: FileArchive,
    "7z": FileArchive,
    tar: FileArchive,
    gz: FileArchive,
    // Video
    mp4: Film,
    avi: Film,
    mkv: Film,
    mov: Film,
    // Audio
    mp3: Music,
    wav: Music,
    flac: Music,
  };

  return iconMap[ext] || File;
}
