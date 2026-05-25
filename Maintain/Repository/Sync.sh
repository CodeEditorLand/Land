#!/usr/bin/env sh

#===============================================================================
# Repository/Sync.sh - Sync submodule URLs from .gitmodules into .git/config.
#===============================================================================
#
# Propagates every `url =` entry in .gitmodules down into the local
# .git/config (and each submodule's own config) so that remote mismatches
# like a module pointing at the wrong GitHub repo are corrected without a
# full re-clone.
#
# Run this after any .gitmodules edit or after manually fixing a remote URL
# via `git remote set-url`. The --recursive flag covers nested submodules.
#
# Usage:
#   sh Maintain/Repository/Sync.sh
#===============================================================================

Current=$(cd -- "$(dirname -- "$0")" > /dev/null 2>&1 && pwd)
Root=$(cd -- "$Current/../.." > /dev/null 2>&1 && pwd)

# shellcheck disable=SC2164
cd "$Root"

echo "[Repository/Sync] Syncing submodule URLs from .gitmodules"

git submodule sync --recursive

echo "[Repository/Sync] Done"
