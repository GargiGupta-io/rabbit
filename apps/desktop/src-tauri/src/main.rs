#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use tauri::Manager;

// Minimal Rust entrypoint placeholder.
// Keep this boundary intentionally small: no wildcard IPC forwarding,
// no blanket permission grants, and typed validation at every command edge.

const MAX_PING_PAYLOAD_LEN: usize = 128;
const FALLBACK_PLATFORM: &str = "macos";
const FALLBACK_DISTRIBUTION_APPLE: &str = "apple";
const FALLBACK_DISTRIBUTION_WINDOWS: &str = "microsoft";
const FALLBACK_DISTRIBUTION_OTHER: &str = "github";

fn sanitize_platform_hint(raw: &str) -> Option<String> {
    let normalized = raw.trim().to_lowercase();
    if normalized.is_empty() {
        return None;
    }

    if normalized.contains("win") {
        return Some("windows".to_string());
    }
    if normalized.contains("mac") || normalized == "apple" || normalized == "darwin" {
        return Some("macos".to_string());
    }
    if normalized.contains("linux") {
        return Some("linux".to_string());
    }
    if normalized == "windows" || normalized == "macos" {
        return Some(normalized);
    }
    None
}

fn resolve_platform_hint() -> String {
    if let Ok(raw) = std::env::var("RABBIT_DESKTOP_PLATFORM") {
        if let Some(hint) = sanitize_platform_hint(&raw) {
            return hint;
        }
    }

    if cfg!(windows) {
        "windows".to_string()
    } else if cfg!(target_os = "macos") {
        "macos".to_string()
    } else if cfg!(target_os = "linux") {
        "linux".to_string()
    } else {
        FALLBACK_PLATFORM.to_string()
    }
}

fn resolve_distribution(platform: &str) -> &'static str {
    if let Ok(raw) = std::env::var("RABBIT_DESKTOP_DISTRIBUTION") {
        let normalized = raw.trim().to_lowercase();
        match normalized.as_str() {
            "apple" => return FALLBACK_DISTRIBUTION_APPLE,
            "microsoft" => return FALLBACK_DISTRIBUTION_WINDOWS,
            "github" => return FALLBACK_DISTRIBUTION_OTHER,
            _ => {}
        }
    }

    match platform {
        "windows" => FALLBACK_DISTRIBUTION_WINDOWS,
        "macos" => FALLBACK_DISTRIBUTION_APPLE,
        _ => FALLBACK_DISTRIBUTION_OTHER
    }
}

fn platform_bootstrap_script(platform: &str, distribution: &str) -> String {
    let safe_platform = platform.replace('\\', "\\\\").replace('\'', "\\'");
    let safe_distribution = distribution.replace('\\', "\\\\").replace('\'', "\\'");
    format!(
        "window.__RABBIT_DESKTOP_PLATFORM = '{}'; window.__RABBIT_DESKTOP_DISTRIBUTION = '{}';",
        safe_platform, safe_distribution
    )
}

fn main() {
  let resolved_platform = resolve_platform_hint();
  let resolved_distribution = resolve_distribution(&resolved_platform);
  let platform_hint_script = platform_bootstrap_script(&resolved_platform, resolved_distribution);

  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![ping])
    .setup(move |app| {
      if let Some(window) = app.get_webview_window("main") {
        window.eval(&platform_hint_script)?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
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
