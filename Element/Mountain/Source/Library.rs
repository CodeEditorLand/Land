#![allow(non_snake_case)]

#[allow(dead_code)]
#[cfg_attr(mobile, tauri::mobile_entry_point)]
fn main() {
	Fn::Binary::Fn();
}

pub mod Fn;
