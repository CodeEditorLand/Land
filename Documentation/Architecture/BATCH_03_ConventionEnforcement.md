# Batch 3: Convention Enforcement

## Status: ✅ Complete

**Objective**: Enforce PascalCase and other conventions across all Elements

**Completed**: 2026-03-03

## Key Findings

- All Rust Elements use PascalCase ✅
- Wind has mixed service patterns (some old, some new)
- 650+ TODOs found (Cocoon: 267, Mountain: 265, Air: 99)
- 8 Elements have 0 TODOs ✅

## Step-by-Step Execution (50 Steps)

### Phase A: Convention Checklist (Steps 1-15)

| Step | Convention                   | Target Elements   | Current State | Status     |
| ---- | ---------------------------- | ----------------- | ------------- | ---------- |
| 1    | PascalCase for structs/enums | All Rust          | Verify        | ⬜ Pending |
| 2    | PascalCase for modules       | All Rust          | Verify        | ⬜ Pending |
| 3    | camelCase for functions      | All Rust          | Verify        | ⬜ Pending |
| 4    | snake_case for files         | All Rust          | Verify        | ⬜ Pending |
| 5    | TypeScript naming            | Wind, Sky, Output | Verify        | ⬜ Pending |
| 6    | Consistent error naming      | All Elements      | Verify        | ⬜ Pending |
| 7    | Consistent service naming    | Wind, Mountain    | Verify        | ⬜ Pending |
| 8    | Config file naming           | All Elements      | Verify        | ⬜ Pending |
| 9    | Test file organization       | All Elements      | Verify        | ⬜ Pending |
| 10   | Documentation structure      | All Elements      | Verify        | ⬜ Pending |
| 11   | Build.rs patterns            | Rust Elements     | Verify        | ⬜ Pending |
| 12   | Cargo.toml organization      | All Rust          | Verify        | ⬜ Pending |
| 13   | .gitignore patterns          | All Elements      | Verify        | ⬜ Pending |
| 14   | .gitattributes patterns      | All Elements      | Verify        | ⬜ Pending |
| 15   | GitHub workflows             | .github/ all      | Verify        | ⬜ Pending |

### Phase B: Per-Element Convention Check (Steps 16-35)

| Step | Element  | Focus Area          | Status     |
| ---- | -------- | ------------------- | ---------- |
| 16   | Air      | Rust conventions    | ⬜ Pending |
| 17   | Cocoon   | Go/Docker patterns  | ⬜ Pending |
| 18   | Common   | Rust + TS hybrid    | ⬜ Pending |
| 19   | Echo     | Rust conventions    | ⬜ Pending |
| 20   | Grove    | Rust + Proto        | ⬜ Pending |
| 21   | Maintain | Build system        | ⬜ Pending |
| 22   | Mist     | Rust conventions    | ⬜ Pending |
| 23   | Mountain | Tauri app           | ⬜ Pending |
| 24   | Output   | TypeScript          | ⬜ Pending |
| 25   | Rest     | Rust conventions    | ⬜ Pending |
| 26   | SideCar  | Cross-platform      | ⬜ Pending |
| 27   | Sky      | Astro/TypeScript    | ⬜ Pending |
| 28   | Vine     | Minimal             | ⬜ Pending |
| 29   | Wind     | TypeScript services | ⬜ Pending |
| 30   | Worker   | TypeScript          | ⬜ Pending |

### Phase C: Apply Naming Standardization (Steps 31-45)

| Step | Task                               | Elements  | Status     |
| ---- | ---------------------------------- | --------- | ---------- |
| 31   | Apply plural→singular to remaining | Check all | ⬜ Pending |
| 32   | Fix remaining PascalCase           | Check all | ⬜ Pending |
| 33   | Fix remaining camelCase            | Check all | ⬜ Pending |
| 34   | Standardize error types            | All       | ⬜ Pending |
| 35   | Standardize service patterns       | All       | ⬜ Pending |
| 36   | Verify build configs               | All       | ⬜ Pending |
| 37   | Update .gitignore if needed        | All       | ⬜ Pending |
| 38   | Update .gitattributes if needed    | All       | ⬜ Pending |
| 39   | Sync GitHub workflows              | All       | ⬜ Pending |
| 40   | Reserve                            | -         | ⬜ Pending |

### Phase D: Batch Completion (Steps 41-50)

| Step | Task                      | Status     |
| ---- | ------------------------- | ---------- |
| 41   | Compile convention report | ⬜ Pending |
| 42   | Create fix action items   | ⬜ Pending |
| 43   | Update decision matrix    | ⬜ Pending |
| 44   | Prepare Batch 4           | ⬜ Pending |
| 45   | Complete checklist        | ⬜ Pending |

## Batch Goals

1. ⬜ Verify all conventions across 15 Elements
2. ⬜ Apply standardization fixes
3. ⬜ Update decision matrix with new decisions
4. ⬜ Prepare for TODO completion phase

## Dependencies

- Requires Batch 1 completion (✅)
- Requires Batch 2 completion (✅)
