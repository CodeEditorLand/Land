/// Represents a signature for an action.
///
/// This struct encapsulates the name of an action signature, which can be used
/// for identifying and describing different types of actions within a system.
#[derive(Clone, Debug)]
pub struct Struct {
	/// The name of the action signature.
	///
	/// This field stores a unique identifier or descriptive name for the action.
	/// It can be used to look up or reference specific actions within a larger system.
	pub Name: String,
}
