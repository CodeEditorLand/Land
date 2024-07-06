#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![allow(non_snake_case)]

use async_trait::async_trait;
use futures::{future::join_all, SinkExt, StreamExt};
use std::sync::Arc;
use tauri::Manager;
use tokio::{
	net::TcpStream,
	sync::{mpsc, Mutex},
};
use tokio_tungstenite::{connect_async, tungstenite::protocol::Message, MaybeTlsStream};

#[async_trait]
trait Worker: Send + Sync {
	async fn Receive(&self, Action: String) -> Result<String, String>;
}

struct FileOpWorker {
	Stream: Arc<Mutex<tokio_tungstenite::WebSocketStream<MaybeTlsStream<TcpStream>>>>,
}

#[async_trait]
impl Worker for FileOpWorker {
	async fn Receive(&self, Task: String) -> Result<String, String> {
		let mut Stream = self.Stream.lock().await;

		Stream.send(Message::Text(Task)).await.map_err(|Error| Error.to_string())?;

		if let Some(Response) = Stream.next().await {
			match Response {
				Ok(Message::Text(Text)) => Ok(Text),
				_ => Err("Cannot Response.".to_string()),
			}
		} else {
			Err("Cannot Response.".to_string())
		}
	}
}

struct Work {
	Queue: Arc<Mutex<Vec<String>>>,
}

impl Work {
	fn new() -> Self {
		Work { Queue: Arc::new(Mutex::new(Vec::new())) }
	}

	async fn Assign(&self, Task: String) {
		self.Queue.lock().await.push(Task);
	}

	async fn Execute(&self) -> Option<String> {
		self.Queue.lock().await.pop()
	}
}

#[tauri::command]
async fn Put(
	Path: String,
	Content: String,
	State: tauri::State<'_, Arc<Work>>,
) -> Result<(), String> {
	State
		.Assign(
			serde_json::json!({
				"Action": "Put",
				"Path": Path,
				"Content": Content,
			})
			.to_string(),
		)
		.await;

	Ok(())
}

#[tauri::command]
async fn Get(Path: String, State: tauri::State<'_, Arc<Work>>) -> Result<(), String> {
	State
		.Assign(
			serde_json::json!({
				"Action": "Get",
				"Path": Path,
			})
			.to_string(),
		)
		.await;
	Ok(())
}

async fn Job(Worker: Arc<dyn Worker>, Work: Arc<Work>, Approval: mpsc::Sender<String>) {
	loop {
		if let Some(Task) = Work.Execute().await {
			match Worker.Receive(Task).await {
				Ok(Result) => {
					if Approval.send(Result).await.is_err() {
						break;
					}
				}

				Err(Error) => eprintln!("Cannot Receive: {}", Error),
			}
		} else {
			tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
		}
	}
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
#[allow(dead_code)]
#[tokio::main]
async fn main() {
	let Stream = Arc::new(Mutex::new(
		connect_async("ws://localhost:9999").await.expect("Cannot connect_async.").0,
	));

	let Work = Arc::new(Work::new());
	let (Approval, mut Receipt) = mpsc::channel(100);

	// @TODO: Auto-calc number of workers in the force
	let Force: Vec<_> = (0..4)
		.map(|_| {
			tokio::spawn(Job(
				Arc::new(FileOpWorker { Stream: Stream.clone() }) as Arc<dyn Worker>,
				Work.clone(),
				Approval.clone(),
			))
		})
		.collect();

	// @TODO: FIX THIS
	// #[cfg(debug_assertions)]
	// Builder.plugin(tauri_plugin_devtools::init());

	tauri::Builder::default()
		.setup(|app| {
			let Handle = app.handle().clone();

			tokio::spawn(async move {
				while let Some(result) = Receipt.recv().await {
					// @TODO: Rewrite the Emit to only emit to a specific webview which then talks to the others
					Handle.emit("file_operation_result", result).unwrap();
				}
			});

			Ok(())
		})
		.manage(Work)
		.invoke_handler(tauri::generate_handler![Put, Get])
		.plugin(tauri_plugin_shell::init())
		.run(tauri::generate_context!())
		.expect("Cannot Library.");

	join_all(Force).await;
}
