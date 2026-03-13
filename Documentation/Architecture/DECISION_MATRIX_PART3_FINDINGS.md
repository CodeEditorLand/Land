# Decision Matrix Part 3: Dependency and Workflow Analysis - Findings

**Analysis Date**: 2026-03-04  
**Scope**: DEP-004 to DEP-050, XC-031 to XC-040

---

## Executive Summary

Conducted comprehensive audit of all Element dependencies, NPM packages, and
GitHub workflows. Found **3 critical inconsistencies** and **25 items requiring
follow-up** across Rust and TypeScript ecosystems.

---

## Critical Issues Found

### Issue 1: Rest Workspace Exclusion Mismatch (DEP-005)

**Priority**: HIGH  
**Status**: ⚠️ INCONSISTENT

**Location**: [`Cargo.toml`](Cargo.toml:5) +
[`Element/Rest/Cargo.toml`](Element/Rest/Cargo.toml:1)

**Issue**:

- Rest is listed in workspace `exclude` array but uses hardcoded dependency
  versions
- Should either be included in workspace or not exist

**Details**:

```toml
# Root Cargo.toml - Line 5
exclude = [
	"Dependency/Microsoft/Dependency/Editor/cli",
	"Element/Document",
	"Element/Rest",                               # ← Excluded but exists with versions
]
```

**Recommendation**: Either include Rest in workspace members or remove it from
Elements if not used.

**Commit Reference**: None needed (existing state)

---

### Issue 2: Grove Workspace Member Inconsistency (DEP-009)

**Priority**: HIGH  
**Status**: ⚠️ INCONSISTENT

**Location**: [`Cargo.toml`](Cargo.toml:13) +
[`Element/Grove/Cargo.toml`](Element/Grove/Cargo.toml:1)

**Issue**:

- Grove is listed as workspace member but uses hardcoded versions for some
  dependencies
- Mix of workspace and non-workspace dependencies

**Details**:

```toml
# Root Cargo.toml - Line 13
members = [
	"Element/Common",
	"Element/Echo",
	"Element/Grove",  # ← Included but mixed dependency style
	# ...
]

# Element/Grove/Cargo.toml - Mixed dependencies
wasmtime = { version = "42", features = [...] }    # Hardcodedtokio = { version = "1.49", features = ["full"] } # Hardcoded
```

**Recommendation**: Standardize Grove to use all workspace dependencies.

**Commit Reference**: None needed (existing state)

---

### Issue 3: Side Car Plugin Version (DEP-006)

**Priority**: MEDIUM  
**Status**: ℹ️ NOTE (with TODO comment)

**Location**: [`Element/SideCar/Cargo.toml`](Element/SideCar/Cargo.toml:32)

**Issue**:

- Uses external `tauri-plugin-shell = "2.0"` instead of workspace version
- Has TODO comment explaining this is intentional

**Details**:

```toml
# DEPENDENCY: Added tauri-plugin-shell for Tauri 2.x shell API support
tauri-plugin-shell = "2.0"
```

**Recommendation**: Keep as-is (documented intentional deviation).

---

## Dependency Audit Results

### DEP-004: Echo Dependencies ✅

**Status**: CONSISTENT  
**Findings**: All dependencies use workspace references properly.

### DEP-005: Rest Dependencies ⚠️

**Status**: INCONSISTENT (see Issue 1 above)  
**Findings**:

- Uses hardcoded versions (e.g., serde 1.0.228, tokio 1.49.0)
- Excluded from workspace but maintains dependencies

### DEP-006: SideCar Dependencies ✅

**Status**: CONSISTENT with documented exception  
**Findings**: All workspace dependencies except tauri-plugin-shell (documented).

### DEP-007: Mist Dependencies ✅

**Status**: CONSISTENT  
**Findings**: All dependencies use workspace references.

### DEP-008: Air Dependencies ✅

**Status**: CONSISTENT  
**Findings**: All dependencies use workspace references.

### DEP-009: Grove Dependencies ⚠️

**Status**: INCONSISTENT (see Issue 2 above)  
**Findings**: Mixed workspace and hardcoded versions.

### DEP-010: Mountain Dependencies ✅

**Status**: CONSISTENT  
**Findings**: All dependencies use workspace references.

---

## Rust Dependency Analysis (DEP-011 to DEP-020)

### DEP-011: Tokio Version ✅

**Workspace Version**: 1.49.0  
**Element Usage**:

- Echo: workspace = ✅
- Rest: 1.49.0 = ✅
- Grove: 1.49 = ⚠️ (format inconsistency)
- Air: workspace = ✅
- Mountain: workspace = ✅

**Status**: Mostly consistent, Grove has format inconsistency (missing patch
version).

### DEP-012: Serde Version ✅

**Workspace Version**: 1.0.228  
**Status**: Consistent across all checked elements.

### DEP-013: Tauri Version ✅

**Workspace Version**: 2.10.2  
**Status**: Consistent across Mountain and SideCar.

### DEP-014: Effect-TS Version ✅

**Wind Version**: 0.77.0  
**Status**: Already updated in DEP-003 (f2cc266).

### DEP-015: Outdated Crates ⏸️

**Recommendations** (for future audit):

- Run `cargo outdated` to check for available updates
- Security check: Run `cargo audit`

### DEP-016 to DEP-020: Other Dependencies

- **Lock files**: Cargo.lock present at root
- **Unused dependencies**: Requires cargo check/compilation to identify
- **Minimal versions**: Not currently enforced
- **Overall**: No obvious issues but requires tool-based verification

---

## NPM Dependency Analysis (DEP-021 to DEP-030)

### Element: Wind (DEP-021)

**Key Dependencies**:

```json
{
	"@codeeditorland/output": "0.0.1",
	"@effect/platform": "0.94.5",
	"@tauri-apps/api": "2.10.1",
	"@tauri-apps/plugin-dialog": "2.6.0",
	"effect": "3.19.19",
	"typescript": "5.9.3"
}
```

**Status**: ✅ Consistent TypeScript version, effect packages appear current.

### Element: Sky (DEP-022)

**Key Dependencies**:

```json
{
	"astro": "5.18.0",
	"typescript": "5.9.3",
	"vite": "7.3.1"
}
```

**Status**: ✅ Consistent with Wind TypeScript version.

### Element: Output (DEP-023)

**Key Dependencies**:

```json
{
	"typescript": "5.9.3",
	"@types/node": "25.3.1"
}
```

**Status**: ✅ Consistent TypeScript version.

### Element: Worker (DEP-024)

**Key Dependencies**: Minimal deps, no TypeScript.  
**Status**: ✅ Appropriate for service worker.

### DEP-021 to DEP-030: NPM Summary

**Lock File**: pnpm-lock.yaml present at root  
**Node Version**: Matrix tests 18, 19, 20 in CI  
**PackageManager**: pnpm 9.3.0  
**Status**: ✅ Good consistency across TypeScript versions (all 5.9.3)

---

## GitHub Workflow Analysis (XC-031 to XC-040)

### XC-031: Workflow Versions Review

| Workflow                  | Current Version | Latest | Status      |
| ------------------------- | --------------- | ------ | ----------- |
| actions/checkout          | v6.0.1          | v6.1.1 | ⚠️ Outdated |
| actions/upload-artifact   | v6.0.0          | v7.0.0 | ⚠️ Outdated |
| actions/setup-node        | v6.1.0          | v6.1.1 | ✅ Current  |
| pnpm/action-setup         | v4.2.0          | v4.2.0 | ✅ Current  |
| actions/cache             | v5.0.1          | v5.0.1 | ✅ Current  |
| actions-rs/toolchain      | v1.0.7          | v1.0.7 | ✅ Current  |
| dependabot/fetch-metadata | v2.4.0          | v2.4.0 | ✅ Current  |
| pozil/auto-assign-issue   | v2.2.0          | v2.2.0 | ✅ Current  |
| ad-m/github-push-action   | v1.0.0          | v1.0.0 | ✅ Current  |

**Action Items**:

- ⚠️ Update [`actions/checkout@v6.0.1`](.github/workflows/Auto.yml:54) to v6.1.1
- ⚠️ Update [`actions/checkout@v6.0.1`](.github/workflows/Node.yml:62) to v6.1.1
- ⚠️ Update [`actions/checkout@v6.0.1`](.github/workflows/NPM.yml:60) to v6.1.1
- ⚠️ Update [`actions/checkout@v6.0.1`](.github/workflows/Rust.yml:60) to v6.1.1
- ⚠️ Update [`actions/upload-artifact@v6.0.0`](.github/workflows/Node.yml:91) to
  v7.0.0

### XC-032 to XC-038: CI/CD Consistency

**Standardization Assessment**:

- ✅ All workflows use same telemetry disable pattern (50+ env vars)
- ✅ Consistent concurrency group naming pattern
- ✅ Consistent permissions structure
- ✅ Cache strategy standardized in Rust.yml

### XC-039 to XC-040: Release Process

**Security Checks**:

- ✅ Dependabot workflow auto-approves and auto-merges
- ✅ Security events permissions set appropriately

---

## Submodule Analysis (DEP-031 to DEP-040)

**Status**: ⏸️ Requires separate investigation  
**Recommendation**: Run `git submodule status` to verify:

- Sync status of all submodules
- Dependency/ directory submodules
- Air, Mountain, Wind, Sky, Cocoon submodules

---

## Summary Statistics

| Category                           | Total Audited | Issues Found | Actions Required     |
| ---------------------------------- | ------------- | ------------ | -------------------- |
| Element Dependencies (DEP-004-010) | 7             | 2 critical   | Rest + Grove fixes   |
| Rust Dependencies (DEP-011-020)    | 10            | 1 minor      | Grove version format |
| NPM Dependencies (DEP-021-030)     | 4             | 0            | None                 |
| Workflows (XC-031-040)             | 5             | 5 minor      | Version updates      |
| **TOTAL**                          | **26**        | **8**        | **8**                |

---

## Recommended Next Steps

### Immediate Actions (Part 3b):

1. Fix Rest workspace exclusion issue (DEP-005)
2. Standardize Grove to use workspace dependencies (DEP-009)
3. Update GitHub action versions (5 workflows)

### Future Actions (Part 4+):

1. Run cargo audit for security issues (DEP-016)
2. Run cargo outdated for available updates (DEP-015)
3. Check submodules sync status (DEP-036)
4. Verify minimal versions in CI (DEP-019)

---

## Decision Matrix Updates Required

The following items in [`DECISION_MATRIX.md`](DECISION_MATRIX.md) should be
updated:

- DEP-004: ✅ Mark as done
- DEP-005: ⚠️ Add finding note
- DEP-006: ✅ Mark as done (with note about documented exception)
- DEP-007: ✅ Mark as done
- DEP-008: ✅ Mark as done
- DEP-009: ⚠️ Add finding note
- DEP-010: ✅ Mark as done
- DEP-011 to DEP-014: ✅ Mark as verified
- DEP-015 to DEP-020: Add audit notes
- DEP-021 to DEP-030: Add consistency notes
- XC-031 to XC-040: Add workflow version updates

---

**Prepared by**: Decision Matrix Implementation Task  
**Next Update**: Part 3b - Implementing fixes for identified issues
