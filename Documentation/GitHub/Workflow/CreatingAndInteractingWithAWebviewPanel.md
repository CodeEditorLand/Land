### **Workflow Example #6: Creating and Interacting with a Webview Panel**

**Goal:** An extension wants to show a custom user interface, like a welcome
page or a complex data visualization. It uses the `createWebviewPanel` API to do
this. The user can then interact with this panel, sending messages back to the
extension.

---

#### **Phase 1: Extension Creates the Webview (`Cocoon`)**

1.  **Extension Activation (`Cocoon`)**
    - **Action:** An extension is activated. Its `activate()` function runs.

2.  **`vscode.window.createWebviewPanel()`
    (`Cocoon/src/Service/WebviewPanel.ts`)**
    - **Action:** The extension calls `window.createWebviewPanel(...)`,
      providing a `viewType`, `title`, `viewColumn`, and `options` (which
      include enabling scripts).
    - The call is received by our `WebviewPanelProvider` service in `Cocoon`.
    - The provider's `CreateWebviewPanel` effect is executed.

3.  **`IpcProvider` (`Cocoon/src/Service/Ipc.ts`)**
    - **Action:** The `CreateWebviewPanel` effect constructs a detailed DTO
      containing all the panel options, the extension's ID, and its location on
      disk (for resolving `localResourceRoots`).
    - It sends a **`$createWebviewPanel` gRPC request to `Mountain`**, passing
      this DTO.
    - It `await`s a response, which will be the unique `handle` (ID) for this
      new webview panel.

#### **Phase 2: Host Creates the Native Webview (`Mountain`)**

4.  **gRPC Server & Dispatcher (`Mountain/src/vine/` & `src/track/`)**
    - **Action:** The `$createWebviewPanel` request is received and dispatched
      to the `WebviewProvider` trait implementation on the
      `MountainEnvironment`.

5.  **[`WebviewProvider.CreateWebviewPanel()`](Element/Mountain/Source/Environment/WebviewProvider.rs:206)
    (`Mountain`)**

- **Action:** The `CreateWebviewPanel` method is executed on the
  `MountainEnvironment`.
    - It generates a unique handle (e.g., a UUID) for the new panel.
    - It creates a `WebviewStateDto` containing all the options received from
      `Cocoon` and stores it in **`AppState.ActiveWebviews`** using the handle
      as the key.
    - Crucially, it **emits a Tauri event to the `Sky` frontend**:
      `AppHandle.emit("sky://webview/create", { Handle, Title, ... })`. This
      command tells the UI layer to physically create a new webview component.
    - **It sends the unique `handle` back to `Cocoon`** as the successful
      response to the gRPC request.

#### **Phase 3: UI Renders the Webview (`Wind/Sky`)**

6.  **Webview Manager (`Wind`)**
    - **Action:** A listener in `Wind` (e.g., in a `WebviewManagementService`)
      receives the `sky://webview/create` event from `Mountain`.
    - It dynamically creates a new `TauriWebviewWindow` or a webview `<iframe>`
      within the main window's DOM, associating it with the received `handle`.
      This new webview is initially empty.

#### **Phase 4: Extension Sets Content and Interacts (`Cocoon` <-> `Mountain` <-> `Wind`)**

7.  **`WebviewPanelProvider` (`Cocoon`, continued)**
    - **Action:** The `$createWebviewPanel` gRPC call resolves, returning the
      unique `handle`.
    - The service creates a `WebviewPanelShim` and a `WebviewShim` instance,
      storing the `handle`. It returns the `WebviewPanelShim` to the extension.

8.  **Extension Code (`Cocoon`)**
    - **Action:** The extension now has a `panel` object. It sets the content by
      assigning a string of HTML:
      `panel.webview.html = "<h1>Hello World</h1>";`.
    - The `set html` accessor in the `WebviewShim` (`Service/Webview.ts`) is
      triggered.
    - It sends a **`$setWebviewHtml` gRPC request to `Mountain`**, including the
      `handle` and the HTML string.

9.  **[`WebviewProvider`](Element/Mountain/Source/Environment/WebviewProvider.rs)
    (`Mountain`)**

- **Action:** The `$setWebviewHtml` request is received and dispatched to the
  WebviewProvider.
- The provider looks up the webview in `AppState` using the `handle`.
    - It emits another Tauri event:
      **`AppHandle.emit("sky://webview/set-html", { Handle, Html })`**.

10. **Webview Manager (`Wind`)**
    - **Action:** The listener in `Wind` receives the `sky://webview/set-html`
      event.
    - It finds the webview component corresponding to the `handle`.
    - **It sets the inner HTML of the webview element/window.** The "Hello
      World" now appears in the UI.

11. **User Interaction (`Wind` -> `Mountain` -> `Cocoon`)**
    - **Action:** The user clicks a button inside the webview's HTML, which has
      an `onclick` handler that calls
      `vscode.postMessage({ command: 'doSomething' })`. (The webview's content
      script would have access to this `vscode` object, provided by a preload
      script for that webview).
    - This sends a message **from the webview to its host (`Wind`)**.
    - The `Wind` webview component host sends a Tauri command to the backend:
      `TauriInvoke("mountain://webview/on-message", { Handle, Message })`.
    - `Mountain` receives this command. The handler looks up the webview's owner
      sidecar (`cocoon-main`) in `AppState`.
    - `Mountain` sends a **`$onDidReceiveMessage` gRPC notification to
      `Cocoon`**, including the `handle` and the message payload.
    - `Cocoon` receives the notification. The `WebviewPanelProvider` finds the
      `WebviewShim` for that `handle` and fires its `onDidReceiveMessage` event.

12. **Extension Receives Message (`Cocoon`)**
    - **Action:** The extension's listener for
      `panel.webview.onDidReceiveMessage` is executed with the
      `{ command: 'doSomething' }` payload.
    - **The communication loop is complete.** The extension can now react to the
      user's action in the UI.
