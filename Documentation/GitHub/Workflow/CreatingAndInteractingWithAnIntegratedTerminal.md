### **Workflow Example #7: Creating and Interacting with an Integrated Terminal**

**Goal:** An extension, or the user via a command, requests a new integrated
terminal. A native shell process (`bash`, `powershell`, etc.) is spawned, and
its input/output are fully connected to a terminal UI component (like Xterm.js)
in the frontend.

---

#### **Phase 1: Terminal Creation Request (`Cocoon` or `Wind`)**

1.  **Request Origin**
    - **Scenario A (Extension):** An extension in `Cocoon` calls
      `vscode.window.createTerminal(...)`.
    - **Scenario B (User):** The user executes the
      `workbench.action.terminal.new` command from the Command Palette in
      `Wind`.
    - **Result:** In both scenarios, the request is routed to `Mountain`'s
      `TerminalProvider` as an `ActionEffect`
      (`Common::terminal::CreateTerminal`). For the extension, this happens via
      a `$createTerminal` gRPC call. For the user, it's a Tauri command.

#### **Phase 2: Native PTY Spawning (`Mountain`)**

2. **[`TerminalProvider.CreateTerminal()`](Element/Mountain/Source/Environment/TerminalProvider.rs:122)
   (`Mountain`)**

- **Action:** The `CreateTerminal` method is executed on the
  `MountainEnvironment`.
    - It gets a new unique `TerminalId` from `AppState`.
    - It determines the shell to launch (e.g., from the request options or
      system default).
    - **Crucial Step:** It uses the `portable-pty` crate to spawn a native
      pseudo-terminal (`PtySystem.openpty`). This creates a master/slave PTY
      pair.
    - It creates a `CommandBuilder` for the shell process (e.g., `bash`).
    - **It spawns the shell process as a child of the PTY slave.** The shell now
      believes it's talking to a real terminal.
    - It creates a `TerminalStateDto` to hold all the information: the
      `TerminalId`, the OS process ID (`pid`) of the shell, and clones of the
      PTY master's reader and writer handles.

3.  **I/O Task Spawning (`Mountain`)**
    - **Action:** The handler spawns several `tokio` tasks to manage the
      terminal's lifecycle:
        - **Writer Task:** Creates a `tokio::mpsc` channel. The "sender" end of
          this channel is stored in the `TerminalStateDto`. The task runs in a
          loop, waiting for messages on the "receiver" end. When it receives a
          string, it writes those bytes to the PTY master's writer handle,
          sending input to the shell.
        - **Reader Task:** Runs in a loop, constantly reading from the PTY
          master's reader handle. Whenever it receives data (the shell's
          output), it sends a **`$acceptTerminalProcessData` gRPC notification
          to `Cocoon`**, containing the `TerminalId` and the data string.
        - **Waiter Task:** A task that awaits the termination of the child shell
          process. When the process exits, it sends a **`$acceptTerminalClosed`
          gRPC notification to `Cocoon`** and cleans up the terminal's entry
          from `AppState`.
    - The `TerminalStateDto`, now containing the `mpsc` sender and task handles,
      is stored in **`AppState.ActiveTerminals`**.

4.  **Initial Notifications (`Mountain` -> `Cocoon`)**
    - **Action:** The handler sends a **`$acceptTerminalOpened` gRPC
      notification to `Cocoon`**, including the `TerminalId` and its name.
    - It also sends a **`$acceptTerminalProcessId` notification**, providing the
      OS-level `pid`.
    - Finally, it returns the creation details (ID, name, PID) as the successful
      result of the original request.

#### **Phase 3: UI Rendering and State Sync (`Cocoon` -> `Wind/Sky`)**

5. **Cocoon Terminal Service
   ([`Element/Cocoon/Source/Services/`](Element/Cocoon/Source/Services/))**

- **Action:** The terminal service in `Cocoon` receives the `Opened`,
  `ProcessId`, and `Data` notifications from `Mountain`.
    - It creates a local `Terminal` proxy object that represents the terminal to
      extensions.
    - When it receives data, it fires the `onDidWriteData` event for that
      specific terminal instance. This allows extensions to "listen" to a
      terminal's output.

6.  **`Mountain` -> `Wind/Sky` Bridge**
    - **Action:** In addition to notifying `Cocoon`, `Mountain`'s `Reader Task`
      (Step 3) also needs to notify the frontend UI.
    - It emits a Tauri event directly to `Sky`:
      **`AppHandle.emit("sky://terminal/data", { Id: TerminalId, Data: ... })`**.

7.  **Terminal UI Component (`Wind/Sky`)**
    - **Action:** A `Terminal` component in the UI (likely wrapping `Xterm.js`)
      listens for Tauri events.
    - When it receives the `sky://terminal/create` event (triggered by the
      initial user action), it creates a new `Xterm.js` instance.
    - When it receives a `sky://terminal/data` event, it finds the correct
      `Xterm.js` instance by its `TerminalId` and calls **`xterm.write(data)`**.
    - **The shell's output now appears in the UI.**

#### **Phase 4: User Input (`Wind/Sky` -> `Mountain` -> Shell)**

8.  **Terminal UI Component (`Wind/Sky`)**
    - **Action:** The user types `ls -la` into the terminal UI.
    - The `Xterm.js` instance captures these keystrokes.
    - It uses its `onData` event handler to send the input string back to the
      native backend via a Tauri command:
      **`TauriInvoke("mountain://terminal/send-text", { Id: TerminalId, Text: "ls -la\r" })`**.

9.  **`track.rs` & `handlers/terminal/TerminalLogic.rs` (`Mountain`)**
    - **Action:** The `mountain://terminal/send-text` command is dispatched to
      `track`, which creates and runs the `Common::terminal::SendTextToTerminal`
      effect.
    - The `SendTextToTerminalLogic` handler is executed.
    - It looks up the `TerminalStateDto` for the given `TerminalId` in
      `AppState`.
    - **It sends the input string (`ls -la\r`) to the `mpsc` sender channel**
      that was stored in the `TerminalStateDto`.

10. **Writer Task (`Mountain`)**
    - **Action:** The `Writer Task` (from Step 3) was waiting on its receiver.
      It immediately receives the string.
    - **It writes the bytes of the string to the PTY master's writer handle.**
    - The OS delivers this input to the waiting shell process.

11. **Shell Execution & Output Loop**
    - **Action:** The `bash`/`powershell` process receives the input, executes
      the `ls -la` command, and writes the resulting directory listing to its
      `stdout`.
    - This output is captured by the PTY slave and sent to the PTY master.
    - The `Reader Task` (from Step 3) reads this output.
    - The loop begins again from **Step 6/7**, sending the output data to both
      `Cocoon` and the `Wind/Sky` UI.
    - **The user sees the command's output printed in their terminal.**
