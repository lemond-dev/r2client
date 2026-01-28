use crate::r2::client::R2Client;
use crate::r2::types::ObjectInfo;
use crate::storage::config::ConfigStore;

#[tauri::command]
pub async fn list_objects(
    account_id: String,
    bucket_name: String,
    prefix: Option<String>,
) -> Result<Vec<ObjectInfo>, String> {
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
        .list_objects(&bucket_name, prefix.as_deref())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_object(
    account_id: String,
    bucket_name: String,
    key: String,
) -> Result<(), String> {
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
        .delete_object(&bucket_name, &key)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_objects(
    account_id: String,
    bucket_name: String,
    keys: Vec<String>,
) -> Result<(), String> {
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
        .delete_objects(&bucket_name, &keys)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_folder(
    account_id: String,
    bucket_name: String,
    path: String,
) -> Result<(), String> {
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

    // Create folder by uploading an empty object with trailing slash
    let folder_key = if path.ends_with('/') {
        path
    } else {
        format!("{}/", path)
    };

    client
        .put_object(&bucket_name, &folder_key, vec![])
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_presigned_url(
    account_id: String,
    bucket_name: String,
    key: String,
    expires_in: u64,
) -> Result<String, String> {
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
        .get_presigned_url(&bucket_name, &key, expires_in)
        .await
        .map_err(|e| e.to_string())
}
