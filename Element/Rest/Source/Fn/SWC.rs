async fn Fn() -> anyhow::Result<()> {
	tracing_subscriber::fmt::init();

	let args: Vec<String> = std::env::args().collect();
	if args.len() != 2 {
		error!("Usage: {} <directory>", args[0]);
		std::process::exit(1);
	}

	let Path = std::path::PathBuf::from(&args[1]);

	let Config = if let Ok(Config) = fs::read_to_string("swc_config.json").await {
		serde_json::from_str(&Config).unwrap_or_default()
	} else {
		CompilerConfig::default()
	};

	let options = Option {
		entry: vec![vec![Path.to_string_lossy().to_string()]],
		separator: std::path::MAIN_SEPARATOR,
		pattern: ".ts".to_string(),
		config: Config.clone(),
	};

	// Initial compilation
	info!("Starting initial compilation...");
	Watch::Compile::Fn(options.clone()).await?;

	info!("Initial compilation complete. Watching for changes...");

	// Start watching for changes
	Watch::Fn(Path, options).await?;

	Ok(())
}

pub mod Watch;

use std::{
	path::Path,
	sync::Arc,
	time::{Duration, Instant, SystemTime},
};

use futures::stream::FuturesUnordered;
use notify::{Config, RecommendedWatcher, RecursiveMode};
use serde::{Deserialize, Serialize};
use tokio::{
	fs,
	sync::{mpsc, Mutex},
	task,
};
use tracing::{debug, error, info, instrument, warn};

use swc_common::{FileName, FilePathMapping, Mark, SourceMap, Span, DUMMY_SP};
use swc_ecma_ast::EsVersion;
use swc_ecma_codegen::{text_writer::JsWriter, Emitter};
use swc_ecma_parser::{lexer::Lexer, Parser, StringInput, Syntax, TsConfig};
use swc_ecma_transforms_base::{
	helpers::{inject_helpers, InjectHelpers},
	resolver,
};
use swc_ecma_transforms_proposal::decorators;

use crate::Struct::SWC;
