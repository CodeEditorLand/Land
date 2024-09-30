/// Asynchronously processes entries to generate summaries and outputs the results.
///
/// This function performs the following steps:
/// 1. Filters and processes the provided entries based on the given pattern and separator.
/// 2. Spawns asynchronous tasks to generate summaries for each entry.
/// 3. Collects the results and outputs them.
///
/// # Arguments
///
/// * `Option` - A struct containing the following fields:
///   - `Entry`: A vector of vectors, where each inner vector contains the components of a file path.
///   - `Separator`: A character used to join the components of the file path.
///   - `Pattern`: A string pattern to match against the last element of each entry.
///
/// # Example
///
/// ```rust
/// let options = Option {
///     Entry: vec![vec!["path".to_string(), "to".to_string(), "file.git".to_string()]],
///     Separator: '/',
///     Pattern: ".git".to_string(),
/// };
/// Fn(options).await;
/// ```
///
/// # Errors
///
/// This function will log errors if it fails to generate summaries or send results.
pub async fn Fn(Option { Entry, Separator, Pattern, .. }: Option) {
	let (Allow, mut Mark) = tokio::sync::mpsc::unbounded_channel();
	let Queue = futures::stream::FuturesUnordered::new();

	for Entry in Entry
		.into_par_iter()
		.filter_map(|Entry| {
			if globset::GlobSet.is_match(&Entry.join(&Separator.to_string())) {
				Some(Entry[0..Entry.len() - 1].join(&Separator.to_string()))
			} else {
				None
			}
		})
		.collect::<Vec<String>>()
	{
		let Allow = Allow.clone();

		Queue.push(tokio::spawn(async move {
			match crate::Fn::Build::Fn(&Entry).await {
				Ok(Build) => {
					if let Err(_Error) = Allow.send((Entry, Build)) {
						eprintln!("Cannot Allow: {}", _Error);
					}
				}

				Err(_Error) => eprintln!("Cannot Build for {}: {}", Entry, _Error),
			}
		}));
	}

	tokio::spawn(async move {
		Queue.collect::<Vec<_>>().await;
		drop(Allow);
	});

	let mut Output = Vec::new();

	while let Some((Entry, Build)) = Mark.recv().await {
		Output.push((Entry, Build));
	}

	crate::Fn::Build::Group::Fn(Output);
}

use futures::stream::StreamExt;
use rayon::iter::{IntoParallelIterator, ParallelIterator};

use crate::Struct::Binary::Command::Entry::Struct as Option;
