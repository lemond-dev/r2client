import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface R2Account {
  id: string;
  name: string;
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface Bucket {
  name: string;
  accountId: string;
  createdAt?: string;
  objectCount?: number;
  totalSize?: number;
}

interface BucketState {
  accounts: R2Account[];
  buckets: Bucket[];
  selectedAccountId: string | null;
  selectedBucket: string | null;
  currentPath: string;

  // Actions
  addAccount: (account: R2Account) => void;
  removeAccount: (id: string) => void;
  selectAccount: (id: string | null) => void;
  setBuckets: (buckets: Bucket[]) => void;
  selectBucket: (name: string | null) => void;
  setCurrentPath: (path: string) => void;
  navigateToFolder: (folder: string) => void;
  navigateUp: () => void;
}

export const useBucketStore = create<BucketState>()(
  persist(
    (set) => ({
      accounts: [],
      buckets: [],
      selectedAccountId: null,
      selectedBucket: null,
      currentPath: "",

      addAccount: (account) =>
        set((state) => ({
          accounts: [...state.accounts, account],
        })),

      removeAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
          selectedAccountId:
            state.selectedAccountId === id ? null : state.selectedAccountId,
        })),

      selectAccount: (id) =>
        set({
          selectedAccountId: id,
          selectedBucket: null,
          currentPath: "",
        }),

      setBuckets: (buckets) => set({ buckets }),

      selectBucket: (name) =>
        set({
          selectedBucket: name,
          currentPath: "",
        }),

      setCurrentPath: (path) => set({ currentPath: path }),

      navigateToFolder: (folder) =>
        set((state) => ({
          currentPath: state.currentPath
            ? `${state.currentPath}/${folder}`
            : folder,
        })),

      navigateUp: () =>
        set((state) => {
          const parts = state.currentPath.split("/").filter(Boolean);
          parts.pop();
          return { currentPath: parts.join("/") };
        }),
    }),
    {
      name: "r2-explorer-buckets",
      partialize: (state) => ({
        // 只持久化账户基本信息，不存储 secretAccessKey（由 Rust 后端的 keyring 安全存储）
        accounts: state.accounts.map(({ secretAccessKey, ...rest }) => rest),
        selectedAccountId: state.selectedAccountId,
      }),
    }
  )
);
