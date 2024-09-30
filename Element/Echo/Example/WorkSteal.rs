#![allow(non_snake_case)]

// Define a worker-stealing queue
struct WorkerStealingQueue {
	Queues: Vec<Arc<Mutex<Vec<Box<dyn Echo::Trait::Sequence::Action::Trait>>>>>,
}

impl WorkerStealingQueue {
	fn New(Force: usize) -> Self {
		WorkerStealingQueue {
			Queues: (0..Force).map(|_| Arc::new(Mutex::new(Vec::new()))).collect(),
		}
	}

	async fn Assign(
		&self,
		Identifier: usize,
		Action: Box<dyn Echo::Trait::Sequence::Action::Trait>,
	) {
		self.Queues[Identifier].lock().await.push(Action);
	}

	async fn Do(&self, Worker: usize) -> Option<Box<dyn Echo::Trait::Sequence::Action::Trait>> {
		let mut Queue = self.Queues[Worker].lock().await;

		if let Some(Action) = Queue.pop() {
			Some(Action)
		} else {
			// Try to steal from other queues
			drop(Queue);

			let mut QueuesOther: Vec<usize> =
				(0..self.Queues.len()).filter(|&i| i != Worker).collect();

			QueuesOther.shuffle(&mut rand::thread_rng());

			for IdOther in QueuesOther {
				let mut QueueOther = self.Queues[IdOther].lock().await;

				if let Some(Action) = QueueOther.pop() {
					return Some(Action);
				}
			}

			None
		}
	}
}

// Define a worker that implements the Worker trait
struct StealingWorker {
	Id: usize,
	Queue: Arc<WorkerStealingQueue>,
}

#[async_trait]
impl Worker for StealingWorker {
	async fn Receive(
		&self,
		Action: Box<dyn Echo::Trait::Sequence::Action::Trait>,
		Context: &Life,
	) -> Result<(), Error> {
		self.Queue.Assign(self.Id, Action).await;

		Ok(())
	}
}

async fn worker_loop(Worker: Arc<StealingWorker>, Life: Arc<Life>, Running: Arc<Mutex<bool>>) {
	while *Running.lock().await {
		if let Some(Action) = Worker.Queue.Do(Worker.Id).await {
			if let Err(_Error) = Action.Execute(&Life).await {
				eprintln!("Error executing action: {:?}", _Error);
			}
		} else {
			sleep(Duration::from_millis(10)).await;
		}
	}
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
	// Create a plan with file reading and writing actions
	let Plan = Arc::new(
		Echo::Struct::Sequence::Plan::Struct::New()
			.WithSignature(Signature { Name: "Read".to_string() })
			.WithSignature(Signature { Name: "Write".to_string() })
			.WithFunction("Read", Common::Read::Fn)?
			.WithFunction("Write", Common::Write::Fn)?
			.Build(),
	);

	// Create a worker-stealing queue
	let Force = 4;

	let Queue = Arc::new(WorkerStealingQueue::New(Force));

	// Create a life context
	let Life = Arc::new(Life {
		Span: Arc::new(dashmap::DashMap::new()),
		Fate: Arc::new(config::Config::default()),
		Cache: Arc::new(tokio::sync::Mutex::new(dashmap::DashMap::new())),
		Karma: Arc::new(dashmap::DashMap::new()),
	});

	// Create workers
	let Workers: Vec<Arc<StealingWorker>> =
		(0..Force).map(|Id| Arc::new(StealingWorker { Id, Queue: Queue.clone() })).collect();

	// Create a flag to control worker loops
	let Running = Arc::new(Mutex::new(true));

	// Spawn worker tasks
	let Handles: Vec<_> = Workers
		.iter()
		.map(|Worker| {
			let Worker = Worker.clone();

			let Life = Life.clone();

			let Running = Running.clone();

			tokio::spawn(async move {
				worker_loop(Worker, Life, Running).await;
			})
		})
		.collect();

	// Add actions to the queue
	Action::New("Write", json!([format!("output.txt"), "Hello, World!"]), Plan.clone());

	for i in 0..4 {
		let Action = if i % 2 == 0 {
		} else {
			Action::New("Read", json!(["input.txt"]), Plan.clone())
		};
	}

	Queue.Assign(i % Force, Box::new(Action)).await;

	// Wait for a moment to allow actions to complete
	sleep(Duration::from_secs(10)).await;

	// Signal workers to stop
	*Running.lock().await = false;

	// Wait for all worker tasks to complete
	for Handle in Handles {
		Handle.await?;
	}

	println!("All workers completed");

	Ok(())
}

use async_trait::async_trait;
use rand::seq::SliceRandom;
use serde_json::{json, Value};
use std::sync::Arc;
use tokio::{
	fs::{File, OpenOptions},
	io::{AsyncReadExt, AsyncWriteExt},
	sync::Mutex,
	time::{sleep, Duration},
};

use Echo::{
	Enum::Sequence::Action::Error::Enum as Error,
	Struct::Sequence::{
		Action::{Signature::Struct as Signature, Struct as Action},
		Arc,
		Life::Struct as Life,
	},
	Trait::Sequence::Site::Trait as Worker,
};

pub mod Common;
