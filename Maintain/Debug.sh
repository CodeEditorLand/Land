#!/usr/bin/env sh

#===============================================================================
# Debug.sh - Backward-Compatible Wrapper for Debug/Build.sh
#===============================================================================
#
# This script is a backward-compatible wrapper that delegates to
# Maintain/Debug/Build.sh for legacy compatibility.
#
# Usage:
#   sh Maintain/Debug.sh                    # Default debug profile
#   sh Maintain/Debug.sh --profile mountain # Debug with Mountain workbench
#
# For new development, consider using:
#   - Maintain/Debug/Build.sh - For debug builds
#   - Maintain/Debug/Run.sh   - For development runs with hot-reload
#
#===============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

exec "${SCRIPT_DIR}/Debug/Build.sh" "$@"
