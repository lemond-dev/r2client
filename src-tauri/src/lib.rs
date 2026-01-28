mod commands;
mod r2;
mod storage;

use commands::{bucket, file, transfer};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            // Bucket commands
            bucket::list_buckets,
            bucket::create_bucket,
            bucket::delete_bucket,
            bucket::get_bucket_info,
            // File commands
            file::list_objects,
            file::delete_object,
            file::delete_objects,
            file::create_folder,
            file::get_presigned_url,
            // Transfer commands
            transfer::upload_file,
            transfer::download_file,
            // Account commands
            commands::account::save_account,
            commands::account::get_accounts,
            commands::account::delete_account,
            commands::account::validate_credentials,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
