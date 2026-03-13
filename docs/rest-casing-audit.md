# Rest Casing Audit Report

**Generated:** 2026-03-06  
**Purpose:** Comprehensive inventory of all "rest"/"Rest" inconsistent casing across the CodeEditorLand project  
**Goal:** Standardize all references to PascalCase "Rest"

---

## Executive Summary

This audit identified **inconsistent casing** of "Rest" throughout the CodeEditorLand project. The project uses **PascalCase "Rest"** as the official naming convention for the compiler/build tool element, but several files contain lowercase "rest" that needs to be standardized.

### Key Findings

| Category | Inconsistent Instances | Requires Fix |
|----------|----------------------|--------------|
| Binary/Executable Names | 4 files | ✅ Yes |
| CLI Wrapper Scripts | 2 files | ✅ Yes |
| Build Scripts (.sh) | 5 occurrences | ✅ Yes |
| Documentation (Markdown) | 81 files | ⚠️ Context-dependent |
| Skill Files (.md) | 108 occurrences | ✅ Yes |
| TypeScript/JavaScript Source | 75 occurrences | ⚠️ Context-dependent |
| Rust Source | 36 occurrences | ⚠️ Context-dependent |
| Configuration Files | 7 files | ✅ Yes |

---

## 1. Summary Table

| File Type | Count | Examples | Status |
|-----------|-------|----------|--------|
| **Rust files** | 10 | `Element/Rest/Source/Fn/Bundle/builder.rs`, `Element/Air/Source/Security/mod.rs` | ⚠️ Variable names OK |
| **TypeScript files** | 12 | `Element/Output/Source/ESBuild/RestPlugin.ts`, `Element/Wind/Source/FileSystem/Type/URI.ts` | ⚠️ Context-dependent |
| **JavaScript files** | 8 | `Element/Rest/bin/rest.js`, `Element/Output/Source/ESBuild/RestPlugin.js` | ✅ Needs fix |
| **Config files** | 7 | `package.json`, `Cargo.toml`, `Cargo.lock` | ✅ Needs review |
| **Documentation** | 81 | `README.md`, `CHANGELOG.md`, `docs/` | ⚠️ Content review |
| **Skill files** | 15 | `.roo/skills/workflow-rest-compiler-integration/SKILL.md` | ✅ Needs fix |
| **Binary names** | 4 | `bin/rest`, `bin/rest.js` | ✅ **Critical** |
| **Build scripts** | 5 | `Maintain/Release/Build.sh`, `Element/Rest/prepublishOnly.sh` | ✅ Needs fix |

---

## 2. Detailed Findings

### 2.1 Binary/Executable Names (CRITICAL)

These are the most critical issues as they affect command-line usage and package distribution.

| File Path | Current Name | Should Be | Impact |
|-----------|--------------|-----------|--------|
| [`Element/Rest/bin/rest`](Element/Rest/bin/rest) | `rest` | `Rest` | CLI invocation |
| [`Element/Rest/bin/rest.js`](Element/Rest/bin/rest.js) | `rest.js` | `Rest.js` | CLI wrapper |
| `Element/Rest/Target/release/rest` | `rest` | `Rest` | Binary output |
| `Element/Rest/Target/release/rest.exe` | `rest.exe` | `Rest.exe` | Windows binary |

**Root Cause:** The `bin/` directory contains both `rest`/`rest.js` (lowercase) and `Rest`/`Rest.js` (PascalCase) files, creating inconsistency.

**Evidence from [`Element/Rest/bin/rest.js`](Element/Rest/bin/rest.js:15):**
```javascript
const binaryName = platform === 'win32' ? 'rest.exe' : 'rest';
```

This script references lowercase `rest` for the binary name, which conflicts with the PascalCase convention.

---

### 2.2 CLI Wrapper Scripts

| File Path | Issue | Line | Context |
|-----------|-------|------|---------|
| [`Element/Rest/bin/rest.js`](Element/Rest/bin/rest.js:3) | Filename is lowercase | 3 | `rest.js - CLI wrapper` |
| [`Element/Rest/bin/rest.js`](Element/Rest/bin/rest.js:15) | Binary name hardcoded | 15 | `'rest.exe' : 'rest'` |

---

### 2.3 Build Scripts (.sh)

| File Path | Issue | Line | Context |
|-----------|-------|------|---------|
| [`Maintain/Release/Build.sh`](Maintain/Release/Build.sh:113) | `rest` command invocation | 113 | `if command -v rest &> /dev/null` |
| [`Maintain/Release/Build.sh`](Maintain/Release/Build.sh:114) | `rest compile` | 114 | Direct command |
| [`Maintain/Release/Build.sh`](Maintain/Release/Build.sh:128) | `'rest' command not found` | 128 | Error message |
| [`Element/Rest/prepublishOnly.sh`](Element/Rest/prepublishOnly.sh:147) | References `Rest.js` correctly | 147 | ✅ Correct |
| [`Element/Output/Source/prepublishOnly.sh`](Element/Output/Source/prepublishOnly.sh:31) | Comment mentions Rest correctly | 31 | ✅ Correct |

**Evidence from [`Maintain/Release/Build.sh`](Maintain/Release/Build.sh:113-129):**
```bash
if command -v rest &> /dev/null; then
    rest compile \
        --input "$VSCodeSourceDir" \
        ...
echo "[Rest] 'rest' command not found - falling back to esbuild"
```

---

### 2.4 TypeScript/JavaScript Source Files

#### 2.4.1 Consistent PascalCase Usage (OK)
These files correctly use "Rest" for the compiler element:

| File | Usage | Status |
|------|-------|--------|
| [`Element/Output/Source/ESBuild/RestPlugin.ts`](Element/Output/Source/ESBuild/RestPlugin.ts:2) | `RestPlugin.ts - esbuild plugin` | ✅ OK |
| [`Element/Output/Source/ESBuild/RestPlugin.ts`](Element/Output/Source/ESBuild/RestPlugin.ts:16) | `Compiler - Set to "Rest"` | ✅ OK |
| [`Element/Output/Source/ESBuild/Output.ts`](Element/Output/Source/ESBuild/Output.ts:82) | `Conditionally add Rest plugin` | ✅ OK |

#### 2.4.2 Inconsistent Usage (Needs Fix)

| File | Issue | Line | Context |
|------|-------|------|---------|
| [`Element/Wind/Source/FileSystem/Type/URI.ts`](Element/Wind/Source/FileSystem/Type/URI.ts:59) | Variable name `rest` | 59 | `const rest = value.substring(...)` |
| [`Element/Cocoon/Source/TypeConverter/Command.ts`](Element/Cocoon/Source/TypeConverter/Command.ts:78) | Rest parameter `...rest` | 78 | JavaScript rest parameter |
| [`Element/Cocoon/Archive/Generated.ts`](Element/Cocoon/Archive/Generated.ts:5) | Phrase "rest of the application" | 5 | English text, not code |

**Note:** Variable names like `rest` in TypeScript (e.g., `const rest = ...`, `...rest` parameters) are **JavaScript language features** and should NOT be changed. These are not references to the "Rest" compiler element.

---

### 2.5 Rust Source Files

#### 2.5.1 PascalCase Usage (OK)
| File | Usage | Status |
|------|-------|--------|
| [`Element/Rest/Source/Fn/Bundle/builder.rs`](Element/Rest/Source/Fn/Bundle/builder.rs:3) | `Orchestrates the bundling process using Rest compiler` | ✅ OK |
| [`Element/Rest/Source/Fn/Binary/Command.rs`](Element/Rest/Source/Fn/Binary/Command.rs:1) | `Rest application` | ✅ OK |

#### 2.5.2 Variable Names (OK - Not Issues)
| File | Variable | Line | Context |
|------|----------|------|---------|
| [`Element/Air/Source/Configuration/mod.rs`](Element/Air/Source/Configuration/mod.rs:1604) | `let rest = &path[1..]` | 1604 | Path manipulation |
| [`Element/Air/Source/Indexing/Language/ParseTypeScript.rs`](Element/Air/Source/Indexing/Language/ParseTypeScript.rs:96) | `let Some(rest) = line_content.strip_prefix(...)` | 96 | String manipulation |
| [`Element/Air/Source/Indexing/Language/ParseRust.rs`](Element/Air/Source/Indexing/Language/ParseRust.rs:96) | `let Some(rest) = line_content.strip_prefix(...)` | 96 | String manipulation |

**Note:** These are **Rust variable names** used for string manipulation (e.g., "the rest of the string"). They are NOT references to the "Rest" compiler and should NOT be changed.

---

### 2.6 Configuration Files

| File | Issue | Line | Context |
|------|-------|------|---------|
| [`Element/Rest/package.json`](Element/Rest/package.json:2) | `"name": "@codeeditorland/rest"` | 2 | NPM package name (lowercase is NPM convention) |
| [`Element/Rest/package.json`](Element/Rest/package.json:22) | `"bin": { "Rest": "./bin/Rest.js" }` | 22 | ✅ Correct |
| [`Element/Rest/Cargo.toml`](Element/Rest/Cargo.toml:2) | `name = "Rest"` | 2 | ✅ Correct |
| [`Cargo.toml`](Cargo.toml:14) | `"Element/Rest"` | 14 | ✅ Correct |
| [`Cargo.lock`](Cargo.lock:205) | `name = "Rest"` | 205 | ✅ Correct |

**Note:** NPM package names (`@codeeditorland/rest`) conventionally use lowercase, so these are **acceptable**. The binary name within the package should be PascalCase.

---

### 2.7 Documentation Files

Documentation files contain numerous references to "Rest" that are generally correct. However, some skill files contain lowercase references in example code or incorrect contexts.

#### 2.7.1 Skill Files with Issues

| File | Issue | Line | Context |
|------|-------|------|---------|
| [`.roo/skills/workflow-rest-compiler-integration/SKILL.md`](.roo/skills/workflow-rest-compiler-integration/SKILL.md:37) | `rest --version` | 37 | CLI command example |
| [`.roo/skills/workflow-rest-compiler-integration/SKILL.md`](.roo/skills/workflow-rest-compiler-integration/SKILL.md:46) | `"build:rest": "rest build"` | 46 | npm script |
| [`.roo/skills/workflow-rest-compiler-integration/SKILL.md`](.roo/skills/workflow-rest-compiler-integration/SKILL.md:103) | `cargo install rest-compiler` | 103 | Incorrect package name |
| [`.roo/skills/integration-rest-with-esbuild/SKILL.md`](.roo/skills/integration-rest-with-esbuild/SKILL.md:71) | `rest build --config rest.json` | 71 | CLI command |
| [`.roo/skills/integration-output-with-rest/SKILL.md`](.roo/skills/integration-output-with-rest/SKILL.md:66) | `rest build --config rest.json` | 66 | CLI command |
| [`.roo/skills/history-output-directory-structure/SKILL.md`](.roo/skills/history-output-directory-structure/SKILL.md:97) | `rest build --out-dir` | 97 | CLI command |
| [`.roo/skills/postformat-pascalcase-conventions/SKILL.md`](.roo/skills/postformat-pascalcase-conventions/SKILL.md:52) | `grep -r "rest"` | 52 | Search pattern |
| [`.roo/skills/postformat-pascalcase-conventions/SKILL.md`](.roo/skills/postformat-pascalcase-conventions/SKILL.md:61) | `the rest compiler builds` | 61 | Text should be "Rest" |

**Evidence from [`.roo/skills/workflow-rest-compiler-integration/SKILL.md`](.roo/skills/workflow-rest-compiler-integration/SKILL.md:37):**
```markdown
rest --version
```

Should be:
```markdown
Rest --version
```

---

### 2.8 Plans Directory

| File | Issue | Line | Context |
|------|-------|------|---------|
| [`plans/conversation/rest-vscode-integration.md`](plans/conversation/rest-vscode-integration.md:40) | Filename is lowercase | 40 | `rest-vscode-integration` |
| [`plans/conversation/vscode-rest-compiler-integration-plan.md`](plans/conversation/vscode-rest-compiler-integration-plan.md:364) | `rest compile` | 364 | CLI command |

---

## 3. Categorization by Type

### 3.1 Binary/Executable Names (HIGH PRIORITY)
- **Files:** `Element/Rest/bin/rest`, `Element/Rest/bin/rest.js`
- **Action:** Rename to `Rest` and `Rest.js`
- **Effort:** Low (rename + update references)

### 3.2 CLI Command References (HIGH PRIORITY)
- **Files:** `Maintain/Release/Build.sh`, skill files
- **Action:** Change `rest` command to `Rest`
- **Effort:** Medium (multiple files)

### 3.3 Configuration Files (MEDIUM PRIORITY)
- **Files:** `package.json` (NPM package name is OK lowercase)
- **Action:** Review binary name in `package.json` bin field
- **Effort:** Low

### 3.4 Documentation Text (LOW PRIORITY)
- **Files:** README.md, CHANGELOG.md, docs/
- **Action:** Ensure "Rest compiler" is capitalized in prose
- **Effort:** Medium (content review)

### 3.5 Variable Names (NO ACTION NEEDED)
- **Files:** Rust `.rs`, TypeScript `.ts` source files
- **Reason:** These are legitimate variable names (e.g., `const rest = ...`), not references to the "Rest" element
- **Action:** None

---

## 4. Action Plan

### Phase 1: Quick Wins (Binary/CLI Names)

| Task | Files Affected | Effort | Priority |
|------|----------------|--------|----------|
| Rename `Element/Rest/bin/rest` to `Rest` | 1 file | 5 min | 🔴 Critical |
| Rename `Element/Rest/bin/rest.js` to `Rest.js` | 1 file | 5 min | 🔴 Critical |
| Update `binaryName` in `rest.js`/`Rest.js` | 2 files | 10 min | 🔴 Critical |
| Update shell script `rest` command to `Rest` | 3 files | 15 min | 🔴 High |

### Phase 2: Skill Files (Medium Effort)

| Task | Files Affected | Effort | Priority |
|------|----------------|--------|----------|
| Update CLI command examples in skill files | 8 files | 30 min | 🟡 Medium |
| Fix npm script examples (`rest build` → `Rest build`) | 5 files | 20 min | 🟡 Medium |
| Correct text references ("rest compiler" → "Rest compiler") | 3 files | 15 min | 🟡 Medium |

### Phase 3: Documentation Review (Higher Effort)

| Task | Files Affected | Effort | Priority |
|------|----------------|--------|----------|
| Review README.md references | 3 files | 30 min | 🟢 Low |
| Review CHANGELOG.md references | 1 file | 15 min | 🟢 Low |
| Review plan documents | 2 files | 20 min | 🟢 Low |

---

## 5. Non-Issues (No Action Required)

The following are **NOT** inconsistencies and should not be changed:

1. **Variable names** like `const rest = ...` in TypeScript/Rust (language features)
2. **Rest parameters** in TypeScript (`...rest: any[]`)
3. **NPM package names** (`@codeeditorland/rest` - NPM convention is lowercase)
4. **English text** phrases like "the rest of the application"
5. **Azure packages** like `@azure/core-rest-pipeline` (external dependencies)

---

## 6. Recommendations

### 6.1 Immediate Actions
1. Rename binary files in `Element/Rest/bin/` to PascalCase
2. Update shell scripts to use `Rest` command
3. Fix skill file examples

### 6.2 Long-term Actions
1. Add linting rule to detect lowercase "rest" in non-variable contexts
2. Update CI/CD to validate PascalCase naming
3. Document naming convention in `CONTRIBUTING.md`

### 6.3 Verification Commands
```bash
# Check for lowercase "rest" in CLI contexts (excluding variables)
grep -rE '^\s*rest\s+' Element/ --include="*.sh"
grep -rE 'command -v rest' . --include="*.sh"

# Check skill files
grep -rE '\bread\b' .roo/skills/ --include="*.md" | grep -v "rest of"
```

---

## 7. Appendix: Full File List

### 7.1 Files Requiring Changes

| Priority | File Path | Change Required |
|----------|-----------|-----------------|
| 🔴 Critical | `Element/Rest/bin/rest` | Rename to `Rest` |
| 🔴 Critical | `Element/Rest/bin/rest.js` | Rename to `Rest.js` |
| 🔴 Critical | `Element/Rest/bin/rest.js` | Update `binaryName` |
| 🔴 High | `Maintain/Release/Build.sh` | Update `rest` → `Rest` |
| 🔴 High | `.roo/skills/workflow-rest-compiler-integration/SKILL.md` | Update examples |
| 🔴 High | `.roo/skills/integration-rest-with-esbuild/SKILL.md` | Update examples |
| 🔴 High | `.roo/skills/integration-output-with-rest/SKILL.md` | Update examples |
| 🟡 Medium | `.roo/skills/history-output-directory-structure/SKILL.md` | Update examples |
| 🟡 Medium | `.roo/skills/postformat-pascalcase-conventions/SKILL.md` | Update text |
| 🟡 Medium | `plans/conversation/vscode-rest-compiler-integration-plan.md` | Update examples |

### 7.2 Files for Review Only (No Action Required)

| File | Reason |
|------|--------|
| All `*.rs` files with `let rest =` | Valid variable names |
| All `*.ts` files with `...rest` | Valid rest parameters |
| `package.json` files | NPM package name convention |
| `README.md` files | Review prose only |

---

**Report End**
