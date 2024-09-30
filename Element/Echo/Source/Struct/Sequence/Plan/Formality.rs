/// A structure that manages signatures and functions for actions.
///
/// This struct uses concurrent hash maps to store signatures and their corresponding functions.
pub struct Struct {
	/// A concurrent hash map storing action signatures, keyed by their names.
	Signature: DashMap<String, Signature>,

	/// A concurrent hash map storing boxed functions, keyed by action names.
	///
	/// These functions take a vector of JSON values as input and return a pinned future
	/// that resolves to a Result containing either a JSON value or an Error.
	Function: DashMap<
		String,
		Box<
			dyn Fn(Vec<Value>) -> Pin<Box<dyn Future<Output = Result<Value, Error>> + Send>>
				+ Send
				+ Sync,
		>,
	>,
}

impl Struct {
	/// Creates a new instance of the struct with empty DashMaps.
	///
	/// # Returns
	///
	/// A new `Struct` instance.
	pub fn New() -> Self {
		Self { Signature: DashMap::new(), Function: DashMap::new() }
	}

	/// Adds a signature to the Signature DashMap.
	///
	/// # Arguments
	///
	/// * `Signature` - The signature to be added.
	///
	/// # Returns
	///
	/// A mutable reference to self for method chaining.
	pub fn Sign(&mut self, Signature: Signature) -> &mut Self {
		self.Signature.insert(Signature.Name.clone(), Signature);

		self
	}

	/// Adds a function to the Function DashMap.
	///
	/// # Arguments
	///
	/// * `Name` - The name of the function.
	/// * `Function` - The function to be added.
	///
	/// # Returns
	///
	/// A Result containing either a mutable reference to self or an error string.
	///
	/// # Errors
	///
	/// Returns an error if no signature is found for the given function name.
	pub fn Add<F, Fut>(&mut self, Name: &str, Function: F) -> Result<&mut Self, String>
	where
		F: Fn(Vec<Value>) -> Fut + Send + Sync + 'static,
		Fut: Future<Output = Result<Value, Error>> + Send + 'static,
	{
		if !self.Signature.contains_key(Name) {
			return Err(format!("No signature found for function: {}", Name));
		}

		self.Function.insert(
			Name.to_string(),
			Box::new(move |Argument: Vec<Value>| -> Pin<Box<dyn Future<Output = Result<Value, Error>> + Send>> {
				Box::pin(Function(Argument))
			}),
		);

		Ok(self)
	}

	/// Removes and returns a function from the Function DashMap.
	///
	/// # Arguments
	///
	/// * `Name` - The name of the function to remove.
	///
	/// # Returns
	///
	/// An Option containing a reference to the removed function, if it exists.
	pub fn Remove(
		&self,
		Name: &str,
	) -> Option<
		Box<
			dyn Fn(Vec<Value>) -> Pin<Box<dyn Future<Output = Result<Value, Error>> + Send>>
				+ Send
				+ Sync,
		>,
	> {
		self.Function.remove(Name).map(|(_, v)| v)
	}
}

impl Debug for Struct {
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
		f.debug_struct("Formality").field("Signature", &self.Signature).finish_non_exhaustive()
	}
}

use dashmap::DashMap;
use futures::Future;
use serde_json::Value;
use std::{fmt::Debug, pin::Pin};

use crate::{
	Enum::Sequence::Action::Error::Enum as Error,
	Struct::Sequence::Action::Signature::Struct as Signature,
};
