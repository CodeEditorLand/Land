#!/usr/bin/env sh

#===============================================================================
# Repository.sh - Full repository maintenance pass.
#===============================================================================
#
# Runs every repository-health script in the correct order:
#
#   1. Sync          - propagate .gitmodules URLs into local .git/config
#   2. AbsorbGitDirs - move embedded .git/ dirs into .git/modules/ tree
#   3. GarbageCollect - pack loose objects, prune unreachable (root + submodules)
#   4. CommitGraph   - write commit-graph cache (root + submodules)
#   5. PruneRemote   - remove stale remote-tracking refs (root + submodules)
#
# Usage:
#   sh Maintain/Repository.sh
#===============================================================================

set -e

Current=$(cd -- "$(dirname -- "$0")" > /dev/null 2>&1 && pwd)

sh "$Current/Repository/Sync.sh"
sh "$Current/Repository/AbsorbGitDirs.sh"
sh "$Current/Repository/GarbageCollect.sh"
sh "$Current/Repository/CommitGraph.sh"
sh "$Current/Repository/PruneRemote.sh"
