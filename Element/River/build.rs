#![allow(non_snake_case)]

use serde::Deserialize;
use std::fs;

#[derive(Deserialize)]
struct Toml {
	package: Package,
}

#[derive(Deserialize)]
struct Package {
	version: String,
}

fn main() {
	println!("cargo:rerun-if-changed=Cargo.toml");

	println!(
		"cargo:rustc-env=CARGO_PKG_VERSION={}",
		(toml::from_str::<Toml>(&fs::read_to_string("Cargo.toml").expect("Cannot Cargo.toml."))
			.expect("Cannot toml."))
		.package
		.version
	);
}
