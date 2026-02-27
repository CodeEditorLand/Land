# Atomic File Structure Strategy

## Overview

This document defines the atomic file structure pattern for the Mountain codebase. The goal is to create a more maintainable, navigable, and self-documenting codebase through consistent file organization.

## Core Principles

### 1. Single Use, Single Export
Each file should have one primary responsibility and export one public item. This aligns with the Single Responsibility Principle (SRP) from SOLID.

### 2. Hierarchical Reverse Order Naming
File paths should be organized from most specific to most general (reverse hierarchical):

```
Source/Create/Application/Interface.rs
Source/Create/Application/Fn.rs
Source/Action/Target/Interface.rs
Source/Action/Target/Fn.rs
```

### 3. Naming Conventions
- **PascalCase**: All module and type names use PascalCase
- **Single Word**: Use single, action-oriented words in singular form (never plural)
- **Present Tense Verbs**: Use verbs like `Register`, `Create`, `Get`, `Set`
- **Uppercase Acronyms**: Properly spell acronyms like gRPC, IPC, TPC

### 4. File Types
- **`Interface.rs`**: For traits, protocols, and type definitions
- **`Fn.rs`**: For function implementations and business logic
- **`mod.rs`**: For module exports (minimal content, re-exports only)

## Current vs. Atomic Structure

### Current Pattern (Non-Atomic)
```
Command/
├── mod.rs
├── LanguageFeature/
│   ├── mod.rs
│   ├── hover.rs
│   ├── completions.rs
│   ├── definition.rs
│   └── ...
```

### Atomic Pattern (Target)
```
Command/
├── mod.rs
├── Hover/
│   ├── Fn.rs      # Hover logic implementation
│   └── Interface.rs  # Hover types/traits
├── Completion/
│   ├── Fn.rs
│   └── Interface.rs
├── Definition/
│   ├── Fn.rs
│   └── Interface.rs
```

## Example: LanguageFeature/Hover

### Before (Current Structure)
```
Element/Mountain/Source/Command/LanguageFeature/hover.rs
```

**Contents:**
```rust
//! # LanguageFeature - Hover
//! Provides hover information at cursor position

pub(super) async fn provide_hover_impl(
    application_handle: AppHandle<Wry>,
    uri: String,
    position: Value,
) -> Result<Value, String> { ... }
```

### After (Atomic Structure)
```
Element/Mountain/Source/Command/Hover/
├── Fn.rs          # The hover implementation
└── Interface.rs   # Hover request/response types
```

#### Interface.rs
```rust
//! # Hover Interface
//! 
//! Defines types and traits for hover functionality.

use serde::{Deserialize, Serialize};
use url::Url;

/// Request payload for hover operation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HoverRequest {
    pub uri: Url,
    pub position: Position,
}

/// Position in a document
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Position {
    pub line: u32,
    pub column: u32,
}

/// Response from hover operation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HoverResponse {
    pub contents: Vec<HoverContent>,
}

/// Content to display in hover
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HoverContent {
    pub value: String,
    pub language: Option<String>,
}
```

#### Fn.rs
```rust
//! # Hover Function
//! 
//! Implements hover functionality for language features.

use crate::Command::Hover::Interface::{HoverRequest, HoverResponse};
use log::debug;
use tauri::{AppHandle, Wry};

/// Provides hover information at cursor position
pub async fn Hover(
    application_handle: AppHandle<Wry>,
    request: HoverRequest,
) -> Result<HoverResponse, String> {
    debug!("[Hover] Providing hover for: {}", request.uri);
    
    // Implementation...
    todo!("Implement hover logic")
}
```

## Naming Guidelines

### Verbs (Actions)
| Current | Atomic |
|---------|--------|
| `register_command` | `Register/Fn.rs` |
| `unregister_command` | `Unregister/Fn.rs` |
| `get_status` | `StatusGet/Fn.rs` |
| `provide_hover` | `Hover/Fn.rs` |
| `invoke_provider` | `Invoke/Fn.rs` |

### Nouns (Resources)
| Current | Atomic |
|---------|--------|
| `ConfigurationState` | `Configuration/State/Fn.rs` or `Configuration/State/Interface.rs` |
| `WindowState` | `Window/State/Fn.rs` or `Window/State/Interface.rs` |
| `ApplicationState` | `Application/State/Fn.rs` or `Application/State/Interface.rs` |

### Special Cases
- **gRPC**: Use as `gRPC` (not `Grpc`)
- **IPC**: Use as `IPC` (not `Ipc`)
- **TPC**: Use as `TPC` (not `Tpc`)
- **URL**: Use as `URL` (not `Url`) in contexts where it represents the protocol

## Module Organization Rules

### 1. Minimal mod.rs
Each module's `mod.rs` should only contain:
- Re-exports of child modules
- Module-level documentation
- No implementation code

### 2. Explicit Exports
```rust
// Command/mod.rs
pub mod Hover;
pub mod Completion;

// Re-export for convenience
pub use Hover::{Fn as HoverFn, Interface as HoverInterface};
```

### 3. Single Responsibility per File
- `Interface.rs`: Only types, traits, constants
- `Fn.rs`: Only function implementations
- Separate concerns, not just to separate files

## Migration Strategy

### Phase 1: Documentation
1. Document current structure (this document)
2. Identify patterns to convert
3. Create naming guidelines

### Phase 2: Pilot Module
Convert one module as proof of concept:
- Choose `Command/Hover` as pilot
- Verify the pattern works
- Refine based on learnings

### Phase 3: Gradual Migration
1. Prioritize modules by:
   - Frequency of changes
   - Complexity
   - Number of dependencies
2. Convert one module at a time
3. Maintain backward compatibility during transition
4. Update imports in dependent modules

### Phase 4: Cleanup
1. Remove old `mod.rs` files
2. Update all references
3. Verify build passes
4. Update documentation

## Anti-Patterns to Avoid

### ❌ Don't Do This
```rust
// utilities.rs - Too many responsibilities
pub fn helper1() {}
pub fn helper2() {}
pub fn helper3() {}
```

### ✅ Do This Instead
```
Utilities/
├── ValidateInput/
│   ├── Fn.rs
│   └── Interface.rs
├── ParseData/
│   ├── Fn.rs
│   └── Interface.rs
├── FormatOutput/
│   ├── Fn.rs
│   └── Interface.rs
```

## Benefits

1. **Discoverability**: Easy to find related functionality
2. **Navigation**: Clear mental model of codebase
3. **Self-Documenting**: File structure reflects architecture
4. **Testability**: Isolated units are easier to test
5. **Refactoring**: Smaller, focused files reduce risk
6. **Onboarding**: New developers understand structure faster

## References

- [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- [Module Organization Best Practices](https://doc.rust-lang.org/book/ch07-02-defining-modules-to-control-scope-and-privacy.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)