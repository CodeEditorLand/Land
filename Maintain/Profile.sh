#!/usr/bin/env sh

#===============================================================================
# Profile.sh - Profile Selection and Management Script
#===============================================================================
#
# This script provides utilities for managing build profiles.
# It can list available profiles, show profile details, and validate profiles.
#
# Usage:
#   sh Maintain/Profile.sh list              # List all available profiles
#   sh Maintain/Profile.sh show <name>       # Show profile details
#   sh Maintain/Profile.sh validate <name>   # Validate a profile
#   sh Maintain/Profile.sh workbenches       # List available workbenches
#   sh Maintain/Profile.sh features          # List available features
#
#===============================================================================

set -e

CONFIG_FILE=".vscode/land-config.json"

#===============================================================================
# Helper Functions
#===============================================================================

print_header() {
	echo "========================================"
	echo "$1"
	echo "========================================"
}

print_section() {
	echo ""
	echo "$1"
	echo "----------------------------------------"
}

#===============================================================================
# Profile Functions
#===============================================================================

list_profiles() {
	print_header "Available Build Profiles"

	if [ ! -f "$CONFIG_FILE" ]; then
		echo "Error: Configuration file not found: $CONFIG_FILE"
		exit 1
	fi

	echo ""
	echo "Debug Profiles:"
	echo "  debug          - Browser workbench (70-80% features)"
	echo "  debug-mountain - Mountain workbench (80-90% features) [RECOMMENDED]"
	echo "  debug-electron - Electron workbench (95%+ features)"
	echo ""
	echo "Release Profiles:"
	echo "  production  - Production build with Mountain workbench"
	echo "  release     - Full release with packaging and signing"
	echo "  web-browser - Web browser deployment (no Tauri)"
	echo ""
	echo "Bundler Profiles:"
	echo "  bundler-preparation - Prepare for SWC/OXC bundler"
	echo "  swc-bundle          - SWC bundler for fast compilation"
	echo "  oxc-bundle          - OXC bundler for next-gen toolchain"
}

show_profile() {
	ProfileName="$1"

	if [ -z "$ProfileName" ]; then
		echo "Error: Profile name required"
		echo "Usage: $0 show <profile-name>"
		exit 1
	fi

	print_header "Profile: $ProfileName"

	case $ProfileName in
		debug)
			echo "Description: Debug build with Browser workbench"
			echo "Workbench: Browser"
			echo "Coverage: 70-80%"
			echo "Complexity: Low"
			echo ""
			echo "Environment Variables:"
			echo "  Debug=true, Browser=true, Bundle=true"
			echo "  NODE_ENV=development"
			echo ""
			echo "Features:"
			echo "  tauri_ipc: true"
			echo "  wind_services: false"
			echo "  mountain_providers: false"
			;;
		debug-mountain)
			echo "Description: Debug build with Mountain workbench (RECOMMENDED)"
			echo "Workbench: Mountain"
			echo "Coverage: 80-90%"
			echo "Complexity: Medium"
			echo ""
			echo "Environment Variables:"
			echo "  Debug=true, Mountain=true, Bundle=true"
			echo "  NODE_ENV=development"
			echo ""
			echo "Features:"
			echo "  tauri_ipc: true"
			echo "  wind_services: true"
			echo "  mountain_providers: true"
			;;
		debug-electron)
			echo "Description: Debug build with Electron workbench"
			echo "Workbench: Electron"
			echo "Coverage: 95%+"
			echo "Complexity: High"
			echo ""
			echo "Environment Variables:"
			echo "  Debug=true, Electron=true, Bundle=true"
			echo "  NODE_ENV=development"
			echo ""
			echo "Features:"
			echo "  tauri_ipc: true"
			echo "  electron_polyfills: true"
			echo "  wind_services: true"
			;;
		production)
			echo "Description: Production build with Mountain workbench"
			echo "Workbench: Mountain"
			echo "Coverage: 80-90%"
			echo ""
			echo "Environment Variables:"
			echo "  Debug=false, Mountain=true, Compile=true"
			echo "  NODE_ENV=production"
			;;
		release)
			echo "Description: Full release with packaging and signing"
			echo "Workbench: Mountain"
			echo ""
			echo "Environment Variables:"
			echo "  Debug=false, Mountain=true, Compile=true"
			echo "  NODE_ENV=production"
			echo "  RUST_LOG=warn"
			;;
		*)
			echo "Profile '$ProfileName' not found in predefined list"
			echo "Check $CONFIG_FILE for custom profiles"
			;;
	esac
}

validate_profile() {
	ProfileName="$1"

	if [ -z "$ProfileName" ]; then
		echo "Error: Profile name required"
		echo "Usage: $0 validate <profile-name>"
		exit 1
	fi

	print_header "Validating Profile: $ProfileName"

	case $ProfileName in
		debug | debug-mountain | debug-electron | production | release | web-browser | bundler-preparation | swc-bundle | oxc-bundle)
			echo "Profile '$ProfileName' is valid"
			echo ""
			show_profile "$ProfileName"
			;;
		*)
			echo "Profile '$ProfileName' is not recognized"
			echo ""
			echo "Known profiles: debug debug-mountain debug-electron production release web-browser bundler-preparation swc-bundle oxc-bundle"
			exit 1
			;;
	esac
}

list_workbenches() {
	print_header "Available Workbenches"

	echo ""
	echo "Mountain (RECOMMENDED)"
	echo "  Route: /Mountain"
	echo "  Coverage: 80-90%"
	echo "  Complexity: Medium"
	echo "  Features: Direct Mountain IPC, Wind services, Effect-TS bootstrap"
	echo "  Use for: Tauri desktop, Production use, Maximum compatibility"
	echo ""
	echo "Browser"
	echo "  Route: /Browser"
	echo "  Coverage: 70-80%"
	echo "  Complexity: Low"
	echo "  Features: No polyfills, Web-optimized, Fastest startup"
	echo "  Use for: Web deployment, Quick testing, Minimal setup"
	echo ""
	echo "Wind"
	echo "  Route: /Wind"
	echo "  Coverage: 60-70%"
	echo "  Complexity: High"
	echo "  Features: Native components, Custom workbench, Wind services"
	echo "  Use for: Custom UI, Experimental features"
	echo ""
	echo "Electron"
	echo "  Route: /Electron"
	echo "  Coverage: 95%+"
	echo "  Complexity: High"
	echo "  Features: Full Electron APIs, Comprehensive polyfills"
	echo "  Use for: Maximum VSCode compatibility, Extension support"
	echo ""
	echo "BrowserProxy"
	echo "  Route: /BrowserProxy"
	echo "  Coverage: 70-80%"
	echo "  Complexity: Medium"
	echo "  Features: Mountain proxy, Service delegation"
	echo "  Use for: Proxy-based deployment"
}

list_features() {
	print_header "Available Features"

	echo ""
	echo "Core Features:"
	echo "  tauri_ipc          - Enable Tauri IPC communication"
	echo "  wind_services      - Enable Wind service integration"
	echo "  mountain_providers - Enable Mountain provider integration"
	echo ""
	echo "Compatibility Features:"
	echo "  electron_polyfills - Enable Electron API polyfills"
	echo "  vscode_protocols   - Enable VSCode protocol handlers"
	echo ""
	echo "Development Features:"
	echo "  webview_panels       - Enable webview panel support"
	echo "  integrated_terminal  - Enable integrated terminal"
	echo "  language_servers     - Enable language server support"
	echo "  debugger_integration - Enable debugger integration"
	echo "  source_control       - Enable source control integration"
	echo "  extension_host       - Enable extension host support"
	echo "  remote_development   - Enable remote development support"
}

#===============================================================================
# Main Command Router
#===============================================================================

case "${1:-}" in
	list)
		list_profiles
		;;
	show)
		show_profile "$2"
		;;
	validate)
		validate_profile "$2"
		;;
	workbenches)
		list_workbenches
		;;
	features)
		list_features
		;;
	--help | -h)
		echo "Usage: $0 <command> [options]"
		echo ""
		echo "Commands:"
		echo "  list              List all available profiles"
		echo "  show <name>       Show profile details"
		echo "  validate <name>   Validate a profile"
		echo "  workbenches       List available workbenches"
		echo "  features          List available features"
		echo ""
		echo "Examples:"
		echo "  $0 list"
		echo "  $0 show debug-mountain"
		echo "  $0 validate production"
		echo "  $0 workbenches"
		;;
	*)
		echo "Usage: $0 <command> [options]"
		echo "Use --help for more information"
		exit 1
		;;
esac
