#!/usr/bin/env sh

# Save (add + ecommit + push + pull) every tracked dependency/element repo.
# A missing directory, a missing git binary or a missing `ecommit` command
# must warn and move on instead of aborting the whole sweep. This matters
# here because several entries are declared submodules that are absent from
# a fresh clone (Biome, OXC, Rolldown, Vercel).

if ! command -v git >/dev/null 2>&1; then
	echo "[Save] WARN: git binary not found on PATH - nothing to save." >&2
	exit 0
fi

Current=$(cd -- "$(dirname -- "$0")" >/dev/null 2>&1 && pwd)

# `git ecommit` is a convenience alias, not a git builtin. Detect it once
# so a machine without it degrades to a warning and a plain add/push/pull.
HaveEcommit=0
if git config --get alias.ecommit >/dev/null 2>&1 \
	|| command -v git-ecommit >/dev/null 2>&1; then
	HaveEcommit=1
else
	echo "[Save] WARN: 'git ecommit' is not available as an alias or a git-ecommit binary - skipping the commit step." >&2
fi

Saved=0
Skipped=0

for Dependency in \
	"./" \
	"./Dependency/" \
	"./Dependency/Biome/" \
	"./Dependency/Biome/Cargo/" \
	"./Dependency/Biome/Dependency/" \
	"./Dependency/Biome/NPM/" \
	"./Dependency/Microsoft/" \
	"./Dependency/Microsoft/Cargo/" \
	"./Dependency/Microsoft/Dependency/" \
	"./Dependency/Microsoft/NPM/" \
	"./Dependency/Microsoft/NPM/Common/" \
	"./Dependency/Microsoft/NPM/Ingress/" \
	"./Dependency/OXC/" \
	"./Dependency/OXC/Cargo/" \
	"./Dependency/OXC/Dependency/" \
	"./Dependency/OXC/NPM/" \
	"./Dependency/Rolldown/" \
	"./Dependency/Rolldown/Cargo/" \
	"./Dependency/Rolldown/Dependency/" \
	"./Dependency/Rolldown/NPM/" \
	"./Dependency/SWC/" \
	"./Dependency/SWC/Cargo/" \
	"./Dependency/SWC/Dependency/" \
	"./Dependency/SWC/NPM/" \
	"./Dependency/Tauri/" \
	"./Dependency/Tauri/Cargo/" \
	"./Dependency/Tauri/Dependency/" \
	"./Dependency/Tauri/NPM/" \
	"./Dependency/Vercel/" \
	"./Dependency/Vercel/Cargo/" \
	"./Dependency/Vercel/Dependency/" \
	"./Dependency/Vercel/NPM/" \
	"./Element/" \
	"./Element/Echo/" \
	"./Element/Mountain/" \
	"./Element/Output/" \
	"./Element/Rest/" \
	"./Element/Sky/" \
	"./Element/Wind/"; do

	Target="$Current/../$Dependency"

	# A missing submodule must not abort the rest of the sweep.
	if [ ! -d "$Target" ]; then
		echo "[Save] WARN: directory not found: $Dependency (submodule not initialized?) - skipping." >&2
		Skipped=$((Skipped + 1))
		continue
	fi

	# (
	if ! cd "$Target"; then
		echo "[Save] WARN: could not enter $Dependency - skipping." >&2
		Skipped=$((Skipped + 1))
		continue
	fi

	pwd

	git add .

	if [ "$HaveEcommit" = "1" ]; then
		if ! git ecommit; then
			echo "[Save] WARN: 'git ecommit' failed in $Dependency - continuing." >&2
		fi
	fi

	if ! git push; then
		echo "[Save] WARN: 'git push' failed in $Dependency - continuing." >&2
	fi

	if ! git pull; then
		echo "[Save] WARN: 'git pull' failed in $Dependency - continuing." >&2
	fi

	cd - >/dev/null 2>&1 || exit
	Saved=$((Saved + 1))
	# ) &
done

# wait

echo "[Save] Done: $Saved processed, $Skipped skipped."
