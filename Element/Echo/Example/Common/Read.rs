// Define actions for file reading and writing
pub async fn Fn(Argument: Vec<Value>) -> Result<Value, Error> {
	let mut Content = String::new();

	File::open(Argument[0].as_str().ok_or(Error::Execution("Invalid file path".to_string()))?)
		.await
		.map_err(|_Error| Error::Execution(_Error.to_string()))?
		.read_to_string(&mut Content)
		.await
		.map_err(|_Error| Error::Execution(_Error.to_string()))?;

	Ok(json!(Content))
}

use serde_json::{json, Value};

use Echo::Enum::Sequence::Action::Error::Enum as Error;
