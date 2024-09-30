/// A thread-safe wrapper around a value of type `T`.
///
/// This struct provides a way to share and mutate data across multiple threads safely.
/// It uses an `Arc` (Atomically Reference Counted) wrapper around a `Mutex` to achieve this.
#[derive(Clone, Debug)]
pub struct Struct<T>(Arc<Mutex<T>>);

impl<T> Struct<T> {
	/// Creates a new `Struct` instance with the given value.
	///
	/// # Arguments
	///
	/// * `Value` - The initial value to be stored in the `Struct`.
	///
	/// # Returns
	///
	/// A new `Struct` instance containing the provided value.
	pub fn New(Value: T) -> Self {
		Struct(Arc::new(Mutex::new(Value)))
	}

	/// Retrieves a clone of the stored value.
	///
	/// This method acquires the mutex lock and returns a clone of the stored value.
	///
	/// # Returns
	///
	/// A clone of the stored value.
	///
	/// # Type Constraints
	///
	/// The type `T` must implement the `Clone` trait.
	pub async fn Get(&self) -> T
	where
		T: Clone,
	{
		self.0.lock().await.clone()
	}

	/// Sets a new value for the stored data.
	///
	/// This method acquires the mutex lock and replaces the stored value with the provided one.
	///
	/// # Arguments
	///
	/// * `To` - The new value to be stored.
	pub async fn Set(&self, To: T) {
		*self.0.lock().await = To;
	}
}

use crate::Struct::Sequence::{Arc, Mutex};
