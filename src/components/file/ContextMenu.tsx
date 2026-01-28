import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Trash2,
  Link,
  Eye,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface ContextMenuAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
  divider?: boolean;
}

interface ContextMenuProps {
  position: ContextMenuPosition | null;
  actions: ContextMenuAction[];
  onClose: () => void;
}

export function ContextMenu({ position, actions, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Adjust position to keep menu in viewport
  useEffect(() => {
    if (position && menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = position.x;
      let y = position.y;

      if (x + rect.width > viewportWidth) {
        x = viewportWidth - rect.width - 10;
      }
      if (y + rect.height > viewportHeight) {
        y = viewportHeight - rect.height - 10;
      }

      setAdjustedPosition({ x, y });
    }
  }, [position]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  if (!position) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className={cn(
          "fixed z-50 min-w-[180px] rounded-lg border border-border",
          "bg-popover p-1 shadow-xl"
        )}
        style={{
          left: adjustedPosition?.x ?? position.x,
          top: adjustedPosition?.y ?? position.y,
        }}
      >
        {actions.map((action, index) => (
          <div key={action.id}>
            {action.divider && index > 0 && (
              <div className="my-1 h-px bg-border" />
            )}
            <button
              onClick={() => {
                if (!action.disabled) {
                  action.onClick();
                  onClose();
                }
              }}
              disabled={action.disabled}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2",
                "text-sm transition-colors",
                action.disabled && "opacity-50 cursor-not-allowed",
                !action.disabled &&
                  action.variant === "danger" &&
                  "text-destructive hover:bg-destructive/10",
                !action.disabled &&
                  action.variant !== "danger" &&
                  "hover:bg-accent"
              )}
            >
              <action.icon className="h-4 w-4" />
              <span>{action.label}</span>
            </button>
          </div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

// Hook for context menu
export function useContextMenu() {
  const [position, setPosition] = useState<ContextMenuPosition | null>(null);
  const [targetData, setTargetData] = useState<any>(null);

  const handleContextMenu = (e: React.MouseEvent, data?: any) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setTargetData(data);
  };

  const closeMenu = () => {
    setPosition(null);
    setTargetData(null);
  };

  return {
    position,
    targetData,
    handleContextMenu,
    closeMenu,
  };
}

// Pre-built actions for files
export function getFileActions(options: {
  isFolder: boolean;
  onOpen: () => void;
  onDownload: () => void;
  onCopyLink: () => void;
  onPreview: () => void;
  onDelete: () => void;
}): ContextMenuAction[] {
  const { isFolder, onOpen, onDownload, onCopyLink, onPreview, onDelete } =
    options;

  return [
    {
      id: "open",
      label: isFolder ? "打开" : "预览",
      icon: isFolder ? FolderOpen : Eye,
      onClick: isFolder ? onOpen : onPreview,
    },
    {
      id: "download",
      label: "下载",
      icon: Download,
      onClick: onDownload,
      disabled: isFolder,
    },
    {
      id: "copy-link",
      label: "复制链接",
      icon: Link,
      onClick: onCopyLink,
      disabled: isFolder,
      divider: true,
    },
    {
      id: "delete",
      label: "删除",
      icon: Trash2,
      onClick: onDelete,
      variant: "danger",
      divider: true,
    },
  ];
}
