use crate::r2::client::R2Client;
use crate::storage::config::ConfigStore;
use std::path::Path;
use tokio::fs::File;
use tokio::io::AsyncReadExt;

#[tauri::command]
pub async fn upload_file(
    account_id: String,
    bucket_name: String,
    key: String,
    file_path: String,
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

    // Read file content
    let path = Path::new(&file_path);
    let mut file = File::open(path)
        .await
        .map_err(|e| format!("无法打开文件: {}", e))?;

    let mut contents = Vec::new();
    file.read_to_end(&mut contents)
        .await
        .map_err(|e| format!("无法读取文件: {}", e))?;

    client
        .put_object(&bucket_name, &key, contents)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn download_file(
    account_id: String,
    bucket_name: String,
    key: String,
    save_path: String,
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

    let data = client
        .get_object(&bucket_name, &key)
        .await
        .map_err(|e| e.to_string())?;

    tokio::fs::write(&save_path, data)
        .await
        .map_err(|e| format!("无法保存文件: {}", e))
}
