use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BucketInfo {
    pub name: String,
    pub creation_date: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ObjectInfo {
    pub key: String,
    pub name: String,
    pub size: i64,
    pub last_modified: String,
    pub is_folder: bool,
    pub etag: Option<String>,
}

#[derive(Debug, thiserror::Error)]
pub enum R2Error {
    #[error("AWS SDK 错误: {0}")]
    SdkError(String),

    #[error("凭证错误: {0}")]
    CredentialsError(String),

    #[error("存储桶不存在: {0}")]
    BucketNotFound(String),

    #[error("对象不存在: {0}")]
    ObjectNotFound(String),

    #[error("网络错误: {0}")]
    NetworkError(String),

    #[error("未知错误: {0}")]
    Unknown(String),
}
