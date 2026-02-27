# Code Editor Land Architecture Documentation

Welcome to the comprehensive architecture documentation for **Code Editor
Land**. This documentation provides an in-depth overview of all components,
their interactions, and integration patterns.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Component Architecture](#component-architecture)
- [Communication Patterns](#communication-patterns)
- [Integration Flows](#integration-flows)
- [Recommendations](#recommendations)

---

## Architecture Overview

Code Editor Land is a modular, multi-process code editor built with a focus on
extensibility, performance, and developer experience. It consists of six main
components organized into three layers:

### System Layers

```mermaid
graph TB
    subgraph "Presentation Layer"
        Sky[Sky<br/>UI Components<br/>Astro]
        Wind[Wind<br/>Service Layer<br/>Effect-TS]
    end

    subgraph "Orchestration Layer"
        Mountain[Mountain<br/>Native Backend<br/>Rust + Tauri]
        Air[Air<br/>Background Daemon<br/>Rust]
    end

    subgraph "Extension Layer"
        Cocoon[Cocoon<br/>Extension Host<br/>Node.js + Effect-TS]
        Vine[Vine<br/>gRPC Protocol<br/>ProtoBuf]
    end

    Sky --> Wind
    Wind --> Mountain
    Cocoon <--|gRPC|--> Vine
    Vine --> Mountain
    Mountain --> Air
    Wind --> Mountain
```

### Component Summary

| Component    | Technology            | Primary Responsibility                                                          |
| ------------ | --------------------- | ------------------------------------------------------------------------------- |
| **Cocoon**   | Node.js, Effect-TS    | Extension host that runs extensions and provides VS Code API compatibility      |
| **Mountain** | Rust, Tauri           | Native backend managing OS interactions, gRPC server, and process orchestration |
| **Vine**     | ProtoBuf              | gRPC protocol definitions and message serialization contract                    |
| **Air**      | Rust                  | Background daemon for long-running operations and task management               |
| **Wind**     | TypeScript, Effect-TS | UI service layer implementing VS Code workbench services                        |
| **Sky**      | Astro                 | Declarative UI component layer rendering the user interface                     |

---

## Component Architecture

Detailed documentation for each component:

### [Cocoon](https://github.com/CodeEditorLand/Land/tree/main/Documentation/Architecture/components/Cocoon.md)

Extension Host that manages the extension lifecycle, provides sandboxed
execution, and implements VS Code API compatibility.

**Key Features:**

- Extension activation and lifecycle management
- VS Code API shimming and implementation
- gRPC client for Mountain communication
- Module interception and security

**Key Files:**

- [`Element/Cocoon/Source/Bootstrap/Implementation/CocoonMain.ts`](https://github.com/CodeEditorLand/Cocoon/tree/Current/Source/Bootstrap/Implementation/CocoonMain.ts) -
  Main entry point
- [`Element/Cocoon/Source/Services/GRPCServerService.ts`](https://github.com/CodeEditorLand/Cocoon/tree/Current/Source/Services/GRPCServerService.ts) -
  gRPC server implementation

### [Mountain](https://github.com/CodeEditorLand/Land/tree/main/Documentation/Architecture/components/Mountain.md)

Native backend implementing core platform functionality and serving as the
central orchestrator.

**Key Features:**

- Tauri application framework
- gRPC server for inter-process communication
- File system operations
- Terminal management
- Command registry and execution

**Key Files:**

- [`Element/Mountain/src/main.rs`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/main.rs) -
  Application entry point
- [`Element/Mountain/src/vine/server/`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/Vine/Server) -
  gRPC server

### [Vine](https://github.com/CodeEditorLand/Land/tree/main/Documentation/Architecture/components/Vine.md)

gRPC protocol definitions that define the communication contract between
components.

**Key Features:**

- ProtoBuf message definitions
- Service method signatures
- Serialization/deserialization contracts

**Key Files:**

- [`Element/Vine/`](https://github.com/CodeEditorLand/Vine/tree/Current/) -
  Protocol definitions directory

### [Air](https://github.com/CodeEditorLand/Land/tree/main/Documentation/Architecture/components/Air.md)

Background daemon for handling long-running operations and task management.

**Key Features:**

- Background task execution
- Process isolation
- Resource management

**Integration Points:**

- Communicates with Mountain via gRPC
- Manages worker processes

### [Wind](https://github.com/CodeEditorLand/Land/tree/main/Documentation/Architecture/components/Wind.md)

UI service layer implementing VS Code workbench services using Effect-TS.

**Key Features:**

- Editor service
- File system service
- Command service
- Language features service
- Tauri IPC integration

**Key Files:**

- [`Element/Wind/Source/`](https://github.com/CodeEditorLand/Wind/tree/Current/) -
  Service implementations

### [Sky](https://github.com/CodeEditorLand/Land/tree/main/Documentation/Architecture/components/Sky.md)

Declarative UI component layer built with Astro framework.

**Key Features:**

- Astro-based component architecture
- Multiple workbench variants
- Page routing
- Direct browser integration

**Key Files:**

- [`Element/Sky/Source/pages/`](https://github.com/CodeEditorLand/Sky/tree/Current/Source/pages) -
  Page definitions
- [`Element/Sky/Source/Workbench/`](https://github.com/CodeEditorLand/Sky/tree/Current/Source/Workbench) -
  Workbench variants

---

## Communication Patterns

Detailed documentation of how components communicate:

### [Communication Flows](https://github.com/CodeEditorLand/Land/tree/main/Documentation/Architecture/integration/CommunicationFlows.md)

Complete request/response flows, event patterns, and data flow diagrams.

**Key Patterns:**

- Request-Response via gRPC (Cocoon ↔ Mountain)
- Event-driven via Tauri Events (Mountain → Wind/Sky)
- Command-Invoke via Tauri IPC (Wind → Mountain)

### [Spine Contract](https://github.com/CodeEditorLand/Land/tree/main/Documentation/Architecture/integration/SpineContract.md)

The central gRPC contract specification (Vine) that defines service interfaces
between components.

**Key Features:**

- Method catalog
- Error handling conventions
- Message format specifications

---

## Component Relationships

### Dependency Graph

```mermaid
graph LR
    Cocoon -->|uses| Vine
    Mountain -->|implements| Vine
    Wind -->|invokes| Mountain
    Wind -->|events| Sky
    Air -->|reports to| Mountain
```

### Communication Matrix

| From     | To       | Protocol     | Direction      |
| -------- | -------- | ------------ | -------------- |
| Cocoon   | Mountain | gRPC         | Bidirectional  |
| Wind     | Mountain | Tauri IPC    | Bidirectional  |
| Mountain | Sky      | Tauri Events | Unidirectional |
| Air      | Mountain | gRPC         | Unidirectional |

---

## Workflows

Key application workflows documented in
[Documentation/GitHub/Workflow](https://github.com/CodeEditorLand/Land/tree/Current/Documentation/GitHub/Workflow):

1. [Application Startup & Handshake](https://github.com/CodeEditorLand/Land/tree/main/Documentation/GitHub/Workflow/ApplicationStartupAndHandshake.md) -
   Complete startup sequence
2. [Opening a File from the UI](https://github.com/CodeEditorLand/Land/tree/main/Documentation/GitHub/Workflow/OpeningAFileFromTheUI.md) -
   File system operations
3. [Invoking a Language Feature (Hover Provider)](<https://github.com/CodeEditorLand/Land/tree/main/Documentation/Architecture/%3C../GitHub/Workflow/Invoking%20a%20Language%20Feature%20(Hover%20Provider).md%3E>) -
   Language features
4. [Saving a File with Save Participants](https://github.com/CodeEditorLand/Land/tree/main/Documentation/GitHub/Workflow/SavingAFileWithSaveParticipants.md) -
   Extension hooks
5. [Executing a Command from the Command Palette](https://github.com/CodeEditorLand/Land/tree/main/Documentation/GitHub/Workflow/ExecutingACommandFromTheCommandPalette.md) -
   Command system
6. [Creating and Interacting with a Webview Panel](https://github.com/CodeEditorLand/Land/tree/main/Documentation/GitHub/Workflow/CreatingAndInteractingWithAWebviewPanel.md) -
   Webview management
7. [Creating and Interacting with an Integrated Terminal](https://github.com/CodeEditorLand/Land/tree/main/Documentation/GitHub/Workflow/CreatingAndInteractingWithAnIntegratedTerminal.md) -
   Terminal I/O
8. [Source Control Management (SCM)](<https://github.com/CodeEditorLand/Land/tree/main/Documentation/Architecture/%3C../GitHub/Workflow/Source%20Control%20Management%20(SCM).md%3E>) -
   Git integration
9. [Running Extension Tests](https://github.com/CodeEditorLand/Land/tree/main/Documentation/GitHub/Workflow/RunningExtensionTests.md) -
   Test isolation
10. [User Data Synchronization](https://github.com/CodeEditorLand/Land/tree/main/Documentation/GitHub/Workflow/UserDataSynchronization.md) -
    Settings sync

---

## Technology Stack

### Core Technologies

| Layer          | Technology            |
| -------------- | --------------------- |
| UI Framework   | Astro                 |
| UI Services    | Effect-TS, TypeScript |
| Backend        | Rust, Tauri           |
| Extension Host | Node.js, Effect-TS    |
| IPC Protocol   | gRPC, ProtoBuf        |
| Build System   | ESBuild, Cargo        |

### Dependencies

- **Effect-TS**: Functional programming framework for TypeScript
- **Tauri**: Cross-platform desktop application framework
- **ProtoBuf**: Protocol Buffers for serialization
- **Astro**: Web framework for building fast content sites

---

## Architecture Principles

1. **Separation of Concerns**: Each component has a single, well-defined
   responsibility
2. **Process Isolation**: Extensions run in a separate process (Cocoon) for
   security and stability
3. **Type Safety**: Strong typing throughout with TypeScript and Rust
4. **Functional Programming**: Effect-TS for predictable, composable code
5. **Platform Native**: Rust backend for direct OS access and performance

---

## Recommendations

See
[Refactoring Priorities](https://github.com/CodeEditorLand/Land/tree/main/Documentation/Architecture/recommendations/RefactoringPriorities.md)
for identified issues and improvement opportunities.

---

## Quick Navigation

- **Component Documentation**:
  [components/](https://github.com/CodeEditorLand/Land/tree/main/Documentation/Architecture/components)
- **Integration Documentation**:
  [integration/](https://github.com/CodeEditorLand/Land/tree/main/Documentation/Architecture/integration)
- **Recommendations**:
  [recommendations/](https://github.com/CodeEditorLand/Land/tree/main/Documentation/Architecture/recommendations)
- **Workflow Examples**:
  [../GitHub/Workflow/](https://github.com/CodeEditorLand/Land/tree/main/Documentation/GitHub/Workflow)

---

## Contributing

When contributing to the architecture, please:

1. Update the relevant component documentation
2. Document new workflows in the Workflow directory
3. Update this README for major architectural changes
4. Include cross-references between related components

---

## License

This documentation is part of the Code Editor Land project. See the main
[`LICENSE`](https://github.com/CodeEditorLand/Land/tree/main/LICENSE) file for
details.
