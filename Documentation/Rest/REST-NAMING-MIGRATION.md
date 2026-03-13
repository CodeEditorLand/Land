# Rest Naming Migration Guide

**Version:** 1.0  
**Migration Date:** 2026-03-06  
**Status:** Complete

---

## Executive Summary

This document summarizes the comprehensive migration from inconsistent lowercase "rest" naming to the standardized PascalCase "Rest" convention across the CodeEditorLand project. The migration ensures consistency in binary names, CLI commands, documentation, and skill file examples while preserving language-specific conventions for variable names, package names, and CSS classes.

---

## Migration Overview

### Before → After

| Category | Before | After | Reason |
|----------|--------|-------|--------|
| Binary/Executable | `rest` | `Rest` | PascalCase convention for CLI tools |
| Binary Wrapper | `rest.js` | `Rest.js` | Consistency with binary naming |
| CLI Commands | `rest compile` | `Rest compile` | User-facing command consistency |
| Documentation Text | "rest compiler" | "Rest compiler" | Proper noun capitalization |
| Package Names | `@codeeditorland/rest` | `@codeeditorland/rest` | ✅ Kept lowercase (NPM convention) |
| Variable Names | `const rest = ...` | `const rest = ...` | ✅ Kept lowercase (language feature) |
| CSS Classes | `.rest-compiler` | `.rest-compiler` | ✅ Kept lowercase (CSS convention) |

---

## Files Modified

### Critical Changes (Binary/CLI)

| File | Change | Impact |
|------|--------|--------|
| `Element/Rest/bin/rest` | Renamed to `Rest` | CLI invocation |
| `Element/Rest/bin/rest.js` | Renamed to `Rest.js` | CLI wrapper |
| `Element/Rest/bin/Rest.js` | Updated `binaryName` to `'Rest'` | Runtime detection |
| `Maintain/Release/Build.sh` | `rest` → `Rest` in command checks | Build orchestration |

### Documentation Updates

| File | Change | Lines |
|------|--------|-------|
| `docs/rest-casing-audit.md` | Updated findings and recommendations | All |
| `docs/verification-phase4.md` | Added verification results | All |
| `Documentation/SkillSystem.md` | New file - depth-aware system docs | New |
| `docs/REST-NAMING-MIGRATION.md` | New file - this migration guide | New |

### Skill File Updates

| File | Change | Lines |
|------|--------|-------|
| `.roo/skills/postformat-pascalcase-conventions/SKILL.md` | Updated grep comment | 52 |
| `.roo/skills/knowledge-element-architecture/SKILL.md` | Already correct | N/A |

---

## Naming Convention Rules

### ✅ Correct Usage Patterns

#### Binary/CLI References (PascalCase)
```bash
# ✅ Correct
./Element/Rest/bin/Rest compile --input src/
Rest --version
Compiler=Rest cargo run
```

#### Package Names (kebab-case - NPM convention)
```json
{
  "name": "@codeeditorland/rest",
  "dependencies": {
    "rest-compiler": "^1.0.0"
  }
}
```

#### Variable Names (language-specific)
```typescript
// ✅ Correct - TypeScript variable
const rest = await compileFile(path);
const { ...rest } = options;  // rest parameter

// ✅ Correct - Rust variable
let rest = path.strip_prefix(prefix)?;
```

#### CSS/Class Names (lowercase - CSS convention)
```css
/* ✅ Correct */
.rest-compiler-status { }
.rest-output-dir { }
.rest-progress-bar { }
```

### ❌ Incorrect Usage Patterns

```bash
# ❌ Incorrect - lowercase binary
./Element/Rest/bin/rest compile  # Should be: Rest
rest --version  # Should be: Rest

# ❌ Incorrect - lowercase in documentation text
"The rest compiler builds files."  # Should be: "The Rest compiler builds files."
```

---

## Migration Checklist

### For Developers

- [ ] Verify binary path: `./Element/Rest/bin/Rest` exists
- [ ] Update shell scripts to use `Rest` command (not `rest`)
- [ ] Check documentation for "rest compiler" → "Rest compiler"
- [ ] Ensure `package.json` bin field points to `./bin/Rest.js`

### For Documentation Authors

- [ ] Review all "rest" references in Markdown files
- [ ] Distinguish between:
  - Binary/CLI references → Use `Rest` (PascalCase)
  - Package names → Keep `@codeeditorland/rest` (lowercase)
  - Variable names → Keep `rest` (language-specific)
  - English phrases → "the rest of the files" (not related to Rest compiler)

### For Skill File Authors

- [ ] Update CLI command examples to use `Rest`
- [ ] Verify depth configuration follows DEPTH-MANAGEMENT.md
- [ ] Check for outdated "rest compiler" text references

---

## Common Pitfalls

### 1. Confusing Variable Names with Binary Names

**Pitfall:** Changing `const rest = ...` to `const Rest = ...`

**Why It's Wrong:** `rest` as a variable name is a legitimate JavaScript/TypeScript/Rust identifier for holding "the rest of" something. It has no relation to the Rest compiler element.

**Correct Approach:** Only change references to the compiler tool itself, not variable names.

### 2. Changing NPM Package Names

**Pitfall:** Renaming `@codeeditorland/rest` to `@codeeditorland/Rest`

**Why It's Wrong:** NPM package names conventionally use lowercase with hyphens. Changing this would break package resolution and violate NPM conventions.

**Correct Approach:** Keep package names lowercase, only change the binary name within the package.

### 3. Missing Context in Search/Replace

**Pitfall:** Using `sed -i 's/rest/Rest/g'` without context awareness

**Why It's Wrong:** This would incorrectly change:
- Variable names like `const rest = ...`
- English phrases like "the rest of the files"
- NPM package references like `@codeeditorland/rest`

**Correct Approach:** Use targeted search patterns that consider context:
```bash
# Search for "rest" followed by CLI arguments
grep -rn "rest compile" --include="*.sh" --include="*.md"

# Search for standalone "rest" at command start
grep -rn "^rest " --include="*.sh"
```

### 4. Ignoring Language-Specific Conventions

**Pitfall:** Enforcing PascalCase on CSS class names

**Why It's Wrong:** CSS conventions use lowercase with hyphens (kebab-case).

**Correct Approach:** Respect language-specific conventions:
- Rust/TypeScript types → PascalCase
- JavaScript/TypeScript variables → camelCase
- CSS classes → kebab-case
- NPM packages → kebab-case

---

## Verification Commands

### Check for Remaining Issues

```bash
# Check for lowercase "rest" in CLI contexts (excluding variables)
grep -rn "^[[:space:]]*rest " --include="*.sh" .
grep -rn "command -v rest" --include="*.sh" .

# Check skill files for incorrect CLI examples
grep -rn "\bread\b" .roo/skills/ --include="*.md" | grep -v "rest of"

# Verify binary exists with correct name
ls -la Element/Rest/bin/Rest
```

### Verify Successful Migration

```bash
# Binary should execute
./Element/Rest/bin/Rest --version

# Help should display correctly
./Element/Rest/bin/Rest --help

# No lowercase CLI references in build scripts
grep -c "rest compile" Maintain/Release/Build.sh  # Should return 0
```

---

## Related Documentation

- [`docs/rest-casing-audit.md`](./rest-casing-audit.md) - Original audit report
- [`docs/verification-phase4.md`](./verification-phase4.md) - Phase 4 verification results
- [`Documentation/SkillSystem.md`](../Documentation/SkillSystem.md) - Depth-aware skill system
- [`Element/Rest/README.md`](../Element/Rest/README.md) - Rest compiler documentation

---

## Change History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-03-06 | 1.0 | Initial migration guide | Phase 5 Documentation Update |

---

## Conclusion

The migration from inconsistent "rest" naming to standardized PascalCase "Rest" is now complete. All binary references, CLI commands, and documentation text have been updated to use the correct convention while preserving language-specific naming for variables, packages, and CSS classes.

This guide serves as the authoritative reference for proper naming conventions moving forward. When in doubt, refer to the rules in this document and the examples provided.

---

*Document generated as part of Phase 5: Documentation Update*  
*For questions or issues, contact: Source/Open@Editor.Land*
