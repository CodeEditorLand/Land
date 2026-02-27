# Refactoring Priorities

## Table of Contents

- [Overview](#overview)
- [High Priority Issues](#high-priority-issues)
- [Medium Priority Issues](#medium-priority-issues)
- [Low Priority Improvements](#low-priority-improvements)
- [Component-Specific Recommendations](#component-specific-recommendations)
- [Cross-Cutting Concerns](#cross-cutting-concerns)

---

## Overview

This document consolidates all critical issues, known problems, and improvement
opportunities identified across all Code Editor Land components. Priorities are
based on impact, urgency, and effort required.

### Priority Definitions

| Priority     | Description                                | Timeframe                |
| ------------ | ------------------------------------------ | ------------------------ |
| **Critical** | Blocks functionality or causes instability | Immediate (1-2 weeks)    |
| **High**     | Significant impact on user experience      | Short-term (1-2 months)  |
| **Medium**   | Important but not blocking                 | Medium-term (3-6 months) |
| **Low**      | Nice-to-have improvements                  | Long-term (6+ months)    |

---

## Refactoring Priority Diagram

```mermaid
graph TB
    subgraph ["Critical Priority Components"]
        direction TB
        M_IPC["Mountain IPC Refactoring<br/>Code Duplication"]
        C_Debug["Cocoon Debug API"]
        C_Test["Cocoon Test API"]
        W_Services["Wind Missing Services"]
        A_Indexing["Air Indexing Performance"]

        classDef critical fill:#ff6b6b,stroke:#c92a2a,stroke-width:3px,color:#fff
        class M_IPC,C_Debug,C_Test,W_Services,A_Indexing critical
    end

    subgraph ["High Priority Components"]
        direction TB
        M_Error["Mountain Error Handling"]
        M_Pool["Mountain Connection Pool"]
        C_Security["Cocoon Security Validation"]
        C_Recovery["Cocoon Extension Crash Recovery"]
        W_Perf["Wind Performance Optimization"]
        S_Components["Sky Missing Components"]
        A_Lang["Air Language Support"]

        classDef high fill:#ffa94d,stroke:#e67700,stroke-width:3px,color:#fff
        class M_Error,M_Pool,C_Security,C_Recovery,W_Perf,S_Components,A_Lang high
    end

    subgraph ["Medium Priority Components"]
        direction TB
        M_Command["Mountain Command System"]
        C_Perf["Cocoon Module Interceptor"]
        W_Advanced["Wind Advanced Features"]
        S_Dark["Sky Dark Mode"]
        S_Tests["Sky Component Tests"]
        A_Reload["Air Config Hot Reload"]

        classDef medium fill:#ffd43b,stroke:#f59f00,stroke-width:2px,color:#000
        class M_Command,C_Perf,W_Advanced,S_Dark,S_Tests,A_Reload medium
    end

    subgraph ["Low Priority Components"]
        direction TB
        M_Compress["Mountain Message Compression"]
        C_Features["Cocoon Advanced Features"]
        W_Error["Wind Error Handling"]
        W_Monitor["Wind Performance Monitoring"]
        S_UI["Sky UI Customization"]
        A_Metrics["Air Metrics and Tracing"]
        V_Security["Vine Security Features"]

        classDef low fill:#69db7c,stroke:#2b8a3e,stroke-width:2px,color:#000
        class M_Compress,C_Features,W_Error,W_Monitor,S_UI,A_Metrics,V_Security low
    end

    subgraph ["Dependencies"]
        M_IPC -->|Required for| M_Error
        M_IPC -->|Required for| M_Command
        M_IPC -->|Required for| M_Pool

        C_Debug -->|Depends on| C_Security
        C_Test -->|Depends on| C_Security
        C_Debug -->|Enables| C_Recovery
        C_Test -->|Enables| C_Recovery

        W_Services -->|Required for| W_Perf
        S_Components -->|Required for| S_Dark

        A_Indexing -->|Supports| A_Lang
        A_Lang -->|Supports| C_Features

        V_Security -->|Enhances| M_IPC
        V_Security -->|Enhances| C_Security
    end

    subgraph ["Cross-Cutting Concerns"]
        direction LR
        Docs["Documentation"]
        Tests["Testing"]
        Perf["Performance"]
        Security["Security"]
        DX["Developer Experience"]

        classDef cross fill:#74c0fc,stroke:#1c7ed6,stroke-width:2px,color:#fff
        class Docs,Tests,Perf,Security,DX cross
    end

    Docs -.Affects.-> M_IPC
    Docs -.Affects.-> C_Debug
    Tests -.Required for.-> M_Error
    Tests -.Required for.-> C_Recovery
    Perf -.Affects.-> W_Perf
    Perf -.Affects.-> A_Indexing
    Security -.Affects.-> C_Security
    DX -.Affects.-> W_Error
    DX -.Affects.-> S_UI

    classDef default fill:#f8f9fa,stroke:#dee2e6,stroke-width:1px,color:#000
```

**Diagram Legend:**

- **Red Nodes (Critical)**: Required for basic functionality - address
  immediately (1-2 weeks)
- **Orange Nodes (High)**: Significant impact on user experience - address soon
  (1-2 months)
- **Yellow Nodes (Medium)**: Important but not blocking - address中期 (3-6
  months)
- **Green Nodes (Low)**: Nice-to-have improvements - address later (6+ months)
- **Blue Nodes (Cross-Cutting)**: Affects multiple components, apply throughout

**Solid Arrows**: Direct dependency (must be completed before target) **Dotted
Arrows**: Affects or enhances (not blocking but important)

```mermaid
graph LR
    subgraph ["Component Refactoring Order"]
        direction TB
        P1["Phase 1: Critical<br/>4-6 weeks<br/>Mountain IPC, Cocoon APIs,<br/>Wind Services, Air Indexing"]
        P2["Phase 2: High Priority<br/>4-6 weeks<br/>Security, Error Handling,<br/>Performance, Stability"]
        P3["Phase 3: Medium Priority<br/>4-8 weeks<br/>Features, Reliability,<br/>Language Support"]
        P4["Phase 4: Low Priority<br/>6+ weeks<br/>Improvements, Observability,<br/>DX Enhancements"]

        classDef phase fill:#e7f5ff,stroke:#1971c2,stroke-width:2px,color:#000
        class P1,P2,P3,P4 phase
    end

    P1 --> P2 --> P3 --> P4
```

---

## High Priority Issues

### Critical Issues

#### 1. Mountain IPC Layer Code Duplication

**Component**: Mountain  
**Location**: [`Element/Mountain/Source/IPC/`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/IPC)

**Issue**: Significant code duplication across IPC modules

**Impact**:

- Maintenance burden
- Inconsistent error handling
- Difficulty in ensuring consistent behavior

**Recommendation**:

```rust
// Consolidate common IPC logic into shared modules
pub mod common {
    pub mod request_handler;
    pub mod response_builder;
    pub mod error_mapper;
}
```

**Estimated Effort**: 2 weeks

**Related Refactoring**: See
[`Element/Mountain/Source/IPC/RefactoringSummary.md`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/IPC/RefactoringSummary.md)

#### 2. Cocoon API Parity Gaps

**Component**: Cocoon  
**Location**: Various services

**Issue**: Missing VS Code API implementations

**Missing APIs**: | API Category | Status | Impact |
|--------------|--------|--------| | Debug API | ❌ Not Implemented | Cannot
debug extensions | | Test API | ❌ Not Implemented | Cannot run extension tests
in-editor | | Advanced Language Features | ⚠️ Partial | Limited code
intelligence |

**Recommendation**:

1. Implement Debug Adapter Protocol (DAP) support
2. Implement Test Runner integration
3. Complete remaining language feature providers

**Estimated Effort**: 4-6 weeks

#### 3. Wind Service Coverage Incomplete

**Component**: Wind  
**Location**: Various services

**Issue**: Not all VS Code workbench services implemented

**Missing Services**:

- Status Bar Service
- Activity Bar Service
- Sidebar Service
- Panel Service

**Impact**: Incomplete UI functionality

**Recommendation**: Implement missing services following the established pattern

**Estimated Effort**: 2-3 weeks

#### 4. Air Indexing Performance

**Component**: Air  
**Location**: [`Element/Air/Source/Indexing/`](https://github.com/CodeEditorLand/Air/tree/Current/Source/Indexing)

**Issue**: Large projects can be slow to index

**Impact**:

- Poor first-launch experience
- Delayed symbol navigation
- High memory consumption

**Recommendation**:

1. Implement incremental indexing
2. Add indexing progress indicators
3. Optimize symbol extraction
4. Add LSP integration for language-agnostic indexing

**Estimated Effort**: 3-4 weeks

### High Priority Issues

#### 5. Mountain Error Handling Inconsistency

**Component**: Mountain  
**Location**: Various handlers

**Issue**: Inconsistent error handling across handlers

**Recommendation**:

1. Establish consistent error types
2. Implement error recovery mechanisms
3. Add comprehensive error logging
4. Create error documentation

**Estimated Effort**: 1-2 weeks

#### 6. Sky Component Coverage

**Component**: Sky  
**Location**: [`Element/Sky/Source/`](https://github.com/CodeEditorLand/Sky/tree/Current/Source)

**Issue**: Not all UI components implemented

**Missing Components**:

- Status bar components
- Activity bar components
- Panel components
- Sidebar components

**Impact**: Incomplete UI

**Recommendation**: Implement missing components following Astro best practices

**Estimated Effort**: 2-3 weeks

#### 7. Cocoon Security Validation

**Component**: Cocoon  
**Location**: Security modules

**Issue**: Module interceptor needs comprehensive module whitelist

**Recommendation**:

1. Audit all Node.js module usage
2. Create comprehensive whitelist
3. Implement sandbox enforcement verification
4. Add security testing

**Estimated Effort**: 2 weeks

#### 8. Terminal Output Duplication

**Component**: Mountain + Wind + Sky

**Issue**: Terminal output is sent to multiple destinations (Cocoon, Wind, Sky)

**Impact**:

- Unnecessary duplication
- Reduced performance
- Increased complexity

**Recommendation**:

1. Consolidate terminal output routing
2. Determine single source of truth for display
3. Simplify notification flow

**Estimated Effort**: 1 week

---

## Medium Priority Issues

#### 1. Mountain Command System Consolidation

**Component**: Mountain  
**Location**: [`Element/Mountain/Source/Command/`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/Command)
and registry

**Issue**: Multiple command execution paths

**Recommendation**:

1. Unify command registration logic
2. Consolidate command execution paths
3. Simplify command dispatch

**Estimated Effort**: 1-2 weeks

#### 2. Wind Performance Optimization

**Component**: Wind  
**Location**: Effect-TS services

**Issue**: Effect execution overhead and memory usage

**Recommendation**:

1. Profile Effect execution
2. Optimize service layer
3. Reduce unnecessary allocations
4. Implement lazy loading

**Estimated Effort**: 2-3 weeks

#### 3. Cocoon Module Interceptor Performance

**Component**: Cocoon  
**Location**: Module interceptor utilities

**Issue**: Module interception causes overhead

**Recommendation**:

1. Profile interceptor performance
2. Optimize lookup logic
3. Cache resolved modules
4. Consider alternatives for frequent access

**Estimated Effort**: 1-2 weeks

#### 4. Air Language Support Expansion

**Component**: Air  
**Location**: [`Element/Air/Source/Indexing/Language/`](https://github.com/CodeEditorLand/Air/tree/Current/Source/Indexing/Language)

**Issue**: Limited language support (Rust, TypeScript only)

**Recommendation**:

1. Add C# parser
2. Add Python parser
3. Add support for more languages
4. Create parser plugin system

**Estimated Effort**: 3-4 weeks

#### 5. Sky Dark Mode Support

**Component**: Sky  
**Location**: CSS and components

**Issue**: No dark mode support

**Recommendation**:

1. Implement dark mode toggle
2. Create CSS variables for theming
3. Update all components for dark mode
4. Persist user preference

**Estimated Effort**: 1-2 weeks

#### 6. Mountain Connection Pool Implementation

**Component**: Mountain  
**Location**: [`Element/Mountain/Source/IPC/Connection/Pool/`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/IPC/Connection/Pool)

**Issue**: Connection pool implementation incomplete

**Recommendation**:

1. Complete pool implementation
2. Add pool statistics
3. Implement health monitoring
4. Add automatic recovery

**Estimated Effort**: 2 weeks

#### 7. Cocoon Extension Crash Recovery

**Component**: Cocoon + Mountain

**Issue**: Extension crashes can affect stability

**Recommendation**:

1. Implement extension isolation
2. Add crash detection
3. Implement automatic restart
4. Add crash reporting

**Estimated Effort**: 2-3 weeks

#### 8. Sky Component Testing

**Component**: Sky  
**Location**: Components

**Issue**: Limited component tests

**Recommendation**:

1. Add component unit tests
2. Add integration tests
3. Add visual regression tests
4. Set up continuous testing

**Estimated Effort**: 2-3 weeks

---

## Low Priority Improvements

#### 1. Mountain Message Compression

**Component**: Mountain  
**Location**: [`Element/Mountain/Source/IPC/Encryption/`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/IPC/Encryption)

**Issue**: Message compression not fully utilized

**Recommendation**:

1. Enable compression for large messages
2. Add compression statistics
3. Tune compression levels

**Estimated Effort**: 1 week

#### 2. Air Configuration Hot Reload Testing

**Component**: Air  
**Location**: [`Element/Air/Source/Configuration/HotReload.rs`](https://github.com/CodeEditorLand/Air/tree/Current/Source/Configuration/HotReload.rs)

**Issue**: Configuration hot-reload not fully tested

**Recommendation**:

1. Add comprehensive hot-reload tests
2. Test rollback mechanism
3. Test edge cases

**Estimated Effort**: 1 week

#### 3. Wind Advanced Features

**Component**: Wind  
**Location**: Service layer

**Issue**: Missing advanced features

**Recommendations**:

1. Add better error handling
2. Add enhanced diagnostics
3. Improve performance monitoring
4. Add better debugging tools

**Estimated Effort**: 3-4 weeks

#### 4. Sky Customizable UI

**Component**: Sky  
**Location**: Components

**Issue**: Limited UI customization

**Recommendations**:

1. Add theme system
2. Add layout customization
3. Add user preference storage
4. Add export/import of settings

**Estimated Effort**: 4-6 weeks

#### 5. Air Metrics and Tracing

**Component**: Air  
**Location**: [`Element/Air/Source/Metrics/`](https://github.com/CodeEditorLand/Air/tree/Current/Source/Metrics)
and
[`Element/Air/Source/Tracing/`](https://github.com/CodeEditorLand/Air/tree/Current/Source/Tracing)

**Issue**: Basic implementation, needs enhancement

**Recommendations**:

1. Add Prometheus metrics export
2. Add OpenTelemetry tracing
3. Create Grafana dashboards
4. Add alert integration

**Estimated Effort**: 2-3 weeks

#### 6. Cross-Component Documentation

**All Components**  
**Issue**: Documentation scattered and incomplete

**Recommendations**:

1. Consolidate component documentation
2. Add architecture diagrams
3. Add workflow examples
4. Add troubleshooting guides

**Estimated Effort**: 2-3 weeks

---

## Component-Specific Recommendations

### Cocoon

**Current State**:

- ✅ Core functionality complete
- ✅ Basic language features implemented
- ⚠️ API parity gaps
- ⚠️ Security validation incomplete
- ❌ Debug API not implemented
- ❌ Test API not implemented

**Prioritized Actions**:

| Priority     | Action                                  | Impact                       | Effort    |
| ------------ | --------------------------------------- | ---------------------------- | --------- |
| **Critical** | Complete Debug API                      | Enables debugging extensions | 4 weeks   |
| **Critical** | Complete Test API                       | Enables testing in-editor    | 2 weeks   |
| **High**     | Audit and secure module interceptor     | Security                     | 2 weeks   |
| **Medium**   | Optimize module interceptor performance | Performance                  | 1-2 weeks |
| **Medium**   | Add extension crash recovery            | Reliability                  | 2-3 weeks |
| **Low**      | Complete advanced language features     | Features                     | 3-4 weeks |

### Mountain

**Current State**:

- ✅ Core functionality complete
- ✅ gRPC server operational
- ⚠️ Code duplication in IPC layer
- ⚠️ Error handling inconsistent
- ⚠️ Connection pool incomplete

**Prioritized Actions**:

| Priority     | Action                                      | Impact          | Effort    |
| ------------ | ------------------------------------------- | --------------- | --------- |
| **Critical** | Refactor IPC layer to eliminate duplication | Maintainability | 2 weeks   |
| **High**     | Standardize error handling                  | Reliability     | 1-2 weeks |
| **High**     | Complete connection pool implementation     | Performance     | 2 weeks   |
| **Medium**   | Consolidate command system                  | Maintainability | 1-2 weeks |
| **Low**      | Enable message compression                  | Performance     | 1 week    |

### Vine

**Current State**:

- ✅ Protocol definition complete
- ✅ Code generation working
- ✅ Cross-language compatibility

**No critical issues identified**

**Prioritized Actions**:

| Priority   | Action                                      | Impact               | Effort    |
| ---------- | ------------------------------------------- | -------------------- | --------- |
| **Medium** | Add security features (TLS, authentication) | Security             | 2-3 weeks |
| **Medium** | Add streaming support for large transfers   | Performance          | 1 week    |
| **Low**    | Improve error messages in generated code    | Developer Experience | 1 week    |

### Air

**Current State**:

- ✅ Core services complete
- ✅ Health monitoring working
- ⚠️ Indexing performance issues
- ⚠️ Limited language support
- ⚠️ Metrics/tracing basic

**Prioritized Actions**:

| Priority   | Action                        | Impact        | Effort    |
| ---------- | ----------------------------- | ------------- | --------- |
| **High**   | Optimize indexing performance | Performance   | 3-4 weeks |
| **Medium** | Expand language support       | Features      | 3-4 weeks |
| **Medium** | Test hot-reload functionality | Reliability   | 1 week    |
| **Low**    | Add Prometheus metrics        | Observability | 1 week    |
| **Low**    | Create Grafana dashboards     | Observability | 1 week    |

### Wind

**Current State**:

- ✅ Core services complete
- ⚠️ Service coverage incomplete
- ⚠️ Performance overhead
- ⚠️ Limited testing

**Prioritized Actions**:

| Priority   | Action                     | Impact               | Effort    |
| ---------- | -------------------------- | -------------------- | --------- |
| **High**   | Implement missing services | Features             | 2-3 weeks |
| **Medium** | Optimize Effect execution  | Performance          | 2-3 weeks |
| **Medium** | Add comprehensive tests    | Reliability          | 2-3 weeks |
| **Low**    | Add better error handling  | Developer Experience | 1 week    |
| **Low**    | Add performance monitoring | Observability        | 1 week    |

### Sky

**Current State**:

- ✅ Core framework working
- ⚠️ Component coverage incomplete
- ⚠️ No dark mode
- ⚠️ Limited component tests

**Prioritized Actions**:

| Priority   | Action                       | Impact               | Effort    |
| ---------- | ---------------------------- | -------------------- | --------- |
| **High**   | Implement missing components | Features             | 2-3 weeks |
| **Medium** | Add dark mode support        | User Experience      | 1-2 weeks |
| **Medium** | Add component tests          | Reliability          | 2-3 weeks |
| **Low**    | Add UI customization         | User Experience      | 4-6 weeks |
| **Low**    | Improve documentation        | Developer Experience | 1 week    |

---

## Cross-Cutting Concerns

### 1. Documentation

**Status**: Scattered and incomplete

**Recommendations**:

- ✅ **Completed**: Architecture documentation scaffolded
- [ ] Add inline code comments
- [ ] Create API documentation for all public interfaces
- [ ] Add architecture decision records (ADRs)
- [ ] Create troubleshooting guides
- [ ] Add contribution guidelines

### 2. Testing

**Status**: Limited test coverage

**Recommendations**:

- [ ] Add unit tests for all components
- [ ] Add integration tests for cross-component communication
- [ ] Add end-to-end tests for critical workflows
- [ ] Add performance tests
- [ ] Set up continuous testing pipeline

### 3. Performance

**Status**: Some performance issues identified

**Recommendations**:

- [ ] Benchmark all critical paths
- [ ] Optimize gRPC serialization
- [ ] Optimize Tauri IPC calls
- [ ] Optimize Effect execution
- [ ] Add performance monitoring

### 4. Security

**Status**: Basic security, needs enhancement

**Recommendations**:

- [ ] Audit all user inputs
- [ ] Add comprehensive security testing
- [ ] Implement TLS for IPC
- [ ] Add authentication/authorization
- [ ] Regular security audits

### 5. Developer Experience

**Status**: Good, but can be improved

**Recommendations**:

- [ ] Better error messages
- [ ] Enhanced debug tools
- [ ] Performance profiling tools
- [ ] Better logging
- [ ] Development guides

---

## Implementation Roadmap

### Phase 1: Critical Issues (4-6 weeks)

**Goal**: Address blocking issues

- Mountain IPC refactoring (2 weeks)
- Cocoon Debug API (2 weeks)
- Cocoon Test API (1 week)
- Wind missing services (2 weeks)
- Air indexing optimization (3 weeks)

### Phase 2: High Priority (4-6 weeks)

**Goal**: Improve stability and performance

- Cocoon security validation (2 weeks)
- Mountain error handling (1-2 weeks)
- Wind performance optimization (2-3 weeks)
- Sky missing components (2-3 weeks)
- Cocoon crash recovery (2-3 weeks)

### Phase 3: Medium Priority (4-8 weeks)

**Goal**: Enhance features and reliability

- Air language support expansion (3-4 weeks)
- Mountain connection pool (2 weeks)
- Wind advanced features (3-4 weeks)
- Sky dark mode (1-2 weeks)
- Cross-component documentation (2-3 weeks)

### Phase 4: Low Priority (6+ weeks)

**Goal**: Long-term improvements

- Sky UI customization (4-6 weeks)
- Air metrics and tracing (2-3 weeks)
- Vine security features (2-3 weeks)
- Performance optimization (ongoing)
- Testing improvements (ongoing)

---

## Risk Mitigation

### High-Risk Areas

| Area                     | Risk                 | Mitigation                                |
| ------------------------ | -------------------- | ----------------------------------------- |
| IPC Refactoring          | Breaking changes     | Incremental refactoring, thorough testing |
| API Implementations      | Incomplete features  | Feature flags, gradual rollout            |
| Performance Optimization | Regression           | Benchmarking, performance monitoring      |
| Security Enhancements    | Compatibility issues | Versioning, backward compatibility        |

### Rollback Strategy

- Maintain branch for each major refactoring
- Feature flags for new features
- Comprehensive testing before merging
- Automated rollback capability

---

## Success Metrics

### Measurable Goals

| Metric                     | Current | Target          | Timeframe |
| -------------------------- | ------- | --------------- | --------- |
| Test Coverage              | ~30%    | 70%             | 3 months  |
| API Parity                 | ~60%    | 90%             | 3 months  |
| Performance (startup)      | ~5s     | <3s             | 2 months  |
| Indexing Time (1000 files) | ~30s    | <10s            | 2 months  |
| Bug Density                | Unknown | <1 bug/1000 LOC | 6 months  |

---

## Key Files Reference

| File                                                                                                                                                                                      | Purpose                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| [`Element/Mountain/Source/IPC/RefactoringSummary.md`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/IPC/RefactoringSummary.md)                                           | IPC refactoring plan       |
| [`Element/Cocoon/Documentation/GitHub/CocoonImplementationPlan.md`](https://github.com/CodeEditorLand/Cocoon/tree/Current/Documentation/GitHub/CocoonImplementationPlan.md)               | Cocoon implementation plan |
| [`Element/Cocoon/Source/Bootstrap/Documentation/ExtensionHostAnalysis.md`](https://github.com/CodeEditorLand/Cocoon/tree/Current/Source/Bootstrap/Documentation/ExtensionHostAnalysis.md) | Extension host analysis    |

---

## See Also

- [Architecture Documentation](https://github.com/CodeEditorLand/Land/tree/main/Documentation/Architecture/README.md) -
  Overall architecture
- [Component Documentation](https://github.com/CodeEditorLand/Land/tree/main/Documentation/Architecture/components) -
  Individual component documentation
- [Integration Documentation](https://github.com/CodeEditorLand/Land/tree/main/Documentation/Architecture/integration) -
  Integration patterns
- [Communication Flows](https://github.com/CodeEditorLand/Land/tree/main/Documentation/Architecture/integration/CommunicationFlows.md) -
  Communication patterns
