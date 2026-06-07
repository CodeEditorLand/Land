#!/usr/bin/env bash
# Maintain/List/Fork.sh
#
# Lists all non-archived forks in CodeEditorLand and prints them as a
# ready-to-paste bash array block for use in a transfer script.
#
# Usage (run from Land/):
#   chmod +x Maintain/List/Fork.sh
#   ./Maintain/List/Fork.sh
#   ./Maintain/List/Fork.sh > forks.txt   # save to file

set -euo pipefail

ORG="CodeEditorLand"
PER_PAGE=100

if ! command -v gh &> /dev/null; then
	echo "ERROR: gh CLI not found. Install: https://cli.github.com/" >&2
	exit 1
fi

if ! gh auth status &> /dev/null; then
	echo "ERROR: Not authenticated. Run: gh auth login" >&2
	exit 1
fi

echo "Fetching forks from ${ORG} ..." >&2

ALL_FORKS=()
PAGE=1

while true; do
	# Fetch one page of repos, filter to forks only, extract names
	BATCH=$(
		gh api \
			--paginate=false \
			"orgs/${ORG}/repos?type=forks&per_page=${PER_PAGE}&page=${PAGE}" \
			--jq '.[] | select(.fork == true and .archived == false) | .name' \
			2> /dev/null
	)

	[[ -z "${BATCH}" ]] && break

	while IFS= read -r name; do
		ALL_FORKS+=("${name}")
	done <<< "${BATCH}"

	# Stop if we got fewer than a full page
	COUNT=$(echo "${BATCH}" | wc -l | tr -d ' ')
	[[ "${COUNT}" -lt "${PER_PAGE}" ]] && break

	PAGE=$((PAGE + 1))
done

echo "Found ${#ALL_FORKS[@]} forks." >&2
echo "" >&2

# ── Print ready-to-paste bash array ───────────────────────────────────────────
echo "# ── CodeEditorLand forks ($(date -u +%Y-%m-%d)) ─────────────────────────────────"
echo "REPOS_EXTRA=("
for name in "${ALL_FORKS[@]}"; do
	printf "    %s\n" "${name}"
done
echo ")"
