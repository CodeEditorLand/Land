#![allow(non_snake_case)]

#[allow(dead_code)]
#[tokio::main]
/// The main entry point for the application.
///
/// This function initializes the command structure and executes the asynchronous function
/// defined within it. The function is marked with the `#[tokio::main]` attribute to enable
/// asynchronous execution using the Tokio runtime.
///
/// # Panics
///
/// This function does not panic.
///
/// # Example
///
/// ```rust
/// #[tokio::main]
/// async fn main() {
///     (Struct::Binary::Command::Struct::Fn().Fn)().await
/// }
/// ```
async fn main() {
	(Struct::Binary::Command::Struct::Fn().Fn)().await
}

pub mod Fn;
pub mod Struct;
