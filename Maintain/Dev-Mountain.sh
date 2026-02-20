#!/usr/bin/env bash

#===============================================================================
# Dev-Mountain.sh - Mountain Tauri Dev Mode with Sky Hot-Reload
#===============================================================================
#
# This script starts Mountain Tauri in development mode. The Sky dev server
# is automatically started via Tauri's beforeDevCommand configuration.
#
# Usage:
#   bash Maintain/Dev-Mountain.sh                    # Default: Mountain workbench
#   bash Maintain/Dev-Mountain.sh --profile wind     # Wind workbench
#   bash Maintain/Dev-Mountain.sh --profile electron # Electron workbench
#
# Workflow:
#   1. Sets environment variables (Mountain=true, NODE_ENV=development)
#   2. Starts Mountain Tauri in dev mode
#   3. Tauri automatically starts Sky via beforeDevCommand
#   4. Hot-reload works automatically when editing Sky source files
#
# Requirements:
#   - pnpm installed
#   - Rust toolchain installed
#   - Node.js 22+ recommended
#
#===============================================================================

set -e

# Default configuration
PROFILE="mountain"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --profile|-p)
            PROFILE="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --profile, -p <name>  Workbench profile to use"
            echo "  --help, -h            Show this help message"
            echo ""
            echo "Available profiles:"
            echo "  mountain  - Mountain workbench (80-90% features) [DEFAULT]"
            echo "  wind      - Wind workbench (60-70% features)"
            echo "  electron  - Electron workbench (95%+ features)"
            echo "  browser   - Browser workbench (70-80% features)"
            echo ""
            echo "Environment Variables:"
            echo "  Mountain=true     Enable Mountain workbench"
            echo "  Wind=true         Enable Wind workbench"
            echo "  Electron=true     Enable Electron workbench"
            echo "  Browser=true      Enable Browser workbench"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Default Mountain dev"
            echo "  $0 --profile wind                     # Wind workbench dev"
            echo "  $0 --profile electron                 # Electron workbench dev"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo "========================================"
echo "Land Mountain Dev Mode with Hot-Reload"
echo "========================================"
echo "Profile: $PROFILE"
echo "========================================"
echo ""

# Set environment variables based on profile
case $PROFILE in
    mountain)
        echo "Using Mountain workbench"
        export Mountain=true
        ;;
    wind)
        echo "Using Wind workbench"
        export Wind=true
        ;;
    electron)
        echo "Using Electron workbench"
        export Electron=true
        ;;
    browser)
        echo "Using Browser workbench"
        export Browser=true
        ;;
    *)
        echo "Unknown profile: $PROFILE"
        echo "Available profiles: mountain, wind, electron, browser"
        exit 1
        ;;
esac

# Set common development environment variables
export NODE_ENV=development
export Bundle=false
export Debug=true

echo ""
echo "========================================"
echo "Starting Mountain Tauri Development"
echo "========================================"
echo ""
echo "Note: Sky dev server will be auto-started via beforeDevCommand"
echo ""
echo "Hot-Reload: Enabled (changes to Sky source will auto-reload)"
echo ""
echo "To stop: Press Ctrl+C"
echo "========================================"
echo ""

# Change to Mountain directory and run Tauri dev
cd Element/Mountain

# Run Tauri dev - beforeDevCommand will automatically start Sky
# The TAURI_DEV_HOST is not needed since Sky runs on localhost:9999 by default
# and Tauri loads from the Sky dev server automatically
pnpm tauri dev
