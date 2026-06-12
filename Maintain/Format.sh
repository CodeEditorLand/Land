#!/usr/bin/env sh

#===============================================================================
# Format.sh - Format shell, Prettier, Rust, and Markdown source code.
#===============================================================================
#
# Usage:
#   sh Maintain/Format.sh               # Run all formatters
#   sh Maintain/Format.sh dos2unix      # Normalize line endings only
#   sh Maintain/Format.sh shell         # Format shell scripts only
#   sh Maintain/Format.sh prettier      # Format TS/JS/JSON/MD only
#   sh Maintain/Format.sh rust          # Format Rust only
#   sh Maintain/Format.sh markdown      # Format Markdown HTML tables only
#
# Configuration:
#   .editorconfig      - Shared indent/newline rules (shfmt reads this)
#   prettier.config.js - Prettier options and plugins
#   .prettierignore    - Paths excluded from Prettier formatting
#   rustfmt.toml       - rustfmt options (nightly, edition 2024)
#                        includes `ignore = [...]` for per-path exclusions
#
#===============================================================================

\set -e

Current=$(cd -- "$(dirname -- "$0")" > /dev/null 2>&1 && pwd)

Root="$Current/.."

#===============================================================================
# Format Functions
#===============================================================================

FormatLineEndings() {
	\echo "========================================"
	\echo "Format Line Endings"
	\echo "========================================"
	\echo "Tooling: dos2unix"
	\echo "========================================"
	\echo ""

	if ! \command -v dos2unix > /dev/null 2>&1; then
		\echo "Error: dos2unix is not installed."
		\echo "  macOS:  brew install dos2unix"
		\echo "  Linux:  apt install dos2unix  /  dnf install dos2unix"
		\exit 1
	fi

	\cd "$Root"

	# Convert CRLF -> LF on every text file. dos2unix skips binary files
	# automatically. Exclude vendored, build output, and generated paths.
	#
	# shellcheck disable=SC2038
	\find . -type f \
		-not -path "*/Dependency/*" \
		-not -path "*/node_modules/*" \
		-not -path "*/.git/*" \
		-not -path "*/Target/*" \
		-not -path "*/target/*" \
		-not -path "*/Archive/*" \
		-not -path "*/SideCar/*/NODE/*" \
		-not -path "*/Documentation/Rust/doc/*" \
		-not -path "*/Documentation/Rust/debug/*" \
		-not -path "*/Documentation/Rust/release/*" \
		-not -path "*/tauri-codegen-assets/*" \
		-not -path "*/.fingerprint/*" \
		-not -path "*/incremental/*" \
		-not -path "*/deps/*" \
		-not -path "*/.turbo/*" \
		-not -path "*/.astro/*" \
		-not -path "*/.next/*" \
		-not -path "*/.swc/*" \
		-not -path "*/.parcel-cache/*" \
		-not -path "*/.eslintcache/*" \
		-not -path "*/.cache/*" \
		-not -path "*/dist/*" \
		-not -path "*/Generated/*" \
		-not -path "*/.generated/*" \
		-not -path "*/gen/*" \
		-not -path "*/bin/*" \
		| \xargs \dos2unix -q

	\echo ""
	\echo "Line ending conversion complete."
	\echo ""
}

FormatShell() {
	\echo "========================================"
	\echo "Format Shell"
	\echo "========================================"
	\echo "Tooling: shfmt"
	\echo "Config:  .editorconfig (tabs, indent=4)"
	\echo "========================================"
	\echo ""

	if ! \command -v shfmt > /dev/null 2>&1; then
		\echo "Error: shfmt is not installed."
		\echo "  macOS:  brew install shfmt"
		\echo "  Linux:  apt install shfmt  /  go install mvdan.cc/sh/v3/cmd/shfmt@latest"
		\echo "  https://github.com/mvdan/sh"
		\exit 1
	fi

	\cd "$Root"

	# shfmt reads .editorconfig for indent style/size automatically.
	# Exclude vendored, build output, generated, and Tauri-specific paths.
	#
	# shellcheck disable=SC2038
	\find . -name "*.sh" \
		-not -path "*/Dependency/*" \
		-not -path "*/node_modules/*" \
		-not -path "*/.git/*" \
		-not -path "*/Target/*" \
		-not -path "*/target/*" \
		-not -path "*/SideCar/*/NODE/*" \
		-not -path "*/Documentation/Rust/doc/*" \
		-not -path "*/Documentation/Rust/debug/*" \
		-not -path "*/Documentation/Rust/release/*" \
		-not -path "*/.fingerprint/*" \
		-not -path "*/incremental/*" \
		-not -path "*/deps/*" \
		-not -path "*/tauri-codegen-assets/*" \
		-not -path "*/.turbo/*" \
		-not -path "*/.astro/*" \
		-not -path "*/.next/*" \
		-not -path "*/.swc/*" \
		-not -path "*/.parcel-cache/*" \
		-not -path "*/.eslintcache/*" \
		-not -path "*/.cache/*" \
		-not -path "*/dist/*" \
		-not -path "*/Generated/*" \
		-not -path "*/.generated/*" \
		-not -path "*/gen/*" \
		-not -path "*/bin/*" \
		| \xargs \shfmt -w

	\echo ""
	\echo "Shell formatting complete."
	\echo ""
}

FormatPrettier() {
	\echo "========================================"
	\echo "Format Prettier"
	\echo "========================================"
	\echo "Tooling: Format/TypeScript.py  (blank lines, first)"
	\echo "         Prettier              (TS/JS/JSON/MD, second)"
	\echo "Config:  prettier.config.js"
	\echo "Ignore:  .prettierignore"
	\echo "========================================"
	\echo ""

	\cd "$Root"

	# Pass 1: blank-line formatter - inserts blank lines after statement and
	# block boundaries. Runs first so that Prettier can normalize the result.
	\python3 "$Current/Format/TypeScript.py" --All

	# Pass 2: Prettier - formats TS/JS/JSX/TSX/JSON/MD/CSS and everything
	# else covered by prettier.config.js. || \true prevents file-level errors
	# (e.g. plugin issues) from aborting the pipeline.
	if [ -x "$Root/node_modules/.bin/prettier" ]; then
		"$Root/node_modules/.bin/prettier" --write . \
			--ignore-path ".prettierignore" || \true
	else
		\echo "Prettier not found in node_modules/.bin - skipping."
		\echo "Run: pnpm install"
	fi

	\echo ""
	\echo "Prettier formatting complete."
	\echo ""
}

FormatMarkdown() {
	\echo "========================================"
	\echo "Format Markdown"
	\echo "========================================"
	\echo "Tooling: Maintain/Format/Markdown.py"
	\echo "========================================"
	\echo ""

	\cd "$Root"

	\python3 "$Current/Format/Markdown.py" --All

	\echo ""
	\echo "Markdown formatting complete."
	\echo ""
}

FormatRust() {
	\echo "========================================"
	\echo "Format Rust"
	\echo "========================================"
	\echo "Tooling: Format/Rust.py      (blank lines, first)"
	\echo "         cargo +nightly fmt  (module tree, second)"
	\echo "         rustfmt direct pass (orphan files, third)"
	\echo "Config:  rustfmt.toml (incl. ignore = [...])"
	\echo "========================================"
	\echo ""

	\cd "$Root"

	# Pass 1: blank-line formatter - inserts blank lines after statement and
	# block boundaries. Runs first so that rustfmt can normalize the result:
	# blank_lines_upper_bound = 1 in rustfmt.toml caps any excess to one line.
	\python3 "$Current/Format/Rust.py" --All

	# Pass 2: cargo fmt - formats every .rs file reachable via `mod`
	# declarations from a crate root. Respects the rustfmt.toml `ignore`
	# list automatically. nightly is pinned by rust-toolchain.toml.
	\cargo +nightly fmt

	# Pass 3: direct rustfmt - catches any .rs files that are NOT part of
	# any crate's module graph (orphan files, planned modules not yet wired
	# into a crate root). Exclusion list mirrors rustfmt.toml `ignore`.
	#
	# shellcheck disable=SC2038
	# shellcheck disable=SC2016
	\find . -name "*.rs" \
		-not -path "*/Dependency/*" \
		-not -path "*/node_modules/*" \
		-not -path "*/.git/*" \
		-not -path "*/Target/*" \
		-not -path "*/target/*" \
		-not -path "*/.fingerprint/*" \
		-not -path "*/incremental/*" \
		-not -path "*/deps/*" \
		-not -path "*/tauri-codegen-assets/*" \
		-not -path "*/Documentation/Rust/doc/*" \
		-not -path "*/Documentation/Rust/debug/*" \
		-not -path "*/Documentation/Rust/release/*" \
		-not -path "*/Archive/*" \
		-not -path "*/Generated/*" \
		-not -path "*/.generated/*" \
		-not -path "*/gen/*" \
		-not -path "*/SideCar/*/NODE/*" \
		| \xargs -I {} \sh -c \
			'\rustup run nightly rustfmt --config-path rustfmt.toml "$1" 2>/dev/null || \true' \
			-- {}

	\echo ""
	\echo "Rust formatting complete."
	\echo ""
}

#===============================================================================
# Main Command Router
#===============================================================================

case "${1:-}" in
	dos2unix)
		FormatLineEndings
		;;
	shell)
		FormatShell
		;;
	prettier)
		FormatPrettier
		;;
	rust)
		FormatRust
		;;
	markdown)
		FormatMarkdown
		;;
	"")
		FormatLineEndings
		FormatShell
		FormatMarkdown
		FormatPrettier
		FormatRust
		;;
	--help | -h)
		\echo "Usage: $0 [dos2unix|shell|prettier|rust|markdown]"
		\echo ""
		\echo "  dos2unix  Normalize line endings (CRLF -> LF) with dos2unix"
		\echo "  shell     Format shell scripts with shfmt"
		\echo "  prettier  Format TS/JS/JSON/MD with Prettier + TypeScript.py"
		\echo "  rust      Format Rust with rustfmt (nightly) + Rust.py"
		\echo "  markdown  Format Markdown HTML tables with Markdown.py"
		\echo "  (no arg)  Run all five in order"
		;;
	*)
		\echo "Unknown target: $1"
		\echo "Use --help for usage information"
		\exit 1
		;;
esac
