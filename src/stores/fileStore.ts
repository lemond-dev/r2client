import { create } from "zustand";

export interface FileItem {
  key: string;
  name: string;
  size: number;
  lastModified: string;
  isFolder: boolean;
  etag?: string;
}

export type ViewMode = "grid" | "list";
export type SortField = "name" | "size" | "lastModified";
export type SortOrder = "asc" | "desc";

interface FileState {
  files: FileItem[];
  selectedFiles: Set<string>;
  viewMode: ViewMode;
  sortField: SortField;
  sortOrder: SortOrder;
  searchQuery: string;
  isLoading: boolean;

  // Actions
  setFiles: (files: FileItem[]) => void;
  selectFile: (key: string) => void;
  deselectFile: (key: string) => void;
  toggleFileSelection: (key: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setViewMode: (mode: ViewMode) => void;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useFileStore = create<FileState>((set) => ({
  files: [],
  selectedFiles: new Set(),
  viewMode: "grid",
  sortField: "name",
  sortOrder: "asc",
  searchQuery: "",
  isLoading: false,

  setFiles: (files) => set({ files, selectedFiles: new Set() }),

  selectFile: (key) =>
    set((state) => ({
      selectedFiles: new Set([...state.selectedFiles, key]),
    })),

  deselectFile: (key) =>
    set((state) => {
      const newSelection = new Set(state.selectedFiles);
      newSelection.delete(key);
      return { selectedFiles: newSelection };
    }),

  toggleFileSelection: (key) =>
    set((state) => {
      const newSelection = new Set(state.selectedFiles);
      if (newSelection.has(key)) {
        newSelection.delete(key);
      } else {
        newSelection.add(key);
      }
      return { selectedFiles: newSelection };
    }),

  selectAll: () =>
    set((state) => ({
      selectedFiles: new Set(state.files.map((f) => f.key)),
    })),

  clearSelection: () => set({ selectedFiles: new Set() }),

  setViewMode: (mode) => set({ viewMode: mode }),

  setSortField: (field) => set({ sortField: field }),

  setSortOrder: (order) => set({ sortOrder: order }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setLoading: (loading) => set({ isLoading: loading }),
}));
