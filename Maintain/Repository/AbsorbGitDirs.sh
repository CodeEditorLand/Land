#!/usr/bin/env sh

#===============================================================================
# Repository/AbsorbGitDirs.sh - Move submodule .git dirs into parent repo.
#===============================================================================
#
# When a submodule is checked out as a full repository (i.e. it has a real
# .git/ directory rather than a .git file pointer), it is structurally
# detached from the parent repo's .git/modules/ tree. This breaks tooling
# that expects the canonical git-submodule layout and can cause `git status`
# to miss dirty-submodule markers.
#
# `git submodule absorbgitdirs` moves each embedded .git/ directory into
# .git/modules/<path>/ and leaves a .git file pointing back to it, restoring
# the correct structure in place.
#
# Safe to run on an already-correct checkout - it is a no-op when the dirs
# are already absorbed.
#
# Usage:
#   sh Maintain/Repository/AbsorbGitDirs.sh
#===============================================================================

Current=$(cd -- "$(dirname -- "$0")" > /dev/null 2>&1 && pwd)
Root=$(cd -- "$Current/../.." > /dev/null 2>&1 && pwd)

# shellcheck disable=SC2164
cd "$Root"

echo "[Repository/AbsorbGitDirs] Absorbing submodule .git dirs into parent"

git submodule absorbgitdirs

echo "[Repository/AbsorbGitDirs] Done"
