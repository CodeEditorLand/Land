/// Trait for asynchronous actions that can be executed and cloned.
///
/// This trait is intended for types that represent actions which can be
/// executed asynchronously and need to be cloneable for use in concurrent
/// contexts.
#[async_trait]
pub trait Trait: Send + Sync {
	/// Executes the action asynchronously.
	///
	/// # Arguments
	///
	/// * `Context` - A reference to the `Life` context in which the action is executed.
	///
	/// # Returns
	///
	/// Returns a `Result` which is `Ok(())` if the action executed successfully,
	/// or an `Error` if the execution failed.
	async fn Execute(&self, Context: &Life) -> Result<(), Error>;

	/// Creates a clone of the action as a trait object.
	///
	/// This method is used to create a boxed clone of the action, allowing
	/// for dynamic dispatch and use in heterogeneous collections.
	///
	/// # Returns
	///
	/// Returns a `Box<dyn Trait>` containing a clone of the action.
	fn Clone(&self) -> Box<dyn Trait>;
}

/// Implementation of the `Trait` for `crate::Struct::Sequence::Action::Struct<T>`.
///
/// This implementation allows any `Struct<T>` that satisfies the bounds
/// to be used as a `Trait` object.
#[async_trait]
impl<T: Send + Sync + Clone + 'static> Trait for crate::Struct::Sequence::Action::Struct<T> {
	async fn Execute(&self, Context: &Life) -> Result<(), Error> {
		// Delegates to the struct's own `Execute` method
		self.Execute(Context).await
	}

	fn Clone(&self) -> Box<dyn Trait> {
		// Creates a new boxed trait object containing a clone of self
		Box::new(self.clone())
	}
}

use async_trait::async_trait;

use crate::{Enum::Sequence::Action::Error::Enum as Error, Struct::Sequence::Life::Struct as Life};
