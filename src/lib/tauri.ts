import { invoke } from "@tauri-apps/api/core";

// Types
export interface AccountInfo {
  id: string;
  name: string;
  account_id: string;
}

export interface BucketInfo {
  name: string;
  creation_date: string | null;
}

export interface ObjectInfo {
  key: string;
  name: string;
  size: number;
  last_modified: string;
  is_folder: boolean;
  etag: string | null;
}

// Account Commands
export async function saveAccount(
  id: string,
  name: string,
  accountId: string,
  accessKeyId: string,
  secretAccessKey: string
): Promise<void> {
  return invoke("save_account", {
    id,
    name,
    accountId,
    accessKeyId,
    secretAccessKey,
  });
}

export async function getAccounts(): Promise<AccountInfo[]> {
  return invoke("get_accounts");
}

export async function deleteAccount(id: string): Promise<void> {
  return invoke("delete_account", { id });
}

export async function validateCredentials(
  accountId: string,
  accessKeyId: string,
  secretAccessKey: string
): Promise<boolean> {
  return invoke("validate_credentials", {
    accountId,
    accessKeyId,
    secretAccessKey,
  });
}

// Bucket Commands
export async function listBuckets(accountId: string): Promise<BucketInfo[]> {
  return invoke("list_buckets", { accountId });
}

export async function createBucket(
  accountId: string,
  bucketName: string
): Promise<void> {
  return invoke("create_bucket", { accountId, bucketName });
}

export async function deleteBucket(
  accountId: string,
  bucketName: string
): Promise<void> {
  return invoke("delete_bucket", { accountId, bucketName });
}

// File Commands
export async function listObjects(
  accountId: string,
  bucketName: string,
  prefix?: string
): Promise<ObjectInfo[]> {
  return invoke("list_objects", { accountId, bucketName, prefix });
}

export async function deleteObject(
  accountId: string,
  bucketName: string,
  key: string
): Promise<void> {
  return invoke("delete_object", { accountId, bucketName, key });
}

export async function deleteObjects(
  accountId: string,
  bucketName: string,
  keys: string[]
): Promise<void> {
  return invoke("delete_objects", { accountId, bucketName, keys });
}

export async function createFolder(
  accountId: string,
  bucketName: string,
  path: string
): Promise<void> {
  return invoke("create_folder", { accountId, bucketName, path });
}

export async function getPresignedUrl(
  accountId: string,
  bucketName: string,
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  return invoke("get_presigned_url", { accountId, bucketName, key, expiresIn });
}

// Transfer Commands
export async function uploadFile(
  accountId: string,
  bucketName: string,
  key: string,
  filePath: string
): Promise<void> {
  return invoke("upload_file", { accountId, bucketName, key, filePath });
}

export async function downloadFile(
  accountId: string,
  bucketName: string,
  key: string,
  savePath: string
): Promise<void> {
  return invoke("download_file", { accountId, bucketName, key, savePath });
}
