use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use thiserror::Error;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Account {
    pub id: String,
    pub name: String,
    pub account_id: String,
    pub access_key_id: String,
    #[serde(skip_serializing, default)]
    pub secret_access_key: String,
}

#[derive(Debug, Default, Serialize, Deserialize)]
struct Config {
    accounts: Vec<AccountEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct AccountEntry {
    id: String,
    name: String,
    account_id: String,
    access_key_id: String,
    #[serde(default)]
    secret_key_encoded: String,
}

#[derive(Debug, Error)]
pub enum ConfigError {
    #[error("IO 错误: {0}")]
    Io(#[from] std::io::Error),

    #[error("序列化错误: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("配置目录错误")]
    ConfigDir,
}

pub struct ConfigStore {
    config_path: PathBuf,
}

impl ConfigStore {
    pub fn new() -> Result<Self, ConfigError> {
        let config_dir = dirs::config_dir()
            .ok_or(ConfigError::ConfigDir)?
            .join("r2-explorer");

        fs::create_dir_all(&config_dir)?;

        let config_path = config_dir.join("config.json");

        Ok(Self { config_path })
    }

    fn load_config(&self) -> Result<Config, ConfigError> {
        if !self.config_path.exists() {
            return Ok(Config::default());
        }

        let content = fs::read_to_string(&self.config_path)?;
        let config: Config = serde_json::from_str(&content)?;
        Ok(config)
    }

    fn save_config(&self, config: &Config) -> Result<(), ConfigError> {
        let content = serde_json::to_string_pretty(config)?;
        fs::write(&self.config_path, content)?;
        Ok(())
    }

    fn encode_secret(secret: &str) -> String {
        BASE64.encode(secret.as_bytes())
    }

    fn decode_secret(encoded: &str) -> String {
        BASE64
            .decode(encoded)
            .ok()
            .and_then(|bytes| String::from_utf8(bytes).ok())
            .unwrap_or_default()
    }

    pub fn save_account(&self, account: &Account) -> Result<(), ConfigError> {
        let mut config = self.load_config()?;

        let entry = AccountEntry {
            id: account.id.clone(),
            name: account.name.clone(),
            account_id: account.account_id.clone(),
            access_key_id: account.access_key_id.clone(),
            secret_key_encoded: Self::encode_secret(&account.secret_access_key),
        };

        if let Some(existing) = config.accounts.iter_mut().find(|a| a.id == account.id) {
            *existing = entry;
        } else {
            config.accounts.push(entry);
        }

        self.save_config(&config)
    }

    pub fn get_accounts(&self) -> Result<Vec<Account>, ConfigError> {
        let config = self.load_config()?;

        let accounts = config
            .accounts
            .into_iter()
            .map(|entry| Account {
                id: entry.id,
                name: entry.name,
                account_id: entry.account_id,
                access_key_id: entry.access_key_id,
                secret_access_key: Self::decode_secret(&entry.secret_key_encoded),
            })
            .collect();

        Ok(accounts)
    }

    pub fn get_account(&self, id: &str) -> Result<Option<Account>, ConfigError> {
        let accounts = self.get_accounts()?;
        Ok(accounts.into_iter().find(|a| a.id == id))
    }

    pub fn delete_account(&self, id: &str) -> Result<(), ConfigError> {
        let mut config = self.load_config()?;
        config.accounts.retain(|a| a.id != id);
        self.save_config(&config)
    }
}
