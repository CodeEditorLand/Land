#!/usr/bin/env sh

#===============================================================================
# Repository/PruneRemote.sh - Prune stale remote-tracking branches everywhere.
#===============================================================================
#
# Removes remote-tracking refs (origin/<branch>) for branches that no longer
# exist on the remote. These stale refs accumulate over time as feature
# branches are merged and deleted upstream, and they clutter `git branch -r`
# output and IDE branch lists.
#
# Runs `git remote prune origin` on the root repo and on every submodule.
# Submodule failures are non-fatal - a submodule with no remote configured
# will print a warning but the loop continues.
#
# Usage:
#   sh Maintain/Repository/PruneRemote.sh
#===============================================================================

Current=$(cd -- "$(dirname -- "$0")" > /dev/null 2>&1 && pwd)
Root=$(cd -- "$Current/../.." > /dev/null 2>&1 && pwd)

# shellcheck disable=SC2164
cd "$Root"

echo "[Repository/PruneRemote] Pruning stale remote-tracking branches in root"

git remote prune origin

echo "[Repository/PruneRemote] Pruning stale remote-tracking branches in submodules"

git submodule foreach --recursive 'git remote prune origin 2>/dev/null || true'

echo "[Repository/PruneRemote] Done"
