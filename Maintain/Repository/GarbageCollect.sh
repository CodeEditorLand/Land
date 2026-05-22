#!/usr/bin/env sh

#===============================================================================
# Repository/GarbageCollect.sh - Garbage-collect and prune root + submodules.
#===============================================================================
#
# Packs loose objects into pack files, removes unreachable objects older than
# the grace period, and compresses the object store. Runs on the root repo
# first, then on every submodule via `git submodule foreach --recursive`.
#
# --prune=now expires ALL unreachable objects immediately rather than waiting
# for the default 2-week grace window. Safe for local development repos where
# there is no concurrent `git fetch` or `git repack` running.
#
# Submodule failures are non-fatal - a submodule that is mid-fetch or has a
# locked index will produce a warning but the loop continues.
#
# Usage:
#   sh Maintain/Repository/GarbageCollect.sh
#===============================================================================

Current=$(cd -- "$(dirname -- "$0")" > /dev/null 2>&1 && pwd)
Root=$(cd -- "$Current/../.." > /dev/null 2>&1 && pwd)

# shellcheck disable=SC2164
cd "$Root"

echo "[Repository/GarbageCollect] Collecting garbage in root"

git gc --prune=now

echo "[Repository/GarbageCollect] Collecting garbage in submodules"

git submodule foreach --recursive 'git gc --prune=now || true'

echo "[Repository/GarbageCollect] Done"
