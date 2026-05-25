#!/usr/bin/env sh

#===============================================================================
# Format.sh - Format shell, Prettier, and Rust source code
#===============================================================================
#
# This script formats all source code using the configured tooling.
# shfmt handles shell scripts (.sh).
# Prettier handles TS/JS/Astro/CSS/JSON/MD (with Tailwind class ordering).
# rustfmt (nightly) handles Rust.
#
# Usage:
#   sh Maintain/Format.sh             # Format shell + Prettier + Rust
#   sh Maintain/Format.sh shell       # Format shell scripts only
#   sh Maintain/Format.sh prettier    # Format Prettier only
#   sh Maintain/Format.sh rust        # Format Rust only
#
# Configuration:
#   .editorconfig       - Shared indent/newline rules (shfmt reads this)
#   prettier.config.js  - Prettier options and plugins (incl. tailwindcss)
#   tailwind.config.js  - Tailwind class ordering reference
#   .prettierignore     - Paths excluded from Prettier formatting
#   rustfmt.toml        - rustfmt options (nightly, edition 2024)
#                         includes `ignore = [...]` for per-path exclusions
#
#===============================================================================

set -e

Current=$(cd -- "$(dirname -- "$0")" > /dev/null 2>&1 && pwd)

Root="$Current/.."

#===============================================================================
# Format Functions
#===============================================================================

FormatShell() {
	echo "========================================"
	echo "Format Shell"
	echo "========================================"
	echo "Tooling: shfmt"
	echo "Config:  .editorconfig (tabs, indent=4)"
	echo "========================================"
	echo ""

	cd "$Root"

	# shfmt reads .editorconfig for indent style/size automatically.
	# Exclude every generated / vendored / cache tree; only authored
	# `.sh` files under `Maintain/`, `Container/`, and per-Element
	# `Source/` paths should reach shfmt.
	#
	# Categories:
	#   Vendored / external      Dependency/, node_modules/, SideCar/*/NODE/, .git/
	#   Cargo build output       Target/, target/, **/.fingerprint/,
	#                            **/incremental/, **/deps/, **/build/<crate>-*/out/
	#                            (these contain Tauri codegen-asset `.sh`
	#                            files that are raw binary payloads with
	#                            invalid UTF-8 - shfmt errors on them)
	#   Rustdoc + cargo doc      **/Documentation/Rust/doc/,
	#                            **/Documentation/Rust/debug/,
	#                            **/Documentation/Rust/release/
	#                            (each Element has its own per-package
	#                            doc tree under its Documentation/)
	#   JS/TS build caches       **/.turbo/, **/.astro/, **/.next/,
	#                            **/.swc/, **/.parcel-cache/,
	#                            **/.eslintcache/, **/.cache/, **/dist/
	#   Generated codegen        **/Generated/, **/.generated/, **/gen/
	#                            (Vine.proto -> tonic, Sky channel
	#                            codegen, Wind effect bridges)
	#   Tauri codegen-assets     **/tauri-codegen-assets/ (binary payloads
	#                            staged with `.sh` extensions)
	#
	# shellcheck disable=SC2038
	find . -name "*.sh" \
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
		| xargs shfmt -w

	echo ""
	echo "Shell formatting complete."
	echo ""
}

FormatTypeScript() {
	echo "========================================"
	echo "Format Prettier"
	echo "========================================"
	echo "Tooling: Prettier + prettier-plugin-tailwindcss"
	echo "Config:  prettier.config.js, tailwind.config.js"
	echo "Ignore:  .prettierignore"
	echo "========================================"
	echo ""

	cd "$Root"

	"$Root/node_modules/.bin/prettier" --write . \
		--ignore-path ".prettierignore"

	echo ""
	echo "Prettier formatting complete."
	echo ""
}

FormatRust() {
	echo "========================================"
	echo "Format Rust"
	echo "========================================"
	echo "Tooling: cargo +nightly fmt  (module tree)"
	echo "         rustfmt direct pass (orphan files)"
	echo "Config:  rustfmt.toml (incl. ignore = [...])"
	echo "========================================"
	echo ""

	cd "$Root"

	# Pass 1: cargo fmt - formats every .rs file reachable via `mod`
	# declarations from a crate root.  Respects the rustfmt.toml `ignore`
	# list automatically.
	cargo +nightly fmt

	# Pass 2: direct rustfmt - catches any .rs files that are NOT part of
	# any crate's module graph (orphan files, partially-wired refactoring
	# directories, planned modules not yet `mod`-declared in a crate root).
	# These files are invisible to `cargo fmt` because the Rust compiler
	# never parses them; `rustfmt` called with an explicit path always
	# formats them regardless of module membership.
	#
	# Exclusion list mirrors rustfmt.toml `ignore = [...]` and the same
	# categories used in FormatShell above.
	# shellcheck disable=SC2038
	find . -name "*.rs" \
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
		-not -path "*/Generated/*" \
		-not -path "*/.generated/*" \
		-not -path "*/gen/*" \
		-not -path "*/SideCar/*/NODE/*" \
		| xargs -I {} sh -c \
			'rustup run nightly rustfmt --config-path rustfmt.toml "$1" 2>/dev/null || true' \
			-- {}

	echo ""
	echo "Rust formatting complete."
	echo ""
}

#===============================================================================
# Main Command Router
#===============================================================================

case "${1:-}" in
	shell)
		FormatShell
		;;
	prettier)
		FormatTypeScript
		;;
	rust)
		FormatRust
		;;
	"")
		FormatShell
		FormatTypeScript
		FormatRust
		;;
	--help | -h)
		echo "Usage: $0 [shell|prettier|rust]"
		echo ""
		echo "  shell     Format shell scripts with shfmt"
		echo "  prettier  Format TS/JS/Astro/CSS/JSON/MD with Prettier"
		echo "  rust      Format Rust files with rustfmt (nightly)"
		echo "  (no arg)  Format all three"
		;;
	*)
		echo "Unknown target: $1"
		echo "Use --help for usage information"
		exit 1
		;;
esac
