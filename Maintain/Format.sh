#!/usr/bin/env bash

#===============================================================================
# Format.sh - Format TypeScript and Rust source code
#===============================================================================
#
# This script formats all Element source code using the configured tooling.
# Prettier handles TypeScript/JS/Astro (with Tailwind class ordering).
# rustfmt (nightly) handles Rust.
#
# Usage:
#   bash Maintain/Format.sh             # Format both TypeScript and Rust
#   bash Maintain/Format.sh typescript  # Format TypeScript only
#   bash Maintain/Format.sh rust        # Format Rust only
#
# Configuration:
#   prettier.config.js  - Prettier options and plugins (incl. tailwindcss)
#   tailwind.config.js  - Tailwind class ordering reference
#   rustfmt.toml        - rustfmt options (nightly, edition 2024)
#
#===============================================================================

set -e

Current=$(\cd -- "$(\dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && \pwd)

Root="$Current/.."

#===============================================================================
# Format Functions
#===============================================================================

FormatTypeScript() {
	echo "========================================"
	echo "Format TypeScript"
	echo "========================================"
	echo "Tooling: Prettier + prettier-plugin-tailwindcss"
	echo "Config:  prettier.config.js, tailwind.config.js"
	echo "========================================"
	echo ""

	\cd "$Root"

	"$Root/node_modules/.bin/prettier" --write \
		"Element/**/*.{ts,tsx,js,jsx,mjs,astro,svelte,vue,css,html,json,md,toml}"

	echo ""
	echo "TypeScript formatting complete."
	echo ""
}

FormatRust() {
	echo "========================================"
	echo "Format Rust"
	echo "========================================"
	echo "Tooling: cargo +nightly fmt"
	echo "Config:  rustfmt.toml"
	echo "========================================"
	echo ""

	\cd "$Root"

	cargo +nightly fmt

	echo ""
	echo "Rust formatting complete."
	echo ""
}

#===============================================================================
# Main Command Router
#===============================================================================

case "${1:-}" in
	typescript)
		FormatTypeScript
		;;
	rust)
		FormatRust
		;;
	"")
		FormatTypeScript
		FormatRust
		;;
	--help | -h)
		echo "Usage: $0 [typescript|rust]"
		echo ""
		echo "  typescript  Format TypeScript/JS/Astro files with Prettier"
		echo "  rust        Format Rust files with rustfmt (nightly)"
		echo "  (no arg)    Format both"
		;;
	*)
		echo "Unknown target: $1"
		echo "Use --help for usage information"
		exit 1
		;;
esac
