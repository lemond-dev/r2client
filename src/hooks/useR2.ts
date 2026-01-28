import { useCallback } from "react";
import { useBucketStore } from "@/stores/bucketStore";
import { useFileStore } from "@/stores/fileStore";
import * as api from "@/lib/tauri";
import { useToast } from "./useToast";

export function useR2() {
  const {
    selectedAccountId,
    selectedBucket,
    currentPath,
    setBuckets,
  } = useBucketStore();
  const { setFiles, setLoading } = useFileStore();
  const { toast } = useToast();

  // Load buckets for an account
  const loadBuckets = useCallback(
    async (accountId: string) => {
      try {
        const buckets = await api.listBuckets(accountId);
        setBuckets(
          buckets.map((b) => ({
            name: b.name,
            accountId,
            createdAt: b.creation_date || undefined,
          }))
        );
      } catch (error) {
        toast({
          type: "error",
          message: `加载存储桶失败: ${error}`,
        });
      }
    },
    [setBuckets, toast]
  );

  // Load files in current path
  const loadFiles = useCallback(async () => {
    if (!selectedAccountId || !selectedBucket) return;

    setLoading(true);
    try {
      const objects = await api.listObjects(
        selectedAccountId,
        selectedBucket,
        currentPath || undefined
      );

      setFiles(
        objects.map((o) => ({
          key: o.key,
          name: o.name,
          size: o.size,
          lastModified: o.last_modified,
          isFolder: o.is_folder,
          etag: o.etag || undefined,
        }))
      );
    } catch (error) {
      toast({
        type: "error",
        message: `加载文件列表失败: ${error}`,
      });
    } finally {
      setLoading(false);
    }
  }, [selectedAccountId, selectedBucket, currentPath, setFiles, setLoading, toast]);

  // Create folder
  const createFolder = useCallback(
    async (folderName: string) => {
      if (!selectedAccountId || !selectedBucket) return;

      const fullPath = currentPath
        ? `${currentPath}/${folderName}`
        : folderName;

      try {
        await api.createFolder(selectedAccountId, selectedBucket, fullPath);
        toast({
          type: "success",
          message: `文件夹 "${folderName}" 创建成功`,
        });
        await loadFiles();
      } catch (error) {
        toast({
          type: "error",
          message: `创建文件夹失败: ${error}`,
        });
      }
    },
    [selectedAccountId, selectedBucket, currentPath, loadFiles, toast]
  );

  // Delete files
  const deleteFiles = useCallback(
    async (keys: string[]) => {
      if (!selectedAccountId || !selectedBucket) return;

      try {
        if (keys.length === 1) {
          await api.deleteObject(selectedAccountId, selectedBucket, keys[0]);
        } else {
          await api.deleteObjects(selectedAccountId, selectedBucket, keys);
        }
        toast({
          type: "success",
          message: `已删除 ${keys.length} 个项目`,
        });
        await loadFiles();
      } catch (error) {
        toast({
          type: "error",
          message: `删除失败: ${error}`,
        });
      }
    },
    [selectedAccountId, selectedBucket, loadFiles, toast]
  );

  // Get presigned URL
  const getDownloadUrl = useCallback(
    async (key: string): Promise<string | null> => {
      if (!selectedAccountId || !selectedBucket) return null;

      try {
        return await api.getPresignedUrl(
          selectedAccountId,
          selectedBucket,
          key,
          3600
        );
      } catch (error) {
        toast({
          type: "error",
          message: `获取下载链接失败: ${error}`,
        });
        return null;
      }
    },
    [selectedAccountId, selectedBucket, toast]
  );

  // Create bucket
  const createBucket = useCallback(
    async (bucketName: string) => {
      if (!selectedAccountId) return;

      try {
        await api.createBucket(selectedAccountId, bucketName);
        toast({
          type: "success",
          message: `存储桶 "${bucketName}" 创建成功`,
        });
        await loadBuckets(selectedAccountId);
      } catch (error) {
        toast({
          type: "error",
          message: `创建存储桶失败: ${error}`,
        });
      }
    },
    [selectedAccountId, loadBuckets, toast]
  );

  return {
    loadBuckets,
    loadFiles,
    createFolder,
    deleteFiles,
    getDownloadUrl,
    createBucket,
  };
}
