use std::fs;
use std::path::PathBuf;
use std::{env, sync::Mutex};

use futures::StreamExt;
use git2::Repository;
use nucleo_matcher::{
    pattern::{CaseMatching, Normalization, Pattern},
    Config, Matcher,
};
use reqwest::Error;
use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::{ipc::Channel, Manager, State};
use walkdir::{DirEntry, WalkDir};

mod types;
use types::ResponseMessage;

struct AppData {
    openrouter_api_key: String,
    openrouter_api_url: String,
    project_dir: String,
}

#[tauri::command]
fn set_project_dir(path: String, state: State<'_, Mutex<AppData>>) {
    let mut state = state.lock().unwrap();
    state.project_dir = path;
    println!("Set project dir to: {}", state.project_dir);
}

#[tauri::command]
fn get_project_dir(path: Option<String>) -> String {
    let target_path = match path {
        Some(p) => p,
        None => env::current_dir()
            .map(|path| path.to_string_lossy().into_owned())
            .unwrap_or_else(|_| "Unknown".to_string()),
    };
    println!("Target path: {}", target_path.to_string());
    match Repository::discover(&target_path) {
        Ok(repo) => match repo.workdir() {
            Some(workdir) => match workdir.to_str() {
                Some(wd_path) => {
                    println!("Git dir: {}", wd_path);
                    wd_path.to_string()
                }
                None => {
                    eprintln!("Failed to convert workdir to string");
                    "Unknown".to_string()
                }
            },
            None => {
                eprintln!("Failed to convert repo path to string");
                "Unknown".to_string()
            }
        },
        Err(_) => "Unknown".to_string(),
    }
}

fn is_ignored(entry: &DirEntry) -> bool {
    let name = entry.file_name().to_string_lossy();

    if entry.file_type().is_dir()
        && (name == "target" || name == "node_modules" || name == ".git" || name == ".venv")
    {
        return false;
    }

    true
}

#[tauri::command]
fn fuzzy_search(search_term: String, state: State<'_, Mutex<AppData>>) -> Vec<String> {
    println!("search term: {}", search_term);

    let cwd = &state.lock().unwrap().project_dir;

    let paths: Vec<String> = WalkDir::new(cwd)
        .into_iter()
        .filter_entry(is_ignored)
        .filter_map(|e| e.ok())
        .map(|p| {
            p.path()
                .strip_prefix(&cwd)
                .unwrap_or(p.path())
                .to_path_buf()
        })
        .collect::<Vec<PathBuf>>()
        .iter()
        .map(|p| p.to_string_lossy().into_owned())
        .filter(|p| !p.is_empty())
        .collect();

    let mut matcher = Matcher::new(Config::DEFAULT.match_paths());
    matcher.config.prefer_prefix = true;

    let results = Pattern::parse(&search_term, CaseMatching::Ignore, Normalization::Smart)
        .match_list(paths, &mut matcher);

    println!("results: {:?}", results);

    results.into_iter().map(|(p, _s)| p).collect()
}

#[tauri::command]
async fn run_agent(
    mut messages: Vec<ResponseMessage>,
    on_event: Channel<StreamEvent>,
    state: State<'_, Mutex<AppData>>,
) -> Result<(), String> {
    let cwd = state.lock().unwrap().project_dir.clone();
    let openrouter_api_url = state.lock().unwrap().openrouter_api_url.clone();
    let openrouter_api_key = state.lock().unwrap().openrouter_api_key.clone();

    //     let client = reqwest::Client::new();

    //     let payload = ChatCompletionRequest {
    //         // model: "google/gemini-2.5-flash-lite-preview-06-17".to_string(),
    //         model: "anthropic/claude-sonnet-4".to_string(),
    //         messages: messages.clone(),
    //         stream: false,
    //         temperature: 0.0,
    //         usage: Some(Usage { include: false }),
    //         tools: json!([
    //             {
    //                 "type": "function",
    //                 "function": {
    //                     "name": "read_file",
    //                     "description":
    //                     "Read a **text** file in the current workspace and return its complete UTF-8 contents as a string.",
    //                     "parameters": {
    //                     "type": "object",
    //                     "properties": {
    //                         "path": {
    //                         "type": "string",
    //                         "description":
    //                             "Relative path from the project root to the file to read (e.g. \"src/index.ts\"). Must stay inside the workspace.",
    //                         },
    //                     },
    //                     "required": ["path"],
    //                     },
    //                 },
    //             }
    //         ]),
    //     };

    //     let res = client
    //         .post(OPENROUTER_CHAT_URL)
    //         .header("Authorization", format!("Bearer {}", openrouter_api_key))
    //         .header("Content-Type", "application/json")
    //         .json(&payload)
    //         .send()
    //         .await
    //         .map_err(|err| format!("Request error: {}", err))?;

    //     let completion = res.json::<ChatCompletionResponse>().await;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let openrouter_api_key = env::var("OPENROUTER_API_KEY").expect("OPENROUTER_API_KEY is not set");

    tauri::Builder::default()
        .setup(|app| {
            app.manage(Mutex::new(AppData {
                project_dir: get_project_dir(None),
                openrouter_api_key: openrouter_api_key,
                openrouter_api_url: "https://openrouter.ai/api/v1/chat/completions".to_string(),
            }));
            Ok(())
        })
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            set_project_dir,
            get_project_dir,
            run_agent,
            fuzzy_search
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
