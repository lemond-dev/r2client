import { useCallback } from "react";
import { open, save } from "@tauri-apps/plugin-dialog";
import { useBucketStore } from "@/stores/bucketStore";
import { useTransferStore } from "@/stores/transferStore";
import * as api from "@/lib/tauri";
import { useToast } from "./useToast";

export function useTransfer() {
  const { selectedAccountId, selectedBucket, currentPath } = useBucketStore();
  const { addTransfer, updateStatus, updateProgress } = useTransferStore();
  const { toast } = useToast();

  // Upload files
  const uploadFiles = useCallback(async () => {
    if (!selectedAccountId || !selectedBucket) {
      toast({
        type: "error",
        message: "请先选择一个存储桶",
      });
      return;
    }

    const files = await open({
      multiple: true,
      title: "选择要上传的文件",
    });

    if (!files || files.length === 0) return;

    const fileList = Array.isArray(files) ? files : [files];

    for (const filePath of fileList) {
      const fileName = filePath.split(/[/\\]/).pop() || "unknown";
      const objectKey = currentPath ? `${currentPath}/${fileName}` : fileName;

      const transferId = addTransfer({
        fileName,
        filePath,
        bucketName: selectedBucket,
        objectKey,
        size: 0,
        progress: 0,
        status: "pending",
        type: "upload",
      });

      try {
        updateStatus(transferId, "uploading");

        await api.uploadFile(
          selectedAccountId,
          selectedBucket,
          objectKey,
          filePath
        );

        updateStatus(transferId, "completed");
        toast({
          type: "success",
          message: `${fileName} 上传成功`,
        });
      } catch (error) {
        updateStatus(transferId, "failed", String(error));
        toast({
          type: "error",
          message: `${fileName} 上传失败: ${error}`,
        });
      }
    }
  }, [selectedAccountId, selectedBucket, currentPath, addTransfer, updateStatus, toast]);

  // Download file
  const downloadFile = useCallback(
    async (key: string, fileName: string) => {
      if (!selectedAccountId || !selectedBucket) return;

      const savePath = await save({
        title: "保存文件",
        defaultPath: fileName,
      });

      if (!savePath) return;

      const transferId = addTransfer({
        fileName,
        filePath: savePath,
        bucketName: selectedBucket,
        objectKey: key,
        size: 0,
        progress: 0,
        status: "pending",
        type: "download",
      });

      try {
        updateStatus(transferId, "downloading");

        await api.downloadFile(
          selectedAccountId,
          selectedBucket,
          key,
          savePath
        );

        updateStatus(transferId, "completed");
        toast({
          type: "success",
          message: `${fileName} 下载成功`,
        });
      } catch (error) {
        updateStatus(transferId, "failed", String(error));
        toast({
          type: "error",
          message: `${fileName} 下载失败: ${error}`,
        });
      }
    },
    [selectedAccountId, selectedBucket, addTransfer, updateStatus, toast]
  );

  // Download multiple files
  const downloadFiles = useCallback(
    async (files: Array<{ key: string; name: string }>) => {
      for (const file of files) {
        await downloadFile(file.key, file.name);
      }
    },
    [downloadFile]
  );

  return {
    uploadFiles,
    downloadFile,
    downloadFiles,
  };
}
