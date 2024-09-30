/// Represents the structure for binary command entries.
///
/// This struct holds various fields related to the command entries, including the entry paths,
/// parallel execution flag, pattern to match, separator for file paths, and omit patterns.
pub struct Struct {
	/// A vector of vectors, where each inner vector contains the components of a file path.
	pub Entry: Type,

	/// A flag indicating whether to execute commands in parallel.
	pub Parallel: Parallel,

	/// A string pattern to match against the last element of each entry.
	pub Pattern: Pattern,

	/// The separator used for file paths.
	pub Separator: Separator,
}

impl Struct {
	/// Creates a new instance of the Struct.
	///
	/// This function initializes the Struct with the provided options, generating the entry paths
	/// and cloning the omit patterns, parallel flag, pattern, and separator from the options.
	///
	/// # Arguments
	///
	/// * `Option` - A reference to an Option struct containing initialization parameters.
	///
	/// # Returns
	///
	/// Returns a new instance of Struct.
	pub fn Fn(Option: &Option) -> Self {
		Self {
			Entry: crate::Fn::Binary::Command::Entry::Fn(Option),
			Parallel: Option.Parallel,
			Pattern: Option.Pattern.clone(),
			Separator: Option.Separator,
		}
	}
}

use crate::Struct::Binary::Command::Option::{Parallel, Pattern, Separator, Struct as Option};

/// Type alias for a vector of vectors, where each inner vector contains the components of a file path.
pub type Type = Vec<Vec<String>>;
