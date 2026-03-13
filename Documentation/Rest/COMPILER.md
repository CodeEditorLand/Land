# Rest ⛱️ TypeScript Compiler

A high-performance TypeScript compiler built with Rust and OXC, designed to be 100% compatible with VSCode's build process.

## Overview

Rest is a compiler in the CodeEditorLand Element architecture, responsible for compiling TypeScript source code into JavaScript with VSCode-compatible output. It uses the [OXC](https://oxc.rs/) parser and transformer for blazing-fast compilation.

### Key Features

- **OXC-powered**: Uses OXC 0.48 for parsing, transformation, and codegen
- **VSCode Compatible**: Matches VSCode's gulp/tsb build output exactly
- **Decorator Support**: Full support for TypeScript decorators with `emitDecoratorMetadata`
- **Source Maps**: Optional source map generation for debugging
- **Configurable**: Environment variable control for compiler selection
- **High Performance**: Rust-powered compilation, significantly faster than esbuild for TypeScript

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  TypeScript     │───▶│  OXC Parser      │───▶│  OXC Transform  │
│  Source Code    │    │  (AST Build)     │    │  (Type Stripping)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                      │
                                                      ▼
┌─────────────────◀─────────────────────────────────┐
│                                            OXC Codegen
│  Output Writer ◀───────────────────────────────┘
│  (JS + .map)                                    │
└─────────────────┘                               │
                                                  ▼
                                          JavaScript Output
```

### Compilation Pipeline

1. **Parsing** (`Parser::parse`)
   - Uses OXC parser with TypeScript and decorator support
   - Creates AST with `'static` lifetime for safe transformation
   - Tracks allocation for proper memory management

2. **Transformation** (`Transformer::transform`)
   - Builds semantic information
   - Strips TypeScript types
   - Handles decorators according to `emitDecoratorMetadata`
   - Converts class fields based on `useDefineForClassFields`

3. **Code Generation** (`Codegen::codegen`)
   - Generates JavaScript from transformed AST
   - Optional minification
   - Optional source maps

4. **Output** (`Compiler::compile_file_to`)
   - Writes JavaScript to target directory
   - Maintains directory structure from source

## Integration with CodeEditorLand

Rest integrates with the build system through environment variables:

### Compiler Selection

```bash
# Use Rest compiler (Rust/OXc)
export Compiler=Rest

# Use esbuild (default, CSS only)
export Compiler=esbuild
```

### Build Profiles

#### Development (`NODE_ENV=development`)
- Compiles from `Dependency/Microsoft/Dependency/Editor/out/`
- Includes inline source maps
- Preserves English NLS strings
- No mangling

#### Production (`NODE_ENV=production`)
- Compiles from `Dependency/Microsoft/Dependency/Editor/out-build/`
- Minified output with mangling
- Source maps external
- NLS processing

### Usage in Element/Output

The [`RestPlugin.ts`](Element/Output/Source/ESBuild/RestPlugin.ts) intercepts TypeScript files when `Compiler=Rest` and delegates compilation to the Rest binary:

```typescript
// This plugin is automatically added when Compiler=Rest
import { createRestPluginIfEnabled } from './ESBuild';
// Plugin is conditionally added to esbuild's plugin list
```

## Configuration

### CompilerConfig

The main configuration structure:

```rust
#[derive(Debug, Clone)]
pub struct CompilerConfig {
    pub target: String,                    // ES target, e.g., "es2024"
    pub module: String,                    // "commonjs" or "esmodule"
    pub strict: bool,                      // Strict mode
    pub emit_decorators_metadata: bool,   // Decorator metadata
    pub tree_shaking: bool,               // Enable tree-shaking
    pub minify: bool,                     // Minification
    pub module_format: ModuleFormat,      // Module format enum
    use_define_for_class_fields: bool,    // VSCode: false
}
```

### Presets

- **`CompilerConfig::simple()`** - Single-file compilation
- **`CompilerConfig::vscode()`** - Full VSCode build pipeline with:
  - Private field conversion
  - NLS processing
  - Worker compilation
  - Bundling support

### TransformerConfig

Controls transformation behavior:

```rust
pub struct TransformerConfig {
    pub target: String,
    pub module_format: String,
    pub emit_decorator_metadata: bool,
    pub use_define_for_class_fields: bool,  // Critical for VSCode compatibility
    pub jsx: bool,
    pub tree_shaking: bool,
    pub minify: bool,
}
```

### ParserConfig

Parser options:

```rust
pub struct ParserConfig {
    pub target: String,
    pub jsx: bool,
    pub decorators: bool,      // Must be true for decorators
    pub typescript: bool,      // Must be true for TypeScript
}
```

## API Reference

### Main Compiler

```rust
use Rest::{Compiler, Struct::CompilerConfig};

let config = CompilerConfig::vscode();
let compiler = Compiler::new(config);

// Compile a file, output goes to same directory with .js extension
let result = compiler.compile_file("path/to/file.ts", source_code);

// Compile to specific output path
use std::path::Path;
let output_path = Path::new("path/to/output.js");
let result = compiler.compile_file_to(
    "input.ts",
    source_code,
    &output_path,
    false, // use_define_for_class_fields
);

// Get compilation metrics
let metrics = compiler.outlook.lock().unwrap();
println!("Compiled {} files in {:?}", metrics.count, metrics.elapsed);
```

### CLI Usage

```bash
# Compile a directory of TypeScript files
Rest compile \
  --input ./src \
  --output ./out \
  --target es2024 \
  --module commonjs \
  --source-maps

# Options:
#   --input, -i        Input directory (required)
#   --output, -o       Output directory (required)
#   --target           ES target version (default: es2024)
#   --module           Module system: commonjs, esmodule (default: esmodule)
#   --source-maps      Generate source maps
#   --use-define-for-class-fields  VSCode compatibility (default: false)
#   -P, --Parallel     Parallel compilation
```

## VSCode Compatibility

Rest is designed to produce byte-for-byte identical output to VSCode's gulp/tsb build process. Key compatibility requirements:

### Decorator Handling

- **`emitDecoratorMetadata: true`** - Must be enabled
- **`useDefineForClassFields: false`** - Critical! VSCode uses `define` semantics

```typescript
// Input TypeScript
@sealed
class MyClass {
    field = "value";
}

// VSCode Output (useDefineForClassFields=false)
"use strict";
var __decorate = ...
class MyClass {
    constructor() {
        this.field = "value";
    }
}
__decorate([sealed], MyClass.prototype, "field", void 0);
```

### Source Maps

- VSCode generates inline source maps in development
- External source maps in production
- Rest supports both via `--source-maps` flag

### Module Format

- Development: `commonjs` for Node.js compatibility
- Production: `esmodule` for tree-shaking

## Testing

Rest includes comprehensive test suites:

### Unit Tests

```bash
cargo test --package=Rest
```

Tests cover:
- Parser functionality
- Transformer correctness
- Codegen output
- Decorator handling
- Source map generation
- Compiler metrics
- Sequential compilation (no segfaults)
- Configuration derivation

### Integration Tests

```bash
cargo test --package=Rest --test=vscode_compatibility
```

The integration tests compare Rest output directly against VSCode's compiled output:

```rust
// Compare against VSCode out/ (development)
let config = VSCodeTestConfig::development();
let report = compare_vscode_output(&config)?;
assert!(report.success());

// Compare against VSCode out-build/ (production)
let config = VSCodeTestConfig::production();
let report = compare_vscode_output(&config)?;
```

### Benchmarks

```bash
cargo test --package=Rest --benches
# or
cargo test --package=Rest -- --ignored  # Run performance tests
```

Benchmarks measure:
- Compilation speed vs file size
- Throughput (files/second)
- Memory usage patterns

## Performance

Rest compilation is significantly faster than esbuild for TypeScript because:

1. **Specialized for TypeScript**: OXC is built specifically for TypeScript/JavaScript
2. **Zero-copy operations**: Careful lifetime management avoids copies
3. **Parallel processing**: Optional `--Parallel` flag for multi-core compilation
4. **No type checking**: OXC focuses on transformation, not type checking (like `tsc --noEmit`)

Typical performance on VSCode codebase (~2000 TypeScript files):
- **Rest**: ~2-3 minutes (full compile)
- **esbuild**: ~5-8 minutes (with TypeScript loader)

## Environment Variables

Rest respects these environment variables:

| Variable | Purpose |
|----------|---------|
| `Compiler` | Set to `"Rest"` to enable Rest compiler in Output element |
| `REST_BINARY_PATH` | Override path to Rest binary |
| `REST_OPTIONS` | Additional CLI arguments for Rest |
| `REST_VERBOSE` | Set to `"true"` for detailed logging |
| `RestSourcemap` | Set to `"true"` to generate source maps |
| `NODE_ENV` | `"development"` or `"production"` affects configuration |

## Troubleshooting

### Binary Not Found

If you see `Binary not found` errors:

```bash
# Build Rest
cd Element/Rest
cargo build --release

# Set binary path
export REST_BINARY_PATH=Target/release/Rest
```

### Compilation Errors

Rest uses OXC which may have different error messages than `tsc`:

- **Parse errors**: Check syntax, especially around decorators
- **Transform errors**: May indicate unsupported TypeScript features
- **Codegen errors**: Rare, report with source file

### Segfaults

Rest includes critical fixes for OXC lifetime management:

- **The allocator bug**: Fixed by keeping `ParseResult` in scope during transformation
- **Use-after-free**: prevented by borrowing `program` mutably instead of moving it

If you encounter segfaults:
1. Ensure you're using the latest OXC (0.48+)
2. Check that `parse_result` stays alive through transformation
3. Enable `RUST_LOG=debug` for detailed tracing

## Development

### Building

```bash
# Debug build
cargo build --package=Rest

# Release build
cargo build --release --package=Rest

# With optimizations
cargo build --release --package=Rest --profile=release
```

The binary will be at:
- Debug: `Element/Rest/target/debug/Rest`
- Release: `Element/Rest/target/release/Rest`

### Running Tests

```bash
# All tests
cargo test --package=Rest

# Specific test
cargo test --package=Rest test_name

# With output
cargo test --package=Rest -- --nocapture

# Benchmarks
cargo bench --package=Rest
```

### Adding New Features

When extending Rest:

1. **Parser changes**: Update `Fn/OXC/Parser.rs`
2. **Transform changes**: Update `Fn/OXC/Transformer.rs`
3. **Codegen changes**: Update `Fn/OXC/Codegen.rs`
4. **CLI changes**: Update `Fn/Binary/Command.rs`
5. **Configuration**: Add fields to `Struct/CompilerConfig.rs` or `Struct/SWC.rs`

## Migration from SWC

Rest originally used SWC but migrated to OXC for:

1. **Better TypeScript support**: OXC has more complete TypeScript parsing
2. **Active development**: OXC is actively maintained with frequent updates
3. **Performance**: OXC is often faster for TypeScript transformation
4. **Rust 2024**: Uses modern Rust edition

See `docs/REST-NAMING-MIGRATION.md` for details on naming conventions.

## References

- [OXC Documentation](https://oxc.rs/)
- [VSCode Build Process](Dependency/Microsoft/Dependency/Editor/build/)
- [TypeScript Compiler Options](https://www.typescriptlang.org/tsconfig)
- [CodeEditorLand Architecture](Documentation/Architecture/components/Rest.md)

## License

MIT - See [LICENSE](LICENSE) file
