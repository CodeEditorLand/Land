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
	# Exclude Dependency/ and SideCar NODE trees; find all project .sh files.
	find . -name "*.sh" \
		-not -path "*/Dependency/*" \
		-not -path "*/node_modules/*" \
		-not -path "*/Target/*" \
		-not -path "*/target/*" \
		-not -path "*/SideCar/*/NODE/*" \
		-not -path "*/.git/*" \
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
		--ignore-path "$Root/.prettierignore"

	echo ""
	echo "Prettier formatting complete."
	echo ""
}

FormatRust() {
	echo "========================================"
	echo "Format Rust"
	echo "========================================"
	echo "Tooling: cargo +nightly fmt"
	echo "Config:  rustfmt.toml (incl. ignore = [...])"
	echo "========================================"
	echo ""

	cd "$Root"

	cargo +nightly fmt

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
