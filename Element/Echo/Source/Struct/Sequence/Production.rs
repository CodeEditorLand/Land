/// Represents a thread-safe queue of actions to be processed.
pub struct Struct {
	/// A thread-safe, mutable queue of actions.
	///
	/// - `Arc` provides shared ownership and thread-safety.
	/// - `Mutex` ensures exclusive access to the queue.
	/// - `VecDeque` is used as an efficient double-ended queue.
	/// - `Box<dyn Action>` allows for dynamic dispatch of different action types.
	Line: Arc<Mutex<VecDeque<Box<dyn Action>>>>,
}

impl Struct {
	/// Creates a new, empty `Struct` instance.
	///
	/// # Returns
	///
	/// A new `Struct` with an empty action queue.
	pub fn New() -> Self {
		Struct { Line: Arc::new(Mutex::new(VecDeque::new())) }
	}

	/// Attempts to retrieve and remove the first action from the queue.
	///
	/// This method is asynchronous and will await the lock on the queue.
	///
	/// # Returns
	///
	/// `Option<Box<dyn Action>>` - The first action in the queue if it exists, or `None` if the queue is empty.
	pub async fn Do(&self) -> Option<Box<dyn Action>> {
		self.Line.lock().await.pop_front()
	}

	/// Adds a new action to the end of the queue.
	///
	/// This method is asynchronous and will await the lock on the queue.
	///
	/// # Arguments
	///
	/// * `Action` - The action to be added to the queue.
	pub async fn Assign(&self, Action: Box<dyn Action>) {
		self.Line.lock().await.push_back(Action);
	}
}

use std::{collections::VecDeque, sync::Arc};

use crate::{Struct::Sequence::Mutex, Trait::Sequence::Action::Trait as Action};
