# Cocoon Health Monitoring - Implementation Plan

## Overview

This document outlines the implementation approach for adding comprehensive
health monitoring and auto-restart capabilities to the Cocoon extension host
process.

## Current State Analysis

### Existing Infrastructure

**Location**:
[`Element/Mountain/Source/ProcessManagement/CocoonManagement.rs`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/ProcessManagement/CocoonManagement.rs)

**Current Status**:

- ✅ Cocoon process spawning implemented
- ✅ gRPC connection establishment
- ✅ Initial handshake validation
- ✅ Stdout/stderr capture for logging
- ❌ No process health monitoring
- ❌ No crash detection
- ❌ No automatic restart capability
- ❌ Process state not tracked beyond initialization

**Key Findings**:

1. `CocoonProcessState` struct exists but is not used (defined at lines 86-94)
2. Process handle is dropped after initialization (line 327:
   `let _process = Some(ChildProcess);`)
3. Comments acknowledge missing features (lines 324-326)
4. No continuous health checks implemented

### Available Health Monitoring Infrastructure

**Location**:
[`Element/Mountain/Source/IPC/Common/HealthStatus.rs`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/IPC/Common/HealthStatus.rs)

**Available Components**:

- ✅ `HealthMonitor` - Health state tracking with scoring (0-100)
- ✅ `SeverityLevel` - Priority levels (Low, Medium, High, Critical)
- ✅ `HealthIssue` - Types of detectable issues (HighLatency, MemoryPressure,
  ConnectionLoss, etc.)
- ✅ `HealthStatus` - Comprehensive status tracking

**Integration Points**:

- HealthMonitor can track Cocoon process health score
- SeverityLevel can prioritize recovery actions
- HealthIssue types map to Cocoon failure scenarios

## Implementation Strategy

### Phase 1: Process State Tracking

**Objective**: Track Cocoon process state throughout its lifecycle

**Changes Required**:

1. **Activate Process State Management**
    - Store `CocoonProcessState` in a shared, thread-safe container (e.g.,
      `Arc<Mutex<CocoonProcessState>>`)
    - Update state on process lifecycle events (spawn, health check, crash,
      restart)
    - Make state accessible for health monitoring and recovery

2. **Add Process Handle Storage**
    - Keep the `Child` process handle accessible
    - Prevent premature dropping that terminates monitoring
    - Enable graceful shutdown when needed

3. **Implement State Transitions**
    - Track: `Idle` → `Spawning` → `Running` → `Unhealthy` → `Restarting` →
      `Terminated`
    - Log state transitions for debugging
    - Update timestamps for health scoring

### Phase 2: Health Check Implementation

**Objective**: Implement continuous health monitoring for Cocoon

**Health Check Mechanisms**:

1. **Process Liveness Check**
    - Monitor process exit status using `tokio::process::Child::try_wait()`
    - Detect crashes or unexpected termination
    - Check process ID validity

2. **gRPC Connectivity Check**
    - Periodically ping Cocoon's gRPC endpoint (port 50052)
    - Measure response latency
    - Detect connection drops or timeouts

3. **Vine Protocol Health**
    - Send periodic health check requests via Vine
    - Verify response format and content
    - Track message delivery success rate

4. **Resource Monitoring**
    - Monitor stdout/stderr for error patterns
    - Track error frequency and severity
    - Detect memory pressure indicators

### Phase 3: Health Scoring Integration

**Objective**: Calculate and maintain health scores using existing
infrastructure

**Implementation**:

1. **Initialize HealthMonitor**

    ```rust
    let mut health_monitor = HealthMonitor::new();
    ```

2. **Score Calculation Factors**:
    - Process liveness: 40% weight (critical)
    - gRPC connectivity: 30% weight (high)
    - Vine responsiveness: 20% weight (medium)
    - Resource health: 10% weight (low)

3. **Issue Reporting**:
    - Report `HealthIssue::ConnectionLoss` when gRPC fails
    - Report `HealthIssue::PerformanceDegradation` for high latency
    - Report `HealthIssue::MemoryPressure` for resource issues
    - Report `HealthIssue::Custom("ProcessCrashed")` on termination

4. **Health Score Thresholds**:
    - 90-100: Healthy - No action
    - 70-89: Warning - Monitor closely
    - 50-69: Degraded - Consider restart
    - <50: Critical - Immediate restart required

### Phase 4: Auto-Restart Mechanism

**Objective**: Automatically recover Cocoon on failures

**Restart Strategy**:

1. **Restart Conditions**:
    - Process crash detected (handled `try_wait()` returns some)
    - Health score drops below 50 for >30 seconds
    - Critical connectivity issues (gRPC or Vine)
    - Multiple consecutive health failures

2. **Restart Limits**:
    - Maximum 3 restart attempts within 5 minutes
    - Exponential backoff: 1s, 2s, 4s delay between restarts
    - After 3 failed restarts: Mark as permanently failed, require manual
      intervention

3. **Restart Procedure**:

    ```rust
    async fn restart_cocoon(state: &mut CocoonProcessState) -> Result<(), CommonError> {
        // 1. Terminate existing process if running
        // 2. Update state to Restarting
        // 3. Wait backoff period
        // 4. Spawn new process
        // 5. Perform handshake
        // 6. Reset health monitor
    }
    ```

4. **Graceful Shutdown**:
    - Send shutdown signal via Vine before kill
    - Allow 5 second grace period
    - Force kill if unresponsive
    - Clean up resources and connections

### Phase 5: Background Health Monitor Task

**Objective**: Run continuous monitoring in background

**Implementation**:

1. **Spawn Background Task**:

    ```rust
    tokio::spawn(async move {
        loop {
            monitor_cocoon_health(&state, &health_monitor).await;
            tokio::time::sleep(Duration::from_secs(10)).await;
        }
    });
    ```

2. **Health Check Loop**:
    - Check process liveness every 5 seconds
    - Check gRPC connectivity every 10 seconds
    - Check Vine protocol every 15 seconds
    - Update health score on each check
    - Trigger restart if conditions met

3. **Concurrent Safe Access**:
    - Use `Arc<Mutex<CocoonProcessState>>` for shared state
    - Lock duration minimized (<100ms per check)
    - Non-blocking where possible

## Code Changes Required

### File: [`Element/Mountain/Source/ProcessManagement/CocoonManagement.rs`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/ProcessManagement/CocoonManagement.rs)

#### 1. Add Imports (after line 75)

```rust
use std::sync::{Arc, Mutex};
use crate::IPC::Common::HealthStatus::{HealthMonitor, HealthIssue, SeverityLevel};
```

#### 2. Make ProcessState Global (after line 94)

```rust
lazy_static::lazy_static! {
    static ref COCOON_STATE: Arc<Mutex<CocoonProcessState>> =
        Arc::new(Mutex::new(CocoonProcessState::default()));
}

static ref COCOON_HEALTH: Arc<Mutex<HealthMonitor>> =
    Arc::new(Mutex::new(HealthMonitor::new()));
}
```

#### 3. Update Storage (replace line 327)

```rust
// Store process handle for health monitoring
let mut state = COCOON_STATE.lock().unwrap();
state.ChildProcess = Some(ChildProcess);
state.IsRunning = true;
state.StartTime = Some(tokio::time::Instant::now());
drop(state);
```

#### 4. Add Health Monitor Task (after line 329)

```rust
// Start background health monitoring
tokio::spawn(monitor_cocoon_health_task());
```

#### 5. Implement Monitor Function (new function at end of file)

```rust
async fn monitor_cocoon_health_task() {
    loop {
        tokio::time::sleep(Duration::from_secs(10)).await;

        let state_snapshot = {
            let state = COCOON_STATE.lock().unwrap();
            state.clone()
        };

        if let Some(ref child) = state_snapshot.ChildProcess {
            // Check if process is still running
            match child.try_wait() {
                Ok(Some(exit_status)) => {{
```
