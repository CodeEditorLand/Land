#![allow(non_snake_case)]
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs::read_to_string;

#[derive(Deserialize)]
struct Toml {
	package: Package,
}

#[derive(Deserialize)]
struct Package {
	version: String,
}

fn main() {
	if !tauri_build::is_dev() {
		println!("cargo:rerun-if-changed=Cargo.toml");
		println!("cargo:rerun-if-changed=tauri.conf.json");
		println!("cargo:rerun-if-changed=tauri.conf.json5");

		let Version =
			toml::from_str::<Toml>(&read_to_string("Cargo.toml").expect("Cannot Cargo.toml."))
				.expect("Cannot toml.")
				.package
				.version;

		let File = if std::path::Path::new("tauri.conf.json5").exists() {
			"tauri.conf.json5"
		} else {
			"tauri.conf.json"
		};

		let Content = read_to_string(File).expect("Cannot read configuration file.");

		let mut Tauri: Value = match json5::from_str(&Content) {
			Ok(Value) => Value,
			Err(_) => serde_json::from_str(&Content).expect("Cannot JSON."),
		};

		Tauri.get_mut("version").map(|Entry| *Entry = Value::String(Version.clone()));

		let mut Serializer = serde_json::Serializer::with_formatter(
			Vec::new(),
			serde_json::ser::PrettyFormatter::with_indent(b"\t"),
		);

		Tauri.serialize(&mut Serializer).expect("Cannot Tauri.");

		std::fs::write(File, String::from_utf8(Serializer.into_inner()).expect("Cannot String."))
			.expect("Cannot tauri.conf.json.");

		println!("cargo:rustc-env=CARGO_PKG_VERSION={}", Version);
	}

	tauri_build::build();
}
