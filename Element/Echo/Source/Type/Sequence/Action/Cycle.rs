/// Represents a thread-safe, reference-counted function that can be called to perform an action.
///
/// This type alias defines a function that:
/// - Takes no parameters
/// - Returns a `Result` where:
///   - The success case is an empty tuple `()`
///   - The error case is `crate::Enum::Sequence::Action::Error::Enum`
/// - Is wrapped in an `Arc` (Atomic Reference Counted) for thread-safe sharing
/// - Implements `Send` and `Sync` traits, making it safe to send between threads and use from multiple threads
///
/// It's commonly used for defining actions or callbacks that can be executed asynchronously
/// and shared across multiple parts of an application.
pub type Type = crate::Struct::Sequence::Arc<
	dyn Fn() -> Result<(), crate::Enum::Sequence::Action::Error::Enum> + Send + Sync,
>;
