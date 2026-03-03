#!/usr/bin/env bash

#===============================================================================
# Debug.sh - Backward-Compatible Wrapper for Debug/Build.sh
#===============================================================================
#
# This script is a backward-compatible wrapper that delegates to
# Maintain/Debug/Build.sh for legacy compatibility.
#
# Usage:
# bash Maintain/Debug.sh # Default debug profile
# bash Maintain/Debug.sh --profile mountain # Debug with Mountain workbench
#
# For new development, consider using:
#   - Maintain/Debug/Build.sh - For debug builds
#   - Maintain/Debug/Run.sh   - For development runs with hot-reload
#
#===============================================================================

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Delegate to Debug/Build.sh
exec "${SCRIPT_DIR}/Debug/Build.sh" "$@"
