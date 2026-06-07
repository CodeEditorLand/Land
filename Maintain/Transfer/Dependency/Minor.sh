#!/usr/bin/env bash
# Maintain/Transfer/Pending.sh
#
# One-shot transfer of 16 specific repos → DependencyCodeEditorLand
#
# Usage:
#   chmod +x Maintain/Transfer/Pending.sh
#   DRY_RUN=1 ./Maintain/Transfer/Pending.sh
#   ./Maintain/Transfer/Pending.sh

set -euo pipefail

SOURCE_ORG="CodeEditorLand"
DEST_ORG="DependencyCodeEditorLand"
DRY_RUN="${DRY_RUN:-0}"

REPOS=(
    DependencyBiomeCargo
    DependencyBiomeNPM
    DependencyBiomeDependency
    DependencyOXCCargo
    DependencyOXCNPM
    DependencyOXCDependency
    DependencyRolldownCargo
    DependencyRolldownNPM
    DependencyRolldownDependency
    DependencySWCCargo
    DependencySWCNPM
    DependencySWCDependency
    DependencyVercelCargo
    DependencyVercelNPM
    DependencyVercelDependency
    DocumentationLand
)

FAILED=()
SKIPPED=()
SUCCESS=()

if ! command -v gh &>/dev/null; then
    echo "ERROR: gh CLI not found." >&2; exit 1
fi
if ! gh auth status &>/dev/null; then
    echo "ERROR: Not authenticated. Run: gh auth login" >&2; exit 1
fi

echo "======================================================"
echo "  Transferring ${#REPOS[@]} repos → ${DEST_ORG}"
echo "  Dry run: ${DRY_RUN}"
echo "======================================================"
echo ""

for REPO in "${REPOS[@]}"; do
    FULL="${SOURCE_ORG}/${REPO}"

    if ! gh repo view "${FULL}" &>/dev/null 2>&1; then
        printf "  [SKIP]  %-50s not found / no access\n" "${REPO}"
        SKIPPED+=("${REPO}"); continue
    fi

    if gh repo view "${DEST_ORG}/${REPO}" &>/dev/null 2>&1; then
        printf "  [SKIP]  %-50s already in %s\n" "${REPO}" "${DEST_ORG}"
        SKIPPED+=("${REPO}"); continue
    fi

    if [[ "${DRY_RUN}" == "1" ]]; then
        printf "  [DRY]   %-50s would transfer\n" "${REPO}"
        SUCCESS+=("${REPO}"); continue
    fi

    printf "  [XFER]  %-50s ... " "${REPO}"
    if gh api --method POST "repos/${FULL}/transfer" \
              -f "new_owner=${DEST_ORG}" --silent 2>/dev/null; then
        echo "OK"
        SUCCESS+=("${REPO}")
    else
        echo "FAILED"
        FAILED+=("${REPO}")
    fi

    sleep 0.5
done

echo ""
echo "======================================================"
echo "  Transferred : ${#SUCCESS[@]}"
echo "  Skipped     : ${#SKIPPED[@]}"
echo "  Failed      : ${#FAILED[@]}"

if [[ ${#FAILED[@]} -gt 0 ]]; then
    echo ""
    echo "  Retry individually:"
    for r in "${FAILED[@]}"; do
        echo "    gh api --method POST repos/${SOURCE_ORG}/${r}/transfer -f new_owner=${DEST_ORG}"
    done
    exit 1
fi
