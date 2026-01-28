use super::types::{BucketInfo, ObjectInfo, R2Error};
use aws_credential_types::Credentials;
use aws_sdk_s3::{
    config::{Builder, Region},
    primitives::ByteStream,
    Client,
};
use std::time::Duration;

pub struct R2Client {
    client: Client,
    #[allow(dead_code)]
    account_id: String,
}

impl R2Client {
    pub async fn new(
        account_id: &str,
        access_key_id: &str,
        secret_access_key: &str,
    ) -> Result<Self, R2Error> {
        let endpoint = format!("https://{}.r2.cloudflarestorage.com", account_id);

        let credentials = Credentials::new(
            access_key_id,
            secret_access_key,
            None,
            None,
            "r2-explorer",
        );

        let config = Builder::new()
            .endpoint_url(&endpoint)
            .credentials_provider(credentials)
            .region(Region::new("auto"))
            .force_path_style(true)
            .build();

        let client = Client::from_conf(config);

        Ok(Self {
            client,
            account_id: account_id.to_string(),
        })
    }

    pub async fn list_buckets(&self) -> Result<Vec<BucketInfo>, R2Error> {
        let response = self
            .client
            .list_buckets()
            .send()
            .await
            .map_err(|e| R2Error::SdkError(e.to_string()))?;

        let buckets = response
            .buckets()
            .iter()
            .map(|b| BucketInfo {
                name: b.name().unwrap_or_default().to_string(),
                creation_date: b.creation_date().map(|d| d.to_string()),
            })
            .collect();

        Ok(buckets)
    }

    pub async fn create_bucket(&self, bucket_name: &str) -> Result<(), R2Error> {
        self.client
            .create_bucket()
            .bucket(bucket_name)
            .send()
            .await
            .map_err(|e| R2Error::SdkError(e.to_string()))?;

        Ok(())
    }

    pub async fn delete_bucket(&self, bucket_name: &str) -> Result<(), R2Error> {
        self.client
            .delete_bucket()
            .bucket(bucket_name)
            .send()
            .await
            .map_err(|e| R2Error::SdkError(e.to_string()))?;

        Ok(())
    }

    pub async fn get_bucket_info(&self, bucket_name: &str) -> Result<BucketInfo, R2Error> {
        // Check if bucket exists by trying to get location
        self.client
            .head_bucket()
            .bucket(bucket_name)
            .send()
            .await
            .map_err(|e| R2Error::BucketNotFound(e.to_string()))?;

        Ok(BucketInfo {
            name: bucket_name.to_string(),
            creation_date: None,
        })
    }

    pub async fn list_objects(
        &self,
        bucket_name: &str,
        prefix: Option<&str>,
    ) -> Result<Vec<ObjectInfo>, R2Error> {
        let mut request = self.client.list_objects_v2().bucket(bucket_name).delimiter("/");

        if let Some(p) = prefix {
            if !p.is_empty() {
                request = request.prefix(if p.ends_with('/') { p.to_string() } else { format!("{}/", p) });
            }
        }

        let response = request
            .send()
            .await
            .map_err(|e| R2Error::SdkError(e.to_string()))?;

        let mut objects = Vec::new();

        // Add folders (common prefixes)
        if let Some(prefixes) = response.common_prefixes() {
            for prefix in prefixes {
                if let Some(p) = prefix.prefix() {
                    let name = p
                        .trim_end_matches('/')
                        .rsplit('/')
                        .next()
                        .unwrap_or(p)
                        .to_string();

                    objects.push(ObjectInfo {
                        key: p.to_string(),
                        name,
                        size: 0,
                        last_modified: String::new(),
                        is_folder: true,
                        etag: None,
                    });
                }
            }
        }

        // Add files
        for object in response.contents() {
            let key = object.key().unwrap_or_default();

            // Skip if this is a folder marker (ends with /)
            if key.ends_with('/') {
                continue;
            }

            let name = key.rsplit('/').next().unwrap_or(key).to_string();

            objects.push(ObjectInfo {
                key: key.to_string(),
                name,
                size: object.size().unwrap_or(0),
                last_modified: object
                    .last_modified()
                    .map(|d| d.to_string())
                    .unwrap_or_default(),
                is_folder: false,
                etag: object.e_tag().map(|s| s.to_string()),
            });
        }

        Ok(objects)
    }

    pub async fn put_object(
        &self,
        bucket_name: &str,
        key: &str,
        data: Vec<u8>,
    ) -> Result<(), R2Error> {
        self.client
            .put_object()
            .bucket(bucket_name)
            .key(key)
            .body(ByteStream::from(data))
            .send()
            .await
            .map_err(|e| R2Error::SdkError(e.to_string()))?;

        Ok(())
    }

    pub async fn get_object(&self, bucket_name: &str, key: &str) -> Result<Vec<u8>, R2Error> {
        let response = self
            .client
            .get_object()
            .bucket(bucket_name)
            .key(key)
            .send()
            .await
            .map_err(|e| R2Error::SdkError(e.to_string()))?;

        let data = response
            .body
            .collect()
            .await
            .map_err(|e| R2Error::SdkError(e.to_string()))?
            .into_bytes()
            .to_vec();

        Ok(data)
    }

    pub async fn delete_object(&self, bucket_name: &str, key: &str) -> Result<(), R2Error> {
        self.client
            .delete_object()
            .bucket(bucket_name)
            .key(key)
            .send()
            .await
            .map_err(|e| R2Error::SdkError(e.to_string()))?;

        Ok(())
    }

    pub async fn delete_objects(&self, bucket_name: &str, keys: &[String]) -> Result<(), R2Error> {
        use aws_sdk_s3::types::{Delete, ObjectIdentifier};

        let objects: Vec<ObjectIdentifier> = keys
            .iter()
            .filter_map(|k| ObjectIdentifier::builder().key(k).build().ok())
            .collect();

        if objects.is_empty() {
            return Ok(());
        }

        let delete = Delete::builder()
            .set_objects(Some(objects))
            .build()
            .map_err(|e| R2Error::SdkError(e.to_string()))?;

        self.client
            .delete_objects()
            .bucket(bucket_name)
            .delete(delete)
            .send()
            .await
            .map_err(|e| R2Error::SdkError(e.to_string()))?;

        Ok(())
    }

    pub async fn get_presigned_url(
        &self,
        bucket_name: &str,
        key: &str,
        expires_in: u64,
    ) -> Result<String, R2Error> {
        let presigning_config = aws_sdk_s3::presigning::PresigningConfig::builder()
            .expires_in(Duration::from_secs(expires_in))
            .build()
            .map_err(|e| R2Error::SdkError(e.to_string()))?;

        let presigned = self
            .client
            .get_object()
            .bucket(bucket_name)
            .key(key)
            .presigned(presigning_config)
            .await
            .map_err(|e| R2Error::SdkError(e.to_string()))?;

        Ok(presigned.uri().to_string())
    }
}
