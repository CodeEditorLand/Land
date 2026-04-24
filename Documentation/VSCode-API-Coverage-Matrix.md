# VS Code API Coverage Matrix

Authoritative map of every top-level `vscode.*` API surface and its
implementation split across **Sky** (workbench renderer), **Cocoon**
(extension-host Node sidecar), and **Mountain** (Rust backend). Drives the
dual-track strategy:

- **Track A - Stock-Node**: Cocoon loads stock VS Code `extHost*.ts` sources
  unchanged; the workbench's `mainThread*.ts` runs inside Sky (already the
  case - Sky ships the patched `vs/workbench` bundle). The
  ExtHostContext/MainContext RPC glue is provided by Cocoon's shim alongside
  stock extHost code. This yields **maximum compatibility** from day one for any
  API the stock implementation handles in-process.
- **Track B - Rust-native**: Mountain owns the backend. Cocoon's `vscode` shim
  sends gRPC to Mountain which does the work natively (filesystem, process,
  terminal, search, git). Faster and safer than bouncing through Node for
  I/O-heavy APIs.

The two tracks are **not mutually exclusive**. Most APIs live on Track A by
default (stock compat guaranteed), and we promote individual operations to Track
B when a measured benefit exists. The Cocoon `<Namespace>Route.ts` tier router
documented in `Cocoon/Source/Services/Handler/VscodeAPI/ROUTING.md` decides
per-call.

## Legend

| Track | Meaning                                                       |
| ----- | ------------------------------------------------------------- |
| **A** | Stock-Node - lift unchanged `extHost*.ts` into Cocoon         |
| **B** | Rust-native - Mountain owns backend, gRPC from Cocoon         |
| **C** | Cocoon-bespoke - hand-rolled TS in Land (last resort)         |
| **S** | Sky-direct - call via `__CEL_SERVICES__.*` workbench accessor |

Status symbols:

- ✅ Working end-to-end (activation + feature render path confirmed)
- 🟡 Partial - RPC wired but UI render gap, or missing sub-method
- 🔴 Stubbed / dropped-on-floor - registration accepted, no effect
- ⚪ Not yet attempted
- 🟢 Pure-function lift (stateless, no RPC) already landed via
  `Cocoon/.../VscodeAPI/StockLift.ts`

---

## 1. Top-level namespaces

### `vscode.commands`

| Operation                   | Primary | Status | Stock file           | Mountain           | Sky                                                              |
| --------------------------- | ------- | ------ | -------------------- | ------------------ | ---------------------------------------------------------------- |
| `registerCommand`           | A+S     | ✅     | `extHostCommands.ts` | `commands` channel | `__CEL_SERVICES__.CommandRegistry.registerCommand` (just landed) |
| `registerTextEditorCommand` | A       | ✅     | `extHostCommands.ts` | -                  | -                                                                |
| `executeCommand`            | A+S     | ✅     | `extHostCommands.ts` | `commands:execute` | `__CEL_SERVICES__.Commands.executeCommand` (just landed)         |
| `getCommands`               | A       | ✅     | `extHostCommands.ts` | -                  | -                                                                |

### `vscode.window` - Editors

| Operation                     | Primary | Status | Stock file                                              | Mountain                             | Sky                                      |
| ----------------------------- | ------- | ------ | ------------------------------------------------------- | ------------------------------------ | ---------------------------------------- |
| `activeTextEditor`            | A       | ✅     | `extHostTextEditor.ts`                                  | -                                    | `IEditorService.activeTextEditorControl` |
| `visibleTextEditors`          | A       | ✅     | `extHostTextEditors.ts`                                 | -                                    | -                                        |
| `showTextDocument`            | A       | ✅     | `extHostDocuments.ts` → `sky://window/showTextDocument` | `sky://window/showTextDocument` emit | `vscode.open` command dispatch           |
| `onDidChangeActiveTextEditor` | A       | ✅     | event from mainThread                                   | -                                    | -                                        |

### `vscode.window` - Surfaces (TreeView, StatusBar, Webview, Terminal)

| Operation                                                            | Primary    | Status         | Stock file                    | Mountain                                               | Sky                                                |
| -------------------------------------------------------------------- | ---------- | -------------- | ----------------------------- | ------------------------------------------------------ | -------------------------------------------------- |
| `createStatusBarItem`                                                | S (native) | ✅ just landed | `extHostStatusBar.ts`         | `sky://statusbar/{update,dispose,set-entry}`           | `__CEL_SERVICES__.Statusbar.addEntry`              |
| `setStatusBarMessage`                                                | S          | ✅             | `extHostStatusBar.ts`         | `sky://statusbar/set-message`                          | CustomEvent fan-out                                |
| `createTreeView`                                                     | A+S        | 🟡 F1.1        | `extHostTreeViews.ts`         | `tree.register` emit (53 active views in log)          | Sky listener `cel:tree-view:create` - renderer gap |
| `registerTreeDataProvider`                                           | A+S        | 🟡             | `extHostTreeViews.ts`         | `$provideTreeChildren` gRPC                            | -                                                  |
| `createWebviewPanel`                                                 | A          | 🔴 F4          | `extHostWebviewPanels.ts`     | -                                                      | stub channel `webview`                             |
| `registerWebviewViewProvider`                                        | A          | 🔴             | `extHostWebviewView.ts`       | -                                                      | -                                                  |
| `registerCustomEditorProvider`                                       | A          | 🔴             | `extHostCustomEditors.ts`     | -                                                      | -                                                  |
| `createTerminal`                                                     | B          | 🟡             | -                             | `terminal:create` / PTY via `portable-pty`             | workbench terminal panel                           |
| `onDidOpen/CloseTerminal`                                            | B          | 🟡             | -                             | `sky://terminal/{opened,closed}`                       | -                                                  |
| `createOutputChannel`                                                | S          | ✅             | `extHostOutput.ts`            | `sky://output/{create,append,clear,dispose}`           | local mirror + workbench output panel              |
| `showInformationMessage` / `showWarningMessage` / `showErrorMessage` | A          | ✅             | `extHostMessageService.ts`    | `sky://ui/show-message-request` + `ResolveUIRequest`   | DOM toast fallback                                 |
| `showQuickPick` / `createQuickPick`                                  | A          | 🟡             | `extHostQuickOpen.ts`         | `sky://ui/show-quickpick-request` + `ResolveUIRequest` | workbench quick-input                              |
| `showInputBox`                                                       | A          | 🟡             | `extHostQuickOpen.ts`         | -                                                      | -                                                  |
| `showOpenDialog` / `showSaveDialog`                                  | B          | ✅             | `extHostDialogs.ts`           | `nativeHost:showOpenDialog` / `showSaveDialog` (Tauri) | -                                                  |
| `showWorkspaceFolderPick`                                            | A          | ⚪ stable-gap  | `extHostDialogs.ts`           | -                                                      | -                                                  |
| `withProgress`                                                       | A+S        | 🟡             | `extHostProgress.ts`          | `sky://progress/{start,update,complete}`               | DOM toast + workbench progress                     |
| `registerFileDecorationProvider`                                     | A          | 🟡             | `extHostDecorations.ts`       | -                                                      | -                                                  |
| `registerUriHandler`                                                 | A          | 🟡             | `extHostUrls.ts`              | `register_uri_handler` notif-drop covered              | -                                                  |
| `onDidChangeWindowState`                                             | A          | ✅             | `extHostWindow.ts`            | -                                                      | -                                                  |
| `showNotebookDocument`                                               | A          | 🔴             | `extHostNotebookDocuments.ts` | -                                                      | -                                                  |

### `vscode.workspace`

| Operation                                                                                                 | Primary | Status                | Stock file                           | Mountain                                                     | Sky                                          |
| --------------------------------------------------------------------------------------------------------- | ------- | --------------------- | ------------------------------------ | ------------------------------------------------------------ | -------------------------------------------- |
| `workspaceFolders`                                                                                        | A       | ✅                    | `extHostWorkspace.ts`                | seeded via `InitializationData.FoldersWire`                  | -                                            |
| `onDidChangeWorkspaceFolders`                                                                             | A       | ✅                    | `extHostWorkspace.ts`                | `sky://workspace/foldersChanged`                             | -                                            |
| `getWorkspaceFolder`                                                                                      | A+B     | ✅                    | `extHostWorkspace.ts`                | -                                                            | -                                            |
| `textDocuments`                                                                                           | A       | ✅                    | `extHostDocuments.ts`                | `sky://lifecycle/synchronizeDocuments`                       | -                                            |
| `openTextDocument`                                                                                        | A+B     | ✅                    | `extHostDocuments.ts`                | `file:read` gRPC                                             | -                                            |
| `onDidOpen/Close/SaveTextDocument`                                                                        | A       | ✅                    | `extHostDocuments.ts`                | -                                                            | -                                            |
| `onWillSaveTextDocument`                                                                                  | A       | 🟡                    | `extHostDocumentSaveParticipant.ts`  | `$participateInSave` gRPC                                    | -                                            |
| `applyEdit`                                                                                               | A+S     | 🟡                    | `extHostBulkEdits.ts`                | `sky://workspace/applyEdit` + `ResolveUIRequest`             | `workbench.action.applyThemeFromFile` (stub) |
| `save` / `saveAs`                                                                                         | A       | ⚪ stable-gap         | `extHostDocuments.ts`                | -                                                            | -                                            |
| `fs.readFile` / `writeFile` / `stat` / `readDirectory` / `createDirectory` / `delete` / `rename` / `copy` | **B**   | ✅                    | `extHostFileSystemConsumer.ts`       | `file:*` gRPC                                                | -                                            |
| `fs.isWritableFileSystem`                                                                                 | A       | ✅                    | -                                    | -                                                            | -                                            |
| `registerFileSystemProvider`                                                                              | A       | 🟡                    | `extHostFileSystem.ts`               | `register_file_system_provider` notif-drop covered           | -                                            |
| `createFileSystemWatcher`                                                                                 | B       | 🟡 `FileWatcher=Stub` | `extHostFileSystemEventService.ts`   | stub (needs `notify` crate)                                  | -                                            |
| `findFiles`                                                                                               | **B**   | ✅                    | `extHostSearch.ts`                   | `search:findFiles` (globset)                                 | new `ISearchResultProvider` just landed      |
| `findTextInFiles`                                                                                         | **B**   | ✅ just landed        | `extHostSearch.ts`                   | `search:findInFiles`                                         | new provider                                 |
| `registerTextDocumentContentProvider`                                                                     | A       | 🟡                    | `extHostDocumentContentProviders.ts` | `register_text_document_content_provider` notif-drop covered | -                                            |
| `getConfiguration` / `onDidChangeConfiguration`                                                           | A+B     | ✅                    | `extHostConfiguration.ts`            | `Configuration` cache                                        | `IConfigurationService`                      |
| `registerTaskProvider`                                                                                    | A       | 🟡                    | `extHostTask.ts`                     | `register_task_provider` notif-drop covered                  | -                                            |

### `vscode.languages`

| Operation                                | Primary | Status | Stock file                   | Mountain                                                    | Sky                    |
| ---------------------------------------- | ------- | ------ | ---------------------------- | ----------------------------------------------------------- | ---------------------- |
| `registerCompletionItemProvider`         | A       | 🟡     | `extHostLanguageFeatures.ts` | `register_completion_item_provider` + `GetCompletions` gRPC | -                      |
| `registerHoverProvider`                  | A       | 🟡     | same                         | `register_hover_provider` + `GetHoverAtPosition` gRPC       | -                      |
| `registerDefinitionProvider`             | A       | 🟡     | same                         | `register_definition_provider` + `GetDefinition` gRPC       | -                      |
| `registerReferenceProvider`              | A       | 🟡     | same                         | `register_reference_provider` + `GetReferences` gRPC        | -                      |
| `registerDocumentSymbolProvider`         | A       | 🟡     | same                         | `GetDocumentSymbols` gRPC                                   | -                      |
| `registerCodeActionsProvider`            | A       | 🟡     | same                         | `register_code_actions_provider`                            | -                      |
| `registerCodeLensProvider`               | A       | 🟡     | same                         | `register_code_lens_provider`                               | -                      |
| `registerDocumentFormattingEditProvider` | A       | 🟡     | same                         | `register_document_formatting_provider`                     | -                      |
| `registerRenameProvider`                 | A       | 🟡     | same                         | `register_rename_provider`                                  | -                      |
| `registerInlayHintsProvider`             | A       | 🟡     | same                         | `register_inlay_hints_provider`                             | -                      |
| `registerFoldingRangeProvider`           | A       | 🟡     | same                         | `register_folding_range_provider`                           | -                      |
| `registerSemanticTokensProvider`         | A       | 🟡     | same                         | `register_semantic_tokens_provider`                         | -                      |
| `registerSignatureHelpProvider`          | A       | 🟡     | same                         | `register_signature_help_provider`                          | -                      |
| `setTextDocumentLanguage`                | A+S     | ✅     | `extHostLanguages.ts`        | `sky://languages/setDocumentLanguage`                       | Monaco language setter |
| `setLanguageConfiguration`               | A+S     | ✅     | `extHostLanguages.ts`        | `sky://language/configure`                                  | -                      |
| `createDiagnosticCollection`             | A+S     | ✅     | `extHostDiagnostics.ts`      | `sky://diagnostics/changed`                                 | workbench diagnostics  |
| `match`                                  | 🟢 pure | ✅     | StockLift                    | -                                                           | -                      |

### `vscode.debug`

| Operation                                         | Primary | Status        | Stock file               | Mountain                                    | Sky |
| ------------------------------------------------- | ------- | ------------- | ------------------------ | ------------------------------------------- | --- |
| `registerDebugConfigurationProvider`              | A       | 🟡            | `extHostDebugService.ts` | `register_debug_configuration_provider`     | -   |
| `registerDebugAdapterDescriptorFactory`           | A       | 🟡            | same                     | `register_debug_adapter` notif-drop covered | -   |
| `registerDebugAdapterTrackerFactory`              | A       | 🟡            | same                     | -                                           | -   |
| `startDebugging`                                  | A+B     | 🔴            | same                     | `debug:start` handler missing               | -   |
| `activeDebugSession` / `onDidStart/ChangeSession` | A       | 🔴            | same                     | `sky://debug/session-*`                     | -   |
| `addBreakpoints` / `removeBreakpoints`            | A       | 🔴            | same                     | -                                           | -   |
| `activeStackItem`                                 | A       | ⚪ stable-gap | same                     | -                                           | -   |

### `vscode.tasks`

| Operation                                            | Primary | Status | Stock file       | Mountain                                     | Sky |
| ---------------------------------------------------- | ------- | ------ | ---------------- | -------------------------------------------- | --- |
| `registerTaskProvider`                               | A       | 🟡     | `extHostTask.ts` | `register_task_provider` notif-drop covered  | -   |
| `fetchTasks`                                         | A       | 🔴     | same             | -                                            | -   |
| `executeTask`                                        | A+B     | 🔴     | same             | needs `tasks:execute` (PTY or child_process) | -   |
| `taskExecutions` / `onDidStartTask` / `onDidEndTask` | A       | 🔴     | same             | -                                            | -   |

### `vscode.scm`

| Operation                     | Primary | Status  | Stock file                              | Mountain                                            | Sky                                                                                          |
| ----------------------------- | ------- | ------- | --------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `createSourceControl`         | A+S     | 🟡 F4   | `extHostSCM.ts`                         | `register_scm_provider` + `sky://scm/register` emit | SkyBridge diagnostic subscriber; needs `ISCMService` route (Investigation step 4 - deferred) |
| `inputBox.value` read/write   | A       | 🟡      | `extHostSCM.ts`                         | round-trip via `ResolveUIRequest`                   | -                                                                                            |
| `$gitExec` (built-in git ext) | **B**   | 🔴 F3.2 | `git/out/model.js` → `localGit` channel | **NEEDS `git:*` handlers** - implemented this turn  | -                                                                                            |

### `vscode.env`

| Operation                                                                                                  | Primary | Status                | Stock file            | Mountain                                                | Sky |
| ---------------------------------------------------------------------------------------------------------- | ------- | --------------------- | --------------------- | ------------------------------------------------------- | --- |
| `appName` / `appRoot` / `uriScheme` / `language` / `shell` / `machineId` / `sessionId` / `isNewAppInstall` | A       | ✅                    | `extHost.api.impl.ts` | seeded in InitData                                      | -   |
| `isAppPortable`                                                                                            | A       | ⚪ just-landed-stub   | same                  | -                                                       | -   |
| `clipboard.readText` / `writeText`                                                                         | B       | ✅                    | `extHostClipboard.ts` | `nativeHost:readClipboard` / `writeClipboard` via Tauri | -   |
| `openExternal`                                                                                             | B       | ✅                    | `extHostWindow.ts`    | `native:openExternal` via Tauri `shell.open`            | -   |
| `asExternalUri`                                                                                            | A       | ⚪                    | same                  | -                                                       | -   |
| `remoteName` / `remoteAuthority`                                                                           | A       | ✅ (always undefined) | `extHostWorkspace.ts` | -                                                       | -   |

### `vscode.extensions`

| Operation          | Primary | Status | Stock file            | Mountain                  | Sky |
| ------------------ | ------- | ------ | --------------------- | ------------------------- | --- |
| `getExtension(id)` | A       | ✅     | `extHost.api.impl.ts` | `extensions:get`          | -   |
| `all`              | A       | ✅     | same                  | `extensions:getInstalled` | -   |
| `onDidChange`      | A       | ✅     | same                  | `$deltaExtensions` gRPC   | -   |

### `vscode.authentication`

| Operation                        | Primary | Status | Stock file                 | Mountain                           | Sky |
| -------------------------------- | ------- | ------ | -------------------------- | ---------------------------------- | --- |
| `registerAuthenticationProvider` | A       | 🟡     | `extHostAuthentication.ts` | `register_authentication_provider` | -   |
| `getSession`                     | A       | 🟡     | same                       | `$getSession` gRPC                 | -   |
| `getAccounts`                    | A       | 🟡     | same                       | -                                  | -   |

### `vscode.notebooks`

| Operation                                   | Primary | Status | Stock file                  | Mountain                                  | Sky |
| ------------------------------------------- | ------- | ------ | --------------------------- | ----------------------------------------- | --- |
| `createNotebookController`                  | A       | 🔴     | `extHostNotebookKernels.ts` | -                                         | -   |
| `registerNotebookCellStatusBarItemProvider` | A       | 🔴     | -                           | -                                         | -   |
| `registerNotebookSerializer`                | A       | 🟡     | `extHostNotebook.ts`        | `register_notebook_serializer` notif-drop | -   |

### `vscode.tests`

| Operation                 | Primary | Status | Stock file          | Mountain                      | Sky |
| ------------------------- | ------- | ------ | ------------------- | ----------------------------- | --- |
| `createTestController`    | A       | 🟡     | `extHostTesting.ts` | `sky://tests/registered` emit | -   |
| Run profile / run request | A       | 🔴     | same                | -                             | -   |

### `vscode.chat` / `vscode.lm`

| Operation                           | Primary | Status              | Stock file                 | Mountain | Sky |
| ----------------------------------- | ------- | ------------------- | -------------------------- | -------- | --- |
| `createChatParticipant`             | A       | 🔴                  | `extHostChatAgents2.ts`    | -        | -   |
| `registerLanguageModelChatProvider` | A       | ⚪ just-landed-stub | `extHostLanguageModels.ts` | -        | -   |
| `selectChatModels`                  | A       | 🔴                  | same                       | -        | -   |

### `vscode.l10n`

| Operation         | Primary | Status | Stock file                              | Mountain                       | Sky |
| ----------------- | ------- | ------ | --------------------------------------- | ------------------------------ | --- |
| `t(message, ...)` | 🟢 pure | ✅     | StockLift-able `vs/base/common/l10n.ts` | -                              | -   |
| `bundle` / `uri`  | A       | ✅     | `extHostLocalizationService.ts`         | NLS bundle loaded at scan time | -   |

### `vscode.comments`

| Operation                 | Primary | Status | Stock file           | Mountain | Sky |
| ------------------------- | ------- | ------ | -------------------- | -------- | --- |
| `createCommentController` | A       | 🔴     | `extHostComments.ts` | -        | -   |

---

## 2. Domain-grouped preferred-primary matrix

Grouped to highlight where Rust wins vs where Node-stock wins.

### Rust-native primary (Track B wins)

High I/O, process, or syscall-bound operations where Node adds latency and the
stock code ultimately bridges to the same native syscall anyway:

- **File system** - `workspace.fs.*`, scanner reads. Mountain owns `File::*` via
  tokio, gives us zero-copy, sandbox gating, and transparent scheme resolution.
  Stock `extHostFileSystemConsumer.ts` would just marshal JSON over IPC to do
  the same syscall.
- **Find files / text search** - `workspace.findFiles` / `findTextInFiles`.
  Mountain's `globset` + walk is measured faster than Node's glob package;
  migrating to `ripgrep` crate is the next perf tier.
- **Terminal PTY** - already Mountain-owned via `portable-pty`. Stock
  `extHostTerminalService.ts` is a shim that forwards to a native PTY
  regardless; Land cuts out the middle hop.
- **Git subprocess** - the built-in `git` extension's `$gitExec` call pattern.
  Mountain spawns `git` as a child process and returns raw stdout. (See
  **implementation landing this session**.)
- **File watch** - `createFileSystemWatcher`. Today a `Stub`; next tier is
  Mountain `notify` crate which avoids Node's well-known `fs.watch`
  platform-quirk swamp.
- **Native dialogs / clipboard / openExternal** - Tauri already covers these. No
  Node alternative in an Electron-less build anyway.
- **Process spawn for debug adapters / task exec** - upcoming; Mountain
  `child_process` via `tokio::process`.

### Node-stock primary (Track A wins)

State-heavy or coordination-heavy APIs where stock VS Code already handles
nuance (revision history, undo merge, decoration overlay, language feature
merge, cancellation token propagation) we'd have to re-implement. Lifting the
stock file unchanged is cheaper than maintaining an original Rust backend:

- **Command registry** - `extHostCommands.ts` already does arg validation,
  contributed-command routing, cancellation. Sky calls the real
  `ICommandService`; Cocoon mirrors through stock.
- **Language features** - `extHostLanguageFeatures.ts` manages provider
  registries, merges results from multiple providers, caches. Rust rewrite would
  be months; the gRPC path just proxies which is cheap.
- **Editor / document / selection** - `extHostDocuments.ts`,
  `extHostTextEditor.ts` - source-of-truth for dirty state, encoding, EOL,
  versions. Must live in the extension host where edits originate.
- **Configuration** - `extHostConfiguration.ts` with scope resolution, override
  patterns, deprecation chains. Reuse stock.
- **Messages / dialogs / quick-input** - `extHostMessageService.ts`,
  `extHostQuickOpen.ts`. The UI is Sky's, but the request/response serialisation
  is stock.
- **Progress** - `extHostProgress.ts` with cancellation, chained progress
  reporters. Stock.
- **Secrets / storage / memento** - `extHostSecrets.ts`, `extHostStorage.ts`
    - state shapes are VS Code-specific; stock lift.
- **Authentication** - complex session lifecycle, provider precedence. Stock.
- **Debug** / **Tasks** - protocol-heavy (DAP, task schema). Stock core +
  Mountain-owned process spawn for the transport.
- **Webviews** - `extHostWebview.ts` plus iframe-in-workbench UI. Stock
  end-to-end; Sky hosts the iframe.
- **Notebooks** - large surface, tightly coupled to workbench layout manager.
  Stock.
- **Tree views** - `extHostTreeViews.ts` handles visibility, selection, reveal,
  description updates. Stock + Sky render.

### Hybrid (per-operation split)

- **SCM** - `extHostSCM.ts` stock for provider registration and resource-state
  updates, but `git.createSourceControl` needs a round trip to the workbench's
  `ISCMService` (Sky direct) for the viewlet to render; the git extension's
  `$gitExec` stays Mountain-native.
- **Terminal shell integration** - shell events via extHost, PTY via Mountain.
- **FileSystemProvider** - if an extension registers one, Cocoon forwards reads
  via gRPC to Mountain for disk ops; the provider interface itself lives in
  stock.
- **Status bar** - stock `extHostStatusBar.ts` manages entry lifecycle; Sky's
  native `IStatusbarService` renders via `__CEL_SERVICES__.Statusbar` (just
  landed).

---

## 3. Track-A bring-up plan (full Stock-Node compat)

To get a stock extHost\*.ts file running unchanged inside Cocoon, the following
glue must exist (most already does):

1. **`ExtHostContext` / `MainContext` RPC channels** - bidirectional JSON-RPC
   between Cocoon and Sky. Today Cocoon↔Mountain is gRPC (`Vine.proto`),
   Sky↔Mountain is Tauri IPC. A third lane - **Cocoon↔Sky direct** - would let
   stock `extHost*.ts` talk to `mainThread*.ts` without Mountain as a middle
   hop. Candidates:
    - **Mountain as relay** (works today): Cocoon emits gRPC notification →
      Mountain re-emits as `sky://` Tauri event → Sky's mainThread shim
      receives. Extra hop, but no new transport. Good for low-rate
      registrations; skip for hot paths.
    - **SharedWorker message port** (future): Sky creates a MessageChannel,
      handshake via Mountain, then Cocoon↔Sky talk directly over the port.
      Requires Tauri's worker support to allow SharedWorker in WKWebView, which
      today is blocked by CSP; tracked as a deferred item.
2. **`RPCProtocol` instance in Cocoon** - stock `extHost.api.impl.ts` calls
   `rpc.getProxy(MainContext.MainThreadX)` to get a proxy. Cocoon needs to
   supply a `RPCProtocol` that routes proxy method calls down the Cocoon↔Sky
   lane. Bespoke `MountainClientService.ts` in Cocoon is the current stand-in;
   lifting stock `rpcProtocol.ts` from
   `src/vs/workbench/services/extensions/common/` is the next step.
3. **Service identifier registration** - stock `MainContext` / `ExtHostContext`
   registries (`src/vs/workbench/api/common/extHost.protocol.ts`) define one
   proxy identifier per mainThread and extHost class. Cocoon can `import` this
   file verbatim once RPCProtocol is in place.
4. **`IExtHostRpcService`** - the DI token stock `extHost*.ts` asks for.
   Cocoon's mini-DI already exists (`Services/Handler/*Service.ts`) - add an
   `extHostRpcService` binding that returns our RPCProtocol.
5. **mainThread\*.ts loading in Sky** - Sky already ships the
   `vs/workbench/api/browser/mainThreadX.ts` bundle. What's missing is the
   _instantiation_ at workbench startup; stock VS Code's `ExtensionService`
   calls `createExtensionHostManager` which registers every mainThread. Sky
   needs to kick off that registration against Cocoon as the extension host.

Roadmap (concrete, in dependency order):

1. Lift `rpcProtocol.ts` into Cocoon → export from
   `Cocoon/Source/Services/Handler/VscodeAPI/StockLift.ts`.
2. Lift `extHost.protocol.ts` unchanged; expose `ExtHostContext` and
   `MainContext` as importable constants.
3. Add Cocoon↔Sky Mountain-relay lane: pair of gRPC notifications
   `cocoonToSky(payload)` + `skyToCocoon(payload)` that Mountain just forwards.
   Both sides marshal the stock `MessageType` enum.
4. Instantiate stock mainThread classes in Sky on `cel:workbench-ready`.
5. Start with low-risk namespaces: `mainThreadCommands.ts` first (command
   registry is the simplest), then `mainThreadStatusBar.ts`, then
   `mainThreadMessageService.ts`. Sky renders via the native workbench services
   as before.
6. Once the relay + stock-mainThread loop is green for commands, migrate the
   remaining namespaces namespace-by-namespace. Each migration is a net removal
   of Cocoon's bespoke `<Namespace>.ts` shim in favour of
   `import { ExtHostX } from '@codeeditorland/output/vs/workbench/api/common/extHostX.js'`.

## 4. Track-B bring-up plan (Mountain-native acceleration)

For each domain where Rust is the preferred primary, the pattern is:

1. Add the gRPC method to `Mountain/Proto/Vine.proto` (the Vine submodule).
2. Implement the Rust handler under
   `Mountain/Source/IPC/WindServiceHandlers/<Domain>/<Method>.rs` - one file per
   method (per PascalCase naming convention).
3. In Cocoon's `<Namespace>Route.ts`, add a `Layer<N>` tier that picks Mountain
   for that operation.
4. In Cocoon's `<Namespace>.ts` shim, call
   `MountainClient.sendRequest(method, args)` behind the tier guard.
5. Update `Architecture-Tiers.md` manifest at build time so the `dual-track`
   dev-log tag reports which ops moved to Mountain.

Priority list (ranked by expected impact):

1. **File watcher** (`notify` crate) - today `FileWatcher=Stub`, so every
   extension that relies on watch events to rebuild / reload / re-analyze
   silently waits forever. Highest user-visible gap among the stubs.
2. **Debug adapter spawn** - Mountain spawns the adapter child process over DAP;
   Cocoon proxies DAP messages. Unblocks every debug extension.
3. **Task execution** - Mountain spawns the shell command, streams stdout/stderr
   through the terminal panel, tracks exit code.
4. **Git subprocess** - **landing this session**. Every `$gitExec` round-trip
   currently fails because `localGit` channel is routed (`git:*` prefix) but no
   handlers exist. Fix below.
5. **Ripgrep-backed text search** - swap `globset` walk for `ripgrep` crate's
   `grep_searcher`. 10-30× speed-up on large repos.

## 5. Verification

After each namespace migrates:

- `LAND_DEV_LOG=dual-track` line confirms the route decision per op.
- PostHog `land:dual-track:{shim,stock,mountain}` marks record traffic by tier.
- Integration test: launch with `LAND_DEV_LOG=short,provider-register`, exercise
  the feature from the UI, grep for `Activation failed` (must be 0) and
  `$<method> (no handler)` (must be 0).

## 6. Gap register (highest-priority next items)

- 🔴 `vscode.debug.*` end-to-end (startDebugging, sessions, breakpoints) -
  blocks every language debugger.
- 🔴 `vscode.tasks.executeTask` - blocks Jake / Gulp / Grunt / npm task
  providers (the repeated `findGruntCommand` unhandled rejections in the log are
  downstream of this).
- 🔴 `vscode.window.createWebviewPanel` - blocks GitLens graph panel, Copilot
  chat, markdown-preview internals.
- 🟡 `vscode.scm` viewlet route into `ISCMService` - extensions register but UI
  stays empty (prior Investigation step 4 deferred).
- 🟡 Tree-view renderer wiring (F1.1) - 53 views registered, renderer does not
  display them.
- 🟡 `localGit` channel - **fix landing this session**.
