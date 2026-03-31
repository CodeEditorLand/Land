#!/usr/bin/env bash

#===============================================================================
# Debug/Run.sh - Development Run Script with Hot-Reload Support
#===============================================================================
#
# This script starts the development server with hot-reload enabled.
# It reads configuration from .vscode/land-config.json.
#
# Usage:
# bash Maintain/Debug/Run.sh # Default debug profile
# bash Maintain/Debug/Run.sh --profile mountain # Run with Mountain workbench
# bash Maintain/Debug/Run.sh --profile electron # Run with Electron workbench
#
# Available profiles:
# debug - Default Browser workbench with hot-reload
# debug-mountain - Mountain workbench with hot-reload [RECOMMENDED]
# debug-electron - Electron workbench with hot-reload
#
# Features:
#   - Hot-reload enabled by default
#   - Watch mode for file changes
#   - Live-reload server on port 3001
#   - Profile-based configuration
#
#===============================================================================

set -e

# Default profile
PROFILE="debug"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --profile|-p)
      PROFILE="$2"
      shift 2
      ;;
    --no-hot-reload)
      export HOT_RELOAD=false
      shift
      ;;
    --no-watch)
      export WATCH=false
      shift
      ;;
    --port)
      export LIVE_RELOAD_PORT="$2"
      shift 2
      ;;
    --help|-h)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --profile, -p <name>   Run profile to use (default: debug)"
      echo "  --no-hot-reload        Disable hot-reload"
      echo "  --no-watch             Disable watch mode"
      echo "  --port <port>          Set live-reload port (default: 3001)"
      echo "  --help, -h             Show this help message"
      echo ""
      echo "Available profiles:"
      echo " debug - Browser workbench with hot-reload"
      echo " debug-mountain - Mountain workbench with hot-reload [RECOMMENDED]"
      echo " debug-electron - Electron workbench with hot-reload"
      echo ""
      echo "Features:"
      echo "  - Hot-reload: Automatically reload on file changes"
      echo "  - Watch mode: Watch for file changes and trigger rebuilds"
      echo "  - Live-reload: Development server with live-reload support"
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
echo "Land Development Run"
echo "========================================"
echo "Profile: $PROFILE"
echo "Hot-reload: ${HOT_RELOAD:-true}"
echo "Watch mode: ${WATCH:-true}"
echo "Live-reload port: ${LIVE_RELOAD_PORT:-3001}"
echo "========================================"

# Set environment variables based on profile
case $PROFILE in
  debug)
    echo "Using Browser workbench (default debug)"
    export Browser=true
    export Bundle=true
    export Clean=true
    export Compile=false
    export Debug=true
    export Level=silent
    export Dependency=Microsoft/VSCode
    export NODE_ENV=development
    export NODE_VERSION=22
    export NODE_OPTIONS="--max-old-space-size=16384"
    ;;
   debug-mountain)
    echo "Using Mountain workbench (RECOMMENDED)"
    export Mountain=true
    export Bundle=true
    export Clean=true
    export Compile=false
    export Debug=true
    export Level=silent
    export Dependency=Microsoft/VSCode
    export NODE_ENV=development
    export NODE_VERSION=22
    export NODE_OPTIONS="--max-old-space-size=16384"
    ;;
  debug-electron)
    echo "Using Electron workbench"
    export Electron=true
    export Bundle=true
    export Clean=true
    export Compile=false
    export Debug=true
    export Level=silent
    export Dependency=Microsoft/VSCode
    export NODE_ENV=development
    export NODE_VERSION=22
    export NODE_OPTIONS="--max-old-space-size=16384"
    ;;
  *)
  echo "Unknown profile: $PROFILE"
  echo "Available profiles: debug, debug-mountain, debug-electron"
  exit 1
  ;;
esac

# Run the development server
echo ""
echo "Starting development server with hot-reload..."
echo ""

# Use the Maintain binary in run mode
./Target/release/Maintain run --profile "$PROFILE"
