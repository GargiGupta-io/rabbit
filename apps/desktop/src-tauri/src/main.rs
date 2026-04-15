// Minimal Rust entrypoint placeholder.
// When you install the real Tauri toolchain, this command bridge is where
// secure privileged operations begin.

#[cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![ping])
    .run(tauri::generate_context!("../tauri.conf.json"))
    .expect("failed to run desktop app");
}

#[tauri::command]
fn ping(payload: String) -> String {
  format!("pong:{}", payload)
}
