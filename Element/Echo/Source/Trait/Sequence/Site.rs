/// A trait that defines the behavior for processing actions.
///
/// Types that implement this trait must be able to handle actions asynchronously.
/// The trait is marked with `Send` and `Sync` to ensure thread safety.
#[async_trait::async_trait]
pub trait Trait: Send + Sync {
	/// Processes a given action asynchronously and returns the result.
	///
	/// This method is responsible for receiving an action, processing it
	/// within the given context, and returning the result of the operation.
	///
	/// # Arguments
	///
	/// * `Action` - A boxed trait object representing the action to be processed.
	///              It must implement the `super::Action::Trait`.
	/// * `Context` - A reference to the `Life` context in which the action is executed.
	///
	/// # Returns
	///
	/// Returns a `Result` which is:
	/// - `Ok(())` if the action was processed successfully.
	/// - `Err(ActionError)` if an error occurred during processing.
	///
	/// # Errors
	///
	/// This method can return various error types defined in the
	/// `crate::Enum::Sequence::Action::Error::Enum` enum.
	async fn Receive(
		&self,
		Action: Box<dyn super::Action::Trait>,
		Context: &crate::Struct::Sequence::Life::Struct,
	) -> Result<(), crate::Enum::Sequence::Action::Error::Enum>;
}
