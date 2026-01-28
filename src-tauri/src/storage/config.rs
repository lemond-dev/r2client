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
    #[serde(skip_serializing)]
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
}

#[derive(Debug, Error)]
pub enum ConfigError {
    #[error("IO 错误: {0}")]
    Io(#[from] std::io::Error),

    #[error("序列化错误: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("密钥存储错误: {0}")]
    Keyring(String),

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

    fn get_secret(&self, account_id: &str) -> Result<String, ConfigError> {
        let entry = keyring::Entry::new("r2-explorer", account_id)
            .map_err(|e| ConfigError::Keyring(e.to_string()))?;

        entry
            .get_password()
            .map_err(|e| ConfigError::Keyring(e.to_string()))
    }

    fn set_secret(&self, account_id: &str, secret: &str) -> Result<(), ConfigError> {
        let entry = keyring::Entry::new("r2-explorer", account_id)
            .map_err(|e| ConfigError::Keyring(e.to_string()))?;

        entry
            .set_password(secret)
            .map_err(|e| ConfigError::Keyring(e.to_string()))
    }

    fn delete_secret(&self, account_id: &str) -> Result<(), ConfigError> {
        let entry = keyring::Entry::new("r2-explorer", account_id)
            .map_err(|e| ConfigError::Keyring(e.to_string()))?;

        // Ignore error if secret doesn't exist
        let _ = entry.delete_credential();
        Ok(())
    }

    pub fn save_account(&self, account: &Account) -> Result<(), ConfigError> {
        let mut config = self.load_config()?;

        // Store secret in system keyring
        self.set_secret(&account.id, &account.secret_access_key)?;

        // Update or add account entry
        let entry = AccountEntry {
            id: account.id.clone(),
            name: account.name.clone(),
            account_id: account.account_id.clone(),
            access_key_id: account.access_key_id.clone(),
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

        let mut accounts = Vec::new();
        for entry in config.accounts {
            let secret = self.get_secret(&entry.id).unwrap_or_default();
            accounts.push(Account {
                id: entry.id,
                name: entry.name,
                account_id: entry.account_id,
                access_key_id: entry.access_key_id,
                secret_access_key: secret,
            });
        }

        Ok(accounts)
    }

    pub fn get_account(&self, id: &str) -> Result<Option<Account>, ConfigError> {
        let accounts = self.get_accounts()?;
        Ok(accounts.into_iter().find(|a| a.id == id))
    }

    pub fn delete_account(&self, id: &str) -> Result<(), ConfigError> {
        let mut config = self.load_config()?;

        // Delete secret from keyring
        self.delete_secret(id)?;

        // Remove from config
        config.accounts.retain(|a| a.id != id);

        self.save_config(&config)
    }
}
