#!/usr/bin/env sh

#===============================================================================
# Repository/CommitGraph.sh - Write commit-graph for root + submodules.
#===============================================================================
#
# The commit-graph file is a binary cache that speeds up reachability queries
# used by `git log`, `git status`, `git merge-base`, and IDE integrations.
# On a repo with deep history (like Microsoft/vscode dependencies) the speedup
# for operations that traverse ancestry can be 10-100×.
#
# --reachable     walks all refs so every reachable commit is indexed
# --changed-paths additionally records the set of paths changed per commit,
#                 which accelerates `git log -- <path>` and blame queries
#
# Submodule failures are non-fatal - a freshly-cloned submodule with no pack
# file will print a warning but the loop continues.
#
# Usage:
#   sh Maintain/Repository/CommitGraph.sh
#===============================================================================

Current=$(cd -- "$(dirname -- "$0")" >/dev/null 2>&1 && pwd)
Root=$(cd -- "$Current/../.." >/dev/null 2>&1 && pwd)

cd "$Root"

echo "[Repository/CommitGraph] Writing commit graph for root"

git commit-graph write --reachable --changed-paths

echo "[Repository/CommitGraph] Writing commit graph for submodules"

git submodule foreach --recursive \
	'git commit-graph write --reachable --changed-paths 2>/dev/null || true'

echo "[Repository/CommitGraph] Done"
