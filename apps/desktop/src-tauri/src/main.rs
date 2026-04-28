use serde::{Deserialize, Serialize};

// Minimal Rust entrypoint placeholder.
// Keep this boundary intentionally small: no wildcard IPC forwarding,
// no blanket permission grants, and typed validation at every command edge.

const MAX_PING_PAYLOAD_LEN: usize = 128;

#[cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![ping])
    .run(tauri::generate_context!("../tauri.conf.json"))
    .expect("failed to run desktop app");
}

#[derive(Deserialize)]
struct PingRequest {
  payload: String,
}

#[derive(Serialize)]
struct PingResponse {
  echoed: String,
}

#[tauri::command]
fn ping(request: PingRequest) -> Result<PingResponse, String> {
  let payload = request.payload.trim();
  if payload.is_empty() {
    return Err("payload is required".into());
  }

  if payload.chars().count() > MAX_PING_PAYLOAD_LEN {
    return Err("payload exceeds max length".into());
  }

  Ok(PingResponse {
    echoed: format!("pong:{}", payload),
  })
}
