#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileInfo {
	path: PathBuf,
	last_modified: SystemTime,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompilerConfig {
	Target: String,
	Module: String,
	Strict: bool,
	EmitDecoratorsMetadata: bool,
}

#[derive(Debug, Clone)]
pub struct Option {
	pub entry: Vec<Vec<String>>,
	pub separator: char,
	pub pattern: String,
	pub config: CompilerConfig,
}

#[derive(Debug, Default)]
pub struct CompilerMetrics {
	Count: usize,
	Elapsed: Duration,
	Error: usize,
}

impl Default for CompilerConfig {
	fn default() -> Self {
		Self {
			Target: "es2022".to_string(),
			Module: "commonjs".to_string(),
			Strict: true,
			EmitDecoratorsMetadata: true,
		}
	}
}

#[derive(Debug)]
pub struct Compiler {
	config: CompilerConfig,
	Outlook: Arc<Mutex<CompilerMetrics>>,
}

impl Compiler {
	pub fn new(config: CompilerConfig) -> Self {
		Self { config, Outlook: Arc::new(Mutex::new(CompilerMetrics::default())) }
	}

	#[tracing::instrument(skip(self, input))]
	async fn compile_file(&self, File: &str, input: String) -> Result<String> {
		let Begin = Instant::now();

		let cm = SourceMap::new(FilePathMapping::empty());

		let source_file = cm.new_source_file(FileName::Real(File.into()), input);

		let mut parser = Parser::new_from(Lexer::new(
			Syntax::Typescript(TsConfig { decorators: true, ..Default::default() }),
			EsVersion::Es2022,
			StringInput::from(&*source_file),
			None,
		));

		let mut Parsed = parser.parse_module().expect("Failed to parse TypeScript module")?;

		let Unresolved = Mark::new();

		let Top = Mark::new();

		Parsed = Parsed.fold_with(&mut swc_ecma_transforms_base::resolver(Unresolved, Top, true));
		
		Parsed = Parsed.fold_with(&mut swc_ecma_transforms_typescript::strip(Unresolved, Top));

		Parsed = Parsed.fold_with(&mut decorators::decorators(decorators::Config {
			legacy: false,
			emit_metadata: self.config.EmitDecoratorsMetadata,
			use_define_for_class_fields: true,
			..Default::default()
		}));

		// Parsed = Parsed.fold_with(&mut InjectHelpers::default());

		let mut Output = vec![];

		let mut Emitter = Emitter {
			cfg: swc_ecma_codegen::Config::default(),
			cm: cm.into().clone(),
			comments: None,
			wr: JsWriter::new(cm.into(), "\n", &mut Output, None),
		};

		Emitter.emit_module(&Parsed).expect("Failed to emit JavaScript")?;

		let Path = Path::new(File).with_extension("js");

		tokio::fs::write(&Path, &Output).await.expect("Failed to write output file")?;

		let Elapsed = Begin.elapsed();

		let mut Outlook = self.Outlook.lock().await;
		Outlook.Count += 1;
		Outlook.Elapsed += Elapsed;

		debug!("Compiled {} in {:?}", File, Elapsed);

		Ok(Path.to_string_lossy().to_string())
	}
}

use serde::{Deserialize, Serialize};
use tracing::debug;
