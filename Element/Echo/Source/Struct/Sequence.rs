/// Represents a sequence structure that manages actions and their execution.
#[derive(Clone)]
pub struct Struct {
	/// The site responsible for processing actions.
	pub Site: Arc<dyn Site>,

	/// The production line containing actions to be executed.
	pub Production: Arc<Production::Struct>,

	/// The context for the sequence execution.
	pub Life: Life::Struct,

	/// A signal indicating whether the sequence should continue running.
	pub Time: Signal::Struct<bool>,
}

impl Struct {
	/// Creates a new `Struct` instance.
	///
	/// # Arguments
	///
	/// * `Site` - The worker responsible for processing actions.
	/// * `Production` - The production line containing actions to be executed.
	/// * `Context` - The context for the sequence execution.
	///
	/// # Returns
	///
	/// A new `Struct` instance with the `Time` signal initialized to `false`.
	pub fn New(
		Site: Arc<dyn Site>,
		Production: Arc<Production::Struct>,
		Life: Life::Struct,
	) -> Self {
		Struct { Site, Production, Life, Time: Signal::Struct::New(false) }
	}

	/// Runs the sequence, processing actions until the `Time` signal is set to true.
	///
	/// This method continuously checks for new actions in the `Work` queue and processes them.
	/// If an error occurs during processing, it logs the error.
	pub async fn Run(&self) {
		while !self.Time.Get().await {
			if let Some(Action) = self.Production.Do().await {
				match self.Again(Action).await {
					Ok(_) => {}
					Err(e) => error!("Error processing action: {}", e),
				}
			} else {
				// Add a small delay to prevent tight looping when there are no actions
				sleep(std::time::Duration::from_millis(100)).await;
			}
		}
	}

	/// Attempts to execute an action with retry logic.
	///
	/// # Arguments
	///
	/// * `Action` - The action to be executed.
	///
	/// # Returns
	///
	/// A `Result` indicating success or failure of the action execution.
	///
	/// This method will retry the action execution up to a maximum number of times
	/// (defined by `End` in `Life.Fate`) with exponential backoff and jitter.
	async fn Again(
		&self,
		Action: Box<dyn crate::Trait::Sequence::Action::Trait>,
	) -> Result<(), crate::Enum::Sequence::Action::Error::Enum> {
		let End = self.Life.Fate.get_int("End").unwrap_or(3) as u32;

		let mut Attempt = 0;

		loop {
			match self.Site.Receive(Action.Clone(), &self.Life).await {
				Ok(_) => return Ok(()),
				Err(e) => {
					Attempt += 1;

					if Attempt >= End {
						return Err(e);
					}

					let Again = Duration::from_secs(
						2u64.pow(Attempt) + rand::thread_rng().gen_range(0..1000),
					);

					warn!("Action failed, retrying in {:?}. Attempt {} of {}", Again, Attempt, End);

					sleep(Again).await;
				}
			}
		}

		// unreachable!("Loop should have returned or errored")
	}

	/// Signals the sequence to shut down by setting the `Time` signal to true.
	pub async fn Shutdown(&self) {
		self.Time.Set(true).await;
	}
}

use log::{error, warn};
use rand::Rng;
use std::time::Duration;
use tokio::time::sleep;

pub use std::sync::Arc;
pub use tokio::sync::Mutex;

pub mod Action;
pub mod Life;
pub mod Plan;
pub mod Production;
pub mod Signal;
pub mod Vector;

use crate::Trait::Sequence::Site::Trait as Site;
