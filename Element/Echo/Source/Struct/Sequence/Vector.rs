/// A thread-safe key-value store using `DashMap` for concurrent access.
///
/// This struct provides a wrapper around `DashMap` to store key-value pairs
/// where keys are strings and values are `serde_json::Value` types.
#[derive(Clone, Debug)]
pub struct Struct {
	/// The internal storage using `DashMap`.
	Entry: DashMap<String, serde_json::Value>,
}

impl Struct {
	/// Creates a new, empty `Struct` instance.
	///
	/// # Returns
	///
	/// A new `Struct` with an empty `DashMap`.
	pub fn New() -> Self {
		Self { Entry: DashMap::new() }
	}

	/// Inserts a key-value pair into the store.
	///
	/// If the key already exists, the value is updated.
	///
	/// # Arguments
	///
	/// * `Key` - The key as a `String`.
	/// * `Value` - The value as a `serde_json::Value`.
	pub fn Insert(&mut self, Key: String, Value: serde_json::Value) {
		self.Entry.insert(Key, Value);
	}

	/// Retrieves a value from the store by its key.
	///
	/// # Arguments
	///
	/// * `Key` - The key to look up.
	///
	/// # Returns
	///
	/// An `Option<serde_json::Value>` containing the value if the key exists,
	/// or `None` if the key is not found.
	pub async fn Get(&self, Key: &str) -> Option<serde_json::Value> {
		self.Entry.get(Key).map(|v| v.value().clone())
	}
}

use dashmap::DashMap;
