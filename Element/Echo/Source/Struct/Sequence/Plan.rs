/// Represents a plan for a sequence of actions.
pub struct Struct {
	/// The formal structure of the plan, containing signatures and functions.
	Formality: Formality::Struct,
}

impl Struct {
	/// Creates a new instance of the Plan.
	///
	/// # Returns
	/// A new `Struct` instance with an empty `Formality`.
	pub fn New() -> Self {
		Self { Formality: Formality::Struct::New() }
	}

	// TODO: Combine / shorten WithX to Provision(Signature | Action)

	/// Adds a signature to the plan.
	///
	/// # Arguments
	/// * `Signature` - The action signature to add to the plan.
	///
	/// # Returns
	/// The modified `Struct` instance, allowing for method chaining.
	pub fn WithSignature(
		mut self,
		Signature: crate::Struct::Sequence::Action::Signature::Struct,
	) -> Self {
		self.Formality.Sign(Signature);

		self
	}

	/// Adds a function to the plan.
	///
	/// # Arguments
	/// * `Name` - The name of the function.
	/// * `Function` - The function to add.
	///
	/// # Type Parameters
	/// * `F` - The type of the function.
	/// * `Fut` - The future type returned by the function.
	///
	/// # Returns
	/// A `Result` containing the modified `Struct` instance if successful,
	/// or an error message as a `String` if the operation fails.
	///
	/// # Errors
	/// Returns an error if the function cannot be added to the plan.
	pub fn WithFunction<F, Fut>(mut self, Name: &str, Function: F) -> Result<Self, String>
	where
		F: Fn(Vec<serde_json::Value>) -> Fut + Send + Sync + 'static,
		Fut: Future<Output = Result<serde_json::Value, crate::Enum::Sequence::Action::Error::Enum>>
			+ Send
			+ 'static,
	{
		self.Formality.Add(Name, Function)?;

		Ok(self)
	}

	/// Finalizes the plan and returns the `Formality`.
	///
	/// # Returns
	/// The `Formality` instance containing all added signatures and functions.
	pub fn Build(self) -> Formality::Struct {
		self.Formality
	}
}

use futures::Future;

pub mod Formality;
