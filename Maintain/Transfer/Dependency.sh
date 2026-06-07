#!/usr/bin/env bash
# Maintain/Transfer/Dependency.sh
#
# Dynamically transfers ALL repositories referenced under Land/Dependency/**
# (.gitmodules) from CodeEditorLand → DependencyCodeEditorLand organization.
#
# At runtime the script:
#   1. find(1)s every .gitmodules under Land/Dependency/
#   2. greps every ssh://git@github.com/CodeEditorLand/<REPO>.git URL
#   3. deduplicates the list
#   4. transfers each repo that still lives in the source org
#
# Repos under Land/Element/ and Land/Documentation/ are never touched
# because we only descend into Land/Dependency/.
#
# Prerequisites:
#   gh CLI installed and authenticated (gh auth login)
#   You must be an owner of BOTH orgs
#   DependencyCodeEditorLand org must already exist on GitHub
#
# Usage (run from Land/):
#   chmod +x Maintain/Transfer/Dependency.sh
#   DRY_RUN=1 ./Maintain/Transfer/Dependency.sh   # preview only
#   ./Maintain/Transfer/Dependency.sh             # real run

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────
SOURCE_ORG="CodeEditorLand"
DEST_ORG="DependencyCodeEditorLand"
DRY_RUN="${DRY_RUN:-0}"

# Resolve the script's location so it works from any CWD.
# Expected layout:  Land/Maintain/Transfer/Dependency.sh
#                   Land/Dependency/
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAND_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
DEPENDENCY_ROOT="${LAND_ROOT}/Dependency"

FAILED=()
SKIPPED=()
SUCCESS=()

# ── Sanity checks ─────────────────────────────────────────────────────────────
if ! command -v gh &> /dev/null; then
	echo "ERROR: gh CLI not found. Install: https://cli.github.com/" >&2
	exit 1
fi

if ! gh auth status &> /dev/null; then
	echo "ERROR: Not authenticated. Run: gh auth login" >&2
	exit 1
fi

if [[ ! -d "${DEPENDENCY_ROOT}" ]]; then
	echo "ERROR: Dependency directory not found: ${DEPENDENCY_ROOT}" >&2
	echo "       Run this script from Land/ or ensure the path is correct." >&2
	exit 1
fi

# ── Discover repos dynamically ────────────────────────────────────────────────
# Collect every unique repo name referenced as:
#   url = ssh://git@github.com/CodeEditorLand/<REPO>.git
# across ALL .gitmodules files under Land/Dependency/.
#
# Uses a plain space-delimited string for dedup - compatible with bash 3.2
# (macOS ships bash 3.2; declare -A requires bash 4+).

echo "Scanning .gitmodules under ${DEPENDENCY_ROOT} ..."

SEEN="" # space-delimited list of already-added repo names
UNIQUE_REPOS=()

while IFS= read -r gitmodules_file; do
	while IFS= read -r line; do
		# Strip leading whitespace
		line="${line#"${line%%[![:space:]]*}"}"

		# Match:  url = ssh://git@github.com/CodeEditorLand/<REPO>.git
		if [[ "${line}" =~ ^url[[:space:]]*=[[:space:]]*ssh://git@github\.com/CodeEditorLand/(.+)\.git$ ]]; then
			repo="${BASH_REMATCH[1]}"

			# Dedup: skip if already in SEEN (bash 3.2-safe)
			case " ${SEEN} " in
				*" ${repo} "*) ;; # already recorded
				*)
					SEEN="${SEEN} ${repo}"
					UNIQUE_REPOS+=("${repo}")
					;;
			esac
		fi
	done < <(grep -E '^\s*url\s*=\s*ssh://git@github\.com/CodeEditorLand/' \
		"${gitmodules_file}" 2> /dev/null || true)
done < <(find "${DEPENDENCY_ROOT}" -name ".gitmodules" -type f | sort)

echo "=================================================================="
echo "  CodeEditorLand → DependencyCodeEditorLand  |  Dependency repos"
echo "=================================================================="
echo "  Source org  : ${SOURCE_ORG}"
echo "  Dest org    : ${DEST_ORG}"
echo "  Repos found : ${#UNIQUE_REPOS[@]}"
echo "  Dry run     : ${DRY_RUN}"
echo ""
echo "  Scope   : ONLY repos under Land/Dependency/** .gitmodules"
echo "  Excluded: Element/*, Documentation/*"
echo "=================================================================="
echo ""

if [[ ${#UNIQUE_REPOS[@]} -eq 0 ]]; then
	echo "ERROR: No repos discovered. Are the git submodules initialised?" >&2
	echo "       Run: git submodule update --init --recursive -- Dependency" >&2
	exit 1
fi

# ── Transfer function ─────────────────────────────────────────────────────────
transfer_repo() {
	local REPO="$1"
	local FULL="${SOURCE_ORG}/${REPO}"

	# Skip if not accessible in source org
	if ! gh repo view "${FULL}" &> /dev/null 2>&1; then
		printf "  [SKIP]  %-60s not found / no access\n" "${REPO}"
		SKIPPED+=("${REPO}")
		return
	fi

	# Skip if already present in dest org
	if gh repo view "${DEST_ORG}/${REPO}" &> /dev/null 2>&1; then
		printf "  [SKIP]  %-60s already in %s\n" "${REPO}" "${DEST_ORG}"
		SKIPPED+=("${REPO}")
		return
	fi

	if [[ "${DRY_RUN}" == "1" ]]; then
		printf "  [DRY]   %-60s would transfer\n" "${REPO}"
		SUCCESS+=("${REPO}")
		return
	fi

	printf "  [XFER]  %-60s ... " "${REPO}"
	if gh api \
		--method POST \
		"repos/${FULL}/transfer" \
		-f "new_owner=${DEST_ORG}" \
		--silent 2> /dev/null; then
		echo "OK"
		SUCCESS+=("${REPO}")
	else
		echo "FAILED"
		FAILED+=("${REPO}")
	fi

	# Respect GitHub's transfer rate limits
	sleep 0.5
}

# ── Transfer all discovered repos ─────────────────────────────────────────────
echo "── Transferring ${#UNIQUE_REPOS[@]} repos ───────────────────────────────────────"
for r in "${UNIQUE_REPOS[@]}"; do
	transfer_repo "${r}"
done

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "=================================================================="
echo "  Summary"
echo "=================================================================="
echo "  Transferred : ${#SUCCESS[@]}"
echo "  Skipped     : ${#SKIPPED[@]}"
echo "  Failed      : ${#FAILED[@]}"

if [[ ${#FAILED[@]} -gt 0 ]]; then
	echo ""
	echo "  Failed - retry individually:"
	for r in "${FAILED[@]}"; do
		echo "    gh api --method POST repos/${SOURCE_ORG}/${r}/transfer -f new_owner=${DEST_ORG}"
	done
	exit 1
fi
