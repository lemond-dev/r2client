use crate::r2::client::R2Client;
use crate::storage::config::{Account, ConfigStore};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AccountInfo {
    pub id: String,
    pub name: String,
    pub account_id: String,
}

#[tauri::command]
pub async fn save_account(
    id: String,
    name: String,
    account_id: String,
    access_key_id: String,
    secret_access_key: String,
) -> Result<(), String> {
    let store = ConfigStore::new().map_err(|e| e.to_string())?;

    let account = Account {
        id,
        name,
        account_id,
        access_key_id,
        secret_access_key,
    };

    store.save_account(&account).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_accounts() -> Result<Vec<AccountInfo>, String> {
    let store = ConfigStore::new().map_err(|e| e.to_string())?;
    let accounts = store.get_accounts().map_err(|e| e.to_string())?;

    Ok(accounts
        .into_iter()
        .map(|a| AccountInfo {
            id: a.id,
            name: a.name,
            account_id: a.account_id,
        })
        .collect())
}

#[tauri::command]
pub async fn delete_account(id: String) -> Result<(), String> {
    let store = ConfigStore::new().map_err(|e| e.to_string())?;
    store.delete_account(&id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn validate_credentials(
    account_id: String,
    access_key_id: String,
    secret_access_key: String,
) -> Result<bool, String> {
    let client = R2Client::new(&account_id, &access_key_id, &secret_access_key)
        .await
        .map_err(|e| e.to_string())?;

    // Try to list buckets to validate credentials
    match client.list_buckets().await {
        Ok(_) => Ok(true),
        Err(e) => Err(format!("凭证验证失败: {}", e)),
    }
}
