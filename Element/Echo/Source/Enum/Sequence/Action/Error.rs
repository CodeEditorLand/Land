/// Represents various error types that can occur during sequence actions.
#[derive(Debug, Error)]
pub enum Enum {
	/// Indicates an error related to an invalid license.
	///
	/// # Arguments
	///
	/// * `String` - A description of the specific license error.
	#[error("Invalid License: {0}")]
	License(String),

	/// Represents an error that occurred during execution of an action.
	///
	/// # Arguments
	///
	/// * `String` - A description of the specific execution error.
	#[error("Execution Error: {0}")]
	Execution(String),

	/// Signifies an error that occurred during routing.
	///
	/// # Arguments
	///
	/// * `String` - A description of the specific routing error.
	#[error("Routing error: {0}")]
	Routing(String),

	/// Indicates an error related to cancellation of an action.
	///
	/// # Arguments
	///
	/// * `String` - A description of the specific cancellation error.
	#[error("Cancellation error: {0}")]
	Cancellation(String),
}

use thiserror::Error;
