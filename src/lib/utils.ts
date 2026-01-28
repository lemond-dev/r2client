import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

export function getFileIcon(filename: string): string {
  const ext = getFileExtension(filename).toLowerCase();
  const iconMap: Record<string, string> = {
    // Images
    jpg: "image",
    jpeg: "image",
    png: "image",
    gif: "image",
    webp: "image",
    svg: "image",
    // Documents
    pdf: "file-text",
    doc: "file-text",
    docx: "file-text",
    txt: "file-text",
    md: "file-text",
    // Code
    js: "file-code",
    ts: "file-code",
    jsx: "file-code",
    tsx: "file-code",
    json: "file-json",
    html: "file-code",
    css: "file-code",
    // Archives
    zip: "file-archive",
    rar: "file-archive",
    "7z": "file-archive",
    tar: "file-archive",
    gz: "file-archive",
    // Video
    mp4: "film",
    avi: "film",
    mkv: "film",
    mov: "film",
    // Audio
    mp3: "music",
    wav: "music",
    flac: "music",
  };

  return iconMap[ext] || "file";
}
