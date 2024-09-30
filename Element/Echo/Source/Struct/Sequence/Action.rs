/// Represents an action with metadata, content, license, and plan.
///
/// This struct is generic over `T`, which must implement `Send` and `Sync`.
#[derive(Clone, Debug)]
pub struct Struct<T: Send + Sync> {
	pub Metadata: Vector,
	pub Content: T,
	pub License: Signal<bool>,
	pub Plan: Arc<Formality>,
}

impl<T: Send + Sync + Serialize> Serialize for Struct<T> {
	fn serialize<S>(&self, _serializer: S) -> Result<S::Ok, S::Error>
	where
		S: Serializer,
	{
		unimplemented!()
	}
}

impl<'de, T: Send + Sync + Deserialize<'de>> Deserialize<'de> for Struct<T> {
	fn deserialize<D>(_deserializer: D) -> Result<Self, D::Error>
	where
		D: Deserializer<'de>,
	{
		unimplemented!()
	}
}

impl<T: Send + Sync + Serialize + for<'de> Deserialize<'de>> Struct<T> {
	/// Creates a new `Struct` instance.
	///
	/// # Arguments
	///
	/// * `Action` - The name of the action.
	/// * `Content` - The content of the action.
	/// * `Plan` - The plan for executing the action.
	///
	/// # Returns
	///
	/// A new `Struct` instance.
	pub fn New(Action: &str, Content: T, Plan: Arc<Formality>) -> Self {
		let mut Metadata = Vector::New();

		Metadata.Insert("Action".to_string(), serde_json::json!(Action));

		Metadata.Insert("License".to_string(), serde_json::json!("valid"));

		Struct { Metadata, Content, License: Signal::New(true), Plan }
	}

	/// Adds metadata to the action.
	///
	/// # Arguments
	///
	/// * `Key` - The key for the metadata.
	/// * `Value` - The value for the metadata.
	///
	/// # Returns
	///
	/// The modified `Struct` instance.
	pub fn WithMetadata(mut self, Key: &str, Value: serde_json::Value) -> Self {
		self.Metadata.Insert(Key.to_string(), Value);

		self
	}

	/// Executes the action.
	///
	/// # Arguments
	///
	/// * `Context` - The context in which to execute the action.
	///
	/// # Returns
	///
	/// A `Result` indicating success or failure.
	pub async fn Execute(&self, Context: &Life) -> Result<(), Error> {
		let Action = self
			.Metadata
			.Get("Action")
			.await
			.ok_or_else(|| Error::Execution("Action not found".to_string()))?
			.as_str()
			.ok_or_else(|| Error::Execution("Action is not a string".to_string()))?
			.to_string();

		info!("Executing action: {}", Action);

		self.License().await?;

		self.Delay().await?;

		self.Hooks(Context).await?;

		self.Function(&Action).await?;

		self.Next(Context).await?;

		Ok(())
	}

	/// Checks if the action is licensed.
	async fn License(&self) -> Result<(), Error> {
		if !self.License.Get().await {
			return Err(Error::License("Invalid action license".to_string()));
		}

		Ok(())
	}

	/// Applies any delay specified in the metadata.
	async fn Delay(&self) -> Result<(), Error> {
		if let Some(Delay) = self.Metadata.Get("Delay").await {
			tokio::time::sleep(tokio::time::Duration::from_secs(Delay.as_u64().unwrap_or(0))).await;
		}

		Ok(())
	}

	/// Executes any hooks specified in the metadata.
	async fn Hooks(&self, Context: &Life) -> Result<(), Error> {
		if let Some(Hooks) = self.Metadata.Get("Hooks").await {
			for Hook in Hooks.as_array().unwrap_or(&Vec::new()) {
				if let Some(HookFn) = Context.Span.get(Hook.as_str().unwrap_or("")) {
					HookFn()?;
				}
			}
		}

		Ok(())
	}

	/// Executes the function associated with the action.
	async fn Function(&self, Action: &str) -> Result<(), Error> {
		if let Some(Function) = self.Plan.Remove(Action) {
			self.Result(Function.call((self.Argument().await?,)).await?).await?;
		} else {
			return Err(Error::Execution(format!("No function found for action type: {}", Action)));
		}

		Ok(())
	}

	/// Executes the next action, if specified.
	async fn Next(&self, Context: &Life) -> Result<(), Error> {
		if let Some(Next) = self.Metadata.Get("NextAction").await {
			let Next: Struct<T> = serde_json::from_value(Next.clone()).map_err(|_Error| {
				Error::Execution(format!("Failed to parse NextAction: {}", _Error))
			})?;

			Next.Execute(Context).await?;
		}

		Ok(())
	}

	/// Retrieves the arguments for the action.
	async fn Argument(&self) -> Result<Vec<serde_json::Value>, Error> {
		Ok(vec![])
	}

	/// Processes the result of the action.
	async fn Result(&self, _Result: serde_json::Value) -> Result<(), Error> {
		Ok(())
	}
}

use log::info;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::{fmt::Debug, sync::Arc};

use crate::{
	Enum::Sequence::Action::Error::Enum as Error,
	Struct::Sequence::{
		Life::Struct as Life, Plan::Formality::Struct as Formality, Signal::Struct as Signal,
		Vector::Struct as Vector,
	},
};

pub mod Signature;
