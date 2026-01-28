import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  children: React.ReactNode;
  onDrop: (files: File[]) => void;
  disabled?: boolean;
}

export function DropZone({ children, onDrop, disabled }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;

      setDragCounter((prev) => prev + 1);
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;

      setDragCounter((prev) => {
        const newCounter = prev - 1;
        if (newCounter === 0) {
          setIsDragging(false);
        }
        return newCounter;
      });
    },
    [disabled]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
    },
    [disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;

      setIsDragging(false);
      setDragCounter(0);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onDrop(files);
      }
    },
    [disabled, onDrop]
  );

  return (
    <div
      className="relative h-full"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}

      {/* Drop Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "absolute inset-0 z-50 flex flex-col items-center justify-center",
              "bg-primary/5 backdrop-blur-sm",
              "border-2 border-dashed border-primary rounded-lg m-2"
            )}
          >
            <motion.div
              initial={{ scale: 0.8, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <FileUp className="h-10 w-10 text-primary" />
              </div>
              <p className="text-lg font-medium text-primary">
                释放文件以上传
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                文件将上传到当前文件夹
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
