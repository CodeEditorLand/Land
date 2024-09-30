#![allow(non_snake_case)]

// Define a simple site that implements the Site trait
struct SimpleSite;

#[async_trait::async_trait]
impl Site for SimpleSite {
	async fn Receive(
		&self,
		Action: Box<dyn Echo::Trait::Sequence::Action::Trait>,
		Context: &Life,
	) -> Result<(), Error> {
		Action.Execute(Context).await
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

	// Create a production line
	let Production = Arc::new(Echo::Struct::Sequence::Production::Struct::New());

	// Create a life context
	let Life = Life {
		Span: Arc::new(DashMap::new()),
		Fate: Arc::new(config::Config::default()),
		Cache: Arc::new(tokio::sync::Mutex::new(DashMap::new())),
		Karma: Arc::new(DashMap::new()),
	};

	// Create a site
	let Site = Arc::new(SimpleSite);

	// Create a sequence
	let Sequence = Echo::Struct::Sequence::Struct::New(Site, Production.clone(), Life);

	// Add actions to the production line
	// Create actions for reading and writing files
	Production
		.Assign(Box::new(Common::New("Read", json!(["input.txt"]), Plan.clone()).clone()))
		.await;

	Production
		.Assign(Box::new(
			Common::New("Write", json!(["output.txt", "Hello, World!"]), Plan.clone()).clone(),
		))
		.await;

	let CloneSequence = Sequence.clone();

	// Run the sequence
	tokio::spawn(async move {
		// TODO: thread 'tokio-runtime-worker' has overflowed its stack
		// CloneSequence.Run().await;
	});

	// Wait for a moment to allow actions to complete
	tokio::time::sleep(std::time::Duration::from_secs(10)).await;

	// Shutdown the sequence
	Sequence.Shutdown().await;

	println!("Sequence completed");

	Ok(())
}

use dashmap::DashMap;
use serde_json::{json, Value};
use tokio::{
	fs::{File, OpenOptions},
	io::{AsyncReadExt, AsyncWriteExt},
};

use Echo::{
	Enum::Sequence::Action::Error::Enum as Error,
	Struct::Sequence::{
		Action::{Signature::Struct as Signature, Struct as Action},
		Arc,
		Life::Struct as Life,
	},
	Trait::Sequence::Site::Trait as Site,
};

pub mod Common;
