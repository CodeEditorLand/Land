pub async fn Fn(Argument: Vec<Value>) -> Result<Value, Error> {
	OpenOptions::new()
		.write(true)
		.create(true)
		.truncate(true)
		.open(Argument[0].as_str().ok_or(Error::Execution("Invalid file path".to_string()))?)
		.await
		.map_err(|_Error| Error::Execution(_Error.to_string()))?
		.write_all(
			Argument[1].as_str().ok_or(Error::Execution("Invalid content".to_string()))?.as_bytes(),
		)
		.await
		.map_err(|_Error| Error::Execution(_Error.to_string()))?;

	Ok(json!("File written successfully"))
}

use serde_json::{json, Value};

use Echo::Enum::Sequence::Action::Error::Enum as Error;
