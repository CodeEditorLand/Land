# Plan for Implementing gRPC Communication from Sky Browser Workbench to Mountain for File System Operations

## Overview
This document outlines the implementation plan to enable the Sky browser workbench to communicate with Mountain via gRPC for file system operations. Currently, Sky uses Tauri IPC and Wind services to communicate with Mountain. The goal is to add a direct gRPC-Web client in Sky that communicates with Mountain's gRPC server, which will then delegate file system operations to Cocoon (the extension host) via Mountain's existing gRPC client to Cocoon.

## Key Considerations
- Mountain already defines gRPC services in `Proto/Vine.proto`, including a `CocoonService` that provides file system operations (read_file, write_file, stat, readdir, watch_file).
- Mountain acts as a client to Cocoon's gRPC service (CocoonService) to perform file system operations on behalf of extensions.
- Sky currently communicates with Mountain via Tauri IPC (for native) and Wind (for workbench services). We will complement this approach by adding a gRPC-Web communication channel for browser-based workbench.
- The browser (Sky) requires gRPC-Web support, which uses HTTP/1.1 and requires server-side support to handle gRPC-Web requests.
- Mountain uses the `tonic` library for gRPC, which does not natively support gRPC-Web. We will need to add gRPC-Web support to Mountain, possibly using a tower adapter or the `tonic-web` crate.

## Implementation Plan

### Phase 1: Add gRPC-Web Support to Mountain
1. **Modify Mountain's gRPC server setup to support gRPC-Web**
   - Add dependency on `tonic-web` (or similar) to Mountain's Cargo.toml.
   - Update the gRPC server initialization to wrap the tonic server with a gRPC-Web adapter, allowing it to handle both standard gRPC (HTTP/2) and gRPC-Web (HTTP/1.1) requests on the same port.
   - Alternatively, run a separate gRPC-Web server on a different port if required.

2. **Expose the gRPC-Web server port**
   - Ensure the gRPC-Web server is bound to an interface accessible by the Sky browser (typically localhost).
   - Update Mountain's configuration to allow connections from the Sky browser's origin (if needed for CORS).

### Phase 2: Extend MountainService with File System RPC Methods
1. **Update `Vine.proto`**
   - Add file system RPC methods (read_file, write_file, stat, readdir, watch_file) to the `MountainService` (or create a new service if preferred).
   - These methods will mirror those in `CocoonService` but will be implemented by Mountain by delegating to its CocoonService client.

2. **Regenerate gRPC code**
   - Run `tonic-build` to update the generated Rust code from the proto.

3. **Implement the new methods in Mountain's gRPC server**
   - For each new file system RPC method in `MountainService`, call the corresponding method on Mountain's existing `CocoonService` client.
   - Handle any necessary request/response translation and error propagation.

### Phase 3: Implement TypeScript gRPC-Web Client in Sky
1. **Add gRPC-Web dependencies to Sky**
   - Install `@improbable/grpc-web` and `protobufjs` (or equivalent) in Sky's package.json.

2. **Generate TypeScript client code from Vine.proto**
   - Use `protoc` with the `grpc-web` plugin to generate TypeScript interfaces and client stubs for the Vine.proto.
   - Alternatively, use a tool like `ts-proto` to generate TypeScript code directly from the proto.

3. **Create a Mountain gRPC client service in Sky**
   - Implement a service that initializes the gRPC-Web client to connect to Mountain's gRPC-Web endpoint.
   - Provide methods for each file system operation (readFile, writeFile, etc.) that call the generated gRPC methods.

4. **Integrate with VSCode workbench in Sky**
   - Replace or complement the existing Wind/Mountain file system provider with the new gRPC-based provider.
   - The VSCode workbench in Sky uses a file system provider to interact with the host's file system. We will create a new file system provider that uses the gRPC client to perform operations via Mountain.

### Phase 4: Connection Lifecycle, Authentication, and Error Handling
1. **Connection Management**
   - Implement connection pooling or singleton client in Sky to reuse gRPC-Web connections.
   - Handle connection lifecycle (open, close, reconnect) especially when the browser workbench is reloaded or Mountain restarts.

2. **Authentication**
   - Determine if authentication is needed between Sky and Mountain. Since both are running locally on the same machine, we may rely on localhost security.
   - If required, implement token-based authentication or use mutual TLS (mTLS) for gRPC-Web.

3. **Error Handling**
   - Map gRPC errors to appropriate VSCode error messages.
   - Implement retry logic for transient errors.
   - Ensure errors are propagated to the VSCode workbench UI appropriately.

### Phase 5: Decision on Replacing vs. Complementing Existing Approach
- **Complementary Approach**: Keep the existing Tauri IPC/Wind communication for non-file-system operations (e.g., window management, commands) and use gRPC-Web specifically for file system operations. This minimizes changes to the existing architecture.
- **Replacement Approach**: Replace all Wind/Mountain communication with gRPC-Web. This would be a larger refactor but could unify the communication protocol.
- **Recommendation**: Start with a complementary approach for file system operations only, to reduce risk and allow incremental adoption. Evaluate performance and reliability before considering a full replacement.

### Phase 6: Testing and Validation
1. **Unit Tests**
   - Test the gRPC-Web client in Sky with mock Mountain responses.
   - Test Mountain's new RPC methods with mock CocoonService client.

2. **Integration Tests**
   - Start Mountain and Cocoon, then run Sky browser workbench and verify file system operations (open, save, etc.) work via gRPC-Web.

3. **End-to-End Tests**
   - Simulate user interactions in the Sky workbench (e.g., opening a file from the explorer, editing and saving) and verify they work correctly over gRPC-Web.

## Components to Modify/Create

### Mountain
- `Cargo.toml`: Add `tonic-web` dependency.
- `Source/Library.rs` or gRPC server setup: Update to enable gRPC-Web.
- `Proto/Vine.proto`: Add file system RPC methods to `MountainService`.
- Generated Rust code: Update after proto change.
- `Source/Environment/Utility/` or similar: Implement the new RPC methods in the gRPC service, delegating to CocoonService client.
- `Source/Services/MountainGRPCClient.ts` (if exists) or create: Ensure Mountain has a client for CocoonService (if not already present).

### Sky
- `package.json`: Add `@improbable/grpc-web`, `protobufjs`, and any other gRPC-Web dependencies.
- `Source/Function/` or `Source/Services/`: Create a new gRPC service for Mountain (e.g., `MountainGRPCService.ts`).
- `Source/Workbench/BrowserProxy/` or `Source/Workbench/Default/`: Integrate the gRPC-based file system provider with the VSCode workbench.
- `tsconfig.json`: Ensure TypeScript can handle the generated proto files.

### Proto
- `Element/Mountain/Proto/Vine.proto`: Add new RPC methods to `MountainService`.

## Risks and Mitigations
- **Performance**: gRPC-Web may have higher overhead than Tauri IPC. Mitigate by keeping frequently used paths on IPC and only using gRPC-Web for file system if needed, or by optimizing message serialization.
- **Browser Compatibility**: gRPC-Web relies on fetch API and is supported in modern browsers. Mitigate by targeting the same browser versions as Sky currently supports.
- **Security**: Exposing gRPC-Web on localhost may pose a risk if malicious websites attempt to connect. Mitigate by binding to localhost only and checking the Origin header if necessary.
- **Complexity**: Adding a new communication channel increases system complexity. Mitigate by thorough documentation and incremental rollout.

## Open Questions
1. Does Mountain already have a gRPC client for CocoonService? If not, we need to create one.
2. What is the exact mechanism Mountain uses to communicate with Cocoon for file system operations? We assume it's via gRPC (CocoonService) but need to confirm.
3. Should we use the same port for gRPC and gRPC-Web, or separate ports? Using the same port with protocol detection is possible with tonic-web.
4. How will Sky discover the Mountain gRPC-Web endpoint? Likely via localhost and a known port (e.g., from environment variable or configuration).

## Conclusion
This plan enables Sky to perform file system operations via gRPC-Web to Mountain, leveraging Mountain's existing gRPC communication with Cocoon. It complements the current Wind/Tauri IPC approach and provides a path for potential future unification of communication protocols.