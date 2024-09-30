pub mod Compile;

#[tracing::instrument]
pub async fn Fn(Path: PathBuf, Option: Option) -> notify::Result<()> {
	let (tx, mut rx) = mpsc::unbounded_channel();

	notify::recommended_watcher::new(
		move |Result| {
			let _ = futures::executor::block_on(async {
				tx.send(Result).unwrap();
			});
		},
		notify::Config::default(),
	)?
	.watch(Path.as_ref(), notify::RecursiveMode::Recursive)?;

	while let Some(Result) = rx.recv().await {
		match Result {
			Ok(event) => {
				if let notify::Event {
					kind: notify::EventKind::Modify(notify::event::ModifyKind::Data(_)),
					paths,
					..
				} = event
				{
					for path in paths {
						if path.extension().map_or(false, |ext| ext == "ts") {
							tokio::task::spawn(async move {
								if let Err(e) = Compile::Fn(Option {
									entry: vec![vec![path.to_string_lossy().to_string()]],
									..Option.clone()
								})
								.await
								{
									error!("Compilation error: {}", e);
								}
							});
						}
					}
				}
			}

			Err(e) => error!("Watch error: {:?}", e),
		}
	}

	Ok(())
}

use notify::RecommendedWatcher;
use tracing::error;

use super::SWC::Option;
