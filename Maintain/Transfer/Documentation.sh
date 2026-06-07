#!/usr/bin/env bash
# transfer_documentation_repos.sh
#
# Transfers ALL DocumentationRust repositories from CodeEditorLand
# → DocumentationCodeEditorLand organization.
#
# Source: every DocumentationRust submodule entry found in:
#   - Land/.gitmodules                       (1 repo)
#   - Land/Element/Air/.gitmodules           (1 repo)
#   - Land/Element/Common/.gitmodules        (1 repo)
#   - Land/Element/Echo/.gitmodules          (1 repo)
#   - Land/Element/Grove/.gitmodules         (1 repo)
#   - Land/Element/Maintain/.gitmodules      (1 repo)
#   - Land/Element/Mist/.gitmodules          (1 repo)
#   - Land/Element/Mountain/.gitmodules      (1 repo)
#   - Land/Element/Rest/.gitmodules          (1 repo)
#   - Land/Element/SideCar/.gitmodules       (1 repo)
#   Total: 10 repos
#
# Repos under Land/Dependency/** and Land/Element/* (the elements themselves)
# are intentionally excluded - those stay in CodeEditorLand /
# DependencyCodeEditorLand.
#
# Prerequisites:
#   gh CLI installed and authenticated (gh auth login)
#   You must be an owner of BOTH orgs
#   DocumentationCodeEditorLand org must already exist on GitHub
#
# Usage:
#   chmod +x transfer_documentation_repos.sh
#   DRY_RUN=1 ./transfer_documentation_repos.sh   # preview only
#   ./transfer_documentation_repos.sh             # real run

set -euo pipefail

SOURCE_ORG="CodeEditorLand"
DEST_ORG="DocumentationCodeEditorLand"
DRY_RUN="${DRY_RUN:-0}"
FAILED=()
SKIPPED=()
SUCCESS=()

# ── Land/.gitmodules ───────────────────────────────────────────────────────────
REPOS_LAND_ROOT=(
	RustDocumentationLand
)

# ── Land/Element/*/. gitmodules (one DocumentationRust per element) ────────────
REPOS_ELEMENT_DOCUMENTATION=(
	RustDocumentationAirLand
	RustDocumentationCommonLand
	RustDocumentationEchoLand
	RustDocumentationGroveLand
	RustDocumentationMaintainLand
	RustDocumentationMistLand
	RustDocumentationMountainLand
	RustDocumentationRestLand
	RustDocumentationSideCarLand
)

# Combine all groups
ALL_REPOS=(
	"${REPOS_LAND_ROOT[@]}"
	"${REPOS_ELEMENT_DOCUMENTATION[@]}"
)

# Deduplicate while preserving order
UNIQUE_REPOS=()
for r in "${ALL_REPOS[@]}"; do
	found=0
	if [[ ${#UNIQUE_REPOS[@]} -gt 0 ]]; then
		for existing in "${UNIQUE_REPOS[@]}"; do
			if [[ "$existing" == "$r" ]]; then
				found=1
				break
			fi
		done
	fi
	if [[ $found -eq 0 ]]; then
		UNIQUE_REPOS+=("$r")
	fi
done

echo "=================================================================="
echo "  CodeEditorLand → DocumentationCodeEditorLand  |  Documentation repos"
echo "=================================================================="
echo "  Source org : $SOURCE_ORG"
echo "  Dest org   : $DEST_ORG"
echo "  Total repos: ${#UNIQUE_REPOS[@]}"
echo "  Dry run    : $DRY_RUN"
echo ""
echo "  Scope: ONLY DocumentationRust submodules in Land/** .gitmodules"
echo "  Excluded:  Dependency/*, Element/* (elements themselves)"
echo "=================================================================="
echo ""

if ! command -v gh &> /dev/null; then
	echo "ERROR: gh CLI not found. Install: https://cli.github.com/" >&2
	exit 1
fi

if ! gh auth status &> /dev/null; then
	echo "ERROR: Not authenticated. Run: gh auth login" >&2
	exit 1
fi

transfer_repo() {
	local REPO="$1"
	local FULL="${SOURCE_ORG}/${REPO}"

	if ! gh repo view "$FULL" &> /dev/null 2>&1; then
		printf "  [SKIP]  %-55s not found / no access\n" "$REPO"
		SKIPPED+=("$REPO")
		return
	fi

	if gh repo view "${DEST_ORG}/${REPO}" &> /dev/null 2>&1; then
		printf "  [SKIP]  %-55s already in %s\n" "$REPO" "$DEST_ORG"
		SKIPPED+=("$REPO")
		return
	fi

	if [[ "$DRY_RUN" == "1" ]]; then
		printf "  [DRY]   %-55s would transfer\n" "$REPO"
		SUCCESS+=("$REPO")
		return
	fi

	printf "  [XFER]  %-55s ... " "$REPO"
	if
		gh api \
			--method POST \
			"repos/${FULL}/transfer" \
			-f "new_owner=${DEST_ORG}" \
			--silent 2> /dev/null
	then
		echo "OK"
		SUCCESS+=("$REPO")
	else
		echo "FAILED"
		FAILED+=("$REPO")
	fi

	# Respect GitHub's transfer rate limits
	sleep 0.5
}

echo "── Land root (${#REPOS_LAND_ROOT[@]} repo) ──────────────────────────────────────────"
for r in "${REPOS_LAND_ROOT[@]}"; do transfer_repo "$r"; done

echo ""
echo "── Land/Element/*/DocumentationRust (${#REPOS_ELEMENT_DOCUMENTATION[@]} repos) ────────"
for r in "${REPOS_ELEMENT_DOCUMENTATION[@]}"; do transfer_repo "$r"; done

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
fi
