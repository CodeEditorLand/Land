/// Represents the options for binary command execution.
///
/// This struct holds various fields related to the command options, including exclude patterns,
/// omit patterns, parallel execution flag, pattern to match, root directory, and separator for file paths.
pub struct Struct {
	/// A vector of strings representing patterns to exclude.
	pub Exclude: Vec<String>,

	/// A flag indicating whether to execute commands in parallel.
	pub Parallel: Parallel,

	/// A string pattern to match against the last element of each entry.
	pub Pattern: Pattern,

	/// The root directory to start the walk from.
	pub Root: String,

	/// The separator used for file paths.
	pub Separator: Separator,
}

impl Struct {
	/// Creates a new instance of the Struct.
	///
	/// This function initializes the Struct with the provided options, generating the exclude patterns,
	/// omit patterns, parallel flag, pattern, root directory, and separator from the options.
	///
	/// # Arguments
	///
	/// * `Option` - A reference to an Option struct containing initialization parameters.
	///
	/// # Returns
	///
	/// Returns a new instance of Struct.
	pub fn Fn(Option { Separator, .. }: Option) -> Self {
		Self {
			Exclude: Command()
				.get_one::<String>("Exclude")
				.expect("Cannot Exclude.")
				.split(" ")
				.map(|Exclude| Exclude.to_string())
				.collect::<Vec<_>>(),
			Parallel: Command().get_flag("Parallel"),
			Pattern: Command().get_one::<String>("Pattern").expect("Cannot Pattern.").to_owned(),
			Root: Command().get_one::<String>("Root").expect("Cannot Root.").to_owned(),
			Separator,
		}
	}
}

use crate::{Fn::Binary::Command::Fn as Command, Struct::Binary::Command::Struct as Option};

/// Type alias for a vector of strings representing command options.
pub type Command = Vec<String>;

/// Type alias for a boolean flag indicating parallel execution.
pub type Parallel = bool;

/// Type alias for a string pattern to match.
pub type Pattern = String;

/// Type alias for a character used as a separator for file paths.
pub type Separator = char;
