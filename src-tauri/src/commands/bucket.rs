use crate::r2::client::R2Client;
use crate::r2::types::BucketInfo;
use crate::storage::config::ConfigStore;

#[tauri::command]
pub async fn list_buckets(account_id: String) -> Result<Vec<BucketInfo>, String> {
    let store = ConfigStore::new().map_err(|e| e.to_string())?;
    let account = store
        .get_account(&account_id)
        .map_err(|e| e.to_string())?
        .ok_or("账户不存在")?;

    let client = R2Client::new(
        &account.account_id,
        &account.access_key_id,
        &account.secret_access_key,
    )
    .await
    .map_err(|e| e.to_string())?;

    client.list_buckets().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_bucket(account_id: String, bucket_name: String) -> Result<(), String> {
    let store = ConfigStore::new().map_err(|e| e.to_string())?;
    let account = store
        .get_account(&account_id)
        .map_err(|e| e.to_string())?
        .ok_or("账户不存在")?;

    let client = R2Client::new(
        &account.account_id,
        &account.access_key_id,
        &account.secret_access_key,
    )
    .await
    .map_err(|e| e.to_string())?;

    client
        .create_bucket(&bucket_name)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_bucket(account_id: String, bucket_name: String) -> Result<(), String> {
    let store = ConfigStore::new().map_err(|e| e.to_string())?;
    let account = store
        .get_account(&account_id)
        .map_err(|e| e.to_string())?
        .ok_or("账户不存在")?;

    let client = R2Client::new(
        &account.account_id,
        &account.access_key_id,
        &account.secret_access_key,
    )
    .await
    .map_err(|e| e.to_string())?;

    client
        .delete_bucket(&bucket_name)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_bucket_info(
    account_id: String,
    bucket_name: String,
) -> Result<BucketInfo, String> {
    let store = ConfigStore::new().map_err(|e| e.to_string())?;
    let account = store
        .get_account(&account_id)
        .map_err(|e| e.to_string())?
        .ok_or("账户不存在")?;

    let client = R2Client::new(
        &account.account_id,
        &account.access_key_id,
        &account.secret_access_key,
    )
    .await
    .map_err(|e| e.to_string())?;

    client
        .get_bucket_info(&bucket_name)
        .await
        .map_err(|e| e.to_string())
}
